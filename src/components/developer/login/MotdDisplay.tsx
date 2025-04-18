"use client";

import React from "react";

// Define MOTD line structure
interface MotdLine {
  text: string;
  requiresConfirmation?: boolean;
}

interface MotdDisplayProps {
  lines: MotdLine[]; // Array of MOTD lines
  currentIndex: number; // Index of the last line fully processed or currently processing
  processingIndex: number; // Index of the line currently showing the spinner (-1 if none)
  spinnerChar: string; // Current character for the spinner animation
  className?: string; // Optional additional class names
}

const MotdDisplay: React.FC<MotdDisplayProps> = ({
  lines,
  currentIndex,
  processingIndex,
  spinnerChar,
  className,
}) => {
  return (
    <div className={`whitespace-pre-wrap text-sm leading-relaxed ${className}`}>
      {lines
        .slice(0, currentIndex + (processingIndex === currentIndex ? 0 : 1))
        .map((line, index) => (
          <div key={index}>
            {line.text}
            {/* Show spinner if this line is being processed */}
            {processingIndex === index && (
              <span className="ml-2 text-yellow-400">
                {spinnerChar} Processing...
              </span>
            )}
            {/* Show [ OK ] if line is processed, required confirmation, and we are past it */}
            {processingIndex !== index &&
              line.requiresConfirmation &&
              currentIndex > index && (
                <span className="ml-2 text-green-400">[ OK ]</span>
              )}
          </div>
        ))}
    </div>
  );
};

export default MotdDisplay;
