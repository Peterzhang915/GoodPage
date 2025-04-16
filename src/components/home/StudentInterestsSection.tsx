import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

/**
 * 学生招募信息展示组件
 * 
 * 目的：
 * - 向有兴趣加入实验室的潜在学生展示技能要求和期望
 * - 提供明确的学术方向指引，突出AI和大数据系统领域
 * - 区分本科生和研究生的不同要求标准
 * 
 * 内容结构：
 * - 引言说明：概述基本要求和技能期望
 * - 核心技能列表：编程、数据管理、硬件经验、模拟器和机器学习等五个方向
 * - 联系方式引导：鼓励感兴趣的学生通过邮件取得联系
 * 
 * 该组件使用响应式设计，确保在不同设备上保持良好的可读性和视觉层次。
 */
const StudentInterestsSection = () => {
  return (
    <ContentSection id="interests" title="Students with Interests">
      <p className={`mb-4 text-base leading-relaxed ${themeColors.textColorSecondary}`}>
        If you are interested in AI and Big Data System, and good at two or more of the following skills, we shall definitely meet and talk. (If you are a undergraduate, one is sufficient)
      </p>
      <ul className={`list-disc pl-5 sm:pl-6 space-y-3 text-sm md:text-base ${themeColors.textColorSecondary}`}>
        <li>Decent programming skills (C, C++, Python, Rust, etc.)</li>
        <li>Data Management Programming or Kernel Optimization (SQL, CQL, NewSQL, PostgreSQL, Cassandra, Redis, Zookeeper, Docker, etc.)</li>
        <li>Hardware hands-on experience (Verilog/VHDL/Chisel, HLS C/C++/OpenCL, CUDA, OpenCL)</li>
        <li>Hardware simulators and modeling (gem5, gpgpu-sim, Multi2Sim, etc.)</li>
        <li>Modeling and machine learning (Matlab, PyTorch, TF, Keras)</li>
      </ul>
      <p className={`mt-6 text-base leading-relaxed ${themeColors.textColorSecondary}`}>
        For more information, please feel free to contact me using the email address on my page.
      </p>
    </ContentSection>
  );
};

export default StudentInterestsSection;
