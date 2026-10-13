import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { StudentRegistration } from '../utils/registrationStore';
import {
  Calendar,
  MapPin,
  User,
  GraduationCap,
  Ticket,
  CreditCard,
  CheckCircle2,
  Download,
  Share2,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';

interface OfficialTicketPassProps {
  registration: StudentRegistration;
  showActions?: boolean;
}

export default function OfficialTicketPass({
  registration,
  showActions = true,
}: OfficialTicketPassProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const ticketCode = registration.ticketCode || 'TKT-2026-PENDING';

  // Generate offline base64 QR code instantly without external network dependency
  useEffect(() => {
    const payload = `AWS-SCD-2026|${ticketCode}|${registration.fullName}|${registration.bookingId}`;
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {
        // Fallback to public QR API if local generation ever fails
        setQrDataUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=3&data=${encodeURIComponent(
            payload
          )}`
        );
      });
  }, [ticketCode, registration.fullName, registration.bookingId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Generates a pixel-perfect, ultra-sharp 1600x800 (2:1 ratio) official event ticket pass.
   * Matches the official AWS Student Community Day Kolhapur 2026 boarding pass design:
   * - High-tech cyber navy background with diagonal geometric panels
   * - Chamfered notch cyber frame with orange & cyan corner brackets
   * - Left vertical stub with AWS cloud smile emblem, tear line notches, and vertical transaction ID
   * - Separate, non-overlapping REGISTRATION and CONFIRMED headers with orange spark rays
   * - 2x2 attendee credentials grid with custom vector icons
   * - Bottom event date & venue strip
   * - Kolhapur palace / temple neon vector skyline with circuit traces
   * - Crisp QR code with cyan reticle targeting brackets and SCAN AT CHECK-IN
   */
  const handleDownloadTicketImage = async () => {
    setIsDownloading(true);

    try {
      const width = 1600;
      const height = 800;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Enable high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // ─────────────────────────────────────────────────────────────
      // 1. BACKGROUND: Deep Midnight Cyber Gradient & Ambient Glows
      // ─────────────────────────────────────────────────────────────
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#030814');
      bgGrad.addColorStop(0.35, '#050E20');
      bgGrad.addColorStop(0.7, '#071630');
      bgGrad.addColorStop(1, '#02060F');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radial neon glow behind right side (QR & Skyline)
      const rightGlow = ctx.createRadialGradient(width - 320, 300, 20, width - 320, 300, 500);
      rightGlow.addColorStop(0, 'rgba(0, 212, 255, 0.18)');
      rightGlow.addColorStop(0.5, 'rgba(2, 132, 199, 0.08)');
      rightGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = rightGlow;
      ctx.fillRect(0, 0, width, height);

      // Subtle diagonal geometric cyber panels in background
      ctx.save();
      ctx.fillStyle = 'rgba(11, 33, 68, 0.35)';
      ctx.beginPath();
      ctx.moveTo(850, 0);
      ctx.lineTo(1100, 0);
      ctx.lineTo(1350, height);
      ctx.lineTo(1100, height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(15, 45, 90, 0.22)';
      ctx.beginPath();
      ctx.moveTo(1150, 0);
      ctx.lineTo(1380, 0);
      ctx.lineTo(1600, height);
      ctx.lineTo(1370, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Subtle micro-grid
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 2. HIGH-TECH CYBER FRAME & CORNER BRACKETS
      // ─────────────────────────────────────────────────────────────
      const inset = 30;
      const frameW = width - inset * 2;
      const frameH = height - inset * 2;
      const chamfer = 24;

      // Outer cyan border with chamfered corners
      ctx.save();
      ctx.strokeStyle = '#00B4D8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      // Top edge
      ctx.moveTo(inset + chamfer, inset);
      ctx.lineTo(inset + frameW - chamfer, inset);
      // Top-right chamfer
      ctx.lineTo(inset + frameW, inset + chamfer);
      // Right edge
      ctx.lineTo(inset + frameW, inset + frameH - chamfer);
      // Bottom-right chamfer
      ctx.lineTo(inset + frameW - chamfer, inset + frameH);
      // Bottom edge
      ctx.lineTo(inset + chamfer, inset + frameH);
      // Bottom-left chamfer
      ctx.lineTo(inset, inset + frameH - chamfer);
      // Left edge
      ctx.lineTo(inset, inset + chamfer);
      // Top-left chamfer
      ctx.closePath();
      ctx.stroke();

      // Inner faint cyan hairline
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(inset + 10, inset + 10, frameW - 20, frameH - 20);

      // Corner Accents (Orange & Cyan cyber brackets)
      // Top-Left (Cyan bracket)
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(inset - 4, inset + 45);
      ctx.lineTo(inset - 4, inset + chamfer);
      ctx.lineTo(inset + chamfer, inset - 4);
      ctx.lineTo(inset + 45, inset - 4);
      ctx.stroke();

      // Top-Right (Orange bracket)
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(inset + frameW - 45, inset - 4);
      ctx.lineTo(inset + frameW - chamfer, inset - 4);
      ctx.lineTo(inset + frameW + 4, inset + chamfer);
      ctx.lineTo(inset + frameW + 4, inset + 45);
      ctx.stroke();

      // Bottom-Left (Orange bold stepped bracket)
      ctx.fillStyle = '#FF9900';
      ctx.fillRect(inset - 6, inset + frameH - 35, 6, 35);
      ctx.fillRect(inset - 6, inset + frameH, 35, 6);

      // Bottom-Right (Cyan bracket)
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(inset + frameW + 4, inset + frameH - 45);
      ctx.lineTo(inset + frameW + 4, inset + frameH - chamfer);
      ctx.lineTo(inset + frameW - chamfer, inset + frameH + 4);
      ctx.lineTo(inset + frameW - 45, inset + frameH + 4);
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 3. LEFT STUB & PERFORATED TEAR-LINE (with cutout notches)
      // ─────────────────────────────────────────────────────────────
      const stubW = 180;
      const tearX = inset + stubW;

      // Darker background for stub
      ctx.fillStyle = '#020713';
      ctx.fillRect(inset, inset, stubW, frameH);

      // Perforated Dashed Line
      ctx.save();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(tearX, inset);
      ctx.lineTo(tearX, inset + frameH);
      ctx.stroke();
      ctx.restore();

      // Circular Cutout Notches at top and bottom of tear line
      const notchR = 26;
      ctx.fillStyle = '#01040A';
      ctx.strokeStyle = '#00B4D8';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(tearX, inset, notchR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(tearX, inset + frameH, notchR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Left Stub Artwork: AWS Cloud Outline + Orange Smile Arrow
      const cloudCenterX = inset + stubW / 2;
      const cloudCenterY = inset + 90;

      ctx.save();
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#08192E';

      // Cloud bubble shape
      ctx.beginPath();
      ctx.arc(cloudCenterX - 18, cloudCenterY + 4, 16, Math.PI * 0.7, Math.PI * 1.85);
      ctx.arc(cloudCenterX + 6, cloudCenterY - 10, 22, Math.PI * 1.1, Math.PI * 1.95);
      ctx.arc(cloudCenterX + 24, cloudCenterY + 4, 15, Math.PI * 1.6, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // AWS smile curve inside cloud
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cloudCenterX + 3, cloudCenterY - 2, 14, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();
      ctx.restore();

      // Vertical Text: TRANSACTION ID & Value
      ctx.save();
      ctx.translate(cloudCenterX, inset + frameH / 2 + 30);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';

      ctx.fillStyle = '#00D4FF';
      ctx.font = 'bold 15px "JetBrains Mono", Menlo, Consolas, monospace';
      ctx.letterSpacing = '5px';
      ctx.fillText('TRANSACTION ID', 0, -8);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 17px "JetBrains Mono", Menlo, Consolas, monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText(registration.transactionId, 0, 18);
      ctx.restore();

      // Stub Bottom Year Tag
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('AWS // 2026', cloudCenterX, inset + frameH - 45);

      // ─────────────────────────────────────────────────────────────
      // 4. HEADER: AWS LOGO (LEFT) & REGISTRATION CONFIRMED (RIGHT)
      // ─────────────────────────────────────────────────────────────
      const bodyX = tearX + 50;

      // 4A. AWS Logo & Event Title (Left)
      // "aws" text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('aws', bodyX, inset + 75);

      // AWS Smile Arrow under "aws"
      ctx.save();
      ctx.strokeStyle = '#FF9900';
      ctx.fillStyle = '#FF9900';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bodyX + 4, inset + 85);
      ctx.bezierCurveTo(bodyX + 28, inset + 97, bodyX + 62, inset + 97, bodyX + 78, inset + 83);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(bodyX + 79, inset + 78);
      ctx.lineTo(bodyX + 83, inset + 88);
      ctx.lineTo(bodyX + 74, inset + 85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Divider Bar
      ctx.fillStyle = '#1E3A5F';
      ctx.fillRect(bodyX + 105, inset + 38, 3, 56);

      // Title lines
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 16px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('STUDENT COMMUNITY DAY', bodyX + 125, inset + 60);

      ctx.fillStyle = '#FF9900';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('KOLHAPUR 2026', bodyX + 125, inset + 88);

      // 4B. Status Header (Right) — STRICTLY STACKED VERTICALLY TO PREVENT OVERLAP
      const rightEdge = inset + frameW - 40;

      // Line 1: Subtitle
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'right';
      ctx.fillText('LEARN / BUILD / CONNECT', rightEdge, inset + 45);

      // Line 2: REGISTRATION (Crisp bold white, independent line)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText('REGISTRATION', rightEdge, inset + 82);

      // Line 3: CONFIRMED (Glowing cyan, with 3 bright orange burst rays)
      ctx.save();
      ctx.fillStyle = '#00D4FF';
      ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.letterSpacing = '2px';
      ctx.shadowColor = '#00D4FF';
      ctx.shadowBlur = 16;
      ctx.fillText('CONFIRMED', rightEdge - 50, inset + 122);
      ctx.restore();

      // Three orange spark rays (\ | /) next to CONFIRMED
      ctx.save();
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      const sparkX = rightEdge - 28;
      const sparkY = inset + 112;

      // Left ray \
      ctx.beginPath();
      ctx.moveTo(sparkX - 6, sparkY + 6);
      ctx.lineTo(sparkX - 14, sparkY - 4);
      ctx.stroke();

      // Center ray |
      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY + 8);
      ctx.lineTo(sparkX, sparkY - 8);
      ctx.stroke();

      // Right ray /
      ctx.beginPath();
      ctx.moveTo(sparkX + 6, sparkY + 6);
      ctx.lineTo(sparkX + 14, sparkY - 4);
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 5. VERIFIED PARTICIPANT PASS BADGE
      // ─────────────────────────────────────────────────────────────
      ctx.save();
      const badgeX = bodyX;
      const badgeY = inset + 128;
      const badgeW = 280;
      const badgeH = 34;

      ctx.fillStyle = '#081E34';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fill();

      ctx.strokeStyle = '#00B4D8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Checkmark icon
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(badgeX + 20, badgeY + 17);
      ctx.lineTo(badgeX + 25, badgeY + 22);
      ctx.lineTo(badgeX + 34, badgeY + 12);
      ctx.stroke();

      // Badge text
      ctx.fillStyle = '#00D4FF';
      ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
      ctx.letterSpacing = '1.5px';
      ctx.textAlign = 'left';
      ctx.fillText('VERIFIED PARTICIPANT PASS', badgeX + 42, badgeY + 22);
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 6. ATTENDEE CREDENTIALS GRID (2x2)
      // ─────────────────────────────────────────────────────────────
      const col1X = bodyX;
      const col2X = bodyX + 380;
      const row1Y = inset + 210;
      const row2Y = inset + 340;

      // Helper function to draw field icons
      const drawFieldLabel = (label: string, iconColor: string, x: number, y: number) => {
        ctx.fillStyle = iconColor;
        ctx.beginPath();
        ctx.arc(x + 7, y - 5, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 13px "JetBrains Mono", Consolas, monospace';
        ctx.letterSpacing = '2px';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 20, y);
      };

      // 6A. FIELD 1: PARTICIPANT NAME
      drawFieldLabel('PARTICIPANT NAME', '#FF9900', col1X, row1Y);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(registration.fullName, col1X, row1Y + 45);

      // 6B. FIELD 2: TICKET ID
      drawFieldLabel('TICKET ID', '#00D4FF', col2X, row1Y);
      ctx.fillStyle = '#FF9900';
      ctx.font = '900 32px "JetBrains Mono", Menlo, Consolas, monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText(ticketCode, col2X, row1Y + 45);

      // 6C. FIELD 3: COLLEGE / INSTITUTION
      drawFieldLabel('COLLEGE / INSTITUTION', '#C084FC', col1X, row2Y);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const colTrunc =
        registration.collegeName.length > 34
          ? registration.collegeName.slice(0, 32) + '...'
          : registration.collegeName;
      ctx.fillText(colTrunc, col1X, row2Y + 38);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText(`PRN: ${registration.prnRollNo}`, col1X, row2Y + 68);

      // 6D. FIELD 4: REFERENCE ID (REF)
      drawFieldLabel('REFERENCE ID', '#C084FC', col2X, row2Y);
      ctx.fillStyle = '#00D4FF';
      ctx.font = '800 20px "JetBrains Mono", monospace';
      ctx.fillText(`Ref: ${registration.bookingId}`, col2X, row2Y + 38);

      ctx.fillStyle = '#34D399';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(`₹${registration.amount} · ${registration.ticketTier}`, col2X, row2Y + 68);

      // ─────────────────────────────────────────────────────────────
      // 7. BOTTOM STRIP: EVENT DATE & VENUE
      // ─────────────────────────────────────────────────────────────
      const bottomY = inset + frameH - 90;

      // Divider Line
      ctx.strokeStyle = '#0F263E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyX, bottomY);
      ctx.lineTo(width - 500, bottomY);
      ctx.stroke();

      // Date Icon & Text
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('EVENT DATE', bodyX, bottomY + 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('01 November 2026', bodyX, bottomY + 62);

      // Venue Icon & Text
      const venueX = bodyX + 320;
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('VENUE', venueX, bottomY + 32);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 22px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.fillText('Kolhapur, Maharashtra', venueX, bottomY + 62);

      // ─────────────────────────────────────────────────────────────
      // 8. KOLHAPUR PALACE / TEMPLE NEON SKYLINE (BOTTOM RIGHT)
      // ─────────────────────────────────────────────────────────────
      ctx.save();
      const skyBaseY = inset + frameH - 24;
      const skyStartX = width - 660;

      // Circuit lines branching to the left
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(skyStartX, skyBaseY - 30);
      ctx.lineTo(skyStartX - 70, skyBaseY - 30);
      ctx.lineTo(skyStartX - 110, skyBaseY - 70);
      ctx.lineTo(skyStartX - 190, skyBaseY - 70);
      ctx.stroke();

      // Orange node dots on circuit traces
      ctx.fillStyle = '#FF9900';
      ctx.beginPath();
      ctx.arc(skyStartX - 190, skyBaseY - 70, 4, 0, Math.PI * 2);
      ctx.arc(skyStartX - 110, skyBaseY - 70, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Lower circuit trace
      ctx.strokeStyle = '#00B4D8';
      ctx.beginPath();
      ctx.moveTo(skyStartX - 30, skyBaseY - 10);
      ctx.lineTo(skyStartX - 120, skyBaseY - 10);
      ctx.lineTo(skyStartX - 160, skyBaseY - 45);
      ctx.stroke();
      ctx.fillStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(skyStartX - 160, skyBaseY - 45, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Bridge Arches along base
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const archX = skyStartX + 40 + i * 36;
        ctx.beginPath();
        ctx.arc(archX, skyBaseY, 14, Math.PI, 0);
        ctx.stroke();
      }

      // Palace Building Outline (Kolhapur New Palace / Mahalaxmi Spires)
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2;

      // Left Wing
      ctx.strokeRect(skyStartX + 40, skyBaseY - 75, 80, 75);
      // Arched windows left wing
      ctx.strokeRect(skyStartX + 52, skyBaseY - 55, 16, 24);
      ctx.strokeRect(skyStartX + 76, skyBaseY - 55, 16, 24);
      ctx.strokeRect(skyStartX + 100, skyBaseY - 55, 16, 24);

      // Left Tower & Dome
      ctx.strokeRect(skyStartX + 30, skyBaseY - 110, 24, 110);
      ctx.beginPath();
      ctx.arc(skyStartX + 42, skyBaseY - 110, 14, Math.PI, 0);
      ctx.moveTo(skyStartX + 42, skyBaseY - 124);
      ctx.lineTo(skyStartX + 42, skyBaseY - 140);
      ctx.stroke();

      // Grand Center Durbar Palace Tower
      ctx.strokeRect(skyStartX + 125, skyBaseY - 105, 110, 105);
      ctx.strokeRect(skyStartX + 145, skyBaseY - 150, 70, 45);

      // Central Arched Windows & Doors
      ctx.strokeStyle = '#FF9900';
      ctx.strokeRect(skyStartX + 155, skyBaseY - 80, 20, 35);
      ctx.strokeRect(skyStartX + 185, skyBaseY - 80, 20, 35);

      // Center Grand Dome with Kalash / Spire
      ctx.strokeStyle = '#00D4FF';
      ctx.beginPath();
      ctx.arc(skyStartX + 180, skyBaseY - 150, 32, Math.PI, 0);
      ctx.moveTo(skyStartX + 180, skyBaseY - 182);
      ctx.lineTo(skyStartX + 180, skyBaseY - 210);
      ctx.stroke();

      // Spire top flag / finial
      ctx.fillStyle = '#FF9900';
      ctx.beginPath();
      ctx.arc(skyStartX + 180, skyBaseY - 210, 4, 0, Math.PI * 2);
      ctx.fill();

      // Right Wing & Right Spires
      ctx.strokeStyle = '#00D4FF';
      ctx.strokeRect(skyStartX + 240, skyBaseY - 80, 80, 80);
      ctx.strokeRect(skyStartX + 252, skyBaseY - 60, 18, 26);
      ctx.strokeRect(skyStartX + 280, skyBaseY - 60, 18, 26);

      // Right Tower & Dome
      ctx.strokeRect(skyStartX + 315, skyBaseY - 120, 26, 120);
      ctx.beginPath();
      ctx.arc(skyStartX + 328, skyBaseY - 120, 15, Math.PI, 0);
      ctx.moveTo(skyStartX + 328, skyBaseY - 135);
      ctx.lineTo(skyStartX + 328, skyBaseY - 155);
      ctx.stroke();

      // Floating AWS Cloud Silhouette above Palace
      const cloudX = skyStartX + 270;
      const cloudY = skyBaseY - 165;
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cloudX - 12, cloudY + 3, 11, Math.PI * 0.7, Math.PI * 1.85);
      ctx.arc(cloudX + 4, cloudY - 7, 15, Math.PI * 1.1, Math.PI * 1.95);
      ctx.arc(cloudX + 17, cloudY + 3, 10, Math.PI * 1.6, Math.PI * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Cloud smile arrow
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cloudX + 3, cloudY - 2, 10, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();
      ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 9. QR CODE BAY WITH CYAN TARGET RETICLES & SCAN LABEL
      // ─────────────────────────────────────────────────────────────
      const qrBoxSize = 250;
      const qrBoxX = rightEdge - qrBoxSize - 20;
      const qrBoxY = inset + 160;

      // 4 Cyan Targeting Reticle Brackets
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 4;
      ctx.lineCap = 'square';
      const bracketLen = 22;

      // Top-Left Reticle
      ctx.beginPath();
      ctx.moveTo(qrBoxX - 12, qrBoxY + bracketLen);
      ctx.lineTo(qrBoxX - 12, qrBoxY - 12);
      ctx.lineTo(qrBoxX + bracketLen, qrBoxY - 12);
      ctx.stroke();

      // Top-Right Reticle
      ctx.beginPath();
      ctx.moveTo(qrBoxX + qrBoxSize + 12 - bracketLen, qrBoxY - 12);
      ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY - 12);
      ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY + bracketLen);
      ctx.stroke();

      // Bottom-Left Reticle
      ctx.beginPath();
      ctx.moveTo(qrBoxX - 12, qrBoxY + qrBoxSize - bracketLen);
      ctx.lineTo(qrBoxX - 12, qrBoxY + qrBoxSize + 12);
      ctx.lineTo(qrBoxX + bracketLen, qrBoxY + qrBoxSize + 12);
      ctx.stroke();

      // Bottom-Right Reticle
      ctx.beginPath();
      ctx.moveTo(qrBoxX + qrBoxSize + 12 - bracketLen, qrBoxY + qrBoxSize + 12);
      ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY + qrBoxSize + 12);
      ctx.lineTo(qrBoxX + qrBoxSize + 12, qrBoxY + qrBoxSize + 12);
      ctx.stroke();

      // Dark Frame Behind White QR
      ctx.fillStyle = '#091B33';
      ctx.beginPath();
      ctx.roundRect(qrBoxX - 6, qrBoxY - 6, qrBoxSize + 12, qrBoxSize + 12, 18);
      ctx.fill();

      // High-Contrast Pure White Card for QR
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14);
      ctx.fill();

      // Draw QR Code Image (Loaded from pre-generated base64 URI)
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        await new Promise((resolve) => {
          if (qrImg.complete) {
            resolve(true);
          } else {
            qrImg.onload = () => resolve(true);
            qrImg.onerror = () => resolve(false);
          }
        });

        if (qrImg.complete && qrImg.naturalWidth > 0) {
          const qrPadding = 16;
          ctx.drawImage(
            qrImg,
            qrBoxX + qrPadding,
            qrBoxY + qrPadding,
            qrBoxSize - qrPadding * 2,
            qrBoxSize - qrPadding * 2
          );
        }
      }

      // SCAN AT CHECK-IN Label
      ctx.fillStyle = '#00D4FF';
      ctx.font = 'bold 15px "JetBrains Mono", Consolas, monospace';
      ctx.letterSpacing = '3px';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN AT CHECK-IN', qrBoxX + qrBoxSize / 2, qrBoxY + qrBoxSize + 42);

      // Trigger Direct HD PNG Download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `AWS_SCD_2026_Ticket_${ticketCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating official ticket pass:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎟️ My official ticket pass for AWS Student Community Day 2026 is confirmed!\n\n` +
        `👤 Attendee: ${registration.fullName}\n` +
        `🎫 Ticket Code: ${ticketCode}\n` +
        `📅 Date: 01 Nov 2026 | Kolhapur, Maharashtra\n` +
        `👉 Verify pass: ${window.location.origin}/register`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Mobile swipe helper hint */}
      <div className="sm:hidden flex items-center justify-center gap-1.5 text-[11px] font-mono text-[#00D4FF]/80 py-1 bg-[#08182D]/60 border border-[#00B4D8]/30 rounded-lg">
        <span>↔ Swipe horizontally to view full boarding pass</span>
      </div>

      <div className="overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
        <div
          ref={ticketRef}
          className="relative mx-auto w-[820px] aspect-[2/1] min-h-[410px] rounded-2xl overflow-hidden bg-[#030814] border-2 border-[#00B4D8] shadow-[0_0_50px_rgba(0,180,216,0.3)] font-sans text-white select-none flex flex-row shrink-0"
          style={{
            background:
              'radial-gradient(ellipse at 85% 20%, #081B34 0%, #050E20 45%, #02060F 100%)',
          }}
        >
          {/* Cyber Edge Corner Accents */}
          <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#00D4FF] z-30" />
          <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#FF9900] z-30" />
          <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#FF9900] z-30" />
          <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#00D4FF] z-30" />

          {/* Futuristic Micro-Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10 z-0"
            style={{
              backgroundImage: `linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
            }}
          />

          {/* ─────────────────────────────────────────────────────────────
              PART 1: LEFT VERTICAL TICKET STUB (11% Width)
          ───────────────────────────────────────────────────────────── */}
          <div className="w-[11%] min-w-[72px] max-w-[80px] bg-[#020713] border-r-2 border-dashed border-[#0077B6]/80 py-4 px-2 flex flex-col items-center justify-between relative z-10 shrink-0">
            {/* Cutout Ticket Notches */}
            <div className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-[#101726] border-2 border-[#00B4D8] z-30" />
            <div className="absolute -bottom-3.5 -right-3.5 w-7 h-7 rounded-full bg-[#101726] border-2 border-[#00B4D8] z-30" />

            {/* Top AWS Cloud Icon with Smile Arrow */}
            <div className="pt-1">
              <div className="w-10 h-10 rounded-xl bg-[#08182D] border border-[#00B4D8]/60 flex flex-col items-center justify-center text-[#00D4FF] shadow-[0_0_12px_rgba(0,180,216,0.3)]">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
                {/* Micro smile arrow */}
                <span className="w-3.5 h-0.5 bg-[#FF9900] rounded-full -mt-0.5" />
              </div>
            </div>

            {/* Middle Vertical Text: Transaction ID / UTR & Reference ID */}
            <div className="my-auto [writing-mode:vertical-lr] rotate-180 flex items-center gap-2">
              <span className="font-mono text-[9px] tracking-widest text-[#00D4FF] uppercase font-black">
                REF: {registration.bookingId}
              </span>
              <span className="font-mono text-[10px] tracking-wider text-slate-200 font-bold select-all">
                UTR: {registration.transactionId}
              </span>
            </div>

            {/* Year Tag */}
            <div className="text-[10px] font-mono font-bold text-slate-500">2026</div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              PART 2 & 3: MAIN BODY (Horizontal Split: 64% Data, 25% QR)
          ───────────────────────────────────────────────────────────── */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between relative z-10 overflow-hidden">
            {/* TOP BAR: AWS Branding + REGISTRATION CONFIRMED Banner */}
            <div className="flex items-start justify-between gap-4 border-b border-[#0F263E] pb-3.5">
              {/* Event Logo */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <span className="text-3xl font-black text-white tracking-tighter leading-none block">
                      aws
                    </span>
                    {/* Authentic curved smile arrow */}
                    <svg
                      className="w-10 h-3 text-[#FF9900] -mt-1 ml-0.5"
                      viewBox="0 0 40 12"
                      fill="none"
                    >
                      <path
                        d="M2 3C10 11 28 11 36 2"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path d="M34 0L39 4L33 6Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="border-l-2 border-[#1E3A5F] pl-3 py-0.5">
                    <div className="text-[10px] font-black tracking-wider uppercase text-white leading-tight">
                      STUDENT
                    </div>
                    <div className="text-[10px] font-black tracking-wider uppercase text-white leading-tight">
                      COMMUNITY DAY
                    </div>
                    <div className="text-[12px] font-black tracking-[0.15em] uppercase text-[#FF9900] leading-tight">
                      KOLHAPUR 2026
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Header: STACKED LAYOUT (Guarantees zero text collision/overlap) */}
              <div className="text-right shrink-0">
                <div className="text-[9px] font-mono tracking-[0.25em] text-[#38BDF8] uppercase font-bold">
                  LEARN / BUILD / CONNECT
                </div>
                {/* Line 1: REGISTRATION */}
                <div className="text-xl sm:text-2xl font-black tracking-wider text-white leading-none mt-1">
                  REGISTRATION
                </div>
                {/* Line 2: CONFIRMED + 3 Orange Sparks (\ | /) */}
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-[#00D4FF] leading-none drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">
                    CONFIRMED
                  </span>
                  {/* Three energetic orange burst rays */}
                  <div className="flex items-center gap-0.5 pl-0.5">
                    <span className="inline-block w-1 h-3 -rotate-45 bg-[#FF9900] rounded-full" />
                    <span className="inline-block w-1 h-4 bg-[#FF9900] rounded-full -mt-0.5" />
                    <span className="inline-block w-1 h-3 rotate-45 bg-[#FF9900] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION: Attendee Credentials (Left) + Gate QR Box (Right) */}
            <div className="grid grid-cols-12 gap-5 items-center my-auto py-2 relative z-10">
              {/* Left Column: Attendee Fields (8 cols) */}
              <div className="col-span-8 space-y-3.5 pr-2">
                {/* Verified Participant Pass Badge */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#08182D] border border-[#00B4D8] text-[#00D4FF] text-[10px] sm:text-[11px] font-bold font-mono tracking-wider shadow-[0_0_15px_rgba(0,180,216,0.35)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00D4FF]" />
                    VERIFIED PARTICIPANT PASS
                  </span>
                </div>

                {/* 2x2 Grid of Attendee Credentials */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* Field 1: Participant Name */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-[#38BDF8] tracking-wider">
                      <User className="w-3 h-3 text-[#FF9900] shrink-0" />
                      <span>PARTICIPANT NAME</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                      {registration.fullName}
                    </div>
                  </div>

                  {/* Field 2: Ticket ID */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-[#38BDF8] tracking-wider">
                      <Ticket className="w-3 h-3 text-[#00D4FF] shrink-0" />
                      <span>TICKET ID</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-mono font-black text-[#FF9900] tracking-wider">
                        {ticketCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                        title="Copy ticket code"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Field 3: College / Institution */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-[#38BDF8] tracking-wider">
                      <GraduationCap className="w-3 h-3 text-[#C084FC] shrink-0" />
                      <span>COLLEGE / INSTITUTION</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {registration.collegeName}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      PRN: {registration.prnRollNo}
                    </div>
                  </div>

                  {/* Field 4: Reference ID */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-[#38BDF8] tracking-wider">
                      <CreditCard className="w-3 h-3 text-[#C084FC] shrink-0" />
                      <span>REFERENCE ID</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      Ref: {registration.bookingId}
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 font-semibold">
                      ₹{registration.amount} · {registration.ticketTier}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Gate QR Code Bay (4 cols) */}
              <div className="col-span-4 flex flex-col items-center justify-center">
                <div className="relative p-2.5 rounded-2xl bg-[#09172B] border-2 border-[#00B4D8] shadow-[0_0_25px_rgba(0,180,216,0.35)]">
                  {/* Cyan Targeting Reticle Brackets */}
                  <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00D4FF]" />
                  <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00D4FF]" />
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00D4FF]" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00D4FF]" />

                  {/* High Contrast White Rounded QR Code */}
                  <div className="bg-white p-2 rounded-xl shadow-inner">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={`Ticket QR for ${registration.fullName}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-slate-500 text-xs font-mono">
                        Loading QR...
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-1.5">
                    <span className="text-[8px] font-mono font-black tracking-widest text-[#00D4FF] uppercase block">
                      SCAN AT CHECK-IN
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLHAPUR PALACE / TEMPLE NEON SKYLINE (BOTTOM RIGHT BACKGROUND ARTWORK) */}
            <div className="absolute bottom-0 right-0 w-[320px] pointer-events-none opacity-40 z-0">
              <svg viewBox="0 0 320 90" fill="none" className="w-full h-auto">
                {/* Circuit lines */}
                <path d="M10 50H70L100 20H150" stroke="#00B4D8" strokeWidth="1.2" />
                <circle cx="10" cy="50" r="2.5" fill="#FF9900" />
                <circle cx="150" cy="20" r="2.5" fill="#FF9900" />
                {/* Bridge arches */}
                <path
                  d="M100 85A10 10 0 0 1 120 85M125 85A10 10 0 0 1 145 85M150 85A10 10 0 0 1 170 85M175 85A10 10 0 0 1 195 85"
                  stroke="#0284C7"
                  strokeWidth="1.5"
                />
                {/* Palace towers and spires */}
                <rect x="115" y="45" width="25" height="40" stroke="#00D4FF" strokeWidth="1.2" />
                <path
                  d="M127.5 30L127.5 45M122 45A5.5 5.5 0 0 1 133 45"
                  stroke="#00D4FF"
                  strokeWidth="1.2"
                />
                <rect x="145" y="25" width="40" height="60" stroke="#00D4FF" strokeWidth="1.5" />
                <path
                  d="M165 10L165 25M150 25A15 15 0 0 1 180 25"
                  stroke="#00D4FF"
                  strokeWidth="1.5"
                />
                <circle cx="165" cy="10" r="2" fill="#FF9900" />
                <rect x="190" y="40" width="30" height="45" stroke="#00D4FF" strokeWidth="1.2" />
                <path
                  d="M205 28L205 40M197 40A8 8 0 0 1 213 40"
                  stroke="#00D4FF"
                  strokeWidth="1.2"
                />
                {/* Floating AWS cloud outline */}
                <path
                  d="M245 35A7 7 0 0 1 257 28A10 10 0 0 1 273 34A7 7 0 0 1 270 45H245A5 5 0 0 1 245 35Z"
                  stroke="#00D4FF"
                  strokeWidth="1.2"
                />
                <path
                  d="M250 40Q258 44 266 38"
                  stroke="#FF9900"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* BOTTOM BAR: Event Date, Venue, & City Details */}
            <div className="border-t border-[#0F263E] pt-3 flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-6">
                {/* Event Date */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#08182D] border border-[#00B4D8]/50 flex items-center justify-center text-[#00D4FF]">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#38BDF8] uppercase block font-bold">
                      EVENT DATE
                    </span>
                    <strong className="text-white text-xs">01 Nov 2026</strong>
                  </div>
                </div>

                {/* Venue */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#08182D] border border-[#00B4D8]/50 flex items-center justify-center text-[#00D4FF]">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[8px] text-[#38BDF8] uppercase block font-bold">
                      VENUE
                    </span>
                    <strong className="text-white text-xs">Kolhapur, Maharashtra</strong>
                  </div>
                </div>
              </div>

              {/* Skyline City Signature */}
              <div className="flex items-center gap-2 opacity-80">
                <span className="text-[9px] font-mono text-[#00D4FF] tracking-wider uppercase font-bold">
                  KOLHAPUR 2026
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION TOOLBAR: Download HD Image, WhatsApp Share */}
      {showActions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Strict 1-time gate validation · Download pass for venue check-in</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadTicketImage}
              disabled={isDownloading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#00B4D8] hover:bg-[#0096C7] disabled:opacity-50 text-slate-950 font-mono font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#00B4D8]/25 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating Pass...' : 'Download Pass (PNG)'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
