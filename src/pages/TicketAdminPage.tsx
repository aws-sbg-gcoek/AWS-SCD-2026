import React, { useState, useEffect } from 'react';
import {
  ADMIN_PASSWORD,
  ADMIN_AUTH_KEY,
  DEFAULT_TICKETS_CONFIG,
  TicketCode,
  TicketStatus,
  TicketSystemConfig,
  TierConfig,
  getTierEffectiveStatus,
  loadTicketConfig,
  saveTicketConfig,
  subscribeToTicketConfig,
} from '../utils/ticketConfig';
import {
  StudentRegistration,
  VerificationStatus,
  loadRegistrations,
  subscribeToRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  exportRegistrationsToCSV,
} from '../utils/registrationStore';
import {
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  ArrowRight,
  LogOut,
  Eye,
  EyeOff,
  Search,
  Download,
  Check,
  X,
  ShieldAlert,
  UserCheck,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Grid,
  List,
  Mail,
  ScanLine,
  Loader2,
  Settings,
  Send,
  HelpCircle,
  Receipt,
} from 'lucide-react';
import { sendTicketEmailViaResend, sendRejectionEmail } from '../services/emailService';
import TicketScanner from '../components/TicketScanner';
import {
  SponsorApplication,
  SponsorStatus,
  loadSponsors,
  subscribeToSponsors,
  updateSponsorStatus,
  deleteSponsorApplication,
  exportSponsorsToCSV,
} from '../utils/sponsorStore';
import {
  SpeakerApplication,
  SpeakerStatus,
  loadSpeakers,
  subscribeToSpeakers,
  updateSpeakerStatus,
  deleteSpeakerApplication,
  exportSpeakersToCSV,
} from '../utils/speakerStore';
import { Building2, Briefcase, PhoneCall, Mic, Store, Globe, Linkedin, Github, User, Award } from 'lucide-react';
import { resetTicketCheckIn } from '../utils/registrationStore';

export interface RejectionReasonOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  defaultText: string;
}

export const REJECTION_REASONS: RejectionReasonOption[] = [
  {
    id: 'DUPLICATE_UTR',
    title: 'Repeated / Duplicate Transaction (UTR) ID',
    subtitle: 'This 12-digit UTR has already been submitted for another registration',
    icon: '🔁',
    badge: 'Duplicate UTR',
    defaultText:
      'The submitted 12-digit UPI / UTR transaction reference has already been recorded for another student registration. Each attendee must submit a unique transaction reference.',
  },
  {
    id: 'INVALID_UTR',
    title: 'Invalid or Unverifiable Transaction ID',
    subtitle: 'Reference not found in bank account or incorrect digits',
    icon: '❌',
    badge: 'Invalid UTR',
    defaultText:
      'The submitted 12-digit UPI / UTR transaction reference could not be matched with any credit in our official event bank statements. Please verify the reference from your UPI app receipt.',
  },
  {
    id: 'INCORRECT_AMOUNT',
    title: 'Incorrect Payment Amount',
    subtitle: 'Paid amount does not match ticket tier price (₹99 / ₹149 / ₹249)',
    icon: '📉',
    badge: 'Mismatch Amount',
    defaultText:
      'The payment amount received does not match the official registration fee for your selected ticket tier. Please ensure the exact amount is transferred.',
  },
  {
    id: 'UNCLEAR_PROOF',
    title: 'Unclear, Cropped, or Incomplete Screenshot',
    subtitle: 'Cannot read UTR number, date, time, or payment status from image',
    icon: '📷',
    badge: 'Blurry Screenshot',
    defaultText:
      'The uploaded payment screenshot is blurry, cropped, or does not clearly display the 12-digit bank UTR reference, payment date, and transaction timestamp.',
  },
  {
    id: 'PAYMENT_PENDING_FAILED',
    title: 'Payment Pending or Failed at Bank',
    subtitle: 'Transaction status shows failed, reversed, or pending bank clearance',
    icon: '⏳',
    badge: 'Bank Pending',
    defaultText:
      'The transaction appears as failed, reversed, or pending clearance in banking records. If funds were debited from your bank account, please check with your UPI app or bank for a refund.',
  },
  {
    id: 'CUSTOM',
    title: 'Custom Reason',
    subtitle: 'Type a specific custom explanation for this student',
    icon: '✍️',
    badge: 'Custom Note',
    defaultText: '',
  },
];

export default function TicketAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Admin Navigation Tab
  const [activeAdminTab, setActiveAdminTab] = useState<'transactions' | 'scanner' | 'sponsors' | 'speakers' | 'tiers'>('transactions');

  // Tier Configuration State
  const [config, setConfig] = useState<TicketSystemConfig>(() => loadTicketConfig());

    // Live sync with real-time Firestore and local updates
    useEffect(() => {
      const unsub = subscribeToTicketConfig(liveConfig => setConfig(liveConfig));
      return () => unsub();
    }, []);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Sponsors Application State
  const [sponsors, setSponsors] = useState<SponsorApplication[]>(() => loadSponsors());
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [sponsorStatusFilter, setSponsorStatusFilter] = useState<'ALL' | SponsorStatus>('ALL');
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorApplication | null>(null);

  // Speakers / CFP Application State
  const [speakers, setSpeakers] = useState<SpeakerApplication[]>(() => loadSpeakers());
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [speakerStatusFilter, setSpeakerStatusFilter] = useState<'ALL' | SpeakerStatus>('ALL');
  const [selectedSpeaker, setSelectedSpeaker] = useState<SpeakerApplication | null>(null);

  // Live real-time listener for Sponsors and Speakers
  useEffect(() => {
    const unsubSponsors = subscribeToSponsors(data => setSponsors(data));
    const unsubSpeakers = subscribeToSpeakers(data => setSpeakers(data));
    return () => {
      unsubSponsors();
      unsubSpeakers();
    };
  }, []);

  // Registrations / Transaction ID Verification State
  const [registrations, setRegistrations] = useState<StudentRegistration[]>(() => loadRegistrations());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL');
  const [selectedAttendee, setSelectedAttendee] = useState<StudentRegistration | null>(null);
  const [zoomIdCard, setZoomIdCard] = useState<number>(1);
  const [rotIdCard, setRotIdCard] = useState<number>(0);
  const [zoomReceipt, setZoomReceipt] = useState<number>(1);
  const [rotReceipt, setRotReceipt] = useState<number>(0);
  const [mobileCompareTab, setMobileCompareTab] = useState<'both' | 'id' | 'receipt'>('both');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);
  const [adminViewMode, setAdminViewMode] = useState<'table' | 'cards'>('table');

  const openCompareModal = (attendee: StudentRegistration) => {
    setSelectedAttendee(attendee);
    setZoomIdCard(1);
    setRotIdCard(0);
    setZoomReceipt(1);
    setRotReceipt(0);
    setMobileCompareTab('both');
  };
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Rejection Dialog State with 5+ preset reasons
  const [rejectingStudent, setRejectingStudent] = useState<StudentRegistration | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('DUPLICATE_UTR');
  const [rejectionExplanation, setRejectionExplanation] = useState<string>(REJECTION_REASONS[0].defaultText);
  const [shouldEmailStudent, setShouldEmailStudent] = useState<boolean>(true);
  const [isSubmittingRejection, setIsSubmittingRejection] = useState<boolean>(false);

  // Email Dispatch Settings State
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState(false);
  const [senderGmailUser, setSenderGmailUser] = useState<string>(() => {
    return localStorage.getItem('AWS_ADMIN_GMAIL_USER') || import.meta.env.VITE_GMAIL_USER || '';
  });
  const [senderGmailPass, setSenderGmailPass] = useState<string>(() => {
    return localStorage.getItem('AWS_ADMIN_GMAIL_PASS') || import.meta.env.VITE_GMAIL_APP_PASSWORD || '';
  });
  const [senderResendKey, setSenderResendKey] = useState<string>(() => {
    return localStorage.getItem('AWS_ADMIN_RESEND_KEY') || import.meta.env.VITE_RESEND_API_KEY || '';
  });
  const [testEmailTo, setTestEmailTo] = useState<string>('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string>('');

  // Live clock, live real-time registration sync & live ticket tiers config (Firestore / Local)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const unsubscribeRegistrations = subscribeToRegistrations(records => {
      setRegistrations(records);
    });

    const unsubscribeConfig = subscribeToTicketConfig(liveConfig => {
      setConfig(liveConfig);
    });

    return () => {
      clearInterval(timer);
      unsubscribeRegistrations();
      unsubscribeConfig();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator credential. Access rejected.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  const updateTier = (tierCode: TicketCode, updates: Partial<TierConfig>) => {
    setConfig(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tierCode]: {
          ...prev.tiers[tierCode],
          ...updates,
        },
      },
    }));
  };

  const handleSaveTiers = async () => {
    await saveTicketConfig(config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all ticket tier configurations and schedules to standard defaults?')) {
      await saveTicketConfig(DEFAULT_TICKETS_CONFIG);
      setConfig(DEFAULT_TICKETS_CONFIG);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  // Transaction Verification Actions & Direct Email Dispatch
  const handleApproveTransaction = async (id: string) => {
    setApprovingId(id);
    const updated = updateRegistrationStatus(id, 'APPROVED');
    if (updated) {
      setRegistrations(loadRegistrations());
      if (selectedAttendee?.id === id) {
        setSelectedAttendee(updated);
      }

      // Automatically dispatch official ticket email to student upon approval
      try {
        const res = await sendTicketEmailViaResend(updated);
        if (res.success) {
          setEmailNotice(`✅ Payment Approved! Official ticket pass directly emailed to ${updated.fullName} (${updated.email})`);
          setTimeout(() => setEmailNotice(''), 8000);
        } else {
          setEmailNotice(`⚠️ Approved & Pass Issued (${updated.ticketCode}), but email could not be delivered: ${res.error}`);
        }
      } catch (err) {
        setEmailNotice(`⚠️ Approved, but email network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
    setApprovingId(null);
  };

  const handleSendTicketEmail = async (student: StudentRegistration) => {
    setIsSendingEmail(true);
    const res = await sendTicketEmailViaResend(student);
    setIsSendingEmail(false);
    if (res.success) {
      setEmailNotice(`✓ Official ticket email sent to ${student.email}`);
      setTimeout(() => setEmailNotice(''), 5000);
    } else {
      alert(`Email Dispatch Notice: ${res.error || 'Please configure Gmail sender credentials.'}`);
    }
  };

  const openRejectionModal = (student: StudentRegistration) => {
    setRejectingStudent(student);
    const existingPreset = REJECTION_REASONS.find(r => r.defaultText === student.rejectionReason);
    if (existingPreset) {
      setSelectedReasonId(existingPreset.id);
      setRejectionExplanation(existingPreset.defaultText);
    } else if (student.rejectionReason) {
      setSelectedReasonId('CUSTOM');
      setRejectionExplanation(student.rejectionReason);
    } else {
      setSelectedReasonId('DUPLICATE_UTR');
      setRejectionExplanation(REJECTION_REASONS[0].defaultText);
    }
    setShouldEmailStudent(true);
  };

  const closeRejectionModal = () => {
    if (isSubmittingRejection) return;
    setRejectingStudent(null);
  };

  const handleSelectReasonOption = (option: RejectionReasonOption) => {
    setSelectedReasonId(option.id);
    if (option.id !== 'CUSTOM') {
      setRejectionExplanation(option.defaultText);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectingStudent) return;
    const finalReason = rejectionExplanation.trim() || 'Payment transaction could not be verified.';

    setIsSubmittingRejection(true);
    try {
      const updated = updateRegistrationStatus(rejectingStudent.id, 'REJECTED', finalReason);
      if (updated) {
        setRegistrations(loadRegistrations());
        if (selectedAttendee?.id === rejectingStudent.id) {
          setSelectedAttendee(updated);
        }

        if (shouldEmailStudent) {
          setEmailNotice(`Dispatching rejection email to ${updated.email}...`);
          const emailRes = await sendRejectionEmail(updated, finalReason);
          if (emailRes.success) {
            setEmailNotice(`✅ Rejection email delivered to ${updated.email} (${emailRes.messageId || 'Delivered'})`);
            setTimeout(() => setEmailNotice(''), 7000);
          } else {
            setEmailNotice(`⚠️ Status set to REJECTED, but email error: ${emailRes.error}`);
            alert(
              `Registration updated to REJECTED, but the rejection email failed to send:\n${emailRes.error}\n\nYou can click "Resend Rejection Email" on this record to retry.`
            );
          }
        } else {
          setEmailNotice(`✓ Status updated to REJECTED for ${updated.fullName} (Email skipped)`);
          setTimeout(() => setEmailNotice(''), 5000);
        }
      }
      setRejectingStudent(null);
    } catch (err) {
      console.error('Error during rejection process:', err);
      alert(`Rejection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmittingRejection(false);
    }
  };

  const handleSendRejectionEmail = (student: StudentRegistration) => {
    openRejectionModal(student);
  };

  const handleRejectTransaction = (id: string) => {
    const student = registrations.find(r => r.id === id);
    if (student) {
      openRejectionModal(student);
    }
  };

  const handleSaveEmailSettings = () => {
    localStorage.setItem('AWS_ADMIN_GMAIL_USER', senderGmailUser.trim());
    localStorage.setItem('AWS_ADMIN_GMAIL_PASS', senderGmailPass.trim().replace(/\s+/g, ''));
    if (senderResendKey.trim()) {
      localStorage.setItem('AWS_ADMIN_RESEND_KEY', senderResendKey.trim());
    }
    setShowEmailSettingsModal(false);
    setEmailNotice('✓ Email sender configuration saved successfully.');
    setTimeout(() => setEmailNotice(''), 5000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmailTo || !testEmailTo.includes('@')) {
      alert('Please enter a valid recipient email address for testing.');
      return;
    }
    setIsSendingTestEmail(true);
    setTestEmailResult('');
    try {
      const dummyStudent: StudentRegistration = {
        id: 'test-preview',
        fullName: 'AWS Community Attendee (Test)',
        email: testEmailTo.trim(),
        phone: '+91 9876543210',
        collegeName: 'Kolhapur Institute of Technology',
        district: 'Kolhapur',
        degree: 'B.Tech',
        branch: 'Computer Science',
        academicYear: '3rd Yr',
        prnRollNo: 'KIT-2026-TEST',
        transactionId: 'TEST-UPI-999888',
        amount: 219,
        ticketTier: 'Phase 1 - Student Early Pass',
        status: 'APPROVED',
        ticketCode: 'TKT-2026-TESTPASS',
        bookingId: 'SCD-KOL-TEST',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        checkedIn: false,
      };

      const res = await sendTicketEmailViaResend(dummyStudent);
      if (res.success) {
        setTestEmailResult(`✓ Success! Test ticket email delivered to ${testEmailTo}`);
      } else {
        setTestEmailResult(`❌ Delivery Failed: ${res.error}`);
      }
    } catch (err) {
      setTestEmailResult(`❌ Error: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSetSurveillance = (id: string) => {
    const updated = updateRegistrationStatus(id, 'UNDER_SURVEILLANCE');
    if (updated) {
      setRegistrations(loadRegistrations());
      if (selectedAttendee?.id === id) {
        setSelectedAttendee(updated);
      }
    }
  };

  const handleDeleteAttendee = (id: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the registration for "${name}"?\nThis will permanently remove this student and their transaction proof.`
      )
    ) {
      deleteRegistration(id);
      setRegistrations(loadRegistrations());
      if (selectedAttendee?.id === id) {
        setSelectedAttendee(null);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingCount = registrations.filter(r => r.status === 'UNDER_SURVEILLANCE').length;
  const approvedCount = registrations.filter(r => r.status === 'APPROVED').length;
  const checkedInCount = registrations.filter(r => r.status === 'APPROVED' && r.checkedIn).length;

  const filteredRegistrations = registrations.filter(item => {
    const matchesFilter = statusFilter === 'ALL' || item.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.transactionId.toLowerCase().includes(q) ||
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.collegeName.toLowerCase().includes(q) ||
      item.bookingId.toLowerCase().includes(q) ||
      item.prnRollNo.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161F30] border border-[#2A374D] shadow-2xl p-8 rounded-lg">
          <div className="flex items-center justify-center w-14 h-14 mx-auto mb-6 rounded-full bg-[#1E293B] border border-[#334155] text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
              Secure Gateway Controller
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3">Admin Verification</h1>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Enter administrator passcode to verify student transaction IDs and manage release schedules.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                Access Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator passcode"
                  className="w-full bg-[#0B0F19] border border-[#2A374D] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-mono text-sm px-4 py-3 rounded outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/80 rounded text-red-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Authenticate & Access
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-[#2A374D] text-center">
            <p className="text-[11px] font-mono text-slate-500">
              Session-restricted administrative environment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tierKeys: TicketCode[] = ['super_early_bird', 'early_bird', 'regular'];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans pb-16">
      {/* Top Navigation */}
      <header className="border-b border-[#1E293B] bg-[#111827] sticky top-0 z-40 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-amber-400 font-mono font-bold shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
                  Ticket Tier & Verification Controller
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-1.5 py-0.5 rounded shrink-0">
                  Live
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate hidden sm:block">
                Verify student UPI transactions, issue passes & configure timing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Email Dispatch Settings Trigger */}
            <button
              type="button"
              onClick={() => setShowEmailSettingsModal(true)}
              className="bg-[#1E293B] hover:bg-[#2A3B52] border border-[#334155] text-slate-200 text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configure Gmail / Resend automated email dispatch"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Email Sender</span>
              {senderGmailUser && senderGmailPass ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-1.5 py-0.5 rounded font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="hidden sm:inline">Gmail</span> Active
                </span>
              ) : senderResendKey ? (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-700/60 px-1.5 py-0.5 rounded font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Resend
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-400 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.5 rounded font-bold animate-pulse">
                  Setup
                </span>
              )}
            </button>

            {/* Live Clock (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] px-2.5 py-1.5 rounded font-mono text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}{' '}
                IST
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-[#1E293B] hover:bg-[#334155] text-slate-300 hover:text-white text-xs font-mono px-2.5 sm:px-3 py-1.5 rounded flex items-center gap-1 transition-colors border border-[#334155] cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6">
        {/* Navigation Tabs: Transactions vs Tiers vs Gate Scanner */}
        <div className="flex items-center gap-2 border-b border-[#233147] pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveAdminTab('transactions')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg font-mono text-xs uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
              activeAdminTab === 'transactions'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-300 hover:bg-[#162133]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Verifications</span>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-sans">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('sponsors')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg font-mono text-xs uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
              activeAdminTab === 'sponsors'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-300 hover:bg-[#162133]'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Sponsors</span>
            {sponsors.filter(s => s.status === 'PENDING').length > 0 && (
              <span className="bg-amber-950 border border-amber-600 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {sponsors.filter(s => s.status === 'PENDING').length} New
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('speakers')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg font-mono text-xs uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
              activeAdminTab === 'speakers'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-300 hover:bg-[#162133]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Speakers / CFP</span>
            {speakers.filter(s => s.status === 'UNDER_REVIEW').length > 0 && (
              <span className="bg-indigo-950 border border-indigo-600 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {speakers.filter(s => s.status === 'UNDER_REVIEW').length} In Review
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('scanner')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg font-mono text-xs uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
              activeAdminTab === 'scanner'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-[#162133]'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>Gate Scanner</span>
            {checkedInCount > 0 && (
              <span className="bg-emerald-950/90 border border-emerald-700/60 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                {checkedInCount} Checked In
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveAdminTab('tiers')}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg font-mono text-xs uppercase font-bold tracking-wider shrink-0 transition-all cursor-pointer ${
              activeAdminTab === 'tiers'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-300 hover:bg-[#162133]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tier Schedules & Pricing</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            TAB 1: TRANSACTION VERIFICATIONS & ATTENDEES
        ───────────────────────────────────────────────────────────── */}
        {activeAdminTab === 'transactions' && (
          <section className="space-y-6 animate-fade-in">
            {/* Live Email Dispatch Alert */}
            {emailNotice && (
              <div
                className={`border px-4 py-3 rounded-xl flex items-center justify-between text-xs font-mono shadow-xl animate-fade-in ${
                  emailNotice.includes('⚠️')
                    ? 'bg-amber-950/90 border-amber-500/70 text-amber-200'
                    : 'bg-emerald-950/90 border-emerald-500/70 text-emerald-200'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Mail
                    className={`w-4 h-4 ${
                      emailNotice.includes('⚠️') ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                  <span>{emailNotice}</span>
                  {emailNotice.includes('⚠️') && (
                    <button
                      type="button"
                      onClick={() => setShowEmailSettingsModal(true)}
                      className="ml-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded text-[10px] font-bold underline cursor-pointer"
                    >
                      Configure Email Sender
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotice('')}
                  className="text-slate-400 hover:text-white ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block uppercase">Under Surveillance</span>
                  <strong className="text-2xl font-bold text-amber-400 mt-1 block">
                    {pendingCount}
                  </strong>
                  <span className="text-[10px] text-slate-500">Awaiting UTR matching</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block uppercase">Approved Tickets</span>
                  <strong className="text-2xl font-bold text-emerald-400 mt-1 block">
                    {approvedCount}
                  </strong>
                  <span className="text-[10px] text-slate-500">Confirmed attendee passes</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block uppercase">Total Registrations</span>
                  <strong className="text-2xl font-bold text-white mt-1 block">
                    {registrations.length}
                  </strong>
                  <span className="text-[10px] text-slate-500">Student submissions</span>
                </div>
                <button
                  type="button"
                  onClick={() => exportRegistrationsToCSV(registrations)}
                  className="bg-[#1E293B] hover:bg-[#2C3B52] border border-[#334155] text-xs px-3 py-2 rounded text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by Transaction ID / UTR, Student Name, Email, or College…"
                  className="w-full bg-[#0B0F19] border border-[#243044] text-white font-mono text-xs pl-10 pr-8 py-2.5 rounded-lg outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`text-xs font-mono px-3 py-2 rounded border transition-colors shrink-0 cursor-pointer ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-200 text-slate-950 font-bold border-white'
                        : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({registrations.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('UNDER_SURVEILLANCE')}
                    className={`text-xs font-mono px-3 py-2 rounded border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      statusFilter === 'UNDER_SURVEILLANCE'
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-[#0B0F19] border-[#243044] text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <span>Under Surveillance ({pendingCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('APPROVED')}
                    className={`text-xs font-mono px-3 py-2 rounded border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      statusFilter === 'APPROVED'
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-[#0B0F19] border-[#243044] text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <span>Approved ({approvedCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('REJECTED')}
                    className={`text-xs font-mono px-3 py-2 rounded border transition-colors shrink-0 cursor-pointer ${
                      statusFilter === 'REJECTED'
                        ? 'bg-red-500 text-white font-bold border-red-400'
                        : 'bg-[#0B0F19] border-[#243044] text-red-400 hover:text-red-300'
                    }`}
                  >
                    Rejected
                  </button>
                </div>

                {/* View Mode Toggle (Table vs Mobile Touch Cards) */}
                <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-lg border border-[#243044] shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('table')}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                      adminViewMode === 'table'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tabular view with side scroll"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminViewMode('cards')}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                      adminViewMode === 'cards'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Card view (optimized for mobile & touch)"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Registrations Display (Table vs Mobile Touch Cards) */}
            {adminViewMode === 'cards' ? (
              <div className="space-y-4">
                {/* Mobile / Card Count Bar */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <span>Displaying <strong className="text-amber-400">{filteredRegistrations.length}</strong> Registrations</span>
                  <span className="text-[11px] text-slate-500">Tap cards or proofs to inspect</span>
                </div>

                {filteredRegistrations.length === 0 ? (
                  <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
                    No student registrations match your filter or search query.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredRegistrations.map(reg => {
                      const isPending = reg.status === 'UNDER_SURVEILLANCE';
                      const isApproved = reg.status === 'APPROVED';
                      const isRejected = reg.status === 'REJECTED';

                      return (
                        <div
                          key={reg.id}
                          className="bg-[#131D2E] border border-[#233147] hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all"
                        >
                          <div className="space-y-3">
                            {/* Top Row: Status badge & Tier amount */}
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  isApproved
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                    : isPending
                                    ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                                    : 'bg-red-950 text-red-300 border border-red-700'
                                }`}
                              >
                                {isApproved && <Check className="w-3 h-3 text-emerald-400" />}
                                {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                                {isRejected && <AlertCircle className="w-3 h-3 text-red-400" />}
                                <span>{reg.status.replace('_', ' ')}</span>
                              </span>

                              <div className="text-right">
                                <span className="text-amber-400 font-mono font-bold text-sm">
                                  ₹{reg.amount}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {reg.ticketTier} Pass
                                </span>
                              </div>
                            </div>

                            {/* Student Info */}
                            <div>
                              <h4 className="text-white font-semibold text-base leading-tight">
                                {reg.fullName}
                              </h4>
                              <p className="text-slate-400 text-xs mt-0.5 truncate" title={reg.collegeName}>
                                {reg.collegeName}
                              </p>
                              <div className="text-slate-500 text-[11px] font-mono flex flex-wrap gap-x-2 mt-1">
                                <span>PRN: <strong className="text-slate-300">{reg.prnRollNo}</strong></span>
                                <span>·</span>
                                <span className="text-slate-400 truncate max-w-[180px]">{reg.email}</span>
                              </div>
                            </div>

                            {/* UTR / Transaction ID */}
                            <div className="bg-[#0B0F19] rounded-lg p-2.5 border border-[#1E293B] flex items-center justify-between font-mono text-xs">
                              <div className="min-w-0 pr-2">
                                <span className="text-[9px] text-slate-400 uppercase block tracking-wider">
                                  Transaction ID / UTR
                                </span>
                                <span className="text-amber-300 font-bold text-xs truncate block select-all">
                                  {reg.transactionId}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  Ref: {reg.bookingId}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(reg.transactionId, reg.id)}
                                className="p-1.5 rounded hover:bg-[#1E293B] text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                                title="Copy Transaction ID"
                              >
                                {copiedId === reg.id ? (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {/* Verification Proofs (Thumbnails with fast click to inspect) */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div
                                onClick={() => openCompareModal(reg)}
                                className="bg-[#080D18] border border-[#1E293B] hover:border-amber-400/50 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer group transition-all"
                              >
                                {reg.paymentScreenshotBase64 ? (
                                  <img
                                    src={reg.paymentScreenshotBase64}
                                    alt="Receipt"
                                    className="w-full h-24 object-contain rounded group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <span className="text-slate-500 text-[10px]">No Receipt</span>
                                )}
                                <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1 group-hover:text-amber-400">
                                  <Receipt className="w-3 h-3 text-amber-400" />
                                  <span>UPI Receipt</span>
                                </span>
                              </div>

                              <div
                                onClick={() => openCompareModal(reg)}
                                className="bg-[#080D18] border border-[#1E293B] hover:border-indigo-400/50 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer group transition-all"
                              >
                                {reg.idProofBase64 ? (
                                  <img
                                    src={reg.idProofBase64}
                                    alt="College ID"
                                    className="w-full h-24 object-contain rounded group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <span className="text-slate-500 text-[10px]">No ID Attached</span>
                                )}
                                <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-400">
                                  <UserCheck className="w-3 h-3 text-indigo-400" />
                                  <span>College ID</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-4 border-t border-[#1E293B] mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openCompareModal(reg)}
                                className="flex-1 bg-[#182337] hover:bg-[#22314d] border border-[#2A374D] text-white text-xs font-mono py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Inspect & Compare</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttendee(reg.id, reg.fullName)}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/70 border border-[#233147] hover:border-red-900 rounded-lg transition-colors cursor-pointer"
                                title={`Delete registration for ${reg.fullName}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {isPending && (
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  disabled={approvingId === reg.id}
                                  onClick={() => handleApproveTransaction(reg.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  {approvingId === reg.id ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>Approving…</span>
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Approve Pass</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectTransaction(reg.id)}
                                  className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {isApproved && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isSendingEmail}
                                  onClick={() => handleSendTicketEmail(reg)}
                                  className="flex-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 py-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Email Pass</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetSurveillance(reg.id)}
                                  className="px-3 py-2 rounded-lg bg-[#0B0F19] border border-[#233147] text-slate-400 hover:text-amber-400 text-xs font-mono cursor-pointer"
                                >
                                  Revert
                                </button>
                              </div>
                            )}

                            {isRejected && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isSendingEmail}
                                  onClick={() => handleSendRejectionEmail(reg)}
                                  className="flex-1 bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 py-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Mail className="w-3.5 h-3.5 text-red-400" />
                                  <span>Email Rejection</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={approvingId === reg.id}
                                  onClick={() => handleApproveTransaction(reg.id)}
                                  className="px-3 py-2 rounded-lg bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono hover:bg-emerald-900 cursor-pointer"
                                >
                                  {approvingId === reg.id ? '…' : 'Re-approve'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
            /* Registrations Table */
            <div className="bg-[#131D2E] border border-[#233147] rounded-xl overflow-hidden shadow-xl">
              {/* Mobile swipe hint banner */}
              <div className="md:hidden px-4 py-2 bg-[#0E1624] text-[10px] font-mono text-slate-400 flex items-center justify-between border-b border-[#233147]">
                <span>← Swipe table horizontally to view all fields & actions →</span>
                <span className="text-amber-400 font-bold">{filteredRegistrations.length} Records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-xs font-mono">
                  <thead className="bg-[#182337] text-slate-300 uppercase tracking-wider text-[11px] border-b border-[#233147]">
                    <tr>
                      <th className="py-3 px-4">Transaction ID / UTR</th>
                      <th className="py-3 px-4">Student & College</th>
                      <th className="py-3 px-4">Verification Proofs</th>
                      <th className="py-3 px-4">Tier & Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No student registrations match your filter or search query.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map(reg => {
                        const isPending = reg.status === 'UNDER_SURVEILLANCE';
                        const isApproved = reg.status === 'APPROVED';
                        const isRejected = reg.status === 'REJECTED';

                        return (
                          <tr key={reg.id} className="hover:bg-[#182337]/60 transition-colors">
                            {/* Transaction ID */}
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-[#0B0F19] px-2 py-1 rounded border border-[#2A374D] text-amber-300 select-all">
                                  {reg.transactionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(reg.transactionId, reg.id)}
                                  className="text-slate-400 hover:text-white"
                                  title="Copy Transaction ID"
                                >
                                  {copiedId === reg.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-1">
                                Ref: {reg.bookingId}
                              </span>
                            </td>

                            {/* Student & College */}
                            <td className="py-3.5 px-4">
                              <div className="font-sans font-semibold text-white text-sm">
                                {reg.fullName}
                              </div>
                              <div className="text-slate-400 text-[11px] truncate max-w-xs">
                                {reg.collegeName}
                              </div>
                              <div className="text-slate-500 text-[10px]">
                                PRN: <span className="text-slate-300">{reg.prnRollNo}</span> · {reg.email}
                              </div>
                            </td>

                            {/* Verification Proofs (Thumbnails) */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                {/* UPI Receipt Thumbnail */}
                                {reg.paymentScreenshotBase64 ? (
                                  <div
                                    onClick={() => openCompareModal(reg)}
                                    className="group relative cursor-pointer"
                                    title="Click to compare payment screenshot"
                                  >
                                    <img
                                      src={reg.paymentScreenshotBase64}
                                      alt="Payment receipt thumbnail"
                                      className="w-11 h-11 object-cover rounded-lg border-2 border-emerald-500/50 group-hover:border-emerald-400 transition-all shadow"
                                    />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-emerald-300 text-center rounded-b-lg font-bold block">
                                      Receipt
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500 border border-dashed border-[#243044] px-1.5 py-1 rounded">
                                    No Receipt
                                  </span>
                                )}

                                {/* Student ID Card Thumbnail */}
                                {reg.idProofBase64 ? (
                                  <div
                                    onClick={() => openCompareModal(reg)}
                                    className="group relative cursor-pointer"
                                    title="Click to compare college ID card"
                                  >
                                    <img
                                      src={reg.idProofBase64}
                                      alt="College ID thumbnail"
                                      className="w-11 h-11 object-cover rounded-lg border-2 border-indigo-500/50 group-hover:border-indigo-400 transition-all shadow"
                                    />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-indigo-300 text-center rounded-b-lg font-bold block">
                                      ID Card
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500 border border-dashed border-[#243044] px-1.5 py-1 rounded">
                                    No ID
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Tier & Amount */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-emerald-400 text-sm">₹{reg.amount}</span>
                              <span className="text-slate-400 text-[10px] block">{reg.ticketTier}</span>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              {isPending && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-600/70 text-amber-300 text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                  UNDER SURVEILLANCE
                                </span>
                              )}
                              {isApproved && (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-[10px] font-bold">
                                    <CheckCircle2 className="w-3 h-3" />
                                    APPROVED
                                  </span>
                                  {reg.ticketCode && (
                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                      Pass: {reg.ticketCode}
                                    </span>
                                  )}
                                  {reg.checkedIn && (
                                    <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-purple-950/80 border border-purple-600/70 text-purple-300 px-1.5 py-0.5 rounded">
                                      ✓ Checked In
                                    </span>
                                  )}
                                </div>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/70 border border-red-600/70 text-red-300 text-[10px] font-bold">
                                  <X className="w-3 h-3" />
                                  REJECTED
                                </span>
                              )}
                            </td>

                            {/* Submission Time */}
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {new Date(reg.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                              ,{' '}
                              {new Date(reg.createdAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      disabled={approvingId === reg.id}
                                      onClick={() => handleApproveTransaction(reg.id)}
                                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold px-2.5 py-1.5 rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                                      title="Approve transaction and dispatch official ticket pass directly to student"
                                    >
                                      {approvingId === reg.id ? (
                                        <>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                          <span>Approving & Sending…</span>
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-3 h-3" />
                                          <span>Approve</span>
                                        </>
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectTransaction(reg.id)}
                                      className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 px-2 py-1.5 rounded text-[11px] transition-colors cursor-pointer"
                                      title="Reject transaction"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isSendingEmail}
                                      onClick={() => handleSendTicketEmail(reg)}
                                      className="bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 px-2 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`Email ticket pass directly to ${reg.email}`}
                                    >
                                      <Mail className="w-3 h-3 text-indigo-400" />
                                      <span>Email Pass</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetSurveillance(reg.id)}
                                      className="text-slate-400 hover:text-amber-400 text-[10px] underline ml-1 cursor-pointer"
                                      title="Revert back to Under Surveillance"
                                    >
                                      Revert
                                    </button>
                                  </div>
                                )}

                                {isRejected && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isSendingEmail}
                                      onClick={() => handleSendRejectionEmail(reg)}
                                      className="bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-300 px-2 py-1.5 rounded text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`Email rejection notice to ${reg.email}`}
                                    >
                                      <Mail className="w-3 h-3 text-red-400" />
                                      <span>Email Rejection</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={approvingId === reg.id}
                                      onClick={() => handleApproveTransaction(reg.id)}
                                      className="bg-emerald-950 border border-emerald-700 text-emerald-300 px-2 py-1.5 rounded text-[10px] hover:bg-emerald-900 cursor-pointer"
                                    >
                                      {approvingId === reg.id ? 'Approving…' : 'Re-approve'}
                                    </button>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openCompareModal(reg)}
                                  className="text-slate-300 hover:text-white px-2.5 py-1.5 rounded bg-[#0B0F19] hover:bg-[#1A2538] border border-[#243044] text-[11px] font-semibold"
                                  title="Compare payment receipt and college ID side-by-side"
                                >
                                  Compare
                                </button>

                                {/* Delete button for individual student */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAttendee(reg.id, reg.fullName)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/70 border border-transparent hover:border-red-900 rounded transition-colors cursor-pointer"
                                  title={`Delete registration for ${reg.fullName}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB: SPONSOR APPLICATIONS & PROPOSALS
        ───────────────────────────────────────────────────────────── */}
        {activeAdminTab === 'sponsors' && (() => {
          const filteredSponsors = sponsors.filter(s => {
            const matchesStatus = sponsorStatusFilter === 'ALL' || s.status === sponsorStatusFilter;
            const q = sponsorSearch.toLowerCase().trim();
            const matchesQuery =
              !q ||
              s.company.toLowerCase().includes(q) ||
              s.contactName.toLowerCase().includes(q) ||
              s.email.toLowerCase().includes(q) ||
              s.phone.toLowerCase().includes(q) ||
              s.tier.toLowerCase().includes(q) ||
              s.industry.toLowerCase().includes(q);
            return matchesStatus && matchesQuery;
          });

          const pendingSponsors = sponsors.filter(s => s.status === 'PENDING').length;
          const contactedSponsors = sponsors.filter(s => s.status === 'CONTACTED').length;
          const confirmedSponsors = sponsors.filter(s => s.status === 'CONFIRMED').length;

          return (
            <section className="space-y-6 animate-fade-in font-sans">
              {/* Telemetry Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">New Inquiries</span>
                    <strong className="text-2xl font-bold text-amber-400 mt-1 block">
                      {pendingSponsors}
                    </strong>
                    <span className="text-[10px] text-slate-500">Awaiting contact</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Store className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">In Discussion</span>
                    <strong className="text-2xl font-bold text-cyan-400 mt-1 block">
                      {contactedSponsors}
                    </strong>
                    <span className="text-[10px] text-slate-500">Contacted sponsors</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Confirmed Grid</span>
                    <strong className="text-2xl font-bold text-emerald-400 mt-1 block">
                      {confirmedSponsors}
                    </strong>
                    <span className="text-[10px] text-slate-500">Locked partners</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Total Proposals</span>
                    <strong className="text-2xl font-bold text-white mt-1 block">
                      {sponsors.length}
                    </strong>
                    <span className="text-[10px] text-slate-500">Applications received</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportSponsorsToCSV(sponsors)}
                    className="bg-[#1E293B] hover:bg-[#2C3B52] border border-[#334155] text-xs px-3 py-2 rounded text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={sponsorSearch}
                    onChange={e => setSponsorSearch(e.target.value)}
                    placeholder="Search by Company, Contact Person, Email, Phone, or Tier…"
                    className="w-full bg-[#0B0F19] border border-[#243044] text-white font-mono text-xs pl-10 pr-8 py-2.5 rounded-lg outline-none focus:border-amber-400"
                  />
                  {sponsorSearch && (
                    <button
                      type="button"
                      onClick={() => setSponsorSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                  {(['ALL', 'PENDING', 'CONTACTED', 'CONFIRMED', 'DECLINED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSponsorStatusFilter(st)}
                      className={`text-xs font-mono px-3 py-2 rounded border transition-colors shrink-0 cursor-pointer ${
                        sponsorStatusFilter === st
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? `All (${sponsors.length})` : (st || '').replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sponsors Cards / Grid View */}
              {filteredSponsors.length === 0 ? (
                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
                  No sponsor proposals match your query.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSponsors.map(spn => {
                    const cleanPhone = (spn.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={spn.id}
                        className="bg-[#131D2E] border border-[#233147] hover:border-amber-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Tier badge & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                              {spn.tier || 'Sponsor'} · {spn.price || ''}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                                spn.status === 'CONFIRMED'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : spn.status === 'CONTACTED'
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                  : spn.status === 'PENDING'
                                  ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                                  : 'bg-red-950 text-red-300 border-red-700'
                              }`}
                            >
                              {(spn.status || 'PENDING').replace('_', ' ')}
                            </span>
                          </div>

                          {/* Company & Contact Info */}
                          <div>
                            <h4 className="text-white font-bold text-base leading-tight">
                              {spn.company}
                            </h4>
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                              {spn.industry}
                            </span>
                            <div className="text-slate-300 text-xs mt-1.5 font-medium flex items-center gap-1.5">
                              <User size={13} className="text-amber-400 shrink-0" />
                              <span>{spn.contactName}</span>
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5 font-mono">
                              <Mail size={12} className="text-slate-500 shrink-0" />
                              <span className="truncate">{spn.email}</span>
                            </div>
                            <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5 font-mono">
                              <PhoneCall size={12} className="text-slate-500 shrink-0" />
                              <span>{spn.phone}</span>
                            </div>
                          </div>

                          {/* Company Photo / Logo Preview */}
                          {spn.companyPhotoBase64 && (
                            <div
                              onClick={() =>
                                setLightboxImage({
                                  src: spn.companyPhotoBase64!,
                                  title: `${spn.company} - Showroom / Stall Photo`,
                                })
                              }
                              className="bg-[#080D18] border border-[#1E293B] hover:border-amber-400/50 rounded-lg p-2 flex items-center gap-3 cursor-pointer group transition-all"
                            >
                              <img
                                src={spn.companyPhotoBase64}
                                alt="Company stall preview"
                                className="w-16 h-16 object-contain rounded bg-black group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <span className="text-xs text-white font-medium block group-hover:text-amber-400">
                                  View Showroom / Stall Photo
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Click to enlarge &amp; inspect
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Showcase Tags */}
                          {spn.showcaseInterests && spn.showcaseInterests.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                                Requested Features &amp; Showcase:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {spn.showcaseInterests.map(interest => (
                                  <span
                                    key={interest}
                                    className="text-[10px] bg-[#0B0F19] border border-[#243044] text-slate-300 px-2 py-0.5 rounded font-mono"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Proposal Details / Custom Showcase */}
                          {(spn.customShowcase || spn.details) && (
                            <div className="bg-[#090E17] border border-[#1E293B] rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                              {spn.customShowcase && (
                                <p className="mb-1">
                                  <strong className="text-amber-300 font-mono text-[10px] uppercase block">
                                    Showcase Goals:
                                  </strong>
                                  {spn.customShowcase}
                                </p>
                              )}
                              {spn.details && (
                                <p className="text-slate-400 text-[11px]">
                                  {spn.details}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-4 border-t border-[#1E293B] mt-4 space-y-2">
                          <div className="flex items-center gap-1.5">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${spn.contactName}, thank you for applying to sponsor AWS Student Community Day 2026 (${spn.tier})!`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <PhoneCall size={12} />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <a
                              href={`mailto:${spn.email}?subject=${encodeURIComponent(
                                `AWS Student Community Day 2026: ${spn.tier} Proposal`
                              )}`}
                              className="flex-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Mail size={12} />
                              <span>Email</span>
                            </a>
                            {spn.website && (
                              <a
                                href={spn.website}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-[#0B0F19] hover:bg-slate-800 border border-[#233147] text-slate-300 rounded-lg"
                                title="Open Website"
                              >
                                <Globe size={14} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete sponsor application for ${spn.company}?`)) {
                                  deleteSponsorApplication(spn.id);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete application"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Status Progression Buttons */}
                          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                            <button
                              type="button"
                              onClick={() => updateSponsorStatus(spn.id, 'PENDING')}
                              className={`py-1 rounded border cursor-pointer ${
                                spn.status === 'PENDING'
                                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Pending
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSponsorStatus(spn.id, 'CONTACTED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spn.status === 'CONTACTED'
                                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Contacted
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSponsorStatus(spn.id, 'CONFIRMED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spn.status === 'CONFIRMED'
                                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSponsorStatus(spn.id, 'DECLINED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spn.status === 'DECLINED'
                                  ? 'bg-red-950 text-red-300 font-bold border-red-700'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })()}

        {/* ─────────────────────────────────────────────────────────────
            TAB: SPEAKER PROPOSALS & CFP PIPELINE
        ───────────────────────────────────────────────────────────── */}
        {activeAdminTab === 'speakers' && (() => {
          const filteredSpeakers = speakers.filter(spk => {
            const matchesStatus = speakerStatusFilter === 'ALL' || spk.status === speakerStatusFilter;
            const q = speakerSearch.toLowerCase().trim();
            const matchesQuery =
              !q ||
              spk.fullName.toLowerCase().includes(q) ||
              spk.talkTitle.toLowerCase().includes(q) ||
              spk.organization.toLowerCase().includes(q) ||
              spk.email.toLowerCase().includes(q) ||
              (spk.skills || []).some(s => s.toLowerCase().includes(q));
            return matchesStatus && matchesQuery;
          });

          const inReviewSpeakers = speakers.filter(s => s.status === 'UNDER_REVIEW').length;
          const shortlistedSpeakers = speakers.filter(s => s.status === 'SHORTLISTED').length;
          const acceptedSpeakers = speakers.filter(s => s.status === 'ACCEPTED').length;

          return (
            <section className="space-y-6 animate-fade-in font-sans">
              {/* Telemetry Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">In Review</span>
                    <strong className="text-2xl font-bold text-indigo-400 mt-1 block">
                      {inReviewSpeakers}
                    </strong>
                    <span className="text-[10px] text-slate-500">Awaiting committee</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Mic className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Shortlisted</span>
                    <strong className="text-2xl font-bold text-amber-400 mt-1 block">
                      {shortlistedSpeakers}
                    </strong>
                    <span className="text-[10px] text-slate-500">Round 2 evaluation</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Accepted Grid</span>
                    <strong className="text-2xl font-bold text-emerald-400 mt-1 block">
                      {acceptedSpeakers}
                    </strong>
                    <span className="text-[10px] text-slate-500">Confirmed stage slots</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Total Proposals</span>
                    <strong className="text-2xl font-bold text-white mt-1 block">
                      {speakers.length}
                    </strong>
                    <span className="text-[10px] text-slate-500">Submissions received</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportSpeakersToCSV(speakers)}
                    className="bg-[#1E293B] hover:bg-[#2C3B52] border border-[#334155] text-xs px-3 py-2 rounded text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={speakerSearch}
                    onChange={e => setSpeakerSearch(e.target.value)}
                    placeholder="Search by Speaker Name, Talk Title, Organization, Email, or Skill…"
                    className="w-full bg-[#0B0F19] border border-[#243044] text-white font-mono text-xs pl-10 pr-8 py-2.5 rounded-lg outline-none focus:border-indigo-400"
                  />
                  {speakerSearch && (
                    <button
                      type="button"
                      onClick={() => setSpeakerSearch('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                  {(['ALL', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'DECLINED'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSpeakerStatusFilter(st)}
                      className={`text-xs font-mono px-3 py-2 rounded border transition-colors shrink-0 cursor-pointer ${
                        speakerStatusFilter === st
                          ? 'bg-indigo-600 text-white font-bold border-indigo-400'
                          : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? `All (${speakers.length})` : (st || '').replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speakers Cards / Grid View */}
              {filteredSpeakers.length === 0 ? (
                <div className="bg-[#131D2E] border border-[#233147] rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
                  No speaker proposals match your query.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredSpeakers.map(spk => {
                    const cleanPhone = (spk.phone || '').replace(/[^0-9]/g, '');
                    return (
                      <div
                        key={spk.id}
                        className="bg-[#131D2E] border border-[#233147] hover:border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all"
                      >
                        <div className="space-y-3">
                          {/* Top Row: Format & Status */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-700/60 px-2 py-0.5 rounded">
                              {spk.sessionFormat || 'Technical Session'}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                                spk.status === 'ACCEPTED'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : spk.status === 'SHORTLISTED'
                                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                                  : spk.status === 'UNDER_REVIEW'
                                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700 animate-pulse'
                                  : 'bg-red-950 text-red-300 border-red-700'
                              }`}
                            >
                              {(spk.status || 'UNDER_REVIEW').replace('_', ' ')}
                            </span>
                          </div>

                          {/* Speaker Profile Info */}
                          <div className="flex items-start gap-3">
                            {spk.speakerPhotoBase64 ? (
                              <img
                                src={spk.speakerPhotoBase64}
                                alt={spk.fullName || 'Speaker'}
                                onClick={() =>
                                  setLightboxImage({
                                    src: spk.speakerPhotoBase64!,
                                    title: `${spk.fullName || 'Speaker'} - Speaker Profile`,
                                  })
                                }
                                className="w-14 h-14 object-cover rounded-xl border border-white/20 shrink-0 cursor-zoom-in"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg shrink-0">
                                {(spk.fullName || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-bold text-base leading-tight truncate">
                                {spk.fullName || 'Anonymous Speaker'}
                              </h4>
                              <p className="text-slate-300 text-xs mt-0.5 leading-snug">
                                {spk.designation}
                              </p>
                              <span className="text-[11px] font-mono text-slate-400 block truncate">
                                {spk.organization}
                              </span>
                            </div>
                          </div>

                          {/* Talk Title */}
                          <div className="bg-[#0B0F19] rounded-lg p-3 border border-[#1E293B]">
                            <span className="text-[9px] uppercase font-mono text-aws-orange block font-bold mb-1">
                              Proposed Session Title:
                            </span>
                            <h5 className="text-white font-semibold text-sm leading-snug">
                              {spk.talkTitle}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400 block mt-1">
                              Level: {spk.audienceLevel}
                            </span>
                          </div>

                          {/* Skills & Custom Skill Tags */}
                          {spk.skills && spk.skills.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                                Technical Skills:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {spk.skills.map(sk => (
                                  <span
                                    key={sk}
                                    className="text-[10px] bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 px-2 py-0.5 rounded font-mono font-medium"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AWS Certificate / Knowledge Proof Preview */}
                          {(spk.certificateProofBase64 || spk.certificateLink) && (
                            <div className="bg-[#080D18] border border-[#1E293B] rounded-lg p-2.5 space-y-1.5">
                              <span className="text-[10px] uppercase font-mono text-amber-400 font-bold flex items-center gap-1">
                                <Award size={12} />
                                <span>AWS Knowledge Proof / Credential:</span>
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                {spk.certificateProofBase64 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLightboxImage({
                                        src: spk.certificateProofBase64!,
                                        title: `${spk.fullName} - AWS Certificate Proof`,
                                      })
                                    }
                                    className="text-xs font-mono text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Inspect Certificate Image ↗</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-mono">No image attached</span>
                                )}

                                {spk.certificateLink && (
                                  <a
                                    href={spk.certificateLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Verify Link ↗</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Session Abstract */}
                          {spk.abstract && (
                            <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
                              {spk.abstract}
                            </p>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-4 border-t border-[#1E293B] mt-4 space-y-2">
                          <div className="flex items-center gap-1.5">
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `Hello ${spk.fullName}, regarding your session proposal '${spk.talkTitle}' for AWS Student Community Day 2026...`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                              >
                                <PhoneCall size={12} />
                                <span>WhatsApp</span>
                              </a>
                            )}
                            <a
                              href={`mailto:${spk.email}?subject=${encodeURIComponent(
                                `AWS Student Community Day 2026: Speaker Proposal '${spk.talkTitle}'`
                              )}`}
                              className="flex-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <Mail size={12} />
                              <span>Email</span>
                            </a>
                            {spk.linkedin && (
                              <a
                                href={spk.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-[#0B0F19] hover:bg-slate-800 border border-[#233147] text-blue-400 rounded-lg"
                                title="LinkedIn Profile"
                              >
                                <Linkedin size={14} />
                              </a>
                            )}
                            {spk.github && (
                              <a
                                href={spk.github}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 bg-[#0B0F19] hover:bg-slate-800 border border-[#233147] text-slate-300 rounded-lg"
                                title="GitHub Profile"
                              >
                                <Github size={14} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete speaker proposal for ${spk.fullName}?`)) {
                                  deleteSpeakerApplication(spk.id);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-900 rounded-lg transition-colors cursor-pointer"
                              title="Delete proposal"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Status Progression Buttons */}
                          <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                            <button
                              type="button"
                              onClick={() => updateSpeakerStatus(spk.id, 'UNDER_REVIEW')}
                              className={`py-1 rounded border cursor-pointer ${
                                spk.status === 'UNDER_REVIEW'
                                  ? 'bg-indigo-600 text-white font-bold border-indigo-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSpeakerStatus(spk.id, 'SHORTLISTED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spk.status === 'SHORTLISTED'
                                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSpeakerStatus(spk.id, 'ACCEPTED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spk.status === 'ACCEPTED'
                                  ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => updateSpeakerStatus(spk.id, 'DECLINED')}
                              className={`py-1 rounded border cursor-pointer ${
                                spk.status === 'DECLINED'
                                  ? 'bg-red-950 text-red-300 font-bold border-red-700'
                                  : 'bg-[#0B0F19] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })()}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: TICKET TIERS & SCHEDULES (ORIGINAL ADMIN SETTINGS)
        ───────────────────────────────────────────────────────────── */}
        {activeAdminTab === 'tiers' && (
          <div className="space-y-6 animate-fade-in">
            {saveSuccess && (
              <div className="bg-emerald-950 border border-emerald-600 text-emerald-200 px-4 py-3 rounded flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2 text-sm font-mono">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Configurations updated successfully! Live sections are now reflecting these settings.</span>
                </div>
              </div>
            )}

            {/* Quick Presets */}
            <section className="bg-[#131D2E] border border-[#233147] rounded-lg p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-white uppercase font-mono tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Quick Stage Presets
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    One-click phase activation (One tier Open, one Sold Out, one Coming Soon):
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        tiers: {
                          ...prev.tiers,
                          super_early_bird: { ...prev.tiers.super_early_bird, mode: 'manual', manualStatus: 'sold_out', price: 149 },
                          early_bird: { ...prev.tiers.early_bird, mode: 'manual', manualStatus: 'open', price: 249 },
                          regular: { ...prev.tiers.regular, mode: 'manual', manualStatus: 'coming_soon', price: 349 },
                        },
                      }));
                    }}
                    className="bg-[#1E293B] hover:bg-amber-500/20 hover:border-amber-500/60 border border-[#334155] text-xs font-mono px-3 py-2 rounded text-slate-200"
                  >
                    Phase 1: <strong className="text-amber-400">Early Bird Open (₹249)</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConfig(prev => ({
                        ...prev,
                        tiers: {
                          ...prev.tiers,
                          super_early_bird: { ...prev.tiers.super_early_bird, mode: 'manual', manualStatus: 'sold_out', price: 149 },
                          early_bird: { ...prev.tiers.early_bird, mode: 'manual', manualStatus: 'sold_out', price: 249 },
                          regular: { ...prev.tiers.regular, mode: 'manual', manualStatus: 'open', price: 349 },
                        },
                      }));
                    }}
                    className="bg-[#1E293B] hover:bg-emerald-500/20 hover:border-emerald-500/60 border border-[#334155] text-xs font-mono px-3 py-2 rounded text-slate-200"
                  >
                    Phase 2: <strong className="text-emerald-400">Regular Open (₹349)</strong>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="bg-[#1E293B] hover:bg-red-500/20 hover:border-red-500/60 border border-[#334155] text-xs font-mono px-3 py-2 rounded text-red-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* Individual Tier Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {tierKeys.map((key, index) => {
                const tier = config.tiers[key];
                const effective = getTierEffectiveStatus(tier, currentTime);

                return (
                  <div
                    key={key}
                    className="bg-[#131D2E] border border-[#233147] rounded-lg shadow-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="bg-[#182337] border-b border-[#233147] p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                          Section #{index + 1}
                        </span>
                        <h3 className="font-bold text-white text-base mt-0.5">{tier.label}</h3>
                      </div>
                      <div
                        className={`text-xs font-bold uppercase font-mono ${
                          effective.status === 'open'
                            ? 'text-emerald-400'
                            : effective.status === 'sold_out'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {effective.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="p-5 space-y-4 flex-1">
                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                          Amount (INR ₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={tier.price}
                            onChange={e => updateTier(key, { price: Number(e.target.value) || 0 })}
                            className="w-full bg-[#0B0F19] border border-[#2A374D] text-white font-mono text-sm pl-7 pr-3 py-2 rounded outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-mono uppercase text-slate-300">
                            Available Seats (Capacity)
                          </label>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            {tier.remaining ?? 0} Seats
                          </span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          value={tier.remaining ?? 0}
                          onChange={e => updateTier(key, { remaining: Math.max(0, Number(e.target.value) || 0) })}
                          placeholder="e.g. 150"
                          className="w-full bg-[#0B0F19] border border-[#2A374D] text-white font-mono text-sm px-3 py-2 rounded outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                          Select State (Immediate)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => updateTier(key, { manualStatus: 'open', mode: 'manual', remaining: (tier.remaining && tier.remaining > 0) ? tier.remaining : 100 })}
                            className={`p-2 rounded text-xs font-mono font-bold uppercase border ${
                              tier.manualStatus === 'open'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : 'bg-[#0B0F19] border-[#2A374D] text-slate-400'
                            }`}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTier(key, { manualStatus: 'sold_out', mode: 'manual', remaining: 0 })}
                            className={`p-2 rounded text-xs font-mono font-bold uppercase border ${
                              tier.manualStatus === 'sold_out'
                                ? 'bg-red-500/20 border-red-400 text-red-300'
                                : 'bg-[#0B0F19] border-[#2A374D] text-slate-400'
                            }`}
                          >
                            Sold Out
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTier(key, { manualStatus: 'coming_soon', mode: 'manual' })}
                            className={`p-2 rounded text-xs font-mono font-bold uppercase border ${
                              tier.manualStatus === 'coming_soon'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                : 'bg-[#0B0F19] border-[#2A374D] text-slate-400'
                            }`}
                          >
                            Coming Soon
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-right pt-4">
              <button
                type="button"
                onClick={handleSaveTiers}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase px-6 py-3 rounded inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Tier Configurations
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: ENTRY GATE SCANNER (STRICT 1-TIME SCANNING)
        ───────────────────────────────────────────────────────────── */}
        {activeAdminTab === 'scanner' && (
          <TicketScanner
            registrations={registrations}
            onCheckInChange={() => setRegistrations(loadRegistrations())}
          />
        )}

        {/* High-Efficiency Large Side-by-Side Verification & Comparison Modal */}
        {selectedAttendee && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto">
            <div className="bg-[#0B111E] border border-[#233147] rounded-2xl w-full max-w-[98vw] 2xl:max-w-7xl max-h-[96vh] p-3.5 sm:p-5 lg:p-6 shadow-2xl flex flex-col space-y-3.5 my-auto overflow-y-auto animate-scale-up">
              {/* Modal Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#233147]">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-indigo-950/80 text-indigo-400 border border-indigo-700/60 px-2 py-0.5 rounded font-bold">
                      Interactive Proof Inspection
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        selectedAttendee.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : selectedAttendee.status === 'UNDER_SURVEILLANCE'
                          ? 'bg-amber-950 text-amber-400 border border-amber-700'
                          : 'bg-red-950 text-red-400 border border-red-700'
                      }`}
                    >
                      {selectedAttendee.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-[#121A2A] px-2 py-0.5 rounded border border-[#1E293B]">
                      Pass: ₹{selectedAttendee.amount} ({selectedAttendee.ticketTier})
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mt-1 tracking-tight truncate">
                    {selectedAttendee.fullName}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-mono flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span>Ref: <strong className="text-cyan-400">{selectedAttendee.bookingId}</strong></span>
                    <span>·</span>
                    <span>PRN: <strong className="text-amber-300">{selectedAttendee.prnRollNo}</strong></span>
                    <span>·</span>
                    <span className="truncate max-w-xs">{selectedAttendee.collegeName}</span>
                    <span>·</span>
                    <span className="text-slate-300">{selectedAttendee.email}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Delete Student Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteAttendee(selectedAttendee.id, selectedAttendee.fullName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-mono transition-colors cursor-pointer"
                    title="Permanently delete this registration"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAttendee(null)}
                    className="p-1.5 hover:bg-[#1E293B] rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Close comparison modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mobile / Tablet Segmented View Switcher */}
              <div className="flex items-center justify-between gap-2 bg-[#060A13] p-1.5 rounded-xl border border-[#1E293B] text-xs font-mono">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 px-2 hidden sm:inline">View Mode:</span>
                  <button
                    type="button"
                    onClick={() => setMobileCompareTab('both')}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                      mobileCompareTab === 'both'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⇄ Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileCompareTab('id')}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                      mobileCompareTab === 'id'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🪪 College ID Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileCompareTab('receipt')}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer ${
                      mobileCompareTab === 'receipt'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📸 UPI Receipt Only
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 hidden md:inline">
                  Click images to open Full-Screen Lightbox · Use Zoom & Rotate to verify UTR
                </span>
              </div>

              {/* Side-by-Side Comparison Columns (Large High-Resolution Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 font-mono text-xs">
                {/* ─────────────────────────────────────────────────────────────
                    LEFT COLUMN: STUDENT COLLEGE ID / ALLOTMENT PROOF
                ───────────────────────────────────────────────────────────── */}
                <div
                  className={`bg-[#070D18] border border-[#233147] rounded-xl p-3 sm:p-4 space-y-3 flex flex-col justify-between ${
                    mobileCompareTab === 'receipt' ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header & Image Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                      <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                        <span>🪪 Student College ID Card</span>
                      </span>

                      {/* Interactive Zoom & Rotate Controls */}
                      <div className="flex items-center gap-1 bg-[#0F172A] border border-[#1E293B] rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setZoomIdCard(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomIdCard(1)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 hover:text-white cursor-pointer"
                          title="Reset Zoom to 100%"
                        >
                          {Math.round(zoomIdCard * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomIdCard(prev => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotIdCard(prev => (prev + 90) % 360)}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
                          title="Rotate 90° Clockwise"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        {selectedAttendee.idProofBase64 && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                src: selectedAttendee.idProofBase64!,
                                title: `${selectedAttendee.fullName} - College ID Card`,
                              })
                            }
                            className="p-1 hover:bg-[#1E293B] rounded text-indigo-400 hover:text-white transition-colors cursor-pointer"
                            title="Open Fullscreen Lightbox"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {selectedAttendee.idProofBase64 && (
                          <a
                            href={selectedAttendee.idProofBase64}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 text-[10px] text-indigo-400 hover:text-indigo-200 hover:underline border-l border-[#1E293B] ml-1 flex items-center gap-0.5"
                            title="Open Original Image in New Tab"
                          >
                            <span>Tab ↗</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* ID Card Image Preview Viewport (Significantly enlarged) */}
                    <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#03060E] h-[380px] sm:h-[460px] md:h-[520px] lg:h-[600px] xl:h-[640px] flex items-center justify-center p-2 relative group select-none">
                      {selectedAttendee.idProofBase64 ? (
                        <div className="w-full h-full flex items-center justify-center overflow-auto cursor-zoom-in">
                          <img
                            src={selectedAttendee.idProofBase64}
                            alt="Student College ID Card"
                            style={{
                              transform: `scale(${zoomIdCard}) rotate(${rotIdCard}deg)`,
                              transition: 'transform 0.15s ease-out',
                            }}
                            onClick={() =>
                              setLightboxImage({
                                src: selectedAttendee.idProofBase64!,
                                title: `${selectedAttendee.fullName} - College ID Card`,
                              })
                            }
                            className="max-h-full max-w-full object-contain mx-auto rounded shadow-2xl transition-all"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-500">
                          <span className="text-3xl block mb-2">🪪</span>
                          <span className="text-sm">No college ID image attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Details Summary */}
                  <div className="bg-[#0D1525] rounded-xl p-3.5 space-y-2 text-xs border border-[#1E293B]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Student Name:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-white font-sans text-sm">{selectedAttendee.fullName}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedAttendee.fullName, `name-${selectedAttendee.id}`)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title="Copy Student Name"
                        >
                          {copiedId === `name-${selectedAttendee.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">PRN / Roll No:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-amber-300 font-mono text-sm">{selectedAttendee.prnRollNo}</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(selectedAttendee.prnRollNo, `prn-${selectedAttendee.id}`)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                          title="Copy PRN"
                        >
                          {copiedId === `prn-${selectedAttendee.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-400 shrink-0">College:</span>
                      <span className="text-slate-200 text-right font-medium">
                        {selectedAttendee.collegeName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Branch & Year:</span>
                      <span className="text-cyan-300 font-semibold">
                        {selectedAttendee.branch} ({selectedAttendee.academicYear})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1E293B] text-[11px]">
                      <span className="text-slate-400">Phone: {selectedAttendee.phone || 'N/A'}</span>
                      <span className="text-slate-400 truncate max-w-[200px]">{selectedAttendee.email}</span>
                    </div>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    RIGHT COLUMN: UPI PAYMENT RECEIPT / SCREENSHOT
                ───────────────────────────────────────────────────────────── */}
                <div
                  className={`bg-[#070D18] border border-[#233147] rounded-xl p-3 sm:p-4 space-y-3 flex flex-col justify-between ${
                    mobileCompareTab === 'id' ? 'hidden md:flex' : 'flex'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header & Image Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                      <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                        <span>📸 UPI Payment Screenshot & UTR</span>
                      </span>

                      {/* Interactive Zoom & Rotate Controls */}
                      <div className="flex items-center gap-1 bg-[#0F172A] border border-[#1E293B] rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => setZoomReceipt(prev => Math.max(0.75, Number((prev - 0.25).toFixed(2))))}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Zoom Out"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomReceipt(1)}
                          className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 hover:text-white cursor-pointer"
                          title="Reset Zoom to 100%"
                        >
                          {Math.round(zoomReceipt * 100)}%
                        </button>
                        <button
                          type="button"
                          onClick={() => setZoomReceipt(prev => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotReceipt(prev => (prev + 90) % 360)}
                          className="p-1 hover:bg-[#1E293B] rounded text-slate-300 hover:text-white transition-colors ml-1 cursor-pointer"
                          title="Rotate 90° Clockwise"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        {selectedAttendee.paymentScreenshotBase64 && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxImage({
                                src: selectedAttendee.paymentScreenshotBase64!,
                                title: `${selectedAttendee.fullName} - UPI Payment Screenshot`,
                              })
                            }
                            className="p-1 hover:bg-[#1E293B] rounded text-emerald-400 hover:text-white transition-colors cursor-pointer"
                            title="Open Fullscreen Lightbox"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {selectedAttendee.paymentScreenshotBase64 && (
                          <a
                            href={selectedAttendee.paymentScreenshotBase64}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 text-[10px] text-emerald-400 hover:text-emerald-200 hover:underline border-l border-[#1E293B] ml-1 flex items-center gap-0.5"
                            title="Open Original Image in New Tab"
                          >
                            <span>Tab ↗</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Payment Screenshot Image Preview Viewport (Significantly enlarged) */}
                    <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#03060E] h-[380px] sm:h-[460px] md:h-[520px] lg:h-[600px] xl:h-[640px] flex items-center justify-center p-2 relative group select-none">
                      {selectedAttendee.paymentScreenshotBase64 ? (
                        <div className="w-full h-full flex items-center justify-center overflow-auto cursor-zoom-in">
                          <img
                            src={selectedAttendee.paymentScreenshotBase64}
                            alt="UPI Payment receipt"
                            style={{
                              transform: `scale(${zoomReceipt}) rotate(${rotReceipt}deg)`,
                              transition: 'transform 0.15s ease-out',
                            }}
                            onClick={() =>
                              setLightboxImage({
                                src: selectedAttendee.paymentScreenshotBase64!,
                                title: `${selectedAttendee.fullName} - UPI Payment Screenshot`,
                              })
                            }
                            className="max-h-full max-w-full object-contain mx-auto rounded shadow-2xl transition-all"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-500">
                          <span className="text-3xl block mb-2">📸</span>
                          <span className="text-sm">No payment screenshot attached</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Transaction Details Summary */}
                  <div className="bg-[#0D1525] rounded-xl p-3.5 space-y-2 text-xs border border-[#1E293B]">
                    {/* Bank UTR / Reference ID in large, prominent copy box */}
                    <div className="flex items-center justify-between p-2.5 bg-[#070D18] border border-amber-500/40 rounded-lg">
                      <div>
                        <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono block">
                          Bank UTR / Transaction ID
                        </span>
                        <strong className="text-sm sm:text-base font-mono text-white tracking-wider select-all">
                          {selectedAttendee.transactionId}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedAttendee.transactionId, `utr-${selectedAttendee.id}`)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow"
                        title="Copy UTR to verify in banking app"
                      >
                        {copiedId === `utr-${selectedAttendee.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UTR</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Amount Paid:</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-emerald-400 text-base font-bold">
                          ₹{selectedAttendee.amount}
                        </strong>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                          {selectedAttendee.ticketTier}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Payee Account:</span>
                      <span className="text-slate-200 font-mono text-[11px]">Bhushan Jadhav (aj6244249-1@okaxis)</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Pass Code:</span>
                      <span className="text-amber-300 font-mono font-bold">
                        {selectedAttendee.ticketCode || 'Auto-generated on approval'}
                      </span>
                    </div>

                    {/* Gate Check-in Status & Unique QR */}
                    {selectedAttendee.status === 'APPROVED' && (
                      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">Gate Entry Status:</span>
                          {selectedAttendee.checkedIn ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold bg-red-950/80 border border-red-800 text-red-300 px-2 py-0.5 rounded uppercase">
                                CHECKED IN (USED)
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  resetTicketCheckIn(selectedAttendee.id);
                                  setRegistrations(loadRegistrations());
                                  setSelectedAttendee(prev => (prev ? { ...prev, checkedIn: false, checkedInAt: undefined } : null));
                                }}
                                className="text-[10px] text-slate-400 hover:text-white underline font-mono cursor-pointer"
                              >
                                Reset Pass
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded uppercase">
                              ACTIVE (UNSCANNED)
                            </span>
                          )}
                        </div>

                        {selectedAttendee.ticketCode && (
                          <div className="bg-white p-1 rounded border border-slate-300 shrink-0 text-center">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=2&data=${encodeURIComponent(
                                `AWS-SCD-2026|${selectedAttendee.ticketCode}|${selectedAttendee.fullName}|${selectedAttendee.bookingId}`
                              )}`}
                              alt="Ticket QR"
                              className="w-11 h-11 object-contain"
                            />
                            <span className="text-[7px] font-mono font-bold text-slate-900 block">
                              {selectedAttendee.ticketCode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedAttendee.rejectionReason && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs font-mono">
                  Rejection note: {selectedAttendee.rejectionReason}
                </div>
              )}

              {/* Action Buttons Footer (Sticky & Accessible) */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#233147] bg-[#0B111E] sticky bottom-0">
                {selectedAttendee.status === 'UNDER_SURVEILLANCE' ? (
                  <>
                    <button
                      type="button"
                      disabled={approvingId === selectedAttendee.id}
                      onClick={() => handleApproveTransaction(selectedAttendee.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors cursor-pointer"
                    >
                      {approvingId === selectedAttendee.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Approving & Emailing Pass…</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Approve & Email Ticket Pass</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRejectTransaction(selectedAttendee.id)}
                      className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 px-5 py-3 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetSurveillance(selectedAttendee.id)}
                    className="flex-1 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-600 text-amber-300 font-bold py-3 px-4 rounded-xl text-xs sm:text-sm font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Reset Status to Under Surveillance
                  </button>
                )}

                {selectedAttendee.status === 'APPROVED' && (
                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendTicketEmail(selectedAttendee)}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Deliver ticket email to student"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? 'Sending…' : 'Email Ticket Pass'}</span>
                  </button>
                )}

                {selectedAttendee.status === 'REJECTED' && (
                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleSendRejectionEmail(selectedAttendee)}
                    className="bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-mono text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Send rejection notification email to student"
                  >
                    <Mail className="w-3.5 h-3.5 text-red-400" />
                    <span>{isSendingEmail ? 'Sending…' : 'Resend Rejection Email'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedAttendee(null)}
                  className="bg-[#1E293B] hover:bg-[#2A374D] text-slate-300 hover:text-white px-5 py-3 rounded-xl text-xs font-mono uppercase transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen High-Resolution Lightbox Inspector */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-60 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between z-10 bg-[#0B101B]/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white text-xs sm:text-sm font-bold font-mono truncate">
                  {lightboxImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={lightboxImage.src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Original ↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs px-3 font-mono cursor-pointer transition-colors"
                >
                  Close [✕]
                </button>
              </div>
            </div>
            <div
              className="max-h-[85vh] max-w-[95vw] flex items-center justify-center mt-12 p-2 overflow-auto"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[82vh] max-w-[94vw] object-contain rounded-xl shadow-2xl border border-white/20"
              />
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            EMAIL DISPATCH SETTINGS MODAL: Configure Direct Gmail & Resend
        ───────────────────────────────────────────────────────────── */}
        {showEmailSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-[#101826] border border-[#23334D] rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl space-y-5 my-8">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Automated Ticket Email Sender
                    </h2>
                    <p className="text-[11px] font-mono text-slate-400">
                      Dispatches official 2:1 passes directly to students upon payment approval
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailSettingsModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E293B] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PATH 1: Direct Gmail Dispatch (Recommended) */}
              <div className="bg-[#0B101B] border border-emerald-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300 font-mono uppercase tracking-wider">
                      Direct Gmail Delivery (Recommended)
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
                    0 DNS / 0 Domains Required
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sends emails directly from your Gmail account to the student's inbox using Google App Passwords.
                </p>

                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-300 block mb-1">
                      Your Gmail Address
                    </label>
                    <input
                      type="email"
                      value={senderGmailUser}
                      onChange={e => setSenderGmailUser(e.target.value)}
                      placeholder="e.g. organizer@gmail.com"
                      className="w-full bg-[#131D2E] border border-[#233147] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-300 block mb-1">
                      Google 16-Character App Password
                    </label>
                    <input
                      type="password"
                      value={senderGmailPass}
                      onChange={e => setSenderGmailPass(e.target.value)}
                      placeholder="e.g. abcd efgh ijkl mnop"
                      className="w-full bg-[#131D2E] border border-[#233147] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-emerald-400"
                    />
                    <div className="mt-1.5 p-2 bg-indigo-950/40 border border-indigo-900/40 rounded text-[10px] text-indigo-300 space-y-0.5 font-mono">
                      <div className="font-bold text-indigo-200">How to get a free Google App Password:</div>
                      <div>1. Go to <span className="underline">myaccount.google.com/security</span></div>
                      <div>2. Turn ON 2-Step Verification</div>
                      <div>3. Search for "App Passwords" → Name it "AWS SCD" → Copy the 16 characters!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PATH 2: Resend API Key */}
              <div className="bg-[#0B101B] border border-[#233147] rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wider">
                    Resend API Key (Optional Alternative)
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Custom domain verification needed for public students
                  </span>
                </div>
                <input
                  type="password"
                  value={senderResendKey}
                  onChange={e => setSenderResendKey(e.target.value)}
                  placeholder="re_..."
                  className="w-full bg-[#131D2E] border border-[#233147] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* TEST EMAIL SECTION */}
              <div className="bg-[#141C2B] border border-[#233147] rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-200 font-mono uppercase block">
                  🧪 Send Live Test Ticket Pass
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailTo}
                    onChange={e => setTestEmailTo(e.target.value)}
                    placeholder="Enter your email to receive a test pass…"
                    className="flex-1 bg-[#0B101B] border border-[#233147] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    disabled={isSendingTestEmail}
                    onClick={handleSendTestEmail}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {isSendingTestEmail ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Test</span>
                      </>
                    )}
                  </button>
                </div>

                {testEmailResult && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-mono ${
                      testEmailResult.startsWith('✓')
                        ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                        : 'bg-red-950/80 border border-red-700/60 text-red-300'
                    }`}
                  >
                    {testEmailResult}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowEmailSettingsModal(false)}
                  className="bg-transparent hover:bg-[#1E293B] text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmailSettings}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-emerald-950/30"
                >
                  Save Email Configuration
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            REJECTION REASON & EMAIL NOTIFICATION MODAL
        ───────────────────────────────────────────────────────────── */}
        {rejectingStudent && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#0A101D] border border-red-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl shadow-red-950/60 space-y-4 my-6 text-white animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-600/60 flex items-center justify-center text-red-400 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Reject Registration Application
                      <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 px-2 py-0.5 rounded font-mono uppercase">
                        Admin Action
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select reason and dispatch rejection notification to{' '}
                      <span className="text-white font-semibold">{rejectingStudent.fullName}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isSubmittingRejection}
                  onClick={closeRejectionModal}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Summary Strip */}
              <div className="bg-[#050914] border border-[#1E293B] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Reference ID</div>
                  <div className="font-bold text-cyan-400 truncate">{rejectingStudent.bookingId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Submitted UTR</div>
                  <div className="font-bold text-amber-300 truncate" title={rejectingStudent.transactionId}>
                    {rejectingStudent.transactionId}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Tier / Fee</div>
                  <div className="font-bold text-emerald-400">
                    ₹{rejectingStudent.amount} <span className="text-[10px] text-slate-400">({rejectingStudent.ticketTier.slice(0, 8)})</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Student Email</div>
                  <div className="font-bold text-slate-200 truncate" title={rejectingStudent.email}>
                    {rejectingStudent.email}
                  </div>
                </div>
              </div>

              {/* Screenshot Preview thumbnail if available */}
              {rejectingStudent.paymentScreenshotBase64 && (
                <div className="bg-[#060B14] border border-[#1E293B] rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rejectingStudent.paymentScreenshotBase64}
                      alt="Payment proof"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-200">Attached UPI Receipt</div>
                      <div className="text-[10px] text-slate-400">Inspect bank UTR and timestamp</div>
                    </div>
                  </div>
                  <a
                    href={rejectingStudent.paymentScreenshotBase64}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#131D2E] hover:bg-[#1E293B] text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Receipt ↗</span>
                  </a>
                </div>
              )}

              {/* Preset Reason Selector (5 preset reasons + custom) */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase font-bold text-slate-300 block">
                  Select Reason for Rejection:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REJECTION_REASONS.map(opt => {
                    const isSelected = selectedReasonId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectReasonOption(opt)}
                        className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-red-950/50 border-red-500 shadow-md shadow-red-950/40 ring-1 ring-red-500/50'
                            : 'bg-[#0B1322] border-[#1E293B] hover:border-slate-700 hover:bg-[#10192A]'
                        }`}
                      >
                        <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {opt.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                            {opt.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable Explanation for the Student */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase font-bold text-slate-300">
                    Explanation to Student (Sent in Rejection Email):
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">Editable preview</span>
                </div>
                <textarea
                  value={rejectionExplanation}
                  onChange={e => {
                    setRejectionExplanation(e.target.value);
                    if (selectedReasonId !== 'CUSTOM') {
                      setSelectedReasonId('CUSTOM');
                    }
                  }}
                  rows={3}
                  placeholder="Provide a clear explanation for the student..."
                  className="w-full bg-[#050914] border border-[#233147] focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl p-3 text-xs text-white outline-none font-mono leading-relaxed resize-none"
                />
              </div>

              {/* Email Notification Option */}
              <div className="bg-[#050914] border border-[#1E293B] rounded-xl p-3 flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={shouldEmailStudent}
                    onChange={e => setShouldEmailStudent(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white">Send rejection email to student</span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      To: <span className="text-cyan-300">{rejectingStudent.email}</span> (via Awssbggcoek@gmail.com)
                    </span>
                  </div>
                </label>
                <span className="text-[10px] font-mono bg-red-950/60 border border-red-800/80 text-red-300 px-2 py-0.5 rounded uppercase">
                  Automated
                </span>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1E293B]">
                <button
                  type="button"
                  disabled={isSubmittingRejection}
                  onClick={closeRejectionModal}
                  className="bg-transparent hover:bg-[#1E293B] text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingRejection}
                  onClick={handleConfirmRejection}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-red-950/60 flex items-center gap-2"
                >
                  {isSubmittingRejection ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching Rejection & Email…</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>{shouldEmailStudent ? 'Confirm Rejection & Send Email' : 'Confirm Rejection (No Email)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
