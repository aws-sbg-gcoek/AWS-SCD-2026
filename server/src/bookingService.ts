import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { PoolClient } from 'pg';
import { config } from './config.js';
import { pool, withTransaction } from './db.js';

export type CapturedPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
};

export class BookingConflictError extends Error {
  constructor(message: string, public readonly statusCode = 409) {
    super(message);
    this.name = 'BookingConflictError';
  }
}

export async function createPendingBooking(input: {
  idempotencyKey: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketType: 'early_bird' | 'regular';
  quantity: number;
}) {
  return withTransaction(async (client) => {
    // Keep the capability token out of the database in plaintext; one-way hash is used for both idempotency and access verification.
    const idempotencyHash = createHash('sha256').update(input.idempotencyKey).digest('hex');
    // Serialize requests sharing the same hash before touching inventory.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [idempotencyHash]);
    const existingResult = await client.query(
      `SELECT id, attendee_name, ticket_type, quantity, attendee_email, attendee_phone, status,
              razorpay_order_id, amount_paise, currency, expires_at
       FROM bookings WHERE idempotency_key_hash = $1 FOR UPDATE`,
      [idempotencyHash],
    );
    const existing = existingResult.rows[0];
    if (existing) {
      const sameIntent = existing.ticket_type === input.ticketType
        && Number(existing.quantity) === input.quantity
        && existing.attendee_name === input.attendeeName
        && existing.attendee_email === input.attendeeEmail
        && existing.attendee_phone === input.attendeePhone;
      if (!sameIntent) throw new BookingConflictError('This idempotency key was already used for a different checkout. Start a new checkout.');
      if (existing.status === 'pending' && existing.razorpay_order_id) {
        return {
          id: existing.id as string,
          ticketType: existing.ticket_type as string,
          quantity: Number(existing.quantity),
          amountPaise: Number(existing.amount_paise),
          currency: existing.currency as string,
          orderId: existing.razorpay_order_id as string,
          expiresAt: new Date(existing.expires_at as string),
          reused: true,
        };
      }
      throw new BookingConflictError(`This checkout is already ${existing.status}. Start a new checkout.`);
    }

    const inventoryResult = await client.query(
      `UPDATE ticket_types
       SET reserved_count = reserved_count + $2, updated_at = NOW()
       WHERE code = $1
         AND enabled = TRUE
         AND starts_at <= NOW()
         AND (ends_at IS NULL OR ends_at > NOW())
         AND capacity > 0
         AND sold_count + reserved_count + $2 <= capacity
       RETURNING label, price_paise, capacity, sold_count, reserved_count`,
      [input.ticketType, input.quantity],
    );
    const inventory = inventoryResult.rows[0];
    if (!inventory) {
      throw new BookingConflictError('This ticket is not currently available or there are not enough seats remaining.', 409);
    }

    const amountPaise = Number(inventory.price_paise) * input.quantity;
    const expiresAt = new Date(Date.now() + config.BOOKING_HOLD_MINUTES * 60_000);
    const bookingResult = await client.query(
      `INSERT INTO bookings
        (idempotency_key_hash, access_token_hash, attendee_name, attendee_email, attendee_phone, ticket_type,
         quantity, unit_amount_paise, amount_paise, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'creating', $10)
       RETURNING id, currency, expires_at`,
      [idempotencyHash, idempotencyHash, input.attendeeName, input.attendeeEmail, input.attendeePhone,
       input.ticketType, input.quantity, Number(inventory.price_paise), amountPaise, expiresAt],
    );
    const booking = bookingResult.rows[0];
    return {
      id: booking.id as string,
      ticketType: input.ticketType,
      ticketLabel: inventory.label as string,
      quantity: input.quantity,
      amountPaise,
      currency: booking.currency as string,
      expiresAt: new Date(booking.expires_at as string),
      reused: false,
    };
  });
}

export async function attachRazorpayOrder(bookingId: string, razorpayOrderId: string): Promise<void> {
  const result = await pool.query(
    `UPDATE bookings SET razorpay_order_id = $2, status = 'pending', updated_at = NOW()
     WHERE id = $1 AND status = 'creating'`,
    [bookingId, razorpayOrderId],
  );
  if (result.rowCount !== 1) throw new Error('Could not persist the Razorpay order against its booking.');
}

export async function failOrderCreation(bookingId: string, safeReason: string): Promise<void> {
  await withTransaction(async (client) => {
    const bookingResult = await client.query('SELECT status, ticket_type, quantity FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
    const booking = bookingResult.rows[0];
    if (!booking || booking.status !== 'creating') return;
    await client.query(
      `UPDATE ticket_types SET reserved_count = GREATEST(reserved_count - $2, 0), updated_at = NOW() WHERE code = $1`,
      [booking.ticket_type, Number(booking.quantity)],
    );
    await client.query(
      `UPDATE bookings SET status = 'failed', last_payment_error = $2, updated_at = NOW() WHERE id = $1`,
      [bookingId, safeReason.slice(0, 160)],
    );
  });
}

export async function completeCapturedPayment(payment: CapturedPayment, checkoutSignatureVerified: boolean) {
  return withTransaction((client) => completeCapturedPaymentInTransaction(client, payment, checkoutSignatureVerified));
}

export async function completeCapturedPaymentInTransaction(
  client: PoolClient,
  payment: CapturedPayment,
  checkoutSignatureVerified: boolean,
) {
  const bookingResult = await client.query(
    `SELECT id, ticket_type, quantity, amount_paise, currency, status, expires_at,
            attendee_email, razorpay_payment_id
     FROM bookings WHERE razorpay_order_id = $1 FOR UPDATE`,
    [payment.order_id],
  );
  const booking = bookingResult.rows[0];
  if (!booking) return { status: 'unknown_order' as const, bookingId: null, ticketCodes: [] as string[] };

  if (booking.status === 'paid') {
    const tickets = await client.query('SELECT ticket_code FROM issued_tickets WHERE booking_id = $1 ORDER BY issued_at', [booking.id]);
    return { status: 'paid' as const, bookingId: booking.id as string, ticketCodes: tickets.rows.map((row) => row.ticket_code as string) };
  }
  if (booking.status === 'refund_required') {
    return { status: 'refund_required' as const, bookingId: booking.id as string, ticketCodes: [] as string[] };
  }
  if (payment.status !== 'captured') {
    return { status: 'payment_mismatch' as const, bookingId: booking.id as string, ticketCodes: [] as string[] };
  }
  if (Number(booking.amount_paise) !== Number(payment.amount) || booking.currency !== payment.currency) {
    // The signed webhook confirms money was captured, but it does not match this order's expected total.
    // Release a still-live hold and keep an explicit reconciliation/refund state; never issue a ticket.
    if (booking.status === 'pending') {
      await client.query(
        `UPDATE ticket_types SET reserved_count = GREATEST(reserved_count - $2, 0), updated_at = NOW() WHERE code = $1`,
        [booking.ticket_type, Number(booking.quantity)],
      );
    }
    await client.query(
      `UPDATE bookings SET status = 'refund_required', razorpay_payment_id = $2,
        payment_confirmed = TRUE, last_payment_error = 'Captured payment amount or currency mismatch; organizer reconciliation/refund required', updated_at = NOW()
       WHERE id = $1`,
      [booking.id, payment.id],
    );
    return { status: 'refund_required' as const, bookingId: booking.id as string, ticketCodes: [] as string[] };
  }

  const expiresAt = new Date(booking.expires_at as string);
  if (booking.status !== 'pending' || expiresAt.getTime() <= Date.now()) {
    // Payment captured after the inventory hold ended: record it, but never issue a potentially oversold ticket.
    if (booking.status === 'pending') {
      await client.query(
        `UPDATE ticket_types SET reserved_count = GREATEST(reserved_count - $2, 0), updated_at = NOW() WHERE code = $1`,
        [booking.ticket_type, Number(booking.quantity)],
      );
    }
    await client.query(
      `UPDATE bookings SET status = 'refund_required', razorpay_payment_id = $2,
        payment_confirmed = TRUE, last_payment_error = 'Captured after reservation expiry; organizer refund review required', updated_at = NOW()
       WHERE id = $1`,
      [booking.id, payment.id],
    );
    return { status: 'refund_required' as const, bookingId: booking.id as string, ticketCodes: [] as string[] };
  }

  const inventoryUpdate = await client.query(
    `UPDATE ticket_types
     SET reserved_count = reserved_count - $2, sold_count = sold_count + $2, updated_at = NOW()
     WHERE code = $1 AND reserved_count >= $2
     RETURNING code`,
    [booking.ticket_type, Number(booking.quantity)],
  );
  if (inventoryUpdate.rowCount !== 1) {
    throw new Error('Inventory reservation invariant failed while confirming a captured payment.');
  }

  await client.query(
    `UPDATE bookings SET status = 'paid', razorpay_payment_id = $2,
       payment_confirmed = TRUE, payment_signature_verified = $3,
       paid_at = NOW(), updated_at = NOW(), last_payment_error = NULL
     WHERE id = $1`,
    [booking.id, payment.id, checkoutSignatureVerified],
  );

  const ticketCodes: string[] = [];
  for (let index = 0; index < Number(booking.quantity); index += 1) {
    const code = `SCD26-${randomBytes(10).toString('hex').toUpperCase()}`;
    await client.query('INSERT INTO issued_tickets (booking_id, ticket_code) VALUES ($1, $2)', [booking.id, code]);
    ticketCodes.push(code);
  }
  await client.query(
    `INSERT INTO email_outbox (booking_id, recipient_email, status)
     VALUES ($1, $2, 'pending') ON CONFLICT (booking_id) DO NOTHING`,
    [booking.id, booking.attendee_email],
  );
  return { status: 'paid' as const, bookingId: booking.id as string, ticketCodes };
}

export async function expirePendingBookings(): Promise<number> {
  return withTransaction(async (client) => {
    const expiredResult = await client.query(
      `SELECT id, ticket_type, quantity FROM bookings
       WHERE status IN ('creating', 'pending') AND expires_at <= NOW()
       ORDER BY expires_at ASC LIMIT 100 FOR UPDATE SKIP LOCKED`,
    );
    for (const booking of expiredResult.rows) {
      await client.query(
        `UPDATE ticket_types SET reserved_count = GREATEST(reserved_count - $2, 0), updated_at = NOW() WHERE code = $1`,
        [booking.ticket_type, Number(booking.quantity)],
      );
      await client.query(`UPDATE bookings SET status = 'expired', updated_at = NOW() WHERE id = $1`, [booking.id]);
    }
    return expiredResult.rowCount ?? 0;
  });
}

export async function verifyBookingAccess(bookingId: string, accessToken: string): Promise<boolean> {
  if (!/^[0-9a-f]{64}$/i.test(accessToken)) return false;
  const result = await pool.query('SELECT access_token_hash FROM bookings WHERE id = $1', [bookingId]);
  const storedHash = result.rows[0]?.access_token_hash as string | undefined;
  if (!storedHash || !/^[0-9a-f]{64}$/i.test(storedHash)) return false;
  const suppliedHash = createHash('sha256').update(accessToken).digest();
  const expectedHash = Buffer.from(storedHash, 'hex');
  return suppliedHash.length === expectedHash.length && timingSafeEqual(suppliedHash, expectedHash);
}

export async function getPublicBooking(bookingId: string) {
  const bookingResult = await pool.query(
    `SELECT id, ticket_type, quantity, amount_paise, currency, status, created_at, paid_at,
            expires_at, last_payment_error
     FROM bookings WHERE id = $1`,
    [bookingId],
  );
  const booking = bookingResult.rows[0];
  if (!booking) return null;
  const tickets = booking.status === 'paid'
    ? await pool.query('SELECT ticket_code, status FROM issued_tickets WHERE booking_id = $1 ORDER BY issued_at', [bookingId])
    : { rows: [] as Array<{ ticket_code: string; status: string }> };
  return {
    bookingId: booking.id as string,
    ticketType: booking.ticket_type as string,
    quantity: Number(booking.quantity),
    amountPaise: Number(booking.amount_paise),
    currency: booking.currency as string,
    status: booking.status as string,
    createdAt: booking.created_at,
    paidAt: booking.paid_at,
    expiresAt: booking.expires_at,
    message: booking.status === 'refund_required'
      ? 'Payment was captured but could not be safely matched to the reservation. The organizer must review this payment and, if needed, arrange a refund.'
      : undefined,
    tickets: tickets.rows.map((ticket) => ({ code: ticket.ticket_code, status: ticket.status })),
  };
}
