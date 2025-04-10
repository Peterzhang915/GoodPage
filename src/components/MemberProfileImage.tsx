"use client"; // 标记为客户端组件

import Image from 'next/image';
import { useState } from 'react'; // 用于处理图片加载状态

// 简单的占位头像 URL
const placeholderAvatar = '/avatars/placeholder.png';

interface MemberProfileImageProps {
  src: string | null | undefined; // 原始头像 URL
  alt: string;
  width: number;
  height: number;
}

export function MemberProfileImage({ src, alt, width, height }: MemberProfileImageProps) {
  const [imgSrc, setImgSrc] = useState(src || placeholderAvatar);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className="object-cover w-full h-full"
      // 在客户端组件中使用 onError 是允许的
      onError={() => {
        // 如果原始 src 加载失败，则强制使用占位符
        setImgSrc(placeholderAvatar);
      }}
    />
  );
} 