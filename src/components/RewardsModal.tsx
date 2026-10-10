import React, { useState } from 'react';
import { MonthlyRewardTier, Quest } from '../types/game';
import { MONTHLY_REWARDS, INITIAL_QUESTS } from '../data/rewards';
import { sound } from '../utils/audio';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerXp: number;
  coins: number;
  gems: number;
  onClaimReward: (reward: MonthlyRewardTier) => void;
  onClaimQuest: (quest: Quest) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  playerXp,
  coins,
  gems,
  onClaimReward,
  onClaimQuest,
}) => {
  const [activeTab, setActiveTab] = useState<'pass' | 'quests'>('pass');
  const [rewardsList, setRewardsList] = useState<MonthlyRewardTier[]>(MONTHLY_REWARDS);
  const [questsList, setQuestsList] = useState<Quest[]>(INITIAL_QUESTS);

  if (!isOpen) return null;

  const handleClaim = (tier: MonthlyRewardTier) => {
    sound.playSuper();
    setRewardsList((prev) =>
      prev.map((r) => (r.level === tier.level ? { ...r, claimed: true } : r))
    );
    onClaimReward(tier);
  };

  const handleClaimQuestItem = (quest: Quest) => {
    sound.playSuper();
    setQuestsList((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );
    onClaimQuest(quest);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl rounded-3xl bg-[#160629] border-2 border-purple-500/50 shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#2e1065] via-[#1a0833] to-[#2e1065] border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <h2 className="text-2xl font-black text-white font-['Bungee'] tracking-wider">MONTHLY BATTLE REWARDS</h2>
              <p className="text-xs text-purple-200">Season 1: Purple & White Championship • Complete Challenges & Earn Exclusive Gear</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-[#110421] px-4 py-2 rounded-2xl border border-purple-700/60 text-xs font-bold">
              <span className="text-white">🪙 {coins.toLocaleString()}</span>
              <span className="text-purple-300">💎 {gems}</span>
              <span className="text-white">⚡ {playerXp} XP</span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-purple-950 hover:bg-purple-900 border border-purple-600 text-white flex items-center justify-center font-bold text-lg transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="p-4 bg-[#120524] border-b border-purple-800/40 flex gap-2">
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'pass'
                ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                : 'bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/40'
            }`}
          >
            <span>🏆 Monthly Season Pass</span>
          </button>
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'quests'
                ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                : 'bg-purple-950/80 text-purple-300 hover:text-white border border-purple-800/40'
            }`}
          >
            <span>📜 Combat Quests</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          {activeTab === 'pass' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {rewardsList.map((tier) => {
                const isUnlocked = playerXp >= tier.requiredXp;
                const canClaim = isUnlocked && !tier.claimed;

                return (
                  <div
                    key={tier.level}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      tier.claimed
                        ? 'bg-[#120421] border-purple-950 opacity-60'
                        : isUnlocked
                        ? 'bg-gradient-to-b from-[#2e1065] to-[#170529] border-white shadow-lg shadow-purple-500/20'
                        : 'bg-[#130524] border-purple-900/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tier.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-purple-300">LEVEL {tier.level}</div>
                          <div className="text-sm font-bold text-white mt-0.5">{tier.rewardName}</div>
                        </div>
                      </div>
                      {tier.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-white text-purple-950 font-black text-[9px] shadow-sm">
                          VIP
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-purple-800/50 flex items-center justify-between">
                      <div className="text-[11px] text-purple-300">
                        {tier.requiredXp} XP Needed
                      </div>

                      {tier.claimed ? (
                        <span className="text-xs font-bold text-white">✓ Claimed</span>
                      ) : canClaim ? (
                        <button
                          onClick={() => handleClaim(tier)}
                          className="px-4 py-1.5 rounded-xl bg-white text-purple-950 font-black text-xs hover:scale-105 active:scale-95 transition shadow-md shadow-white/30"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="text-xs text-purple-500 font-semibold">🔒 Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Quests List */
            <div className="flex flex-col gap-3">
              {questsList.map((q) => {
                const isComplete = q.progress >= q.goal || q.completed;
                const canClaim = isComplete && !q.claimed;

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-[#140526] border border-purple-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isComplete ? '✅' : '⚔️'}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{q.title}</div>
                        <div className="text-xs text-purple-300 mt-0.5">{q.description}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-white">
                          <span>+{q.rewardXp} XP</span>
                          <span>+{q.rewardCoins} Coins</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {q.claimed ? (
                        <span className="text-xs font-bold text-white">✓ Claimed</span>
                      ) : canClaim ? (
                        <button
                          onClick={() => handleClaimQuestItem(q)}
                          className="px-5 py-2 rounded-xl bg-white text-purple-950 font-black text-xs hover:scale-105 active:scale-95 transition shadow-md shadow-white/30"
                        >
                          CLAIM
                        </button>
                      ) : (
                        <span className="text-xs text-purple-400 font-medium">In Progress</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
