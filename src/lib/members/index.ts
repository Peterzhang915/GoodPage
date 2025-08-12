// src/lib/members/index.ts
// 统一导出文件，保持向后兼容性

// 从 utils.ts 导出工具函数和类型
export {
  calculateMemberGradeStatus,
  calculateGraduationStatus,
  type EducationFormData,
} from "./utils";

// 从 queries.ts 导出查询函数
export {
  getAllMembersGrouped,
  getMemberProfileData,
  getAllMembersForManager,
} from "./queries";

// 从 education.ts 导出 Education CRUD 函数
export {
  getEducationRecordById,
  createEducationRecord,
  updateEducationRecord,
  deleteEducationRecord,
} from "./education";
