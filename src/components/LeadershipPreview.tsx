import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Linkedin, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TeamMember {
  department: string;
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: string;
  email: string;
  linkedin: string;
  image: string;
}

export default function LeadershipPreview() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parse CSV data - show ALL team members
    fetch('/team-members.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        
        const members: TeamMember[] = lines.slice(1).map(line => {
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim());
          
          return {
            department: values[0] || '',
            id: values[1] || '',
            name: values[2] || '',
            role: values[3] || '',
            bio: values[4] || '',
            skills: values[5] || '',
            email: values[6] || '',
            linkedin: values[7] || '',
            image: values[8] || ''
          };
        });
        
        // Show ALL team members (no filter)
        setTeamMembers(members);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading team members:', error);
        setLoading(false);
      });
  }, []);

  // 3D scroll effect for team cards
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleCarouselScroll = () => {
      const cards = carousel.querySelectorAll('.team-card-3d');
      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        
        // Calculate position relative to center
        const distanceFromCenter = (cardCenter - carouselCenter) / carouselRect.width;
        const absDistance = Math.abs(distanceFromCenter);
        
        // Scale and opacity based on distance from center
        const scale = Math.max(0.85, 1 - absDistance * 0.2);
        const opacity = Math.max(0.4, 1 - absDistance * 0.8);
        const zIndex = Math.round((1 - absDistance) * 100);
        
        // Only horizontal movement, no vertical (translateY)
        cardElement.style.transform = `scale(${scale})`;
        cardElement.style.opacity = opacity.toString();
        cardElement.style.zIndex = zIndex.toString();
        cardElement.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease-out';
      });
    };

    handleCarouselScroll();
    
    carousel.addEventListener('scroll', handleCarouselScroll, { passive: true });
    window.addEventListener('resize', handleCarouselScroll, { passive: true });
    
    return () => {
      carousel.removeEventListener('scroll', handleCarouselScroll);
      window.removeEventListener('resize', handleCarouselScroll);
    };
  }, [teamMembers]);

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section id="team" className="py-20 sm:py-24 bg-[#22223B] text-white relative overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-white/60">Loading team...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="pt-16 sm:pt-20 pb-6 sm:pb-8 bg-[#22223B] text-white relative overflow-hidden">
      {/* Subtle patterned overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 40px, white 40px, white 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)'
        }}
      />

      <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Meet the Team
              <br />
              Behind the Experience
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/65 max-w-lg leading-relaxed">
              Our dedicated team is committed to creating an unforgettable experience for every attendee.
            </p>
          </div>
          
          {/* Carousel navigation controls */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              onClick={() => handleScrollCarousel('left')}
              aria-label="Previous cards"
              className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#22223B] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScrollCarousel('right')}
              aria-label="Next cards"
              className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 text-white hover:bg-white hover:text-[#22223B] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              to="/team"
              className="ml-2 inline-flex items-center gap-2 h-10 px-5 border border-white/40 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal scrollable team cards with 3D effect */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-4 no-scrollbar items-center"
          style={{ 
            perspective: '1200px',
            perspectiveOrigin: 'center center',
            paddingLeft: 'max(1rem, calc(50vw - 140px))',
            paddingRight: 'max(1rem, calc(50vw - 140px))',
            scrollSnapType: 'x mandatory'
          }}
        >
          {teamMembers.map((member, index) => (
            <TeamCard key={member.id} member={member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, index }: { member: TeamMember; index: number }) {
  const [imageError, setImageError] = useState(false);
  const hasEmail = member.email && member.email !== 'N/A';
  const hasLinkedIn = member.linkedin && member.linkedin !== 'N/A';

  // Array of colors to cycle through
  const cardColors = [
    { bg: '#2C3E50', text: '#FFFFFF', accent: '#FF9900' }, // Dark blue-gray with white text
    { bg: '#5D6D7E', text: '#FFFFFF', accent: '#C9ADA7' }, // Medium gray-blue with white text
    { bg: '#1C2833', text: '#FFFFFF', accent: '#a2e048' }, // Very dark with white text
    { bg: '#8B5A3C', text: '#FFFFFF', accent: '#FFD700' }, // Brown with white text
    { bg: '#2C5F2D', text: '#FFFFFF', accent: '#90EE90' }, // Dark green with white text
    { bg: '#F2E9E4', text: '#22223B', accent: '#FF9900' }, // Light beige with dark text
  ];

  const colorScheme = cardColors[index % cardColors.length];

  return (
    <div 
      className="team-card-3d flex-shrink-0 w-[240px] xs:w-[260px] sm:w-[280px] group hover:shadow-xl overflow-hidden rounded-2xl snap-center transition-all duration-300"
      style={{ 
        backgroundColor: colorScheme.bg,
        borderWidth: '1px',
        borderColor: colorScheme.bg
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-[#22223B] to-[#4A4E69] overflow-hidden">
        {!imageError ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale-[15%]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#22223B] to-[#C9ADA7]">
            <span className="text-5xl sm:text-6xl font-bold text-white">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
        
        {/* Overlay with skills on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#22223B]/95 via-[#22223B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full">
            <p className="text-[10px] sm:text-xs text-white/80 font-mono uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.split(',').map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#C9ADA7] text-[#22223B] text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        <h4 
          className="text-sm sm:text-base font-semibold leading-tight mb-1"
          style={{ color: colorScheme.text }}
        >
          {member.name}
        </h4>
        <p 
          className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider mb-2"
          style={{ color: colorScheme.accent }}
        >
          {member.role}
        </p>
        <p 
          className="text-[10px] sm:text-[11px] leading-relaxed line-clamp-2 mb-2"
          style={{ color: colorScheme.text, opacity: 0.7 }}
        >
          {member.bio}
        </p>

        {/* Social Links */}
        <div 
          className="flex items-center gap-2 pt-2"
          style={{ borderTop: `1px solid ${colorScheme.text}`, borderTopColor: `${colorScheme.text}20` }}
        >
          {hasEmail && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center w-7 h-7 transition-colors"
              style={{ 
                backgroundColor: colorScheme.text === '#FFFFFF' ? '#00000030' : '#22223B',
                color: colorScheme.text
              }}
              aria-label={`Email ${member.name}`}
            >
              <Mail className="w-3 h-3" />
            </a>
          )}
          {hasLinkedIn && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-7 h-7 hover:bg-[#0077B5] transition-colors"
              style={{ 
                backgroundColor: colorScheme.text === '#FFFFFF' ? '#00000030' : '#22223B',
                color: colorScheme.text
              }}
              aria-label={`${member.name} on LinkedIn`}
            >
              <Linkedin className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
