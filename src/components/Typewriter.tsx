// src/components/Typewriter.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number; // Milliseconds per character
  className?: string;
  onComplete?: () => void; // Optional callback when typing finishes
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50, // Default speed: 50ms per char
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      // Cleanup timeout on unmount or if text/speed changes
      return () => clearTimeout(timeoutId);
    } else {
      // Typing finished
      if (onComplete) {
        onComplete();
      }
      // Optional: Stop cursor blinking after completion
      // setShowCursor(false); 
    }
  }, [currentIndex, text, speed, onComplete]);

  // Cursor blinking effect
  useEffect(() => {
    if (currentIndex < text.length) {
      // If still typing, set up the blinking interval
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500); // Blink speed
      return () => clearInterval(cursorInterval);
    } else {
      // If typing is finished, ensure cursor is hidden immediately
      setShowCursor(false);
    }
  }, [currentIndex, text.length]); // Re-run when typing finishes or starts


  return (
    <span ref={containerRef} className={className}>
      {displayText}
      {/* 光标现在由 useEffect 精确控制显示/隐藏 */}
      {showCursor && <span className="inline-block w-2 h-4 bg-current animate-blink"></span>}
    </span>
  );
};

export default Typewriter;