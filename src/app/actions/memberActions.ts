'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache'; // 用于更新后重新验证页面缓存
import type { Member } from '@/lib/prisma'; // 只导入 Member 类型
import { MemberStatus } from '@/lib/prisma'; // 导入 MemberStatus 枚举

// --- 安全性增强: 定义允许通过此 Action 更新的字段列表 ---
// 这可以防止意外或恶意更新不应通过此简单 Action 修改的字段 (如 password_hash, role_name 等)
const ALLOWED_TEXT_FIELDS: ReadonlyArray<keyof Member> = [
  'name_en',
  'name_zh',
  'email',
  'title_en',
  'title_zh',
  'office_location',
  'phone_number', // 新增
  'office_hours', // 新增
  'pronouns',     // 新增
  'bio_en',
  'bio_zh',
  'research_statement_en',
  'research_statement_zh', // 新增
  'research_interests',    // 新增
  'skills',                // 新增
  'more_about_me',         // 新增
  'interests_hobbies',     // 新增
  'personal_website',
  'github_username',
  'linkedin_url',
  'google_scholar_id',
  'dblp_id',
  'cv_url',
  'avatar_url', // 新增
  // 'status', // 需要不同的处理方式 (Select)
  // 'enrollment_year', // 需要不同的处理方式 (Number)
  // 'graduation_year', // 需要不同的处理方式 (Number)
  // 'is_profile_public', // 需要不同的处理方式 (Switch/Checkbox)
] as const; // 使用 as const 获得更精确的类型

// 从 Member 类型中挑选出允许更新的字段，形成一个类型
type UpdatableMemberTextFields = Pick<Member, typeof ALLOWED_TEXT_FIELDS[number]>;

export async function updateMemberField(
  memberId: string,
  fieldName: keyof UpdatableMemberTextFields, // 强制 fieldName 必须在允许的列表内
  value: string | null,
): Promise<{ success: boolean; error?: string }> {
  console.log(`Action: Updating field '${fieldName}' for member ${memberId} with value: "${value}"`);

  // --- 输入验证 ---
  if (!ALLOWED_TEXT_FIELDS.includes(fieldName)) {
     console.error(`Action Error: Attempted to update disallowed field '${fieldName}' for member ${memberId}`);
     return { success: false, error: `Updating field '${fieldName}' is not allowed through this action.` };
  }
   if (!memberId) {
     return { success: false, error: "Member ID is required." };
   }
   // 可选：根据 fieldName 添加更具体的 value 验证 (e.g., email format)

  // --- TODO: 权限检查 ---
  // 在这里需要检查当前执行 Action 的用户是否有权限修改这个 memberId 的这个 fieldName
  // const { getUser } = await import('@/lib/auth'); // 延迟导入 auth 相关函数
  // const user = await getUser();
  // if (!user) {
  //   return { success: false, error: "Authentication required." };
  // }
  // if (!checkPermission(user, 'manage_members', memberId) && user.id !== memberId) { // 简化：管理员或自己才能改
  //   return { success: false, error: "Permission denied." };
  // }
  console.warn(`Action Warning: Permission check is currently disabled in updateMemberField for member ${memberId}`);


  try {
    // 构建更新数据对象
    // 使用 [fieldName] 作为计算属性名
    const dataToUpdate: Partial<UpdatableMemberTextFields> = {
      [fieldName]: value === '' || value === null ? null : value, // 将空字符串视为空值 (null)
    };

    await prisma.member.update({
      where: { id: memberId },
      data: dataToUpdate,
    });

    console.log(`Action: Successfully updated field '${fieldName}' for member ${memberId}`);

    // --- 缓存重新验证 ---
    // 清除可能受影响的页面的缓存
    const pathsToRevalidate = [
        '/members', // 成员列表
        '/developer/members', // 开发者成员列表
        `/members/${memberId}`, // 该成员的公开个人主页
        // 编辑页面本身通常不需要重新验证，因为客户端状态会更新
        // `/developer/members/${memberId}/edit`
    ];

    // 如果更新的是核心信息 (name, avatar)，可能还需要重新验证 layout 或 header
    if (['name_en', 'name_zh', 'avatar_url'].includes(fieldName)) {
       // Revalidate layout if member info is displayed globally
       // revalidatePath('/', 'layout'); // Revalidate all layouts
    }

    pathsToRevalidate.forEach(path => revalidatePath(path));
    console.log(`Action: Revalidated paths: ${pathsToRevalidate.join(', ')}`);


    return { success: true };
  } catch (error) {
    console.error(`Action: Error updating field '${fieldName}' for member ${memberId}:`, error);

    // 提供更具体的错误反馈
    if (error instanceof Error) {
       // 检查 Prisma 特定的错误（需要导入 Prisma）
       // import { Prisma } from '@prisma/client';
       // if (error instanceof Prisma.PrismaClientKnownRequestError) {
       //   if (error.code === 'P2002') { // Unique constraint violation
       //     return { success: false, error: `Failed to update: The value for ${fieldName} must be unique.`};
       //   }
       //   // 可以添加其他 Prisma 错误码的处理
       // }
       // 通用错误信息
       return { success: false, error: `Database error: ${error.message}` };
    }
    // 未知错误
    return { success: false, error: 'An unknown error occurred during the update.' };
  }
}

// --- Action to update Member Status ---
export async function updateMemberStatus(
  memberId: string,
  newStatusValue: string // Value from Select is usually string
): Promise<{ success: boolean; error?: string }> {

  // --- Input Validation ---
  if (!memberId) {
    return { success: false, error: "Member ID is required." };
  }

  // Validate if newStatusValue is a valid MemberStatus enum key
  const isValidStatus = Object.values(MemberStatus).includes(newStatusValue as MemberStatus);
  if (!isValidStatus) {
      console.error(`Action Error: Invalid status value '${newStatusValue}' for member ${memberId}`);
      return { success: false, error: `Invalid status value provided: ${newStatusValue}` };
  }
  // Cast to the enum type after validation
  const newStatus: MemberStatus = newStatusValue as MemberStatus;

  console.log(`Action: Updating status for member ${memberId} to: ${newStatus}`);

  // --- TODO: Permission Check ---
  // const currentUser = await getCurrentUser();
  // if (!checkPermission(currentUser, 'manage_members', memberId)) { // Need appropriate permission check
  //   return { success: false, error: "Permission denied." };
  // }
  console.warn(`Action Warning: Permission check is currently disabled in updateMemberStatus for member ${memberId}`);

  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { status: newStatus }, // Update the status field
    });

    console.log(`Action: Successfully updated status for member ${memberId}`);

    // --- Cache Revalidation ---
    const pathsToRevalidate = [
      '/members',
      '/developer/members',
      `/members/${memberId}`,
      // Consider revalidating specific group pages if they exist
    ];
    pathsToRevalidate.forEach(path => revalidatePath(path));
    console.log(`Action: Revalidated paths after status update: ${pathsToRevalidate.join(', ')}`);

    return { success: true };

  } catch (error) {
    console.error(`Action: Error updating status for member ${memberId}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred during status update.' };
  }
}

// --- Action to update Profile Visibility (is_profile_public) ---
export async function updateMemberProfileVisibility(
  memberId: string,
  isPublic: boolean // The new boolean value from the Switch
): Promise<{ success: boolean; error?: string }> {

  // --- Input Validation ---
  if (!memberId) {
    return { success: false, error: "Member ID is required." };
  }
  // Type check (though Switch usually sends boolean)
  if (typeof isPublic !== 'boolean') {
     console.error(`Action Error: Invalid visibility value type '${typeof isPublic}' for member ${memberId}`);
     return { success: false, error: `Invalid visibility value provided.` };
  }

  console.log(`Action: Updating profile visibility for member ${memberId} to: ${isPublic}`);

  // --- TODO: Permission Check ---
  // Can the current user change the visibility of this profile? Usually admin or self.
  // const currentUser = await getCurrentUser();
  // if (!checkPermission(currentUser, 'manage_members', memberId) && currentUser.id !== memberId) {
  //   return { success: false, error: "Permission denied." };
  // }
  console.warn(`Action Warning: Permission check is currently disabled in updateMemberProfileVisibility for member ${memberId}`);

  try {
    await prisma.member.update({
      where: { id: memberId },
      data: { is_profile_public: isPublic }, // Update the boolean field
    });

    console.log(`Action: Successfully updated profile visibility for member ${memberId}`);

    // --- Cache Revalidation ---
    // Visibility change mainly affects the public profile page and member list
    const pathsToRevalidate = [
      '/members', // Public member list might change
      `/members/${memberId}`, // The public profile page itself
      // '/developer/members', // Maybe developer list shows visibility?
    ];
    pathsToRevalidate.forEach(path => revalidatePath(path));
    console.log(`Action: Revalidated paths after visibility update: ${pathsToRevalidate.join(', ')}`);

    return { success: true };

  } catch (error) {
    console.error(`Action: Error updating visibility for member ${memberId}:`, error);
    if (error instanceof Error) {
       return { success: false, error: `Database error: ${error.message}` };
    }
    return { success: false, error: 'An unknown error occurred during visibility update.' };
  }
}

// --- TODO: 添加用于处理关联数据 (Education, Awards etc.) 的 Actions ---
// export async function addEducationRecord(memberId: string, data: EducationFormData) { ... }
// export async function updateEducationRecord(educationId: number, data: EducationFormData) { ... }
// export async function deleteEducationRecord(educationId: number) { ... } 