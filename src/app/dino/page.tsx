"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import styles from "./dino.module.css"; // CSS module in the same directory

const DinoPage: React.FC = () => {
  const searchParams = useSearchParams();
  const isGodMode = searchParams.get("godmode") === "true";

  return (
    <div className={styles.container}>
      <div className={styles.gameArea}>
        {/* Display "Infinite Lives!" text in god mode */}
        {isGodMode && <div className={styles.godModeText}>Infinite Lives!</div>}

        {/* Static Dinosaur */}
        <div className={styles.dino}>🦖</div>

        {/* Render static obstacles ONLY if NOT in god mode */}
        {!isGodMode && (
          <>
            <div className={`${styles.obstacle} ${styles.cactus1}`}>🌵</div>
            <div className={`${styles.obstacle} ${styles.cactus2}`}>🌵</div>
            <div className={`${styles.obstacle} ${styles.pterodactyl}`}>🦅</div> {/* Added another obstacle type */}
          </>
        )}

        {/* Scrolling Ground */}
        <div className={styles.ground}></div>
      </div>
      <p className={styles.instructions}>
        Visual representation based on Chrome Dino. No game logic implemented.
      </p>
      {!isGodMode && (
        <p className={styles.instructions}>
          Append <code>?godmode=true</code> to the URL for infinite lives (no obstacles).
        </p>
      )}
    </div>
  );
};

export default DinoPage; 