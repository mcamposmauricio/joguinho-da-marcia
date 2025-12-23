
import React, { useRef, useEffect, useState } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GROUND_Y, 
  CHARACTER_X, 
  CHARACTER_WIDTH, 
  CHARACTER_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  INITIAL_SPEED, 
  SPEED_INCREMENT, 
  OBSTACLE_MIN_GAP,
  OBSTACLE_RANDOM_GAP,
  ASSETS
} from '../constants';
import { GameState, Obstacle, ObstacleType } from '../types';

interface GameViewProps {
  state: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  onSpeedUpdate?: (speed: number) => void;
}

const GameView: React.FC<GameViewProps> = ({ state, onGameOver, onScoreUpdate, onSpeedUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  const scoreRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const obstaclesRef = useRef<Obstacle[]>([]);
  
  const bgOffsets = useRef({
    wall: 0,
    windows: 0,
    floor: 0
  });

  const characterRef = useRef({
    y: GROUND_Y - CHARACTER_HEIGHT,
    dy: 0,
    isJumping: false,
    jumpCount: 0,
    isDucking: false,
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT
  });

  const lastObstacleTimeRef = useRef(0);
  const nextSpawnDistanceRef = useRef(OBSTACLE_MIN_GAP);

  useEffect(() => {
    const assetEntries = Object.entries(ASSETS);
    const validAssets = assetEntries.filter(([_, url]) => url && url.trim() !== '');
    
    let loadedCount = 0;
    const totalToLoad = validAssets.length;

    if (totalToLoad === 0) {
      setAssetsLoaded(true);
      return;
    }

    validAssets.forEach(([key, url]) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === totalToLoad) {
          setAssetsLoaded(true);
        }
      };
      img.onerror = (err) => {
        console.error(`Erro ao carregar asset: ${key}`, err);
        loadedCount++;
        if (loadedCount === totalToLoad) {
          setAssetsLoaded(true);
        }
      };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state !== GameState.PLAYING) return;
      
      if (e.key === 'ArrowUp' || e.key === ' ') {
        const char = characterRef.current;
        if (!char.isDucking && char.jumpCount < 2) {
          char.dy = char.jumpCount === 0 ? JUMP_FORCE : JUMP_FORCE * 0.9;
          char.jumpCount++;
          char.isJumping = true;
        }
      }
      
      if (e.key === 'ArrowDown') {
        characterRef.current.isDucking = true;
        characterRef.current.height = CHARACTER_HEIGHT * 0.5;
        characterRef.current.width = CHARACTER_WIDTH * 1.3;
        if (!characterRef.current.isJumping) {
          characterRef.current.y = GROUND_Y - characterRef.current.height;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        characterRef.current.isDucking = false;
        characterRef.current.height = CHARACTER_HEIGHT;
        characterRef.current.width = CHARACTER_WIDTH;
        if (!characterRef.current.isJumping) {
            characterRef.current.y = GROUND_Y - CHARACTER_HEIGHT;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state]);

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2;
    const panelSpacing = 300;
    const pOffset = bgOffsets.current.wall % panelSpacing;
    for (let x = -panelSpacing; x < CANVAS_WIDTH + panelSpacing; x += panelSpacing) {
      ctx.beginPath();
      ctx.moveTo(x - pOffset, 0);
      ctx.lineTo(x - pOffset, GROUND_Y);
      ctx.stroke();
    }

    const windowWidth = 120;
    const windowHeight = 90;
    const windowSpacing = 600;
    const wOffset = bgOffsets.current.windows % windowSpacing;
    
    for (let x = -windowSpacing; x < CANVAS_WIDTH + windowSpacing; x += windowSpacing) {
      const wx = x - wOffset;
      const wy = 80;
      const gradient = ctx.createLinearGradient(wx, wy, wx, wy + windowHeight);
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(1, '#bae6fd');
      ctx.fillStyle = gradient;
      ctx.fillRect(wx, wy, windowWidth, windowHeight);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.strokeRect(wx, wy, windowWidth, windowHeight);
    }

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, GROUND_Y - 12, CANVAS_WIDTH, 12);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 2;
    const floorSpacing = 225;
    const fOffset = bgOffsets.current.floor % floorSpacing;
    for (let x = -floorSpacing * 2; x < CANVAS_WIDTH + floorSpacing * 2; x += floorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x - fOffset, GROUND_Y);
      ctx.lineTo(x - fOffset - 600, CANVAS_HEIGHT);
      ctx.stroke();
    }
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, time: number) => {
    const char = characterRef.current;
    const x = CHARACTER_X;
    const y = char.y;
    const w = char.width;
    const h = char.height;

    const shadowSize = w * (1 - (GROUND_Y - (y + h)) / 450);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(CHARACTER_X + w/2, GROUND_Y - 3, shadowSize/2, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = imagesRef.current.CHARACTER;
    if (img && img.complete && img.naturalWidth > 0) {
      let drawY = y;
      if (!char.isJumping && !char.isDucking && state === GameState.PLAYING) {
        drawY += Math.sin(time * 0.015) * 6;
      }
      ctx.drawImage(img, x, drawY, w, h);
    } else {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x, y, w, h);
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    const obsImg = imagesRef.current[obs.type];
    if (obsImg && obsImg.complete && obsImg.naturalWidth > 0) {
        ctx.drawImage(obsImg, obs.x, obs.y, obs.width, obs.height);
    } else {
        const color = obs.type === ObstacleType.REP ? '#f43f5e' : obs.type === ObstacleType.PAPER ? '#f8fafc' : '#38bdf8';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 12);
        ctx.fill();
    }
  };

  const update = (time: number) => {
    if (state !== GameState.PLAYING) return;
    const char = characterRef.current;
    const currentSpeed = speedRef.current;
    
    bgOffsets.current.wall += currentSpeed * 0.08;
    bgOffsets.current.windows += currentSpeed * 0.25;
    bgOffsets.current.floor += currentSpeed * 0.85;

    char.dy += GRAVITY;
    char.y += char.dy;

    const currentFloor = char.isDucking ? (GROUND_Y - char.height) : (GROUND_Y - CHARACTER_HEIGHT);
    if (char.y > currentFloor) {
      char.y = currentFloor;
      char.dy = 0;
      char.isJumping = false;
      char.jumpCount = 0; 
    }

    speedRef.current += SPEED_INCREMENT;
    if (onSpeedUpdate) onSpeedUpdate(speedRef.current);

    if (time - lastObstacleTimeRef.current > nextSpawnDistanceRef.current / currentSpeed) {
      const rand = Math.random();
      let type: ObstacleType;
      let h, w, y;

      if (rand < 0.45) {
          type = ObstacleType.REP; h = 114; w = 165; y = GROUND_Y - h;
      } else if (rand < 0.8) {
          type = ObstacleType.PAPER; h = 120; w = 120; y = GROUND_Y - h;
      } else {
          type = ObstacleType.SUSPENDED_FILES; h = 90; w = 180; y = GROUND_Y - 315;
      }
      
      obstaclesRef.current.push({ x: CANVAS_WIDTH, y, width: w, height: h, type, passed: false });
      lastObstacleTimeRef.current = time;
      const currentMinGap = Math.max(3750, OBSTACLE_MIN_GAP - (currentSpeed * 225));
      nextSpawnDistanceRef.current = currentMinGap + Math.random() * OBSTACLE_RANDOM_GAP;
    }

    obstaclesRef.current.forEach((obs) => {
      obs.x -= currentSpeed;
      if (obs.x + obs.width < CHARACTER_X && !obs.passed) {
        obs.passed = true;
        scoreRef.current += 1;
        onScoreUpdate(scoreRef.current);
      }

      const hPadding = char.width * 0.35;
      const vPadding = char.height * 0.15;
      
      if (
        CHARACTER_X + hPadding < obs.x + obs.width &&
        CHARACTER_X + char.width - hPadding > obs.x &&
        char.y + vPadding < obs.y + obs.height &&
        char.y + char.height - vPadding > obs.y
      ) {
        onGameOver(scoreRef.current);
      }
    });
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x + obs.width > -300);
  };

  const render = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !assetsLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Só atualizamos a física se estiver no estado PLAYING
    if (state === GameState.PLAYING) {
        update(time);
    }
    
    drawBackground(ctx);
    obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs));
    drawCharacter(ctx, time);
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    // Iniciamos a renderização tanto no TUTORIAL (parado) quanto no PLAYING (ativo)
    if ((state === GameState.PLAYING || state === GameState.TUTORIAL) && assetsLoaded) {
        // Reiniciamos refs apenas quando o tutorial começa (primeira vez no ciclo)
        if (state === GameState.TUTORIAL) {
            scoreRef.current = 0;
            speedRef.current = INITIAL_SPEED;
            obstaclesRef.current = [];
            bgOffsets.current = { wall: 0, windows: 0, floor: 0 };
            characterRef.current = { 
              y: GROUND_Y - CHARACTER_HEIGHT, 
              dy: 0, 
              isJumping: false, 
              jumpCount: 0, 
              isDucking: false, 
              width: CHARACTER_WIDTH, 
              height: CHARACTER_HEIGHT 
            };
            lastObstacleTimeRef.current = performance.now();
        }
        requestRef.current = requestAnimationFrame(render);
    } else if (state === GameState.START) {
        cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [state, assetsLoaded]);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-fill md:object-contain bg-slate-900"
      />
      {!assetsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white z-50 text-center p-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
          <p className="font-bold tracking-[0.2em] text-sm uppercase animate-pulse">Iniciando Servidores MarQ...</p>
        </div>
      )}
    </div>
  );
};

export default GameView;
