import React, { useState, useEffect, useRef } from 'react';
import SocialBadge from './components/SocialBadge';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  Check,
  Terminal,
  Laptop,
  Users,
  Award,
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  Linkedin,
  Layers,
  Cpu,
  Shield,
  Cloud,
  Database,
  Box,
  GraduationCap
} from 'lucide-react';

// AWS Logo SVG Component
function AwsLogo({ className = "h-8 w-auto", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 304 182" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M86.4,66.4c0,3.7,0.4,6.7,1.1,8.9c0.8,2.2,1.8,4.6,3.2,7.2c0.5,0.8,0.7,1.6,0.7,2.3c0,1-0.6,2-1.9,3l-6.3,4.2 c-0.9,0.6-1.8,0.9-2.6,0.9c-1,0-2-0.5-3-1.4C76.2,90,75,88.4,74,86.8c-1-1.7-2-3.6-3.1-5.9c-7.8,9.2-17.6,13.8-29.4,13.8 c-8.4,0-15.1-2.4-20-7.2c-4.9-4.8-7.4-11.2-7.4-19.2c0-8.5,3-15.4,9.1-20.6c6.1-5.2,14.2-7.8,24.5-7.8c3.4,0,6.9,0.3,10.6,0.8 c3.7,0.5,7.5,1.3,11.5,2.2v-7.3c0-7.6-1.6-12.9-4.7-16c-3.2-3.1-8.6-4.6-16.3-4.6c-3.5,0-7.1,0.4-10.8,1.3c-3.7,0.9-7.3,2-10.8,3.4 c-1.6,0.7-2.8,1.1-3.5,1.3c-0.7,0.2-1.2,0.3-1.6,0.3c-1.4,0-2.1-1-2.1-3.1v-4.9c0-1.6,0.2-2.8,0.7-3.5c0.5-0.7,1.4-1.4,2.8-2.1 c3.5-1.8,7.7-3.3,12.6-4.5c4.9-1.3,10.1-1.9,15.6-1.9c11.9,0,20.6,2.7,26.2,8.1c5.5,5.4,8.3,13.6,8.3,24.6V66.4z M45.8,81.6 c3.3,0,6.7-0.6,10.3-1.8c3.6-1.2,6.8-3.4,9.5-6.4c1.6-1.9,2.8-4,3.4-6.4c0.6-2.4,1-5.3,1-8.7v-4.2c-2.9-0.7-6-1.3-9.2-1.7 c-3.2-0.4-6.3-0.6-9.4-0.6c-6.7,0-11.6,1.3-14.9,4c-3.3,2.7-4.9,6.5-4.9,11.5c0,4.7,1.2,8.2,3.7,10.6 C37.7,80.4,41.2,81.6,45.8,81.6z M126.1,92.4c-1.8,0-3-0.3-3.8-1c-0.8-0.6-1.5-2-2.1-3.9L96.7,10.2c-0.6-2-0.9-3.3-0.9-4 c0-1.6,0.8-2.5,2.4-2.5h9.8c1.9,0,3.2,0.3,3.9,1c0.8,0.6,1.4,2,2,3.9l16.8,66.2l15.6-66.2c0.5-2,1.1-3.3,1.9-3.9c0.8-0.6,2.2-1,4-1 h8c1.9,0,3.2,0.3,4,1c0.8,0.6,1.5,2,1.9,3.9l15.8,67l17.3-67c0.6-2,1.3-3.3,2-3.9c0.8-0.6,2.1-1,3.9-1h9.3c1.6,0,2.5,0.8,2.5,2.5 c0,0.5-0.1,1-0.2,1.6c-0.1,0.6-0.3,1.4-0.7,2.5l-24.1,77.3c-0.6,2-1.3,3.3-2.1,3.9c-0.8,0.6-2.1,1-3.8,1h-8.6c-1.9,0-3.2-0.3-4-1 c-0.8-0.7-1.5-2-1.9-4L156,23l-15.4,64.4c-0.5,2-1.1,3.3-1.9,4c-0.8,0.7-2.2,1-4,1H126.1z M254.6,95.1c-5.2,0-10.4-0.6-15.4-1.8 c-5-1.2-8.9-2.5-11.5-4c-1.6-0.9-2.7-1.9-3.1-2.8c-0.4-0.9-0.6-1.9-0.6-2.8v-5.1c0-2.1,0.8-3.1,2.3-3.1c0.6,0,1.2,0.1,1.8,0.3 c0.6,0.2,1.5,0.6,2.5,1c3.4,1.5,7.1,2.7,11,3.5c4,0.8,7.9,1.2,11.9,1.2c6.3,0,11.2-1.1,14.6-3.3c3.4-2.2,5.2-5.4,5.2-9.5 c0-2.8-0.9-5.1-2.7-7c-1.8-1.9-5.2-3.6-10.1-5.2L246,52c-7.3-2.3-12.7-5.7-16-10.2c-3.3-4.4-5-9.3-5-14.5c0-4.2,0.9-7.9,2.7-11.1 c1.8-3.2,4.2-6,7.2-8.2c3-2.3,6.4-4,10.4-5.2c4-1.2,8.2-1.7,12.6-1.7c2.2,0,4.5,0.1,6.7,0.4c2.3,0.3,4.4,0.7,6.5,1.1 c2,0.5,3.9,1,5.7,1.6c1.8,0.6,3.2,1.2,4.2,1.8c1.4,0.8,2.4,1.6,3,2.5c0.6,0.8,0.9,1.9,0.9,3.3v4.7c0,2.1-0.8,3.2-2.3,3.2 c-0.8,0-2.1-0.4-3.8-1.2c-5.7-2.6-12.1-3.9-19.2-3.9c-5.7,0-10.2,0.9-13.3,2.8c-3.1,1.9-4.7,4.8-4.7,8.9c0,2.8,1,5.2,3,7.1 c2,1.9,5.7,3.8,11,5.5l14.2,4.5c7.2,2.3,12.4,5.5,15.5,9.6c3.1,4.1,4.6,8.8,4.6,14c0,4.3-0.9,8.2-2.6,11.6 c-1.8,3.4-4.2,6.4-7.3,8.8c-3.1,2.5-6.8,4.3-11.1,5.6C264.4,94.4,259.7,95.1,254.6,95.1z"
        fill={dark ? "#FAFAFA" : "#252F3E"}
      />
      <path
        d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4 c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z"
        fill="#FF9900"
      />
      <path
        d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5 c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z"
        fill="#FF9900"
      />
    </svg>
  );
}

const ROTATING_TAGS = ['AI/ML', 'SERVERLESS', 'DEVOPS', 'CLOUD', 'DATA', 'SECURITY', 'CONTAINERS'];
const BG_TEXTS = ['DevOps', 'Serverless', 'Cloud', 'AI/ML', 'Data', 'Security', 'Containers'];

export default function App() {
  // Preloader state
  const [showIntro, setShowIntro] = useState(true);
  const [introDismissed, setIntroDismissed] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [typedTitle, setTypedTitle] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Navigation & Interactive states
  const [activeSection, setActiveSection] = useState('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tagIndex, setTagIndex] = useState(0);
  const [selectedSpeakerIndex, setSelectedSpeakerIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Stats counter state
  const [hasCountedStats, setHasCountedStats] = useState(false);
  const [statAttendees, setStatAttendees] = useState(0);
  const [statSpeakers, setStatSpeakers] = useState(0);
  const [statSessions, setStatSessions] = useState(0);

  // References
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // 1. Preloader Effect
  useEffect(() => {
    if (introDismissed) return;

    // Body scroll lock during intro
    document.body.style.overflow = 'hidden';

    // Typewriter title
    const fullTitle = 'Community Day Mysuru 2026';
    let currentIdx = 0;
    const typeTimer = setInterval(() => {
      if (currentIdx <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, currentIdx));
        currentIdx++;
      } else {
        clearInterval(typeTimer);
      }
    }, 70);

    // Terminal lines
    const logs = [
      'Initializing AWS Community Day protocol...',
      'Connecting to AP-SOUTH-1 region...',
      'Loading speaker keynotes...',
      'Provisioning workshop instances...',
      'ALL_SYSTEMS_OPERATIONAL: [READY]'
    ];
    let logIdx = 0;
    const logTimer = setInterval(() => {
      if (logIdx < logs.length) {
        const nextLog = logs[logIdx];
        setTerminalLogs(prev => [...prev, nextLog]);
        logIdx++;
      } else {
        clearInterval(logTimer);
      }
    }, 450);

    // Progress counter (0 to 100)
    const duration = 2800;
    const interval = 28;
    const step = 100 / (duration / interval);
    const counterTimer = setInterval(() => {
      setIntroProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(counterTimer);
          setTimeout(() => {
            handleDismissIntro();
          }, 600);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => {
      clearInterval(typeTimer);
      clearInterval(logTimer);
      clearInterval(counterTimer);
      document.body.style.overflow = '';
    };
  }, [introDismissed]);

  const handleDismissIntro = () => {
    setIntroDismissed(true);
    document.body.style.overflow = '';
    setTimeout(() => {
      setShowIntro(false);
    }, 600);
  };

  // 2. Rotating Taglines Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTagIndex(prev => (prev + 1) % ROTATING_TAGS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // 3. Stats Count-up Effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasCountedStats) {
          setHasCountedStats(true);
          // Animate attendees to 500
          animateValue(0, 500, 1600, setStatAttendees);
          // Animate speakers to 15
          animateValue(0, 15, 1200, setStatSpeakers);
          // Animate sessions to 12
          animateValue(0, 12, 1000, setStatSessions);
        }
      },
      { threshold: 0.2 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [hasCountedStats]);

  function animateValue(start: number, end: number, duration: number, setter: (val: number) => void) {
    const startTime = performance.now();
    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setter(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setter(end);
      }
    }
    requestAnimationFrame(step);
  }

  // 4. Scroll spy for navigation highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['top', 'about', 'speakers', 'tickets', 'sponsors', 'workshops', 'agenda', 'team', 'venue', 'faq', 'badge'];
      const scrollPos = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel controls
  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Speakers list
  const speakers = [
    {
      id: 'jessica',
      name: 'Jessica Gilmore',
      role: 'Manager, Community Groups @Amazon',
      talk: 'Keynote: Empowering Global Builders & Community Growth',
      badge: 'AWS Keynote',
      image: 'https://scd.awsmysuru.in/speakers/Jessica.jpg',
      linkedin: 'https://www.linkedin.com/in/jessicagilmore1/',
      isTba: false
    },
    { id: 'tba-1', name: 'To Be Announced', role: 'Distinguished Cloud Architect', talk: 'Topic coming soon', isTba: true },
    { id: 'tba-2', name: 'To Be Announced', role: 'Senior Developer Advocate', talk: 'Topic coming soon', isTba: true },
    { id: 'tba-3', name: 'To Be Announced', role: 'AWS Community Hero', talk: 'Topic coming soon', isTba: true },
    { id: 'tba-4', name: 'To Be Announced', role: 'GenAI & Bedrock Specialist', talk: 'Topic coming soon', isTba: true },
    { id: 'tba-5', name: 'To Be Announced', role: 'Container Solutions Lead', talk: 'Topic coming soon', isTba: true }
  ];

  const activeSpeaker = speakers[selectedSpeakerIndex] || speakers[0];

  // FAQ list
  const faqs = [
    {
      q: 'What is AWS Community Day?',
      a: "AWS Community Day is a community-organized, one-day conference featuring technical talks, workshops, and networking events. It's organized by and for the local AWS community — students, developers, and cloud enthusiasts."
    },
    {
      q: 'Who should attend this event?',
      a: 'Anyone curious about AWS and cloud computing! Students, developers, architects, and cloud enthusiasts of all skill levels are welcome. No gatekeeping — beginners welcomed at the front.'
    },
    {
      q: 'Do I need to bring my laptop?',
      a: "Yes! For workshops you'll need a laptop. Talks don't require one, but it's handy to have. Make sure your AWS CLI is configured if you plan to attend the GenAI or Cloud workshops."
    },
    {
      q: 'Are there any prerequisites for the workshops?',
      a: 'Each workshop has its own requirements. The GenAI workshop requires a laptop with AWS Account/CLI configured. The Kubernetes workshop requires Docker basics and terminal experience. Full details are in the workshop descriptions above.'
    },
    {
      q: 'Will food and beverages be provided?',
      a: 'Yes! All ticket tiers include Morning Snacks, Lunch, and Hi-Tea throughout the event day.'
    },
    {
      q: 'How can I become a speaker or sponsor?',
      a: 'Reach out to us at aws@vvce.ac.in to discuss speaking slots or sponsorship opportunities. We would love to partner with you!'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EFF0F3] text-[#23303E] relative overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          INTRO / PRELOADER SCREEN
      ───────────────────────────────────────────────────────────── */}
      {showIntro && (
        <div
          id="intro-screen"
          className={`fixed inset-0 z-[9999] bg-[#fbfbfb] flex flex-col justify-between p-6 sm:p-10 transition-all duration-700 ease-out select-none ${
            introDismissed ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 z-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-[11px] sm:text-xs text-[#8c97a5] uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <AwsLogo className="h-6 sm:h-7 w-auto" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 bg-[#23303E]/5 px-2.5 py-1 rounded-sm border border-[#23303E]/10">
                <span className="w-2 h-2 rounded-full bg-[#01c1ac] animate-pulse" />
                <span className="hidden xs:inline">AP-SOUTH-1</span>
                <span className="text-[#23303E]/30 hidden xs:inline">•</span>
                <span className="font-mono text-[10px] sm:text-xs text-[#23303E]">12.2958° N, 76.6394° E</span>
              </div>
              <button
                onClick={handleDismissIntro}
                className="text-[11px] font-mono uppercase bg-[#23303E] text-white px-2.5 py-1 rounded-sm hover:bg-[#01c1ac] hover:text-[#23303E] transition-colors cursor-pointer"
              >
                Skip [Esc]
              </button>
            </div>
          </div>

          {/* Center Title Content */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-8">
            <div className="flex flex-wrap items-baseline justify-center gap-2 sm:gap-3 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#23303E]">
              <span className="text-[#FF9900]">AWS</span>
              <span className="bg-gradient-to-r from-[#1a232f] to-[#23303e] bg-clip-text text-transparent">
                {typedTitle}
              </span>
              <span className="font-light text-[#23303E] animate-cursor">|</span>
            </div>
            <p className="font-mono text-[11px] sm:text-xs md:text-sm text-[#64748b] mt-4 tracking-widest uppercase">
              STUDENT COMMUNITY DAY &nbsp;//&nbsp; NOV 21, 2026 &nbsp;•&nbsp; VVCE MYSURU
            </p>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-[#FF9900] to-[#01c1ac] mt-6 rounded-full" />
          </div>

          {/* Bottom Bar: Terminal & Counter */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="font-mono text-[11px] text-[#64748b] leading-relaxed max-w-md w-full space-y-0.5">
              {terminalLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-1.5 ${
                    index === terminalLogs.length - 1 && log.includes('READY') ? 'text-[#01c1ac] font-bold' : ''
                  }`}
                >
                  <span className="text-[#01c1ac] select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
            <div className="self-end sm:self-auto flex items-baseline">
              <span className="font-extrabold text-5xl sm:text-7xl md:text-8xl text-[#23303E] tracking-tighter leading-none">
                {Math.floor(introProgress).toString().padStart(3, '0')}
              </span>
              <span className="font-mono text-sm sm:text-lg text-[#64748b] font-semibold ml-1">%</span>
            </div>
          </div>

          {/* Progress Bar at very bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/5">
            <div
              className="h-full bg-gradient-to-r from-[#23303E] via-[#01c1ac] to-[#FF9900] transition-all duration-75 ease-linear"
              style={{ width: `${introProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STICKY HEADER / NAV
      ───────────────────────────────────────────────────────────── */}
      <header
        id="main-header"
        className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#23303E]/10 transition-shadow duration-300 shadow-sm"
      >
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between">
          {/* Logo brand */}
          <a href="#top" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none">
            <AwsLogo className="h-7 sm:h-9 w-auto transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-[15px] tracking-tight text-[#23303E] leading-none">
                COMMUNITY DAY
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-[#23303E]/70 mt-1 flex items-center gap-1">
                MYSURU 2026 <span className="text-[#01c1ac] font-bold">·</span>{' '}
                <span className="text-[#01c1ac] font-bold inline-block min-w-[50px] transition-all duration-300">
                  {ROTATING_TAGS[tagIndex]}
                </span>
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-6 xl:gap-8">
            {[
              { href: '#about', label: 'About', id: 'about' },
              { href: '#speakers', label: 'Speakers', id: 'speakers' },
              { href: '#tickets', label: 'Tickets', id: 'tickets' },
              { href: '#sponsors', label: 'Sponsors', id: 'sponsors' },
              { href: '#workshops', label: 'Workshops', id: 'workshops' },
              { href: '#agenda', label: 'Schedule', id: 'agenda' },
              { href: '#team', label: 'Team', id: 'team' },
              { href: '#faq', label: 'FAQ', id: 'faq' },
              { href: '#badge', label: 'Badge', id: 'badge' }
            ].map(link => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-[13.5px] font-medium transition-colors relative py-1 ${
                    isActive ? 'text-[#01c1ac] font-semibold' : 'text-[#23303E] hover:text-[#01c1ac]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#01c1ac] rounded-full" />
                  )}
                </a>
              );
            })}
            <a
              href="#tickets"
              className="ml-2 inline-flex items-center gap-2 bg-[#23303E] text-white hover:bg-[#01c1ac] hover:text-[#23303E] font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors duration-200"
            >
              Get Tickets
            </a>
          </nav>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <a
              href="#tickets"
              className="text-xs font-mono font-bold uppercase bg-[#23303E] text-white px-3 py-1.5 rounded-sm"
            >
              Tickets
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#23303E] hover:bg-black/5 rounded-md border border-[#23303E]/15 transition-colors focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#23303E]/10 px-4 py-4 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {[
              { href: '#about', label: 'About' },
              { href: '#speakers', label: 'Speakers' },
              { href: '#tickets', label: 'Tickets' },
              { href: '#sponsors', label: 'Sponsors' },
              { href: '#workshops', label: 'Workshops' },
              { href: '#agenda', label: 'Schedule' },
              { href: '#team', label: 'Team' },
              { href: '#faq', label: 'FAQ' },
              { href: '#badge', label: 'Badge' }
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-[#23303E] hover:bg-[#EFF0F3] hover:text-[#01c1ac] rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
      ───────────────────────────────────────────────────────────── */}
      <section
        id="top"
        ref={heroRef}
        className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-end overflow-hidden pt-24 sm:pt-28 pb-8 sm:pb-12"
        style={{
          background: 'linear-gradient(135deg, #5BC85A 0%, #1EB89C 40%, #00A0C0 70%, #0085A3 100%)'
        }}
      >
        {/* Decorative Watermark Tag Text */}
        <div
          aria-hidden="true"
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-[100px] xs:text-[140px] sm:text-[200px] md:text-[260px] lg:text-[320px] font-black text-white/[0.08] pointer-events-none select-none tracking-tighter leading-none transition-all duration-700 uppercase"
        >
          {BG_TEXTS[tagIndex]}
        </div>

        <div className="relative z-10 max-w-[1720px] w-full mx-auto px-4 sm:px-8 lg:px-10 flex flex-col gap-8 sm:gap-12 mt-auto">
          {/* Main Heading & Intro */}
          <div className="max-w-3xl">
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold text-white leading-[1.06] tracking-tight drop-shadow-sm">
              Where Builders
              <br />
              Meet{' '}
              <span className="text-[#FAFAFA] underline decoration-[#01c1ac] decoration-4 sm:decoration-6 underline-offset-4 sm:underline-offset-8 transition-all duration-300">
                {ROTATING_TAGS[tagIndex]}
              </span>
              .
            </h1>
            <p className="mt-5 sm:mt-7 text-base sm:text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed font-normal drop-shadow-sm">
              A one-day, community-run AWS conference for students, developers, architects, and the cloud-curious.
              Deep talks, hands-on workshops, and the kind of people you'll want to build the future with.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-md mt-6 sm:mt-8">
              <div className="bg-[#222b38]/20 backdrop-blur-md border border-white/20 p-3 sm:p-4 text-center rounded-lg shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {statAttendees}+
                </p>
                <p className="font-mono text-[9px] sm:text-[11px] text-white/80 font-bold uppercase tracking-wider mt-1">
                  Attendees
                </p>
              </div>
              <div className="bg-[#222b38]/20 backdrop-blur-md border border-white/20 p-3 sm:p-4 text-center rounded-lg shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {statSpeakers}+
                </p>
                <p className="font-mono text-[9px] sm:text-[11px] text-white/80 font-bold uppercase tracking-wider mt-1">
                  Speakers
                </p>
              </div>
              <div className="bg-[#222b38]/20 backdrop-blur-md border border-white/20 p-3 sm:p-4 text-center rounded-lg shadow-sm">
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {statSessions}+
                </p>
                <p className="font-mono text-[9px] sm:text-[11px] text-white/80 font-bold uppercase tracking-wider mt-1">
                  Sessions
                </p>
              </div>
            </div>
          </div>

          {/* Hero Bottom Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4 border-t border-white/15">
            <div className="flex flex-wrap items-center gap-4 sm:gap-8 font-mono text-xs sm:text-sm text-white/95 tracking-wider uppercase font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#01c1ac]" />
                <span>MYSURU, INDIA</span>
              </div>
              <span className="hidden sm:inline text-white/40">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#01c1ac]" />
                <span>NOVEMBER 21, 2026</span>
              </div>
            </div>

            <a
              href="#tickets"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-6 sm:px-8 bg-[#23303E] hover:bg-[#1a232f] text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto self-start sm:self-auto"
            >
              <span>GET TICKETS</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ABOUT SECTION (WHAT YOU CAN EXPECT)
      ───────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 sm:py-24 bg-[#EFF0F3] overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#23303E]">
                What you can expect
              </h2>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-[#64748b] max-w-2xl leading-relaxed">
                AWS Community Day is a <strong>full day</strong> of talks, workshops, and hallway conversations
                organized by the local AWS community. No gatekeeping. Beginners welcomed at the front.
              </p>
            </div>
            {/* Carousel navigation controls */}
            <div className="flex items-center gap-2 self-start md:self-end">
              <button
                onClick={() => handleScrollCarousel('left')}
                aria-label="Previous cards"
                className="w-10 h-10 flex items-center justify-center bg-white border border-[#23303E]/20 text-[#23303E] hover:bg-[#23303E] hover:text-white transition-colors cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScrollCarousel('right')}
                aria-label="Next cards"
                className="w-10 h-10 flex items-center justify-center bg-white border border-[#23303E]/20 text-[#23303E] hover:bg-[#23303E] hover:text-white transition-colors cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cards Row (Touch scrollable + controls) */}
          <div
            ref={carouselRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 -mx-4 px-4 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 no-scrollbar snap-x snap-mandatory"
          >
            {/* Card 1 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Award className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Speaker Keynotes
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  Hear from AWS Heroes, Community Builders, and senior engineers sharing real-world cloud insights,
                  lessons, and systems.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Users className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Community Conversations
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  Meet the local cloud community — engineers, founders, students, and hiring teams across Mysuru and
                  beyond.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Terminal className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Technical Sessions
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  Bring your laptop. Explore cloud architecture, AI, DevOps, serverless, and leave with working code.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Laptop className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Career Opportunities
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  Connect directly with sponsor booths and cloud teams hiring across cloud, ML, DevOps, and platform
                  roles.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Sparkles className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Welcoming Community
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  A student-friendly, community-run conference. First-timers and cloud newcomers are enthusiastically
                  welcomed at the front.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#23303E] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start border border-[#23303E]">
              <div>
                <Box className="w-11 h-11 text-[#FAFAFA] stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-[26px] text-[#FAFAFA] font-normal leading-tight tracking-tight">
                  Swag &amp; Giveaways
                </h3>
                <p className="text-xs sm:text-[13px] text-white/75 font-light leading-relaxed mt-2.5">
                  Surprise drops, exclusive community badges, and official AWS merchandise throughout the entire day.
                </p>
              </div>
            </div>

            {/* Terminal Card */}
            <div className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[340px] h-[320px] sm:h-[340px] bg-[#1a232f] border border-[#1e293b] p-7 flex flex-col justify-between rounded-none shadow-md hover:-translate-y-1 transition-transform snap-start">
              <div className="flex items-center justify-between w-full">
                <Terminal className="w-11 h-11 text-[#01c1ac] stroke-[1.5]" />
                <span className="font-mono text-[11px] text-white/40 tracking-wider uppercase">
                  mysuru builder
                </span>
              </div>
              <div className="font-mono text-sm leading-relaxed space-y-1">
                <p className="text-white/80">
                  <span className="text-[#a2e048] font-bold">$</span> whoami
                </p>
                <p className="text-[#01c1ac] font-bold text-lg">builder</p>
                <p className="text-white/80 pt-1">
                  <span className="text-[#a2e048] font-bold">$</span> deploy --your potential
                </p>
                <p className="text-[#38bdf8] font-medium pt-1">→ Build Once. Scale Forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SPEAKERS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="speakers" className="relative py-20 sm:py-24 bg-[#23303E] text-white overflow-hidden">
        {/* Wave background decoration */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-5">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <path d="M0,200 Q300,100 600,300 T1000,200" stroke="white" strokeWidth="2" />
            <path d="M0,300 Q300,200 600,400 T1000,300" stroke="white" strokeWidth="2" />
            <path d="M0,400 Q300,300 600,500 T1000,400" stroke="white" strokeWidth="2" />
            <path d="M0,500 Q300,400 600,600 T1000,500" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 sm:mb-16">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
                Meet the Speakers
                <br />
                Shaping What's Next
              </h2>
            </div>
            <a
              href="#agenda"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#D1E5CD] hover:bg-[#CDE3CB] text-[#23303E] font-mono text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <span>VIEW ALL SESSIONS</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Speakers Grid: Laptop (2-col) & Mobile (Responsive Unified Card View) */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-2 border-[#2D3C4E] bg-[#23303E]">
            {/* Left list: 7 cols on desktop */}
            <div className="md:col-span-7 flex flex-col md:border-r-2 border-[#2D3C4E]">
              {speakers.map((sp, idx) => {
                const isSelected = selectedSpeakerIndex === idx;
                if (!sp.isTba) {
                  return (
                    <div
                      key={sp.id}
                      onClick={() => setSelectedSpeakerIndex(idx)}
                      className={`p-6 sm:p-8 cursor-pointer border-b-2 border-[#2D3C4E] transition-colors ${
                        isSelected ? 'bg-[#2D3C4E]' : 'hover:bg-[#2D3C4E]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
                          {sp.name}
                        </h3>
                        {sp.linkedin && (
                          <a
                            href={sp.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${sp.name} LinkedIn`}
                            onClick={e => e.stopPropagation()}
                            className="p-1.5 text-white/70 hover:text-[#D1E5CD] transition-colors"
                          >
                            <Linkedin className="w-5 h-5 fill-current" />
                          </a>
                        )}
                      </div>
                      <p className="font-mono text-xs uppercase tracking-wider text-[#D1E5CD] mt-2">
                        Manager, Community Groups <span className="text-[#a2e048] font-bold">@Amazon</span>
                      </p>
                      <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                        {sp.talk}
                      </p>

                      {/* Mobile inline preview if on small screen */}
                      <div className="mt-4 md:hidden rounded-lg overflow-hidden border border-[#2D3C4E] bg-[#1a232f]">
                        <div className="relative aspect-[4/3] w-full">
                          <img
                            src={sp.image}
                            alt={sp.name}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              // If remote image fails, show stylish fallback
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#1a232f] via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 bg-[#D1E5CD] text-[#23303E] font-mono text-[10px] font-bold uppercase px-2.5 py-1">
                            {sp.badge}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // TBA row
                return (
                  <div
                    key={sp.id}
                    onClick={() => setSelectedSpeakerIndex(idx)}
                    className={`p-6 sm:p-8 cursor-pointer border-b-2 last:border-b-0 border-[#2D3C4E] transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-[#2D3C4E]/70' : 'hover:bg-[#2D3C4E]/40'
                    }`}
                  >
                    <div className="flex flex-col gap-2 w-full max-w-xs">
                      <div className="h-5 bg-[#29384A]/60 w-44 sm:w-56 rounded-none animate-shimmer" />
                      <div className="h-3.5 bg-[#29384A]/40 w-28 sm:w-36 rounded-none" />
                    </div>
                    <span className="font-mono text-[10px] sm:text-xs text-[#5A6C86] uppercase tracking-wider font-semibold">
                      To Be Announced
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right Photo Panel: 5 cols on desktop (Visible on desktop/laptop) */}
            <div className="hidden md:flex md:col-span-5 relative bg-[#1a232f] min-h-[540px] flex-col justify-end overflow-hidden">
              {activeSpeaker.image ? (
                <>
                  <img
                    src={activeSpeaker.image}
                    alt={activeSpeaker.name}
                    className="absolute inset-0 w-full h-full object-cover object-top filter grayscale-[10%]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#23303E] via-[#23303E]/40 to-transparent opacity-90" />
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a232f] text-white/30 font-mono text-sm uppercase">
                  <AwsLogo className="h-14 w-auto opacity-20 mb-3" dark />
                  <span>Announcement Pending</span>
                </div>
              )}

              {/* Panel Info Overlay */}
              <div className="relative z-10 p-7 w-full bg-gradient-to-t from-[#23303E] via-[#23303E]/90 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold bg-[#D1E5CD] text-[#23303E] px-2.5 py-1">
                    {activeSpeaker.badge || 'Speaker TBA'}
                  </span>
                  {activeSpeaker.linkedin && (
                    <a
                      href={activeSpeaker.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#23303E]/90 border border-[#D1E5CD]/40 text-white hover:bg-[#D1E5CD] hover:text-[#23303E] px-3 py-1 font-mono text-[11px] font-semibold transition-colors"
                    >
                      <Linkedin className="w-3.5 h-3.5 fill-current" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
                <p className="text-2xl font-bold text-white tracking-tight">{activeSpeaker.name}</p>
                <p className="font-mono text-xs text-[#a2e048] mt-0.5">{activeSpeaker.role}</p>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">{activeSpeaker.talk}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TICKETS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="tickets" className="py-20 sm:py-24 bg-[#D1E5CD] text-[#23303E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#23303E]">
              Tickets for every builder
            </h2>
            <p className="mt-3 text-base sm:text-lg md:text-xl text-[#23303E]/90 font-light">
              Join AWS Student Community Day Mysuru 2026 with access to talks, workshops, and community experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-10 sm:mt-12">
            {/* Super Early Bird */}
            <div className="bg-[#23303E] text-white p-6 sm:p-8 flex flex-col justify-between rounded-none shadow-lg border border-[#23303E] transition-transform hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Super Early Bird Tickets</h3>
                    <p className="text-xs text-white/65 mt-1 font-mono">Be Super, Be Early!</p>
                  </div>
                </div>

                <div className="mt-6 pb-6 border-b border-white/15">
                  <span className="text-4xl sm:text-5xl font-normal text-white">₹149</span>
                  <p className="font-mono text-[11px] text-white/60 mt-2 leading-relaxed">
                    Available Till: 17th Sep 2026, 06:36 PM (GMT+05:30)
                  </p>
                </div>

                <ul className="mt-6 space-y-3 font-normal text-xs text-white/85 leading-relaxed">
                  {[
                    'Full access to the entire AWS Student Community Day Mysuru 2026 on 21st November 2026',
                    'Exclusive event Swags & Goodies',
                    'Morning Snacks',
                    'Lunch',
                    'Hi-Tea',
                    'Visit to all sponsor booths and demo areas',
                    'Networking opportunities with fellow students, speakers, sponsors, and industry professionals',
                    'Digital Certificate of Participation from AWS.'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <button
                  disabled
                  className="w-full h-11 bg-[#7B9285] text-[#23303E] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-not-allowed opacity-90"
                >
                  SOLD OUT
                </button>
              </div>
            </div>

            {/* Early Bird (Active) */}
            <div className="bg-[#23303E] text-white p-6 sm:p-8 flex flex-col justify-between rounded-none shadow-xl border-2 border-[#01c1ac] relative transition-transform hover:-translate-y-1">
              {/* Highlight badge */}
              <div className="absolute -top-3.5 right-6 bg-[#CDE3CB] text-[#23303E] font-mono text-[11px] font-extrabold uppercase px-3 py-0.5 tracking-wider shadow-sm">
                Avail Off
              </div>

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Early Bird Ticket</h3>
                    <p className="text-xs text-white/65 mt-1 font-mono">Early Bird, Be Quick!</p>
                  </div>
                </div>

                <div className="mt-6 pb-6 border-b border-white/15">
                  <span className="text-4xl sm:text-5xl font-normal text-white">₹249</span>
                  <p className="font-mono text-[11px] text-white/60 mt-2 leading-relaxed">
                    Starts On: 26th Sep 2026, 04:58 PM (GMT+05:30)
                  </p>
                </div>

                <ul className="mt-6 space-y-3 font-normal text-xs text-white/85 leading-relaxed">
                  {[
                    'Full access to the entire AWS Student Community Day Mysuru 2026 on 21st November 2026',
                    'Exclusive event Swags & Goodies',
                    'Morning Snacks',
                    'Lunch',
                    'Hi-Tea',
                    'Visit to all sponsor booths and demo areas',
                    'Networking opportunities with fellow students, speakers, sponsors, and industry professionals',
                    'Digital Certificate of Participation from AWS.'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <a
                  href="https://konfhub.com/scd-mysuru-2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-[#CDE3CB] hover:bg-[#D1E5CD] text-[#23303E] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors shadow-md"
                >
                  GRAB YOUR TICKET
                </a>
              </div>
            </div>

            {/* Regular */}
            <div className="bg-[#23303E] text-white p-6 sm:p-8 flex flex-col justify-between rounded-none shadow-lg border border-[#23303E] transition-transform hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Regular</h3>
                    <p className="text-xs text-white/65 mt-1 font-mono">Early Bird, Be Quick!</p>
                  </div>
                </div>

                <div className="mt-6 pb-6 border-b border-white/15">
                  <span className="text-4xl sm:text-5xl font-normal text-white">₹349</span>
                  <p className="font-mono text-[11px] text-white/60 mt-2 leading-relaxed">
                    Starts On: 22nd Oct 2026, 05:54 PM (GMT+05:30)
                  </p>
                </div>

                <ul className="mt-6 space-y-3 font-normal text-xs text-white/85 leading-relaxed">
                  {[
                    'Full access to the entire AWS Student Community Day Mysuru 2026 on 21st November 2026',
                    'Exclusive event Swags & Goodies',
                    'Morning Snacks',
                    'Lunch',
                    'Hi-Tea',
                    'Visit to all sponsor booths and demo areas',
                    'Networking opportunities with fellow students, speakers, sponsors, and industry professionals',
                    'Digital Certificate of Participation from AWS.'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <button
                  disabled
                  className="w-full h-11 bg-[#7B9285] text-[#23303E] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center cursor-not-allowed opacity-90"
                >
                  COMING SOON
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          WORKSHOPS CTA BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#23303E] py-14 sm:py-16 text-white border-y border-[#2D3C4E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Build real projects in <span className="text-[#01c1ac]">hands-on sessions.</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-white/75 max-w-2xl leading-relaxed">
            Bring your laptop and code side-by-side with AWS experts. Walk away with working cloud projects.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SPONSORS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="sponsors" className="py-20 sm:py-24 bg-white text-[#23303E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#23303E]">
                Sponsors
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#01c1ac] font-medium max-w-xl leading-relaxed">
                Backed by organizations helping shape cloud, developer, and technology communities. Previous editions
                have been supported by ecosystem partners committed to learning, innovation, and community growth.
              </p>
            </div>
            <a
              href="mailto:aws@vvce.ac.in"
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#23303E] hover:bg-[#1a232f] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors self-start md:self-auto"
            >
              <span>PARTNER WITH US</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Title Sponsor */}
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-wider text-[#01c1ac] font-bold mb-4">
              TITLE SPONSOR
            </p>
            <div className="border border-[#23303E]/15 h-32 sm:h-36 flex items-center justify-center p-6 bg-white hover:border-[#23303E]/30 transition-colors">
              <AwsLogo className="h-14 sm:h-16 w-auto" />
            </div>
          </div>

          {/* Venue Sponsor */}
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-wider text-[#01c1ac] font-bold mb-4">
              VENUE SPONSOR
            </p>
            <div className="border border-[#23303E]/15 h-32 sm:h-36 flex items-center justify-center p-6 bg-white hover:border-[#23303E]/30 transition-colors">
              <div className="flex items-center gap-4">
                <GraduationCap className="w-12 h-12 text-[#23303E]" />
                <div className="text-left">
                  <p className="font-bold text-xl sm:text-2xl text-[#23303E] tracking-tight">VVCE</p>
                  <p className="text-xs text-[#64748b]">Vidyavardhaka College of Engineering, Mysuru</p>
                </div>
              </div>
            </div>
          </div>

          {/* Event & Ticketing Partner */}
          <div className="mb-10">
            <p className="font-mono text-xs uppercase tracking-wider text-[#01c1ac] font-bold mb-4">
              EVENT PARTNER — TICKETING PARTNER
            </p>
            <div className="border border-[#23303E]/15 h-28 sm:h-32 flex items-center justify-center p-6 bg-white hover:border-[#23303E]/30 transition-colors">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[#1a3a8f]">
                ❮ KONFHUB ❯
              </span>
            </div>
          </div>

          {/* Community Partners */}
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#01c1ac] font-bold mb-4">
              COMMUNITY PARTNER
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-[#23303E]/15 h-24 sm:h-28 flex items-center justify-center p-4 bg-white hover:border-[#23303E]/30 transition-colors text-center">
                <p className="font-semibold text-sm sm:text-base text-[#23303E]">
                  AWS User Groups Mysore
                </p>
              </div>
              <div className="border border-[#23303E]/15 h-24 sm:h-28 flex items-center justify-center p-4 bg-white hover:border-[#23303E]/30 transition-colors text-center">
                <p className="font-semibold text-sm sm:text-base text-[#23303E]">
                  Cloud Native Community Mysore
                </p>
              </div>
              <div className="border border-[#23303E]/15 h-24 sm:h-28 flex items-center justify-center p-4 bg-white hover:border-[#23303E]/30 transition-colors text-center">
                <p className="font-semibold text-sm sm:text-base text-[#23303E]">
                  AWS User Group Bengaluru
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          WORKSHOPS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="workshops" className="py-20 sm:py-24 bg-[#D1E5CD] text-[#23303E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#23303E]">
              Workshops
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#23303E]/80 max-w-xl">
              Hands-on, skill-building workshops designed to get you building on AWS from day one.
            </p>
          </div>

          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {/* Workshop 1 */}
            <div className="bg-white border border-[#23303E]/15 rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider bg-[#23303E] text-white px-2.5 py-1">
                  GENAI &amp; LLMS
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#64748b] font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2.5 Hours</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-[#23303E] tracking-tight leading-snug">
                Building Generative AI Applications with Amazon Bedrock
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#01c1ac] font-medium leading-relaxed">
                Step-by-step hands-on guide to building multi-agent RAG (Retrieval-Augmented Generation) applications
                using Claude 3, Bedrock Knowledge Bases, and LangChain.
              </p>

              <div className="my-5 h-px bg-[#23303E]/10" />

              <div className="space-y-2 text-xs sm:text-sm text-[#23303E]">
                <p className="flex items-start gap-2">
                  <Laptop className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Requirements:</strong> Laptop with AWS Account / CLI configured
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Instructor:</strong> AWS GenAI Community Leads
                  </span>
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#23303E]/10 flex items-center justify-between">
                <span className="font-mono text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  LEVEL: INTERMEDIATE
                </span>
                <a
                  href="#tickets"
                  className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#23303E] hover:bg-[#1a232f] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-colors"
                >
                  <span>RESERVE SEAT</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Workshop 2 */}
            <div className="bg-white border border-[#23303E]/15 rounded-2xl p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider bg-[#1a3a8f] text-white px-2.5 py-1">
                  CLOUD &amp; CONTAINERS
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#64748b] font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>2 Hours</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-[#23303E] tracking-tight leading-snug">
                Kubernetes on AWS: Deploying &amp; Scaling Elastic Microservices
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#01c1ac] font-medium leading-relaxed">
                Set up an Amazon EKS cluster, configure Helm charts, deploy microservices, and configure autoscaling
                with Karpenter and Prometheus monitoring.
              </p>

              <div className="my-5 h-px bg-[#23303E]/10" />

              <div className="space-y-2 text-xs sm:text-sm text-[#23303E]">
                <p className="flex items-start gap-2">
                  <Laptop className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Requirements:</strong> Docker basics &amp; basic Terminal experience
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-[#01c1ac] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Instructor:</strong> Container Solutions Engineers
                  </span>
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-[#23303E]/10 flex items-center justify-between">
                <span className="font-mono text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  LEVEL: ADVANCED
                </span>
                <a
                  href="#tickets"
                  className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#23303E] hover:bg-[#1a232f] text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-colors"
                >
                  <span>RESERVE SEAT</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SCHEDULE / AGENDA SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="agenda" className="py-20 sm:py-24 bg-[#D1E5CD] text-[#23303E] border-t border-[#23303E]/15">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#23303E] leading-tight">
                Featured
                <br />
                Sessions
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#01c1ac] font-medium leading-relaxed max-w-sm">
                A full day of keynotes, technical deep dives, hands-on knowledge, and community conversations designed
                for builders at every stage.
              </p>
              <div className="mt-8">
                <a
                  href="#speakers"
                  className="inline-flex items-center gap-2 h-11 px-6 bg-[#23303E] hover:bg-[#1a232f] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <span>FULL SCHEDULE</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Column: Timeline list */}
            <div className="lg:col-span-7 flex flex-col divide-y divide-[#23303E]/20">
              {[
                { title: 'Check-in & Registrations', time: '8:00am – 9:00am', isBreak: false },
                { title: 'Opening Ceremony', time: '9:00am – 9:30am', isBreak: false },
                { title: 'Keynote', time: '9:30am – 11:00am', isBreak: false },
                { title: 'TEA BREAK', time: '11:00am – 11:30am', isBreak: true },
                { title: 'Session 1', time: '11:30am – 1:30pm', isBreak: false },
                { title: 'LUNCH BREAK', time: '1:30pm – 2:30pm', isBreak: true },
                { title: 'Session 2', time: '2:30pm – 4:30pm', isBreak: false },
                { title: 'BREAK', time: '4:30pm – 5:00pm', isBreak: true },
                { title: 'Panel Discussion', time: '5:00pm – 5:30pm', isBreak: false }
              ].map((item, i) => (
                <div key={i} className="py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3
                    className={`text-xl sm:text-2xl md:text-3xl tracking-tight ${
                      item.isBreak
                        ? 'font-bold uppercase text-[#23303E] text-lg sm:text-xl'
                        : 'font-normal text-[#23303E]'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-[#01c1ac] font-medium tracking-wide">
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TEAM SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="team" className="py-20 sm:py-24 bg-[#23303E] text-white relative overflow-hidden">
        {/* Subtle patterned overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 40px, white 40px, white 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)'
          }}
        />

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12 sm:mb-14">
            <div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
                Meet the Team
                <br />
                Behind the Experience
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/65 max-w-lg leading-relaxed">
                Behind every keynote, workshop, and community moment is a team committed to creating an
                unforgettable experience for every attendee.
              </p>
            </div>
            <a
              href="#team"
              className="inline-flex items-center gap-2 h-11 px-6 border border-white/40 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
            >
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {[
              { name: 'Yashwanth R', img: 'https://scd.awsmysuru.in/team/yashwanth.jpg', init: 'YR' },
              { name: 'Vibha S', img: 'https://scd.awsmysuru.in/team/vibha.jpg', init: 'VS' },
              { name: 'Gagan K M', img: 'https://scd.awsmysuru.in/team/gagan.jpg', init: 'GK' },
              { name: 'K Reethu', img: 'https://scd.awsmysuru.in/team/reethu.jpg', init: 'KR' },
              { name: 'Yashas MV', img: 'https://scd.awsmysuru.in/team/yashas_mv.jpg', init: 'YM' },
              { name: 'Falkia', img: 'https://scd.awsmysuru.in/team/falkia.jpg', init: 'FA' }
            ].map((member, i) => (
              <div
                key={i}
                className="bg-[#2D3C4E] border border-[#2D3C4E] overflow-hidden group hover:-translate-y-1 transition-transform"
              >
                <div className="p-3 flex items-center justify-between border-b border-[#23303E]/50">
                  <h3 className="font-medium text-xs sm:text-sm text-white truncate">{member.name}</h3>
                  <span className="text-[10px] text-white/40 font-mono">⬜</span>
                </div>
                <div className="aspect-[3/4] relative bg-[#1a232f] flex items-center justify-center overflow-hidden">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover object-top filter grayscale-[15%] transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback avatar if remote image fails */}
                  <span className="font-mono text-lg font-bold text-white/20 select-none">
                    {member.init}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          VENUE SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="venue" className="relative min-h-[480px] bg-[#23303E] flex items-center overflow-hidden text-white">
        <img
          src="https://scd.awsmysuru.in/venue.jpg"
          alt="Vidyavardhaka College of Engineering"
          className="absolute inset-0 w-full h-full object-cover filter grayscale-[70%] brightness-[0.4]"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#23303E] via-[#23303E]/85 to-transparent" />

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-20">
          <div className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-[#01c1ac] font-bold mb-3">
              VENUE
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
              Vidyavardhaka College
              <br />
              of Engineering
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/85 leading-relaxed">
              Kannada Sahithya Parishath Road, III Stage, Gokulam, Mysuru - 570002.
            </p>
            <p className="mt-2 text-xs sm:text-sm text-[#01c1ac] leading-relaxed">
              Providing the premier setting for a full day of cloud learning, workshops, and community networking.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://maps.google.com/?q=Vidyavardhaka+College+of+Engineering+Mysuru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-5 border border-white/50 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>VIEW DIRECTIONS</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#tickets"
                className="inline-flex items-center gap-2 h-10 px-5 border border-white/50 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>REGISTER</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FAQ SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-24 bg-[#f5f6f8] text-[#23303E]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-[#23303E]">
                FAQ's
              </h2>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#23303E]/15">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-5">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left gap-4 font-normal text-base sm:text-lg text-[#23303E] hover:text-[#01c1ac] transition-colors focus:outline-none cursor-pointer"
                    >
                      <span className="leading-snug">{faq.q}</span>
                      <span className="flex-shrink-0 text-[#23303E] transition-transform duration-300">
                        {isOpen ? <Minus className="w-5 h-5 text-[#01c1ac]" /> : <Plus className="w-5 h-5" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-xs sm:text-sm text-[#64748b] leading-relaxed pr-6 animate-in fade-in duration-200">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BADGE SECTION (IN-PAGE GENERATOR MATCHING SCREENSHOTS)
      ───────────────────────────────────────────────────────────── */}
      <SocialBadge />

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#23303E] text-white border-t border-white/5 pt-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pb-12 flex flex-col md:flex-row justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <a href="#top" className="flex items-center gap-3 group">
              <AwsLogo className="h-8 w-auto" dark />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">COMMUNITY DAY</span>
                <span className="font-mono text-[10px] text-white/50 tracking-wider">MYSURU 2026</span>
              </div>
            </a>
            <p className="mt-4 text-xs sm:text-sm text-white/50 leading-relaxed">
              Built by the community, for the community.
            </p>
          </div>

          {/* Links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-12 text-xs sm:text-sm">
            <div className="flex flex-col gap-2.5">
              <p className="font-bold text-xs uppercase tracking-widest text-white mb-1">Explore</p>
              <a href="#about" className="text-white/60 hover:text-[#01c1ac] transition-colors">About</a>
              <a href="#speakers" className="text-white/60 hover:text-[#01c1ac] transition-colors">Speakers</a>
              <a href="#tickets" className="text-white/60 hover:text-[#01c1ac] transition-colors">Tickets</a>
              <a href="#sponsors" className="text-white/60 hover:text-[#01c1ac] transition-colors">Sponsors</a>
              <a href="#agenda" className="text-white/60 hover:text-[#01c1ac] transition-colors">Schedule</a>
              <a href="#team" className="text-white/60 hover:text-[#01c1ac] transition-colors">Team</a>
              <a href="#venue" className="text-white/60 hover:text-[#01c1ac] transition-colors">Venue</a>
              <a href="#faq" className="text-white/60 hover:text-[#01c1ac] transition-colors">FAQ</a>
              <a href="#badge" className="text-white/60 hover:text-[#01c1ac] transition-colors">Badge</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="font-bold text-xs uppercase tracking-widest text-white mb-1">Community</p>
              <a href="#tickets" className="text-white/60 hover:text-[#01c1ac] transition-colors">Get Tickets</a>
              <a href="mailto:aws@vvce.ac.in" className="text-white/60 hover:text-[#01c1ac] transition-colors">Become a Partner</a>
              <a href="mailto:aws@vvce.ac.in" className="text-white/60 hover:text-[#01c1ac] transition-colors">Contact Us</a>
              <a href="#" className="text-white/60 hover:text-[#01c1ac] transition-colors">Code of Conduct</a>
            </div>

            <div className="flex flex-col gap-2.5">
              <p className="font-bold text-xs uppercase tracking-widest text-white mb-1">Socials</p>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#01c1ac] transition-colors">LinkedIn</a>
              <a href="https://meetup.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#01c1ac] transition-colors">Meetup</a>
              <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-[#01c1ac] transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/5 py-5 px-4 text-center">
          <p className="font-mono text-[11px] text-white/35 uppercase tracking-wider">
            © 2026 AWS STUDENT BUILDER GROUP VVCE
          </p>
        </div>
      </footer>
    </div>
  );
}
