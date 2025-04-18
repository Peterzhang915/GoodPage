"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Listens for a specific sequence of key presses (cheat code) and triggers a callback.
 *
 * @param targetSequence The string sequence of keys to detect (e.g., "6031769").
 * @param callback The function to call when the sequence is successfully entered.
 * @param allowedKeysRegex Optional regex to filter which key presses are considered part of the sequence (defaults to digits only).
 */
export function useCheatCode(
  targetSequence: string,
  callback: () => void,
  allowedKeysRegex: RegExp = /^\d$/, // Default: only digits 0-9
) {
  const inputSequenceRef = useRef<string>("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key;
      console.log(`[useCheatCode] Key pressed: ${key}`);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (allowedKeysRegex.test(key)) {
        inputSequenceRef.current += key;
        console.log(
          `[useCheatCode] Current sequence: ${inputSequenceRef.current}`,
        );

        if (inputSequenceRef.current.endsWith(targetSequence)) {
          console.log(
            `[useCheatCode] Target sequence matched: ${targetSequence}`,
          );
          callback();
          inputSequenceRef.current = ""; // Reset after success
        } else if (
          inputSequenceRef.current.length >
          targetSequence.length * 2
        ) {
          inputSequenceRef.current = inputSequenceRef.current.slice(
            -targetSequence.length * 2,
          );
        }

        timeoutRef.current = setTimeout(() => {
          inputSequenceRef.current = "";
        }, 1500); // Reset after 1.5s inactivity
      } else {
        // Reset sequence if a non-allowed key is pressed
        inputSequenceRef.current = "";
        console.log("[useCheatCode] Non-allowed key pressed. Sequence reset.");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    },
    [targetSequence, callback, allowedKeysRegex],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);
}
