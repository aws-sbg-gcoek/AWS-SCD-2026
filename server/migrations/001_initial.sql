CREATE TABLE IF NOT EXISTS ticket_types (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 100),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  sold_count INTEGER NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sold_count + reserved_count <= capacity)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key_hash CHAR(64) NOT NULL UNIQUE,
  access_token_hash CHAR(64) NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT NOT NULL,
  ticket_type TEXT NOT NULL REFERENCES ticket_types(code),
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 5),
  unit_amount_paise INTEGER NOT NULL CHECK (unit_amount_paise >= 100),
  amount_paise INTEGER NOT NULL CHECK (amount_paise >= 100),
  currency CHAR(3) NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  status TEXT NOT NULL DEFAULT 'creating'
    CHECK (status IN ('creating', 'pending', 'paid', 'failed', 'expired', 'refund_required')),
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  payment_signature_verified BOOLEAN NOT NULL DEFAULT FALSE,
  payment_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  last_payment_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_expiration_idx ON bookings(status, expires_at);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings(attendee_email, created_at DESC);

CREATE TABLE IF NOT EXISTS issued_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  ticket_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'checked_in', 'cancelled')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS issued_tickets_booking_idx ON issued_tickets(booking_id);

CREATE TABLE IF NOT EXISTS webhook_events (
  event_key TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  razorpay_payment_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS email_outbox (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE RESTRICT,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS email_outbox_delivery_idx
  ON email_outbox(status, next_attempt_at, updated_at);
