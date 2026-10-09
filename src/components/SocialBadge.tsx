import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Copy,
  X
} from 'lucide-react';

// Official AWS Logo SVG Mark
function AwsLogoBadge({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.1 13.7c0 .6.1 1.1.2 1.5.2.4.4.8.7 1.3.1.2.2.4.2.5 0 .2-.1.4-.4.6l-1.3.9c-.2.1-.4.2-.5.2-.2 0-.4-.1-.6-.3-.3-.3-.5-.7-.7-1-.2-.4-.4-.8-.6-1.3-1.5 1.8-3.4 2.7-5.6 2.7-1.6 0-2.9-.5-3.8-1.4-.9-.9-1.4-2.1-1.4-3.6 0-1.6.6-2.9 1.7-3.9 1.1-1 2.6-1.5 4.5-1.5.6 0 1.2.1 1.9.2.7.1 1.4.3 2.1.5V7.9c0-1.4-.3-2.4-.9-3-.6-.6-1.6-.9-3-.9-.6 0-1.3.1-2 .3-.7.2-1.3.4-1.9.7-.3.1-.5.2-.6.3-.1 0-.2.1-.3.1-.3 0-.4-.2-.4-.6V3.6c0-.3 0-.5.1-.7.1-.1.3-.3.6-.4.6-.3 1.4-.6 2.3-.8.9-.2 1.9-.3 2.9-.3 2.2 0 3.8.5 4.9 1.5 1.1 1 1.6 2.5 1.6 4.5v5.9zm-7.7 2.9c.6 0 1.2-.1 1.9-.4.7-.3 1.3-.7 1.8-1.3.3-.4.5-.7.6-1.2.1-.4.2-.9.2-1.5v-.7c-.5-.1-1.1-.2-1.7-.3-.6-.1-1.2-.1-1.7-.1-1.2 0-2.1.2-2.7.7-.6.5-.9 1.1-.9 2 0 .8.2 1.4.6 1.8.5.6 1.1.9 1.9 1zm14.6 1.9c-.3 0-.5-.1-.7-.2-.2-.1-.3-.4-.5-.8l-5.3-17.4c-.1-.4-.2-.7-.2-.8 0-.3.2-.5.5-.5h2.1c.4 0 .6.1.7.2.2.1.3.4.4.8l3.8 14.9 3.5-14.9c.1-.4.2-.7.4-.8.2-.1.5-.2.8-.2h1.7c.4 0 .7.1.8.2.2.1.3.4.4.8l3.5 15.1 3.9-15.1c.1-.4.2-.7.4-.8.2-.1.5-.2.8-.2h2c.3 0 .5.2.5.5 0 .1 0 .3-.1.5l-.1.4-5.4 17.4c-.1.4-.3.7-.5.8-.2.1-.4.2-.7.2h-1.8c-.4 0-.6-.1-.8-.2-.2-.1-.3-.4-.4-.8l-3.5-14.5-3.5 14.5c-.1.4-.2.7-.4.8-.2.1-.5.2-.8.2zm28.8.5c-1.1 0-2.2-.1-3.2-.4-1-.3-1.8-.6-2.3-1-.3-.2-.5-.4-.6-.6-.1-.2-.1-.4-.1-.6v-.8c0-.4.2-.6.5-.6.1 0 .3 0 .4.1.1 0 .3.1.5.2.7.3 1.4.5 2.2.7.8.2 1.6.3 2.4.3 1.3 0 2.3-.2 2.9-.7.7-.4 1-1 1-1.8 0-.5-.2-.9-.5-1.3-.3-.3-.9-.7-1.8-1l-2.5-.8c-1.3-.4-2.2-1-2.8-1.7-.6-.7-.9-1.5-.9-2.4 0-.7.2-1.4.5-1.9.3-.6.7-1 1.3-1.4.5-.4 1.1-.7 1.8-.9.7-.2 1.4-.3 2.2-.3.4 0 .8 0 1.2.1.4.1.8.1 1.1.2.4.1.7.2 1 .3.3.1.6.2.7.3.3.1.5.3.6.5.1.2.1.4.1.7v.7c0 .4-.2.6-.5.6-.2 0-.5-.1-.9-.3-.6-.3-1.2-.5-2-.7-.4-.1-.9-.1-1.4-.1-1.2 0-2.1.2-2.7.6-.6.4-.9 1-.9 1.7 0 .5.2 1 .5 1.3.4.4 1 .7 1.9 1l2.5.8c1.2.4 2.1 1 2.7 1.7.6.7.9 1.5.9 2.5 0 .7-.1 1.4-.4 2-.3.6-.7 1.1-1.2 1.5-.5.4-1.2.7-1.9.9-.9.2-1.8.4-2.8.4z"
        fill="#FAFAFA"
      />
      <path
        d="M52.7 28.2C46.6 32.7 37.8 35 30.3 35c-10.6 0-20.2-3.9-27.4-10.4-.6-.5-.1-1.2.6-.8 7.8 4.5 17.4 7.3 27.4 7.3 6.7 0 14.1-1.4 20.9-4.3 1-.5 1.9.6.9 1.4z"
        fill="#FF9900"
      />
      <path
        d="M55.2 25.3c-.8-1-5-.5-6.9-.2-.6.1-.7-.4-.1-.9 3.4-2.4 8.9-1.7 9.5-.9.6.8-.2 6.3-3.3 8.9-.5.4-1 .2-.7-.4.7-1.6 2.3-5.4 1.5-6.5z"
        fill="#FF9900"
      />
    </svg>
  );
}

// Exact Colored Template Portrait
const TEMPLATE_PORTRAIT = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85';

export default function SocialBadge() {
  // Tab format: 'POST' (with black side pillarboxes) or 'STORY' (vertical 9:16)
  const [activeTab, setActiveTab] = useState<'POST' | 'STORY'>('POST');

  // Form states
  const [fullName, setFullName] = useState('RENATE REINSVE');
  const [email, setEmail] = useState('RENATEREINSVE@GMAIL.COM');
  const [role, setRole] = useState('ATTENDEE');
  const [imageSrc, setImageSrc] = useState<string>(TEMPLATE_PORTRAIT);
  const [fileName, setFileName] = useState('');
  const [isCustomPhoto, setIsCustomPhoto] = useState(false);

  // Image manipulation states
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // UI state
  const [isDownloading, setIsDownloading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setIsCustomPhoto(true);
          setZoom(1.0);
          setPan({ x: 0, y: 0 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to frame
  const handleFitToFrame = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Drag pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Check form completeness for download
  const isFormComplete = Boolean(fullName.trim() && email.trim());

  // Generate and Download Canvas Badge
  const handleDownloadImage = useCallback(async () => {
    setIsDownloading(true);

    try {
      const isPost = activeTab === 'POST';
      // In POST mode: canvas is 1080 x 1080 (Square)
      // In STORY mode: canvas is 1080 x 1920 (9:16)
      const canvasWidth = 1080;
      const canvasHeight = isPost ? 1080 : 1920;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsDownloading(false);
        return;
      }

      // 1. Overall solid black background (creates the side pillarboxes in POST)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 2. Define the active portrait content box (Full Width)
      const contentWidth = canvasWidth;
      const contentHeight = canvasHeight;
      const contentX = 0;
      const contentY = 0;

      // 3. Draw portrait image inside content area
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // If remote fails, fallback
          img.src = TEMPLATE_PORTRAIT;
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Image failed to load'));
        };
        img.src = imageSrc;
      });

      ctx.save();
      // Clip to content area so photo doesn't spill into pillarboxes
      ctx.beginPath();
      ctx.rect(contentX, contentY, contentWidth, contentHeight);
      ctx.clip();

      // Full color portrait
      ctx.filter = 'brightness(1.02) contrast(1.04)';

      const minScale = Math.min(contentWidth / img.width, contentHeight / img.height);
      const scaledWidth = img.width * minScale * zoom;
      const scaledHeight = img.height * minScale * zoom;

      const scaleFactor = contentWidth / 460;
      const imgX = contentX + (contentWidth - scaledWidth) / 2 + pan.x * scaleFactor;
      const imgY = contentY + (contentHeight - scaledHeight) / 2 + pan.y * scaleFactor;

      ctx.drawImage(img, imgX, imgY, scaledWidth, scaledHeight);
      ctx.restore();

      // Top dark vignette overlay inside content area
      ctx.save();
      ctx.beginPath();
      ctx.rect(contentX, contentY, contentWidth, contentHeight);
      ctx.clip();

      const topGrad = ctx.createLinearGradient(0, 0, 0, contentHeight * 0.32);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.85)');
      topGrad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(contentX, contentY, contentWidth, contentHeight * 0.32);
      ctx.restore();

      // 4. Draw curved gradient wave at bottom (within content width)
      ctx.save();
      ctx.beginPath();
      ctx.rect(contentX, contentY, contentWidth, contentHeight);
      ctx.clip();

      const waveStartY = isPost ? contentHeight * 0.69 : contentHeight * 0.74;
      ctx.beginPath();
      ctx.moveTo(contentX, waveStartY);

      // Natural organic wave curve matching screenshot exactly
      ctx.bezierCurveTo(
        contentX + contentWidth * 0.32,
        waveStartY - contentHeight * 0.05,
        contentX + contentWidth * 0.68,
        waveStartY + contentHeight * 0.04,
        contentX + contentWidth,
        waveStartY - contentHeight * 0.01
      );
      ctx.lineTo(contentX + contentWidth, contentHeight);
      ctx.lineTo(contentX, contentHeight);
      ctx.closePath();

      // Gradient from deep crimson/magenta to warm AWS orange
      const waveGrad = ctx.createLinearGradient(contentX, waveStartY, contentX + contentWidth, contentHeight);
      waveGrad.addColorStop(0, '#D81B60'); // Deep magenta / crimson
      waveGrad.addColorStop(0.35, '#E11D48'); // Rose
      waveGrad.addColorStop(0.7, '#EA580C'); // Orange-red
      waveGrad.addColorStop(1, '#FF7A00'); // Vibrant AWS orange
      ctx.fillStyle = waveGrad;
      ctx.fill();
      ctx.restore();

      // 5. Top Left AWS Logo inside content area
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillText('aws', contentX + 45, 68);

      // Orange smile
      ctx.beginPath();
      ctx.arc(contentX + 70, 76, 24, 0.25 * Math.PI, 0.75 * Math.PI);
      ctx.strokeStyle = '#FF9900';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Arrowhead on smile
      ctx.beginPath();
      ctx.moveTo(contentX + 89, 90);
      ctx.lineTo(contentX + 95, 85);
      ctx.lineTo(contentX + 93, 95);
      ctx.fillStyle = '#FF9900';
      ctx.fill();

      // Top Right Text inside content area
      ctx.textAlign = 'right';
      ctx.font = 'bold 20px "Inter", sans-serif';
      ctx.fillText('aws', contentX + contentWidth - 45, 50);
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText('STUDENT COMMUNITY DAY', contentX + contentWidth - 45, 73);
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('KOLHAPUR 2026', contentX + contentWidth - 45, 93);
      ctx.restore();

      // 6. Bottom wave text & Pill badge inside content area
      ctx.save();
      const contentBaseY = isPost ? contentHeight * 0.74 : contentHeight * 0.78;

      // Pill badge (ATTENDEE)
      const pillText = role.toUpperCase();
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      const pillWidth = ctx.measureText(pillText).width + 30;
      const pillHeight = 28;
      const pillX = contentX + 45;
      const pillY = contentBaseY;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(pillText, pillX + pillWidth / 2, pillY + 19);

      // Headline
      ctx.textAlign = 'left';
      ctx.font = 'bold 36px "Inter", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText("I'm Attending AWS", contentX + 45, contentBaseY + 65);
      ctx.fillText('Student Community Day Kolhapur', contentX + 45, contentBaseY + 110);

      // Bottom Right: Location & Date
      ctx.textAlign = 'right';
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('📍 GCOEK, KOLHAPUR', contentX + contentWidth - 45, contentHeight - 75);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText('📅 NOVEMBER 1, 2026', contentX + contentWidth - 45, contentHeight - 48);

      ctx.restore();

      // Outer border on entire canvas
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      const safeName = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') || 'attendee';
      downloadLink.download = `aws-community-day-${safeName}-${activeTab.toLowerCase()}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error('Download error:', err);
      alert('Your badge has been prepared! If uploading a photo, ensure it is selected from your device.');
    } finally {
      setIsDownloading(false);
    }
  }, [activeTab, imageSrc, zoom, pan, role, fullName]);

  // Social Share handler
  const handleShare = async () => {
    const shareText = `I'm attending AWS Student Community Day Kolhapur 2026 on Nov 1 at GCOEK! Join 500+ builders, engineers & students. Claim your ticket & badge here!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AWS Student Community Day Kolhapur 2026',
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // fallback
      }
    }
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const shareText = `I'm attending AWS Student Community Day Kolhapur 2026 on Nov 1 at GCOEK! Check out my badge: ${window.location.href}`;
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="badge" className="py-16 sm:py-24 bg-[#F2E9E4] text-[#22223B]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Section Header Matching Screenshot */}
        <div className="mb-10 sm:mb-12">
          <p className="font-mono text-xs sm:text-[13px] uppercase tracking-widest text-[#4A4E69] font-bold mb-3">
            SOCIAL BADGE
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-[#22223B] leading-[1.12]">
            Show you're part of AWS
            <br className="hidden sm:inline" />
            Student Community Day Kolhapur.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#4A4E69] font-medium max-w-2xl leading-relaxed">
            Generate personalized social cards to let your network know you're attending, speaking,
            volunteering or supporting the community.
          </p>
        </div>

        {/* 2-Column Main Generator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: FORM CONTROLS
          ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 bg-white border border-gray-200 p-6 sm:p-8 shadow-sm">
            <div className="space-y-6">
              {/* Row 1: Full Name & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#22223B] uppercase tracking-wider mb-2">
                    Full Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="RENATE REINSVE"
                    className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-gray-200 text-[#22223B] text-xs font-mono font-medium tracking-wide focus:outline-none focus:border-[#4A4E69] focus:bg-white uppercase transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#22223B] uppercase tracking-wider mb-2">
                    Email Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="RENATEREINSVE@GMAIL.COM"
                    className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-gray-200 text-[#22223B] text-xs font-mono font-medium tracking-wide focus:outline-none focus:border-[#4A4E69] focus:bg-white uppercase transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Role selector */}
              <div>
                <label className="block text-xs font-bold text-[#22223B] uppercase tracking-wider mb-2">
                  Badge Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['ATTENDEE', 'SPEAKER', 'VOLUNTEER'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`h-9 font-mono text-[11px] font-semibold tracking-wider uppercase border transition-all ${
                        role === r
                          ? 'bg-[#22223B] text-white border-[#22223B]'
                          : 'bg-[#F8FAFC] text-[#64748b] border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Upload Photo */}
              <div>
                <label className="block text-xs font-bold text-[#22223B] uppercase tracking-wider mb-1">
                  Upload Photo<span className="text-red-500">*</span>
                </label>
                <p className="text-[11.5px] text-[#4A4E69] font-medium mb-3">
                  Upload a clear headshot or portrait photo with a solid background.
                </p>

                {/* Upload bar */}
                <div className="flex items-center border border-gray-200 bg-[#F8FAFC] p-1.5 pl-3">
                  <div className="flex items-center gap-2 flex-1 text-[#64748b] text-xs font-mono truncate mr-2">
                    <ImageIcon className="w-4 h-4 flex-shrink-0 text-[#64748b]" />
                    <span className="truncate uppercase text-[11px]">
                      {fileName || 'PNG OR JPG RECOMMENDED. LARGER IMA...'}
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-[#22223B] font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>UPLOAD PHOTO</span>
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Row 4: Zoom / Adjust Image */}
              <div>
                <label className="block text-xs font-bold text-[#22223B] uppercase tracking-wider mb-1">
                  Zoom/Adjust Image
                </label>
                <p className="text-[11.5px] text-[#4A4E69] font-medium mb-3">
                  Your photo keeps its original proportions. Drag to reposition it or use the slider to zoom in.
                </p>

                <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-gray-200">
                  <ZoomOut className="w-4 h-4 text-[#64748b] flex-shrink-0" />
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#22223B] cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-[#64748b] flex-shrink-0" />

                  <button
                    type="button"
                    onClick={handleFitToFrame}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-[#22223B] font-mono text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer ml-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>FIT TO FRAME</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons (DOWNLOAD & SHARE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className={`h-11 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isFormComplete
                      ? 'bg-[#F2E9E4] hover:bg-[#22223B] hover:text-white text-[#22223B] border border-[#22223B]/30'
                      : 'bg-[#F2E9E4] text-gray-400 border border-gray-200'
                  }`}
                >
                  <span>{isDownloading ? 'GENERATING...' : 'DOWNLOAD IMAGE'}</span>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-11 flex items-center justify-center gap-2 bg-[#4A4E69] hover:bg-[#393c52] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  <span>SHARE ON SOCIAL</span>
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Helper text matching screenshot */}
              <p className="text-[11.5px] text-[#4A4E69] font-medium leading-relaxed">
                Complete your name, email, and photo to enable the download. Upload a photo to replace the template portrait.
              </p>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: BADGE PREVIEW (POST & STORY TABS)
          ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Tabs matching screenshot */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('POST')}
                className={`w-36 sm:w-44 h-12 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border-t border-l border-r ${
                  activeTab === 'POST'
                    ? 'bg-[#1E293B] text-white border-[#1E293B]'
                    : 'bg-white text-[#1E293B] border-gray-300'
                }`}
              >
                POST
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('STORY')}
                className={`w-36 sm:w-44 h-12 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors border-t border-l border-r ${
                  activeTab === 'STORY'
                    ? 'bg-[#1E293B] text-white border-[#1E293B]'
                    : 'bg-white text-[#1E293B] border-gray-300'
                }`}
              >
                STORY
              </button>
            </div>

            {/* Preview Frame Container matching soft gray background */}
            <div className="bg-[#EBF0F5] p-4 sm:p-10 flex items-center justify-center min-h-[500px] sm:min-h-[620px] shadow-sm border border-gray-200">
              {/* POST FRAME: Matches Image 1 with black side pillarbox bars!
                  STORY FRAME: Matches Image 2 with vertical 9:16 layout without side pillarboxes! */}
              <div
                ref={previewRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`relative overflow-hidden bg-black select-none shadow-2xl transition-all duration-300 cursor-grab active:cursor-grabbing border-2 border-black mx-auto ${
                  activeTab === 'POST'
                    ? 'w-[440px] max-w-full aspect-[1/1]'
                    : 'w-[330px] max-w-full aspect-[9/16]'
                }`}
                title="Drag to reposition photo, use slider to zoom"
              >
                {/* Full edge to edge for both POST and STORY */}
                <div
                  className="relative h-full mx-auto overflow-hidden bg-black w-full"
                >
                  {/* 1. Underlying Portrait Photo Layer (Black and white filter matching screenshot) */}
                  <div className="absolute inset-0 overflow-hidden bg-black">
                    <img
                      src={imageSrc}
                      alt={fullName || 'Attendee Portrait'}
                      draggable={false}
                      className="w-full h-full transition-transform duration-75 filter brightness-[1.02] contrast-[1.04]"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        objectFit: 'contain',
                        objectPosition: 'center center'
                      }}
                    />
                    {/* Top dark gradient vignette matching screenshot */}
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
                  </div>

                  {/* 2. Top Header Overlay (AWS Logo + Community Day Header) */}
                  <div className="absolute top-4 inset-x-5 flex items-start justify-between pointer-events-none z-20">
                    {/* AWS Smile logo matching screenshot */}
                    <div className="flex items-center">
                      <AwsLogoBadge className="h-6 sm:h-7 w-auto drop-shadow-md" />
                    </div>

                    {/* Top Right Event Title matching screenshot */}
                    <div className="text-right">
                      <p className="font-bold text-xs text-white leading-none drop-shadow-sm">aws</p>
                      <p className="font-mono text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider mt-0.5 drop-shadow-sm">
                        STUDENT COMMUNITY DAY
                      </p>
                      <p className="font-mono text-[8px] sm:text-[9px] text-white/90 tracking-widest mt-0.5 drop-shadow-sm">
                        KOLHAPUR 2026
                      </p>
                    </div>
                  </div>

                  {/* 3. Bottom Gradient Wave Banner Overlay matching screenshot */}
                  <div className="absolute inset-x-0 bottom-0 pointer-events-none z-20">
                    <div className="relative">
                      {/* Organic wave SVG with magenta-to-orange gradient */}
                      <svg
                        viewBox="0 0 600 240"
                        className="w-full h-auto block"
                        preserveAspectRatio="none"
                        fill="none"
                      >
                        <defs>
                          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D81B60" />
                            <stop offset="35%" stopColor="#E11D48" />
                            <stop offset="70%" stopColor="#EA580C" />
                            <stop offset="100%" stopColor="#FF7A00" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 55 Q 160 12, 320 38 T 600 30 L 600 240 L 0 240 Z"
                          fill="url(#waveGradient3)"
                        />
                      </svg>

                      {/* Wave content overlay matching screenshot */}
                      <div className="absolute inset-0 px-4 sm:px-6 pt-9 sm:pt-11 flex flex-col justify-between pb-3 sm:pb-4 text-white">
                        <div>
                          {/* Role pill badge matching screenshot */}
                          <div className="inline-block bg-white/20 border border-white/40 px-3 py-0.5 rounded-full backdrop-blur-xs mb-1.5 shadow-xs">
                            <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-white">
                              {role}
                            </span>
                          </div>

                          {/* Bold Announcement headline */}
                          <h4 className="text-sm xs:text-base sm:text-xl font-bold tracking-tight leading-tight text-white drop-shadow-md">
                            I'm Attending AWS
                            <br />
                            Student Community Day Kolhapur
                          </h4>
                        </div>

                        {/* Location & Date matching screenshot */}
                        <div className="self-end text-right font-mono text-[9px] sm:text-[10px] text-white space-y-0.5 drop-shadow-sm">
                          <p className="flex items-center justify-end gap-1">
                            <span className="text-pink-300">📍</span>
                            <span className="font-bold">GCOEK, KOLHAPUR</span>
                          </p>
                          <p className="flex items-center justify-end gap-1 text-white/95">
                            <span className="text-blue-300">📅</span>
                            <span>NOVEMBER 1, 2026</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[#22223B]">Share Your Badge</h3>
            <p className="text-xs text-[#64748b] mt-1">
              Download your badge and share it on LinkedIn or Instagram!
            </p>

            <div className="mt-5 space-y-3">
              {activeTab === 'POST' && (
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-10 bg-[#0A66C2] hover:bg-[#084e96] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  📤 Post on LinkedIn
                </a>
              )}

              {activeTab === 'STORY' && (
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  📸 Share on Instagram
                </a>
              )}

              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 h-10 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#22223B] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border border-gray-300"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'COPIED TO CLIPBOARD!' : 'COPY SHARE LINK'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
