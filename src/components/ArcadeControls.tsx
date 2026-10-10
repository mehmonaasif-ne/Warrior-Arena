import React, { useState } from 'react';

interface ArcadeControlsProps {
  onMove: (dir: 'left' | 'right' | 'jump' | 'crouch' | 'stop') => void;
  onAction: (action: 'punch_light' | 'punch_heavy' | 'kick_light' | 'kick_heavy' | 'block' | 'unblock' | 'special' | 'super') => void;
  onEmote: () => void;
  superMeter: number;
  isBlocking: boolean;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  onMove,
  onAction,
  onEmote,
  superMeter,
  isBlocking,
}) => {
  const [activeDir, setActiveDir] = useState<string | null>(null);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  };

  const handleDirStart = (dir: 'left' | 'right' | 'jump' | 'crouch') => {
    triggerHaptic();
    setActiveDir(dir);
    onMove(dir);
  };

  const handleDirEnd = () => {
    setActiveDir(null);
    onMove('stop');
  };

  const handleAction = (act: 'punch_light' | 'punch_heavy' | 'kick_light' | 'kick_heavy' | 'special' | 'super') => {
    triggerHaptic();
    onAction(act);
  };

  return (
    <div className="w-full flex flex-col items-center justify-between pointer-events-auto px-2 pb-2">
      {/* PC Keyboard Shortcut Info Bar (White & Purple) */}
      <div className="hidden md:flex items-center justify-center gap-3 py-1 px-4 mb-1 text-xs text-purple-200 bg-[#170629]/90 backdrop-blur rounded-full border border-purple-500/30">
        <span className="text-white font-black tracking-wider">💻 KEYBOARD CONTROLS:</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">A</kbd>/<kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">D</kbd> Move</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">W</kbd> Jump</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">S</kbd> Crouch/Block</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">J</kbd> Light Punch</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">K</kbd> Heavy Punch</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">U</kbd> Light Kick</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">I</kbd> Heavy Kick</span>
        <span><kbd className="px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 rounded text-white">L</kbd> Special Blast</span>
        <span><kbd className="px-2 py-0.5 bg-white text-purple-950 font-black rounded shadow-md shadow-white/40">SPACE</kbd> SUPER MOVE</span>
      </div>

      {/* Touch & Virtual Arcade Machine Deck */}
      <div className="w-full max-w-5xl flex items-end justify-between gap-4">
        {/* Left Side: Arcade Virtual D-Pad */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#170629]/95 backdrop-blur-md rounded-2xl border border-purple-500/40 shadow-2xl shadow-purple-950/60">
            {/* Up / Jump */}
            <div className="col-start-2">
              <button
                type="button"
                onTouchStart={() => handleDirStart('jump')}
                onTouchEnd={handleDirEnd}
                onMouseDown={() => handleDirStart('jump')}
                onMouseUp={handleDirEnd}
                className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-lg border transition active:scale-95 select-none ${
                  activeDir === 'jump'
                    ? 'bg-white border-white text-purple-950 shadow-lg shadow-white/50'
                    : 'bg-purple-950/80 border-purple-700/60 text-white hover:bg-purple-900'
                }`}
              >
                ▲
              </button>
            </div>

            {/* Left */}
            <div className="col-start-1 row-start-2">
              <button
                type="button"
                onTouchStart={() => handleDirStart('left')}
                onTouchEnd={handleDirEnd}
                onMouseDown={() => handleDirStart('left')}
                onMouseUp={handleDirEnd}
                className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-lg border transition active:scale-95 select-none ${
                  activeDir === 'left'
                    ? 'bg-white border-white text-purple-950 shadow-lg shadow-white/50'
                    : 'bg-purple-950/80 border-purple-700/60 text-white hover:bg-purple-900'
                }`}
              >
                ◀
              </button>
            </div>

            {/* Center: Taunt / Emote */}
            <div className="col-start-2 row-start-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onEmote();
                }}
                className="w-13 h-13 rounded-xl flex items-center justify-center font-bold text-xs bg-purple-900/60 border border-purple-400 text-white hover:bg-purple-800 transition active:scale-95 select-none"
              >
                TAUNT
              </button>
            </div>

            {/* Right */}
            <div className="col-start-3 row-start-2">
              <button
                type="button"
                onTouchStart={() => handleDirStart('right')}
                onTouchEnd={handleDirEnd}
                onMouseDown={() => handleDirStart('right')}
                onMouseUp={handleDirEnd}
                className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-lg border transition active:scale-95 select-none ${
                  activeDir === 'right'
                    ? 'bg-white border-white text-purple-950 shadow-lg shadow-white/50'
                    : 'bg-purple-950/80 border-purple-700/60 text-white hover:bg-purple-900'
                }`}
              >
                ▶
              </button>
            </div>

            {/* Down / Crouch */}
            <div className="col-start-2 row-start-3">
              <button
                type="button"
                onTouchStart={() => handleDirStart('crouch')}
                onTouchEnd={handleDirEnd}
                onMouseDown={() => handleDirStart('crouch')}
                onMouseUp={handleDirEnd}
                className={`w-13 h-13 rounded-xl flex items-center justify-center font-bold text-lg border transition active:scale-95 select-none ${
                  activeDir === 'crouch'
                    ? 'bg-white border-white text-purple-950 shadow-lg shadow-white/50'
                    : 'bg-purple-950/80 border-purple-700/60 text-white hover:bg-purple-900'
                }`}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Center: Defensive Block Button */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onTouchStart={() => {
              triggerHaptic();
              onAction('block');
            }}
            onTouchEnd={() => onAction('unblock')}
            onMouseDown={() => {
              triggerHaptic();
              onAction('block');
            }}
            onMouseUp={() => onAction('unblock')}
            className={`px-5 py-3 rounded-2xl flex flex-col items-center justify-center font-bold text-xs uppercase tracking-wider border transition shadow-xl select-none ${
              isBlocking
                ? 'bg-white border-white text-purple-950 shadow-white/50 scale-95'
                : 'bg-[#170629]/95 border-purple-400 text-white hover:bg-purple-900'
            }`}
          >
            <span className="text-xl">🛡️</span>
            <span>SHIELD BLOCK</span>
          </button>
        </div>

        {/* Right Side: Arcade 6-Button Combat Layout (Purple & White) */}
        <div className="flex flex-col items-end">
          <div className="grid grid-cols-3 gap-2 p-2 bg-[#170629]/95 backdrop-blur-md rounded-2xl border border-purple-500/40 shadow-2xl shadow-purple-950/60">
            {/* Light Punch (J) */}
            <button
              type="button"
              onClick={() => handleAction('punch_light')}
              className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-extrabold border-2 border-purple-400 shadow-md shadow-purple-700/40 select-none"
            >
              <span className="text-base leading-none">👊</span>
              <span className="text-[10px] leading-tight font-sans">LP [J]</span>
            </button>

            {/* Heavy Punch (K) */}
            <button
              type="button"
              onClick={() => handleAction('punch_heavy')}
              className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center bg-purple-800 hover:bg-purple-700 active:scale-95 text-white font-extrabold border-2 border-purple-300 shadow-md shadow-purple-800/40 select-none"
            >
              <span className="text-base leading-none">💥</span>
              <span className="text-[10px] leading-tight font-sans">HP [K]</span>
            </button>

            {/* Special Projectile / Move (L) */}
            <button
              type="button"
              onClick={() => handleAction('special')}
              className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center bg-fuchsia-800 hover:bg-fuchsia-700 active:scale-95 text-white font-extrabold border-2 border-purple-300 shadow-md shadow-fuchsia-800/40 select-none"
            >
              <span className="text-base leading-none">🔫</span>
              <span className="text-[10px] leading-tight font-sans">SPEC [L]</span>
            </button>

            {/* Light Kick (U) */}
            <button
              type="button"
              onClick={() => handleAction('kick_light')}
              className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-extrabold border-2 border-purple-400 shadow-md shadow-purple-700/40 select-none"
            >
              <span className="text-base leading-none">🦶</span>
              <span className="text-[10px] leading-tight font-sans">LK [U]</span>
            </button>

            {/* Heavy Kick (I) */}
            <button
              type="button"
              onClick={() => handleAction('kick_heavy')}
              className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center bg-purple-800 hover:bg-purple-700 active:scale-95 text-white font-extrabold border-2 border-purple-300 shadow-md shadow-purple-800/40 select-none"
            >
              <span className="text-base leading-none">🌪️</span>
              <span className="text-[10px] leading-tight font-sans">HK [I]</span>
            </button>

            {/* Super Ultimate Move (Space - Pure Radiant White when ready!) */}
            <button
              type="button"
              onClick={() => handleAction('super')}
              disabled={superMeter < 100}
              className={`w-13 h-13 rounded-2xl flex flex-col items-center justify-center font-black border-2 transition active:scale-95 select-none ${
                superMeter >= 100
                  ? 'bg-white text-purple-950 border-purple-300 animate-pulse shadow-lg shadow-white/70'
                  : 'bg-purple-950 text-purple-400/40 border-purple-900 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-base leading-none">🌟</span>
              <span className="text-[9px] leading-tight">ULTRA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
