/**
 * Core Game Engine for Jumanji: Welcome to the Jungle
 * Controls physics, collisions, combat, avatar abilities, 3-life tattoo system, and sky drop respawns.
 */

import {
  CharacterId,
  PlayerState,
  Enemy,
  Projectile,
  Particle,
  Platform,
  Hazard,
  Collectible,
  LevelConfig,
  PuzzleState,
} from '../types/game';
import { CHARACTERS } from '../data/characters';
import { LEVELS } from '../data/levels';
import { sound } from '../audio/soundEngine';

export interface GameEngineCallbacks {
  onLifeLost: (remainingLives: number) => void;
  onSkyDropLanded: () => void;
  onLevelComplete: (levelId: number) => void;
  onGameOver: () => void;
  onVictory: () => void;
  onOpenPuzzle: (puzzle: PuzzleState) => void;
  onDialogueTrigger: (text: string, speaker: string, avatarId?: CharacterId | 'van_pelt' | 'nigel' | 'system') => void;
}

export class GameEngine {
  public player: PlayerState;
  public currentLevelIndex: number = 0;
  public cameraX: number = 0;
  public platforms: Platform[] = [];
  public hazards: Hazard[] = [];
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public collectibles: Collectible[] = [];
  public screenShake: number = 0;

  // Level 4 Helicopter Mode
  public isHelicopterMode: boolean = false;
  public helicopterY: number = 200;
  public chopperPartsCollected: number = 0;

  // Level 5 Boss State
  public jewelSocketed: boolean = false;
  public readyForJumanjiShout: boolean = false;

  // Puzzle State
  public currentPuzzle: PuzzleState | null = null;

  // Callbacks
  private callbacks: GameEngineCallbacks;

  // Key states
  public keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    attack: boolean;
    special: boolean;
    interact: boolean;
  } = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    attack: false,
    special: false,
    interact: false,
  };

  constructor(characterId: CharacterId, callbacks: GameEngineCallbacks) {
    this.callbacks = callbacks;
    const char = CHARACTERS[characterId];

    this.player = {
      characterId,
      x: 100,
      y: 280,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      facing: 'right',
      animState: 'Idle',
      animFrame: 0,
      animTimer: 0,
      hp: char.baseHp,
      maxHp: char.baseHp,
      lives: 3, // 3 wrist-tattoo marks
      invulnerableTimer: 0,
      specialCooldown: 0,
      isGrounded: false,
      isAttacking: false,
      attackCooldown: 0,
      skyDropY: 0,
      isSkyDropping: false,
      score: 0,
      stamina: 100,
    };

    this.loadLevel(0);
  }

  public setCharacter(charId: CharacterId) {
    const char = CHARACTERS[charId];
    this.player.characterId = charId;
    this.player.hp = char.baseHp;
    this.player.maxHp = char.baseHp;
  }

  public loadLevel(levelIdx: number) {
    this.currentLevelIndex = levelIdx;
    const level = LEVELS[levelIdx];
    this.cameraX = 0;
    this.projectiles = [];
    this.particles = [];
    this.screenShake = 0;
    this.isHelicopterMode = false;
    this.helicopterY = 220;
    this.chopperPartsCollected = 0;
    this.jewelSocketed = false;
    this.readyForJumanjiShout = false;
    this.currentPuzzle = null;

    this.player.x = 100;
    this.player.y = 280;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invulnerableTimer = 60;

    // Build stage level geometries
    this.buildLevelWorld(level);

    // Initial level dialogue banter
    if (level.dialogues.length > 0) {
      const line = level.dialogues[0];
      this.callbacks.onDialogueTrigger(line.text, line.speaker, line.avatarId);
    }

    sound.startJungleDrums(levelIdx === 4 ? 116 : (levelIdx === 2 ? 110 : 92));
  }

  private buildLevelWorld(level: LevelConfig) {
    this.platforms = [];
    this.hazards = [];
    this.enemies = [];
    this.collectibles = [];

    const groundY = 400;
    const stageLen = level.length;

    // Ground platform segments
    for (let x = 0; x < stageLen; x += 600) {
      // Occasional gap or river
      const hasGap = (x > 800 && x < stageLen - 600 && (x / 600) % 3 === 0);
      if (!hasGap) {
        this.platforms.push({
          x,
          y: groundY,
          width: 580,
          height: 120,
          type: 'solid',
        });
      } else {
        // Bridge or stepping stones over gap
        this.platforms.push({
          x: x + 80,
          y: groundY - 30,
          width: 140,
          height: 20,
          type: 'bridge',
        });
        this.platforms.push({
          x: x + 300,
          y: groundY - 30,
          width: 140,
          height: 20,
          type: 'bridge',
        });
      }
    }

    // Elevated platforms (stalls, trees, ruins, catwalks)
    for (let x = 250; x < stageLen - 400; x += 320) {
      const platY = groundY - 90 - ((x % 3) * 35);
      const platW = 120 + ((x % 4) * 20);
      this.platforms.push({
        x,
        y: platY,
        width: platW,
        height: 18,
        type: level.theme === 'bazaar' ? 'canopy' : (level.theme === 'fortress' ? 'rock' : 'crate'),
      });
    }

    // Stage 1: The Bazaar & Motorcycle Chase
    if (level.theme === 'bazaar') {
      // Henchmen & Motorcycle raiders
      for (let x = 500; x < stageLen - 600; x += 400) {
        this.enemies.push({
          id: `hench_${x}`,
          type: (x % 800 === 0) ? 'motorcycle_raider' : 'bazaar_henchman',
          x,
          y: groundY - 48,
          vx: (x % 800 === 0) ? -3.5 : -1.2,
          vy: 0,
          width: (x % 800 === 0) ? 68 : 32,
          height: 48,
          hp: (x % 800 === 0) ? 60 : 40,
          maxHp: (x % 800 === 0) ? 60 : 40,
          facing: 'left',
          attackCooldown: 60,
          behaviorTimer: 0,
        });
      }

      // Boss 1: Lead Assassin on Armored Chopper
      this.enemies.push({
        id: 'boss_assassin',
        type: 'assassin_boss',
        x: stageLen - 350,
        y: groundY - 54,
        vx: -2.5,
        vy: 0,
        width: 76,
        height: 54,
        hp: 240,
        maxHp: 240,
        facing: 'left',
        attackCooldown: 80,
        behaviorTimer: 0,
        isBoss: true,
      });

      // Collectibles: Health fruit
      this.collectibles.push({
        id: 'fruit_1',
        x: 600,
        y: groundY - 140,
        type: 'health_fruit',
        collected: false,
        name: 'Papaya Vitality Fruit',
      });
      this.collectibles.push({
        id: 'fruit_2',
        x: 1800,
        y: groundY - 150,
        type: 'health_fruit',
        collected: false,
        name: 'Guava Fruit',
      });
    }

    // Stage 2: The Jaguar Fortress & Jungle Trail
    else if (level.theme === 'fortress') {
      // Hazards: Quicksand & Dart traps
      this.hazards.push({
        x: 650,
        y: groundY - 10,
        width: 180,
        height: 40,
        type: 'quicksand',
      });
      this.hazards.push({
        x: 1550,
        y: groundY - 10,
        width: 220,
        height: 40,
        type: 'quicksand',
      });
      this.hazards.push({
        x: 1000,
        y: groundY - 120,
        width: 28,
        height: 28,
        type: 'dart_trap',
      });
      this.hazards.push({
        x: 2100,
        y: groundY - 120,
        width: 28,
        height: 28,
        type: 'dart_trap',
      });

      // Jungle Hippos & Cobras
      for (let x = 450; x < stageLen - 500; x += 380) {
        const isHippo = x % 760 === 0;
        this.enemies.push({
          id: `jungle_beast_${x}`,
          type: isHippo ? 'jungle_hippo' : 'viper_snake',
          x,
          y: groundY - (isHippo ? 40 : 28),
          vx: isHippo ? 0 : -1.0,
          vy: 0,
          width: isHippo ? 64 : 32,
          height: isHippo ? 40 : 28,
          hp: isHippo ? 75 : 30,
          maxHp: isHippo ? 75 : 30,
          facing: 'left',
          attackCooldown: 70,
          behaviorTimer: 0,
        });
      }

      // Collectible: Ancient Map Parchment
      this.collectibles.push({
        id: 'ancient_map_piece',
        x: 1200,
        y: groundY - 140,
        type: 'map_piece',
        collected: false,
        name: 'Cartographer\'s Map Tablet',
      });
    }

    // Stage 3: The Canyons & Bighorn Rhino Stampede
    else if (level.theme === 'canyons') {
      // Continuous stampeding rhinos chasing from left side!
      this.enemies.push({
        id: 'rhino_stampede_pack',
        type: 'rhino_stampede',
        x: -120,
        y: groundY - 50,
        vx: 3.6,
        vy: 0,
        width: 140,
        height: 52,
        hp: 9999, // Unstoppable wall of rhinos! Player must stay ahead
        maxHp: 9999,
        facing: 'right',
        attackCooldown: 10,
        behaviorTimer: 0,
      });

      // Individual Bighorn Rhinos blocking path ahead
      for (let x = 700; x < stageLen - 400; x += 450) {
        this.enemies.push({
          id: `rhino_${x}`,
          type: 'bighorn_rhino',
          x,
          y: groundY - 46,
          vx: -2.0,
          vy: 0,
          width: 68,
          height: 46,
          hp: 80,
          maxHp: 80,
          facing: 'left',
          attackCooldown: 50,
          behaviorTimer: 0,
        });
      }

      // Mouse's weakness test: Cake on the trail!
      this.collectibles.push({
        id: 'pound_cake',
        x: 1400,
        y: groundY - 40,
        type: 'cake',
        collected: false,
        name: 'Pound Cake (Mouse\'s Weakness!)',
      });
    }

    // Stage 4: Transportation Hangar & Helicopter Escape
    else if (level.theme === 'hangar') {
      // 3 missing helicopter parts scattered across hangar
      this.collectibles.push({
        id: 'copter_part_1',
        x: 700,
        y: groundY - 120,
        type: 'copter_part',
        collected: false,
        name: 'Helicopter Turbine Gear',
      });
      this.collectibles.push({
        id: 'copter_part_2',
        x: 1600,
        y: groundY - 130,
        type: 'copter_part',
        collected: false,
        name: 'Aviation Fuel Line',
      });
      this.collectibles.push({
        id: 'copter_part_3',
        x: 2400,
        y: groundY - 100,
        type: 'copter_part',
        collected: false,
        name: 'Main Rotor Stabilizer',
      });

      // Mercenaries & Snipers
      for (let x = 500; x < stageLen - 400; x += 360) {
        this.enemies.push({
          id: `merc_${x}`,
          type: (x % 720 === 0) ? 'sniper' : 'hangar_mercenary',
          x,
          y: groundY - 48,
          vx: -1.0,
          vy: 0,
          width: 32,
          height: 48,
          hp: 45,
          maxHp: 45,
          facing: 'left',
          attackCooldown: 80,
          behaviorTimer: 0,
        });
      }
    }

    // Stage 5: The Jaguar Statue (Final Boss)
    else {
      // The sacred Jewel of Jumanji is in the player's possession!
      this.collectibles.push({
        id: 'jumanji_jewel',
        x: 200,
        y: groundY - 40,
        type: 'jewel',
        collected: true, // Already carried by hero
        name: 'The Sacred Jewel of Jumanji',
      });

      // Possessed Shadow Panters guarding the rock
      for (let x = 600; x < stageLen - 600; x += 400) {
        this.enemies.push({
          id: `shadow_panther_${x}`,
          type: 'shadow_panther',
          x,
          y: groundY - 36,
          vx: -2.8,
          vy: 0,
          width: 48,
          height: 36,
          hp: 65,
          maxHp: 65,
          facing: 'left',
          attackCooldown: 40,
          behaviorTimer: 0,
        });
      }

      // Russell Van Pelt (Final Boss)
      this.enemies.push({
        id: 'van_pelt_final',
        type: 'van_pelt_boss',
        x: stageLen - 400,
        y: groundY - 54,
        vx: 0,
        vy: 0,
        width: 48,
        height: 54,
        hp: 400,
        maxHp: 400,
        facing: 'left',
        attackCooldown: 60,
        behaviorTimer: 0,
        isBoss: true,
      });

      // Giant Jaguar Rock Scaffolding Steps leading to the head at the end
      const finalX = stageLen - 250;
      for (let step = 0; step < 6; step++) {
        this.platforms.push({
          x: finalX - step * 60,
          y: groundY - (step + 1) * 45,
          width: 70,
          height: 18,
          type: 'rock',
        });
      }
      // Top Jaguar Eye Altar
      this.platforms.push({
        x: finalX + 40,
        y: groundY - 280,
        width: 140,
        height: 24,
        type: 'rock',
      });
    }
  }

  public update() {
    const char = CHARACTERS[this.player.characterId];
    const level = LEVELS[this.currentLevelIndex];

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.9;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // 1. Sky-Drop Respawn Logic
    if (this.player.isSkyDropping) {
      this.player.skyDropY += 26; // High terminal velocity descent
      this.player.y = this.player.skyDropY;

      // Check when player reaches ground
      if (this.player.skyDropY >= 352) {
        this.player.skyDropY = 352;
        this.player.y = 352;
        this.player.vy = 0;
        this.player.isSkyDropping = false;
        this.player.isGrounded = true;
        this.player.invulnerableTimer = 180; // 3 seconds invulnerability
        this.screenShake = 22; // Massive ground impact!

        // Create heavy impact dust crater particles
        for (let i = 0; i < 30; i++) {
          this.particles.push({
            x: this.player.x + 16,
            y: this.player.y + 44,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 8,
            color: '#d97706',
            size: Math.random() * 6 + 3,
            alpha: 1,
            life: 0,
            maxLife: 35,
          });
        }
        this.callbacks.onSkyDropLanded();
      }
      return; // Freeze normal input while plummeting
    }

    // 2. Cooldowns & Timers
    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer--;
    if (this.player.specialCooldown > 0) this.player.specialCooldown -= 16;
    if (this.player.attackCooldown > 0) this.player.attackCooldown--;

    // 3. Movement & Controls
    const speed = char.speed;
    let targetVx = 0;

    if (this.keys.left) {
      targetVx = -speed;
      this.player.facing = 'left';
    } else if (this.keys.right) {
      targetVx = speed;
      this.player.facing = 'right';
    }

    // Shelly's Stamina Weakness: running slowly reduces stamina in heat
    if (this.player.characterId === 'shelly') {
      if (Math.abs(targetVx) > 0) {
        this.player.stamina = Math.max(20, this.player.stamina - 0.05);
      } else {
        this.player.stamina = Math.min(100, this.player.stamina + 0.1);
      }
    }

    this.player.vx += (targetVx - this.player.vx) * 0.25;

    // Helicopter Flight Controls (Stage 4)
    if (this.isHelicopterMode) {
      if (this.keys.up) this.helicopterY = Math.max(80, this.helicopterY - 4);
      if (this.keys.down) this.helicopterY = Math.min(360, this.helicopterY + 4);
      this.player.y = this.helicopterY + 10;
      this.player.vx = 4.2; // Continuous flight toward finish line
      this.player.vy = 0;
    } else {
      // Normal Platformer Gravity & Jump
      this.player.vy += 0.65; // gravity
      if (this.player.vy > 14) this.player.vy = 14;

      if (this.keys.jump && this.player.isGrounded) {
        this.player.vy = -char.jumpPower;
        this.player.isGrounded = false;
        sound.playJump();
      }
    }

    // Update Player Position
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // Prevent moving backwards past camera left bound
    if (this.player.x < this.cameraX) {
      this.player.x = this.cameraX;
    }

    // Platform Collisions (when not in helicopter)
    if (!this.isHelicopterMode) {
      this.player.isGrounded = false;
      this.platforms.forEach((p) => {
        // Feet collision
        const playerBottom = this.player.y + this.player.height;
        const prevBottom = playerBottom - this.player.vy;

        if (
          this.player.x + this.player.width > p.x &&
          this.player.x < p.x + p.width &&
          playerBottom >= p.y &&
          prevBottom <= p.y + 12 &&
          this.player.vy >= 0
        ) {
          this.player.y = p.y - this.player.height;
          this.player.vy = 0;
          this.player.isGrounded = true;
        }
      });
    }

    // Fall out of bounds / Pit death
    if (this.player.y > 520) {
      this.triggerPlayerDeath('Fell into the canyon abyss!');
      return;
    }

    // Animation state update
    if (this.player.attackCooldown > 0) {
      this.player.animState = 'Attack';
    } else if (this.player.specialCooldown > char.specialAbility.cooldownMs - 400) {
      this.player.animState = 'Ability';
    } else if (!this.player.isGrounded && !this.isHelicopterMode) {
      this.player.animState = 'Jump';
    } else if (Math.abs(this.player.vx) > 0.5) {
      this.player.animState = 'Run';
    } else {
      this.player.animState = 'Idle';
    }

    // Camera follow player smoothly
    const targetCamX = this.player.x - 220;
    if (targetCamX > this.cameraX) {
      this.cameraX += (targetCamX - this.cameraX) * 0.1;
    }

    // 4. Combat / Attacks
    if (this.keys.attack && this.player.attackCooldown === 0) {
      this.executePrimaryAttack();
    }

    if (this.keys.special && this.player.specialCooldown <= 0) {
      this.executeSpecialAbility();
    }

    // 5. Update Hazards
    this.updateHazards();

    // 6. Update Projectiles
    this.updateProjectiles();

    // 7. Update Enemies & Bosses
    this.updateEnemies();

    // 8. Update Collectibles
    this.updateCollectibles();

    // 9. Update Particles
    this.updateParticles();

    // 10. Check Stage Completion
    this.checkStageProgress(level);
  }

  private executePrimaryAttack() {
    const char = CHARACTERS[this.player.characterId];
    this.player.attackCooldown = 22;
    sound.playAttack(this.player.characterId);

    if (this.player.characterId === 'bravestone') {
      // Boomerang Toss
      const dir = this.player.facing === 'right' ? 1 : -1;
      this.projectiles.push({
        id: `boom_${Date.now()}`,
        x: this.player.x + (dir > 0 ? 28 : -8),
        y: this.player.y + 20,
        vx: dir * 9,
        vy: -0.8,
        radius: 12,
        owner: 'player',
        kind: 'boomerang',
        life: 0,
        damage: char.attackPower,
      });
    } else if (this.player.characterId === 'ruby') {
      // Melee Karate Combo strike! Checks nearby enemies
      const attackRange = 54;
      const attackX = this.player.facing === 'right' ? this.player.x + this.player.width : this.player.x - attackRange;
      
      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        if (
          enemy.x + enemy.width > attackX &&
          enemy.x < attackX + attackRange &&
          Math.abs(enemy.y - this.player.y) < 40
        ) {
          this.damageEnemy(enemy, char.attackPower);
        }
      });
    } else if (this.player.characterId === 'mouse') {
      // Valet Throw
      const dir = this.player.facing === 'right' ? 1 : -1;
      this.projectiles.push({
        id: `ord_${Date.now()}`,
        x: this.player.x + (dir > 0 ? 25 : -8),
        y: this.player.y + 16,
        vx: dir * 7.5,
        vy: -4,
        radius: 10,
        owner: 'player',
        kind: 'ordinance',
        life: 0,
        damage: char.attackPower,
      });
    } else {
      // Shelly's Cartography Flare
      const dir = this.player.facing === 'right' ? 1 : -1;
      this.projectiles.push({
        id: `flare_${Date.now()}`,
        x: this.player.x + (dir > 0 ? 25 : -8),
        y: this.player.y + 20,
        vx: dir * 8,
        vy: 0,
        radius: 8,
        owner: 'player',
        kind: 'bullet',
        life: 0,
        damage: char.attackPower,
      });
    }
  }

  private executeSpecialAbility() {
    const char = CHARACTERS[this.player.characterId];
    this.player.specialCooldown = char.specialAbility.cooldownMs;
    this.screenShake = 12;

    if (this.player.characterId === 'bravestone') {
      // Smoldering Slam: knocks back and deals massive damage to all nearby foes!
      this.callbacks.onDialogueTrigger('Smoldering Gaze activated! "Stand back everyone!"', 'Spencer (Bravestone)', 'bravestone');
      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dist = Math.abs(enemy.x - this.player.x);
        if (dist < 220) {
          this.damageEnemy(enemy, 75);
          enemy.vx = (enemy.x > this.player.x ? 1 : -1) * 8;
        }
      });
      // Shockwave particles
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: this.player.x + 16,
          y: this.player.y + 44,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 6,
          color: '#fbbf24',
          size: 5,
          alpha: 1,
          life: 0,
          maxLife: 25,
        });
      }
    } else if (this.player.characterId === 'ruby') {
      // Dance Fighting Spin: invulnerable flurry destroying all surrounding enemies!
      this.callbacks.onDialogueTrigger('"Are you guys ready for some dance fighting?!" *Cue 90s music*', 'Martha (Ruby)', 'ruby');
      this.player.invulnerableTimer = 90;
      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return;
        const dist = Math.abs(enemy.x - this.player.x);
        if (dist < 160) {
          this.damageEnemy(enemy, 65);
        }
      });
    } else if (this.player.characterId === 'shelly') {
      // Map Decipher: Reveal secret shortcuts & auto-disables nearby traps!
      this.callbacks.onDialogueTrigger('"According to this 18th-century cartography... trap deactivated!"', 'Bethany (Shelly)', 'shelly');
      this.hazards.forEach((h) => {
        if (Math.abs(h.x - this.player.x) < 300) {
          h.type = 'quicksand'; // neutralized
        }
      });
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
    } else {
      // Mouse Finbar: Valet Heavy Artillery Barrage!
      this.callbacks.onDialogueTrigger('"You want weapons?! I GOT WEAPONS IN THIS BACKPACK!"', 'Fridge (Mouse)', 'mouse');
      for (let i = -2; i <= 2; i++) {
        this.projectiles.push({
          id: `barrage_${Date.now()}_${i}`,
          x: this.player.x + 16,
          y: this.player.y + 10,
          vx: (this.player.facing === 'right' ? 1 : -1) * (6 + Math.abs(i) * 2),
          vy: -5 + i * 2,
          radius: 12,
          owner: 'player',
          kind: 'ordinance',
          life: 0,
          damage: 55,
        });
      }
    }
  }

  private updateHazards() {
    this.hazards.forEach((h) => {
      // Quicksand sink mechanics
      if (h.type === 'quicksand') {
        if (
          this.player.x + this.player.width > h.x &&
          this.player.x < h.x + h.width &&
          this.player.y + this.player.height >= h.y
        ) {
          this.player.vy = 0.5; // sinking
          this.player.vx *= 0.5; // trapped in mud
          if (this.keys.jump) {
            this.player.vy = -6; // struggle to jump out
          }
        }
      } else if (h.type === 'dart_trap') {
        // Periodic blowdart shooting
        h.timer = (h.timer || 0) + 1;
        if (h.timer % 120 === 0 && Math.abs(h.x - this.player.x) < 450) {
          this.projectiles.push({
            id: `dart_${Date.now()}`,
            x: h.x,
            y: h.y + 10,
            vx: -5.5,
            vy: 0,
            radius: 5,
            owner: 'enemy',
            kind: 'dart',
            life: 0,
            damage: 22,
          });
        }
      }
    });
  }

  private updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      // Gravity for grenades
      if (p.kind === 'ordinance') {
        p.vy += 0.3;
      }

      // Check player damage
      if (p.owner === 'enemy') {
        if (
          this.player.invulnerableTimer === 0 &&
          p.x > this.player.x &&
          p.x < this.player.x + this.player.width &&
          p.y > this.player.y &&
          p.y < this.player.y + this.player.height
        ) {
          this.damagePlayer(p.damage, p.kind === 'dart' ? 'venom' : 'physical');
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check enemy damage
      if (p.owner === 'player') {
        for (const enemy of this.enemies) {
          if (enemy.isDead) continue;
          if (
            p.x > enemy.x &&
            p.x < enemy.x + enemy.width &&
            p.y > enemy.y &&
            p.y < enemy.y + enemy.height
          ) {
            this.damageEnemy(enemy, p.damage);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }

      // Remove expired
      if (p.life > 90 || p.y > 600) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies() {
    this.enemies.forEach((enemy) => {
      if (enemy.isDead) return;

      // Stampede pack moves right constantly
      if (enemy.type === 'rhino_stampede') {
        enemy.x += enemy.vx;
        // Collision with player = instant heavy hit!
        if (
          this.player.x < enemy.x + enemy.width &&
          this.player.x + this.player.width > enemy.x
        ) {
          this.damagePlayer(45, 'physical');
          this.player.vx = 8;
        }
        return;
      }

      // Boss & Minion AI movement
      const distToPlayer = this.player.x - enemy.x;
      if (Math.abs(distToPlayer) < 550) {
        enemy.facing = distToPlayer > 0 ? 'right' : 'left';

        // Approach or shoot
        if (Math.abs(distToPlayer) > 120) {
          enemy.x += (distToPlayer > 0 ? 1 : -1) * (enemy.isBoss ? 2.2 : 1.4);
        }

        // Enemy Attack Cooldown
        if (enemy.attackCooldown > 0) {
          enemy.attackCooldown--;
        } else {
          // Attack!
          enemy.attackCooldown = enemy.isBoss ? 55 : 85;
          if (enemy.type === 'van_pelt_boss') {
            // Dark Curse Orb
            this.projectiles.push({
              id: `curse_${Date.now()}`,
              x: enemy.x + (enemy.facing === 'right' ? 40 : -10),
              y: enemy.y + 20,
              vx: (enemy.facing === 'right' ? 1 : -1) * 6,
              vy: 0,
              radius: 12,
              owner: 'enemy',
              kind: 'curse_orb',
              life: 0,
              damage: 35,
            });
          } else if (enemy.type === 'assassin_boss' || enemy.type === 'motorcycle_raider') {
            // Gunshot or throwing blade
            this.projectiles.push({
              id: `bullet_${Date.now()}`,
              x: enemy.x + (enemy.facing === 'right' ? 50 : -10),
              y: enemy.y + 20,
              vx: (enemy.facing === 'right' ? 1 : -1) * 7.5,
              vy: 0,
              radius: 4,
              owner: 'enemy',
              kind: 'bullet',
              life: 0,
              damage: 25,
            });
          } else if (Math.abs(distToPlayer) < 60) {
            // Melee bite / ram
            const isVenom = enemy.type === 'viper_snake';
            this.damagePlayer(isVenom ? 30 : 20, isVenom ? 'venom' : 'physical');
          }
        }
      }
    });
  }

  private updateCollectibles() {
    this.collectibles.forEach((c) => {
      if (c.collected) return;
      if (
        this.player.x + this.player.width > c.x &&
        this.player.x < c.x + 30 &&
        this.player.y + this.player.height > c.y &&
        this.player.y < c.y + 30
      ) {
        c.collected = true;

        if (c.type === 'jewel') {
          sound.playJewelChime();
          this.callbacks.onDialogueTrigger('The Sacred Jewel of Jumanji acquired! Climb to the Jaguar\'s eye!', 'Spencer (Bravestone)', 'bravestone');
        } else if (c.type === 'cake') {
          // Mouse Finbar's Weakness: CAKE!
          if (this.player.characterId === 'mouse') {
            sound.playHurt();
            this.screenShake = 20;
            this.callbacks.onDialogueTrigger('NOOO! CAKE! I ATE THE CAKE! I\'M EXPLODING!!', 'Fridge (Mouse)', 'mouse');
            // Instant fatal explosion from cake!
            this.triggerPlayerDeath('Exploded by delicious cake! (Franklin Finbar\'s Weakness)');
          } else {
            this.callbacks.onDialogueTrigger('Mmm, delicious jungle pound cake.', 'Player', 'system');
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
          }
        } else if (c.type === 'copter_part') {
          sound.playJewelChime();
          this.chopperPartsCollected++;
          this.callbacks.onDialogueTrigger(`Found helicopter part: ${c.name}! (${this.chopperPartsCollected}/3)`, 'Bethany (Shelly)', 'shelly');

          if (this.chopperPartsCollected >= 3) {
            this.isHelicopterMode = true;
            this.callbacks.onDialogueTrigger('The helicopter is fixed! Fire up the rotor blades! TAKE OFF!', 'Spencer (Bravestone)', 'bravestone');
          }
        } else if (c.type === 'map_piece') {
          sound.playJewelChime();
          this.callbacks.onDialogueTrigger('Map parchment retrieved! Shelly can decipher the runes now!', 'Bethany (Shelly)', 'shelly');
        } else if (c.type === 'health_fruit') {
          sound.playJewelChime();
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
        }
      }
    });
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public damagePlayer(rawDamage: number, type: 'physical' | 'venom' = 'physical') {
    if (this.player.invulnerableTimer > 0 || this.player.isSkyDropping) return;

    let damage = rawDamage;

    // Ruby Roundhouse Weakness: Takes +70% extra damage from Venom!
    if (this.player.characterId === 'ruby' && type === 'venom') {
      damage = Math.round(damage * 1.7);
      this.callbacks.onDialogueTrigger('VENOM! That sting burns! (Ruby\'s Weakness)', 'Martha (Ruby)', 'ruby');
    }

    this.player.hp -= damage;
    this.player.invulnerableTimer = 40;
    this.screenShake = 8;
    sound.playHurt();

    // Damage particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + 16,
        y: this.player.y + 24,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4,
        color: '#ef4444',
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 20,
      });
    }

    if (this.player.hp <= 0) {
      this.triggerPlayerDeath('Overwhelmed in the jungle!');
    }
  }

  private damageEnemy(enemy: Enemy, damage: number) {
    enemy.hp -= damage;
    this.screenShake = enemy.isBoss ? 10 : 4;

    // Blood / spark particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: enemy.x + enemy.width * 0.5,
        y: enemy.y + enemy.height * 0.5,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 5,
        color: '#f59e0b',
        size: 4,
        alpha: 1,
        life: 0,
        maxLife: 18,
      });
    }

    if (enemy.hp <= 0) {
      enemy.isDead = true;
      this.player.score += enemy.isBoss ? 1000 : 150;

      if (enemy.type === 'van_pelt_boss') {
        this.readyForJumanjiShout = true;
        this.callbacks.onDialogueTrigger('Van Pelt is defeated! Spencer, place the Jewel into the Jaguar\'s eye and SHOUT JUMANJI!', 'Martha (Ruby)', 'ruby');
      }
    }
  }

  // Lives System: 3 tattoo marks on forearm.
  // Respawn: player screams and drops from the stratosphere with massive THUD!
  public triggerPlayerDeath(reason: string) {
    this.player.lives--;
    this.callbacks.onLifeLost(this.player.lives);

    if (this.player.lives > 0) {
      // Reposition above viewport for sky drop
      this.player.isSkyDropping = true;
      this.player.skyDropY = -350; // Stratosphere
      this.player.y = -350;
      this.player.hp = this.player.maxHp;
      this.player.vx = 0;
      this.player.vy = 0;

      // Play dramatic sky whistling and prepare earth-shaking thud
      sound.playSkyDrop();

      this.callbacks.onDialogueTrigger(
        `Lost a tattoo mark! (${this.player.lives} lives remaining) Screaming from the clouds!`,
        this.player.characterId === 'bravestone' ? 'Spencer (Bravestone)' : (this.player.characterId === 'ruby' ? 'Martha (Ruby)' : (this.player.characterId === 'mouse' ? 'Fridge (Mouse)' : 'Bethany (Shelly)')),
        this.player.characterId
      );
    } else {
      // 0 lives left -> GAME OVER!
      sound.stopJungleDrums();
      this.callbacks.onGameOver();
    }
  }

  private checkStageProgress(level: LevelConfig) {
    // Stage 5 completion: Socket jewel and shout Jumanji
    if (this.currentLevelIndex === 4) {
      const topAltarX = level.length - 200;
      if (this.player.x >= topAltarX && this.player.y <= 240) {
        this.jewelSocketed = true;
        this.readyForJumanjiShout = true;
      }
      return;
    }

    // Normal stages: Reach the right end of the level
    if (this.player.x >= level.length - 200) {
      sound.stopJungleDrums();
      sound.playVictoryFanfare();
      this.callbacks.onLevelComplete(level.id);
    }
  }

  // Final Action: Shout "JUMANJI!"
  public shoutJumanji() {
    sound.stopJungleDrums();
    sound.playVictoryFanfare();
    this.screenShake = 25;
    this.callbacks.onVictory();
  }
}
