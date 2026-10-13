import React, { useState, useRef } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  QrCode,
  Upload,
  Image as ImageIcon,
  X,
  FileCheck,
} from 'lucide-react';
import { compressImageToBase64 } from '../utils/registrationStore';

interface UpiPaymentCardProps {
  amount?: number;
  payeeName?: string;
  upiId?: string;
  transactionNote?: string;
  onPaymentDone?: (utrNumber: string, screenshotBase64?: string, screenshotName?: string) => void;
}

export default function UpiPaymentCard({
  amount = 149,
  payeeName = 'Bhushan Jadhav',
  upiId = 'aj6244249-1@okaxis',
  transactionNote = 'AWS SCD 2026 Ticket',
  onPaymentDone,
}: UpiPaymentCardProps) {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [submittingUtr, setSubmittingUtr] = useState(false);

  // Payment screenshot state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotCompressing, setScreenshotCompressing] = useState(false);
  const [screenshotError, setScreenshotError] = useState('');
  const [utrError, setUtrError] = useState('');

  // Universal UPI Deep Link URL (Pre-fills recipient, amount, note in all UPI apps)
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Specific App Links
  const gpayLink = `gpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  const phonepeLink = `phonepe://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Paytm deep link scheme: paytmmp://pay?pa=... (NOT /upi/pay which causes Paytm to open on home screen without payment window)
  const paytmLink = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  // Scannable QR Code URL
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    upiLink
  )}&margin=10`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload an image file (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError('Image size exceeds 10MB. Please choose a smaller screenshot.');
      return;
    }

    setScreenshotError('');
    setScreenshotFile(file);
    setScreenshotCompressing(true);

    try {
      // Compress client-side to ~80-120KB for fast saving in Firestore
      const compressed = await compressImageToBase64(file, 900, 900, 0.75);
      setScreenshotBase64(compressed);
    } catch (err) {
      console.error('Error compressing image:', err);
      // Fallback: direct FileReader
      const reader = new FileReader();
      reader.onload = ev => setScreenshotBase64(ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setScreenshotCompressing(false);
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotBase64(null);
    setScreenshotError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmUtr = (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError('');

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setUtrError('Please enter a valid 12-digit numeric UPI UTR / Reference ID (e.g. 428901234567).');
      return;
    }

    setSubmittingUtr(true);
    setTimeout(() => {
      setSubmittingUtr(false);
      if (onPaymentDone) {
        onPaymentDone(
          cleanUtr,
          screenshotBase64 || undefined,
          screenshotFile?.name || undefined
        );
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Mobile Payment App Redirection Buttons */}
      <div className="bg-[#121A2A] border border-[#233147] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              1-Click Instant App Payment
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded">
            ZERO GATEWAY FEE
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Click below to open your payment app on mobile with pre-filled amount{' '}
          <strong className="text-emerald-400 font-bold">₹{amount}</strong>:
        </p>

        {/* Primary Instant Redirect Button */}
        <a
          href={upiLink}
          className="w-full bg-[#5856D6] hover:bg-[#6865EE] active:scale-[0.99] text-white font-extrabold py-3.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#5856D6]/30"
        >
          <span>⚡ Pay ₹{amount} via UPI App (GPay / PhonePe / Paytm)</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Direct App Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
          <a
            href={gpayLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#0B0F19] hover:bg-[#151D2C] border border-[#243044] hover:border-blue-400 rounded-lg text-slate-200 transition-colors text-center"
          >
            <span className="font-bold text-blue-400">GPay</span>
          </a>

          <a
            href={phonepeLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#0B0F19] hover:bg-[#151D2C] border border-[#243044] hover:border-purple-400 rounded-lg text-slate-200 transition-colors text-center"
          >
            <span className="font-bold text-purple-400">PhonePe</span>
          </a>

          <a
            href={paytmLink}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#0B0F19] hover:bg-[#151D2C] border border-[#243044] hover:border-sky-400 rounded-lg text-slate-200 transition-colors text-center"
          >
            <span className="font-bold text-sky-400">Paytm</span>
          </a>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="bg-[#121A2A] border border-[#233147] rounded-2xl p-6 text-center space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#233147]">
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Official Event UPI</span>
            <h4 className="text-base font-bold text-white">{payeeName}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Amount</span>
            <h4 className="text-xl font-black text-emerald-400">₹{amount}</h4>
          </div>
        </div>

        {/* White QR Container */}
        <div className="bg-white p-5 rounded-2xl inline-block mx-auto shadow-2xl border-4 border-slate-200 max-w-[260px]">
          <div className="relative">
            <img
              src={qrCodeImageUrl}
              alt={`UPI QR Code for ${amount} INR`}
              className="w-52 h-52 mx-auto block rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center border border-slate-200">
                <svg className="w-6 h-6" viewBox="0 0 48 48">
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.79l7.98-6.2z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* UPI ID + Copy */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="flex items-center justify-center gap-1.5 font-mono text-xs text-[#334155] font-semibold">
              <span>UPI ID: {upiId}</span>
              <button
                type="button"
                onClick={copyUpiId}
                className="p-1 hover:bg-slate-200 rounded text-indigo-600 transition-colors"
                title="Copy UPI ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {copied && <span className="text-[10px] text-emerald-600 font-mono block">Copied to clipboard!</span>}

            <p className="text-xs text-slate-500 font-sans">Scan to pay with any UPI app</p>
          </div>
        </div>
      </div>

      {/* Verification / UTR & Payment Screenshot Upload */}
      <form onSubmit={handleConfirmUtr} className="bg-[#121A2A] border border-[#233147] rounded-2xl p-5 sm:p-6 space-y-5">
        <div>
          <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Payment Proof & Verification</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Provide your UPI UTR reference and/or upload a screenshot of your successful transaction.
          </p>
        </div>

        {/* 1. Transaction ID / UTR Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              UPI Reference No. / 12-Digit UTR <span className="text-red-400">*</span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {utrNumber.length}/12 digits
            </span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            required
            value={utrNumber}
            onChange={e => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
              setUtrNumber(digits);
              if (utrError) setUtrError('');
            }}
            placeholder="e.g. 428901234567 (12 digits)"
            className={`w-full bg-[#0B0F19] border ${
              utrError ? 'border-red-500 focus:border-red-500' : 'border-[#243044] focus:border-[#5856D6]'
            } focus:ring-1 focus:ring-[#5856D6] text-white font-mono text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors`}
          />
          {utrError ? (
            <p className="text-xs text-red-400 mt-1.5 font-mono">{utrError}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Visible on your GPay, PhonePe, or Paytm success screen as "UPI Ref / UTR / Transaction No." (exact 12 digits).
            </p>
          )}
        </div>

        {/* 2. Payment Screenshot Upload */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Upload Payment Screenshot / Receipt <span className="text-emerald-400 font-semibold">(Fast Approval)</span>
          </label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleScreenshotChange}
            className="hidden"
          />

          {!screenshotBase64 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#243044] hover:border-[#5856D6] bg-[#0B0F19] hover:bg-[#101726] rounded-xl p-4 sm:p-5 flex items-center justify-center gap-3 cursor-pointer transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="text-left text-xs sm:text-sm">
                <span className="font-semibold text-slate-200 block">
                  Click to attach payment screenshot
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  GPay, PhonePe, Paytm receipt (PNG, JPG)
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B0F19] border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={screenshotBase64}
                  alt="Payment Screenshot Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-[#243044] flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 truncate">
                    <Check className="w-3.5 h-3.5" />
                    {screenshotFile?.name || 'Payment_Receipt.jpg'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {screenshotCompressing ? 'Optimizing image…' : 'Receipt attached for admin verification'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveScreenshot}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#1A2333] rounded-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {screenshotError && (
            <p className="text-xs text-red-400 mt-1.5 font-mono">{screenshotError}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submittingUtr}
          className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60"
        >
          {submittingUtr ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Proof…
            </span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>I Have Paid ₹{amount} · Submit Payment Proof →</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
