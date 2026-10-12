import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const gmailUser = payload.gmailUser || process.env.VITE_GMAIL_USER || process.env.GMAIL_USER;
    const gmailPass = payload.gmailPass || process.env.VITE_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    const resendKey = payload.apiKey || process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

    // PATH 1: Direct Gmail delivery
    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: String(gmailPass).replace(/\s+/g, ''),
        },
      });

      const info = await transporter.sendMail({
        from: `"AWS SCD 2026 Organizing Committee" <${gmailUser}>`,
        to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
        subject: payload.subject,
        html: payload.html,
      });

      return res.status(200).json({ success: true, provider: 'gmail', id: info.messageId });
    }

    // PATH 2: Resend API fallback
    if (resendKey) {
      const sender = payload.from || process.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: sender.includes('<') ? sender : `AWS SCD 2026 <${sender}>`,
          to: Array.isArray(payload.to) ? payload.to : [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await resendRes.json();
      return res.status(resendRes.status).json(data);
    }

    // Neither configured
    return res.status(400).json({
      error: 'Email credentials missing. Please set VITE_GMAIL_USER & VITE_GMAIL_APP_PASSWORD in your Vercel Environment Variables.',
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to dispatch email';
    return res.status(500).json({ error: errMsg });
  }
}
