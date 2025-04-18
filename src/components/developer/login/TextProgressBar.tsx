"use client";

import React, { useState, useEffect } from "react";

interface TextProgressBarProps {
  total?: number; // Total width of the bar
  interval?: number; // Update interval in ms
}

const TextProgressBar: React.FC<TextProgressBarProps> = ({
  total = 20, // Default width
  interval = 100, // Default update speed
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      // Add type annotation for prev
      setProgress((prev: number) => (prev + 1) % (total + 1));
    }, interval);

    return () => clearInterval(timer);
  }, [total, interval]);

  const filled = "#".repeat(progress);
  const emptyCount = Math.max(0, total - progress);
  const empty = " ".repeat(emptyCount);

  return (
    // Use template literal for clarity
    <span className="font-mono">
      {`[${filled}${empty}]`}
    </span>
  );
};

export default TextProgressBar; 