// src/app/members/[memberId]/page.tsx
import React from 'react';
// 数据获取和类型保持不变
import { getMemberProfileData } from '@/lib/members';
import type { MemberProfileData, PublicationInfo } from '@/lib/types'; // 使用 V2 的类型
import type { Member, Education, Award, ProjectMember, Project, Teaching, Presentation, SoftwareDataset, Patent, AcademicService, News } from '@/lib/prisma';
import { PublicationType, ArtefactType, MemberStatus } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MemberProfileImage } from '@/components/MemberProfileImage';
import Link from 'next/link';
import {
    Github, ExternalLink, Linkedin, Mail, BookOpen, Link as LinkIcon, FileText as FileIcon,
    Calendar, Users, Clock, GraduationCap, Award as AwardIcon, Briefcase, Code, Database,
    FileText as PatentIcon, Presentation as PresentationIcon, UserCheck, Building, BookCopy, Info, Star, BriefcaseBusiness, Lightbulb
} from 'lucide-react';
import Image from 'next/image';
import { themeColors } from '@/styles/theme'; // 导入 V2 提供的 themeColors
import BioSection from '@/components/members/sections/BioSection'; // Import the new component
import EducationSection from '@/components/members/sections/EducationSection'; // Import EducationSection
import ResearchInterestsSection from '@/components/members/sections/ResearchInterestsSection'; // Import ResearchInterestsSection
import PublicationsSection from '@/components/members/sections/PublicationsSection'; // Import PublicationsSection
import AwardsSection from '@/components/members/sections/AwardsSection'; // Import AwardsSection
import ProjectsSection from '@/components/members/sections/ProjectsSection'; // Import ProjectsSection
import TeachingSection from '@/components/members/sections/TeachingSection'; // Import TeachingSection
import PresentationsSection from '@/components/members/sections/PresentationsSection'; // Import PresentationsSection
import SoftwareDatasetsSection from '@/components/members/sections/SoftwareDatasetsSection'; // Import SoftwareDatasetsSection
import PatentsSection from '@/components/members/sections/PatentsSection'; // Import PatentsSection
import AcademicServicesSection from '@/components/members/sections/AcademicServicesSection'; // Import AcademicServicesSection
import MoreAboutMeSection from '@/components/members/sections/MoreAboutMeSection'; // Import MoreAboutMeSection
import SuperviseesSection from '@/components/members/sections/SuperviseesSection'; // Import SuperviseesSection
import MemberSidebar from '@/components/members/MemberSidebar'; // Import MemberSidebar

// 【新增】定义需要高亮的论文标题集合 (小写), 与 PublicationItem 保持一致
const highlightedPaperTitles = new Set([
    "deep learning-based weather prediction: a survey",
    "exploring power-performance tradeoffs in database systems",
    "power attack: an increasing threat to data centers.",
    "blending on-demand and spot instances to lower costs for in-memory storage",
    "cadre: carbon-aware data replication for geo-diverse services",
    "pet: reducing database energy cost via query optimization",
    "{user-guided} device driver synthesis", // 注意特殊字符
    "when fpga meets cloud: a first look at performance"
]);

const placeholderAvatar = '/avatars/placeholder.png';

// --- Props 类型定义 ---
interface MemberPageProps {
    params: {
        memberId: string;
    }
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
        return ( <div className="container mx-auto px-4 py-12 text-center text-red-600"><p>Error: {error}</p></div> );
    }

    const {
        displayStatus, educationHistory, awards, projects, teachingRoles, presentations,
        softwareAndDatasets, patents, academicServices, publications, newsMentions,
        supervisor, supervisees, ...member
    } = memberProfileData!;

    return (
        // V1 Container Style
        <div className={`max-w-7xl mx-auto my-8 sm:my-12 ${themeColors.navBackground} shadow-lg rounded-lg overflow-hidden`}>
            {/* V1 Layout Style */}
            <div className="md:flex">

                {/* --- 左侧边栏 (V1 Style) --- */}
                {/* 【修改】使用 MemberSidebar 组件 */} 
                <MemberSidebar member={member} displayStatus={displayStatus} />

                {/* --- 右侧主内容区 (V1 Style) --- */}
                {/* V1 Width and Padding */}
                <div className="md:w-2/3 p-6">
                    {/* V1 Section Spacing */}
                    <div className="space-y-6 md:space-y-8">
                        {/* 个人简介 */}
                        <BioSection bio_zh={member.bio_zh} bio_en={member.bio_en} />

                        {/* 教育背景 */}
                        {educationHistory && educationHistory.length > 0 && (
                             <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><GraduationCap size={18}/> 教育背景</h2>
                                <ul className="space-y-3 list-none p-0 mt-3">
                                    {educationHistory.map(edu => (
                                        <li key={edu.id} className="flex items-start gap-x-2.5 text-sm">
                                            <div className={`w-1.5 h-1.5 mt-[7px] rounded-full ${themeColors.primaryBg} flex-shrink-0`}></div>
                                            <div className="flex-grow">
                                                <p className={`font-semibold ${themeColors.textColorPrimary}`}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                                                <p className={`${themeColors.textColorSecondary}`}>{edu.school}</p>
                                                <p className={`text-xs ${themeColors.textColorTertiary}`}>{edu.start_year} - {edu.end_year ?? 'Present'}</p>
                                                {edu.thesis_title && <p className={`text-xs italic ${themeColors.textColorTertiary} mt-0.5`}>Thesis: {edu.thesis_title}</p>}
                                                {edu.description && <p className={`text-xs ${themeColors.textColorTertiary} mt-0.5`}>{edu.description}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                         {/* 研究兴趣 */}
                        {member.research_interests && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Lightbulb size={18}/> 研究兴趣</h2>
                                {/* V1 Tag Style */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {member.research_interests.split(',').map(s => s.trim()).filter(Boolean).map((interest, index) => (
                                        <span key={index} className={`${themeColors.ccfBBg} ${themeColors.ccfAText} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                                            {interest}
                                        </span>
                                     ))}
                                </div>
                            </section>
                        )}

                        {/* 发表成果 */}
                        <PublicationsSection publications={publications} />

                        {/* 所获荣誉 */}
                        <AwardsSection awards={awards} />

                         {/* 研究项目 */}
                         <ProjectsSection projects={projects} />

                        {/* 教学经历 */}
                        <TeachingSection teachingRoles={teachingRoles} />

                        {/* 学术报告 */}
                        <PresentationsSection presentations={presentations} />

                         {/* 软件与数据集 */}
                         <SoftwareDatasetsSection softwareAndDatasets={softwareAndDatasets} />

                        {/* 专利 */}
                        <PatentsSection patents={patents} />

                        {/* 学术服务 */}
                        <AcademicServicesSection academicServices={academicServices} />

                         {/* "更多关于我" */}
                         <MoreAboutMeSection more_about_me={member.more_about_me} />

                         {/* 指导学生列表 */}
                         <SuperviseesSection supervisees={supervisees} />

                    </div>
                </div>
            </div>
        </div>
    );
}