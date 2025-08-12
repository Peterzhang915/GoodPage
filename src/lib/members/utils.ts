// src/lib/members/utils.ts
// 成员状态计算相关的工具函数

import { MemberStatus } from "@prisma/client";
import type { Member, Education } from "@prisma/client";

/**
 * 计算成员显示状态字符串，考虑学年计算
 * 示例: "23 Grade Undergraduate (Year 2)", "Professor", "Alumni"
 * 假设学年从9月开始（月份索引8）
 * @param member - 包含至少 status、enrollment_year、title_zh 的成员对象
 * @returns 显示字符串
 */
export function calculateMemberGradeStatus(
  member: Pick<Member, "status" | "enrollment_year" | "title_zh">
): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = January, 8 = September
  const academicYearStartMonth = 8; // September

  const yearSuffix = member.enrollment_year
    ? String(member.enrollment_year).slice(-2)
    : null;

  let grade: number | null = null;
  if (member.enrollment_year) {
    const yearDiff = currentYear - member.enrollment_year;
    if (currentMonth >= academicYearStartMonth) {
      // If current month is Sep or later, we are in the next academic year relative to start
      grade = yearDiff + 1;
    } else {
      // If current month is Jan-Aug, we are still in the academic year that started last year
      grade = yearDiff; // Corrected logic
    }
    // Ensure grade is at least 1 if enrollment year is the current year and month is >= start month
    if (grade <= 0 && currentYear === member.enrollment_year && currentMonth >= academicYearStartMonth) {
        grade = 1;
    }
    // Ensure grade is at least 1 if enrollment year is the previous year and month is < start month
     else if (grade <= 0 && currentYear === member.enrollment_year + 1 && currentMonth < academicYearStartMonth) {
         grade = 1;
     } else if (grade <= 0) {
         grade = null; // Invalid enrollment year or future start?
     }

  }

  switch (member.status) {
    case MemberStatus.PROFESSOR:
      return member.title_zh || "Professor";
    case MemberStatus.POSTDOC:
      return "Postdoc";
    case MemberStatus.PHD_STUDENT:
      return yearSuffix && grade
        ? `${yearSuffix} Grade Ph.D. (Year ${grade})`
        : yearSuffix ? `${yearSuffix} Grade Ph.D.` : "Ph.D. Student";
    case MemberStatus.MASTER_STUDENT:
      return yearSuffix && grade
        ? `${yearSuffix} Grade Master (Year ${grade})`
        : yearSuffix ? `${yearSuffix} Grade Master` : "Master Student";
    case MemberStatus.UNDERGRADUATE:
      if (yearSuffix && grade) {
        // Typically undergrad is 4 years, adjust range if needed
        if (grade >= 1 && grade <= 4) { 
          return `${yearSuffix} Grade Undergraduate (Year ${grade})`;
        } else {
          // Handle cases outside the typical 1-4 range (e.g., graduated, 5th year)
          return `${yearSuffix} Grade Undergraduate`; 
        }
      } else {
        return "Undergraduate";
      }
    case MemberStatus.VISITING_SCHOLAR:
      return "Visiting Scholar";
    case MemberStatus.RESEARCH_STAFF:
      return "Research Staff";
    case MemberStatus.ALUMNI:
      return "Alumni";
    case MemberStatus.OTHER:
    default:
      const statusString = member.status
          ? member.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : "Member";
      return statusString || "Unknown Status";
  }
}

/**
 * 计算成员是否已毕业
 * @param member 成员信息
 * @returns 是否已毕业
 */
export function calculateGraduationStatus(member: Pick<Member, "status" | "enrollment_year">): boolean {
  if (!member.enrollment_year) return false;

  const currentYear = new Date().getFullYear();
  const enrollmentYear = member.enrollment_year;
  const yearsEnrolled = currentYear - enrollmentYear;

  // 毕业逻辑
  switch (member.status) {
    case MemberStatus.UNDERGRADUATE:
      return yearsEnrolled >= 4; // 本科生4年毕业
    case MemberStatus.MASTER_STUDENT:
      return yearsEnrolled >= 3; // 研究生3年毕业
    case MemberStatus.PHD_STUDENT:
      // TODO: 博士生毕业逻辑待定，通常需要5-7年且取决于研究进展
      return false;
    default:
      return false; // 教授、博士后等不适用毕业逻辑
  }
}

/**
 * Education 表单数据类型定义
 */
export type EducationFormData = Partial<Omit<Education, 'id' | 'member_id' | 'member'>>;
