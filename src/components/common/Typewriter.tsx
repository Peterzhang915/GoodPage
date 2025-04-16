// src/components/common/Typewriter.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

interface TypewriterProps {
  text: string;
  speed?: number; // Milliseconds per character
  loop?: boolean;
  delay?: number; // Initial delay in milliseconds
  cursor?: boolean;
  className?: string;
  onComplete?: () => void; // Callback when typing completes (or loops)
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  loop = false,
  delay = 0,
  cursor = true,
  className = "",
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // 当 text prop 改变时重置状态
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      // 组件卸载或 text/speed 改变时清除 timeout
      return () => clearTimeout(timeoutId);
    } else {
      // 打字完成
      if (onComplete) {
        onComplete();
      }
      // 之前注释掉的逻辑：完成后停止光标闪烁
    }
  }, [currentIndex, text, speed, onComplete]);

  // 光标闪烁效果
  useEffect(() => {
    if (currentIndex < text.length) {
      // 如果仍在打字，设置闪烁间隔
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500); // 闪烁速度
      return () => clearInterval(cursorInterval);
    } else {
      // 如果打字完成，立即隐藏光标
      setShowCursor(false);
    }
  }, [currentIndex, text.length]); // 打字完成或开始时重新运行

  return (
    <span ref={containerRef} className={className}>
      {displayText}
      {/* 光标现在由 useEffect 精确控制显示/隐藏 */}
      {showCursor && (
        <span className="inline-block w-2 h-4 bg-current animate-blink"></span>
      )}
    </span>
  );
};

export default Typewriter;
