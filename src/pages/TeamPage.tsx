import React from 'react';
import TeamSection from '../components/TeamSection';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function AwsLogo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <img
      src="/scd-kolhapur-logo.png"
      alt="Student Community Day"
      className={`${className} object-contain`}
    />
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-[#070B13] aws-builder-grid text-white font-sans antialiased">
      {/* Header for Team Page */}
      <header className="sticky top-0 z-50 bg-[#0B1120]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 h-16 sm:h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <AwsLogo className="h-7 sm:h-9 w-auto" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-[15px] tracking-tight text-white leading-none">
                COMMUNITY DAY
              </span>
              <span className="font-mono text-[9px] sm:text-[10px] tracking-wider uppercase text-purple-400 mt-1">
                KOLHAPUR 2026
              </span>
            </div>
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-semibold text-slate-300 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>BACK TO HOME</span>
          </Link>
        </div>
      </header>

      {/* Team Section */}
      <TeamSection />

      {/* Footer */}
      <footer className="bg-[#03060A] text-white border-t border-white/10 py-8">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 text-center">
          <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
            [ © 2026 AWS COMMUNITY DAY KOLHAPUR // ORGANIZED BY AWS STUDENT BUILDER GROUP ]
          </p>
        </div>
      </footer>
    </div>
  );
}
