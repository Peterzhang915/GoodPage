"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import styles from "./dino.module.css";

const JUMP_KEY_CODES = ["Space", "ArrowUp", "KeyW"];
const COLLISION_PADDING = 40;
const JUMP_DURATION = 900;

const DinoPage: React.FC = () => {
  const searchParams = useSearchParams();
  const isGodMode = true;
  const [isJumping, setIsJumping] = useState(false);
  const [isIndicatorHit, setIsIndicatorHit] = useState(false);

  const dinoRef = useRef<HTMLDivElement>(null);
  const cactus1Ref = useRef<HTMLDivElement>(null);
  const cactus2Ref = useRef<HTMLDivElement>(null);
  const pterodactylRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const indicatorHitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleJump = useCallback(() => {
    if (!isJumping) {
      console.log("Jump triggered!");
      setIsJumping(true);
      setTimeout(() => {
        setIsJumping(false);
        console.log("Jump state reset via timer (900ms).");
      }, JUMP_DURATION);
    }
  }, [isJumping]);

  const checkCollision = useCallback(() => {
    if (!dinoRef.current) {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(checkCollision);
      return;
    }

    const dinoRect = dinoRef.current.getBoundingClientRect();
    const obstacles = [
      cactus1Ref.current,
      cactus2Ref.current,
      pterodactylRef.current,
    ];

    for (const obstacle of obstacles) {
      if (obstacle) {
        const obstacleRect = obstacle.getBoundingClientRect();
        const padding = COLLISION_PADDING;
        const collision =
          dinoRect.left + padding < obstacleRect.right - padding &&
          dinoRect.right - padding > obstacleRect.left + padding &&
          dinoRect.top + padding < obstacleRect.bottom - padding &&
          dinoRect.bottom - padding > obstacleRect.top + padding;

        if (collision) {
          console.log("Collision! Triggering indicator hit only.");
          setIsIndicatorHit(true);

          if (indicatorHitTimerRef.current) {
            clearTimeout(indicatorHitTimerRef.current);
          }
          indicatorHitTimerRef.current = setTimeout(() => {
            setIsIndicatorHit(false);
          }, 300);

          break;
        }
      }
    }
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(checkCollision);
  }, []);

  useEffect(() => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(checkCollision);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (indicatorHitTimerRef.current) {
        clearTimeout(indicatorHitTimerRef.current);
      }
    };
  }, [checkCollision]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (JUMP_KEY_CODES.includes(event.code)) {
        event.preventDefault();
        handleJump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleJump]);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isGodMode && (
        <div
          className={`${styles.godModeIndicator} ${isIndicatorHit ? styles.indicatorHit : ""}`}
        >
          ❤️ <span className={styles.infinitySymbol}>∞</span>
        </div>
      )}

      <div
        ref={dinoRef}
        className={`${styles.dino} ${isJumping ? styles.jumping : ""}`}
      >
        🦖
      </div>

      <>
        <div
          ref={cactus1Ref}
          className={`${styles.obstacle} ${styles.cactus1}`}
        >
          🌵
        </div>
        <div
          ref={cactus2Ref}
          className={`${styles.obstacle} ${styles.cactus2}`}
        >
          🌵
        </div>
        <div
          ref={pterodactylRef}
          className={`${styles.obstacle} ${styles.pterodactyl}`}
        >
          🦅
        </div>
      </>

      <div className={styles.ground}></div>

      <p className={styles.instructions}>Press Space/Up/W to Jump.</p>
    </motion.div>
  );
};

export default DinoPage;
