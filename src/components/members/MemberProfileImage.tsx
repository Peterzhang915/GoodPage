"use client"; // 标记为客户端组件

import React from "react";
import Image from "next/image";
import { useState } from "react"; // 用于处理图片加载状态

// 简单的占位头像 URL
const placeholderAvatar = "/avatars/placeholder.png";

/**
 * Props for the MemberProfileImage component.
 */
interface MemberProfileImageProps {
  /** The source URL of the image. */
  src: string;
  /** The alternative text for the image. */
  alt: string;
  /** The desired width of the image. */
  width: number;
  /** The desired height of the image. */
  height: number;
  /** Optional additional CSS classes. */
  className?: string;
}

/**
 * A reusable component for displaying member profile images with specific styling.
 */
export const MemberProfileImage: React.FC<MemberProfileImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
}) => {
  const [imgSrc, setImgSrc] = useState(src || placeholderAvatar);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover w-full h-full ${className}`}
      priority // Optionally prioritize loading for key profile images
      // 在客户端组件中使用 onError 是允许的
      onError={() => {
        // 如果原始 src 加载失败，则强制使用占位符
        setImgSrc(placeholderAvatar);
      }}
    />
  );
};
