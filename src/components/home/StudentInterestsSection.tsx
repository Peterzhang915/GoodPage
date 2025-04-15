import React from 'react';
import ContentSection from '@/components/ContentSection';
import { themeColors } from '@/styles/theme';

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
