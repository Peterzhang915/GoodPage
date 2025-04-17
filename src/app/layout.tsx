"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { DeveloperModeProvider } from "@/contexts/DeveloperModeContext";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

// Define the Konami sequence string
const konamiSequence = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
// Define the regex for allowed keys (Arrows and B, A - case insensitive)
const konamiAllowedKeys = /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|b|a)$/i;
// Define ONLY the dino sequence here
const dinoSequence = "6031769";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we are on the dino page
  const isDinoPage = pathname === '/dino';
  const isDeveloperPath = pathname.startsWith("/developer");

  // Cheat code triggers
  useCheatCode(konamiSequence, () => {
    console.log("[Layout] Konami cheat code triggered. Navigating to /developer...");
    router.push("/developer");
  }, konamiAllowedKeys);

  useCheatCode(dinoSequence, () => {
    console.log("[Layout] Dino cheat code triggered. Navigating to /dino...");
    router.push("/dino");
  }); // Uses default regex (digits only)

  // Use useEffect to manage ONLY the dino-active body class
  useEffect(() => {
    const bodyClassList = document.body.classList;
    if (isDinoPage) {
      bodyClassList.add("dino-active");
    } else {
      bodyClassList.remove("dino-active");
    }
    // Cleanup on unmount or path change
    return () => {
      bodyClassList.remove("dino-active");
    };
  }, [isDinoPage]); // Depend only on isDinoPage

  return (
    <html lang="en">
      {/* Keep existing body classes, useEffect handles dino-active */}
      {/* The bg color logic based on isDeveloperPath should remain */}
      <body className={`${inter.className} flex flex-col min-h-screen ${isDeveloperPath ? "bg-gray-900" : "bg-gray-50"}`}>
        {/* Keep existing Provider */}
        <DeveloperModeProvider>
          {/* Replace AnimatedNavbar with Navbar */}
          {!isDinoPage && <Navbar />}
          {/* Adjust main class based ONLY on dino page */}
          {/* Keep existing pt-16 sm:pt-20 EXCEPT when on dino page */}
          <main className={`flex-grow ${isDinoPage ? 'dino-main-grow' : 'pt-16 sm:pt-20'}`}> 
            {children}
          </main>
          {/* Conditional Footer - Hide if on dino OR developer path */}
          {!isDinoPage && !isDeveloperPath && <Footer />} 
        </DeveloperModeProvider>
      </body>
    </html>
  );
}
