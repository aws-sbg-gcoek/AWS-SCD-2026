import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Building,
  GraduationCap,
  Upload,
  Check,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Download,
  CreditCard,
  ShieldCheck,
  QrCode,
  Sparkles,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import {
  loadTicketConfig,
  getTierEffectiveStatus,
  TicketSystemConfig,
  TicketCode,
} from '../utils/ticketConfig';
import {
  StudentRegistration,
  submitNewRegistration,
  findRegistration,
  findRegistrationAsync,
  compressImageToBase64,
} from '../utils/registrationStore';
import UpiPaymentCard from '../components/UpiPaymentCard';
import OfficialTicketPass from '../components/OfficialTicketPass';

interface StudentRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  district: string;
  collegeName: string;
  customCollege: string;
  prnRollNo: string;
  degree: string;
  branch: string;
  academicYear: string;
  idProofName: string;
  idProofBase64?: string;
  confirmedBonafide: boolean;
  ticketCode: TicketCode;
}

const DISTRICT_COLLEGES: Record<string, string[]> = {
  Kolhapur: [
    'Government College of Engineering Karad (GCOEK)',
    'Shivaji University (DOT), Kolhapur',
    'D.Y. Patil College of Engineering and Technology, Kolhapur',
    "KIT's College of Engineering (Autonomous), Kolhapur",
    "DKTE Society's Textile and Engineering Institute, Ichalkaranji",
    'Sanjeevan Engineering and Technology Institute, Panhala',
    'Bharati Vidyapeeth College of Engineering, Kolhapur',
    'Government Polytechnic, Kolhapur',
    'Sharad Institute of Technology College of Engineering, Yadrav',
    'Tatyasaheb Kore Institute of Engineering & Technology, Warananagar',
    'Other / College not listed',
  ],
  Pune: [
    'COEP Technological University, Pune',
    'Pune Institute of Computer Technology (PICT)',
    'Vishwakarma Institute of Technology (VIT)',
    'MIT World Peace University (MIT-WPU)',
    'Cummins College of Engineering for Women',
    'Army Institute of Technology (AIT)',
    'Pimpri Chinchwad College of Engineering (PCCOE)',
    'Sinhgad College of Engineering (SCOE)',
    'Other / College not listed',
  ],
  Mumbai: [
    'Veermata Jijabai Technological Institute (VJTI)',
    'Sardar Patel Institute of Technology (SPIT)',
    'K. J. Somaiya College of Engineering',
    'Thadomal Shahani Engineering College (TSEC)',
    'Dwarkadas J. Sanghvi College of Engineering (DJSCE)',
    'Father Conceicao Rodrigues College of Engineering (FCRCE)',
    'Other / College not listed',
  ],
  Sangli: [
    'Walchand College of Engineering, Sangli',
    'Padmabhooshan Vasantraodada Patil Institute of Technology (PVPIT)',
    'Nanasaheb Mahadik College of Engineering, Peth',
    'Other / College not listed',
  ],
  Satara: [
    'Government College of Engineering, Karad',
    'Karmaveer Bhaurao Patil College of Engineering, Satara',
    'Rayat Shikshan Sanstha Institutes',
    'Other / College not listed',
  ],
  Solapur: [
    'Walchand Institute of Technology (WIT), Solapur',
    'N.K. Orchid College of Engineering and Technology',
    'Brahmdevdada Mane Institute of Technology',
    'Other / College not listed',
  ],
  Other: [
    'Other Maharashtra Engineering College',
    'Other University / Institute outside Maharashtra',
  ],
};

const DEGREES = [
  'B.Tech / B.E.',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'M.Tech / M.E.',
  'B.Sc (Computer Science / IT)',
  'M.Sc (Computer Science / IT)',
  'Diploma in Engineering',
  'Other Degree / Program',
];

const BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Information Technology (IT)',
  'Computer Science & Business Systems (CSBS)',
  'Electronics & Telecommunication (E&TC)',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Robotics & Automation',
  'Other Specialization',
];

const ACADEMIC_YEARS = ['1st Yr', '2nd Yr', '3rd Yr', '4th Yr', 'PG'];

export default function RegistrationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'track'>('register');
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Live ticket pricing and tier resolution
  const [ticketConfig, setTicketConfig] = useState<TicketSystemConfig>(() => loadTicketConfig());
  useEffect(() => {
    const sync = () => setTicketConfig(loadTicketConfig());
    window.addEventListener('ticketConfigUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ticketConfigUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Determine active ticket tier (Early Bird ₹249 by default, or Regular ₹349 if open)
  const earlyBirdTier = ticketConfig.tiers.early_bird;
  const regularTier = ticketConfig.tiers.regular;
  const superEarlyTier = ticketConfig.tiers.super_early_bird;

  const earlyBirdEffective = getTierEffectiveStatus(earlyBirdTier);
  const regularEffective = getTierEffectiveStatus(regularTier);
  const superEarlyEffective = getTierEffectiveStatus(superEarlyTier);

  // Selected ticket: prefer open tier
  const defaultTierCode: TicketCode = earlyBirdEffective.isOpen
    ? 'early_bird'
    : regularEffective.isOpen
    ? 'regular'
    : superEarlyEffective.isOpen
    ? 'super_early_bird'
    : 'early_bird';

  const [formData, setFormData] = useState<StudentRegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    district: '',
    collegeName: '',
    customCollege: '',
    prnRollNo: '',
    degree: '',
    branch: '',
    academicYear: '3rd Yr',
    idProofName: '',
    confirmedBonafide: false,
    ticketCode: defaultTierCode,
  });

  const selectedTierConfig = ticketConfig.tiers[formData.ticketCode] || earlyBirdTier;
  const activeAmount = selectedTierConfig.price;

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');

  // Payment / Confirmation State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingCompleted, setBookingCompleted] = useState<StudentRegistration | null>(null);

  // Status Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<StudentRegistration | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setValidationError('File size exceeds 10MB. Please upload a smaller image or document.');
      return;
    }

    setValidationError('');
    setIdProofFile(file);
    setFormData(prev => ({
      ...prev,
      idProofName: file.name,
    }));

    // Convert and compress student ID proof to base64 for Firebase Firestore
    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImageToBase64(file, 900, 900, 0.75);
        setFormData(prev => ({
          ...prev,
          idProofName: file.name,
          idProofBase64: compressed,
        }));
      } else {
        const reader = new FileReader();
        reader.onload = ev => {
          setFormData(prev => ({
            ...prev,
            idProofName: file.name,
            idProofBase64: ev.target?.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn('Error reading student ID file:', err);
    }
  };

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.fullName.trim()) {
      setValidationError('Please enter your full name as per college records.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setValidationError('Please enter a valid student email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.district) {
      setValidationError('Please select your college district.');
      return;
    }
    if (!formData.collegeName) {
      setValidationError('Please select your college name.');
      return;
    }
    if (!formData.prnRollNo.trim()) {
      setValidationError('Please enter your PRN or Roll Number.');
      return;
    }
    if (!formData.degree) {
      setValidationError('Please select your degree/program.');
      return;
    }
    if (!formData.branch) {
      setValidationError('Please select your engineering branch.');
      return;
    }
    if (!formData.academicYear) {
      setValidationError('Please select your academic year.');
      return;
    }
    if (!idProofFile && !formData.idProofName) {
      setValidationError('Please upload your Student ID Card or Allotment proof.');
      return;
    }
    if (!formData.confirmedBonafide) {
      setValidationError('You must confirm that you are a bonafide student to continue.');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fallback / simulated payment completion
  const handleCompletePayment = async (simulatedUtr?: string) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const utr = simulatedUtr || 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000);
      const newReg = submitNewRegistration({
        transactionId: utr,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        district: formData.district,
        collegeName: formData.collegeName === 'Other / College not listed' ? formData.customCollege : formData.collegeName,
        prnRollNo: formData.prnRollNo,
        degree: formData.degree,
        branch: formData.branch,
        academicYear: formData.academicYear,
        idProofName: formData.idProofName,
        idProofBase64: formData.idProofBase64,
        ticketTier: selectedTierConfig.label,
        amount: activeAmount,
      });

      setIsProcessingPayment(false);
      setBookingCompleted(newReg);
    }, 1200);
  };

  // Track Status Search (supports live Firestore lookup)
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackSearched(true);
    const match = await findRegistrationAsync(trackQuery);
    setTrackResult(match);
  };

  return (
    <div className="min-h-screen bg-[#070B13] aws-builder-grid text-[#F1F5F9] font-sans antialiased selection:bg-purple-600 selection:text-white pb-16">
      {/* Top Banner Navigation */}
      <nav className="border-b border-white/10 bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to SCD 2026</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse shadow-[0_0_6px_#22D3EE]" />
              [ REGISTRATION ACTIVE ]
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8">
        {/* Capsule Pill Tab Switcher: New Registration vs Track Status */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-[#0B1120] border border-white/15 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setBookingCompleted(null);
              }}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              New Registration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Track Status
            </button>
          </div>
        </div>

        {/* TRACK STATUS VIEW */}
        {activeTab === 'track' && (
          <div className="bg-[#0B1120]/95 backdrop-blur-md border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-2 font-mono text-xs text-purple-400 font-bold uppercase">
                <span className="w-2 h-2 bg-fuchsia-500 inline-block shadow-[0_0_6px_#EC4899]" />
                [ VERIFICATION DESK ]
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Check Ticket Status</h2>
              <p className="text-xs text-slate-300 mt-1">
                Enter your UPI Transaction ID / UTR, Booking ID, or Registered Email to check your approval status.
              </p>
            </div>

            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={trackQuery}
                  onChange={e => setTrackQuery(e.target.value)}
                  placeholder="Enter Transaction ID (e.g. 428901234567) or Email"
                  className="w-full bg-[#070B13] border border-white/15 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white font-mono text-xs sm:text-sm pl-10 pr-3 py-3 rounded-xl outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 cursor-pointer font-mono uppercase tracking-wider"
              >
                Check
              </button>
            </form>

            {trackSearched && trackResult && (
              <div className="space-y-4 pt-2">
                {/* 1. UNDER SURVEILLANCE */}
                {trackResult.status === 'UNDER_SURVEILLANCE' && (
                  <div className="border border-amber-500/50 bg-amber-950/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
                      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                        <span>Transaction Under Surveillance</span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-900/80 border border-amber-600/70 px-2.5 py-0.5 rounded uppercase">
                        UNDER SURVEILLANCE
                      </span>
                    </div>

                    <div className="bg-[#070B13] border border-[#243044] rounded-lg p-3.5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 text-xs font-mono">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>Verification in progress by Event Admin</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        Your UPI Transaction (UTR / Reference: <strong className="text-amber-300 font-mono select-all">{trackResult.transactionId}</strong>) has been received and is currently under verification against our bank statement. Once approved by the administrator, your official ticket pass will be generated here automatically.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block">Attendee</span>
                        <strong className="text-white text-sm">{trackResult.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Booking Reference</span>
                        <strong className="text-slate-200">{trackResult.bookingId}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">College</span>
                        <span className="text-slate-200">{trackResult.collegeName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Amount Paid</span>
                        <strong className="text-emerald-400">₹{trackResult.amount} ({trackResult.ticketTier})</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/20 text-center font-mono text-[11px] text-slate-400">
                      Status auto-updates once verified in the administrator portal.
                    </div>
                  </div>
                )}

                {/* 2. APPROVED */}
                {trackResult.status === 'APPROVED' && (
                  <div className="space-y-4">
                    {/* Status Notice */}
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Transaction Verified · Official Ticket Pass Issued</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-900/60 border border-emerald-600/70 px-2.5 py-0.5 rounded uppercase">
                        APPROVED
                      </span>
                    </div>

                    {/* Gate Check-in Status Notice */}
                    {trackResult.checkedIn ? (
                      <div className="bg-red-950/70 border border-red-500/80 rounded-xl p-3 flex items-center justify-between text-xs text-red-300 font-mono">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                          <span>Pass scanned at gate ({trackResult.checkedInAt ? new Date(trackResult.checkedInAt).toLocaleTimeString('en-IN') : 'Earlier today'})</span>
                        </div>
                        <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          USED (SCANNED)
                        </span>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/60 border border-emerald-500/60 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300 font-mono">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Active Pass · Valid for 1-Time Gate Entry on 01 Nov 2026</span>
                        </div>
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          READY
                        </span>
                      </div>
                    )}

                    {/* Official Cyber Pass Replicating User's Design */}
                    <OfficialTicketPass registration={trackResult} showActions={true} />
                  </div>
                )}

                {/* 3. REJECTED */}
                {trackResult.status === 'REJECTED' && (
                  <div className="border border-red-500/40 bg-red-950/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                      <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <span>Transaction Unverified / Rejected</span>
                      </div>
                      <span className="font-mono text-[10px] text-red-300 font-bold bg-red-900/60 border border-red-700 px-2 py-0.5 rounded">
                        REJECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {trackResult.rejectionReason || 'The payment reference could not be matched with the organizers bank account. Please verify your UTR and contact support.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {trackSearched && !trackResult && (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-medium text-slate-300">No registration found for this query</p>
                <p className="text-xs">
                  Double-check your Transaction ID / UTR or email address, or complete a new registration.
                </p>
              </div>
            )}
          </div>
        )}

        {/* REGISTRATION FORM VIEW */}
        {activeTab === 'register' && !bookingCompleted && (
          <div className="space-y-6">
            {/* Header Badge & Title */}
            <div className="text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141C2D] border border-[#243044] text-[11px] font-mono tracking-wider uppercase text-slate-300 shadow-sm">
                <span>AWS COMMUNITY DAY · KOLHAPUR</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Student Registration
              </h1>

              {/* Event Metadata row */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-slate-400 font-medium pt-0.5">
                <span className="inline-flex items-center gap-1">
                  <span>🗓️</span> 01 Nov 2026
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span>🏛️</span> GCOEK Campus, Kolhapur
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <span>🎓</span> Maharashtra Colleges
                </span>
              </div>
            </div>

            {/* Step Indicator & Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>
                  {currentStep === 1 ? 'Step 1 of 2: Student Details' : 'Step 2 of 2: Payment & Confirmation'}
                </span>
                <span className="font-mono text-[#5856D6]">{currentStep === 1 ? '50%' : '100%'}</span>
              </div>
              <div className="h-1.5 w-full bg-[#182335] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5856D6] rounded-full transition-all duration-300 shadow-sm shadow-[#5856D6]"
                  style={{ width: currentStep === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {/* STEP 1: Personal & College Information Form */}
            {currentStep === 1 && (
              <div className="bg-[#101726] border border-[#1E293B] rounded-2xl p-5 sm:p-8 shadow-2xl space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Personal & College Information
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Ensure details match your college ID card or allotment records.
                  </p>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs font-mono">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <form onSubmit={handleContinueToReview} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Full name as per college records"
                      className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                    />
                  </div>

                  {/* Email & Mobile Number Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@college.edu or gmail.com"
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white font-mono text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* District & College Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        District <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.district}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            district: e.target.value,
                            collegeName: '',
                          })
                        }
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Select District</option>
                        {Object.keys(DISTRICT_COLLEGES).map(dist => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        College Name <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        disabled={!formData.district}
                        value={formData.collegeName}
                        onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <option value="">
                          {formData.district ? 'Select College' : 'Select district first'}
                        </option>
                        {formData.district &&
                          (DISTRICT_COLLEGES[formData.district] || DISTRICT_COLLEGES['Other']).map(col => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Custom College Name input if 'Other' is chosen */}
                  {formData.collegeName === 'Other / College not listed' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Specify College Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customCollege}
                        onChange={e => setFormData({ ...formData, customCollege: e.target.value })}
                        placeholder="Enter full college / institute name"
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none"
                      />
                    </div>
                  )}

                  {/* PRN / Roll Number & Degree / Program */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        PRN / Roll Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prnRollNo}
                        onChange={e => setFormData({ ...formData, prnRollNo: e.target.value })}
                        placeholder="e.g. 2101001 or Roll No"
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white font-mono text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Degree / Program <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.degree}
                        onChange={e => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
                      >
                        <option value="">Select Program</option>
                        {DEGREES.map(deg => (
                          <option key={deg} value={deg}>
                            {deg}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Branch / Specialization */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Branch / Specialization <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.branch}
                      onChange={e => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full bg-[#070B13] border border-[#243044] focus:border-[#5856D6] focus:ring-1 focus:ring-[#5856D6] text-white text-xs sm:text-sm px-4 py-3 rounded-xl outline-none transition-colors cursor-pointer"
                    >
                      <option value="">Select Branch</option>
                      {BRANCHES.map(br => (
                        <option key={br} value={br}>
                          {br}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Year (Segmented Buttons) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Academic Year <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {ACADEMIC_YEARS.map(yr => {
                        const isSelected = formData.academicYear === yr;
                        return (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setFormData({ ...formData, academicYear: yr })}
                            className={`py-2.5 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                              isSelected
                                ? 'bg-[#5856D6] border-[#6865EE] text-white shadow-md shadow-[#5856D6]/30'
                                : 'bg-[#070B13] border-[#243044] text-slate-400 hover:border-[#384860] hover:text-slate-200'
                            }`}
                          >
                            {yr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Student ID Card / Allotment Letter Upload */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Student ID Card / Allotment Letter <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png, image/jpeg, image/jpg, application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex items-center justify-center gap-3 cursor-pointer transition-all ${
                        idProofFile || formData.idProofName
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-emerald-300'
                          : 'border-[#243044] bg-[#070B13] hover:border-[#5856D6] hover:bg-[#0C1220] text-slate-400'
                      }`}
                    >
                      <span className="text-xl">🪪</span>
                      <div className="text-xs sm:text-sm text-center sm:text-left">
                        {idProofFile || formData.idProofName ? (
                          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            {idProofFile?.name || formData.idProofName} (Ready)
                          </span>
                        ) : (
                          <span>
                            Click to upload Student ID or Allotment proof{' '}
                            <span className="text-[11px] text-slate-500 block sm:inline">
                              (PNG, JPG, max 2.5MB)
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.confirmedBonafide}
                        onChange={e =>
                          setFormData({ ...formData, confirmedBonafide: e.target.checked })
                        }
                        className="mt-1 h-4 w-4 rounded border-[#243044] bg-[#070B13] text-[#5856D6] focus:ring-[#5856D6] cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 leading-relaxed">
                        I confirm that I am a bonafide student and the details and document provided are authentic.
                      </span>
                    </label>
                  </div>

                  {/* Continue to Payment Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-[#5856D6] hover:bg-[#6865EE] text-white font-bold py-3.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-[#5856D6]/30 cursor-pointer"
                    >
                      <span>Continue to Payment (₹{activeAmount})</span>
                      <span>→</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: Review & Complete Payment via Direct UPI */}
            {currentStep === 2 && (
              <div className="bg-[#101726] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Payment & Ticket Issuance
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Direct UPI payment to Bhushan Jadhav (0% Gateway Fee).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    ← Edit Details
                  </button>
                </div>

                {/* Summary Card */}
                <div className="bg-[#070B13] border border-[#243044] rounded-xl p-5 space-y-4 text-xs font-mono">
                  <div className="flex justify-between items-center pb-3 border-b border-[#1E293B]">
                    <span className="text-slate-400">Selected Pass</span>
                    <strong className="text-white text-sm">{selectedTierConfig.label}</strong>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">Attendee Name</span>
                      <strong className="text-slate-200 text-sm">{formData.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Mobile</span>
                      <span className="text-slate-200">{formData.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">College</span>
                      <span className="text-slate-200">
                        {formData.collegeName === 'Other / College not listed'
                          ? formData.customCollege
                          : formData.collegeName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">PRN / Roll No</span>
                      <span className="text-slate-200">{formData.prnRollNo}</span>
                    </div>
                  </div>

                  {/* Price Calculation */}
                  <div className="pt-3 border-t border-[#1E293B] flex justify-between items-center text-white text-base font-bold">
                    <span>Payable Amount</span>
                    <span className="text-emerald-400">₹{activeAmount}</span>
                  </div>
                </div>

                {/* Direct UPI Payment Gateway Component */}
                <UpiPaymentCard
                  amount={activeAmount}
                  payeeName="Bhushan Jadhav"
                  upiId="aj6244249-1@okaxis"
                  transactionNote={`AWS SCD ${formData.fullName.slice(0, 15)}`}
                  onPaymentDone={(utr, screenshotBase64, screenshotName) => {
                    const newReg = submitNewRegistration({
                      transactionId: utr,
                      fullName: formData.fullName,
                      email: formData.email,
                      phone: formData.phone,
                      district: formData.district,
                      collegeName: formData.collegeName === 'Other / College not listed' ? formData.customCollege : formData.collegeName,
                      prnRollNo: formData.prnRollNo,
                      degree: formData.degree,
                      branch: formData.branch,
                      academicYear: formData.academicYear,
                      idProofName: formData.idProofName,
                      idProofBase64: formData.idProofBase64,
                      paymentScreenshotBase64: screenshotBase64,
                      paymentScreenshotName: screenshotName,
                      ticketTier: selectedTierConfig.label,
                      amount: activeAmount,
                    });

                    setBookingCompleted(newReg);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* BOOKING SUCCESS SCREEN (UNDER SURVEILLANCE STATUS) */}
        {activeTab === 'register' && bookingCompleted && (
          <div className="bg-[#101726] border border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-600/70 px-3 py-1 rounded-full font-bold">
                UNDER SURVEILLANCE · PENDING VERIFICATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Registration Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Your UPI Transaction Reference has been received and is under verification against our bank records.
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="bg-[#070B13] border-2 border-amber-500/40 rounded-xl p-5 text-left space-y-4 font-mono shadow-xl">
              <div className="flex items-start justify-between pb-3 border-b border-[#1E293B]">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold block">
                    TRANSACTION ID / UTR
                  </span>
                  <strong className="text-base text-white select-all">{bookingCompleted.transactionId}</strong>
                </div>
                <span className="bg-amber-900/60 text-amber-300 border border-amber-600/70 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                  Pending Admin Approval
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">ATTENDEE NAME</span>
                  <strong className="text-white">{bookingCompleted.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">BOOKING ID</span>
                  <strong className="text-emerald-400">{bookingCompleted.bookingId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">COLLEGE</span>
                  <span className="text-slate-300 truncate block">{bookingCompleted.collegeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">AMOUNT PAID</span>
                  <strong className="text-emerald-400">₹{bookingCompleted.amount} ({bookingCompleted.ticketTier})</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E293B] text-[11px] text-slate-400 leading-relaxed font-sans">
                💡 <strong className="text-slate-200">How to get your ticket:</strong> Once the event administrator confirms your transaction, your official pass with QR code will be issued. You can check your status anytime using your Transaction ID.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrackQuery(bookingCompleted.transactionId);
                  setTrackResult(bookingCompleted);
                  setTrackSearched(true);
                  setActiveTab('track');
                  setBookingCompleted(null);
                }}
                className="flex-1 bg-[#5856D6] hover:bg-[#6865EE] text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#5856D6]/30 transition-colors cursor-pointer"
              >
                <span>Track Ticket Status →</span>
              </button>

              <Link
                to="/"
                className="flex-1 bg-[#1A2333] hover:bg-[#253247] text-slate-200 font-semibold py-3.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center transition-colors"
              >
                Back to SCD 2026 Site
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
