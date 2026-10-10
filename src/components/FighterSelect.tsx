import React, { useState } from 'react';
import { FighterData } from '../types/game';
import { FIGHTERS, STAGES } from '../data/fighters';
import { sound } from '../utils/audio';

interface FighterSelectProps {
  onStartFight: (
    playerFighter: FighterData,
    opponentFighter: FighterData,
    stage: typeof STAGES[0],
    pOutfitIdx: number,
    pWeaponIdx: number,
    mode: 'arcade' | 'ranked' | 'training'
  ) => void;
  coins: number;
}

export const FighterSelect: React.FC<FighterSelectProps> = ({ onStartFight, coins }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('mehmona');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('zara');
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [outfitIndex, setOutfitIndex] = useState<number>(0);
  const [weaponIndex, setWeaponIndex] = useState<number>(0);
  const [gameMode, setGameMode] = useState<'arcade' | 'ranked' | 'training'>('arcade');

  const pFighter = FIGHTERS.find((f) => f.id === selectedPlayerId) || FIGHTERS[0];
  const oFighter = FIGHTERS.find((f) => f.id === selectedOpponentId) || FIGHTERS[1];
  const currentStage = STAGES[selectedStageIdx % STAGES.length];

  const handleSelectPlayer = (fighter: FighterData) => {
    sound.playHitLight();
    setSelectedPlayerId(fighter.id);
    setOutfitIndex(0);
    setWeaponIndex(0);
  };

  const handleSelectOpponent = (fighter: FighterData) => {
    sound.playHitLight();
    setSelectedOpponentId(fighter.id);
  };

  const handleStartGame = () => {
    sound.announce(`WARRIOR ARENA! ${pFighter.name} VERSUS ${oFighter.name}! ROUND 1... FIGHT!`);
    sound.playSpecial();
    onStartFight(pFighter, oFighter, currentStage, outfitIndex, weaponIndex, gameMode);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col gap-6 text-white animate-fadeIn">
      {/* Header Banner (Luxury White & Purple) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#2e1065] via-[#1a0833] to-[#2e1065] border-2 border-purple-500/40 shadow-2xl shadow-purple-950/70">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white text-purple-950 flex items-center justify-center text-3xl shadow-lg shadow-white/30 font-black">
            👑
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white font-['Bungee'] drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]">
              WARRIOR ARENA
            </h1>
            <p className="text-xs font-semibold text-purple-200 tracking-widest uppercase mt-0.5">
              Championship Street Fighting • Created by <span className="text-white font-bold underline decoration-purple-400">Mehmona Jabeen</span>
            </p>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-2 bg-[#120524] p-1.5 rounded-2xl border border-purple-500/40">
          {(['arcade', 'ranked', 'training'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playHitLight();
                setGameMode(m);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                gameMode === m
                  ? 'bg-white text-purple-950 shadow-md shadow-white/30'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/50'
              }`}
            >
              {m === 'arcade' ? 'Story Arcade' : m === 'ranked' ? 'Ranked Arena' : 'Training Dojo'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player Roster & Customization */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <span>SELECT YOUR WARRIOR</span>
              <span className="text-xs font-normal text-purple-300">(Female & Male Fighters Available)</span>
            </h2>
            <span className="text-xs px-3 py-1 bg-purple-950/80 text-white rounded-xl border border-purple-500/40 font-bold">
              🪙 Balance: {coins.toLocaleString()} Coins
            </span>
          </div>

          {/* Fighter Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FIGHTERS.map((f) => {
              const isSelected = f.id === selectedPlayerId;
              const isGrandmaster = f.isChampionBoss;

              return (
                <button
                  key={f.id}
                  onClick={() => handleSelectPlayer(f)}
                  className={`relative p-3.5 rounded-2xl flex flex-col items-center text-left transition-all overflow-hidden border-2 group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#3b0764] to-[#1a0530] border-white shadow-xl shadow-purple-500/30 scale-102'
                      : 'bg-[#150626]/90 border-purple-900/60 hover:border-purple-500 hover:bg-[#20083b]'
                  }`}
                >
                  {isGrandmaster && (
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white text-[9px] font-black text-purple-950 tracking-wider shadow-sm">
                      CHAMPION
                    </div>
                  )}

                  <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-3xl mb-2 group-hover:scale-110 transition shadow-inner">
                    {f.avatar}
                  </div>

                  <div className="w-full text-center">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <span>{f.flag}</span>
                      <span className="truncate">{f.name}</span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-medium truncate mt-0.5">{f.title}</div>
                    <div className="text-[10px] text-purple-400 capitalize mt-0.5">{f.gender} Fighter</div>
                  </div>

                  {/* Stat Progress Bars Preview */}
                  <div className="w-full mt-2 pt-2 border-t border-purple-800/40 flex flex-col gap-1 text-[10px] text-purple-200">
                    <div className="flex justify-between font-bold">
                      <span>POWER</span>
                      <span className="text-white">{f.stats.attack}</span>
                    </div>
                    <div className="w-full bg-purple-950 h-1.5 rounded-full overflow-hidden border border-purple-800/40">
                      <div className="bg-white h-full rounded-full" style={{ width: `${f.stats.attack}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Fighter Customization: Outfits & Weapons */}
          <div className="p-4 rounded-3xl bg-[#160629]/95 border-2 border-purple-500/30 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>WARRIOR CUSTOMIZATION</span>
                <span className="text-xs text-purple-300">({pFighter.name})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Outfits Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-purple-200">🥋 Select Outfit / Armor:</span>
                <div className="flex flex-wrap gap-2">
                  {pFighter.outfits.map((outfit, idx) => (
                    <button
                      key={outfit.id}
                      onClick={() => {
                        sound.playHitLight();
                        setOutfitIndex(idx);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition ${
                        outfitIndex === idx
                          ? 'bg-white text-purple-950 border-white shadow-md shadow-white/30 font-bold'
                          : 'bg-purple-950/70 border-purple-800 text-purple-200 hover:bg-purple-900'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-purple-900"
                        style={{ backgroundColor: outfit.colorScheme.primary }}
                      />
                      <span>{outfit.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weapons / Guns Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-purple-200">🔫 Equipped Weapon / Gear:</span>
                <div className="flex flex-wrap gap-2">
                  {pFighter.weapons.map((w, idx) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        sound.playHitLight();
                        setWeaponIndex(idx);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition ${
                        weaponIndex === idx
                          ? 'bg-purple-700 border-white text-white shadow-md shadow-purple-600/40 font-bold'
                          : 'bg-purple-950/70 border-purple-800 text-purple-200 hover:bg-purple-900'
                      }`}
                    >
                      <span className="text-base">{w.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{w.name}</div>
                        <div className="text-[10px] text-purple-300 font-bold">{w.bonus}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Battle Emotes Preview */}
            <div className="flex items-center gap-3 pt-2 border-t border-purple-800/40">
              <span className="text-xs text-purple-300 font-semibold">Emotes:</span>
              <div className="flex gap-2">
                {pFighter.emotes.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => sound.announce(`${pFighter.name} taunts: ${e.text}`)}
                    className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 rounded-xl text-xs border border-purple-700 text-white flex items-center gap-1.5 transition active:scale-95"
                    title={e.text}
                  >
                    <span>{e.icon}</span>
                    <span className="text-purple-200">{e.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Opponent Select & Stage Preview */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Opponent Selector */}
          <div className="p-4 rounded-3xl bg-[#160629]/95 border-2 border-purple-500/30 flex flex-col gap-3 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              <span>CHOOSE OPPONENT</span>
              <span className="text-xs text-purple-300">{oFighter.name}</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {FIGHTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectOpponent(f)}
                  className={`p-2 rounded-xl flex flex-col items-center text-center border transition ${
                    f.id === selectedOpponentId
                      ? 'bg-white border-white text-purple-950 shadow-md shadow-white/30 font-bold'
                      : 'bg-purple-950/80 border-purple-800 text-purple-200 hover:bg-purple-900'
                  }`}
                >
                  <span className="text-2xl">{f.avatar}</span>
                  <span className="text-[11px] font-bold truncate w-full mt-1">{f.name}</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-[#0e031c] border border-purple-800/50 text-xs text-purple-200">
              <p className="italic font-medium text-white">"{oFighter.signatureQuote}"</p>
              <div className="mt-2 text-[11px] text-purple-400 flex justify-between">
                <span>Style: {oFighter.title}</span>
                <span>{oFighter.flag} {oFighter.country}</span>
              </div>
            </div>
          </div>

          {/* Stage Selector */}
          <div className="p-4 rounded-3xl bg-[#160629]/95 border-2 border-purple-500/30 flex flex-col gap-3 shadow-xl">
            <h3 className="font-bold text-sm text-white">SELECT FIGHTING ARENA</h3>
            <div className="flex flex-col gap-2">
              {STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playHitLight();
                    setSelectedStageIdx(idx);
                  }}
                  className={`p-2.5 rounded-2xl text-left border flex items-center justify-between transition ${
                    selectedStageIdx === idx
                      ? 'bg-purple-700 border-white text-white shadow-md shadow-purple-600/30 font-bold'
                      : 'bg-purple-950/80 border-purple-800 text-purple-300 hover:bg-purple-900'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{s.name}</div>
                    <div className="text-[10px] text-purple-300">{s.subtitle}</div>
                  </div>
                  <span className="text-white text-sm">🏟️</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start Fight Action Button (Pure White & Purple) */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-3xl font-black text-xl text-purple-950 uppercase tracking-widest bg-white hover:bg-purple-100 active:scale-98 transition shadow-2xl shadow-white/40 border-2 border-purple-300 cursor-pointer flex items-center justify-center gap-3 font-['Bungee']"
          >
            <span>ENTER THE ARENA</span>
            <span className="text-2xl">⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
