import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Linkedin, Mail } from 'lucide-react';
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
  const [leadershipMembers, setLeadershipMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse CSV data and filter for Leadership Dept
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
        
        // Filter only Leadership Dept
        const leadership = members.filter(m => m.department === 'Leadership Dept');
        setLeadershipMembers(leadership);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading team members:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section id="team" className="py-20 sm:py-24 bg-[#23303E] text-white relative overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-white/60">Loading team...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
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

      <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12 sm:mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight">
              Meet the Leadership
              <br />
              Behind the Experience
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/65 max-w-lg leading-relaxed">
              Our leadership team is committed to creating an unforgettable experience for every attendee.
            </p>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 h-11 px-6 border border-white/40 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
          >
            <span>VIEW FULL TEAM</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {leadershipMembers.map(member => (
            <LeadershipCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LeadershipCard({ member }: { member: TeamMember }) {
  const [imageError, setImageError] = useState(false);
  const hasEmail = member.email && member.email !== 'N/A';
  const hasLinkedIn = member.linkedin && member.linkedin !== 'N/A';

  return (
    <div className="group bg-[#2D3C4E] border border-[#2D3C4E] hover:border-[#01c1ac] transition-all duration-300 hover:shadow-xl overflow-hidden hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-[#1a232f] to-[#23303E] overflow-hidden">
        {!imageError ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale-[15%]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#23303E] to-[#01c1ac]">
            <span className="text-5xl sm:text-6xl font-bold text-white">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
        
        {/* Overlay with skills on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#23303E]/95 via-[#23303E]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div className="w-full">
            <p className="text-[10px] sm:text-xs text-white/80 font-mono uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.split(',').map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#01c1ac] text-[#23303E] text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold text-white leading-tight mb-1">
          {member.name}
        </h4>
        <p className="text-xs sm:text-sm font-mono text-[#01c1ac] font-bold uppercase tracking-wider mb-3">
          {member.role}
        </p>
        <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed line-clamp-3 mb-4">
          {member.bio}
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
          {hasEmail && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center w-9 h-9 bg-[#23303E] hover:bg-[#01c1ac] text-white hover:text-[#23303E] transition-colors"
              aria-label={`Email ${member.name}`}
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
          {hasLinkedIn && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 bg-[#23303E] hover:bg-[#0077B5] text-white transition-colors"
              aria-label={`${member.name} on LinkedIn`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
