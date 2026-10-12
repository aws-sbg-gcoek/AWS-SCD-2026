import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import nodemailer from 'nodemailer';

/**
 * Server-side email delivery handler.
 * 1. Direct Gmail delivery (0 DNS, 0 domains needed) via VITE_GMAIL_USER & VITE_GMAIL_APP_PASSWORD
 * 2. Resend API fallback via VITE_RESEND_API_KEY
 */
function emailDispatchPlugin(): Plugin {
  return {
    name: 'email-dispatch-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/send-ticket-email' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const env = loadEnv(server.config.mode, process.cwd(), '');
              const payload = JSON.parse(body || '{}');

              const gmailUser = payload.gmailUser || env.VITE_GMAIL_USER || env.GMAIL_USER;
              const gmailPass = payload.gmailPass || env.VITE_GMAIL_APP_PASSWORD || env.GMAIL_APP_PASSWORD;
              const resendKey = payload.apiKey || env.VITE_RESEND_API_KEY || env.RESEND_API_KEY;

              // PATH 1: Direct Gmail delivery (Zero DNS, sends directly from user's Gmail to student's Gmail)
              if (gmailUser && gmailPass) {
                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: gmailUser,
                    pass: String(gmailPass).replace(/\s+/g, ''), // strip spaces if copied from Google
                  },
                });

                const info = await transporter.sendMail({
                  from: `"AWS SCD 2026 Organizing Committee" <${gmailUser}>`,
                  to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
                  subject: payload.subject,
                  html: payload.html,
                });

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, provider: 'gmail', id: info.messageId }));
                return;
              }

              // PATH 2: Resend API fallback
              if (resendKey) {
                const sender = payload.from || env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';
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
                res.statusCode = resendRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              }

              // Neither configured
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'Email credentials missing. Please set VITE_GMAIL_USER & VITE_GMAIL_APP_PASSWORD in .env.local to send directly from Gmail.',
                })
              );
            } catch (err: unknown) {
              const errMsg = err instanceof Error ? err.message : 'Failed to dispatch email';
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: errMsg }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), emailDispatchPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/resend': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (p: string) => p.replace(/^\/api\/resend/, ''),
          secure: true,
        },
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env VAR.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
