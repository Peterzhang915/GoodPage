// src/app/members/[memberId]/page.tsx
import React from "react";
// 数据获取和类型保持不变
import { getMemberProfileData } from "@/lib/members";
import type { MemberProfileData, PublicationInfo } from "@/lib/types";
import { notFound } from "next/navigation";

// 导入 Section 组件和 Sidebar
import BioSection from "@/components/members/sections/BioSection";
import EducationSection from "@/components/members/sections/EducationSection";
import ResearchInterestsSection from "@/components/members/sections/ResearchInterestsSection";
import PublicationsSection from "@/components/members/sections/PublicationsSection";
import AwardsSection from "@/components/members/sections/AwardsSection";
import ProjectsSection from "@/components/members/sections/ProjectsSection";
import TeachingSection from "@/components/members/sections/TeachingSection";
import PresentationsSection from "@/components/members/sections/PresentationsSection";
import SoftwareDatasetsSection from "@/components/members/sections/SoftwareDatasetsSection";
import PatentsSection from "@/components/members/sections/PatentsSection";
import AcademicServicesSection from "@/components/members/sections/AcademicServicesSection";
import MoreAboutMeSection from "@/components/members/sections/MoreAboutMeSection";
import SuperviseesSection from "@/components/members/sections/SuperviseesSection";
import MemberSidebar from "@/components/members/MemberSidebar";

// --- Props 类型定义 ---
interface MemberPageProps {
    params: {
        memberId: string;
  };
}

// --- 主页面组件 (Server Component) ---
export default async function MemberProfilePage({ params }: MemberPageProps) {
    const { memberId } = params;
    let memberProfileData: MemberProfileData | null = null;
    let error: string | null = null;

    try {
        memberProfileData = await getMemberProfileData(memberId);
    } catch (err) {
        console.error(`Failed to load profile for ${memberId}:`, err);
        error = err instanceof Error ? err.message : "加载成员档案失败";
    }

    if (!memberProfileData && !error) {
        notFound();
    }

    if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-red-600">
        <p>Error: {error}</p>
      </div>
    );
    }

    const {
    displayStatus,
    educationHistory,
    awards,
    projects,
    teachingRoles,
    presentations,
    softwareAndDatasets,
    patents,
    academicServices,
    publications,
    newsMentions,
    supervisor,
    supervisees,
    ...member
    } = memberProfileData!;

    return (
    <div
      className={`max-w-7xl mx-auto my-8 sm:my-12 shadow-lg rounded-lg overflow-hidden`}
    >
            <div className="md:flex">
        <MemberSidebar member={member} displayStatus={displayStatus} />
                <div className="md:w-2/3 p-6">
                    <div className="space-y-6 md:space-y-8">
            <BioSection bio_zh={member.bio_zh} bio_en={member.bio_en} />
            <EducationSection educationHistory={educationHistory} />
            <ResearchInterestsSection
              research_interests={memberProfileData!.research_interests}
            />
            <PublicationsSection publications={publications} />
            <AwardsSection awards={awards} />
            <ProjectsSection projects={projects} />
            <TeachingSection teachingRoles={teachingRoles} />
            <PresentationsSection presentations={presentations} />
            <SoftwareDatasetsSection
              softwareAndDatasets={softwareAndDatasets}
            />
            <PatentsSection patents={patents} />
            <AcademicServicesSection academicServices={academicServices} />
            <MoreAboutMeSection more_about_me={member.more_about_me} />
            <SuperviseesSection supervisees={supervisees} />
                    </div>
                </div>
            </div>
        </div>
    );
}
