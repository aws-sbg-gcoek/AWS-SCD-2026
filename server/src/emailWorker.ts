import { pool, withTransaction } from './db.js';

let busy = false;

function htmlEscape(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

async function deliverOneEmail(): Promise<boolean> {
  const job = await withTransaction(async (client) => {
    const result = await client.query(
      `SELECT booking_id, recipient_email, attempts FROM email_outbox
       WHERE (status = 'pending' AND next_attempt_at <= NOW())
          OR (status = 'sending' AND updated_at < NOW() - INTERVAL '5 minutes')
       ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`,
    );
    const row = result.rows[0];
    if (!row) return null;
    await client.query(
      `UPDATE email_outbox SET status = 'sending', attempts = attempts + 1, updated_at = NOW()
       WHERE booking_id = $1`,
      [row.booking_id],
    );
    return {
      bookingId: row.booking_id as string,
      recipient: row.recipient_email as string,
      attempts: Number(row.attempts) + 1,
    };
  });
  if (!job) return false;

  try {
    const bookingResult = await pool.query(
      `SELECT attendee_name, ticket_type, quantity, amount_paise, currency, paid_at
       FROM bookings WHERE id = $1 AND status = 'paid'`,
      [job.bookingId],
    );
    const booking = bookingResult.rows[0];
    if (!booking) throw new Error('Paid booking record unavailable for ticket email.');
    const ticketsResult = await pool.query(
      'SELECT ticket_code FROM issued_tickets WHERE booking_id = $1 ORDER BY issued_at',
      [job.bookingId],
    );
    if (ticketsResult.rows.length !== Number(booking.quantity)) {
      throw new Error('Ticket count does not match the paid booking.');
    }

    const ticketRows = ticketsResult.rows.map((ticket) => `<li style="margin:8px 0;font-family:monospace">${htmlEscape(ticket.ticket_code as string)}</li>`).join('');
    const total = (Number(booking.amount_paise) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    const attendee = htmlEscape(booking.attendee_name as string);
    const ticketLabel = htmlEscape(booking.ticket_type === 'early_bird' ? 'Early Bird Ticket' : 'Regular Ticket');
    const eventName = 'AWS Student Community Day Kolhapur 2026';
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#23303e;line-height:1.55"><h1 style="color:#087f78">Your ticket is confirmed</h1><p>Hi ${attendee},</p><p>Your payment for <strong>${htmlEscape(eventName)}</strong> has been confirmed.</p><p><strong>Ticket:</strong> ${ticketLabel}<br><strong>Quantity:</strong> ${Number(booking.quantity)}<br><strong>Total paid:</strong> ${htmlEscape(total)}<br><strong>Booking reference:</strong> ${htmlEscape(job.bookingId)}</p><h2>Your ticket codes</h2><ul>${ticketRows}</ul><p>Keep these codes safe and present them at event check-in. Each code is for one ticket.</p><p>— ${htmlEscape(eventName)} Organizing Team</p></body></html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.TICKET_FROM_EMAIL,
        to: [job.recipient],
        subject: `Ticket confirmation — ${eventName}`,
        html,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}.`);

    await pool.query(
      `UPDATE email_outbox SET status = 'sent', sent_at = NOW(), updated_at = NOW(), last_error = NULL
       WHERE booking_id = $1`,
      [job.bookingId],
    );
    return true;
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 160) : 'Unknown email delivery error';
    const finalFailure = job.attempts >= 8;
    const retryMinutes = Math.min(60, 2 ** Math.min(job.attempts, 6));
    await pool.query(
      `UPDATE email_outbox SET status = $2,
         next_attempt_at = NOW() + ($3 * INTERVAL '1 minute'),
         updated_at = NOW(), last_error = $4
       WHERE booking_id = $1`,
      [job.bookingId, finalFailure ? 'failed' : 'pending', retryMinutes, safeError],
    );
    console.error('Ticket email delivery failed:', { bookingId: job.bookingId, attempt: job.attempts, error: safeError });
    return true;
  }
}

export function startEmailWorker(): NodeJS.Timeout | null {
  if (!process.env.RESEND_API_KEY || !process.env.TICKET_FROM_EMAIL) {
    console.warn('Ticket email delivery is disabled. Set RESEND_API_KEY and TICKET_FROM_EMAIL to email ticket codes.');
    return null;
  }
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      // Drain a small batch per poll to avoid a burst of requests to the email provider.
      for (let count = 0; count < 5; count += 1) {
        const deliveredOrAttempted = await deliverOneEmail();
        if (!deliveredOrAttempted) break;
      }
    } catch (error) {
      console.error('Email worker error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      busy = false;
    }
  }, 5_000);
  timer.unref();
  return timer;
}
