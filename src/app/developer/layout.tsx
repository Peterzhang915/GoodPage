import React from "react"; // Add React import for JSX
import { Metadata } from "next";
import { themeColors } from "@/styles/theme";
import { Inter } from "next/font/google"; // Or use a preferred mono font like Fira Code, JetBrains Mono etc.

// If using Inter, define subsets if needed
const inter = Inter({ subsets: ["latin"] });

// Metadata for the developer section (can be defined here instead of page.tsx)
export const metadata: Metadata = {
  title: "Developer Console",
  description: "Restricted area for website management.",
  // Prevent indexing of developer pages
  robots: { index: false, follow: false },
};

interface DeveloperLayoutProps {
  children: React.ReactNode;
}

export default function DeveloperLayout({ children }: DeveloperLayoutProps) {
  return (
    // Apply developer-specific styles
    // Use flex-col and min-h-screen to ensure it fills height
    // Use direct Tailwind classes as placeholders for theme colors
    <div
      className={`${inter.className} font-mono min-h-screen flex flex-col bg-gray-900 text-gray-300`}
    >
      {/* This layout intentionally does not include Navbar or Footer */}
      {/* Remove container, mx-auto, and py-* to allow content to fill more space */}
      {/* Add flex-grow to main to make it take available space */}
      <main className="flex-grow w-full px-4 sm:px-6 md:px-8">{children}</main>
    </div>
  );
}
