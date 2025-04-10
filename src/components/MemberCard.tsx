"use client"; // 标记为客户端组件

import Link from 'next/link';
import Image from 'next/image';
import { Member } from '../lib/db';
import JSConfetti from 'js-confetti';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // 引入 framer-motion

const placeholderAvatar = '/avatars/placeholder.png';
const defaultEmojis = ['✨', '💖', '🚀'];

interface MemberCardProps {
  member: Member & { displayStatus: string };
  isEmojiEnabled: boolean;
}

interface ExtendedConfettiConfig {
  emojis?: string[];
  emojiSize?: number;
  confettiNumber?: number;
  initialPosition?: { x: number; y: number };
}

export function MemberCard({ member, isEmojiEnabled }: MemberCardProps) {
  const confettiRef = useRef<JSConfetti | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isEmojiEnabled && typeof window !== 'undefined') {
      if (!confettiRef.current) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        canvasRef.current = canvas;
        confettiRef.current = new JSConfetti({ canvas });
      }
    } else {
      confettiRef.current?.clearCanvas();
      confettiRef.current = null;
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    }

    return () => {
      confettiRef.current?.clearCanvas();
      if (canvasRef.current) {
        canvasRef.current.remove();
      }
      confettiRef.current = null;
      canvasRef.current = null;
    };
  }, [isEmojiEnabled]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEmojiEnabled || !confettiRef.current || !cardRef.current) return;

    const emojis = member.favorite_emojis ? 
      member.favorite_emojis.split(',').map(emoji => emoji.trim()).filter(Boolean) : 
      defaultEmojis;
      
    if (emojis.length === 0) return;

    const config: ExtendedConfettiConfig = {
      emojis,
      emojiSize: 40,
      confettiNumber: 15,
      initialPosition: { x: event.clientX, y: event.clientY }
    };

    confettiRef.current.addConfetti(config as any);
  };

  return (
    <Link href={`/members/${member.id}`} className="block group">
      {/* 恢复美化后的样式 */}
      <motion.div
        ref={cardRef}
        onMouseEnter={isEmojiEnabled ? handleMouseEnter : undefined}
        className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 flex flex-col items-center text-center h-full overflow-hidden group"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-gray-200 group-hover:border-indigo-500 group-hover:scale-105 transition-all duration-300 flex-shrink-0 z-10">
          <Image
            src={member.avatar_url || placeholderAvatar}
            alt={`${member.name_zh} 头像`}
            width={80}
            height={80}
            className="object-cover w-full h-full"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderAvatar;
              target.onerror = null;
            }}
          />
        </div>
        <div className="flex flex-col justify-center flex-grow z-10">
          <div>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 mb-0.5">{member.name_zh}</h3>
            {member.name_en && <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">{member.name_en}</p>}
          </div>
          <p className="text-xs font-medium text-indigo-500 mt-2 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">{member.displayStatus}</p>
        </div>
      </motion.div>
    </Link>
  );
} 