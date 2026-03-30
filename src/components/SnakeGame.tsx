import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const GAME_SPEED = 70;
const CANVAS_SIZE = 800;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

type Point = { x: number; y: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

interface SnakeGameProps {
  onScoreChange: (score: number) => void;
}

export default function SnakeGame({ onScoreChange }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const [uiState, setUiState] = useState({
    hasStarted: false,
    isPaused: false,
    isGameOver: false,
    score: 0
  });

  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    lastMove: 0,
    particles: [] as Particle[],
    shake: 0,
    hasStarted: false,
    isPaused: false,
    isGameOver: false,
    score: 0
  });

  const generateFood = useCallback((snake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
    }
    return newFood;
  }, []);

  // Initialize food on first render
  useEffect(() => {
    state.current.food = generateFood(state.current.snake);
  }, [generateFood]);

  const resetGame = useCallback(() => {
    state.current = {
      ...state.current,
      snake: [{ x: 10, y: 10 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }]),
      particles: [],
      shake: 0,
      hasStarted: true,
      isPaused: false,
      isGameOver: false,
      score: 0
    };
    setUiState({ hasStarted: true, isPaused: false, isGameOver: false, score: 0 });
    onScoreChange(0);
  }, [generateFood, onScoreChange]);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        life: 1.0,
        color,
        size: Math.random() * 6 + 2
      });
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    const s = state.current;

    if (s.isGameOver) {
      if (e.key === 'Enter' || e.key === ' ') resetGame();
      return;
    }

    if (e.key === ' ') {
      if (s.hasStarted) {
        s.isPaused = !s.isPaused;
        setUiState(prev => ({ ...prev, isPaused: s.isPaused }));
      }
      return;
    }

    if (!s.hasStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
      s.hasStarted = true;
      setUiState(prev => ({ ...prev, hasStarted: true }));
    }

    switch (e.key) {
      case 'ArrowUp': case 'w':
        if (s.dir.y !== 1) s.nextDir = { x: 0, y: -1 }; break;
      case 'ArrowDown': case 's':
        if (s.dir.y !== -1) s.nextDir = { x: 0, y: 1 }; break;
      case 'ArrowLeft': case 'a':
        if (s.dir.x !== 1) s.nextDir = { x: -1, y: 0 }; break;
      case 'ArrowRight': case 'd':
        if (s.dir.x !== -1) s.nextDir = { x: 1, y: 0 }; break;
    }
  }, [resetGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const update = (time: number) => {
    const s = state.current;
    
    // Update particles
    s.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    s.particles = s.particles.filter(p => p.life > 0);

    if (s.hasStarted && !s.isPaused && !s.isGameOver) {
      if (!s.lastMove) s.lastMove = time;
      
      if (time - s.lastMove > GAME_SPEED) {
        s.lastMove = time;
        s.dir = s.nextDir;
        
        const head = s.snake[0];
        const newHead = { x: head.x + s.dir.x, y: head.y + s.dir.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          s.isGameOver = true;
          s.shake = 40;
          spawnParticles(head.x, head.y, '#0ff', 40);
          setUiState(prev => ({ ...prev, isGameOver: true }));
          return;
        }

        // Self collision
        if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          s.isGameOver = true;
          s.shake = 40;
          spawnParticles(head.x, head.y, '#0ff', 40);
          setUiState(prev => ({ ...prev, isGameOver: true }));
          return;
        }

        s.snake.unshift(newHead);

        // Food collision
        if (newHead.x === s.food.x && newHead.y === s.food.y) {
          s.score += 1;
          s.shake = 15;
          spawnParticles(s.food.x, s.food.y, '#f0f', 20);
          s.food = generateFood(s.snake);
          setUiState(prev => ({ ...prev, score: s.score }));
          onScoreChange(s.score);
        } else {
          s.snake.pop();
        }
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = state.current;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.save();

    // Screen shake
    if (s.shake > 0) {
      const dx = (Math.random() - 0.5) * s.shake;
      const dy = (Math.random() - 0.5) * s.shake;
      ctx.translate(dx, dy);
      s.shake *= 0.9;
      if (s.shake < 0.5) s.shake = 0;
    }

    // Draw Grid (subtle dots)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        ctx.fillRect(x * CELL_SIZE + CELL_SIZE/2 - 2, y * CELL_SIZE + CELL_SIZE/2 - 2, 4, 4);
      }
    }

    // Draw Food
    ctx.fillStyle = '#f0f';
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#f0f';
    const pulse = Math.sin(Date.now() / 100) * 6;
    ctx.fillRect(
      s.food.x * CELL_SIZE + 6 - pulse/2, 
      s.food.y * CELL_SIZE + 6 - pulse/2, 
      CELL_SIZE - 12 + pulse, 
      CELL_SIZE - 12 + pulse
    );

    // Draw Snake
    s.snake.forEach((seg, i) => {
      const isHead = i === 0;
      const progress = i / s.snake.length;
      
      ctx.fillStyle = isHead ? '#0ff' : `rgba(0, 255, 255, ${Math.max(0.2, 1 - progress)})`;
      ctx.shadowBlur = isHead ? 25 : 15;
      ctx.shadowColor = '#0ff';
      
      const margin = isHead ? 2 : 4 + (progress * 6);
      ctx.fillRect(
        seg.x * CELL_SIZE + margin, 
        seg.y * CELL_SIZE + margin, 
        CELL_SIZE - margin * 2, 
        CELL_SIZE - margin * 2
      );
    });

    // Draw Particles
    ctx.shadowBlur = 15;
    s.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  };

  const loop = useCallback((time: number) => {
    update(time);
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-full max-w-[800px] aspect-square border-4 border-fuchsia-600 bg-black overflow-hidden shadow-[0_0_40px_rgba(217,70,239,0.4)]">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_SIZE} 
          height={CANVAS_SIZE} 
          className="w-full h-full object-contain block"
        />
        
        {/* Overlays */}
        {!uiState.hasStarted && !uiState.isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <div className="text-center">
              <p className="text-cyan-400 font-bold text-4xl md:text-6xl mb-4 uppercase glitch" data-text="AWAITING_INPUT">AWAITING_INPUT</p>
              <p className="text-fuchsia-500 text-xl md:text-3xl animate-pulse">EXECUTE [ARROW_KEYS]</p>
            </div>
          </div>
        )}

        {uiState.isPaused && uiState.hasStarted && !uiState.isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
            <p className="text-fuchsia-500 font-bold text-5xl md:text-7xl uppercase glitch" data-text="SYSTEM_HALTED">SYSTEM_HALTED</p>
          </div>
        )}

        {uiState.isGameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
            <p className="text-fuchsia-600 font-black text-6xl md:text-8xl mb-4 uppercase glitch" data-text="FATAL_ERROR">FATAL_ERROR</p>
            <p className="text-cyan-400 text-3xl md:text-4xl mb-8">DATA_CORRUPTED: {uiState.score}</p>
            <button 
              onClick={resetGame}
              className="px-8 py-4 bg-black border-4 border-cyan-400 text-cyan-400 font-bold text-3xl hover:bg-cyan-400 hover:text-black transition-none uppercase"
            >
              REBOOT_SYS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
