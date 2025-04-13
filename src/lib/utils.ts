// src/lib/utils.ts
// 或者 src/lib/calculateStatus.ts

// 从 prisma.ts 导入需要的类型和 Enum (如果需要)
// 或者直接从 @prisma/client 导入，如果 prisma.ts 没有 re-export *
import type { Member } from '@/lib/prisma'; // 假设 prisma.ts 导出了 Member
import { MemberStatus } from '@/lib/prisma'; // 假设 prisma.ts 导出了 MemberStatus

/**
 * 计算成员显示状态 (例如年级)
 * @param member - 包含 status, enrollment_year, title_zh 的成员对象片段
 * @returns 计算后的显示状态字符串
 */
export function calculateMemberGradeStatus(member: Pick<Member, 'status' | 'enrollment_year' | 'title_zh'>): string {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const academicYearStartMonth = 9;
  const academicYearAdjustment = currentMonth >= academicYearStartMonth ? 0 : -1;
  const currentAcademicYear = currentYear + academicYearAdjustment;

  switch (member.status) {
    case MemberStatus.PROFESSOR:
    case MemberStatus.POSTDOC:
    case MemberStatus.RESEARCH_STAFF:
      return member.title_zh || member.status;
    case MemberStatus.PHD_STUDENT:
      return `${member.enrollment_year ?? '?'}级博士生`;
    case MemberStatus.MASTER_STUDENT:
      return `${member.enrollment_year ?? '?'}级硕士生`;
    case MemberStatus.UNDERGRADUATE:
      if (member.enrollment_year) {
        const grade = currentAcademicYear - member.enrollment_year + 1;
        if (grade >= 1 && grade <= 4) return `${member.enrollment_year}级本科生`;
        else if (grade > 4) return `本科生 (已毕业)`;
        else return `本科生 (未入学?)`;
      }
      return '本科生';
    case MemberStatus.VISITING_SCHOLAR: return '访问学者';
    case MemberStatus.ALUMNI: return '校友';
    case MemberStatus.OTHER: return member.status;
    default:
      const exhaustiveCheck: never = member.status;
      return member.status;
  }
}

// 未来可以添加其他通用工具函数