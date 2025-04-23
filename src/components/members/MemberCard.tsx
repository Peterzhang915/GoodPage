"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import JSConfetti from "js-confetti";
import { motion } from "framer-motion";
import { themeColors } from "@/styles/theme";
import type { MemberForCard } from "@/lib/types";
import { MemberStatus } from "@prisma/client"; // 直接从 @prisma/client 导入枚举
import { MemberProfileImage } from "@/components/members/MemberProfileImage"; // 确保路径正确
import {
  GraduationCap,
  UserCircle,
  MapPin,
  BookOpen,
  Mail,
} from "lucide-react";

// 默认头像和 Emojis
const placeholderAvatar = "/avatars/placeholder.png";
const defaultEmojis = ["✨", "💖", "🚀"];

// 定义组件接收的 Props 类型
interface MemberCardProps {
  member: MemberForCard;
  isEmojiEnabled: boolean;
}

// JSConfetti 配置类型的扩展
interface ExtendedConfettiConfig {
  emojis?: string[];
  emojiSize?: number;
  confettiNumber?: number;
}

// 辅助函数：将 MemberStatus 枚举映射为英文显示名称 (保持不变)
function getStatusDisplayName(status: MemberStatus): string {
  switch (status) {
    case MemberStatus.PROFESSOR:
      return "Professor";
    case MemberStatus.POSTDOC:
      return "Postdoc";
    case MemberStatus.PHD_STUDENT:
      return "PhD Student";
    case MemberStatus.MASTER_STUDENT:
      return "Master Student";
    case MemberStatus.UNDERGRADUATE:
      return "Undergraduate";
    case MemberStatus.VISITING_SCHOLAR:
      return "Visiting Scholar";
    case MemberStatus.RESEARCH_STAFF:
      return "Research Staff";
    case MemberStatus.ALUMNI:
      return "Alumni";
    case MemberStatus.OTHER:
      return "Member";
    default:
      return status;
  }
}

export function MemberCard({ member, isEmojiEnabled }: MemberCardProps) {
  // Refs
  const confettiRef = useRef<JSConfetti | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Effect Hook for JSConfetti (保持不变)
  useEffect(() => {
    let jsConfetti: JSConfetti | null = null;
    let canvasElement: HTMLCanvasElement | null = null;
    if (isEmojiEnabled && typeof window !== "undefined") {
      if (!confettiRef.current) {
        canvasElement = document.createElement("canvas");
        canvasElement.style.position = "fixed";
        canvasElement.style.top = "0";
        canvasElement.style.left = "0";
        canvasElement.style.width = "100%";
        canvasElement.style.height = "100%";
        canvasElement.style.pointerEvents = "none";
        canvasElement.style.zIndex = "9999";
        document.body.appendChild(canvasElement);
        canvasRef.current = canvasElement;
        jsConfetti = new JSConfetti({ canvas: canvasElement });
        confettiRef.current = jsConfetti;
      }
    }
    return () => {
      try {
        confettiRef.current?.clearCanvas();
        if (canvasRef.current && canvasRef.current.parentNode) {
          canvasRef.current.remove();
        }
      } catch (e) {
        console.error("Error during confetti cleanup:", e);
      } finally {
        confettiRef.current = null;
        canvasRef.current = null;
      }
    };
  }, [isEmojiEnabled, member.id]);

  // 鼠标移入卡片时的处理函数 (仅 Confetti)
  const handleMouseEnterConfetti = () => {
    if (!isEmojiEnabled || !confettiRef.current || !cardRef.current) return;
    const emojis =
      member.favorite_emojis
        ?.split(",")
        .map((e) => e.trim())
        .filter(Boolean) ?? defaultEmojis;
    const finalEmojis = emojis.length > 0 ? emojis : defaultEmojis;
    const config: ExtendedConfettiConfig = {
      emojis: finalEmojis,
      emojiSize: 50,
      confettiNumber: 10,
    };
    confettiRef.current.addConfetti(config as any);
  };

  return (
    <Link href={`/members/${member.id}`} className="block group h-full">
      <motion.div
        ref={cardRef}
        onMouseEnter={handleMouseEnterConfetti}
        className={`relative ${themeColors.backgroundWhite ?? "bg-white"} border ${themeColors.borderLight ?? "border-gray-200"} rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col items-center text-center h-full overflow-hidden`}
        whileHover={{ y: -5 }} // 保留卡片上浮效果
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* 头像容器 (保持不变) */}
        <div
          className={`w-20 h-20 rounded-full overflow-hidden mb-4 border-2 ${themeColors.borderLight ?? "border-gray-300"} group-hover:border-${themeColors.primary ?? "blue-600"} group-hover:scale-105 transition-all duration-300 flex-shrink-0 z-10 shadow-sm`}
        >
          <Image
            src={member.avatar_url || placeholderAvatar}
            alt={`${member.name_en} avatar`}
            width={80}
            height={80}
            className="object-cover object-[center_25%] w-full h-full"
            priority={member.status === MemberStatus.PROFESSOR}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderAvatar;
              target.onerror = null;
            }}
          />
        </div>

        {/* 文本信息容器 */}
        <div className="flex flex-col items-center justify-center flex-grow z-10 w-full px-1">
          {/* 英文名 */}
          <h3
            className={`text-lg font-semibold ${themeColors.textColorPrimary ?? ""} group-hover:${themeColors.primary ?? "text-blue-600"} transition-colors duration-300 mb-1 truncate`}
            title={member.name_en}
          >
            {member.name_en}
          </h3>

          {/* 年份 + 状态信息 */}
          {/* 【修改】直接放置状态信息，移除外层 div */}
          {/* Use span instead of p for a tighter inline element */}
          <span
            className={`mt-2 text-xs sm:text-sm font-medium ${themeColors.accentColor ?? "text-purple-700"} bg-purple-50 dark:bg-purple-900/20 px-2 sm:px-3 py-2 sm:py-1 rounded-full inline-block w-fit`}
          >
            {/* 【修改】仅非教授且年份存在时显示年份 */}
            {member.status !== MemberStatus.PROFESSOR && member.enrollment_year
              ? `${member.enrollment_year} `
              : ""}
            {/* 始终显示状态名称 */}
            {getStatusDisplayName(member.status)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
