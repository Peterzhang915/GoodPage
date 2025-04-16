import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import { themeColors } from "@/styles/theme";
import { MemberStatus } from "@/lib/prisma"; // Import MemberStatus if needed for display logic

// Define the type for a single supervisee based on the select in getMemberProfileData
type SuperviseeInfo = {
  id: string;
  name_zh: string | null;
  name_en: string;
  status: MemberStatus;
  avatar_url: string | null;
};

type SuperviseesSectionProps = {
  supervisees: SuperviseeInfo[] | null | undefined;
};

const placeholderAvatar = "/avatars/placeholder.png";

const SuperviseesSection: React.FC<SuperviseesSectionProps> = ({
  supervisees,
}) => {
  if (!supervisees || supervisees.length === 0) {
    return null;
  }

  return (
    <section>
      <h2
        className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}
      >
        <Users size={18} /> 指导学生
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
        {supervisees.map((student) => (
          <Link
            href={`/members/${student.id}`}
            key={student.id}
            className={`flex items-center space-x-2 p-1.5 rounded hover:${themeColors.ccfCBg} transition-colors`}
          >
            <Image
              src={student.avatar_url || placeholderAvatar}
              alt={student.name_zh || student.name_en || "Avatar"}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="text-sm">
              <p className={`font-medium ${themeColors.linkColor}`}>
                {student.name_zh || student.name_en}
              </p>
              <p
                className={`text-xs capitalize ${themeColors.textColorTertiary}`}
              >
                {student.status === MemberStatus.ALUMNI
                  ? "Alumni"
                  : student.status.toLowerCase().replace("_", " ")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SuperviseesSection;
