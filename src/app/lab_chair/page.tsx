// src/app/lab_chair/page.tsx

import { getAllPublicationsFormatted } from "@/lib/publications";
import type { PublicationInfo } from "@/lib/types";
// Import Prisma types including Sponsorship
import type {
  Member,
  AcademicService,
  Award,
  Sponsorship,
} from "@prisma/client";
// Import the extracted component
import prisma from "@/lib/prisma"; // Import Prisma Client instance
import LabChairProfileContent from "@/components/lab_chair/LabChairProfileContent";

// Force dynamic rendering (SSR) for this page
export const dynamic = 'force-dynamic';

// --- 教授页面组件 (Server Component - Primarily for data fetching) ---
export default async function ProfessorPage() {
  // --- 获取出版物数据 ---
  const professorId = "ZichenXu"; // Lab Chair 的 ID
  let allPublications: PublicationInfo[] = [];
  let pubError: string | null = null;
  try {
    // 获取所有论文，然后过滤出 Lab Chair 的 CCF A 论文
    allPublications = await getAllPublicationsFormatted();
  } catch (err) {
    console.error(`Failed to load publications:`, err);
    pubError = err instanceof Error ? err.message : "加载出版物列表失败";
  }
  // 过滤出 Lab Chair 本人的 CCF A 级别论文
  const ccfAPubs = allPublications.filter((pub: PublicationInfo) => {
    // 检查是否是 CCF A 级别
    if (pub.ccf_rank !== "A") return false;

    // 检查是否有 Lab Chair 作为作者
    return pub.displayAuthors.some(author =>
      author.type === "internal" && author.id === professorId
    );
  });

  // --- 获取学术服务、奖项和资助数据 ---
  let services: AcademicService[] = [];
  let awards: Award[] = [];
  let sponsorships: Sponsorship[] = []; // Add state for sponsorships
  let dataError: string | null = null;

  // --- 获取教授个人信息和关联数据 ---
  let leaderData: Member | null = null;
  try {
    leaderData = await prisma.member.findUnique({
      where: { id: professorId },
    });

    // Handle case where professor is not found early?
    // if (!professorData) { notFound(); }

    // Fetch services, awards, and sponsorships only if professor exists
    if (leaderData) {
      services = await prisma.academicService.findMany({
        where: { member_id: professorId },
        orderBy: { display_order: "asc" },
      });
      awards = await prisma.award.findMany({
        where: { member_id: professorId },
        orderBy: { display_order: "asc" },
      });
      // Fetch Sponsorships
      sponsorships = await prisma.sponsorship.findMany({
        where: { member_id: professorId },
        orderBy: { display_order: "asc" },
      });
    }
  } catch (err) {
    console.error(`Failed to load data for ${professorId}:`, err);
    dataError = err instanceof Error ? err.message : "加载页面数据失败";
    // Decide how to handle error - show message, fallback, etc.
  }

  // --- 分组数据 ---
  const featuredServices = services.filter((s) => s.isFeatured);
  const detailedServices = services.filter((s) => !s.isFeatured);
  const featuredAwards = awards.filter((a) => a.isFeatured);
  const detailedAwardsData = awards.filter((a) => !a.isFeatured);
  // Separate Sponsorships into featured and detailed
  const featuredSponsorships = sponsorships.filter((s) => s.isFeatured);
  const detailedSponsorships = sponsorships.filter((s) => !s.isFeatured);

  // TODO: Check if professor data itself needs to be fetched dynamically
  // For now, keeping the header static

  // --- Render the client component and pass data as props ---
  return (
    <LabChairProfileContent
      leaderData={leaderData}
      publications={ccfAPubs}
      pubError={pubError}
      featuredServices={featuredServices}
      detailedServices={detailedServices}
      featuredAwards={featuredAwards}
      detailedAwards={detailedAwardsData}
      featuredSponsorships={featuredSponsorships}
      detailedSponsorships={detailedSponsorships}
      dataError={dataError}
      addressLine1="999 Xuefu BLVD"
      addressLine2="Nanchang, Jiangxi, 330000"
    />
  );

}
