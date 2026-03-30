import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="h-screen w-screen bg-black text-cyan-400 font-sans overflow-hidden flex flex-col relative crt">
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 static-noise z-40 pointer-events-none"></div>

      {/* Top HUD */}
      <header className="relative z-10 w-full p-4 md:p-6 flex items-center justify-between border-b-4 border-fuchsia-600 bg-black/80 backdrop-blur">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl md:text-6xl font-bold uppercase glitch" data-text="SYS.SNAKE">
            SYS.SNAKE
          </h1>
          <span className="hidden md:inline-block px-2 py-1 bg-fuchsia-600 text-black text-xl font-bold animate-pulse">
            REC
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-fuchsia-500 uppercase tracking-widest text-2xl md:text-4xl">MEM:</div>
          <div className="text-5xl md:text-7xl font-bold text-cyan-400 screen-tear">
            {score.toString().padStart(4, '0')}
          </div>
        </div>
      </header>

      {/* Game Area - Scale to Fit */}
      <main className="relative z-10 flex-1 w-full flex items-center justify-center p-4 md:p-8 min-h-0">
        <SnakeGame onScoreChange={setScore} />
      </main>

      {/* Bottom HUD */}
      <footer className="relative z-10 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-4 border-t-4 border-cyan-500 bg-black/80 backdrop-blur">
        <div className="hidden md:block text-fuchsia-500 text-lg max-w-sm">
          <p className="animate-pulse">&gt; WARNING: UNAUTHORIZED ACCESS DETECTED.</p>
          <p>&gt; INITIATING COUNTER-MEASURES...</p>
          <p>&gt; AWAITING OVERRIDE...</p>
        </div>
        <MusicPlayer />
      </footer>
    </div>
  );
}
