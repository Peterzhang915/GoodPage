import React from "react";
import Image from "next/image";
import type { Member } from "@prisma/client"; // Import Member type
import { themeColors } from "@/styles/theme";
// Import the new client component
import ObfuscatedContact from "@/components/common/ObfuscatedContact";

// Define the props type, expecting a Member object (or relevant parts)
type LabLeaderHeaderProps = {
  // Pass the whole Member object or select needed fields
  // Using partial allows flexibility if not all fields are always present
  leaderData: Partial<Member> | null;
  addressLine1?: string;
  addressLine2?: string;
};

const LabLeaderHeader: React.FC<LabLeaderHeaderProps> = ({ leaderData, addressLine1, addressLine2 }) => {
  // Provide default values or handle null case gracefully
  // 强制添加 Dr. 前缀
  const rawNameEn = leaderData?.name_en;
  const nameEn =
    rawNameEn && rawNameEn.trim().startsWith("Dr.")
      ? rawNameEn
      : `Dr. ${rawNameEn ?? "Zichen Xu"}`;
  const nameZh = leaderData?.name_zh;
  const titleEn = leaderData?.title_en ?? "Professor, Vice Dean";
  const titleZh = leaderData?.title_zh; // Use if available
  const school = "School of Mathematics and Computer Science"; // Potentially dynamic later
  const university = "The Nanchang University"; // Potentially dynamic later
  const email = leaderData?.email ?? "xuz@ncu.edu.cn";
  const phone = leaderData?.phone_number ?? "(0791) 8396 8516";
  const address1 = addressLine1 ?? "";
  const address2 = addressLine2 ?? "";
  const office = leaderData?.office_location;
  const avatarUrl = leaderData?.avatar_url ?? "/avatars/zichenxu.jpg"; // Default avatar

  return (
    <div
      className={`${themeColors.themeHeaderBg ?? "bg-slate-800"} ${themeColors.themeLightText ?? "text-gray-100"} py-10 md:py-12 lg:py-16`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-10">
          <div className="md:pr-8 text-center md:text-left mb-5 md:mb-0 flex-grow">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">
              {nameEn}
            </h1>
            {/* Display Chinese Name if available */}
            {nameZh && (
              <p className="text-lg sm:text-xl text-gray-300 mb-2">{nameZh}</p>
            )}
            <p className={`text-base sm:text-lg lg:text-xl mb-4`}>
              {titleEn}
              <br />
              {school}
              <br />
              {university}
            </p>
            {/* Contact info: Use <p> for block display */}
            <div
              className={`space-y-1 text-sm sm:text-base ${themeColors.themeLightText ?? "text-gray-100"}`}
            >
              {/* Use ObfuscatedContact for email */}
              {email && (
                <p>
                  Email: <ObfuscatedContact value={email} type="email" />
                </p>
              )}
              {/* Use ObfuscatedContact for phone */}
              {phone && (
                <p>
                  Office telephone:{" "}
                  <ObfuscatedContact value={phone} type="phone" />
                </p>
              )}
              {address1 && <p>{address1}</p>}
              {address2 && <p>{address2}</p>}
              {office && <p>Office: {office}</p>}
            </div>
          </div>
          <div
            className={`w-40 h-48 md:w-48 md:h-56 lg:w-52 lg:h-60 ${themeColors.backgroundLight ?? "bg-gray-200"} overflow-hidden rounded-lg flex-shrink-0 border-4 ${themeColors.borderLight ?? "border-gray-300"} shadow-lg`}
          >
            <Image
              src={avatarUrl}
              alt={nameEn}
              width={208}
              height={240}
              priority
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabLeaderHeader;
