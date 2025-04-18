"use client";

import React from "react";
import { themeColors } from "@/styles/theme";

// Define ASCII Art constants within this component or import from a shared config
const SYSTEM_LOCKED_ASCII = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗    ██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║    ██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║    ██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║    ██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║    ███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝    ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`;

const SYSTEM_UNLOCKED_ASCII = `
███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗    ██╗   ██╗███╗   ██╗██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║    ██║   ██║████╗  ██║██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║    ██║   ██║██╔██╗ ██║██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║    ██║   ██║██║╚██╗██║██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║    ╚██████╔╝██║ ╚████║███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ 
`;

const GOODLAB_ASCII = `

   ██████╗  ██████╗  ██████╗ ██████╗ ██╗      █████╗ ██████╗ 
  ██╔════╝ ██╔═══██╗██╔═══██╗██╔══██╗██║     ██╔══██╗██╔══██╗
  ██║  ███╗██║   ██║██║   ██║██║  ██║██║     ███████║██████╔╝
  ██║   ██║██║   ██║██║   ██║██║  ██║██║     ██╔══██║██╔══██╗
  ╚██████╔╝╚██████╔╝╚██████╔╝██████╔╝███████╗██║  ██║██████╔╝
   ╚═════╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═════╝ 
                                                            
`;

interface AsciiArtDisplayProps {
  artKey: "locked" | "unlocked" | "welcome"; // Key to determine which art to display
  className?: string; // Optional additional class names
}

const AsciiArtDisplay: React.FC<AsciiArtDisplayProps> = ({
  artKey,
  className,
}) => {
  let artToDisplay = "";
  let colorClass = themeColors.devTitleText ?? "text-green-400"; // Default color

  switch (artKey) {
    case "locked":
      artToDisplay = SYSTEM_LOCKED_ASCII;
      break;
    case "unlocked":
      artToDisplay = SYSTEM_UNLOCKED_ASCII;
      break;
    case "welcome":
      artToDisplay = GOODLAB_ASCII;
      colorClass = "text-cyan-400"; // Welcome message uses cyan
      break;
    default:
      artToDisplay = "Error: Invalid art key";
      colorClass = themeColors.errorText ?? "text-red-500";
      break;
  }

  return (
    <div
      className={`whitespace-pre font-bold leading-tight text-xs ${colorClass} ${className}`}
    >
      {artToDisplay}
    </div>
  );
};

export default AsciiArtDisplay;
