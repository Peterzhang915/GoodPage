"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCheatCode } from "@/hooks/useCheatCode";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Define Konami sequence and regex for allowed keys
const konamiSequence = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
const konamiAllowedKeys = /^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|b|a)$/;

// Define Dino sequence
const dinoSequence = "6031769";
// Default allowedKeysRegex for dinoSequence (digits only) is fine

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  // Developer page trigger using useCheatCode
  useCheatCode(konamiSequence, () => {
    console.log("[Layout] Konami cheat code triggered. Attempting navigation to /developer...");
    router.push("/developer");
  }, konamiAllowedKeys);

  // Dino page trigger using useCheatCode
  useCheatCode(dinoSequence, () => {
    console.log("[Layout] Dino cheat code triggered. Attempting navigation to /dino...");
    router.push("/dino");
  }); // Uses default regex (digits only)

  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
