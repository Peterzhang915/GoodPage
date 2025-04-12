// src/components/developer/ToolCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

// Note: themeColors would need to be imported if used directly,
// but here we use hardcoded Tailwind classes for dark theme.

interface ToolCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon?: React.ReactNode;
  onButtonClick: () => void;
  disabled?: boolean;
  externalLink?: string;
  delay?: number;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  onButtonClick,
  disabled = false,
  externalLink,
  delay = 0
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between shadow-lg"
  >
    <div>
      <h3 className={`text-xl font-semibold mb-3 text-green-400`}>{title}</h3>
      <p className={`text-sm text-gray-400 mb-5`}>{description}</p>
    </div>
    {externalLink ? (
      <a
        href={externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`}
      >
        {icon}
        {buttonText}
        <ExternalLink size={16} className="ml-2"/>
      </a>
    ) : (
      <button
        onClick={onButtonClick}
        disabled={disabled}
        className={`mt-auto inline-flex items-center justify-center px-4 py-2 border ${disabled ? 'border-gray-600' : 'border-transparent'} rounded-md shadow-sm text-sm font-medium ${disabled ? 'text-gray-500 bg-gray-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors'}`}
      >
        {icon}
        {buttonText}
      </button>
    )}
  </motion.div>
);

export default ToolCard;
