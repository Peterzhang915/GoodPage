// src/components/layout/Footer.tsx
"use client"; // 将 Footer 标记为客户端组件

import React, { useState, useEffect } from "react";
import { themeColors } from "@/styles/theme";
import Link from "next/link";
import { Github, Linkedin, Twitter, Mail } from "lucide-react"; // Import icons

// Define types for social links (optional but good practice)
interface SocialLink {
  name: string;
  url: string;
  icon: React.ElementType; // Use React.ElementType for component types
}

// Get current year dynamically
const currentYear = new Date().getFullYear();

// 将 getOrdinalSuffix 移到 Footer 内部
function getOrdinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) {
    return "th";
  }
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

// 不再需要 Props 接口
// interface FooterProps {
//   visitCount: number | null;
//   getOrdinalSuffix: (n: number) => string;
// }

// 组件现在自己管理状态和获取数据
const Footer: React.FC = () => {
  // 添加状态来存储两个计数值
  const [totalVisits, setTotalVisits] = useState<number | null>(null);
  const [developerVisits, setDeveloperVisits] = useState<number | null>(null);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Effect to check for developer mode class on mount and update
  useEffect(() => {
    // Initial check
    setIsDeveloperMode(
      document.body.classList.contains("developer-mode-active")
    );

    // Optional: Use MutationObserver to detect class changes if needed
    // This is more robust if the class might be added/removed while footer is mounted
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          setIsDeveloperMode(
            document.body.classList.contains("developer-mode-active")
          );
        }
      }
    });
    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect(); // Cleanup observer
  }, []);

  useEffect(() => {
    const incrementAndFetch = async () => {
      try {
        // 先递增
        await fetch("/api/visit", { method: "POST" });
        // 再获取
        const response = await fetch("/api/visit");
        if (!response.ok)
          throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        setTotalVisits(data.total ?? 0);
        setDeveloperVisits(data.developer ?? 0);
      } catch (error) {
        console.error("Failed to fetch visit counts:", error);
        setTotalVisits(0);
        setDeveloperVisits(0);
      }
    };
    incrementAndFetch();
  }, []);

  // 根据 isDeveloperMode 渲染不同内容
  const renderContent = () => {
    if (isDeveloperMode) {
      if (developerVisits === null || totalVisits === null) {
        return "Loading dev stats...";
      }
      return `Developer Access: ${developerVisits} | Total Visits: ${totalVisits}`;
    } else {
      if (totalVisits === null) {
        return "Loading visitor count...";
      }
      if (totalVisits === 0) {
        return "Welcome!";
      }
      return `You are the ${totalVisits}${getOrdinalSuffix(totalVisits)} visitor`;
    }
  };

  return (
    <footer
      className={` ${themeColors.backgroundLight} pt-8 pb-8 text-center ${themeColors.footerTextColor} text-sm w-full`}
    >
      <p>@COPYRIGHT NCU GOOD LAB All rights reserved.</p>
      <p className="mt-2">{renderContent()}</p>
    </footer>
  );
};

export default Footer;
