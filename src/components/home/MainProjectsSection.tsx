import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

const MainProjectsSection = () => {
  return (
    <ContentSection id="main-projects" title="Main Focus Projects">
      <div className="space-y-10 md:space-y-12">
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Open Sourced LLM Model Optimization</h3>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            We are interested in optimizing the runtime of any open-sourced language models, Large or Small. We believe the memory wall and energy issue still exists, as well as the scalability, in the modern open sourced AI models. The two approach to make the model better are (1) a deduplicated, and well-coded underlying memory management; (2) a better scheduling to ensure the balancing between the LM nodes. Meanwhile, it is worthwhile to explore the means of building such systems in a small scale, on the edge, as well as protected. This raises our interests on how data driven approach applies to such system optimization design.
          </p>
        </div>
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>Database Optimization and Correctness</h3>
          <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
            We are interested in novel database design on new hardware. We believe the storage as well as the processing are both the bottleneck of the database services. We are calling help from novel processing chips, like GPU and DCU, and new memory architecture, such as phase change memory, to integrate with a database design. As such, we are working towards building up fast databases with a broader view of underlying systems.
          </p>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            Making a correct database is hard. No one can guarantee that a database is correct all the time since it selects different execution paths even for the same query. We would like to further explore how we can guarantee the correctness of a database building, processing, and outputing. Furthermore, we would like to know that what we do is correct as well. For this, we introduce database test with fuzzors. Based on a fuzzy algebra, we can produce mutant samples of testing and verification for novel systems as well as the AI platform.
          </p>
        </div>
        <div>
          <h3 className={`text-lg md:text-xl font-semibold mb-3 ${themeColors.textColorPrimary}`}>An Elastic Consistency System</h3>
          <p className={`text-sm md:text-base leading-relaxed mb-4 ${themeColors.textColorSecondary}`}>
            We are trying to extend the original raft into the practical scenarios. That is providing scalable and cheap distributed services within the Raft protocol. The main contribution of this research is to extending the scope of a strong consensus algorithm into a very unreliable platform and make it work statistically in practice.
          </p>
          <p className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary}`}>
            Here we promote our eRaft. eRaft is a high-performance C++ Raft library. This project is mainly developed by graduates from our GOOD lab. The Raft algorithm shall be accredited to Dr. Diego Ongaro. At present, our project has been included in the official distribution. We hope to explore the possibility of optimizing the existing algorithms on the basis of realizing a stable practical Raft library. If you are interested, please join us. Anyone interested may refer project. {/* 考虑稍后在此处添加链接 */}
          </p>
        </div>
      </div>
    </ContentSection>
  );
};

export default MainProjectsSection;
