import React from 'react';
import { Cpu } from 'lucide-react';

/**
 * 4-square Builder Cross Glyph (as seen in AWS Builder Center imagery)
 */
export function BuilderCross({ 
  className = "text-[#A855F7]",
  size
}: { 
  className?: string;
  size?: number;
}) {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;
  return (
    <svg 
      className={`${size ? '' : 'w-7 h-7'} ${className}`} 
      style={sizeStyle} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      {/* Top square */}
      <rect x="9" y="1" width="6" height="6" rx="0.5" />
      {/* Left square */}
      <rect x="1" y="9" width="6" height="6" rx="0.5" />
      {/* Right square */}
      <rect x="17" y="9" width="6" height="6" rx="0.5" />
      {/* Bottom square */}
      <rect x="9" y="17" width="6" height="6" rx="0.5" />
    </svg>
  );
}

/**
 * Official AWS Student Builder Group Pill Badge (Image 5 replica)
 */
export function BuilderGroupPill({ 
  text = "AWS Student Builder Group",
  className = "" 
}: { 
  text?: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-[#8B5CF6]/15 border border-[#8B5CF6]/40 text-[#D8B4FE] font-mono text-[11px] sm:text-xs tracking-wider uppercase backdrop-blur-sm ${className}`}>
      <Cpu className="w-3.5 h-3.5 text-[#C084FC] shrink-0" />
      <span>{text}</span>
    </div>
  );
}

/**
 * Stepped Builder Mosaic Pixel Cluster (replicating the hero visual from the reference images)
 */
export function BuilderMosaicHero({ className = "" }: { className?: string }) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`} aria-hidden="true">
      {/* Grid container with aligned pixel tiles */}
      <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] border border-white/10 bg-[#070B13]/60 backdrop-blur-sm">
        {/* Subtle internal grid lines */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '25% 25%'
          }}
        />

        {/* Stepped Pixel 1: Violet to Fuchsia Top (Image 1 & 2) */}
        <div className="absolute top-[0%] left-[25%] w-[25%] h-[25%] bg-gradient-to-br from-[#A855F7] to-[#EC4899] shadow-lg shadow-purple-500/30" />

        {/* Stepped Pixel 2: Cyan to Mint (Image 2) */}
        <div className="absolute top-[25%] left-[0%] w-[25%] h-[25%] bg-gradient-to-br from-[#06B6D4] to-[#2DD4BF] shadow-lg shadow-cyan-500/30" />

        {/* Stepped Pixel 3: Violet / Fuchsia */}
        <div className="absolute top-[25%] left-[50%] w-[25%] h-[25%] bg-gradient-to-br from-[#EC4899] to-[#8B5CF6] opacity-90" />

        {/* Big Pixel 4: Large 2x2 Cyan / Mint Block (Image 2) */}
        <div className="absolute top-[50%] left-[0%] w-[50%] h-[50%] bg-gradient-to-br from-[#2DD4BF] via-[#06B6D4] to-[#0284C7] shadow-xl shadow-cyan-500/20" />

        {/* Stepped Pixel 5: Violet Staircase Step (Image 5) */}
        <div className="absolute top-[50%] left-[50%] w-[25%] h-[25%] bg-gradient-to-br from-[#8B5CF6] to-[#A855F7]" />

        {/* Stepped Pixel 6: Sunset Accent (Image 3) */}
        <div className="absolute top-[75%] left-[75%] w-[25%] h-[25%] bg-gradient-to-r from-[#FDBA74] to-[#F43F5E]" />

        {/* Scattered Builder Crosses */}
        <div className="absolute -top-3 -right-3">
          <BuilderCross className="w-5 h-5 text-[#A855F7] animate-pulse" />
        </div>
        <div className="absolute -bottom-3 -left-3">
          <BuilderCross className="w-4 h-4 text-[#2DD4BF]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Top or Banner Strip with Sunset Gradient + Mosaic (Image 3 replica)
 */
export function BuilderBannerStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      {/* Sunset horizontal block */}
      <div className="h-6 sm:h-8 w-24 sm:w-36 bg-gradient-to-r from-[#FDBA74] via-[#F43F5E] to-[#EC4899] shadow-md shadow-pink-500/20" />
      {/* Pink square */}
      <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gradient-to-br from-[#EC4899] to-[#C084FC]" />
      {/* Purple square */}
      <div className="h-6 sm:h-8 w-6 sm:w-8 bg-gradient-to-br from-[#A855F7] to-[#7C3AED]" />
    </div>
  );
}
