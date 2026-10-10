import React from 'react';

interface LiveCommentaryBannerProps {
  commentary: string;
  tactics: string | null;
  onAskTactics: () => void;
  loadingTactics: boolean;
}

export const LiveCommentaryBanner: React.FC<LiveCommentaryBannerProps> = ({
  commentary,
  tactics,
  onAskTactics,
  loadingTactics,
}) => {
  return (
    <div className="w-full max-w-4xl px-3.5 py-2 rounded-2xl bg-[#170629]/95 backdrop-blur-md border border-purple-500/40 shadow-xl shadow-purple-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 overflow-hidden flex-1">
        <span className="px-2.5 py-0.5 rounded-full bg-white text-purple-950 font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shrink-0 shadow-sm animate-pulse">
          <span>●</span>
          <span>LIVE ANNOUNCER</span>
        </span>
        <p className="text-white font-bold tracking-wide truncate">
          "{commentary || 'The crowd roars as both champions square off in the arena!'}"
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onAskTactics}
          disabled={loadingTactics}
          className="px-3 py-1 rounded-xl bg-purple-900 hover:bg-purple-800 text-white border border-purple-400 font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
        >
          <span>🧠</span>
          <span>{loadingTactics ? 'ANALYZING...' : 'AI SENSEI TACTICS'}</span>
        </button>
      </div>

      {tactics && (
        <div className="w-full mt-1.5 pt-1.5 border-t border-purple-800/40 text-[11px] text-purple-200 italic flex items-center gap-2">
          <span className="font-bold text-white not-italic">Sensei Tip:</span>
          <span>{tactics}</span>
        </div>
      )}
    </div>
  );
};
