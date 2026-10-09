
import React, { useState, useEffect } from 'react';
import { Linkedin, Mail, Users } from 'lucide-react';

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

interface DepartmentGroup {
  department: string;
  members: TeamMember[];
}

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse CSV data
    fetch('/team-members.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');

        const members: TeamMember[] = lines.slice(1).map(line => {
          // Handle quoted fields with commas
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

        setTeamMembers(members);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading team members:', error);
        setLoading(false);
      });
  }, []);

  // Group members by department
  const departmentGroups: DepartmentGroup[] = teamMembers.reduce((acc, member) => {
    const existingGroup = acc.find(g => g.department === member.department);
    if (existingGroup) {
      existingGroup.members.push(member);
    } else {
      acc.push({ department: member.department, members: [member] });
    }
    return acc;
  }, [] as DepartmentGroup[]);

  // Get unique departments for filter
  const departments = ['All', ...departmentGroups.map(g => g.department)];

  // Filter members based on selected department
  const filteredMembers = selectedDepartment === 'All'
    ? teamMembers
    : teamMembers.filter(m => m.department === selectedDepartment);

  if (loading) {
    return (
      <section id="team" className="py-20 sm:py-24 bg-white relative overflow-hidden">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-[#64748b]">Loading team members...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="py-20 sm:py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #22223B 1px, transparent 1px), linear-gradient(to bottom, #22223B 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-[#C9ADA7]" />
            <span className="font-mono text-xs sm:text-sm text-[#C9ADA7] font-bold uppercase tracking-wider">
              Our Team
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-[#22223B] leading-tight">
            Meet the Team
            <br />
            Behind the Experience
          </h2>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#64748b] leading-relaxed">
            Behind every keynote, workshop, and community moment is a passionate team committed to creating an
            unforgettable experience for every attendee.
          </p>
        </div>

        {/* Department Filter */}
        <div className="mb-10 sm:mb-12 flex flex-wrap gap-2 sm:gap-3">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-mono font-semibold uppercase tracking-wider transition-all duration-200 border ${selectedDepartment === dept
                  ? 'bg-[#22223B] text-white border-[#22223B]'
                  : 'bg-white text-[#22223B] border-[#22223B]/20 hover:border-[#C9ADA7] hover:text-[#C9ADA7]'
                }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Team Members Grid */}
        {selectedDepartment === 'All' ? (
          // Show by department groups
          <div className="space-y-16 sm:space-y-20">
            {departmentGroups.map(group => (
              <div key={group.department}>
                <h3 className="text-2xl sm:text-3xl font-semibold text-[#22223B] mb-8 pb-3 border-b-2 border-[#C9ADA7]/30">
                  {group.department}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {group.members.map(member => (
                    <TeamMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show filtered members
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredMembers.map(member => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const [imageError, setImageError] = useState(false);
  const hasEmail = member.email && member.email !== 'N/A';
  const hasLinkedIn = member.linkedin && member.linkedin !== 'N/A';

  return (
    <div className="group bg-white border border-[#22223B]/10 hover:border-[#C9ADA7] transition-all duration-300 hover:shadow-xl overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-[#F2E9E4] to-[#E5E7EB] overflow-hidden">
        {!imageError ? (
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      <div className="p-5 sm:p-6">
        <h4 className="text-lg sm:text-xl font-semibold text-[#22223B] leading-tight mb-1">
          {member.name}
        </h4>
        <p className="text-xs sm:text-sm font-mono text-[#C9ADA7] font-bold uppercase tracking-wider mb-3">
          {member.role}
        </p>
        <p className="text-xs sm:text-[13px] text-[#64748b] leading-relaxed line-clamp-3 mb-4">
          {member.bio}
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#22223B]/10">
          {hasEmail && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center w-9 h-9 bg-[#F2E9E4] hover:bg-[#22223B] text-[#22223B] hover:text-white transition-colors"
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
              className="flex items-center justify-center w-9 h-9 bg-[#F2E9E4] hover:bg-[#0077B5] text-[#22223B] hover:text-white transition-colors"
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
