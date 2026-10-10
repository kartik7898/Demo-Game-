export type CharacterId = 'bravestone' | 'ruby' | 'shelly' | 'mouse';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  realName: string;
  actorRole: string;
  tagline: string;
  strengths: string[];
  weakness: string;
  baseHp: number;
  speed: number;
  jumpPower: number;
  attackPower: number;
  specialAbility: {
    name: string;
    description: string;
    cooldownMs: number;
  };
  stats: {
    strength: number;
    speed: number;
    agility: number;
    archaeology: number;
  };
  spritePalette: {
    skin: string;
    hair: string;
    shirt: string;
    pants: string;
    accent: string;
  };
}

export type AnimationState = 
  | 'Idle' 
  | 'Run' 
  | 'Jump' 
  | 'Attack' 
  | 'Ability' 
  | 'Hurt' 
  | 'Respawn_Drop' 
  | 'Victory_Pose';

export interface PlayerState {
  characterId: CharacterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  animState: AnimationState;
  animFrame: number;
  animTimer: number;
  hp: number;
  maxHp: number;
  lives: number; // 3 wrist-tattoo marks
  invulnerableTimer: number;
  specialCooldown: number;
  isGrounded: boolean;
  isAttacking: boolean;
  attackCooldown: number;
  skyDropY: number;
  isSkyDropping: boolean;
  score: number;
  stamina: number; // For Shelly's heat weakness
}

export type EnemyType = 
  | 'bazaar_henchman'
  | 'motorcycle_raider'
  | 'assassin_boss'
  | 'jungle_hippo'
  | 'viper_snake'
  | 'bighorn_rhino'
  | 'rhino_stampede'
  | 'hangar_mercenary'
  | 'sniper'
  | 'shadow_panther'
  | 'van_pelt_boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  facing: 'left' | 'right';
  attackCooldown: number;
  isBoss?: boolean;
  behaviorTimer: number;
  isDead?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  owner: 'player' | 'enemy';
  kind: 'boomerang' | 'dart' | 'bullet' | 'ordinance' | 'curse_orb';
  life: number;
  damage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'canopy' | 'rock' | 'crate' | 'bridge';
}

export interface Hazard {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'quicksand' | 'dart_trap' | 'spike' | 'lava_gap';
  timer?: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  type: 'jewel' | 'map_piece' | 'cake' | 'health_fruit' | 'copter_part';
  collected: boolean;
  name: string;
}

export interface DialogueLine {
  speaker: string;
  avatarId?: CharacterId | 'van_pelt' | 'nigel' | 'system';
  text: string;
  mood?: 'heroic' | 'sarcastic' | 'panic' | 'danger' | 'smolder';
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  objective: string;
  bossName?: string;
  length: number;
  theme: 'bazaar' | 'fortress' | 'canyons' | 'hangar' | 'jaguar_statue';
  dialogues: DialogueLine[];
}

export interface PuzzleState {
  active: boolean;
  type: 'cartography_dial' | 'copter_wiring';
  discs: number[]; // Rotations [0, 90, 180, 270]
  targets: number[];
  solved: boolean;
  hint: string;
}

export type GameScreen = 
  | 'TITLE'
  | 'CHAR_SELECT'
  | 'MAP_SCREEN'
  | 'PLAYING'
  | 'PUZZLE'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER'
  | 'VICTORY';
