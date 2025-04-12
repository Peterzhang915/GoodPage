// 移除文件顶部的 "use client"; 指令

import React from 'react';
// Removed Image import as it's unused for now
// import Image from "next/image";
// 引入 framer-motion
// import { motion } from 'framer-motion';

// 移除 Navbar 导入
// import Navbar from '@/components/Navbar';
// 导入拆分后的组件
import HeroSection from '@/components/HeroSection';
import ContentSection from '@/components/ContentSection';
// 移除 PhotoGallery 导入
// import PhotoGallery from '@/components/PhotoGallery';

// First, add back the import statement at the top
import { themeColors } from '@/styles/theme';
  interface NewsApiResponse {
    title: string;
    news: string[];
  }

// --- Removed unused imports ---
// import fs from 'fs';
// import path from 'path';


// 主页组件现在是 async 因为要 await 数据读取
export default async function Home() {
          // Fetch news data from the API on the server
          let newsData: NewsApiResponse | null = null;
          try {
              // Using relative path for server-side fetch to own API route
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/news`, { cache: 'no-store' }); // Fetch fresh data
              if (res.ok) {
                  const data = await res.json();
                  // Basic validation
                  if (data && typeof data.title === 'string' && Array.isArray(data.news)) {
                       newsData = data as NewsApiResponse;
                  } else {
                       console.error('Invalid news data format received from API:', data);
                  }
              } else {
                   console.error(`Failed to fetch news: ${res.status} ${res.statusText}`);
                   // Log response body if available
                   // const errorBody = await res.text();
                   // console.error('Error response body:', errorBody);
              }
          } catch (error) {
              console.error('Error fetching news data:', error);
          }

          // <<< Re-insert the definition INSIDE the function scope >>>
          const recruitmentText = "We always look for self-motivated under/graduate students who are ready to take on ambitious challenges to join my research group (with financial support).";

  return (
    // 不再需要 flex-col，因为 layout 会处理布局
    <main className="items-center justify-start"> {/* 移除 flex min-h-screen flex-col */}
      {/* <Navbar /> 移除 Navbar 渲染 */}
      <HeroSection />

      {/* 主要内容区域容器 */}
      <div className={`w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${themeColors.textColorPrimary}`}>

        {/* 使用 ContentSection 渲染每个板块 */}
        <ContentSection id="news" title="News" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }}> {/* 可以覆盖默认动画参数 */}
          {/* Always display recruitment text */}
          <p className={`mb-4 leading-relaxed ${themeColors.textColorTertiary}`}>
            {recruitmentText}
          </p>

          {/* Conditionally display fetched news */}
          {newsData && newsData.news.length > 0 ? (
            <div className="mt-6 border-t border-gray-700 pt-4"> {/* Use darker border */}
              {/* Display news list */}
              <ul className={`list-disc ml-6 space-y-2 ${themeColors.textColorTertiary}`}>
                {newsData.news.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
              // Render nothing if news is empty or fetch failed
              null
          )}
        </ContentSection>

        <ContentSection id="interests" title="Students with Interests">
          <p className={`mb-4 leading-relaxed ${themeColors.textColorTertiary}`}>
            If you are interested in AI and Big Data System, and good at two or more of the following skills, we shall definitely meet and talk. (If you are a undergraduate, one is sufficient)
          </p>
          <ul className={`list-disc ml-6 space-y-2 ${themeColors.textColorTertiary}`}>
            <li>Decent programming skills (C, C++, Python, Rust, etc.)</li>
            <li>Data Management Programming or Kernel Optimization (SQL, CQL, NewSQL, PostgreSQL, Cassandra, Redis, Zookeeper, Docker, etc.)</li>
            <li>Hardware hands-on experience (Verilog/VHDL/Chisel, HLS C/C++/OpenCL, CUDA, OpenCL)</li>
            <li>Hardware simulators and modeling (gem5, gpgpu-sim, Multi2Sim, etc.)</li>
            <li>Modeling and machine learning (Matlab, PyTorch, TF, Keras)</li>
          </ul>
          <p className={`mt-4 ${themeColors.textColorTertiary}`}>
            For more information, please feel free to contact me using the email address on my page.
          </p>
        </ContentSection>

        <ContentSection id="main-projects" title="Main Focus Projects">
          <div className="space-y-8">
            <div>
              <h3 className={`text-xl font-semibold font-serif mb-2 ${themeColors.textColorPrimary}`}>Open Sourced LLM Model Optimization</h3>
              <p className={`leading-relaxed ${themeColors.textColorTertiary}`}>
                We are interested in optimizing the runtime of any open-sourced language models, Large or Small. We believe the memory wall and energy issue still exists, as well as the scalability, in the modern open sourced AI models. The two approach to make the model better are (1) a deduplicated, and well-coded underlying memory management; (2) a better scheduling to ensure the balancing between the LM nodes. Meanwhile, it is worthwhile to explore the means of building such systems in a small scale, on the edge, as well as protected. This raises our interests on how data driven approach applies to such system optimization design.
              </p>
            </div>
             <div>
              <h3 className={`text-xl font-semibold font-serif mb-2 ${themeColors.textColorPrimary}`}>Database Optimization and Correctness</h3>
              <p className={`leading-relaxed mb-3 ${themeColors.textColorTertiary}`}>
                We are interested in novel database design on new hardware. We believe the storage as well as the processing are both the bottleneck of the database services. We are calling help from novel processing chips, like GPU and DCU, and new memory architecture, such as phase change memory, to integrate with a database design. As such, we are working towards building up fast databases with a broader view of underlying systems.
              </p>
              <p className={`leading-relaxed ${themeColors.textColorTertiary}`}>
                Making a correct database is hard. No one can guarantee that a database is correct all the time since it selects different execution paths even for the same query. We would like to further explore how we can guarantee the correctness of a database building, processing, and outputing. Furthermore, we would like to know that what we do is correct as well. For this, we introduce database test with fuzzors. Based on a fuzzy algebra, we can produce mutant samples of testing and verification for novel systems as well as the AI platform.
              </p>
            </div>
            <div>
              <h3 className={`text-xl font-semibold font-serif mb-2 ${themeColors.textColorPrimary}`}>An Elastic Consistency System</h3>
              <p className={`leading-relaxed mb-3 ${themeColors.textColorTertiary}`}>
                We are trying to extend the original raft into the practical scenarios. That is providing scalable and cheap distributed services within the Raft protocol. The main contribution of this research is to extending the scope of a strong consensus algorithm into a very unreliable platform and make it work statistically in practice.
              </p>
              <p className={`leading-relaxed ${themeColors.textColorTertiary}`}>
                Here we promote our eRaft. eRaft is a high-performance C++ Raft library. This project is mainly developed by graduates from our GOOD lab. The Raft algorithm shall be accredited to Dr. Diego Ongaro. At present, our project has been included in the official distribution. We hope to explore the possibility of optimizing the existing algorithms on the basis of realizing a stable practical Raft library. If you are interested, please join us. Anyone interested may refer project. {/* Consider adding a link here later */}
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="former-projects" title="Former Projects">
          <div className="space-y-8">
            <div>
              <h3 className={`text-xl font-semibold font-serif mb-2 ${themeColors.textColorPrimary}`}>Ocean Database with Tempro-spatial Features</h3>
              <p className={`leading-relaxed ${themeColors.textColorTertiary}`}>
                We are interested in ocean data, which by no means are large, versatile, and unpredictable. For this, we are going to build a database for ocean data, in order to serve applications, such as weather forecast, current prediction, etc. This is uniquely interesting because there are so many things in the sea that we have little knowledge about. As such, we tend to build the knowledge on top of this and forward a underlying database to serve fast queries, SQL and newSQL, to better improve the work.
              </p>
            </div>
            <div>
              <h3 className={`text-xl font-semibold font-serif mb-2 ${themeColors.textColorPrimary}`}>System Optimizations with Multiple Objectives</h3>
              <p className={`leading-relaxed ${themeColors.textColorTertiary}`}>
                We are trying to optimize all data services with metrics that are interesting, including but not limited to performance, throughput, energy, carbon, etc. Modeling and representation can help us better understand the world, as well as the data itself is a mimic of our on-going life. For a database system, we would like to shape it in a better way.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection id="teaching" title="Teaching">
          <ul className={`list-disc ml-6 space-y-2 ${themeColors.textColorTertiary}`}>
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
        </ContentSection>

        {/* Placeholder sections */}
        <section id="professor" className="scroll-mt-16"></section>
        <section id="members" className="scroll-mt-16"></section>
        <section id="contact" className="scroll-mt-16"></section>
        {/* <ContentSection id="gallery" ... /> 及其内部的 PhotoGallery 已移除 */}
        <section id="blog" className="scroll-mt-16"></section>

      </div> {/* End of main content div */}

    </main>
  );
}
