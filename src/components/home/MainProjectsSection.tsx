import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';
import Image from 'next/image';

/**
 * 实验室主要研究项目展示区组件
 * 
 * 负责展示当前实验室的三个核心研究方向及其研究成果：
 * 1. 开源LLM模型优化 - 聚焦大型语言模型的运行时优化和性能提升
 * 2. 数据库优化与正确性 - 关注新硬件下的数据库设计和正确性验证
 * 3. 弹性一致性系统 - 扩展Raft协议到实际应用场景
 * 
 * 每个项目区域采用左侧文本描述、右侧图表展示的布局方式，
 * 在移动设备上自动切换为垂直堆叠布局。
 */
const MainProjectsSection = () => {
  return (
    <ContentSection id="main-projects" title="Main Focus Projects">
      <div className="space-y-8 md:space-y-10">
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Open Sourced LLM Model Optimization</h3>
          <div className="md:flex md:gap-3 md:items-start">
            <div className="md:flex-1">
              <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                We are interested in optimizing the runtime of any open-sourced language models, Large or Small. We believe the memory wall and energy issue still exists, as well as the scalability, in the modern open sourced AI models. The two approach to make the model better are (1) a deduplicated, and well-coded underlying memory management; (2) a better scheduling to ensure the balancing between the LM nodes. Meanwhile, it is worthwhile to explore the means of building such systems in a small scale, on the edge, as well as protected. This raises our interests on how data driven approach applies to such system optimization design.
              </p>
            </div>
            <div className="md:w-1/5 mt-4 md:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <Image 
                  src="/images/llm-opt.png" 
                  alt="LLM Optimization Research" 
                  width={180} 
                  height={130} 
                  className="w-full h-auto object-cover"
                />
                <div className="p-1 text-xs text-center text-gray-600 dark:text-gray-300">
                  性能优化图表
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Database Optimization and Correctness</h3>
          <div className="md:flex md:gap-3 md:items-start">
            <div className="md:flex-1">
              <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
                We are interested in novel database design on new hardware. We believe the storage as well as the processing are both the bottleneck of the database services. We are calling help from novel processing chips, like GPU and DCU, and new memory architecture, such as phase change memory, to integrate with a database design. As such, we are working towards building up fast databases with a broader view of underlying systems.
              </p>
              <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                Making a correct database is hard. No one can guarantee that a database is correct all the time since it selects different execution paths even for the same query. We would like to further explore how we can guarantee the correctness of a database building, processing, and outputing. Furthermore, we would like to know that what we do is correct as well. For this, we introduce database test with fuzzors. Based on a fuzzy algebra, we can produce mutant samples of testing and verification for novel systems as well as the AI platform.
              </p>
            </div>
            <div className="md:w-1/5 mt-4 md:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <Image 
                  src="/images/db-opt.png" 
                  alt="Database Optimization Research" 
                  width={180} 
                  height={130} 
                  className="w-full h-auto object-cover"
                />
                <div className="p-1 text-xs text-center text-gray-600 dark:text-gray-300">
                  数据库测试架构
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>An Elastic Consistency System</h3>
          <div className="md:flex md:gap-3 md:items-start">
            <div className="md:flex-1">
              <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
                We are trying to extend the original raft into the practical scenarios. That is providing scalable and cheap distributed services within the Raft protocol. The main contribution of this research is to extending the scope of a strong consensus algorithm into a very unreliable platform and make it work statistically in practice.
              </p>
              <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
                Here we promote our eRaft. eRaft is a high-performance C++ Raft library. This project is mainly developed by graduates from our GOOD lab. The Raft algorithm shall be accredited to Dr. Diego Ongaro. At present, our project has been included in the official distribution. We hope to explore the possibility of optimizing the existing algorithms on the basis of realizing a stable practical Raft library. If you are interested, please join us. Anyone interested may refer project.
              </p>
            </div>
            <div className="md:w-1/5 mt-4 md:mt-0">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
                <Image 
                  src="/images/eraft.png" 
                  alt="Elastic Raft System" 
                  width={180} 
                  height={130} 
                  className="w-full h-auto object-cover"
                />
                <div className="p-1 text-xs text-center text-gray-600 dark:text-gray-300">
                  eRaft系统架构
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentSection>
  );
};

export default MainProjectsSection;
