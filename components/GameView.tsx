
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
      // Não usamos crossOrigin pois links de chat podem ser restritivos
      img.src = url;
      img.onload = () => {
        imagesRef.current[key] = img;
        loadedCount++;
        if (loadedCount === totalToLoad) setAssetsLoaded(true);
      };
      img.onerror = () => {
        console.error(`Erro ao carregar imagem: ${key}`);
        loadedCount++;
        if (loadedCount === totalToLoad) setAssetsLoaded(true);
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
        // Hitbox menor ao abaixar
        characterRef.current.height = CHARACTER_HEIGHT * 0.55;
        if (!characterRef.current.isJumping) {
          characterRef.current.y = GROUND_Y - characterRef.current.height;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        characterRef.current.isDucking = false;
        characterRef.current.height = CHARACTER_HEIGHT;
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

  const drawBackground = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#64748b'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    const spacing = 60;
    const offset = (time * speedRef.current) % spacing;
    for (let x = -spacing; x < CANVAS_WIDTH + spacing; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x - offset, GROUND_Y);
      ctx.lineTo(x - offset - 150, CANVAS_HEIGHT);
      ctx.stroke();
    }
  };

  const drawCharacter = (ctx: CanvasRenderingContext2D, time: number) => {
    const char = characterRef.current;
    const x = CHARACTER_X;
    const y = char.y;
    const w = char.width;
    const h = char.height;

    // Sombra dinâmica
    const shadowSize = w * (1 - (GROUND_Y - (y + h)) / 300);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + w/2, GROUND_Y - 2, shadowSize/2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = imagesRef.current.CHARACTER;

    if (img && img.complete) {
      // Pequeno balanço de corrida
      let drawY = y;
      if (!char.isJumping && !char.isDucking && state === GameState.PLAYING) {
        drawY += Math.sin(time * 0.02) * 4;
      }
      
      // Desenha a imagem. Se estiver abaixando, ela "achata"
      ctx.drawImage(img, x, drawY, w, h);
    } else {
      // Fallback estilizado se a imagem falhar
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 10);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText("MÁRCIA", x + w/2, y + h/2);
    }
  };

  const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    ctx.fillStyle = obs.type === ObstacleType.REP ? '#ef4444' : obs.type === ObstacleType.PAPER ? '#ffffff' : '#60a5fa';
    ctx.beginPath();
    ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.strokeRect(obs.x + 5, obs.y + 5, obs.width - 10, obs.height - 10);
    
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'black 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(obs.type, obs.x + obs.width/2, obs.y + obs.height/2 + 4);
  };

  const update = (time: number) => {
    if (state !== GameState.PLAYING) return;
    const char = characterRef.current;
    
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

    if (time - lastObstacleTimeRef.current > nextSpawnDistanceRef.current / speedRef.current) {
      const rand = Math.random();
      let type: ObstacleType;
      let h, w, y;

      if (rand < 0.45) {
          type = ObstacleType.REP; h = 75; w = 65; y = GROUND_Y - h;
      } else if (rand < 0.8) {
          type = ObstacleType.PAPER; h = 55; w = 75; y = GROUND_Y - h;
      } else {
          type = ObstacleType.SUSPENDED_FILES; h = 45; w = 110; y = GROUND_Y - 180; 
      }
      
      obstaclesRef.current.push({ x: CANVAS_WIDTH, y, width: w, height: h, type, passed: false });
      lastObstacleTimeRef.current = time;
      const currentMinGap = Math.max(2800, OBSTACLE_MIN_GAP - (speedRef.current * 120));
      nextSpawnDistanceRef.current = currentMinGap + Math.random() * OBSTACLE_RANDOM_GAP;
    }

    obstaclesRef.current.forEach((obs) => {
      obs.x -= speedRef.current;
      if (obs.x + obs.width < CHARACTER_X && !obs.passed) {
        obs.passed = true;
        scoreRef.current += 1;
        onScoreUpdate(scoreRef.current);
      }

      // Hitbox interna para ser mais justo com a imagem da Márcia
      const hPadding = 25;
      const vPadding = 20;
      if (
        CHARACTER_X + hPadding < obs.x + obs.width &&
        CHARACTER_X + char.width - hPadding > obs.x &&
        char.y + vPadding < obs.y + obs.height &&
        char.y + char.height - vPadding > obs.y
      ) {
        onGameOver(scoreRef.current);
      }
    });
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x + obs.width > -100);
  };

  const render = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !assetsLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    update(time);
    drawBackground(ctx, time);
    obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs));
    drawCharacter(ctx, time);
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (state === GameState.PLAYING && assetsLoaded) {
        scoreRef.current = 0;
        speedRef.current = INITIAL_SPEED;
        obstaclesRef.current = [];
        characterRef.current = { y: GROUND_Y - CHARACTER_HEIGHT, dy: 0, isJumping: false, jumpCount: 0, isDucking: false, width: CHARACTER_WIDTH, height: CHARACTER_HEIGHT };
        lastObstacleTimeRef.current = performance.now();
        requestRef.current = requestAnimationFrame(render);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [state, assetsLoaded]);

  return (
    <div className="relative w-full h-full bg-slate-900">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain"
      />
      {!assetsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-black tracking-widest text-xs uppercase">Conectando à Márcia...</p>
        </div>
      )}
    </div>
  );
};

export default GameView;
