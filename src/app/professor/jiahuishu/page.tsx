import ProfessorProfileContent from "@/components/lab_leader/ProfessorProfileContent";
import prisma from "@/lib/prisma";
import type { AcademicService, Award, Sponsorship } from "@prisma/client";
import type { PublicationInfo } from "@/lib/types";

// 使用 Next.js 13+ app router 的 server component 写法
export default async function JiahuiHuPage() {
  // 1. 从数据库查找对应 member
  const member = await prisma.member.findUnique({
    where: { id: "JiahuiHu" },
  });

  // 2. 处理查无此人情况
  if (!member) {
    return <div>未找到该教授信息</div>;
  }

  // 3. 其余数据建议后续也从数据库查，这里暂用空数组
  const publications: PublicationInfo[] = [];
  const featuredServices: AcademicService[] = [];
  const detailedServices: AcademicService[] = [];
  const featuredAwards: Award[] = [];
  const detailedAwards: Award[] = [];
  const featuredSponsorships: Sponsorship[] = [];
  const detailedSponsorships: Sponsorship[] = [];

  return (
    <ProfessorProfileContent
      leaderData={member}
      publications={publications}
      pubError={null}
      featuredServices={featuredServices}
      detailedServices={detailedServices}
      featuredAwards={featuredAwards}
      detailedAwards={detailedAwards}
      featuredSponsorships={featuredSponsorships}
      detailedSponsorships={detailedSponsorships}
      dataError={null}
      addressLine1="IEB B404, 999 Xuefu BLVD" // 示例地址，请根据实际情况填写
      addressLine2="Nanchang, Jiangxi, 330000"
    />
  );
} 