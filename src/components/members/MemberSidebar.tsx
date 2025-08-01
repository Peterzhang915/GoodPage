import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MemberProfileImage } from "@/components/members/MemberProfileImage";
import {
  Github,
  ExternalLink,
  Linkedin,
  Mail,
  GraduationCap,
  BookCopy,
  FileText as FileIcon,
  Building,
  Clock,
  UserCheck,
  Home,
  BookOpen,
} from "lucide-react";
import { themeColors } from "@/styles/theme";
import type { Member, MemberStatus } from "@prisma/client"; // Import necessary types

// Define the props based on the fields used in the original aside section
// We might need a more specific type than just Member if only a subset is needed,
// but using Member directly is simpler for now.
type MemberSidebarProps = {
  member: Pick<
    Member,
    | "avatar_url"
    | "name_zh"
    | "name_en"
    | "email"
    | "github_username"
    | "personal_website"
    | "linkedin_url"
    | "google_scholar_id"
    | "dblp_id"
    | "cv_url"
    | "office_location"
    | "office_hours"
    | "recruiting_status"
    | "skills"
    | "status"
    | "enrollment_year" // Needed for status logic if not precalculated
  > & {
    // Include supervisor if it needs to be displayed in the sidebar
    supervisor?: { id: string; name_zh: string | null; name_en: string } | null;
  };
  displayStatus: string; // Pass the pre-calculated display status
};

const placeholderAvatar = "/avatars/placeholder.png";

const MemberSidebar: React.FC<MemberSidebarProps> = ({
  member,
  displayStatus,
}) => {
  // Extract supervisor for cleaner access
  const { supervisor } = member;

  return (
    <aside
      className={`md:w-1/3 p-6 bg-gradient-to-br from-${themeColors.ccfCBg} to-${themeColors.ccfBBg} flex flex-col items-center justify-start text-center`}
    >
      {/* Avatar */}
      <div
        className={`w-32 h-32 rounded-full overflow-hidden border-4 ${themeColors.footerBorder} shadow-md mb-4 flex-shrink-0`}
      >
        <MemberProfileImage
          src={member.avatar_url || placeholderAvatar}
          alt={`${member.name_zh || member.name_en} 头像`}
          width={128}
          height={128}
        />
      </div>
      {/* Basic Info */}
      <h1 className={`text-2xl font-bold ${themeColors.textColorPrimary}`}>
        {member.name_zh || member.name_en}
      </h1>
      {member.name_en && member.name_zh && (
        <p className={`text-md ${themeColors.textColorSecondary} mb-1`}>
          {member.name_en}
        </p>
      )}
      <p
        className={`text-sm font-semibold ${themeColors.textColorPrimary} mb-2`}
      >
        {displayStatus}
      </p>
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className={`text-sm ${themeColors.linkColor} hover:underline break-all mb-3 block flex items-center justify-center gap-x-1`}
        >
          <Mail size={14} /> {member.email}
        </a>
      )}

      {/* Social Icons */}
      <div className="flex justify-center items-center space-x-4 mt-2 mb-4 flex-wrap gap-y-2">
        {member.github_username && (
          <a
            href={`https://github.com/${member.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <Github size={20} />
          </a>
        )}
        {member.personal_website && (
          <a
            href={member.personal_website}
            target="_blank"
            rel="noopener noreferrer"
            title="Website"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <Home size={20} />
          </a>
        )}
        {member.linkedin_url && (
          <a
            href={member.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <Linkedin size={20} />
          </a>
        )}
        {member.google_scholar_id && (
          <a
            href={`https://scholar.google.com/citations?user=${member.google_scholar_id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Google Scholar"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <GraduationCap size={20} />
          </a>
        )}
        {member.dblp_url && (
          <a
            href={member.dblp_url}
            target="_blank"
            rel="noopener noreferrer"
            title="DBLP"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <BookCopy size={20} />
          </a>
        )}
        {member.orcid_id && (
          <a
            href={`https://orcid.org/${member.orcid_id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="ORCID"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <BookOpen size={20} />
          </a>
        )}
        {member.cv_url && (
          <a
            href={member.cv_url}
            target="_blank"
            rel="noopener noreferrer"
            title="CV"
            className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}
          >
            <FileIcon size={20} />
          </a>
        )}
      </div>

      {/* Additional Sidebar Info */}
      <div className="w-full space-y-3 text-xs border-t ${themeColors.footerBorder} pt-4">
        {member.office_location && (
          <p
            className={`${themeColors.textColorTertiary} flex items-center justify-center gap-x-1`}
          >
            <Building size={12} /> {member.office_location}
          </p>
        )}
        {member.office_hours && (
          <p
            className={`${themeColors.textColorTertiary} flex items-center justify-center gap-x-1`}
          >
            <Clock size={12} /> {member.office_hours}
          </p>
        )}
        {member.recruiting_status && (
          <div
            className={`${themeColors.textColorTertiary} flex items-center justify-center gap-x-1`}
          >
            <UserCheck size={12} /> {member.recruiting_status}
          </div>
        )}
        {member.skills && (
          <div className="text-center">
            <h3
              className={`text-xs font-semibold ${themeColors.textColorPrimary} mb-1`}
            >
              Skills
            </h3>
            <div className="flex flex-wrap justify-center gap-1">
              {member.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((skill, i) => (
                  <span
                    key={i}
                    className={`font-medium px-1.5 py-0.5 rounded ${themeColors.ccfCBg} ${themeColors.textColorSecondary}`}
                  >
                    {skill}
                  </span>
                ))}
            </div>
          </div>
        )}
        {supervisor && (
          <div className="text-center">
            <h3
              className={`text-xs font-semibold ${themeColors.textColorPrimary} mb-0.5`}
            >
              Supervisor
            </h3>
            <Link
              href={`/members/${supervisor.id}`}
              className={`${themeColors.linkColor} hover:underline`}
            >
              {supervisor.name_zh || supervisor.name_en}
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MemberSidebar;
