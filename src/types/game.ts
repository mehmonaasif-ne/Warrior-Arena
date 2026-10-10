export type Gender = 'female' | 'male';

export interface FighterOutfit {
  id: string;
  name: string;
  colorScheme: {
    primary: string;
    secondary: string;
    glow: string;
    accent: string;
  };
  unlocked: boolean;
  cost: number;
}

export interface WeaponGear {
  id: string;
  name: string;
  type: 'blaster' | 'blade' | 'gauntlets' | 'staff';
  icon: string;
  description: string;
  bonus: string;
  unlocked: boolean;
  cost: number;
}

export interface Emote {
  id: string;
  name: string;
  icon: string;
  text: string;
  audioKey?: string;
}

export interface MoveInfo {
  name: string;
  command: string;
  type: 'normal' | 'special' | 'super';
  damage: number;
  description: string;
}

export interface FighterData {
  id: string;
  name: string;
  title: string;
  gender: Gender;
  avatar: string;
  bio: string;
  country: string;
  flag: string;
  stats: {
    attack: number;
    speed: number;
    defense: number;
    specialPower: number;
  };
  outfits: FighterOutfit[];
  weapons: WeaponGear[];
  emotes: Emote[];
  moves: MoveInfo[];
  signatureQuote: string;
  isChampionBoss?: boolean;
}

export type ActionState =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'jump'
  | 'crouch'
  | 'block'
  | 'punch_light'
  | 'punch_heavy'
  | 'kick_light'
  | 'kick_heavy'
  | 'special_projectile'
  | 'special_uppercut'
  | 'super_move'
  | 'hit_stun'
  | 'knocked_down'
  | 'victory'
  | 'defeat';

export interface CombatEntity {
  id: string;
  fighterId: string;
  name: string;
  isPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  hp: number;
  maxHp: number;
  superMeter: number; // 0 to 100
  state: ActionState;
  stateTimer: number;
  isGrounded: boolean;
  isBlocking: boolean;
  comboCount: number;
  comboTimer: number;
  invulnerableFrames: number;
  activeOutfitIndex: number;
  activeWeaponIndex: number;
  kills: number;
}

export interface Projectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  radius: number;
  damage: number;
  color: string;
  glowColor: string;
  type: 'plasma_bullet' | 'fireball' | 'energy_crescent';
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'shockwave' | 'text' | 'confetti';
  text?: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  fighter: string;
  country: string;
  flag: string;
  elo: number;
  tier: 'Grandmaster' | 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
  wins: number;
  losses: number;
  streak: number;
  badge?: string;
  isDev?: boolean;
}

export interface MonthlyRewardTier {
  level: number;
  requiredXp: number;
  rewardName: string;
  rewardType: 'coins' | 'gems' | 'outfit' | 'weapon' | 'title';
  amount?: number;
  icon: string;
  claimed: boolean;
  isPremium?: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  goal: number;
  rewardXp: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
}

export interface VoiceChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isAi: boolean;
  fighterId?: string;
}
