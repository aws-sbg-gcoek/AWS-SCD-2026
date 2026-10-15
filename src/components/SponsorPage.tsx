/* eslint-disable react-doctor/label-has-associated-control, react-doctor/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ChevronRight,
  ArrowLeft,
  Send,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  Tag,
  Upload,
  Check,
  X,
  Sparkles,
  Award,
  Layers,
  ArrowDown,
  Briefcase,
  Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  SponsorApplication,
  saveSponsorApplication,
} from '../utils/sponsorStore';
import { compressImageToBase64 } from '../utils/registrationStore';

export interface SponsorTierItem {
  name: string;
  price: string;
  amount: number;
  highlight: boolean;
  perks: string[];
}

export const sponsorTiers: SponsorTierItem[] = [
  {
    name: 'Title Sponsor',
    price: '₹75,000',
    amount: 75000,
    highlight: true,
    perks: [
      'Exclusive Main stage naming & branding',
      'Prime 10x10 expo stall at entrance',
      '20-min Keynote tech speaking slot',
      'VIP student lanyards & pass branding',
      'Social media campaigns & PR coverage',
      'Direct recruitment & resume book access',
    ],
  },
  {
    name: 'Gold Sponsor',
    price: '₹40,000',
    amount: 40000,
    highlight: false,
    perks: [
      'Premium 8x8 expo booth space',
      'Stage backdrop & event banner branding',
      'Social media feature announcements',
      'Participant kit & swag distribution',
      'VIP networking lunch access',
    ],
  },
  {
    name: 'Silver Sponsor',
    price: '₹20,000',
    amount: 20000,
    highlight: false,
    perks: [
      'Dedicated sponsor exhibition table',
      'Logo on event sponsor wall & website',
      'Brochures & promotional flyers in kit',
      'Social media mention',
    ],
  },
  {
    name: 'Bronze Sponsor',
    price: '₹15,000',
    amount: 15000,
    highlight: false,
    perks: [
      'Brand display table in expo alley',
      'Logo placement on website & handbook',
      'Product flyers distribution',
    ],
  },
  {
    name: 'Startup Showcase',
    price: '₹12,000',
    amount: 12000,
    highlight: false,
    perks: [
      'Dedicated startup demo kiosk',
      'Live product showcase to 400+ builders',
      'Founder networking access',
      'Social media spotlight',
    ],
  },
  {
    name: 'Community Partner',
    price: '₹7,500',
    amount: 7500,
    highlight: false,
    perks: [
      'Community partner logo on website',
      'Banner display in developer hub',
      'Student builder outreach opportunities',
    ],
  },
];

const SHOWCASE_OPTIONS = [
  '🎪 Product Expo Stall & Booth',
  '🎤 Speaking Slot / Keynote Tech Demo',
  '🎁 Distribute Goodies / Swag / Kits',
  '🏷️ Logo on Stage Backdrop & Banners',
  '🎫 Student Pass Lanyards & Badges Branding',
  '💼 Direct Student Talent Hiring & Internships',
  '💻 Software / Developer Tool Trials',
  '🏆 Hackathon / Challenge Prize Sponsorship',
];

export const SponsorPage = () => {
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedTier, setSelectedTier] = useState<string>('Title Sponsor');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Cloud & IT Services');
  const [showcaseInterests, setShowcaseInterests] = useState<string[]>([
    '🎪 Product Expo Stall & Booth',
    '🏷️ Logo on Stage Backdrop & Banners',
  ]);
  const [customShowcase, setCustomShowcase] = useState('');
  const [details, setDetails] = useState('');
  const [companyPhotoBase64, setCompanyPhotoBase64] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState('');

  const handleSelectTier = (tierName: string) => {
    setSelectedTier(tierName);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleShowcaseInterest = (option: string) => {
    if (showcaseInterests.includes(option)) {
      setShowcaseInterests(showcaseInterests.filter(o => o !== option));
    } else {
      setShowcaseInterests([...showcaseInterests, option]);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      setIsCompressingPhoto(true);
      setPhotoFileName(file.name);
      const compressed = await compressImageToBase64(file, 900, 900, 0.8);
      setCompanyPhotoBase64(compressed);
    } catch (err) {
      console.error('Error compressing photo:', err);
      alert('Failed to process image. Please try a different photo.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const tierObj = sponsorTiers.find(t => t.name === selectedTier) || sponsorTiers[0];
      const appId = `SPN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newApp: SponsorApplication = {
        id: appId,
        company: company.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        industry,
        tier: tierObj.name,
        price: tierObj.price,
        companyPhotoBase64: companyPhotoBase64 || undefined,
        showcaseInterests,
        customShowcase: customShowcase.trim(),
        details: details.trim(),
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSponsorApplication(newApp);
      setSubmittedAppId(appId);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    }
  };

  const currentTierObj = sponsorTiers.find(t => t.name === selectedTier) || sponsorTiers[0];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans">
      {/* Background radial grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Navbar */}
      <div className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-aws-orange tracking-widest uppercase hidden sm:inline">
              Sponsorship Circuit 2026
            </span>
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-aws-orange text-black font-black italic uppercase text-xs px-3.5 py-1.5 rounded tracking-wider hover:bg-white transition-all cursor-pointer"
            >
              Apply Now ↓
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-8 lg:px-12 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-aws-orange/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#E10600]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-aws-orange/10 border border-aws-orange/30 text-aws-orange text-xs font-mono tracking-widest uppercase">
            <Sparkles size={12} />
            <span>05.PRTN / Official Sponsorship Packages</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">
            Constructors &amp;<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aws-orange via-amber-400 to-[#E10600]">
              Brand Partners
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white/60 font-medium max-w-2xl mx-auto leading-relaxed">
            Showcase your company, products, and services to over 400+ passionate student cloud engineers, developers, and tech builders at Western Maharashtra's premier AWS conference.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3 font-mono text-xs">
            <span className="bg-[#111] border border-white/10 px-3.5 py-1.5 rounded-full text-slate-300">
              👥 4,000+ Student Outreach
            </span>
            <span className="bg-[#111] border border-white/10 px-3.5 py-1.5 rounded-full text-slate-300">
              🎯 400+ Confirmed In-Person Builders
            </span>
            <span className="bg-[#111] border border-white/10 px-3.5 py-1.5 rounded-full text-slate-300">
              📍 V.T. Patil Hall, Kolhapur
            </span>
          </div>
        </div>
      </section>

      {/* Sponsorship Packages Grid */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center sm:text-left mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-aws-orange uppercase tracking-widest mb-1">
              Select Your Tier
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-black italic tracking-tight uppercase text-white">
              Sponsorship Packages
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mt-1">
              Click any tier below to automatically select it and customize your company exhibition proposal.
            </p>
          </div>
          <span className="font-mono text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg self-start">
            ⚡ 1-Click Package Selection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsorTiers.map((tier, idx) => {
            const isSelected = selectedTier === tier.name;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => handleSelectTier(tier.name)}
                className={`p-6 border rounded-xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-[#141A26] border-aws-orange shadow-[0_0_25px_rgba(255,153,0,0.25)] ring-2 ring-aws-orange/40 scale-[1.02]'
                    : tier.highlight
                    ? 'bg-gradient-to-br from-aws-orange/10 via-[#101010] to-[#050505] border-aws-orange/40 hover:border-aws-orange'
                    : 'bg-[#0E0E0E] border-white/10 hover:border-white/30 hover:bg-[#141414]'
                }`}
              >
                {/* Highlight top stripe */}
                {tier.highlight && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-aws-orange to-[#E10600]" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-mono text-[10px] tracking-widest uppercase font-bold px-2 py-0.5 rounded ${
                        tier.highlight
                          ? 'bg-aws-orange text-black'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {tier.highlight ? '★ Premier Partner' : 'Standard Tier'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-mono font-bold text-aws-orange flex items-center gap-1 animate-pulse">
                        <Check size={12} /> Selected
                      </span>
                    )}
                  </div>

                  <h3 className="font-sans font-black italic tracking-tight text-2xl uppercase text-white">
                    {tier.name}
                  </h3>

                  <div className="font-mono text-2xl font-bold text-amber-400 mt-2 mb-4">
                    {tier.price}
                  </div>

                  <ul className="space-y-2 border-t border-white/10 pt-4 text-xs font-sans text-white/70">
                    {tier.perks.map((perk, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-aws-orange shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleSelectTier(tier.name);
                    }}
                    className={`w-full py-2.5 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-aws-orange text-black shadow-lg shadow-aws-orange/30'
                        : 'bg-white/10 text-white hover:bg-white hover:text-black'
                    }`}
                  >
                    <span>{isSelected ? 'Selected (Fill Form Below ↓)' : 'Select Package & Apply'}</span>
                    <ArrowDown size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Sponsor Application Form Section */}
      <section
        id="apply"
        ref={formRef}
        className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 border-t border-white/10 bg-[#080808]"
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="font-mono text-xs text-aws-orange uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <Store size={14} />
              <span>Sponsor Exhibition &amp; Partnership Application</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-black italic tracking-tight uppercase text-white">
              Lock In Your Brand's Grid Slot
            </h2>
            <p className="text-white/60 text-xs sm:text-sm max-w-lg mx-auto mt-2">
              Select your package, share details about your business and stall requirements, and upload photos of your company, showroom, or products.
            </p>

            {/* Currently Selected Tier Badge */}
            <div className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-aws-orange/10 border border-aws-orange/40 text-aws-orange">
              <span className="font-mono text-xs uppercase font-bold">Current Selection:</span>
              <strong className="text-sm sm:text-base font-black text-white">
                {currentTierObj.name} ({currentTierObj.price})
              </strong>
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-[#0F131D] border border-[#233147] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top racing accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-aws-orange via-amber-400 to-[#E10600]" />

            {status === 'success' ? (
              <div className="text-center py-12 space-y-5 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check size={32} />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold block">
                    Application Received &amp; Logged
                  </span>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                    Welcome to the Circuit, {company}!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Your proposal for <strong className="text-amber-400">{selectedTier}</strong> has been transmitted to the core SCD Kolhapur organizing committee.
                  </p>
                </div>

                <div className="bg-[#0B0F19] border border-[#233147] p-4 rounded-xl max-w-sm mx-auto font-mono text-xs space-y-1 text-left">
                  <div className="text-slate-400 text-[10px] uppercase">Application Reference ID:</div>
                  <div className="text-amber-400 text-lg font-bold select-all">{submittedAppId}</div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Contact: {contactName} ({phone})
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setCompany('');
                      setContactName('');
                      setEmail('');
                      setPhone('');
                      setWebsite('');
                      setCustomShowcase('');
                      setDetails('');
                      setCompanyPhotoBase64('');
                    }}
                    className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Submit Another Application
                  </button>
                  <Link
                    to="/"
                    className="px-5 py-2.5 rounded-lg bg-aws-orange hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tier Selection Radio / Dropdown */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300">
                    Sponsorship Tier &amp; Amount *
                  </label>
                  <select
                    required
                    value={selectedTier}
                    onChange={e => setSelectedTier(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-4 py-3 text-white text-sm font-mono focus:border-aws-orange outline-none"
                  >
                    {sponsorTiers.map(t => (
                      <option key={t.name} value={t.name} className="bg-[#0B0F19] text-white">
                        {t.name} — {t.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company & Industry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Building2 size={13} className="text-aws-orange" />
                      <span>Company / Business Name *</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="e.g. Nexus Cloud Solutions Pvt Ltd"
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-aws-orange" />
                      <span>Industry / Business Category *</span>
                    </label>
                    <select
                      value={industry}
                      onChange={e => setIndustry(e.target.value)}
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                    >
                      <option value="Cloud & IT Services">Cloud Infrastructure &amp; IT Services</option>
                      <option value="Software & SaaS">Software, Apps &amp; SaaS</option>
                      <option value="AI & Machine Learning">AI &amp; Data Intelligence</option>
                      <option value="EdTech & Training">EdTech &amp; Career Training</option>
                      <option value="Hardware, IoT & Electronics">Hardware, IoT &amp; Electronics</option>
                      <option value="Local Business & Retail">Local Business &amp; Retail Showroom</option>
                      <option value="Finance & Fintech">Fintech &amp; Banking</option>
                      <option value="Startup">Early-Stage Startup</option>
                      <option value="Other">Other Category</option>
                    </select>
                  </div>
                </div>

                {/* Contact Name & Designation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <User size={13} className="text-aws-orange" />
                      <span>Contact Person *</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Mail size={13} className="text-aws-orange" />
                      <span>Official Email *</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="contact@company.com"
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Phone size={13} className="text-aws-orange" />
                      <span>Phone / WhatsApp *</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98220 00000"
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Globe size={13} className="text-aws-orange" />
                    <span>Company Website or Social / LinkedIn Link</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://company.com or https://linkedin.com/company/..."
                    className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                  />
                </div>

                {/* Company / Shop / Stall Photo Upload */}
                <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Upload size={13} className="text-amber-400" />
                      <span>Photo of Company Logo, Showroom, Stall or Products</span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                  </div>

                  {companyPhotoBase64 ? (
                    <div className="bg-[#080C14] border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={companyPhotoBase64}
                          alt="Company preview"
                          className="w-14 h-14 object-cover rounded-lg border border-white/20"
                        />
                        <div className="min-w-0">
                          <span className="text-xs text-white font-mono block truncate">
                            {photoFileName || 'Uploaded Photo'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Check size={12} /> Ready for submission
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCompanyPhotoBase64('');
                          setPhotoFileName('');
                        }}
                        className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-mono transition-colors"
                        title="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#243044] hover:border-aws-orange rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080C14]/60 group">
                      <Upload size={22} className="text-slate-400 group-hover:text-aws-orange mb-1.5" />
                      <span className="text-xs text-slate-200 font-sans group-hover:text-white font-medium">
                        {isCompressingPhoto ? 'Processing photo…' : 'Click or Drag to Upload Showroom / Logo / Stall Photo'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        Will be displayed in sponsor catalog and reviewed by committee
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isCompressingPhoto}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* What they want to showcase */}
                <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                    What would you like to showcase or feature in the event? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SHOWCASE_OPTIONS.map(opt => {
                      const active = showcaseInterests.includes(opt);
                      return (
                        <button
                          type="button"
                          key={opt}
                          onClick={() => toggleShowcaseInterest(opt)}
                          className={`text-left text-xs p-2.5 rounded-lg border font-mono transition-all flex items-center justify-between cursor-pointer ${
                            active
                              ? 'bg-aws-orange/15 border-aws-orange text-white font-bold'
                              : 'bg-[#080C14] border-[#243044] text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{opt}</span>
                          {active && <Check size={14} className="text-aws-orange shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      Specific details on what you want to exhibit / demonstrate:
                    </label>
                    <textarea
                      rows={2}
                      value={customShowcase}
                      onChange={e => setCustomShowcase(e.target.value)}
                      placeholder="e.g. We want to exhibit our new gaming laptops and host a 15-minute developer speed coding mini-contest..."
                      className="w-full bg-[#080C14] border border-[#243044] rounded-lg p-3 text-white text-xs font-sans focus:border-aws-orange outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-aws-orange" />
                    <span>Additional Goals, Requirements or Questions</span>
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Tell us any custom booth size requirements, electrical connections, or branding requests..."
                    className="w-full bg-[#080C14] border border-[#243044] rounded-lg p-3 text-white text-xs font-sans focus:border-aws-orange outline-none resize-none"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-950/80 border border-red-700 text-red-300 text-xs font-mono">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-aws-orange to-amber-500 hover:from-white hover:to-white text-black font-sans font-black italic uppercase text-sm sm:text-base tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-aws-orange/20 transition-all cursor-pointer"
                >
                  <Send size={16} />
                  <span>{status === 'loading' ? 'Transmitting Proposal…' : 'Submit Sponsorship Proposal'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-8 lg:px-12 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
          <span>© 2026 AWS Student Builder Group. All rights reserved.</span>
          <Link to="/" className="text-aws-orange hover:text-white transition-colors">
            ← Return to SCD 2026 Home
          </Link>
        </div>
      </footer>
    </div>
  );
};
