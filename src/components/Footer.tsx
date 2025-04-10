import React from 'react';

interface FooterProps {
  visitCount: number | null;
  getOrdinalSuffix: (n: number) => string;
}

const Footer: React.FC<FooterProps> = ({ visitCount, getOrdinalSuffix }) => {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-8 pb-8 text-center text-gray-500 text-sm w-full max-w-5xl mx-auto">
      {/* 页脚内容也限制宽度可能更好看 */}
      <p>@COPYRIGHT NCU GOOD LAB All rights reserved.</p>
      <p className="mt-2">
        {visitCount === null
          ? 'Loading visitor count...'
          : visitCount === 0
          ? 'Welcome!'
          : `You are the ${visitCount}${getOrdinalSuffix(visitCount)} visitor`
        }
      </p>
    </footer>
  );
};

export default Footer; 