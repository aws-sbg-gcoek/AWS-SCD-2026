import 'dotenv/config';
import crypto from 'node:crypto';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import Razorpay from 'razorpay';
import { z } from 'zod';
import { config } from './config.js';
import { migrateAndSeed, pool, withTransaction } from './db.js';
import {
  attachRazorpayOrder,
  BookingConflictError,
  completeCapturedPayment,
  completeCapturedPaymentInTransaction,
  createPendingBooking,
  expirePendingBookings,
  failOrderCreation,
  getPublicBooking,
  verifyBookingAccess,
} from './bookingService.js';
import { verifyCheckoutSignature, verifyWebhookSignature } from './security.js';
import { startEmailWorker } from './emailWorker.js';

const app = express();
const razorpay = new Razorpay({ key_id: config.RAZORPAY_KEY_ID, key_secret: config.RAZORPAY_KEY_SECRET });

app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // No Origin is common for server-to-server webhook delivery and command-line health checks.
    if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by this API.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Idempotency-Key', 'X-Booking-Access'],
  maxAge: 600,
}));
app.use((req, res, next) => {
  res.setHeader('X-Request-Id', crypto.randomUUID());
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 180, standardHeaders: true, legacyHeaders: false });
const checkoutLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 12, standardHeaders: true, legacyHeaders: false });
const verifyLimiter = rateLimit({ windowMs: 5 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const webhookLimiter = rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false });

const uuidSchema = z.string().uuid();
const orderInputSchema = z.object({
  ticketType: z.enum(['early_bird', 'regular']),
  quantity: z.number().int().min(1).max(5),
  attendee: z.object({
    name: z.string().trim().min(2).max(100).transform((value) => value.replace(/[<>]/g, '')),
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, 'Use a valid phone number with country code if needed.'),
  }).strict(),
}).strict();
const verifyInputSchema = z.object({
  bookingId: z.string().uuid(),
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]+$/).max(100),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]+$/).max(100),
  razorpay_signature: z.string().regex(/^[0-9a-f]{64}$/i),
}).strict();

// Razorpay must receive the exact raw body for webhook HMAC validation. Register this before express.json().
app.post('/api/webhooks/razorpay', webhookLimiter, express.raw({ type: 'application/json', limit: '1mb' }), async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ error: 'Expected a raw JSON webhook body.' });
    const signature = req.get('x-razorpay-signature') ?? '';
    if (!verifyWebhookSignature(req.body, signature)) return res.status(400).json({ error: 'Invalid webhook signature.' });

    let payload: {
      event?: string;
      payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string; status?: string; error_description?: string } } };
    };
    try {
      payload = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Invalid JSON webhook payload.' });
    }
    if (!payload || typeof payload.event !== 'string') return res.status(400).json({ error: 'Webhook event is missing.' });

    const payment = payload.payload?.payment?.entity;
    const providerEventId = req.get('x-razorpay-event-id');
    const eventKey = providerEventId && providerEventId.length <= 250
      ? providerEventId
      : crypto.createHash('sha256').update(`${payload.event}:`).update(req.body).digest('hex');

    const result = await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO webhook_events (event_key, event_type, razorpay_payment_id)
         VALUES ($1, $2, $3) ON CONFLICT (event_key) DO NOTHING RETURNING event_key`,
        [eventKey, payload.event, payment?.id ?? null],
      );
      if (inserted.rowCount === 0) return { duplicate: true, status: 'duplicate' as const };

      if (payload.event === 'payment.captured') {
        if (!payment?.id || !payment.order_id || typeof payment.amount !== 'number' || !Number.isInteger(payment.amount) || !payment.currency || payment.status !== 'captured') {
          throw new Error('payment.captured webhook is missing required fields.');
        }
        const outcome = await completeCapturedPaymentInTransaction(client, {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
        }, false);
        if (outcome.status === 'unknown_order') {
          // Roll back the event record so Razorpay's retry can be processed after the booking write is visible.
          throw new Error('Captured payment references an unknown booking order; retry webhook delivery.');
        }
        return { duplicate: false, status: outcome.status };
      }

      if (payload.event === 'payment.failed' && payment?.order_id) {
        await client.query(
          `UPDATE bookings SET last_payment_error = $2, updated_at = NOW()
           WHERE razorpay_order_id = $1 AND status = 'pending'`,
          [payment.order_id, (payment.error_description ?? 'Payment attempt failed').slice(0, 160)],
        );
      }
      return { duplicate: false, status: 'received' as const };
    });

    if (result.status === 'refund_required' || result.status === 'payment_mismatch') {
      console.error('Captured payment requires organizer reconciliation/refund review:', { event: payload.event, status: result.status });
    }
    return res.status(200).json({ received: true, ...result });
  } catch (error) {
    return next(error);
  }
});

app.use(express.json({ limit: '32kb', strict: true }));
app.use('/api', apiLimiter);

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/tickets', async (_req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT code, label, price_paise, starts_at, ends_at, enabled, capacity,
              sold_count, reserved_count
       FROM ticket_types ORDER BY price_paise ASC`,
    );
    const now = Date.now();
    const tickets = result.rows.map((row) => {
      const remaining = Math.max(0, Number(row.capacity) - Number(row.sold_count) - Number(row.reserved_count));
      const startsAt = row.starts_at ? new Date(row.starts_at as string) : null;
      const endsAt = row.ends_at ? new Date(row.ends_at as string) : null;
      let availabilityReason: 'disabled' | 'not_started' | 'sales_closed' | 'capacity_not_configured' | 'sold_out' | 'available';
      if (!Boolean(row.enabled)) availabilityReason = 'disabled';
      else if (startsAt && startsAt.getTime() > now) availabilityReason = 'not_started';
      else if (endsAt && endsAt.getTime() <= now) availabilityReason = 'sales_closed';
      else if (Number(row.capacity) <= 0) availabilityReason = 'capacity_not_configured';
      else if (remaining <= 0) availabilityReason = 'sold_out';
      else availabilityReason = 'available';
      return {
        code: row.code as string,
        label: row.label as string,
        pricePaise: Number(row.price_paise),
        currency: 'INR',
        available: availabilityReason === 'available',
        availabilityReason,
        remaining,
        startsAt: startsAt?.toISOString() ?? null,
        endsAt: endsAt?.toISOString() ?? null,
      };
    });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

app.post('/api/checkout/orders', checkoutLimiter, async (req, res, next) => {
  try {
    const idempotencyKey = req.get('Idempotency-Key') ?? '';
    if (!/^[0-9a-f]{64}$/i.test(idempotencyKey)) {
      return res.status(400).json({ error: 'A 64-character secure checkout token is required in the Idempotency-Key header.' });
    }
    const validation = orderInputSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid checkout details.', details: validation.error.flatten() });

    await expirePendingBookings();
    const input = validation.data;
    const booking = await createPendingBooking({
      idempotencyKey,
      attendeeName: input.attendee.name,
      attendeeEmail: input.attendee.email,
      attendeePhone: input.attendee.phone,
      ticketType: input.ticketType,
      quantity: input.quantity,
    });

    let orderId = 'orderId' in booking ? booking.orderId : undefined;
    if (!orderId) {
      try {
        const order = await razorpay.orders.create({
          amount: booking.amountPaise,
          currency: booking.currency,
          receipt: `scd-${booking.id.replaceAll('-', '').slice(0, 24)}`,
          notes: {
            booking_id: booking.id,
            ticket_type: booking.ticketType,
            quantity: String(booking.quantity),
          },
        });
        orderId = order.id;
        await attachRazorpayOrder(booking.id, orderId);
      } catch (error) {
        await failOrderCreation(booking.id, 'Razorpay order creation failed');
        console.error('Razorpay order creation failed:', error instanceof Error ? error.message : 'Unknown gateway error');
        return res.status(502).json({ error: 'Could not start checkout. Please try again with a new checkout attempt.' });
      }
    }

    return res.status(201).json({
      bookingId: booking.id,
      orderId,
      keyId: config.RAZORPAY_KEY_ID,
      amountPaise: booking.amountPaise,
      currency: booking.currency,
      ticketType: booking.ticketType,
      quantity: booking.quantity,
      expiresAt: booking.expiresAt,
    });
  } catch (error) {
    if (error instanceof BookingConflictError) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
});

app.post('/api/checkout/verify', verifyLimiter, async (req, res, next) => {
  try {
    const validation = verifyInputSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: 'Invalid payment verification details.' });
    const input = validation.data;

    const bookingResult = await pool.query(
      `SELECT id, razorpay_order_id, status FROM bookings WHERE id = $1`,
      [input.bookingId],
    );
    const booking = bookingResult.rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    const accessToken = req.get('X-Booking-Access') ?? '';
    if (!(await verifyBookingAccess(input.bookingId, accessToken))) return res.status(403).json({ error: 'Booking access token is invalid.' });
    if (booking.razorpay_order_id !== input.razorpay_order_id) return res.status(400).json({ error: 'Payment order does not match this booking.' });
    if (booking.status === 'paid') return res.json(await getPublicBooking(input.bookingId));
    if (!verifyCheckoutSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }

    const payment = await razorpay.payments.fetch(input.razorpay_payment_id) as unknown as {
      id: string; order_id: string; amount: number; currency: string; status: string;
    };
    if (payment.order_id !== input.razorpay_order_id) return res.status(400).json({ error: 'Payment is not associated with this order.' });
    if (payment.status === 'failed') return res.status(402).json({ error: 'Payment failed. You can try again before the reservation expires.' });
    if (payment.status !== 'captured') {
      return res.status(202).json({ status: 'pending', bookingId: input.bookingId, message: 'Payment is awaiting capture confirmation.' });
    }

    const outcome = await completeCapturedPayment(payment, true);
    if (outcome.status === 'payment_mismatch') return res.status(400).json({ error: 'Captured payment amount or currency does not match the booking.' });
    if (outcome.status === 'unknown_order') return res.status(404).json({ error: 'Booking order not found.' });
    const bookingStatus = await getPublicBooking(input.bookingId);
    return res.json(bookingStatus);
  } catch (error) {
    return next(error);
  }
});

app.get('/api/checkout/bookings/:bookingId', verifyLimiter, async (req, res, next) => {
  try {
    const parsedId = uuidSchema.safeParse(req.params.bookingId);
    if (!parsedId.success) return res.status(400).json({ error: 'Invalid booking reference.' });
    const accessToken = req.get('X-Booking-Access') ?? '';
    if (!(await verifyBookingAccess(parsedId.data, accessToken))) return res.status(403).json({ error: 'Booking access token is invalid.' });
    const booking = await getPublicBooking(parsedId.data);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message.startsWith('Origin is not allowed')) return res.status(403).json({ error: 'Origin is not allowed.' });
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON request body.' });
  console.error('API request failed:', { method: req.method, path: req.path, error: message });
  return res.status(500).json({ error: 'An unexpected server error occurred. Please retry or contact the event team.' });
};
app.use(errorHandler);

async function start() {
  await migrateAndSeed();
  await expirePendingBookings();
  const expiryTimer = setInterval(() => {
    void expirePendingBookings().catch((error) => console.error('Booking expiry sweep failed:', error instanceof Error ? error.message : 'Unknown error'));
  }, 60_000);
  expiryTimer.unref();
  const emailTimer = startEmailWorker();
  const server = app.listen(config.PORT, () => {
    console.log(`AWS SCD payment API listening on port ${config.PORT}`);
    console.log('Set real ticket capacities and verify ticket prices/dates before enabling live payments.');
  });

  const shutdown = (signal: string) => {
    console.log(`Received ${signal}; closing server gracefully.`);
    clearInterval(expiryTimer);
    if (emailTimer) clearInterval(emailTimer);
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

start().catch(async (error) => {
  console.error('Payment API failed to start:', error instanceof Error ? error.message : 'Unknown startup error');
  await pool.end().catch(() => undefined);
  process.exit(1);
});
