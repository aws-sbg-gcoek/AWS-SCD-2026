import { FormEvent, useRef, useState } from 'react';
import { X } from 'lucide-react';

export type TicketType = 'early_bird' | 'regular';

export interface TicketAvailability {
  code: TicketType;
  label: string;
  pricePaise: number;
  currency: string;
  available: boolean;
  availabilityReason: string;
  remaining: number;
  startsAt: string | null;
  endsAt: string | null;
}

interface CheckoutOrder {
  bookingId: string;
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: string;
  ticketType: TicketType;
  quantity: number;
}

interface BookingStatus {
  bookingId: string;
  status: string;
  tickets: Array<{ code: string; status: string }>;
  message?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  notes: { booking_id: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface TicketCheckoutButtonProps {
  ticket: TicketAvailability | undefined;
  loading: boolean;
  onClick: () => void;
}

interface TicketCheckoutDialogProps {
  ticket: TicketAvailability;
  onClose: () => void;
}

let razorpaySdkPromise: Promise<void> | undefined;

function isTicketAvailability(value: unknown): value is TicketAvailability {
  if (typeof value !== 'object' || value === null) return false;
  const ticket = value as Record<string, unknown>;
  return (ticket.code === 'early_bird' || ticket.code === 'regular')
    && typeof ticket.label === 'string'
    && typeof ticket.pricePaise === 'number'
    && typeof ticket.currency === 'string'
    && typeof ticket.available === 'boolean'
    && typeof ticket.availabilityReason === 'string'
    && typeof ticket.remaining === 'number'
    && (typeof ticket.startsAt === 'string' || ticket.startsAt === null)
    && (typeof ticket.endsAt === 'string' || ticket.endsAt === null);
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) {
      throw new Error(`Ticket service is unavailable (HTTP ${response.status}). Make sure the payment API is running.`);
    }
    throw new Error('The ticket service returned an invalid response.');
  }
}

export async function fetchTicketAvailability(signal?: AbortSignal): Promise<TicketAvailability[]> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/tickets`, { signal });
  const body = await readResponseBody(response);
  if (!response.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : `The ticket service returned an error (${response.status}).`;
    throw new Error(error);
  }
  if (typeof body !== 'object' || body === null || !('tickets' in body) || !Array.isArray(body.tickets)
    || !body.tickets.every(isTicketAvailability)) {
    throw new Error('The ticket service returned an invalid ticket list.');
  }
  return body.tickets;
}

function loadRazorpaySdk(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (razorpaySdkPromise) return razorpaySdkPromise;

  razorpaySdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpaySdkPromise = undefined;
      reject(new Error('Could not load the Razorpay checkout. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });

  return razorpaySdkPromise;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await readResponseBody(response);
  if (!response.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
      ? body.error
      : `The ticket service returned an error (${response.status}).`;
    throw new Error(error);
  }
  return body as T;
}

function createCheckoutToken(): string {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function formatTicketPrice(ticket: TicketAvailability | undefined): string {
  if (!ticket) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: ticket.currency,
    maximumFractionDigits: 0,
  }).format(ticket.pricePaise / 100);
}

export function formatTicketDate(value: string | null): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(value));
}

export function TicketCheckoutButton({ ticket, loading, onClick }: TicketCheckoutButtonProps) {
  const enabled = !loading && Boolean(ticket?.available);
  const label = loading
    ? 'CHECKING AVAILABILITY'
    : ticket?.available
      ? 'GRAB YOUR TICKET'
      : ticket?.availabilityReason === 'sold_out'
        ? 'SOLD OUT'
        : ticket?.availabilityReason === 'not_started'
          ? 'NOT ON SALE'
          : ticket?.availabilityReason === 'sales_closed'
            ? 'SALES CLOSED'
            : ticket?.availabilityReason === 'capacity_not_configured'
              ? 'NOT CONFIGURED'
              : 'UNAVAILABLE';

  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={onClick}
      className={`w-full h-11 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors shadow-md ${
        enabled
          ? 'bg-[#CDE3CB] hover:bg-[#D1E5CD] text-[#22223B]'
          : 'bg-[#7B9285] text-[#22223B] cursor-not-allowed opacity-90'
      }`}
    >
      {label}
    </button>
  );
}

export function TicketCheckoutDialog({ ticket, onClose }: TicketCheckoutDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const checkoutToken = useRef<string | undefined>(undefined);

  async function completePayment(order: CheckoutOrder, response: RazorpayResponse, accessToken: string) {
    const verifyResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/checkout/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Booking-Access': accessToken,
      },
      body: JSON.stringify({ bookingId: order.bookingId, ...response }),
    });

    let status = await readApiResponse<BookingStatus>(verifyResponse);
    for (let attempt = 0; status.status === 'pending' && attempt < 15; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 2000));
      const statusResponse = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/checkout/bookings/${encodeURIComponent(order.bookingId)}`,
        { headers: { 'X-Booking-Access': accessToken } },
      );
      status = await readApiResponse<BookingStatus>(statusResponse);
    }

    if (status.status !== 'paid') {
      throw new Error(status.message || `Payment status is ${status.status}. Save booking reference ${order.bookingId} and contact the event team.`);
    }
    setBooking(status);
    checkoutToken.current = undefined;
    setSubmitting(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await loadRazorpaySdk();
      const accessToken = checkoutToken.current ?? createCheckoutToken();
      checkoutToken.current = accessToken;
      const orderResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': accessToken,
        },
        body: JSON.stringify({
          ticketType: ticket.code,
          quantity,
          attendee: { name, email, phone },
        }),
      });
      const order = await readApiResponse<CheckoutOrder>(orderResponse);

      if (!window.Razorpay) {
        throw new Error('Razorpay checkout did not initialize. Please try again.');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: 'AWS Student Community Day',
        description: `${ticket.label} × ${order.quantity}`,
        order_id: order.orderId,
        prefill: { name, email, contact: phone },
        notes: { booking_id: order.bookingId },
        theme: { color: '#22223B' },
        handler: response => {
          void completePayment(order, response, accessToken).catch((verificationError: unknown) => {
            setError(verificationError instanceof Error ? verificationError.message : 'Could not verify payment. Please contact the event team.');
            setSubmitting(false);
          });
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });
      checkout.open();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not start checkout. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/75 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-checkout-title"
        className="w-full max-w-lg bg-white p-6 sm:p-8 text-[#22223B] shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#7B9285]">Secure checkout</p>
            <h2 id="ticket-checkout-title" className="mt-2 text-2xl font-semibold">{ticket.label}</h2>
            <p className="mt-1 text-sm text-[#64748b]">{formatTicketPrice(ticket)} per ticket</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close checkout"
            className="p-2 text-[#22223B] hover:bg-[#F2E9E4] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {booking ? (
          <div className="mt-6 space-y-4" role="status">
            <p className="font-semibold text-green-700">Payment confirmed. Your ticket{booking.tickets.length === 1 ? '' : 's'} {booking.tickets.length === 1 ? 'is' : 'are'} ready.</p>
            <p className="text-sm text-[#64748b]">Booking reference: <span className="font-mono">{booking.bookingId}</span></p>
            <ul className="space-y-2">
              {booking.tickets.map(ticketItem => (
                <li key={ticketItem.code} className="border border-[#22223B]/15 bg-[#F2E9E4] px-4 py-3 font-mono text-sm">
                  {ticketItem.code}
                </li>
              ))}
            </ul>
            <button type="button" onClick={onClose} className="w-full bg-[#22223B] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              Full name
              <input
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={event => setName(event.target.value)}
                className="mt-1 w-full border border-[#22223B]/20 px-3 py-2.5 outline-none focus:border-[#7B9285]"
              />
            </label>
            <label className="block text-sm font-medium">
              Email
              <input
                required
                type="email"
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="mt-1 w-full border border-[#22223B]/20 px-3 py-2.5 outline-none focus:border-[#7B9285]"
              />
            </label>
            <label className="block text-sm font-medium">
              Phone number
              <input
                required
                type="tel"
                pattern="\\+?[0-9]{10,15}"
                title="Enter 10 to 15 digits, optionally starting with +."
                autoComplete="tel"
                value={phone}
                onChange={event => setPhone(event.target.value)}
                className="mt-1 w-full border border-[#22223B]/20 px-3 py-2.5 outline-none focus:border-[#7B9285]"
              />
            </label>
            <label className="block text-sm font-medium">
              Quantity
              <select
                value={quantity}
                onChange={event => setQuantity(Number(event.target.value))}
                className="mt-1 w-full border border-[#22223B]/20 bg-white px-3 py-2.5 outline-none focus:border-[#7B9285]"
              >
                {Array.from({ length: Math.min(5, ticket.remaining) }, (_, index) => index + 1).map(count => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </label>
            <p className="text-xs leading-relaxed text-[#64748b]">
              Your ticket price and availability are confirmed by the event service. Payment details are handled securely by Razorpay.
            </p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#22223B] px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#4A4E69] disabled:cursor-wait disabled:opacity-60"
            >
              {submitting ? 'CONNECTING TO CHECKOUT…' : `CONTINUE · ${formatTicketPrice(ticket)}`}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
