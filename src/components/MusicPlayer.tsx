import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "AUDIO_STREAM_01.WAV",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    artist: "UNKNOWN_ENTITY"
  },
  {
    id: 2,
    title: "DATA_CORRUPTION.MP3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    artist: "SYS_ADMIN"
  },
  {
    id: 3,
    title: "VOID_RESONANCE.FLAC",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    artist: "NULL_POINTER"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    handleNext();
  };

  return (
    <div className="w-full max-w-md bg-black border-2 border-cyan-400 p-4 relative overflow-hidden flex flex-col gap-2 font-mono">
      {/* Decorative Corner Brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-fuchsia-500"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-fuchsia-500"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-fuchsia-500"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-fuchsia-500"></div>

      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="flex justify-between items-center border-b-2 border-dashed border-cyan-400/50 pb-2">
        <span className="text-fuchsia-500 text-sm md:text-lg">AUDIO_SUBSYSTEM_v2.1</span>
        <span className="text-cyan-400 text-sm md:text-lg animate-pulse">
          {isPlaying ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 min-w-0">
          <div className="text-cyan-400 text-xl md:text-2xl uppercase truncate glitch" data-text={currentTrack.title}>
            &gt; {currentTrack.title}
          </div>
          <div className="text-fuchsia-500 text-sm md:text-lg truncate">
            SRC: {currentTrack.artist}
          </div>
        </div>
      </div>

      <div className="w-full h-3 bg-gray-900 border border-cyan-400 relative">
        <div 
          className="h-full bg-cyan-400 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="p-1 text-cyan-400 hover:bg-cyan-400 hover:text-black border border-transparent hover:border-cyan-400 transition-none"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button 
            onClick={togglePlay}
            className="p-1 text-black bg-cyan-400 hover:bg-fuchsia-500 transition-none"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
          </button>
          <button 
            onClick={handleNext}
            className="p-1 text-cyan-400 hover:bg-cyan-400 hover:text-black border border-transparent hover:border-cyan-400 transition-none"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        
        <button 
          onClick={toggleMute}
          className="p-1 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black border border-transparent hover:border-fuchsia-500 transition-none"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
