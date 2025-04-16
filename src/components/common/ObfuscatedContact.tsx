"use client"; // Mark as a Client Component

import React, { useState, useEffect } from "react";

type ObfuscatedContactProps = {
  value: string;
  type: "email" | "phone";
};

const ObfuscatedContact: React.FC<ObfuscatedContactProps> = ({
  value,
  type,
}) => {
  const [displayText, setDisplayText] = useState<string>("");
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Placeholder based on type
  const placeholder =
    type === "email" ? "[email protected]" : "[hidden phone number]";

  useEffect(() => {
    // Set mounted flag to true after component mounts
    setIsMounted(true);
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Only set the actual value after the component has mounted on the client
    if (isMounted) {
      setDisplayText(value);
    } else {
      setDisplayText(placeholder); // Ensure placeholder is shown initially SSR/pre-mount
    }
    // Re-run if value changes (though unlikely in this context) or when mounted state changes
  }, [value, isMounted, placeholder]);

  if (type === "email") {
    // Render mailto link only when the actual email is displayed
    return isMounted ? (
      <a href={`mailto:${displayText}`} className="hover:underline">
        {displayText}
      </a>
    ) : (
      <span>{displayText}</span> // Render placeholder without link initially
    );
  }

  // For phone or other types, just display the text
  return <span>{displayText}</span>;
};

export default ObfuscatedContact;
