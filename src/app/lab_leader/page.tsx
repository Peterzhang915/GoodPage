// src/app/xuz/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Link as LinkIcon, FileText as FileIcon, Calendar, Users } from 'lucide-react';
import { notFound } from 'next/navigation';

// 【修改】导入获取 *所有* 论文的函数和类型
import { getAllPublicationsFormatted } from '@/lib/publications';
import type { PublicationInfo, AuthorInfo } from '@/lib/types';
// Import Prisma types including Sponsorship
import type { Member, AcademicService, Award, Sponsorship } from '@prisma/client';
// Import the extracted component
import PublicationItem from '@/components/publications/PublicationItem';
import prisma from '@/lib/prisma'; // Import Prisma Client instance

import { themeColors } from '@/styles/theme';

// Import placeholder components (we will create these next)
import AcademicServicesSection from '@/components/lab_leader/AcademicServicesSection';
import AwardsSection from '@/components/lab_leader/AwardsSection';
// Import the new Sponsorships section component
import SponsorshipsSection from '@/components/lab_leader/SponsorshipsSection';
// Import the new Header component
import LabLeaderHeader from '@/components/lab_leader/LabLeaderHeader';
// Import the new Research Interests component
import ResearchInterestsSection from '@/components/lab_leader/ResearchInterestsSection';
// Import the new Publications component
import PublicationsSection from '@/components/lab_leader/PublicationsSection';

// --- 单个论文条目组件 ---
// (保持不变，接收 PublicationInfo)
// function PublicationItem({ pub }: { pub: PublicationInfo }) { ... } // REMOVED


// --- 教授页面组件 (Server Component) ---
export default async function ProfessorPage() {

  // --- 获取出版物数据 ---
  let allPublications: PublicationInfo[] = [];
  let pubError: string | null = null;
  try {
    allPublications = await getAllPublicationsFormatted();
  } catch (err) {
    console.error(`Failed to load all publications:`, err);
    pubError = err instanceof Error ? err.message : "加载出版物列表失败";
  }
  const ccfAPubs = allPublications.filter((pub: PublicationInfo) => pub.ccf_rank === 'A');

  // --- 获取学术服务、奖项和资助数据 ---
  let services: AcademicService[] = [];
  let awards: Award[] = [];
  let sponsorships: Sponsorship[] = []; // Add state for sponsorships
  let dataError: string | null = null;
  const professorId = 'ZichenXu'; // Assuming the ID is fixed

  // --- 获取教授个人信息和关联数据 ---
  let professorData: Member | null = null;
  try {
    professorData = await prisma.member.findUnique({
      where: { id: professorId },
    });

    // Handle case where professor is not found early?
    // if (!professorData) { notFound(); }

    // Fetch services, awards, and sponsorships only if professor exists
    if (professorData) {
        services = await prisma.academicService.findMany({
          where: { member_id: professorId },
          orderBy: { display_order: 'asc' },
        });
        awards = await prisma.award.findMany({
          where: { member_id: professorId },
          orderBy: { display_order: 'asc' },
        });
        // Fetch Sponsorships
        sponsorships = await prisma.sponsorship.findMany({
          where: { member_id: professorId },
          orderBy: { display_order: 'asc' }, // Sorting here is okay, but also done in component
        });
    }
  } catch (err) {
    console.error(`Failed to load data for ${professorId}:`, err);
    dataError = err instanceof Error ? err.message : "加载页面数据失败";
    // Decide how to handle error - show message, fallback, etc.
  }

  // --- 分组数据 ---
  const featuredServices = services.filter(s => s.isFeatured);
  const detailedServices = services.filter(s => !s.isFeatured);
  const featuredAwards = awards.filter(a => a.isFeatured);
  const detailedAwardsData = awards.filter(a => !a.isFeatured);
  // Separate Sponsorships into featured and detailed
  const featuredSponsorships = sponsorships.filter(s => s.isFeatured);
  const detailedSponsorships = sponsorships.filter(s => !s.isFeatured);

  // --- 移除硬编码数据 ---
  // const academicServices = [ ... ]; // REMOVED
  // const detailedServices = [ ... ]; // REMOVED
  // const recentHighlights = [ ... ]; // REMOVED
  // const researchGrants = [ ... ]; // REMOVED
  // const detailedAwards = [ ... ]; // REMOVED
  // -----------------------------------

  // TODO: Check if professor data itself needs to be fetched dynamically
  // For now, keeping the header static

  return (
    <div className={`${themeColors.themePageBg ?? 'bg-gray-50'} min-h-screen`}>

      {/* 顶部标题栏区域: 使用新组件和动态数据 */}
      <LabLeaderHeader leaderData={professorData} />

      {/* 主要内容区域 - Reduced Padding and Spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"> {/* Reduced py-16/20 */}
        <div className="flex flex-col space-y-8 md:space-y-12"> {/* Increased spacing */}

          {/* 研究兴趣板块: 使用新组件，并传递动态获取的数据 */}
          <ResearchInterestsSection interestsText={professorData?.research_interests} />

          {/* 出版物板块: 使用新组件并传递数据和错误信息 */}
          <PublicationsSection publications={ccfAPubs} fetchError={pubError} />

          {/* 学术服务板块: 使用新组件和动态数据 */}
          <AcademicServicesSection
              featuredServices={featuredServices}
              detailedServices={detailedServices}
              fetchError={dataError} // Pass potential error with consistent name
          />

          {/* 奖项与荣誉板块: 使用新组件和动态数据 */}
          <AwardsSection
              featuredAwards={featuredAwards}
              detailedAwards={detailedAwardsData} // Pass the non-featured awards
              fetchError={dataError} // Pass potential error with consistent name
          />

          {/* 资助与项目板块: 添加新组件 */}
          <SponsorshipsSection
              featuredSponsorships={featuredSponsorships} // Pass featured sponsorships
              detailedSponsorships={detailedSponsorships} // Pass detailed sponsorships
              // fetchError={dataError} // Pass error if component handles it
          />

        </div> {/* 内容板块容器结束 */}
      </div> {/* 主要内容区域结束 */}
    </div> // 页面最外层容器结束
  );
}