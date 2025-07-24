"use client"; // 标记为客户端组件

import React from "react";
import { motion } from "framer-motion"; // 导入动画组件
import type {
  Member,
  AcademicService,
  Award,
  Sponsorship,
} from "@prisma/client"; // 导入数据模型类型
import type { PublicationInfo } from "@/lib/types"; // 导入出版物信息类型
import { themeColors } from "@/styles/theme"; // 导入主题颜色

// 导入各部分组件
import ProfessorHeader from "@/components/professor/ProfessorHeader"; // 教授页面头部组件
import ResearchInterestsSection from "@/components/professor/ResearchInterestsSection"; // 研究兴趣部分组件
import PublicationsSection from "@/components/professor/PublicationsSection"; // 出版物部分组件
import AcademicServicesSection from "@/components/professor/AcademicServicesSection"; // 学术服务部分组件
import AwardsSection from "@/components/professor/AwardsSection"; // 奖项部分组件
import SponsorshipsSection from "@/components/professor/SponsorshipsSection"; // 资助部分组件

// 定义组件属性接口，从父服务器组件接收数据
interface ProfessorProfileContentProps {
  professorData: Member | null; // 教授基本信息数据
  publications: PublicationInfo[]; // 出版物列表
  pubError: string | null; // 获取出版物时可能发生的错误
  featuredServices: AcademicService[]; // 特色/重要学术服务列表
  detailedServices: AcademicService[]; // 详细学术服务列表
  featuredAwards: Award[]; // 特色/重要奖项列表
  detailedAwards: Award[]; // 详细奖项列表
  featuredSponsorships: Sponsorship[]; // 特色/重要资助列表
  detailedSponsorships: Sponsorship[]; // 详细资助列表
  dataError: string | null; // 获取数据时可能发生的错误
  addressLine1?: string; // 地址第一行（可选）
  addressLine2?: string; // 地址第二行（可选）
}

// 动画变体（可以进一步调整）
const containerVariants = {
  hidden: { opacity: 0 }, // 初始隐藏状态
  visible: {
    opacity: 1, // 显示状态
    transition: {
      staggerChildren: 0.15, // 子元素动画错开的时间，可根据需要调整
      delayChildren: 0.1, // 第一个子元素动画开始前的延迟
    },
  },
};

// 单个项目的动画变体
const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // 初始隐藏状态，向下偏移20像素
  visible: {
    opacity: 1, // 显示状态
    y: 0, // 恢复到原始位置
    transition: { type: "spring" as const, stiffness: 90, damping: 15 }, // 弹簧动画效果，带有适当的刚度和阻尼
  },
};

// 教授个人资料内容组件
const ProfessorProfileContent: React.FC<ProfessorProfileContentProps> = ({
  professorData,
  publications,
  pubError,
  featuredServices,
  detailedServices,
  featuredAwards,
  detailedAwards,
  featuredSponsorships,
  detailedSponsorships,
  dataError,
  addressLine1,
  addressLine2,
}) => {
  return (
    // 内容的根元素，应用主题背景
    <div className={`${themeColors.themePageBg ?? "bg-gray-50"} min-h-screen`}>
      {/* 头部部分 - 通常不作为交错动画的一部分，直接渲染 */}
      <ProfessorHeader professorData={professorData} addressLine1={addressLine1} addressLine2={addressLine2} />

      {/* 主内容区域，带有动画容器 */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 各部分容器 */}
        <div className="flex flex-col space-y-8 md:space-y-12">
          {/* 每个部分都用motion.div包裹以实现项目动画效果 */}
          
          {/* 研究兴趣部分 */}
          <motion.div variants={itemVariants}>
            <ResearchInterestsSection
              interestsText={professorData?.research_interests}
            />
          </motion.div>

          {/* 出版物部分 */}
          <motion.div variants={itemVariants}>
            <PublicationsSection
              publications={publications}
              fetchError={pubError}
            />
          </motion.div>

          {/* 学术服务部分 */}
          <motion.div variants={itemVariants}>
            <AcademicServicesSection
              featuredServices={featuredServices}
              detailedServices={detailedServices}
              fetchError={dataError}
            />
          </motion.div>

          {/* 奖项部分 */}
          <motion.div variants={itemVariants}>
            <AwardsSection
              featuredAwards={featuredAwards}
              detailedAwards={detailedAwards}
              fetchError={dataError}
            />
          </motion.div>

          {/* 资助部分 */}
          <motion.div variants={itemVariants}>
            <SponsorshipsSection
              featuredSponsorships={featuredSponsorships}
              detailedSponsorships={detailedSponsorships}
              fetchError={dataError}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfessorProfileContent;
