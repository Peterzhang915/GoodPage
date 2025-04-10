"use client";

import React from 'react';
// Removed Image import as it's unused for now
// import Image from "next/image";
// 引入 framer-motion
import { motion } from 'framer-motion';

// 简单的 Navbar 组件
const Navbar: React.FC = () => {
  // 更新 navItems 的 href 以指向页面内 ID
  const navItems = [
    { name: 'Research', href: '#main-projects' }, // 指向主要研究项目
    { name: 'Professor Zichen Xu', href: '#professor' }, // 暂时保留 # 或指向未来页面/区域
    { name: 'Lab Members', href: '#members' }, // 暂时保留 # 或指向未来页面/区域
    { name: 'Contact', href: '#contact' }, // 暂时保留 # 或指向未来页面/区域
    { name: 'Lab Photo Gallery', href: '#gallery' }, // 暂时保留 # 或指向未来页面/区域
    { name: 'Lab Blog', href: '#blog' }, // 暂时保留 # 或指向未来页面/区域
    { name: 'For Students', href: '#interests' }, // 指向学生兴趣区域
  ];

  return (
    // 外层 nav 负责背景、阴影和定位，并占满全宽
    <nav className="bg-white shadow-sm sticky top-0 z-10 w-full">
      {/* 内层 div 负责限制内容宽度并居中 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 Logo 或标题 */}
          <div className="flex-shrink-0">
            <a href="#" className="text-xl font-semibold text-gray-800">
              Good HomePage
            </a>
          </div>

          {/* 右侧导航链接 - 桌面 */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* 右侧图标 - 可选 */}
          {/* <div className="hidden sm:ml-6 sm:flex sm:items-center">
             搜索图标等
             <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </button>
           </div> */}

          {/* 移动端菜单按钮 - 暂不实现 */}
          {/* <div className="-mr-2 flex items-center sm:hidden">
             <button>...</button>
           </div> */}
        </div>
      </div>
    </nav>
  );
};

// 主页组件
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="w-full bg-slate-700 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-6xl">
            Generic Operational and Optimal Data Lab
          </h1>
          <h2 className="mt-6 text-2xl font-serif leading-8 text-gray-300 sm:text-4xl">
            泛在数据分析与优化实验室
          </h2>
        </div>
      </div>

      {/* 其他内容区域 */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-800">

        {/* News Section - 添加动画 */}
        <motion.section
          id="news"
          className="mb-16 scroll-mt-16"
          initial={{ opacity: 0, y: 20 }} // 初始状态：透明，向下偏移 20px
          whileInView={{ opacity: 1, y: 0 }} // 进入视口时：完全不透明，回到原始位置
          viewport={{ once: true, amount: 0.3 }} // 动画只触发一次，元素可见 30% 时触发
          transition={{ duration: 0.5 }} // 动画持续时间
        >
          <h2 className="text-3xl font-serif font-bold mb-6 border-b pb-2">News</h2>
          <ul className="list-disc ml-6 space-y-3 text-gray-700">
            <li>
              We always look for <strong className="font-semibold text-gray-900">self-motivated under/graduate students</strong> who are ready to take on ambitious challenges to join my research group (with <strong className="font-semibold text-gray-900">financial support</strong>)
            </li>
            <li className="text-red-700"> {/* 调整红色深度 */}
              <span className="font-semibold">News:</span> We have won the First Prize of Provincial Technology Advancement Award, the only ONE in Computer Science in 2024.
            </li>
          </ul>
        </motion.section>

        {/* Students with Interests Section - 添加动画 */}
        <motion.section
          id="interests"
          className="mb-16 scroll-mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.1 }} // 添加一点延迟，使动画错开
        >
          <h2 className="text-3xl font-serif font-bold mb-6 border-b pb-2">Students with Interests</h2>
          <p className="mb-4 leading-relaxed text-gray-700">
            If you are interested in AI and Big Data System, and good at two or more of the following skills, we shall definitely meet and talk. (If you are a undergraduate, one is sufficient)
          </p>
          <ul className="list-disc ml-6 space-y-2 text-gray-700">
            <li>Decent programming skills (C, C++, Python, Rust, etc.)</li>
            <li>Data Management Programming or Kernel Optimization (SQL, CQL, NewSQL, PostgreSQL, Cassandra, Redis, Zookeeper, Docker, etc.)</li>
            <li>Hardware hands-on experience (Verilog/VHDL/Chisel, HLS C/C++/OpenCL, CUDA, OpenCL)</li>
            <li>Hardware simulators and modeling (gem5, gpgpu-sim, Multi2Sim, etc.)</li>
            <li>Modeling and machine learning (Matlab, PyTorch, TF, Keras)</li>
          </ul>
           <p className="mt-4 text-gray-700">
             For more information, please feel free to contact me using the email address on my page.
           </p>
        </motion.section>

        {/* Main Focus Projects Section - 也可以添加类似动画 */}
        <motion.section
            id="main-projects"
            className="mb-16 scroll-mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // 触发阈值可以调整
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <h2 className="text-3xl font-serif font-bold mb-6 border-b pb-2">Main Focus Projects</h2>
            <div className="space-y-8">
                {/* Project 1 */}
                <div>
                    <h3 className="text-xl font-semibold font-serif mb-2 text-gray-900">Open Sourced LLM Model Optimization</h3>
                    <p className="text-gray-700 leading-relaxed">
                        We are interested in optimizing the runtime of any open-sourced language models, Large or Small. We believe the memory wall and energy issue still exists, as well as the scalability, in the modern open sourced AI models. The two approach to make the model better are (1) a deduplicated, and well-coded underlying memory management; (2) a better scheduling to ensure the balancing between the LM nodes. Meanwhile, it is worthwhile to explore the means of building such systems in a small scale, on the edge, as well as protected. This raises our interests on how data driven approach applies to such system optimization design.
                    </p>
                </div>
                {/* Project 2 */}
                <div>
                    <h3 className="text-xl font-semibold font-serif mb-2 text-gray-900">Database Optimization and Correctness</h3>
                    <p className="text-gray-700 leading-relaxed mb-3">
                        We are interested in novel database design on new hardware. We believe the storage as well as the processing are both the bottleneck of the database services. We are calling help from novel processing chips, like GPU and DCU, and new memory architecture, such as phase change memory, to integrate with a database design. As such, we are working towards building up fast databases with a broader view of underlying systems.
                    </p>
                     <p className="text-gray-700 leading-relaxed">
                        Making a correct database is hard. No one can guarantee that a database is correct all the time since it selects different execution paths even for the same query. We would like to further explore how we can guarantee the correctness of a database building, processing, and outputing. Furthermore, we would like to know that what we do is correct as well. For this, we introduce database test with fuzzors. Based on a fuzzy algebra, we can produce mutant samples of testing and verification for novel systems as well as the AI platform.
                    </p>
                </div>
                {/* Project 3 */}
                <div>
                    <h3 className="text-xl font-semibold font-serif mb-2 text-gray-900">An Elastic Consistency System</h3>
                     <p className="text-gray-700 leading-relaxed mb-3">
                         We are trying to extend the original raft into the practical scenarios. That is providing scalable and cheap distributed services within the Raft protocol. The main contribution of this research is to extending the scope of a strong consensus algorithm into a very unreliable platform and make it work statistically in practice.
                     </p>
                    <p className="text-gray-700 leading-relaxed">
                        Here we promote our eRaft. eRaft is a high-performance C++ Raft library. This project is mainly developed by graduates from our GOOD lab. The Raft algorithm shall be accredited to Dr. Diego Ongaro. At present, our project has been included in the official distribution. We hope to explore the possibility of optimizing the existing algorithms on the basis of realizing a stable practical Raft library. If you are interested, please join us. Anyone interested may refer project. {/* Consider adding a link here later */}
                    </p>
                </div>
            </div>
        </motion.section>

        {/* Former Projects Section - 也可以添加类似动画 */}
        <motion.section
            id="former-projects"
            className="mb-16 scroll-mt-16"
             initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <h2 className="text-3xl font-serif font-bold mb-6 border-b pb-2">Former Projects</h2>
             <div className="space-y-8">
                 {/* Project 1 */}
                 <div>
                     <h3 className="text-xl font-semibold font-serif mb-2 text-gray-900">Ocean Database with Tempro-spatial Features</h3>
                     <p className="text-gray-700 leading-relaxed">
                         We are interested in ocean data, which by no means are large, versatile, and unpredictable. For this, we are going to build a database for ocean data, in order to serve applications, such as weather forecast, current prediction, etc. This is uniquely interesting because there are so many things in the sea that we have little knowledge about. As such, we tend to build the knowledge on top of this and forward a underlying database to serve fast queries, SQL and newSQL, to better improve the work.
                     </p>
                 </div>
                 {/* Project 2 */}
                 <div>
                     <h3 className="text-xl font-semibold font-serif mb-2 text-gray-900">System Optimizations with Multiple Objectives</h3>
                     <p className="text-gray-700 leading-relaxed">
                         We are trying to optimize all data services with metrics that are interesting, including but not limited to performance, throughput, energy, carbon, etc. Modeling and representation can help us better understand the world, as well as the data itself is a mimic of our on-going life. For a database system, we would like to shape it in a better way.
                     </p>
                 </div>
            </div>
        </motion.section>

        {/* Teaching Section - 也可以添加类似动画 */}
        <motion.section
            id="teaching"
            className="mb-16 scroll-mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <h2 className="text-3xl font-serif font-bold mb-6 border-b pb-2">Teaching</h2>
             <ul className="list-disc ml-6 space-y-2 text-gray-700">
                 <li>Introduction to Artificial Intelligence (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
                 <li>Discrete Mathematics (Fall 2024, Fall 2023, Fall 2022, Spring 2021, 2020)</li>
                 <li>Operating Systems (Fall 2019)</li>
                 <li>Cloud Computing (Spring 2019)</li>
                 <li>Introduction to Cloud Computing (Fall 2018)</li>
                 <li>Network Protocol Analysis (Fall 2018)</li>
                 <li>Aritificial Intelligent Computing Systems (Fall 2023, Fall 2022, Spring 2021, Spring 2019, Summer 2018)</li>
                 <li>Linux Programming (Spring 2018)</li>
                 <li>Data Structure (Fall 2017)</li>
                 <li>Graduate Course Introduction to Combinatorics (Fall 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017)</li>
             </ul>
        </motion.section>

        {/* Placeholder sections for Navbar links that don't have content yet */}
        <section id="professor" className="scroll-mt-16"></section>
        <section id="members" className="scroll-mt-16"></section>
        <section id="contact" className="scroll-mt-16"></section>
        <section id="gallery" className="scroll-mt-16"></section>
        <section id="blog" className="scroll-mt-16"></section>


        {/* Footer - 待添加 */}
        {/* <footer className="mt-16 border-t pt-8 text-center text-gray-500 text-sm">
             @COPYRIGHT NCU GOOD LAB All rights reserved.
        </footer> */}

      </div>

    </main>
  );
}
