import ProfessorProfileContent from "@/components/professor/ProfessorProfileContent";
import prisma from "@/lib/prisma";
import type { AcademicService, Award, Sponsorship } from "@prisma/client";
import type { PublicationInfo, DisplayAuthor } from "@/lib/types";
import { getPublicationsByMemberIdFormatted } from "@/lib/publications";

// 强制动态渲染，确保始终获取最新数据
export const dynamic = 'force-dynamic';

// 使用 Next.js 13+ app router 的 server component 写法
export default async function JiahuiHuPage() {
  // 1. 从数据库查找对应 member
  const professorId = "JiahuiHu"; // 教授ID
  const professor = await prisma.member.findUnique({
    where: { id: professorId },
  });

  // 2. 处理查无此人情况
  if (!professor) {
    return <div>未找到该教授信息</div>;
  }

  // 3. 从数据库获取教授相关数据
  let publications: PublicationInfo[] = [];
  let pubError: string | null = null;
  let services: AcademicService[] = [];
  let awards: Award[] = [];
  let sponsorships: Sponsorship[] = [];
  let dataError: string | null = null;

  try {
    // 获取出版物
    publications = await getPublicationsByMemberIdFormatted(professorId);
    
    // 获取学术服务
    services = await prisma.academicService.findMany({
      where: { member_id: professorId },
      orderBy: { display_order: "asc" },
    });
    
    // 获取奖项
    awards = await prisma.award.findMany({
      where: { member_id: professorId },
      orderBy: { display_order: "asc" },
    });
    
    // 获取资助/赞助
    sponsorships = await prisma.sponsorship.findMany({
      where: { member_id: professorId },
      orderBy: { display_order: "asc" },
    });
  } catch (err) {
    console.error(`获取教授 ${professorId} 的数据失败:`, err);
    dataError = err instanceof Error ? err.message : "加载数据失败";
  }

  // 4. 将数据分为特色和详细两类
  const featuredServices = services.filter(s => s.isFeatured);
  const detailedServices = services.filter(s => !s.isFeatured);
  
  const featuredAwards = awards.filter(a => a.isFeatured);
  const detailedAwards = awards.filter(a => !a.isFeatured);
  
  const featuredSponsorships = sponsorships.filter(s => s.isFeatured);
  const detailedSponsorships = sponsorships.filter(s => !s.isFeatured);

  // 5. 渲染教授个人资料页面
  return (
    <ProfessorProfileContent
      professorData={professor}
      publications={publications}
      pubError={pubError}
      featuredServices={featuredServices}
      detailedServices={detailedServices}
      featuredAwards={featuredAwards}
      detailedAwards={detailedAwards}
      featuredSponsorships={featuredSponsorships}
      detailedSponsorships={detailedSponsorships}
      dataError={dataError}
      addressLine1={professor.office_location || "IEB B404, 999 Xuefu BLVD"} // 优先使用数据库中的办公室位置
      addressLine2="Nanchang, Jiangxi, 330000"
    />
  );
} 