"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./dino.module.css";

// Constants for the game
const CANVAS_WIDTH = 600; // Logical width
const CANVAS_HEIGHT = 250; // Logical height (Increased for more vertical space)
const FPS = 60; // Target FPS (though requestAnimationFrame controls timing)
const SPRITE_PATH = "/images/icons/200-offline-sprite.png";

// Speed constants (slowed down further)
const INITIAL_SPEED = 2.0;
const MAX_SPEED = 5.0;
const SPEED_INCREASE_INTERVAL = 2500; // Frames before speed increases
const SPEED_INCREASE_AMOUNT = 0.03;

// Physics constants
const GRAVITY = 0.45; // Reduced gravity for less abrupt jump
// const DESCENT_GRAVITY = 0.3; // Asymmetric gravity removed
const JUMP_INITIAL_VELOCITY = -10.5; // Adjusted initial velocity for new gravity
const SHORT_JUMP_VELOCITY_THRESHOLD = -3; // Keep this for variable jump
const NIGHT_MODE_DURATION = 1000; // Frames before toggling night mode

// Type definitions
type SpriteRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type ObstacleType =
  | "CACTUS_SMALL_1"
  | "CACTUS_SMALL_2"
  | "CACTUS_SMALL_3"
  | "CACTUS_LARGE_1"
  | "CACTUS_LARGE_2"
  | "CACTUS_LARGE_3"
  | "PTERODACTYL_1"
  | "PTERODACTYL_2";

type Obstacle = {
  type: ObstacleType;
  x: number;
  y?: number; // For pterodactyls
};

type Cloud = {
  x: number;
  y: number;
};

// Sprite Configuration (2x coordinates and 2x dimensions)
const SPRITE_CONFIG: Record<string, SpriteRect> = {
  DINO_WAITING: { x: 76, y: 2, w: 88, h: 94 },
  DINO_RUNNING_1: { x: 1678, y: 2, w: 88, h: 94 },
  DINO_RUNNING_2: { x: 1766, y: 2, w: 88, h: 94 },
  DINO_DUCKING_1: { x: 1866, y: 36, w: 118, h: 60 },
  DINO_DUCKING_2: { x: 1984, y: 36, w: 118, h: 60 },
  DINO_JUMPING: { x: 1678, y: 2, w: 88, h: 94 },
  DINO_DEAD: { x: 2030, y: 2, w: 88, h: 94 },
  CACTUS_SMALL_1: { x: 446, y: 2, w: 34, h: 70 },
  CACTUS_SMALL_2: { x: 480, y: 2, w: 68, h: 70 },
  CACTUS_SMALL_3: { x: 548, y: 2, w: 102, h: 70 },
  CACTUS_LARGE_1: { x: 652, y: 2, w: 50, h: 100 },
  CACTUS_LARGE_2: { x: 702, y: 2, w: 100, h: 100 },
  CACTUS_LARGE_3: { x: 802, y: 2, w: 150, h: 100 },
  PTERODACTYL_1: { x: 260, y: 2, w: 92, h: 80 },
  PTERODACTYL_2: { x: 352, y: 2, w: 92, h: 80 },
  GROUND: { x: 2, y: 104, w: 2400, h: 24 },
  CLOUD: { x: 166, y: 2, w: 92, h: 27 },
};

// Game State Type
type GameState = {
  isPlaying: boolean;
  isPaused: boolean;
  groundPos: number;
  dinoY: number;
  isJumping: boolean;
  isDucking: boolean;
  jumpVelocity: number;
  obstacles: Obstacle[];
  clouds: Cloud[];
  frameCount: number;
  speed: number;
  nightMode: boolean;
  nightModeTimer: number;
  isHit: boolean;
  hitTimer: number;
};

// Helper function to get 1x ground height
const getGroundHeight = (): number => SPRITE_CONFIG.GROUND.h / 2;

// Helper function to get 1x dino height (waiting state used as default)
const getDinoHeight = (): number => SPRITE_CONFIG.DINO_WAITING.h / 2;

export default function DinoPage(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Calculate initial dino Y based on NEW CANVAS_HEIGHT
  const initialDinoY = CANVAS_HEIGHT - getDinoHeight() - getGroundHeight();

  const gameRef = useRef<GameState>({
    isPlaying: false,
    isPaused: false,
    groundPos: 0,
    dinoY: initialDinoY,
    isJumping: false,
    isDucking: false,
    jumpVelocity: 0,
    obstacles: [],
    clouds: [],
    frameCount: 0,
    speed: INITIAL_SPEED,
    nightMode: false,
    nightModeTimer: 0,
    isHit: false,
    hitTimer: 0,
  });

  // --- Resize Handler ---
  const handleResize = useCallback(() => {
    if (containerRef.current && canvasRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newScale = containerWidth / CANVAS_WIDTH;
      setScale(newScale);

      const canvas = canvasRef.current;
      canvas.width = containerWidth;
      canvas.height = CANVAS_HEIGHT * newScale;
    }
  }, []);

  // --- Render Game ---
  const renderGame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      spriteImage: HTMLImageElement,
      currentScale: number
    ) => {
      const game = gameRef.current;
      const groundHeight1x = getGroundHeight();

      ctx.save();
      ctx.scale(currentScale, currentScale);

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (game.nightMode) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }

      const cloudWidth1x = SPRITE_CONFIG.CLOUD.w / 2;
      const cloudHeight1x = SPRITE_CONFIG.CLOUD.h / 2;
      game.clouds.forEach((cloud: Cloud) => {
        ctx.drawImage(
          spriteImage,
          SPRITE_CONFIG.CLOUD.x,
          SPRITE_CONFIG.CLOUD.y,
          SPRITE_CONFIG.CLOUD.w,
          SPRITE_CONFIG.CLOUD.h,
          cloud.x,
          cloud.y,
          cloudWidth1x,
          cloudHeight1x
        );
      });

      const groundY = CANVAS_HEIGHT - groundHeight1x;
      const groundWidth1x = SPRITE_CONFIG.GROUND.w / 2;
      ctx.drawImage(
        spriteImage,
        SPRITE_CONFIG.GROUND.x,
        SPRITE_CONFIG.GROUND.y,
        SPRITE_CONFIG.GROUND.w,
        SPRITE_CONFIG.GROUND.h,
        game.groundPos,
        groundY,
        groundWidth1x,
        groundHeight1x
      );
      ctx.drawImage(
        spriteImage,
        SPRITE_CONFIG.GROUND.x,
        SPRITE_CONFIG.GROUND.y,
        SPRITE_CONFIG.GROUND.w,
        SPRITE_CONFIG.GROUND.h,
        game.groundPos + groundWidth1x,
        groundY,
        groundWidth1x,
        groundHeight1x
      );

      let dinoSprite: SpriteRect;
      let dinoDrawY = game.dinoY;
      if (game.isHit) {
        dinoSprite = SPRITE_CONFIG.DINO_DEAD;
      } else if (!game.isPlaying) {
        dinoSprite = SPRITE_CONFIG.DINO_WAITING;
      } else if (game.isJumping) {
        dinoSprite = SPRITE_CONFIG.DINO_JUMPING;
      } else if (game.isDucking) {
        dinoSprite =
          game.frameCount % 10 < 5
            ? SPRITE_CONFIG.DINO_DUCKING_1
            : SPRITE_CONFIG.DINO_DUCKING_2;
        dinoDrawY = CANVAS_HEIGHT - dinoSprite.h / 2 - groundHeight1x;
      } else {
        dinoSprite =
          game.frameCount % 12 < 6
            ? SPRITE_CONFIG.DINO_RUNNING_1
            : SPRITE_CONFIG.DINO_RUNNING_2;
      }
      const dinoWidth1x = dinoSprite.w / 2;
      const dinoHeight1x = dinoSprite.h / 2;
      ctx.drawImage(
        spriteImage,
        dinoSprite.x,
        dinoSprite.y,
        dinoSprite.w,
        dinoSprite.h,
        50,
        dinoDrawY,
        dinoWidth1x,
        dinoHeight1x
      );

      if (game.isPlaying) {
        game.obstacles.forEach((obs: Obstacle) => {
          const sprite = SPRITE_CONFIG[obs.type];
          const obsWidth1x = sprite.w / 2;
          const obsHeight1x = sprite.h / 2;
          const obsY = obs.y ?? CANVAS_HEIGHT - obsHeight1x - groundHeight1x;
          ctx.drawImage(
            spriteImage,
            sprite.x,
            sprite.y,
            sprite.w,
            sprite.h,
            obs.x,
            obsY,
            obsWidth1x,
            obsHeight1x
          );
        });
      }

      if (game.isPlaying && game.isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#f7f7f7";
        ctx.font = 'bold 30px "Press Start 2P", Arial, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText("II", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      }

      ctx.restore();
    },
    []
  );

  // --- Effect for Loading and Initial Resize ---
  useEffect(() => {
    const image = new Image();
    image.src = SPRITE_PATH;
    image.onload = () => {
      spriteImageRef.current = image;
      handleResize(); // Set initial size/scale

      // --- Render initial frame ---
      if (canvasRef.current && containerRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        const initialScale = containerRef.current.offsetWidth / CANVAS_WIDTH;
        if (ctx) {
          // Re-fetch game state directly before rendering initial frame
          const initialGame = gameRef.current;
          // Directly call the render logic (or a dedicated initial render function)
          // Using a direct call avoids useCallback dependency issues
          const groundHeight1x = getGroundHeight();
          ctx.save();
          ctx.scale(initialScale, initialScale);
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          if (initialGame.nightMode) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }
          // Draw initial clouds (if any in initial state)
          const cloudWidth1x = SPRITE_CONFIG.CLOUD.w / 2;
          const cloudHeight1x = SPRITE_CONFIG.CLOUD.h / 2;
          initialGame.clouds.forEach((cloud: Cloud) => {
            ctx.drawImage(
              image,
              SPRITE_CONFIG.CLOUD.x,
              SPRITE_CONFIG.CLOUD.y,
              SPRITE_CONFIG.CLOUD.w,
              SPRITE_CONFIG.CLOUD.h,
              cloud.x,
              cloud.y,
              cloudWidth1x,
              cloudHeight1x
            );
          });
          // Draw initial ground
          const groundY = CANVAS_HEIGHT - groundHeight1x;
          const groundWidth1x = SPRITE_CONFIG.GROUND.w / 2;
          ctx.drawImage(
            image,
            SPRITE_CONFIG.GROUND.x,
            SPRITE_CONFIG.GROUND.y,
            SPRITE_CONFIG.GROUND.w,
            SPRITE_CONFIG.GROUND.h,
            initialGame.groundPos,
            groundY,
            groundWidth1x,
            groundHeight1x
          );
          ctx.drawImage(
            image,
            SPRITE_CONFIG.GROUND.x,
            SPRITE_CONFIG.GROUND.y,
            SPRITE_CONFIG.GROUND.w,
            SPRITE_CONFIG.GROUND.h,
            initialGame.groundPos + groundWidth1x,
            groundY,
            groundWidth1x,
            groundHeight1x
          );
          // Draw waiting dino
          const dinoSprite = SPRITE_CONFIG.DINO_WAITING;
          const dinoWidth1x = dinoSprite.w / 2;
          const dinoHeight1x = dinoSprite.h / 2;
          ctx.drawImage(
            image,
            dinoSprite.x,
            dinoSprite.y,
            dinoSprite.w,
            dinoSprite.h,
            50,
            initialGame.dinoY,
            dinoWidth1x,
            dinoHeight1x
          );
          ctx.restore();
        }
      }
      // ---------------------------
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      gameRef.current.isPlaying = false;
    };
  }, [handleResize]);

  // --- Update Game Logic ---
  const updateGame = useCallback(() => {
    const game = gameRef.current;
    const groundHeight1x = getGroundHeight();

    game.frameCount++;

    if (game.isHit) {
      game.hitTimer--;
      if (game.hitTimer <= 0) {
        game.isHit = false;
      }
    }

    const groundWidth1x = SPRITE_CONFIG.GROUND.w / 2;
    game.groundPos = (game.groundPos - game.speed) % groundWidth1x;

    if (game.isJumping) {
      game.dinoY += game.jumpVelocity;
      game.jumpVelocity += GRAVITY;
      if (game.dinoY >= initialDinoY) {
        game.dinoY = initialDinoY;
        game.isJumping = false;
        game.jumpVelocity = 0;
      }
    }

    if (game.frameCount % 150 === 0 && Math.random() > 0.5) {
      const cloudY = Math.random() * (CANVAS_HEIGHT * 0.5 - 20) + 20;
      game.clouds.push({ x: CANVAS_WIDTH, y: cloudY });
    }
    const cloudWidth1x = SPRITE_CONFIG.CLOUD.w / 2;
    game.clouds = game.clouds
      .map((cloud: Cloud) => ({ ...cloud, x: cloud.x - game.speed / 3 }))
      .filter((cloud: Cloud) => cloud.x > -cloudWidth1x);

    const lastObstacle = game.obstacles[game.obstacles.length - 1];
    const shouldGenerateObstacle =
      !lastObstacle ||
      CANVAS_WIDTH - lastObstacle.x > 200 + Math.random() * 200;
    if (shouldGenerateObstacle && game.frameCount > 60) {
      const obstacleTypes: ObstacleType[] = [
        "CACTUS_SMALL_1",
        "CACTUS_SMALL_2",
        "CACTUS_SMALL_3",
        "CACTUS_LARGE_1",
        "CACTUS_LARGE_2",
        "CACTUS_LARGE_3",
        "PTERODACTYL_1",
        "PTERODACTYL_2",
      ];
      const type =
        obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      const isPterodactyl = type.startsWith("PTERODACTYL");
      let pteroY: number | undefined = undefined;
      if (isPterodactyl) {
        pteroY = Math.random() > 0.5 ? 60 : 90;
      }
      game.obstacles.push({
        type: type,
        x: CANVAS_WIDTH,
        y: pteroY,
      });
    }
    game.obstacles = game.obstacles
      .map((obs: Obstacle) => ({ ...obs, x: obs.x - game.speed }))
      .filter((obs: Obstacle) => obs.x > -(SPRITE_CONFIG[obs.type].w / 2));

    if (!game.isHit && game.isPlaying) {
      let currentDinoSprite: SpriteRect;
      let dinoDrawY = game.dinoY;
      if (game.isJumping) {
        currentDinoSprite = SPRITE_CONFIG.DINO_JUMPING;
      } else if (game.isDucking) {
        currentDinoSprite =
          game.frameCount % 10 < 5
            ? SPRITE_CONFIG.DINO_DUCKING_1
            : SPRITE_CONFIG.DINO_DUCKING_2;
        dinoDrawY = CANVAS_HEIGHT - currentDinoSprite.h / 2 - groundHeight1x;
      } else {
        currentDinoSprite =
          game.frameCount % 12 < 6
            ? SPRITE_CONFIG.DINO_RUNNING_1
            : SPRITE_CONFIG.DINO_RUNNING_2;
      }
      const dinoWidth1x = currentDinoSprite.w / 2;
      const dinoHeight1x = currentDinoSprite.h / 2;
      const dinoPadding = 5;
      const dinoRect = {
        x: 50 + dinoPadding,
        y: dinoDrawY + dinoPadding,
        w: dinoWidth1x - 2 * dinoPadding,
        h: dinoHeight1x - 2 * dinoPadding,
      };

      for (const obs of game.obstacles) {
        const sprite = SPRITE_CONFIG[obs.type];
        const obsWidth1x = sprite.w / 2;
        const obsHeight1x = sprite.h / 2;
        const obsY = obs.y ?? CANVAS_HEIGHT - obsHeight1x - groundHeight1x;
        const obsPadding = 2;
        const obsRect = {
          x: obs.x + obsPadding,
          y: obsY + obsPadding,
          w: obsWidth1x - 2 * obsPadding,
          h: obsHeight1x - 2 * obsPadding,
        };

        if (
          dinoRect.x < obsRect.x + obsRect.w &&
          dinoRect.x + dinoRect.w > obsRect.x &&
          dinoRect.y < obsRect.y + obsRect.h &&
          dinoRect.y + dinoRect.h > obsRect.y
        ) {
          game.isHit = true;
          game.hitTimer = 60;
          break;
        }
      }
    }

    game.nightModeTimer++;
    if (game.nightModeTimer >= NIGHT_MODE_DURATION) {
      game.nightMode = !game.nightMode;
      game.nightModeTimer = 0;
    }

    if (
      game.frameCount % SPEED_INCREASE_INTERVAL === 0 &&
      game.speed < MAX_SPEED
    ) {
      game.speed = Math.min(MAX_SPEED, game.speed + SPEED_INCREASE_AMOUNT);
    }
  }, [initialDinoY]);

  // --- Game Loop ---
  const gameLoop = useCallback(() => {
    if (!gameRef.current.isPlaying || gameRef.current.isPaused) {
      animationFrameId.current = null;
      return;
    }

    updateGame();
    if (canvasRef.current && spriteImageRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        renderGame(ctx, spriteImageRef.current, scale);
      }
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [scale, updateGame, renderGame]);

  // --- Start Game Function ---
  const startGame = useCallback(() => {
    if (!gameRef.current.isPlaying) {
      gameRef.current = {
        isPlaying: true,
        isPaused: false,
        groundPos: 0,
        dinoY: initialDinoY,
        isJumping: false,
        isDucking: false,
        jumpVelocity: 0,
        obstacles: [],
        clouds: [],
        frameCount: 0,
        speed: INITIAL_SPEED,
        nightMode: false,
        nightModeTimer: 0,
        isHit: false,
        hitTimer: 0,
      };
      gameLoop();
    }
  }, [gameLoop, initialDinoY]);

  // --- Effect for Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!spriteImageRef.current) return;

      const game = gameRef.current;

      // 1. Handle starting the game
      if (!game.isPlaying && (e.code === "Space" || e.code === "ArrowUp")) {
        startGame();
        return;
      }

      // 2. Handle pause/unpause with ESC
      if (e.code === "Escape") {
        e.preventDefault();
        if (game.isPlaying) {
          game.isPaused = !game.isPaused;
          if (!game.isPaused) {
            gameLoop();
          }
        }
        return;
      }

      // If game isn't playing, ignore other keys
      if (!game.isPlaying) {
        return;
      }

      // --- From here, game is playing ---

      // 3. Handle jump OR unpause with Space/Up
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (game.isPaused) {
          // Unpause the game
          game.isPaused = false;
          gameLoop();
        } else if (!game.isJumping && !game.isDucking) {
          // Perform jump only if not paused and not already jumping/ducking
          game.isJumping = true;
          game.jumpVelocity = JUMP_INITIAL_VELOCITY;
        }
      }
      // 4. Handle duck (only if not paused)
      else if (e.code === "ArrowDown" && !game.isPaused) {
        e.preventDefault();
        if (!game.isJumping) {
          game.isDucking = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent): void => {
      // Only handle key up if the game is actively playing and not paused
      if (!gameRef.current.isPlaying || gameRef.current.isPaused) return;

      if (e.code === "ArrowDown") {
        gameRef.current.isDucking = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [startGame, gameLoop]);

  return (
    <motion.div
      ref={containerRef}
      className={styles.canvasContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <canvas ref={canvasRef} className={styles.runnerCanvas} />
    </motion.div>
  );
}
