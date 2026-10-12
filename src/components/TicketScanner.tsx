import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  StudentRegistration,
  CheckInResult,
  checkInTicket,
  resetTicketCheckIn,
  loadRegistrations,
} from '../utils/registrationStore';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  QrCode,
  ScanLine,
  Search,
  UserCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';

interface TicketScannerProps {
  registrations: StudentRegistration[];
  onCheckInChange?: () => void;
}

export default function TicketScanner({ registrations, onCheckInChange }: TicketScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState<Array<{ result: CheckInResult; timestamp: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'admin-qr-reader';
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  // Stats calculation
  const approvedList = registrations.filter(r => r.status === 'APPROVED');
  const checkedInList = approvedList.filter(r => r.checkedIn);
  const remainingCount = Math.max(0, approvedList.length - checkedInList.length);
  const attendancePercent = approvedList.length > 0 
    ? Math.round((checkedInList.length / approvedList.length) * 100) 
    : 0;

  // Synthesized audio feedback for zero-dependency sounds
  const playAudioCue = (type: 'success' | 'duplicate' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        // High, pleasant two-tone chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'duplicate') {
        // Double harsh alert tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.setValueAtTime(196, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Low error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio autoplay policy may block without prior gesture
    }
  };

  // Trigger haptic vibration if supported on phone/tablet
  const triggerHaptic = (pattern: number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  };

  // Perform ticket check-in verification
  const handleProcessCode = async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed || isProcessing) return;

    // Throttle duplicate reads of the exact same string within 2.5 seconds
    const now = Date.now();
    if (trimmed === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
      return;
    }

    lastScannedCodeRef.current = trimmed;
    lastScanTimeRef.current = now;
    setIsProcessing(true);

    try {
      const result = checkInTicket(trimmed);
      setLastResult(result);
      setRecentScans(prev => [{ result, timestamp: new Date().toLocaleTimeString('en-IN') }, ...prev.slice(0, 19)]);

      if (result.status === 'SUCCESS') {
        playAudioCue('success');
        triggerHaptic([100]);
      } else if (result.status === 'ALREADY_USED') {
        playAudioCue('duplicate');
        triggerHaptic([200, 100, 200]);
      } else {
        playAudioCue('error');
        triggerHaptic([300]);
      }

      if (onCheckInChange) {
        onCheckInChange();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Start HTML5 camera scanner
  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        decodedText => {
          handleProcessCode(decodedText);
        },
        () => {
          // Frame decode error (normal while waiting for QR in view)
        }
      );
      setIsScanning(true);
    } catch (err: unknown) {
      console.error('Failed to start camera scanner:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setCameraError(errMsg || 'Camera permission denied or camera not found on this device.');
      setIsScanning(false);
    }
  };

  // Stop camera scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .then(() => {
            html5QrCodeRef.current?.clear();
          });
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleProcessCode(manualInput);
    setManualInput('');
  };

  const handleResetCheckIn = (id: string) => {
    if (window.confirm('Reset this ticket check-in status back to active (allowing it to be scanned again)?')) {
      resetTicketCheckIn(id);
      if (lastResult?.registration?.id === id) {
        setLastResult(null);
      }
      if (onCheckInChange) {
        onCheckInChange();
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner & Attendance Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Checked In</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{checkedInList.length}</span>
          </div>
        </div>

        <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Total Approved</span>
            <span className="text-2xl font-bold font-mono text-white">{approvedList.length}</span>
          </div>
        </div>

        <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Expected Remaining</span>
            <span className="text-2xl font-bold font-mono text-amber-400">{remainingCount}</span>
          </div>
        </div>

        <div className="bg-[#101726] border border-[#1E293B] rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400 block">Gate Turnout</span>
            <span className="text-2xl font-bold font-mono text-purple-300">{attendancePercent}%</span>
          </div>
        </div>
      </div>

      {/* Main Scanner Section: Camera & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Viewfinder / Scanner Gun Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#101726] border border-[#1E293B] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Gate QR Scanner</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg text-xs font-mono border transition-colors ${
                    soundEnabled
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                  title={soundEnabled ? 'Beep Sound Enabled' : 'Sound Muted'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Video Viewfinder Container */}
            <div className="relative bg-[#070B13] border-2 border-[#1E293B] rounded-xl overflow-hidden min-h-[290px] flex flex-col items-center justify-center">
              {/* HTML5 QR target element */}
              <div
                id={scannerContainerId}
                className={`w-full ${isScanning ? 'block' : 'hidden'}`}
                style={{ maxHeight: '360px' }}
              />

              {!isScanning && (
                <div className="p-8 text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Camera Scanner Ready</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Point device camera at attendee ticket QR code for instantaneous 1-time check-in.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startScanner}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Camera</span>
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="absolute top-3 right-3 z-20">
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg shadow-lg cursor-pointer transition-colors"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Turn Off Camera</span>
                  </button>
                </div>
              )}

              {cameraError && (
                <div className="p-4 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 m-4 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Camera Error:</strong> {cameraError}
                    <div className="mt-1 text-slate-300">
                      Use the manual barcode/ticket code box below to scan tickets without camera permissions.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Entry or USB Barcode Gun input */}
            <form onSubmit={handleManualSubmit} className="pt-2">
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase font-semibold">
                Barcode Gun / Manual Ticket Code Entry
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="Scan with gun or paste TKT-2026-XXXXXX..."
                    className="w-full bg-[#070B13] border border-[#243044] focus:border-amber-500 text-white font-mono text-xs pl-10 pr-3 py-2.5 rounded-xl outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs font-mono px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="bg-[#070B13] border border-[#1E293B] rounded-xl p-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
                Quick Simulation / Test Scans:
              </span>
              <div className="flex flex-wrap gap-2">
                {approvedList.slice(0, 3).map(att => (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => att.ticketCode && handleProcessCode(att.ticketCode)}
                    className="text-[11px] font-mono bg-[#162033] hover:bg-[#1E2D4A] border border-[#2B3B59] text-slate-200 px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{att.fullName.split(' ')[0]}</span>
                    <span className="text-amber-400 text-[10px]">({att.ticketCode})</span>
                    {att.checkedIn && <span className="text-red-400 text-[9px] font-bold">[USED]</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scan Verification Result Card */}
        <div className="lg:col-span-6 space-y-4">
          {/* Result Banner */}
          {lastResult ? (
            <div className="space-y-4 animate-scale-in">
              {/* SUCCESS: First time entry */}
              {lastResult.status === 'SUCCESS' && lastResult.registration && (
                <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                          Gate Verification Valid
                        </span>
                        <h2 className="text-2xl font-black text-white">ACCESS GRANTED</h2>
                      </div>
                    </div>
                    <span className="bg-emerald-500 text-slate-950 font-mono font-black text-xs px-3 py-1 rounded-full uppercase">
                      Checked In
                    </span>
                  </div>

                  {/* Attendee Details Card */}
                  <div className="bg-[#070B13] border border-emerald-500/30 rounded-xl p-4 space-y-3 font-mono">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Attendee Name</span>
                        <strong className="text-lg text-white font-sans font-bold">
                          {lastResult.registration.fullName}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Ticket Code</span>
                        <span className="text-amber-400 font-bold text-sm">
                          {lastResult.registration.ticketCode}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">College / Institute</span>
                        <span className="text-slate-300 font-sans text-xs">
                          {lastResult.registration.collegeName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">PRN / Roll Number</span>
                        <span className="text-slate-200">{lastResult.registration.prnRollNo}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Ticket Tier</span>
                        <span className="text-emerald-400 font-bold">
                          {lastResult.registration.ticketTier} (₹{lastResult.registration.amount})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Booking Reference</span>
                        <span className="text-slate-300">{lastResult.registration.bookingId}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-300">
                      <span>✓ Gate pass recorded at:</span>
                      <strong>{new Date().toLocaleTimeString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 font-mono">
                      Admit attendee into conference venue.
                    </span>
                    <button
                      type="button"
                      onClick={() => setLastResult(null)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Ready Next Ticket
                    </button>
                  </div>
                </div>
              )}

              {/* ALREADY_USED: Duplicate entry blocked */}
              {lastResult.status === 'ALREADY_USED' && (
                <div className="bg-red-950/60 border-2 border-red-500 rounded-2xl p-6 shadow-2xl space-y-5 animate-pulse">
                  <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
                        <AlertOctagon className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                          Security Alert · Duplicate Detected
                        </span>
                        <h2 className="text-2xl font-black text-white">DUPLICATE ENTRY BLOCKED</h2>
                      </div>
                    </div>
                    <span className="bg-red-600 text-white font-mono font-black text-xs px-3 py-1 rounded-full uppercase">
                      Already Scanned
                    </span>
                  </div>

                  <div className="bg-[#070B13] border border-red-500/40 rounded-xl p-4 space-y-3 font-mono">
                    <p className="text-xs text-red-300 font-sans leading-relaxed">
                      {lastResult.message}
                    </p>

                    {lastResult.registration && (
                      <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Registered Attendee</span>
                          <strong className="text-white font-sans">{lastResult.registration.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">First Scanned At</span>
                          <strong className="text-amber-400">
                            {lastResult.registration.checkedInAt
                              ? new Date(lastResult.registration.checkedInAt).toLocaleTimeString('en-IN')
                              : 'Earlier today'}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {lastResult.registration && (
                      <button
                        type="button"
                        onClick={() => handleResetCheckIn(lastResult.registration!.id)}
                        className="text-xs text-slate-400 hover:text-slate-200 underline font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Override & Reset Check-in</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setLastResult(null)}
                      className="bg-red-700 hover:bg-red-600 text-white font-mono text-xs px-4 py-2 rounded-lg cursor-pointer ml-auto"
                    >
                      Clear Alert
                    </button>
                  </div>
                </div>
              )}

              {/* UNAPPROVED / NOT_FOUND */}
              {(lastResult.status === 'UNAPPROVED' || lastResult.status === 'NOT_FOUND') && (
                <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-amber-500/30">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                        Verification Failed
                      </span>
                      <h2 className="text-xl font-bold text-white">
                        {lastResult.status === 'NOT_FOUND' ? 'INVALID TICKET CODE' : 'TICKET NOT APPROVED'}
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#070B13] p-4 rounded-xl border border-slate-800">
                    {lastResult.message}
                  </p>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setLastResult(null)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#101726] border border-[#1E293B] rounded-2xl p-8 text-center space-y-3 min-h-[350px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#162033] border border-[#233147] flex items-center justify-center text-slate-400">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white">Awaiting Scan</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Aim the camera scanner at attendee pass QR code, or scan with handheld laser gun. Verification response appears here instantly with full student credentials.
              </p>
            </div>
          )}

          {/* Recent Scans Activity Feed */}
          {recentScans.length > 0 && (
            <div className="bg-[#101726] border border-[#1E293B] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                  Recent Gate Scans ({recentScans.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setRecentScans([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                >
                  Clear Feed
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recentScans.map((item, idx) => {
                  const isSuccess = item.result.status === 'SUCCESS';
                  const isDuplicate = item.result.status === 'ALREADY_USED';
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isSuccess
                          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                          : isDuplicate
                          ? 'bg-red-950/30 border-red-800/40 text-red-200'
                          : 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSuccess ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : isDuplicate ? (
                          <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-semibold">
                          {item.result.registration?.fullName || 'Unknown Code'}
                        </span>
                        <span className="text-[10px] font-mono opacity-80">
                          ({item.result.registration?.ticketCode || 'N/A'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-60">{item.timestamp}</span>
                        {isDuplicate && item.result.registration && (
                          <button
                            type="button"
                            onClick={() => handleResetCheckIn(item.result.registration!.id)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono"
                            title="Reset check-in"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
