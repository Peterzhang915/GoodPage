// src/lib/members/education.ts
// Education CRUD 操作函数

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { Education } from "@prisma/client";
import { EducationFormData } from "./utils";

/**
 * 根据 ID 获取单个教育记录
 */
export async function getEducationRecordById(educationId: number): Promise<Education | null> {
  console.log(`DB: 获取教育记录 ID: ${educationId}`);
  try {
    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });
    if (!education) {
      console.log(`DB: 未找到教育记录 ID: ${educationId}`);
      return null;
    }
    console.log(`DB: 成功获取教育记录 ID: ${educationId}`);
    return education;
  } catch (error) {
    console.error(`获取教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to fetch education record.");
  }
}

/**
 * 为成员创建新的教育记录
 */
export async function createEducationRecord(memberId: string, data: EducationFormData): Promise<Education> {
  console.log(`DB: 为成员 ${memberId} 创建新的教育记录`);
  
  if (!data.degree || !data.school) {
    throw new Error("Degree and School are required fields for creating education record.");
  }

  try {
    const processedData = {
      degree: data.degree, 
      school: data.school, 
      field: data.field ?? null, 
      start_year: data.start_year ? Number(data.start_year) : null,
      end_year: data.end_year ? Number(data.end_year) : null,
      thesis_title: data.thesis_title ?? null,
      description: data.description ?? null,
      display_order: data.display_order ? Number(data.display_order) : 0,
    };

    const newEducation = await prisma.education.create({
      data: {
        ...processedData, 
        member_id: memberId, 
      },
    });
    console.log(`DB: 成功为成员 ${memberId} 创建教育记录 ID: ${newEducation.id}`);
    return newEducation;
  } catch (error) {
    console.error(`为成员 ${memberId} 创建教育记录失败:`, error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        console.error(`Foreign key constraint failed (P2003) for member ID: ${memberId}`);
      }
      // It's often better to let the original error propagate or wrap it
      // throw new Error(`Database error during education record creation: ${error.message}`);
    }
    throw new Error("Failed to create education record.");
  }
}

/**
 * 更新现有的教育记录
 */
export async function updateEducationRecord(educationId: number, data: EducationFormData): Promise<Education> {
  console.log(`DB: 更新教育记录 ID: ${educationId}`);
  try {
    const processedData = {
      ...data,
      start_year: data.start_year ? Number(data.start_year) : data.start_year === null ? null : undefined, 
      end_year: data.end_year ? Number(data.end_year) : data.end_year === null ? null : undefined,
      display_order: data.display_order ? Number(data.display_order) : data.display_order === 0 ? 0 : undefined,
    };
    Object.keys(processedData).forEach(key => processedData[key as keyof typeof processedData] === undefined && delete processedData[key as keyof typeof processedData]);
    
    const updatedEducation = await prisma.education.update({
      where: { id: educationId },
      data: processedData,
    });
    console.log(`DB: 成功更新教育记录 ID: ${educationId}`);
    return updatedEducation;
  } catch (error) {
    console.error(`更新教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to update education record.");
  }
}

/**
 * 根据 ID 删除教育记录
 */
export async function deleteEducationRecord(educationId: number): Promise<Education> {
  console.log(`DB: 删除教育记录 ID: ${educationId}`);
  try {
    const deletedEducation = await prisma.education.delete({
      where: { id: educationId },
    });
    console.log(`DB: 成功删除教育记录 ID: ${educationId}`);
    return deletedEducation;
  } catch (error) {
    console.error(`删除教育记录 ID ${educationId} 失败:`, error);
    throw new Error("Failed to delete education record.");
  }
}
