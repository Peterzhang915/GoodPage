"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useRouter, usePathname } from "next/navigation";
import React from "react";
import { DeveloperModeProvider, useDeveloperMode } from "@/contexts/DeveloperModeContext";
import { motion } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

// Define the Konami sequence string
const konamiSequence = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
// Define the regex for allowed keys (Arrows and B, A - case insensitive)
const konamiAllowedKeys = /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|b|a)$/i;

// Component to handle Navbar animation logic
const AnimatedNavbar: React.FC = () => {
  const pathname = usePathname();
  const { isDeveloperToolsUIVisible } = useDeveloperMode(); 
  const isDeveloperPath = pathname.startsWith("/developer");

  const variants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: "0%", opacity: 1 },
  };

  const targetVariant = 
    isDeveloperPath && !isDeveloperToolsUIVisible ? "hidden" : "visible";

  // Store the initial variant determined on first render
  const initialVariant = React.useRef(targetVariant);

  return (
    <motion.div
      // Set initial based on the very first calculation
      initial={initialVariant.current} 
      animate={targetVariant}
      variants={variants}
      // Increase duration
      transition={{ type: "tween", duration: 0.5 }} 
      className="fixed top-0 left-0 right-0 z-50"
    >
      <Navbar />
    </motion.div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname(); // Keep pathname for footer logic

  // Use the correct hook with the Konami sequence and allowed keys regex
  useCheatCode(konamiSequence, () => {
    console.log("[Layout] Konami code triggered. Attempting navigation to /developer...");
    router.push("/developer");
  }, konamiAllowedKeys); // Pass the regex here

  const isDeveloperPath = pathname.startsWith("/developer"); // Keep for footer logic

  return (
    <html lang="en">
      {/* Provider wraps the entire content INSIDE html but OUTSIDE body potentially, or just around body content */}
      <DeveloperModeProvider>
        {/* Apply bg color conditionally to body */}
        <body className={`${inter.className} flex flex-col min-h-screen ${isDeveloperPath ? "bg-gray-900" : "bg-gray-50"}`}> {/* Example: Dark bg for dev mode */}
          {/* Always render the animated Navbar wrapper */} 
          <AnimatedNavbar />
          {/* Add padding to main content to prevent overlap */}
          {/* pt needs to roughly match navbar height */} 
          <main className="flex-grow pt-16 sm:pt-20"> 
            {children}
          </main>
          {/* Conditional Footer */} 
          {!isDeveloperPath && <Footer />} 
        </body>
      </DeveloperModeProvider>
    </html>
  );
}
