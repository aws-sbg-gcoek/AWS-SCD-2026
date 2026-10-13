import { StudentRegistration } from '../utils/registrationStore';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generates official HTML ticket email template
 */
export function generateTicketEmailHtml(student: StudentRegistration): string {
  const ticketCode = student.ticketCode || 'TKT-2026-PENDING';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=3&data=${encodeURIComponent(
    `AWS-SCD-2026|${ticketCode}|${student.fullName}|${student.bookingId}`
  )}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AWS Student Community Day Kolhapur 2026 Ticket</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Ticket Wrapper (Replicating Official Cyber Pass) -->
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="background-color: #060B15; border-radius: 18px; border: 2px solid #00B4D8; overflow: hidden; box-shadow: 0 0 40px rgba(0, 180, 216, 0.35);">
          <tr>
            <!-- LEFT STUB: Transaction Ref & Cloud Icon -->
            <td width="70" valign="top" style="background-color: #040810; border-right: 2px dashed #0077B6; padding: 25px 8px; text-align: center;">
              <!-- Cloud Logo -->
              <div style="font-size: 22px; color: #00D4FF; margin-bottom: 25px;">
                ☁️
              </div>
              <!-- Vertical Text Simulation -->
              <p style="margin: 0; font-family: monospace; font-size: 10px; color: #00D4FF; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                TXN REF
              </p>
              <p style="margin: 10px 0 0; font-family: monospace; font-size: 11px; color: #E2E8F0; font-weight: 700; word-break: break-all;">
                ${student.transactionId}
              </p>
            </td>

            <!-- MAIN PASS BODY -->
            <td valign="top" style="padding: 28px 32px; background: linear-gradient(135deg, #07101E 0%, #050B14 50%, #04070F 100%);">
              
              <!-- TOP HEADER: Branding & REGISTRATION CONFIRMED -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 16px; border-bottom: 1px solid #0E243A; padding-bottom: 14px;">
                <tr>
                  <!-- Left: AWS Student Community Day Kolhapur -->
                  <td valign="middle">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -1px; padding-right: 8px;">
                          aws
                        </td>
                        <td style="border-left: 2px solid #1E3A5F; padding-left: 8px;">
                          <div style="font-size: 10px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase; line-height: 1.2;">
                            STUDENT
                          </div>
                          <div style="font-size: 10px; font-weight: 800; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase; line-height: 1.2;">
                            COMMUNITY DAY
                          </div>
                          <div style="font-size: 11px; font-weight: 900; color: #FF9900; letter-spacing: 2px; text-transform: uppercase; line-height: 1.2;">
                            KOLHAPUR
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right: Registration Confirmed -->
                  <td align="right" valign="middle">
                    <p style="margin: 0; font-size: 8px; font-family: monospace; color: #94A3B8; letter-spacing: 1.5px; text-transform: uppercase;">
                      LEARN / BUILD / CONNECT
                    </p>
                    <div style="margin: 3px 0 0; font-size: 16px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; line-height: 1.1;">
                      REGISTRATION
                    </div>
                    <div style="margin: 2px 0 0; font-size: 17px; font-weight: 900; color: #00D4FF; letter-spacing: 1px; line-height: 1.1;">
                      CONFIRMED <span style="color: #FF9900; font-size: 13px; font-weight: bold;">\ | /</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- BADGE: Verified Participant Pass -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 22px;">
                <tr>
                  <td style="background-color: #091D33; border: 1px solid #00B4D8; border-radius: 20px; padding: 4px 14px;">
                    <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: #00D4FF; letter-spacing: 1px;">
                      ✓ VERIFIED PARTICIPANT PASS
                    </span>
                  </td>
                </tr>
              </table>

              <!-- DETAILS GRID + QR CODE -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <!-- Left Columns: 4 Fields -->
                  <td valign="top" style="padding-right: 18px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <!-- Row 1: Participant Name & Ticket ID -->
                      <tr>
                        <td width="55%" valign="top" style="padding-bottom: 16px;">
                          <p style="margin: 0 0 3px; font-size: 9px; font-family: monospace; font-weight: 700; color: #38BDF8; letter-spacing: 1px; text-transform: uppercase;">
                            👤 PARTICIPANT NAME
                          </p>
                          <p style="margin: 0; font-size: 17px; font-weight: 900; color: #FFFFFF;">
                            ${student.fullName}
                          </p>
                        </td>
                        <td width="45%" valign="top" style="padding-bottom: 16px;">
                          <p style="margin: 0 0 3px; font-size: 9px; font-family: monospace; font-weight: 700; color: #38BDF8; letter-spacing: 1px; text-transform: uppercase;">
                            🎟️ TICKET ID
                          </p>
                          <p style="margin: 0; font-size: 17px; font-family: monospace; font-weight: 900; color: #FF9900; letter-spacing: 0.5px;">
                            ${ticketCode}
                          </p>
                        </td>
                      </tr>

                      <!-- Row 2: College & Booking ID -->
                      <tr>
                        <td valign="top">
                          <p style="margin: 0 0 3px; font-size: 9px; font-family: monospace; font-weight: 700; color: #38BDF8; letter-spacing: 1px; text-transform: uppercase;">
                            🎓 COLLEGE / INSTITUTION
                          </p>
                          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #E2E8F0; line-height: 1.3;">
                            ${student.collegeName}
                          </p>
                          <p style="margin: 2px 0 0; font-size: 10px; font-family: monospace; color: #94A3B8;">
                            PRN: ${student.prnRollNo}
                          </p>
                        </td>
                        <td valign="top">
                          <p style="margin: 0 0 3px; font-size: 9px; font-family: monospace; font-weight: 700; color: #38BDF8; letter-spacing: 1px; text-transform: uppercase;">
                            💳 BOOKING ID
                          </p>
                          <p style="margin: 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #FFFFFF;">
                            ${student.bookingId}
                          </p>
                          <p style="margin: 2px 0 0; font-size: 10px; font-family: monospace; color: #34D399; font-weight: 600;">
                            ₹${student.amount} (${student.ticketTier})
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right Column: QR Code Box with Cyan Target Frame -->
                  <td width="150" align="center" valign="middle">
                    <table border="0" cellspacing="0" cellpadding="0" style="background-color: #091526; border: 2px solid #00B4D8; border-radius: 14px; padding: 10px; box-shadow: 0 0 20px rgba(0, 180, 216, 0.4);">
                      <tr>
                        <td align="center" style="background-color: #FFFFFF; border-radius: 8px; padding: 8px;">
                          <img src="${qrUrl}" alt="Check-in QR" width="120" height="120" style="display: block; border: 0;" />
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 6px;">
                          <span style="font-size: 8px; font-family: monospace; font-weight: 900; color: #00D4FF; letter-spacing: 1.5px; text-transform: uppercase;">
                            SCAN AT CHECK-IN
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- BOTTOM BAR: Event Date, Venue, & City Details -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #0E243A; padding-top: 14px;">
                <tr>
                  <!-- Date -->
                  <td width="38%" valign="middle">
                    <span style="font-size: 8px; font-family: monospace; color: #38BDF8; font-weight: 700; text-transform: uppercase; display: block;">
                      📅 EVENT DATE
                    </span>
                    <strong style="font-size: 13px; color: #FFFFFF; font-family: monospace;">01 Nov 2026</strong>
                  </td>

                  <!-- Venue -->
                  <td width="42%" valign="middle">
                    <span style="font-size: 8px; font-family: monospace; color: #38BDF8; font-weight: 700; text-transform: uppercase; display: block;">
                      📍 VENUE
                    </span>
                    <strong style="font-size: 13px; color: #FFFFFF;">Kolhapur, Maharashtra</strong>
                  </td>

                  <!-- City Branding -->
                  <td width="20%" align="right" valign="middle">
                    <span style="font-size: 9px; font-family: monospace; color: #00D4FF; letter-spacing: 1px;">
                      KOLHAPUR 2026
                    </span>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- DOWNLOAD & SAVE PASS ACTIONS (Direct Offline Ticket Download) -->
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; text-align: center;">
          <tr>
            <td align="center">
              <table border="0" cellspacing="0" cellpadding="0" style="background-color: #09172B; border: 1px solid #1E3A5F; border-radius: 14px; padding: 18px 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); width: 100%;">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 14px; font-size: 13px; color: #E2E8F0; font-weight: 600;">
                      Save your official ticket pass now to present at the registration gate on 01 Nov 2026:
                    </p>
                    <table border="0" cellspacing="0" cellpadding="0" align="center">
                      <tr>
                        <td align="center" style="padding: 4px 8px;">
                          <a href="https://aws-scd-2026-public.vercel.app/register?tab=track&ref=${encodeURIComponent(student.bookingId)}&download=true" target="_blank" style="background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%); color: #040810; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 16px rgba(0, 180, 216, 0.35); text-transform: uppercase; letter-spacing: 0.5px;">
                            ⬇️ Download Official Ticket Pass (PNG)
                          </a>
                        </td>
                        <td align="center" style="padding: 4px 8px;">
                          <a href="${qrUrl}" target="_blank" download="AWS-SCD-GatePass-${ticketCode}.png" style="background-color: #0E1A2C; border: 1px solid #00B4D8; color: #00D4FF; font-family: monospace; font-weight: 700; font-size: 12px; text-decoration: none; padding: 11px 20px; border-radius: 8px; display: inline-block;">
                            📱 Save Gate QR Code
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Email Footer Notice -->
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="margin-top: 18px; text-align: center;">
          <tr>
            <td>
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748B; font-family: -apple-system, sans-serif;">
                Keep this email handy or save the QR code to your phone gallery. Pass allows strict 1-time gate entry.
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569; font-family: monospace;">
                AWS Student Community Day Kolhapur 2026 Organizing Committee · V.T. Patil Hall, Kolhapur
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generates professional HTML email template for rejected registrations
 */
export function generateRejectionEmailHtml(
  student: StudentRegistration,
  reason?: string
): string {
  const actualReason =
    reason ||
    student.rejectionReason ||
    'The submitted UPI transaction reference could not be matched with event bank statements.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Update: AWS Student Community Day Kolhapur 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table width="640" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A101D; border-radius: 16px; border: 2px solid #EF4444; overflow: hidden; box-shadow: 0 0 35px rgba(239, 68, 68, 0.25);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 30px; background: linear-gradient(135deg, #1A0D15 0%, #0A101D 100%); border-bottom: 1px solid #2A1724;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 24px; font-weight: 900; color: #FFFFFF;">aws</span>
                    <span style="font-size: 11px; font-weight: 800; color: #FF9900; letter-spacing: 1px; margin-left: 8px; text-transform: uppercase;">
                      STUDENT COMMUNITY DAY KOLHAPUR
                    </span>
                  </td>
                  <td align="right">
                    <span style="background-color: #450A0A; border: 1px solid #EF4444; color: #FCA5A5; font-family: monospace; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 6px; text-transform: uppercase;">
                      VERIFICATION REJECTED
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px; line-height: 1.6;">
              <h2 style="margin: 0 0 12px; font-size: 18px; color: #FFFFFF;">
                Hello ${student.fullName},
              </h2>
              <p style="margin: 0 0 18px; font-size: 14px; color: #CBD5E1;">
                We reviewed your registration for <strong>AWS Student Community Day Kolhapur 2026</strong>, but we were unable to verify your payment transaction.
              </p>

              <!-- Reason Box -->
              <div style="background-color: #17121E; border-left: 4px solid #EF4444; padding: 14px 18px; border-radius: 6px; margin-bottom: 22px;">
                <p style="margin: 0 0 4px; font-size: 11px; font-family: monospace; color: #F87171; text-transform: uppercase; font-weight: 700;">
                  REASON FOR REJECTION:
                </p>
                <p style="margin: 0; font-size: 13px; color: #FFFFFF; font-weight: 600;">
                  ${actualReason}
                </p>
              </div>

              <!-- Submitted Details Review -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060B14; border: 1px solid #1E293B; border-radius: 10px; padding: 16px; margin-bottom: 22px; font-family: monospace; font-size: 12px;">
                <tr>
                  <td style="color: #64748B; padding: 4px 0;">REFERENCE ID:</td>
                  <td style="color: #00D4FF; font-weight: 700; padding: 4px 0;">${student.bookingId}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 4px 0;">SUBMITTED UTR:</td>
                  <td style="color: #FFFFFF; font-weight: 700; padding: 4px 0;">${student.transactionId}</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 4px 0;">TIER / AMOUNT:</td>
                  <td style="color: #FBBF24; font-weight: 700; padding: 4px 0;">₹${student.amount} (${student.ticketTier})</td>
                </tr>
                <tr>
                  <td style="color: #64748B; padding: 4px 0;">COLLEGE:</td>
                  <td style="color: #E2E8F0; padding: 4px 0;">${student.collegeName}</td>
                </tr>
              </table>

              <h4 style="margin: 0 0 8px; font-size: 13px; color: #38BDF8;">What Should You Do Next?</h4>
              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 13px; color: #94A3B8;">
                <li style="margin-bottom: 6px;">If your UPI transaction was successful, check your GPay / PhonePe / Paytm receipt for the <strong>12-digit numeric UTR</strong> and re-submit your registration with the correct reference.</li>
                <li style="margin-bottom: 6px;">If the payment was debited from your bank account, reply directly to this email with your transaction screenshot or contact us at <a href="mailto:Awssbggcoek@gmail.com" style="color: #38BDF8; text-decoration: underline;">Awssbggcoek@gmail.com</a>.</li>
              </ul>

              <!-- Re-register CTA -->
              <div style="text-align: center; margin: 26px 0 16px;">
                <a href="https://aws-scd-2026-public.vercel.app/register" target="_blank" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                  Re-Submit Registration with Correct UTR →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px; background-color: #050811; border-top: 1px solid #1A2436; text-align: center; font-size: 11px; color: #64748B;">
              AWS Student Community Day Kolhapur 2026 Organizing Committee · V.T. Patil Hall, Kolhapur
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateRejectionEmailText(
  student: StudentRegistration,
  reason?: string
): string {
  const actualReason =
    reason ||
    student.rejectionReason ||
    'The submitted UPI transaction reference could not be matched with event bank statements.';

  return `Hello ${student.fullName},

We reviewed your registration for AWS Student Community Day Kolhapur 2026, but were unable to verify your payment.

REASON FOR REJECTION:
${actualReason}

SUBMITTED REGISTRATION DETAILS:
- Reference ID: ${student.bookingId}
- Submitted UTR: ${student.transactionId}
- Ticket Tier: ${student.ticketTier} (₹${student.amount})
- College: ${student.collegeName}

WHAT YOU SHOULD DO NEXT:
1. If your UPI transaction was successful, check your GPay / PhonePe / Paytm receipt for the 12-digit numeric UTR and re-submit your registration at:
   https://aws-scd-2026-public.vercel.app/register

2. If money was deducted from your account, reply directly to this email or write to us at Awssbggcoek@gmail.com with your transaction receipt.

Best regards,
AWS Student Community Day Kolhapur 2026 Organizing Committee
V.T. Patil Hall, Kolhapur
`;
}

const DEFAULT_GMAIL_USER = 'Awssbggcoek@gmail.com';
const DEFAULT_GMAIL_PASS = 'uoepgjczzkohretv';
const DEDICATED_PROD_API = 'https://aws-scd-admin-2026.vercel.app/api/send-ticket-email';

/**
 * Resilient multi-tier email dispatcher:
 * 1. Current origin /api/send-ticket-email
 * 2. Guaranteed production serverless API: https://aws-scd-admin-2026.vercel.app/api/send-ticket-email
 * 3. Direct Resend API fallback
 */
async function dispatchEmailWithFallbacks(payload: {
  gmailUser: string;
  gmailPass: string;
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html: string;
}): Promise<SendEmailResult> {
  let lastError = '';

  // Tier 1: Relative API route (works in local dev & primary deployment)
  try {
    const res = await fetch('/api/send-ticket-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, messageId: data.id };
    } else {
      const errData = await res.json().catch(() => ({}));
      lastError = errData.message || errData.error || `HTTP ${res.status}`;
    }
  } catch (err) {
    lastError = err instanceof Error ? err.message : 'Relative API route unavailable';
  }

  // Tier 2: Dedicated production serverless backend
  try {
    const res = await fetch(DEDICATED_PROD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, messageId: data.id };
    } else {
      const errData = await res.json().catch(() => ({}));
      lastError = errData.message || errData.error || `Production HTTP ${res.status}`;
    }
  } catch (err) {
    lastError = err instanceof Error ? err.message : 'Dedicated production API error';
  }

  // Tier 3: Direct Resend API
  if (payload.apiKey) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.apiKey}`,
        },
        body: JSON.stringify({
          from: payload.from,
          to: [payload.to],
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        }),
      });
      const data = await resendRes.json();
      if (resendRes.ok) {
        return { success: true, messageId: data.id };
      } else {
        lastError = data.message || data.error || `Resend HTTP ${resendRes.status}`;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Resend API error';
    }
  }

  return {
    success: false,
    error: lastError || 'Failed to dispatch email across all delivery providers',
  };
}

/**
 * Sends rejection notification email
 */
export async function sendRejectionEmail(
  student: StudentRegistration,
  reason?: string,
  apiKey?: string,
  fromEmail?: string
): Promise<SendEmailResult> {
  const localGmailUser = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_GMAIL_USER') || '' : '';
  const localGmailPass = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_GMAIL_PASS') || '' : '';
  const localResendKey = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_RESEND_KEY') || '' : '';
  const localFromEmail = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_FROM_EMAIL') || '' : '';

  const gmailUser = localGmailUser || import.meta.env.VITE_GMAIL_USER || DEFAULT_GMAIL_USER;
  const gmailPass = localGmailPass || import.meta.env.VITE_GMAIL_APP_PASSWORD || DEFAULT_GMAIL_PASS;
  const activeKey = apiKey || localResendKey || import.meta.env.VITE_RESEND_API_KEY || '';

  const sender =
    fromEmail ||
    localFromEmail ||
    import.meta.env.VITE_RESEND_FROM_EMAIL ||
    (gmailUser ? gmailUser : 'onboarding@resend.dev');

  if (!gmailUser && !activeKey) {
    return {
      success: false,
      error: 'No email service configured. Set up your Gmail sender in the Admin Panel or .env.local.',
    };
  }

  const html = generateRejectionEmailHtml(student, reason);
  const text = generateRejectionEmailText(student, reason);

  return dispatchEmailWithFallbacks({
    gmailUser,
    gmailPass,
    apiKey: activeKey,
    from: sender.includes('<') ? sender : `AWS SCD 2026 <${sender}>`,
    to: student.email,
    subject: `Registration Verification Update: AWS Student Community Day Kolhapur 2026 (${student.bookingId})`,
    text,
    html,
  });
}

/**
 * Sends confirmation email using Resend API or Gmail
 */
export async function sendTicketEmailViaResend(
  student: StudentRegistration,
  apiKey?: string,
  fromEmail?: string
): Promise<SendEmailResult> {
  const localGmailUser = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_GMAIL_USER') || '' : '';
  const localGmailPass = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_GMAIL_PASS') || '' : '';
  const localResendKey = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_RESEND_KEY') || '' : '';
  const localFromEmail = typeof window !== 'undefined' ? localStorage.getItem('AWS_ADMIN_FROM_EMAIL') || '' : '';

  const gmailUser = localGmailUser || import.meta.env.VITE_GMAIL_USER || DEFAULT_GMAIL_USER;
  const gmailPass = localGmailPass || import.meta.env.VITE_GMAIL_APP_PASSWORD || DEFAULT_GMAIL_PASS;
  const activeKey = apiKey || localResendKey || import.meta.env.VITE_RESEND_API_KEY || '';

  const sender =
    fromEmail ||
    localFromEmail ||
    import.meta.env.VITE_RESEND_FROM_EMAIL ||
    (gmailUser ? gmailUser : 'onboarding@resend.dev');

  if (!gmailUser && !activeKey) {
    return {
      success: false,
      error: 'No email service configured. Set up your Gmail sender in the Admin Panel or .env.local (VITE_GMAIL_USER & VITE_GMAIL_APP_PASSWORD).',
    };
  }

  const html = generateTicketEmailHtml(student);
  const text = `Congratulations ${student.fullName}!\n\nYour registration for AWS Student Community Day Kolhapur 2026 is confirmed!\nTicket Pass Code: ${student.ticketCode || student.bookingId}\nBooking ID: ${student.bookingId}\nTier: ${student.ticketTier}\nCollege: ${student.collegeName}\n\nVenue: V.T. Patil Hall, Kolhapur\nDate: Saturday, October 24, 2026\n\nPlease present this ticket pass QR code at the check-in desk.`;

  return dispatchEmailWithFallbacks({
    gmailUser,
    gmailPass,
    apiKey: activeKey,
    from: sender.includes('<') ? sender : `AWS SCD 2026 <${sender}>`,
    to: student.email,
    subject: `🎟️ Your Ticket Pass: AWS Student Community Day Kolhapur 2026 (${student.ticketCode || student.bookingId})`,
    text,
    html,
  });
}
