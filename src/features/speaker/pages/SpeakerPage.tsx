import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mic,
  Users,
  Award,
  CheckCircle2,
  Send,
  Upload,
  Check,
  X,
  Plus,
  Briefcase,
  Building,
  Mail,
  Phone,
  FileText,
  BadgeCheck,
  Globe,
  Share2,
  Sparkles,
  Layers,
  ExternalLink,
  Linkedin,
  Github,
  Twitter,
} from 'lucide-react';
import {
  SpeakerApplication,
  saveSpeakerApplication,
} from '../../../utils/speakerStore';
import { compressImageToBase64 } from '../../../utils/registrationStore';

const PRESET_SKILLS = [
  'AWS Cloud',
  'Serverless',
  'DevOps & CI/CD',
  'Generative AI & Bedrock',
  'Kubernetes & Containers',
  'Cloud Security',
  'Data Engineering',
  'System Design',
  'Python / TypeScript',
  'Microservices',
];

export const SpeakerPage = () => {
  const [activeTab, setActiveTab] = useState<'speaker' | 'partner'>('speaker');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [talkTitle, setTalkTitle] = useState('');
  const [sessionFormat, setSessionFormat] = useState('30-min Technical Presentation');
  const [audienceLevel, setAudienceLevel] = useState('Level 100 - Beginner');
  const [abstract, setAbstract] = useState('');
  const [speakerPhotoBase64, setSpeakerPhotoBase64] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [certificateProofBase64, setCertificateProofBase64] = useState<string>('');
  const [certFileName, setCertFileName] = useState<string>('');
  const [certificateLink, setCertificateLink] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');

  // Skills state + custom skill addition
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'AWS Cloud',
    'Serverless',
  ]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [isCompressingCert, setIsCompressingCert] = useState(false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState('');

  const togglePresetSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (selectedSkills.some(s => s.toLowerCase() === clean.toLowerCase())) {
      setCustomSkillInput('');
      return;
    }
    setSelectedSkills([...selectedSkills, clean]);
    setCustomSkillInput('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skillToRemove));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setIsCompressingPhoto(true);
      setPhotoFileName(file.name);
      const compressed = await compressImageToBase64(file, 600, 600, 0.85);
      setSpeakerPhotoBase64(compressed);
    } catch (err) {
      console.error(err);
      alert('Could not compress photo. Please try a different image.');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    try {
      setIsCompressingCert(true);
      setCertFileName(file.name);
      const compressed = await compressImageToBase64(file, 900, 900, 0.85);
      setCertificateProofBase64(compressed);
    } catch (err) {
      console.error(err);
      alert('Could not compress certificate image.');
    } finally {
      setIsCompressingCert(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    if (selectedSkills.length === 0) {
      setStatus('error');
      setErrorMessage('Please select or add at least one technical skill.');
      return;
    }

    try {
      const appId = `SPK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newSpeaker: SpeakerApplication = {
        id: appId,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        designation: designation.trim(),
        talkTitle: talkTitle.trim(),
        sessionFormat,
        audienceLevel,
        abstract: abstract.trim(),
        speakerPhotoBase64: speakerPhotoBase64 || undefined,
        certificateProofBase64: certificateProofBase64 || undefined,
        certificateLink: certificateLink.trim() || undefined,
        skills: selectedSkills,
        linkedin: linkedin.trim() || undefined,
        github: github.trim() || undefined,
        status: 'UNDER_REVIEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSpeakerApplication(newSpeaker);
      setSubmittedAppId(appId);
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white relative">
      {/* Dynamic Glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] rounded-full blur-[150px] opacity-[0.06] pointer-events-none transition-colors duration-700 ${
          activeTab === 'speaker' ? 'bg-aws-orange' : 'bg-blue-500'
        }`}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-10 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group font-mono text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="font-sans font-black italic text-lg sm:text-xl uppercase tracking-tighter">
          AWS SCD <span className="text-aws-orange">KOLHAPUR</span>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-4 sm:px-8 lg:px-12 max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-aws-orange uppercase tracking-[0.25em] bg-aws-orange/10 px-3 py-1 rounded-full border border-aws-orange/20">
            <Sparkles size={12} />
            <span>Call For Proposals &amp; Partnerships / SCD 2026</span>
          </div>
          <h1 className="font-sans text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-tight">
            Speaker Application &amp;<br />
            <span className={activeTab === 'partner' ? 'text-blue-400' : 'text-aws-orange'}>
              {activeTab === 'partner' ? 'Community Partnerships' : 'Take the Stage'}
            </span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Share your cloud engineering experience with 400+ student builders, or review community partnership status for this edition.
          </p>
        </div>

        {/* Tab Switcher: Speaker vs Community Partner */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12 max-w-xl mx-auto font-mono text-xs uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveTab('speaker')}
            className={`flex-1 py-3.5 px-6 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer font-bold ${
              activeTab === 'speaker'
                ? 'bg-aws-orange text-black border-aws-orange shadow-lg shadow-aws-orange/20'
                : 'bg-[#111] text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Mic size={16} />
            <span>Become a Speaker in Upcoming Event</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partner')}
            className={`flex-1 py-3.5 px-6 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer font-bold ${
              activeTab === 'partner'
                ? 'bg-blue-500 text-black border-blue-500 shadow-lg shadow-blue-500/20'
                : 'bg-[#111] text-white/60 border-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Users size={16} />
            <span>Become a Community Partner</span>
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'partner' ? (
            /* Option 2: Community Partner -> Applications are Closed as requested */
            <motion.div
              key="partner-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[#0B101D] border border-blue-500/30 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl space-y-5">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
                  <Users size={32} />
                </div>
                <div className="space-y-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800">
                    Application Status: Closed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-tight">
                    Community Partner Applications Are Closed
                  </h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you to all developer communities, university clubs, and tech circles! Applications for official community partnership are currently closed for this upcoming edition.
                  </p>
                </div>

                <div className="bg-[#050811] border border-white/10 p-4 rounded-xl text-left space-y-2 font-mono text-xs text-slate-400 max-w-md mx-auto">
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <BadgeCheck size={14} className="text-blue-400" />
                    <span>Want to attend with your community members?</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bulk ticket passes and student club reservations are available through our registration terminal.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <span>View Student Ticket Passes →</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Option 1: Speaker Application Form */
            <motion.div
              key="speaker-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto"
            >
              {status === 'success' ? (
                <div className="bg-[#0D1525] border border-emerald-500/40 rounded-2xl p-8 sm:p-12 text-center space-y-5 animate-fade-in shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                    <Check size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="font-mono text-xs text-emerald-400 uppercase tracking-widest font-bold block">
                      Proposal Successfully Submitted
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black italic text-white uppercase tracking-tight">
                      Thank You, {fullName}!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                      Your talk proposal <strong className="text-amber-400">"{talkTitle}"</strong> has been logged into the review pipeline for AWS Student Community Day 2026.
                    </p>
                  </div>

                  <div className="bg-[#080C14] border border-[#233147] p-4 rounded-xl max-w-sm mx-auto font-mono text-xs space-y-1 text-left">
                    <div className="text-slate-400 text-[10px] uppercase">Speaker Proposal Reference:</div>
                    <div className="text-amber-400 text-lg font-bold select-all">{submittedAppId}</div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Email: {email} · Skills: {selectedSkills.join(', ')}
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle');
                        setTalkTitle('');
                        setAbstract('');
                        setSubmittedAppId('');
                      }}
                      className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Submit Another Proposal
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
                <div className="bg-[#0D1525] border border-[#233147] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-aws-orange via-amber-400 to-[#E10600]" />

                  <div className="border-b border-[#1E293B] pb-6 mb-8">
                    <span className="font-mono text-[10px] text-aws-orange uppercase tracking-widest font-bold block mb-1">
                      Speaker Grid Application / Call For Speakers
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight text-white">
                      Propose a Technical Session
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Fill out your speaker profile, upload your headshot, and provide AWS certifications or knowledge proof to present to regional builders.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name & Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Aditya Sharma"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Current Role / Designation *
                        </label>
                        <input
                          required
                          type="text"
                          value={designation}
                          onChange={e => setDesignation(e.target.value)}
                          placeholder="e.g. Senior Cloud Architect or B.Tech Student"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        />
                      </div>
                    </div>

                    {/* Organization, Email, Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Organization / College *
                        </label>
                        <input
                          required
                          type="text"
                          value={organization}
                          onChange={e => setOrganization(e.target.value)}
                          placeholder="e.g. GCOE Kolhapur / TCS"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="speaker@gmail.com"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Phone / WhatsApp *
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

                    {/* Talk Title */}
                    <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Proposed Talk / Session Title *
                      </label>
                      <input
                        required
                        type="text"
                        value={talkTitle}
                        onChange={e => setTalkTitle(e.target.value)}
                        placeholder="e.g. Building Resilient Serverless Architectures with AWS Lambda & EventBridge"
                        className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                      />
                    </div>

                    {/* Session Format & Audience Level */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Session Format *
                        </label>
                        <select
                          value={sessionFormat}
                          onChange={e => setSessionFormat(e.target.value)}
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        >
                          <option value="30-min Technical Presentation">30-min Technical Presentation (Slides + Demo)</option>
                          <option value="45-min Deep Dive with Architecture">45-min Architectural Deep Dive</option>
                          <option value="20-min Fast-Paced Lightning Talk">20-min Fast-Paced Lightning Talk</option>
                          <option value="60-min Hands-on Interactive Workshop">60-min Hands-on Interactive Workshop</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Target Audience Technical Level *
                        </label>
                        <select
                          value={audienceLevel}
                          onChange={e => setAudienceLevel(e.target.value)}
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2.5 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none"
                        >
                          <option value="Level 100 - Beginner">Level 100 - Beginner / Student Friendly</option>
                          <option value="Level 200 - Intermediate">Level 200 - Intermediate / Practical Deployment</option>
                          <option value="Level 300 - Advanced">Level 300 - Advanced / Deep Architecture</option>
                        </select>
                      </div>
                    </div>

                    {/* Abstract / Summary */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Session Abstract &amp; Key Takeaways *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={abstract}
                        onChange={e => setAbstract(e.target.value)}
                        placeholder="Provide an overview of your session, architectural diagrams covered, practical demos, and what attendees will learn..."
                        className="w-full bg-[#080C14] border border-[#243044] rounded-lg p-3 text-white text-xs sm:text-sm font-sans focus:border-aws-orange outline-none resize-none"
                      />
                    </div>

                    {/* Speaker Photo Upload */}
                    <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Speaker Headshot / Photo
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">JPG, PNG (Max 5MB)</span>
                      </div>

                      {speakerPhotoBase64 ? (
                        <div className="bg-[#080C14] border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={speakerPhotoBase64}
                              alt="Speaker preview"
                              className="w-12 h-12 object-cover rounded-full border border-white/20"
                            />
                            <div className="min-w-0">
                              <span className="text-xs text-white font-mono block truncate">
                                {photoFileName || 'Speaker Photo'}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                <Check size={12} /> Ready
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSpeakerPhotoBase64('');
                              setPhotoFileName('');
                            }}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-mono transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#243044] hover:border-aws-orange rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080C14]/60">
                          <Upload size={18} className="text-slate-400 mb-1" />
                          <span className="text-xs text-slate-200 font-sans font-medium">
                            {isCompressingPhoto ? 'Processing photo…' : 'Click to Upload Speaker Photo'}
                          </span>
                          <span className="text-[10px] text-slate-500">Will be featured on event flyers and schedules</span>
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

                    {/* AWS Certificate / Proof Upload */}
                    <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Award size={13} className="text-amber-400" />
                          <span>AWS Certification or Knowledge Proof (Photo / Certificate)</span>
                        </label>
                        <span className="text-[10px] font-mono text-slate-400">Certificate, Badge, or Demo Proof</span>
                      </div>

                      {certificateProofBase64 ? (
                        <div className="bg-[#080C14] border border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={certificateProofBase64}
                              alt="Certificate preview"
                              className="w-14 h-14 object-contain rounded-lg border border-white/20 bg-black"
                            />
                            <div className="min-w-0">
                              <span className="text-xs text-white font-mono block truncate">
                                {certFileName || 'Certificate Proof'}
                              </span>
                              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                                <Check size={12} /> Proof Attached
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCertificateProofBase64('');
                              setCertFileName('');
                            }}
                            className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-mono transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-[#243044] hover:border-amber-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080C14]/60">
                          <Award size={18} className="text-amber-400 mb-1" />
                          <span className="text-xs text-slate-200 font-sans font-medium">
                            {isCompressingCert ? 'Processing certificate image…' : 'Click to Upload AWS Certificate / Badge Screenshot'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Shows committee your hands-on cloud proficiency (Optional but Recommended)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCertUpload}
                            disabled={isCompressingCert}
                            className="hidden"
                          />
                        </label>
                      )}

                      <div className="pt-1">
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Or Credly Badge URL / GitHub Project Proof:
                        </label>
                        <input
                          type="url"
                          value={certificateLink}
                          onChange={e => setCertificateLink(e.target.value)}
                          placeholder="https://www.credly.com/badges/... or https://github.com/..."
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-amber-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Technical Skills & Custom Skill Adder */}
                    <div className="space-y-3 pt-2 border-t border-[#1E293B]">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300">
                          Select Your Skills &amp; Add Custom Skills *
                        </label>
                        <span className="text-[10px] font-mono text-aws-orange">
                          {selectedSkills.length} selected
                        </span>
                      </div>

                      {/* Selected Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#080C14] border border-[#1E293B] min-h-[44px]">
                        {selectedSkills.length === 0 ? (
                          <span className="text-xs text-slate-500 font-mono">No skills selected yet. Click presets below or type custom skill.</span>
                        ) : (
                          selectedSkills.map(skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-aws-orange/20 border border-aws-orange/50 text-white font-mono text-xs font-bold"
                            >
                              <span>{skill}</span>
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="text-amber-300 hover:text-white cursor-pointer ml-0.5"
                                title={`Remove ${skill}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Custom Skill Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customSkillInput}
                          onChange={e => setCustomSkillInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomSkill();
                            }
                          }}
                          placeholder="Type custom skill (e.g. Terraform, DynamoDB, FinOps, AWS CDK)..."
                          className="flex-1 bg-[#080C14] border border-[#243044] rounded-lg px-3 py-2 text-white text-xs font-mono focus:border-aws-orange outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomSkill()}
                          className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-aws-orange hover:text-black text-white font-mono text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus size={14} />
                          <span>Add Skill</span>
                        </button>
                      </div>

                      {/* Preset Skill Suggestions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-mono text-slate-500 w-full mb-0.5 uppercase tracking-wider">
                          Suggested Preset Tags:
                        </span>
                        {PRESET_SKILLS.map(preset => {
                          const isSelected = selectedSkills.includes(preset);
                          return (
                            <button
                              type="button"
                              key={preset}
                              onClick={() => togglePresetSkill(preset)}
                              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-aws-orange text-black font-bold border-aws-orange'
                                  : 'bg-[#080C14] border-[#243044] text-slate-400 hover:text-white'
                              }`}
                            >
                              {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1E293B]">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Linkedin size={13} className="text-blue-400" />
                          <span>LinkedIn Profile URL</span>
                        </label>
                        <input
                          type="url"
                          value={linkedin}
                          onChange={e => setLinkedin(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2 text-white text-xs font-mono focus:border-aws-orange outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <Github size={13} className="text-slate-300" />
                          <span>GitHub Profile / Repo</span>
                        </label>
                        <input
                          type="url"
                          value={github}
                          onChange={e => setGithub(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full bg-[#080C14] border border-[#243044] rounded-lg px-3.5 py-2 text-white text-xs font-mono focus:border-aws-orange outline-none"
                        />
                      </div>
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
                      <span>{status === 'loading' ? 'Submitting Session Proposal…' : 'Submit Speaker Proposal'}</span>
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030303] py-8 px-4 text-center text-xs font-mono text-slate-500">
        <p>© 2026 AWS Student Community Day Kolhapur. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">Organized by student builders at V.T. Patil Hall, Kolhapur.</p>
      </footer>
    </div>
  );
};
