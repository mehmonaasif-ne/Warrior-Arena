/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  FighterData,
  CombatEntity,
  Projectile,
  Particle,
  MonthlyRewardTier,
  Quest,
} from './types/game';
import { FIGHTERS, STAGES } from './data/fighters';
import { FightCanvas } from './components/FightCanvas';
import { ArcadeControls } from './components/ArcadeControls';
import { FighterSelect } from './components/FighterSelect';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RewardsModal } from './components/RewardsModal';
import { VoiceChatModal } from './components/VoiceChatModal';
import { PlayStoreInstallModal } from './components/PlayStoreInstallModal';
import { LiveCommentaryBanner } from './components/LiveCommentaryBanner';
import { sound } from './utils/audio';

type GameScreen = 'select' | 'fight' | 'gameover';

export default function App() {
  // Navigation & Modals
  const [screen, setScreen] = useState<GameScreen>('select');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // User Currencies & Progression
  const [coins, setCoins] = useState<number>(2400);
  const [gems, setGems] = useState<number>(120);
  const [playerXp, setPlayerXp] = useState<number>(650);
  const [koWins, setKoWins] = useState<number>(7);

  // Selected Fighters & Match Details
  const [playerFighter, setPlayerFighter] = useState<FighterData>(FIGHTERS[0]);
  const [opponentFighter, setOpponentFighter] = useState<FighterData>(FIGHTERS[1]);
  const [currentStage, setCurrentStage] = useState(STAGES[0]);
  const [playerOutfitIdx, setPlayerOutfitIdx] = useState(0);
  const [playerWeaponIdx, setPlayerWeaponIdx] = useState(0);
  const [matchMode, setMatchMode] = useState<'arcade' | 'ranked' | 'training'>('arcade');

  // Audio BGM State
  const [bgmActive, setBgmActive] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Match AI Commentary & Tactics
  const [commentaryText, setCommentaryText] = useState<string>('Arena roaring! The battle has begun!');
  const [tacticsText, setTacticsText] = useState<string | null>(null);
  const [loadingTactics, setLoadingTactics] = useState<boolean>(false);

  // Fight Match State
  const [matchTimer, setMatchTimer] = useState<number>(99);
  const [matchWinner, setMatchWinner] = useState<'player' | 'opponent' | 'time' | null>(null);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [slowMo, setSlowMo] = useState<boolean>(false);

  // Fighter Entities
  const [player, setPlayer] = useState<CombatEntity>({
    id: 'p1',
    fighterId: FIGHTERS[0].id,
    name: FIGHTERS[0].name,
    isPlayer: true,
    x: 200,
    y: 350,
    vx: 0,
    vy: 0,
    width: 60,
    height: 110,
    facing: 1,
    hp: 100,
    maxHp: 100,
    superMeter: 40,
    state: 'idle',
    stateTimer: 0,
    isGrounded: true,
    isBlocking: false,
    comboCount: 0,
    comboTimer: 0,
    invulnerableFrames: 0,
    activeOutfitIndex: 0,
    activeWeaponIndex: 0,
    kills: 0,
  });

  const [opponent, setOpponent] = useState<CombatEntity>({
    id: 'p2',
    fighterId: FIGHTERS[1].id,
    name: FIGHTERS[1].name,
    isPlayer: false,
    x: 650,
    y: 350,
    vx: 0,
    vy: 0,
    width: 60,
    height: 110,
    facing: -1,
    hp: 100,
    maxHp: 100,
    superMeter: 25,
    state: 'idle',
    stateTimer: 0,
    isGrounded: true,
    isBlocking: false,
    comboCount: 0,
    comboTimer: 0,
    invulnerableFrames: 0,
    activeOutfitIndex: 0,
    activeWeaponIndex: 0,
    kills: 0,
  });

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Sound Mute Toggle
  const toggleSound = () => {
    sound.isMuted = !sound.isMuted;
    setSoundMuted(sound.isMuted);
  };

  const toggleBgmMusic = () => {
    const isPlaying = sound.toggleBgm();
    setBgmActive(isPlaying);
  };

  // Launch Fight Match
  const handleStartFight = (
    selectedPlayer: FighterData,
    selectedOpponent: FighterData,
    stage: typeof STAGES[0],
    pOutfit: number,
    pWeapon: number,
    mode: 'arcade' | 'ranked' | 'training'
  ) => {
    setPlayerFighter(selectedPlayer);
    setOpponentFighter(selectedOpponent);
    setCurrentStage(stage);
    setPlayerOutfitIdx(pOutfit);
    setPlayerWeaponIdx(pWeapon);
    setMatchMode(mode);

    setPlayer({
      id: 'p1',
      fighterId: selectedPlayer.id,
      name: selectedPlayer.name,
      isPlayer: true,
      x: 220,
      y: 340,
      vx: 0,
      vy: 0,
      width: 60,
      height: 110,
      facing: 1,
      hp: 100,
      maxHp: 100,
      superMeter: 35,
      state: 'idle',
      stateTimer: 0,
      isGrounded: true,
      isBlocking: false,
      comboCount: 0,
      comboTimer: 0,
      invulnerableFrames: 0,
      activeOutfitIndex: pOutfit,
      activeWeaponIndex: pWeapon,
      kills: 0,
    });

    setOpponent({
      id: 'p2',
      fighterId: selectedOpponent.id,
      name: selectedOpponent.name,
      isPlayer: false,
      x: 680,
      y: 340,
      vx: 0,
      vy: 0,
      width: 60,
      height: 110,
      facing: -1,
      hp: 100,
      maxHp: 100,
      superMeter: 20,
      state: 'idle',
      stateTimer: 0,
      isGrounded: true,
      isBlocking: false,
      comboCount: 0,
      comboTimer: 0,
      invulnerableFrames: 0,
      activeOutfitIndex: 0,
      activeWeaponIndex: 0,
      kills: 0,
    });

    setProjectiles([]);
    setParticles([]);
    setMatchTimer(99);
    setMatchWinner(null);
    setSlowMo(false);
    setCommentaryText(`Round 1! ${selectedPlayer.name} squares off against ${selectedOpponent.name}!`);
    setTacticsText(null);
    setScreen('fight');

    if (!bgmActive) {
      sound.startBgm();
      setBgmActive(true);
    }
  };

  // Add floating particle effect (Sparks, Hit numbers, Shockwaves)
  const spawnHitVFX = useCallback((x: number, y: number, damage: number, isSuper: boolean = false) => {
    const newParticles: Particle[] = [];

    // Floating damage text
    newParticles.push({
      id: Math.random().toString(),
      x,
      y: y - 20,
      vx: (Math.random() - 0.5) * 2,
      vy: -3,
      color: '#ffffff',
      size: 24,
      life: 30,
      maxLife: 30,
      type: 'text',
      text: `${damage} DMG!`,
    });

    // Sparks (White & Purple)
    for (let i = 0; i < (isSuper ? 16 : 8); i++) {
      newParticles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: Math.random() > 0.5 ? '#ffffff' : '#c084fc',
        size: Math.random() * 5 + 3,
        life: 20,
        maxLife: 20,
        type: 'spark',
      });
    }

    // Shockwave ring
    newParticles.push({
      id: Math.random().toString(),
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#ffffff',
      size: isSuper ? 60 : 35,
      life: 15,
      maxLife: 15,
      type: 'shockwave',
    });

    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  // Request Gemini API Live Commentary
  const fetchLiveCommentary = useCallback(
    async (eventType: string, combo: number) => {
      try {
        const res = await fetch('/api/commentary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player1: playerFighter.name,
            player2: opponentFighter.name,
            eventType,
            comboCount: combo,
            p1Hp: Math.round(player.hp),
            p2Hp: Math.round(opponent.hp),
            stage: currentStage.name,
          }),
        });
        const data = await res.json();
        if (data.commentary) {
          setCommentaryText(data.commentary);
          sound.announce(data.commentary);
        }
      } catch (err) {
        // Fallback
      }
    },
    [playerFighter.name, opponentFighter.name, currentStage.name, player.hp, opponent.hp]
  );

  // Request AI Sensei Tactics
  const handleAskTactics = async () => {
    if (loadingTactics) return;
    setLoadingTactics(true);
    try {
      const res = await fetch('/api/tactics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fighter: playerFighter.name,
          opponent: opponentFighter.name,
        }),
      });
      const data = await res.json();
      if (data.tactics) {
        setTacticsText(data.tactics);
        sound.announce(data.tactics);
      }
    } catch (e) {
      setTacticsText(`Counter ${opponentFighter.name}'s special move by blocking, then launch your Rising Uppercut!`);
    } finally {
      setLoadingTactics(false);
    }
  };

  // Perform Player Attack Actions
  const handlePlayerAction = useCallback(
    (act: 'punch_light' | 'punch_heavy' | 'kick_light' | 'kick_heavy' | 'block' | 'unblock' | 'special' | 'super') => {
      if (matchWinner || player.hp <= 0) return;

      if (act === 'block') {
        sound.playBlock();
        setPlayer((prev) => ({ ...prev, isBlocking: true, state: 'block' }));
        return;
      }

      if (act === 'unblock') {
        setPlayer((prev) => ({ ...prev, isBlocking: false, state: 'idle' }));
        return;
      }

      // Special Projectile / Blast
      if (act === 'special') {
        sound.playProjectile();
        setPlayer((prev) => ({
          ...prev,
          state: 'special_projectile',
          stateTimer: 18,
          superMeter: Math.min(100, prev.superMeter + 10),
        }));

        // Fire Projectile
        const projX = player.x + (player.facing === 1 ? player.width + 10 : -20);
        const newProj: Projectile = {
          id: Math.random().toString(),
          ownerId: 'p1',
          x: projX,
          y: player.y + 40,
          vx: player.facing * 9,
          radius: 12,
          damage: 22,
          color: '#ffffff',
          glowColor: '#c084fc',
          type: 'plasma_bullet',
        };
        setProjectiles((prev) => [...prev, newProj]);
        return;
      }

      // Super Ultimate Move
      if (act === 'super') {
        if (player.superMeter < 100) return;
        sound.playSuper();
        sound.announce(`${playerFighter.name.toUpperCase()}! SUPER MOVE ACTIVATION!`);
        setScreenShake(8);
        setPlayer((prev) => ({
          ...prev,
          state: 'super_move',
          stateTimer: 35,
          superMeter: 0,
        }));

        // Check if opponent is caught in range
        const dist = Math.abs((player.x + player.width / 2) - (opponent.x + opponent.width / 2));
        if (dist < 260) {
          const dmg = 45;
          sound.playHitHeavy();
          spawnHitVFX(opponent.x + opponent.width / 2, opponent.y + 40, dmg, true);
          setOpponent((prev) => {
            const nextHp = Math.max(0, prev.hp - dmg);
            return {
              ...prev,
              hp: nextHp,
              state: 'hit_stun',
              stateTimer: 25,
              vx: player.facing * 12,
            };
          });
          fetchLiveCommentary('SUPER ULTIMATE MOVE HIT', 5);
        }
        return;
      }

      // Regular Strikes (Punch / Kick)
      let baseDamage = 10;
      let soundFn = () => sound.playHitLight();

      if (act === 'punch_light') {
        baseDamage = 12;
        soundFn = () => sound.playHitLight();
      } else if (act === 'punch_heavy') {
        baseDamage = 22;
        soundFn = () => sound.playHitHeavy();
      } else if (act === 'kick_light') {
        baseDamage = 14;
        soundFn = () => sound.playHitLight();
      } else if (act === 'kick_heavy') {
        baseDamage = 24;
        soundFn = () => sound.playHitHeavy();
      }

      soundFn();
      setPlayer((prev) => ({
        ...prev,
        state: act,
        stateTimer: 14,
        superMeter: Math.min(100, prev.superMeter + 6),
      }));

      // Check melee collision with opponent
      const pCenterX = player.x + player.width / 2;
      const oCenterX = opponent.x + opponent.width / 2;
      const distance = Math.abs(pCenterX - oCenterX);
      const isFacingOpponent = (player.facing === 1 && oCenterX > pCenterX) || (player.facing === -1 && oCenterX < pCenterX);

      if (distance < 110 && isFacingOpponent) {
        let finalDmg = baseDamage;
        if (opponent.isBlocking) {
          finalDmg = Math.round(baseDamage * 0.2);
          sound.playBlock();
        } else {
          sound.playHitHeavy();
          setScreenShake(3);
        }

        spawnHitVFX(opponent.x + opponent.width / 2, opponent.y + 40, finalDmg);

        setOpponent((prev) => {
          const nextHp = Math.max(0, prev.hp - finalDmg);
          return {
            ...prev,
            hp: nextHp,
            state: prev.isBlocking ? 'block' : 'hit_stun',
            stateTimer: 12,
            vx: player.facing * (prev.isBlocking ? 3 : 6),
            superMeter: Math.min(100, prev.superMeter + 4),
          };
        });

        // Combo Counter update
        setPlayer((prev) => {
          const nextCombo = prev.comboCount + 1;
          if (nextCombo >= 3) {
            sound.announce(`${nextCombo} HITS COMBO!`);
          }
          return { ...prev, comboCount: nextCombo, comboTimer: 60 };
        });

        if (Math.random() < 0.3) {
          fetchLiveCommentary('COMBO STRIKE', player.comboCount + 1);
        }
      }
    },
    [matchWinner, player, opponent, playerFighter.name, spawnHitVFX, fetchLiveCommentary]
  );

  // Player Movement Controls
  const handlePlayerMove = useCallback(
    (dir: 'left' | 'right' | 'jump' | 'crouch' | 'stop') => {
      if (matchWinner || player.hp <= 0) return;

      if (dir === 'left') {
        setPlayer((prev) => ({
          ...prev,
          vx: -5,
          facing: -1,
          state: prev.isGrounded ? 'walk_back' : prev.state,
        }));
      } else if (dir === 'right') {
        setPlayer((prev) => ({
          ...prev,
          vx: 5,
          facing: 1,
          state: prev.isGrounded ? 'walk_fwd' : prev.state,
        }));
      } else if (dir === 'jump') {
        if (player.isGrounded) {
          sound.playHitLight();
          setPlayer((prev) => ({
            ...prev,
            vy: -13,
            isGrounded: false,
            state: 'jump',
          }));
        }
      } else if (dir === 'crouch') {
        setPlayer((prev) => ({
          ...prev,
          vx: 0,
          state: 'crouch',
        }));
      } else if (dir === 'stop') {
        setPlayer((prev) => ({
          ...prev,
          vx: 0,
          state: prev.isGrounded ? 'idle' : prev.state,
        }));
      }
    },
    [matchWinner, player.hp, player.isGrounded]
  );

  // Keyboard Event Handlers for PC / Laptop gamers
  useEffect(() => {
    if (screen !== 'fight') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.code) {
        case 'KeyA':
          handlePlayerMove('left');
          break;
        case 'KeyD':
          handlePlayerMove('right');
          break;
        case 'KeyW':
          handlePlayerMove('jump');
          break;
        case 'KeyS':
          handlePlayerAction('block');
          break;
        case 'KeyJ':
          handlePlayerAction('punch_light');
          break;
        case 'KeyK':
          handlePlayerAction('punch_heavy');
          break;
        case 'KeyU':
          handlePlayerAction('kick_light');
          break;
        case 'KeyI':
          handlePlayerAction('kick_heavy');
          break;
        case 'KeyL':
          handlePlayerAction('special');
          break;
        case 'Space':
          e.preventDefault();
          handlePlayerAction('super');
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'KeyD') {
        handlePlayerMove('stop');
      }
      if (e.code === 'KeyS') {
        handlePlayerAction('unblock');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, handlePlayerMove, handlePlayerAction]);

  // Voice Command Trigger
  const handleVoiceCommand = useCallback(
    (cmd: string) => {
      if (cmd === 'punch') handlePlayerAction('punch_light');
      if (cmd === 'kick') handlePlayerAction('kick_heavy');
      if (cmd === 'special') handlePlayerAction('special');
      if (cmd === 'block') handlePlayerAction('block');
      if (cmd === 'super') handlePlayerAction('super');
    },
    [handlePlayerAction]
  );

  // Match 99-second countdown timer
  useEffect(() => {
    if (screen !== 'fight' || matchWinner) return;

    const timer = setInterval(() => {
      setMatchTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Time out winner calculation
          if (player.hp > opponent.hp) {
            setMatchWinner('player');
            sound.playKo();
          } else {
            setMatchWinner('opponent');
            sound.announce('TIME OVER! VICTORY TO OPPONENT!');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, matchWinner, player.hp, opponent.hp]);

  // Main 60 FPS Game Physics & AI Opponent Engine Loop
  useEffect(() => {
    if (screen !== 'fight') return;

    let animId: number;

    const gameLoop = () => {
      // 1. Shake reduction
      setScreenShake((prev) => Math.max(0, prev - 0.4));

      // 2. Update Player Entity
      setPlayer((prev) => {
        let x = prev.x + prev.vx;
        let y = prev.y + prev.vy;
        let vy = prev.vy;
        let isGrounded = prev.isGrounded;

        // Gravity
        if (!isGrounded) {
          vy += 0.8;
          if (y >= 340) {
            y = 340;
            vy = 0;
            isGrounded = true;
          }
        }

        // Arena Boundaries
        x = Math.max(40, Math.min(860, x));

        // State timer count
        let stateTimer = prev.stateTimer > 0 ? prev.stateTimer - 1 : 0;
        let state = prev.state;
        if (stateTimer === 0 && state !== 'idle' && state !== 'crouch' && state !== 'block') {
          state = isGrounded ? 'idle' : 'jump';
        }

        // Combo timer
        let comboCount = prev.comboCount;
        let comboTimer = prev.comboTimer > 0 ? prev.comboTimer - 1 : 0;
        if (comboTimer === 0) comboCount = 0;

        return {
          ...prev,
          x,
          y,
          vy,
          isGrounded,
          state,
          stateTimer,
          comboCount,
          comboTimer,
        };
      });

      // 3. Update AI Opponent Logic
      setOpponent((prev) => {
        if (prev.hp <= 0) return prev;

        let x = prev.x + prev.vx;
        let y = prev.y + prev.vy;
        let vy = prev.vy;
        let isGrounded = prev.isGrounded;

        // Gravity
        if (!isGrounded) {
          vy += 0.8;
          if (y >= 340) {
            y = 340;
            vy = 0;
            isGrounded = true;
          }
        }
        x = Math.max(40, Math.min(860, x));

        let stateTimer = prev.stateTimer > 0 ? prev.stateTimer - 1 : 0;
        let state = prev.state;
        if (stateTimer === 0 && state !== 'idle') {
          state = 'idle';
        }

        // AI Decision Tree
        const pCenterX = player.x + player.width / 2;
        const oCenterX = x + prev.width / 2;
        const distance = Math.abs(oCenterX - pCenterX);
        const facing: 1 | -1 = pCenterX > oCenterX ? 1 : -1;

        let vx = prev.vx;

        if (stateTimer === 0 && !matchWinner) {
          const aiRoll = Math.random();

          // Distance-based actions
          if (distance > 240) {
            if (aiRoll < 0.03 && prev.superMeter >= 100) {
              sound.playSuper();
              state = 'super_move';
              stateTimer = 35;
              vx = 0;
            } else if (aiRoll < 0.08) {
              sound.playProjectile();
              state = 'special_projectile';
              stateTimer = 16;
              vx = 0;
              setProjectiles((pList) => [
                ...pList,
                {
                  id: Math.random().toString(),
                  ownerId: 'p2',
                  x: x + (facing === 1 ? prev.width + 10 : -20),
                  y: y + 40,
                  vx: facing * 8,
                  radius: 12,
                  damage: 18,
                  color: '#ffffff',
                  glowColor: '#a855f7',
                  type: 'plasma_bullet',
                },
              ]);
            } else {
              vx = facing * 3.5;
              state = 'walk_fwd';
            }
          } else if (distance < 110) {
            vx = 0;
            if (player.state.includes('punch') || player.state.includes('kick')) {
              if (aiRoll < 0.5) {
                state = 'block';
                stateTimer = 18;
              } else {
                state = 'punch_heavy';
                stateTimer = 14;
                sound.playHitHeavy();
              }
            } else if (aiRoll < 0.4) {
              state = 'punch_light';
              stateTimer = 12;
              sound.playHitLight();

              setPlayer((p) => {
                const dmg = p.isBlocking ? 3 : 10;
                if (!p.isBlocking) spawnHitVFX(p.x + p.width / 2, p.y + 40, dmg);
                return { ...p, hp: Math.max(0, p.hp - dmg) };
              });
            } else if (aiRoll < 0.7) {
              state = 'kick_heavy';
              stateTimer = 16;
              sound.playHitHeavy();
              setPlayer((p) => {
                const dmg = p.isBlocking ? 5 : 18;
                if (!p.isBlocking) spawnHitVFX(p.x + p.width / 2, p.y + 40, dmg);
                return { ...p, hp: Math.max(0, p.hp - dmg) };
              });
            }
          } else {
            vx = facing * 2;
          }
        }

        return {
          ...prev,
          x,
          y,
          vx,
          vy,
          facing,
          state,
          stateTimer,
          isGrounded,
        };
      });

      // 4. Update Projectiles & Check Collisions
      setProjectiles((prevList) => {
        const nextList: Projectile[] = [];

        prevList.forEach((proj) => {
          const nextX = proj.x + proj.vx;

          if (nextX < 0 || nextX > 960) return;

          // Collision with Player 1
          if (proj.ownerId === 'p2') {
            const hit =
              nextX > player.x &&
              nextX < player.x + player.width &&
              proj.y > player.y &&
              proj.y < player.y + player.height;

            if (hit) {
              const dmg = player.isBlocking ? 4 : proj.damage;
              sound.playHitHeavy();
              spawnHitVFX(player.x + player.width / 2, proj.y, dmg);
              setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - dmg) }));
              return;
            }
          }

          // Collision with Opponent
          if (proj.ownerId === 'p1') {
            const hit =
              nextX > opponent.x &&
              nextX < opponent.x + opponent.width &&
              proj.y > opponent.y &&
              proj.y < opponent.y + opponent.height;

            if (hit) {
              const dmg = opponent.isBlocking ? 5 : proj.damage;
              sound.playHitHeavy();
              spawnHitVFX(opponent.x + opponent.width / 2, proj.y, dmg);
              setOpponent((o) => ({
                ...o,
                hp: Math.max(0, o.hp - dmg),
                state: 'hit_stun',
                stateTimer: 12,
              }));
              return;
            }
          }

          nextList.push({ ...proj, x: nextX });
        });

        return nextList;
      });

      // 5. Update Particle VFX
      setParticles((prevList) =>
        prevList
          .map((pt) => ({
            ...pt,
            x: pt.x + pt.vx,
            y: pt.y + pt.vy,
            life: pt.life - 1,
          }))
          .filter((pt) => pt.life > 0)
      );

      // 6. Check Match K.O. Conditions
      if (!matchWinner) {
        if (player.hp <= 0) {
          setMatchWinner('opponent');
          setSlowMo(true);
          sound.playKo();
          sound.announce('KNOCKOUT! OPPONENT WINS THE BOUT!');
        } else if (opponent.hp <= 0) {
          setMatchWinner('player');
          setSlowMo(true);
          sound.playKo();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#a855f7', '#d8b4fe', '#7e22ce'],
          });
          setKoWins((k) => k + 1);
          setCoins((c) => c + 350);
          setPlayerXp((xp) => xp + 200);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [screen, matchWinner, player, opponent, spawnHitVFX]);

  // Claim Reward Tier
  const handleClaimReward = (tier: MonthlyRewardTier) => {
    if (tier.rewardType === 'coins' && tier.amount) {
      setCoins((c) => c + tier.amount!);
    } else if (tier.rewardType === 'gems' && tier.amount) {
      setGems((g) => g + tier.amount!);
    }
    sound.announce(`Reward unlocked: ${tier.rewardName}!`);
  };

  // Claim Quest Reward
  const handleClaimQuest = (quest: Quest) => {
    setPlayerXp((xp) => xp + quest.rewardXp);
    setCoins((c) => c + quest.rewardCoins);
    sound.announce(`Quest complete: ${quest.title}!`);
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-[#0b0314] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      {/* 1. Global Navigation Bar (Luxury Purple & White) */}
      <header className="w-full px-4 py-2.5 bg-[#170629]/95 backdrop-blur-md border-b-2 border-purple-500/30 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('select')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-white text-purple-950 flex items-center justify-center text-xl shadow-lg shadow-white/30 group-hover:scale-105 transition font-black">
              👑
            </div>
            <div>
              <div className="text-xl font-black tracking-wider text-white font-['Bungee'] leading-none drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                WARRIOR ARENA
              </div>
              <div className="text-[10px] text-purple-300 font-bold tracking-widest uppercase mt-0.5">
                BY MEHMONA JABEEN
              </div>
            </div>
          </button>
        </div>

        {/* Action Header Nav Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio Controls */}
          <button
            onClick={toggleBgmMusic}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              bgmActive
                ? 'bg-white text-purple-950 border-white shadow-sm'
                : 'bg-purple-950 border-purple-800 text-purple-300'
            }`}
            title="Toggle Arcade BGM Music"
          >
            {bgmActive ? '🎵 BGM: ON' : '🔇 BGM: OFF'}
          </button>

          {/* Voice Chat Comms */}
          <button
            onClick={() => setIsVoiceChatOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white border border-purple-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-900/30"
          >
            <span className="text-sm">🎙️</span>
            <span className="hidden sm:inline">Voice Chat</span>
          </button>

          {/* Monthly Rewards */}
          <button
            onClick={() => setIsRewardsOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white border border-purple-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-900/30"
          >
            <span className="text-sm">🎁</span>
            <span className="hidden sm:inline">Rewards</span>
          </button>

          {/* World Rankings */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white border border-purple-400 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-900/30"
          >
            <span className="text-sm">🌍</span>
            <span className="hidden sm:inline">Rankings</span>
          </button>

          {/* Install / Play Store Modal */}
          <button
            onClick={() => setIsInstallOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-white/30"
          >
            <span className="text-sm">📲</span>
            <span className="hidden sm:inline">Install Game</span>
          </button>
        </div>
      </header>

      {/* 2. Main Game Viewport */}
      <main className="flex-1 w-full relative flex flex-col items-center justify-center overflow-hidden">
        {screen === 'select' ? (
          /* Fighter Roster & Arena Selection View */
          <div className="w-full h-full overflow-y-auto py-2">
            <FighterSelect onStartFight={handleStartFight} coins={coins} />
          </div>
        ) : (
          /* Active Combat Match View */
          <div className="w-full h-full relative flex flex-col justify-between">
            {/* Top Match HUD: Health Bars, Super Meters, Timer, Announcer */}
            <div className="w-full px-4 pt-2 z-20 flex flex-col items-center gap-1.5">
              {/* Health & Super Meters Bar (White & Purple Luxury Theme) */}
              <div className="w-full max-w-4xl flex items-center justify-between gap-3">
                {/* Player 1 Health & Name */}
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <span>{playerFighter.flag}</span>
                      <span className="text-white font-extrabold">{playerFighter.name}</span>
                      <span className="text-[10px] text-purple-300">({playerFighter.gender})</span>
                    </div>
                    <span className="text-white font-mono font-black">{Math.round(player.hp)} HP</span>
                  </div>

                  {/* HP Bar (White / Purple Gradient) */}
                  <div className="w-full h-5 rounded-xl bg-[#1d0736] border-2 border-purple-500/60 overflow-hidden shadow-inner p-0.5">
                    <div
                      className={`h-full rounded-lg transition-all duration-100 ${
                        player.hp > 50
                          ? 'bg-gradient-to-r from-purple-500 to-white'
                          : player.hp > 25
                          ? 'bg-gradient-to-r from-purple-700 to-purple-300'
                          : 'bg-white animate-pulse'
                      }`}
                      style={{ width: `${player.hp}%` }}
                    />
                  </div>

                  {/* Super / EX Bar */}
                  <div className="w-full flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white">SUPER</span>
                    <div className="flex-1 h-2 rounded-full bg-[#1b0633] border border-purple-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 via-purple-300 to-white transition-all duration-75"
                        style={{ width: `${player.superMeter}%` }}
                      />
                    </div>
                    {player.superMeter >= 100 && (
                      <span className="text-[9px] font-black text-white animate-ping">MAX!</span>
                    )}
                  </div>
                </div>

                {/* Center Timer & Round Badge */}
                <div className="flex flex-col items-center shrink-0 px-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#1b0633] border-2 border-white flex items-center justify-center font-['Bungee'] text-2xl text-white shadow-xl shadow-purple-500/30">
                    {matchTimer}
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-purple-300 uppercase mt-0.5">
                    ROUND 1
                  </span>
                </div>

                {/* Opponent Health & Name */}
                <div className="flex-1 flex flex-col gap-1 text-right">
                  <div className="flex items-center justify-between text-xs font-bold flex-row-reverse">
                    <div className="flex items-center gap-1.5 flex-row-reverse">
                      <span>{opponentFighter.flag}</span>
                      <span className="text-purple-200 font-extrabold">{opponentFighter.name}</span>
                      <span className="text-[10px] text-purple-400">({opponentFighter.gender})</span>
                    </div>
                    <span className="text-white font-mono font-black">{Math.round(opponent.hp)} HP</span>
                  </div>

                  {/* Opponent HP Bar */}
                  <div className="w-full h-5 rounded-xl bg-[#1d0736] border-2 border-purple-500/60 overflow-hidden shadow-inner p-0.5 flex justify-end">
                    <div
                      className={`h-full rounded-lg transition-all duration-100 ${
                        opponent.hp > 50
                          ? 'bg-gradient-to-r from-white to-purple-500'
                          : opponent.hp > 25
                          ? 'bg-gradient-to-r from-purple-300 to-purple-700'
                          : 'bg-white animate-pulse'
                      }`}
                      style={{ width: `${opponent.hp}%` }}
                    />
                  </div>

                  {/* Opponent Super Bar */}
                  <div className="w-full flex items-center gap-2 flex-row-reverse">
                    <span className="text-[10px] font-bold text-white">SUPER</span>
                    <div className="flex-1 h-2 rounded-full bg-[#1b0633] border border-purple-800 overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-gradient-to-r from-white to-purple-600 transition-all duration-75"
                        style={{ width: `${opponent.superMeter}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Combo Counter Notification Banner */}
              {player.comboCount > 1 && (
                <div className="px-5 py-1 rounded-full bg-white text-purple-950 font-['Bungee'] text-sm tracking-wider animate-bounce shadow-xl shadow-white/40">
                  ⚡ {player.comboCount} HITS SAVAGE COMBO!
                </div>
              )}

              {/* Live Announcer Banner */}
              <LiveCommentaryBanner
                commentary={commentaryText}
                tactics={tacticsText}
                onAskTactics={handleAskTactics}
                loadingTactics={loadingTactics}
              />
            </div>

            {/* Central Canvas Ring */}
            <div className="flex-1 w-full relative flex items-center justify-center">
              <FightCanvas
                player={player}
                opponent={opponent}
                playerFighter={playerFighter}
                opponentFighter={opponentFighter}
                projectiles={projectiles}
                particles={particles}
                stageName={currentStage.name}
                stageColor={currentStage.accentColor}
                screenShake={screenShake}
                slowMoActive={slowMo}
              />

              {/* K.O. & Match Outcome Overlay (White & Purple) */}
              {matchWinner && (
                <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn">
                  <div className="text-center flex flex-col items-center gap-4 max-w-md">
                    <h2 className="text-6xl font-black text-white font-['Bungee'] drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                      {matchWinner === 'player' ? 'YOU WIN!' : 'K.O.!'}
                    </h2>

                    <p className="text-sm font-bold text-purple-200">
                      {matchWinner === 'player'
                        ? `Congratulations! ${playerFighter.name} conquered the arena! +350 Coins & +200 XP earned!`
                        : `${opponentFighter.name} took the round. Train your counters and challenge again!`}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          handleStartFight(
                            playerFighter,
                            opponentFighter,
                            currentStage,
                            playerOutfitIdx,
                            playerWeaponIdx,
                            matchMode
                          )
                        }
                        className="px-7 py-3.5 rounded-2xl bg-white text-purple-950 font-black text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition shadow-2xl shadow-white/40"
                      >
                        REMATCH FIGHT 🔁
                      </button>

                      <button
                        onClick={() => setScreen('select')}
                        className="px-7 py-3.5 rounded-2xl bg-[#2e1065] border-2 border-purple-400 hover:bg-[#3b1580] text-white font-bold text-sm uppercase tracking-wider transition"
                      >
                        FIGHTER SELECT 🥊
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Virtual Arcade Controls Deck */}
            <div className="w-full z-20 shrink-0">
              <ArcadeControls
                onMove={handlePlayerMove}
                onAction={handlePlayerAction}
                onEmote={() => {
                  sound.announce(`${playerFighter.name} shouts: ${playerFighter.signatureQuote}`);
                }}
                superMeter={player.superMeter}
                isBlocking={player.isBlocking}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerScore={koWins}
      />

      <RewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        playerXp={playerXp}
        coins={coins}
        gems={gems}
        onClaimReward={handleClaimReward}
        onClaimQuest={handleClaimQuest}
      />

      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => setIsVoiceChatOpen(false)}
        fighterName={playerFighter.name}
        onVoiceCommand={handleVoiceCommand}
      />

      <PlayStoreInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </div>
  );
}
