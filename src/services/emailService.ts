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

        <!-- Email Footer Notice -->
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="margin-top: 18px; text-align: center;">
          <tr>
            <td>
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748B; font-family: -apple-system, sans-serif;">
                Keep this email handy or save the QR code to your phone gallery. Pass allows strict 1-time gate entry.
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569; font-family: monospace;">
                AWS Student Community Day Kolhapur 2026 Organizing Committee
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
 * Sends confirmation email using Resend API
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

  const gmailUser = localGmailUser || import.meta.env.VITE_GMAIL_USER || '';
  const gmailPass = localGmailPass || import.meta.env.VITE_GMAIL_APP_PASSWORD || '';
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

  // We route through local server endpoint /api/send-ticket-email to avoid browser CORS restrictions
  try {
    let response: Response;
    try {
      response = await fetch('/api/send-ticket-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gmailUser,
          gmailPass,
          apiKey: activeKey,
          from: sender.includes('<') ? sender : `AWS SCD 2026 <${sender}>`,
          to: student.email,
          subject: `🎟️ Your Ticket Pass for AWS Student Community Day 2026 (${student.ticketCode || student.bookingId})`,
          html: html,
        }),
      });
    } catch {
      // Fallback to direct proxy route if available
      response = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeKey}`,
        },
        body: JSON.stringify({
          from: sender.includes('<') ? sender : `AWS SCD 2026 <${sender}>`,
          to: [student.email],
          subject: `🎟️ Your Ticket Pass for AWS Student Community Day 2026 (${student.ticketCode || student.bookingId})`,
          html: html,
        }),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      let errorMsg = data.message || data.error || `Failed to send email (HTTP ${response.status})`;
      if (typeof errorMsg === 'string' && errorMsg.includes('only send testing emails')) {
        errorMsg = `Resend Free Sandbox: Can only deliver to your Resend account email until you verify your domain at resend.com/domains (${errorMsg})`;
      }
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown network error',
    };
  }
}
