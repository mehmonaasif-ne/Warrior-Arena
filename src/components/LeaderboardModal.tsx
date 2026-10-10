import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { INITIAL_LEADERBOARD } from '../data/leaderboard';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerScore: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, playerScore }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'my_rank'>('global');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = INITIAL_LEADERBOARD.filter((entry) =>
    entry.playerName.toLowerCase().includes(search.toLowerCase()) ||
    entry.country.toLowerCase().includes(search.toLowerCase()) ||
    entry.fighter.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl rounded-3xl bg-[#160629] border-2 border-purple-500/50 shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (White & Purple) */}
        <div className="p-5 bg-gradient-to-r from-[#2e1065] to-[#1a0833] border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div>
              <h2 className="text-2xl font-black text-white font-['Bungee'] tracking-wider">WORLD RANKINGS</h2>
              <p className="text-xs text-purple-200">Global Street Fighter League • Updated in Real-Time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-purple-950 hover:bg-purple-900 border border-purple-600 text-white flex items-center justify-center font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 bg-[#120524] border-b border-purple-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'global'
                  ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                  : 'bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/40'
              }`}
            >
              Top World Fighters
            </button>
            <button
              onClick={() => setActiveTab('my_rank')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'my_rank'
                  ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                  : 'bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/40'
              }`}
            >
              Your Tier Status
            </button>
          </div>

          <input
            type="text"
            placeholder="Search fighter or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-xl bg-purple-950/70 border border-purple-700/60 text-xs text-white placeholder-purple-400 focus:outline-none focus:border-white"
          />
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-2.5">
          {activeTab === 'global' ? (
            <div className="flex flex-col gap-2">
              {filtered.map((item) => {
                const isGrandmaster = item.tier === 'Grandmaster';
                const isFirst = item.rank === 1;

                return (
                  <div
                    key={item.rank}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      isFirst
                        ? 'bg-gradient-to-r from-[#3b0764] to-[#20083b] border-white shadow-lg shadow-purple-500/20'
                        : isGrandmaster
                        ? 'bg-[#1e0738] border-purple-500/60'
                        : 'bg-[#130524] border-purple-900/50 hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          item.rank === 1
                            ? 'bg-white text-purple-950 shadow-md shadow-white/40'
                            : item.rank === 2
                            ? 'bg-purple-300 text-purple-950'
                            : item.rank === 3
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {item.rank === 1 ? '👑' : `#${item.rank}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.flag}</span>
                          <span className="font-bold text-white text-sm">{item.playerName}</span>
                          {item.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-purple-950 font-black">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-purple-300 flex items-center gap-2 mt-0.5">
                          <span>Fighter: {item.fighter}</span>
                          <span>•</span>
                          <span>{item.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <div className="text-xs text-purple-200">{item.wins}W - {item.losses}L</div>
                        <div className="text-[10px] text-white font-bold">Streak: {item.streak} 🔥</div>
                      </div>

                      <div className="px-3.5 py-1.5 rounded-xl bg-purple-950 border border-purple-700/60 text-right">
                        <div className="text-xs font-black text-white font-mono">{item.elo} ELO</div>
                        <div className="text-[10px] font-bold text-purple-300 uppercase">{item.tier}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Player Tier Card */
            <div className="flex flex-col gap-4 p-5 rounded-3xl bg-[#120524] border-2 border-purple-500/40">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Your Fighter Career</h3>
                  <p className="text-xs text-purple-300">Current Season Rating & League Standing</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-white text-purple-950 font-black text-xs shadow-sm">
                  Grand Champion Contender
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#1d0736] rounded-2xl border border-purple-800 text-center">
                  <div className="text-xs text-purple-300">Current Elo</div>
                  <div className="text-2xl font-black text-white mt-1">{1800 + playerScore * 50}</div>
                </div>
                <div className="p-3 bg-[#1d0736] rounded-2xl border border-purple-800 text-center">
                  <div className="text-xs text-purple-300">Arena K.O.s</div>
                  <div className="text-2xl font-black text-white mt-1">{playerScore}</div>
                </div>
                <div className="p-3 bg-[#1d0736] rounded-2xl border border-purple-800 text-center">
                  <div className="text-xs text-purple-300">Global Rank</div>
                  <div className="text-2xl font-black text-white mt-1">#48</div>
                </div>
                <div className="p-3 bg-[#1d0736] rounded-2xl border border-purple-800 text-center">
                  <div className="text-xs text-purple-300">Win Rate</div>
                  <div className="text-2xl font-black text-white mt-1">82%</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#19062e] border border-purple-800/60">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-purple-200 font-bold">Road to Grandmaster Tier</span>
                  <span className="text-white font-bold">Next Promotion: 2,000 ELO</span>
                </div>
                <div className="w-full bg-purple-950 h-3 rounded-full overflow-hidden border border-purple-800">
                  <div className="bg-white h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
