/**
 * 2D Canvas Pixel-Art Renderer for Jumanji: Welcome to the Jungle
 * Renders parallax layers, characters, enemies, bosses, hazards, and VFX.
 */

import { PlayerState, Enemy, Projectile, Particle, Platform, Hazard, Collectible, LevelConfig } from '../types/game';
import { CHARACTERS } from '../data/characters';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private tick: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(
    player: PlayerState,
    level: LevelConfig,
    cameraX: number,
    platforms: Platform[],
    hazards: Hazard[],
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    collectibles: Collectible[],
    shake: number = 0,
    isHelicopterMode: boolean = false,
    helicopterY: number = 0
  ) {
    this.tick++;
    const ctx = this.ctx;
    ctx.save();

    // Screen shake
    if (shake > 0) {
      const offsetX = (Math.random() - 0.5) * shake;
      const offsetY = (Math.random() - 0.5) * shake;
      ctx.translate(offsetX, offsetY);
    }

    // 1. Draw Background Parallax
    this.drawParallaxBackground(level.theme, cameraX);

    // 2. Draw Platforms & Terrain
    this.drawPlatforms(platforms, cameraX, level.theme);

    // 3. Draw Hazards (Quicksand, Darts, Spikes)
    this.drawHazards(hazards, cameraX);

    // 4. Draw Collectibles (Jewel, Map, Chopper Parts, Fruit)
    this.drawCollectibles(collectibles, cameraX);

    // 5. Draw Enemies & Bosses
    this.drawEnemies(enemies, cameraX);

    // 6. Draw Helicopter (Level 4 special)
    if (isHelicopterMode) {
      this.drawHelicopter(player.x - cameraX + 20, helicopterY);
    }

    // 7. Draw Player
    this.drawPlayer(player, cameraX);

    // 8. Draw Projectiles
    this.drawProjectiles(projectiles, cameraX);

    // 9. Draw Particle FX
    this.drawParticles(particles, cameraX);

    // 10. Draw Level-Specific Foreground Details
    this.drawForegroundDetails(level.theme, cameraX);

    ctx.restore();
  }

  private drawParallaxBackground(theme: string, cameraX: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    if (theme === 'bazaar') {
      // Warm sunset sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#f97316');
      skyGrad.addColorStop(0.4, '#fb923c');
      skyGrad.addColorStop(0.7, '#fde047');
      skyGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant desert ridges (0.1x speed)
      ctx.fillStyle = 'rgba(194, 65, 12, 0.4)';
      this.drawMountains(cameraX * 0.1, h * 0.55, 140, 260);

      // Distant bazaar minarets & palms (0.3x speed)
      ctx.fillStyle = 'rgba(154, 52, 18, 0.6)';
      this.drawBazaarSilhouettes(cameraX * 0.3, h * 0.68);
    } else if (theme === 'fortress') {
      // Mysterious deep jungle canopy
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#064e3b');
      skyGrad.addColorStop(0.5, '#065f46');
      skyGrad.addColorStop(0.8, '#047857');
      skyGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Mountain peaks behind jungle mist
      ctx.fillStyle = 'rgba(2, 44, 34, 0.5)';
      this.drawMountains(cameraX * 0.15, h * 0.52, 180, 200);

      // Giant ancient vine trees (0.35x speed)
      ctx.fillStyle = 'rgba(6, 78, 59, 0.7)';
      this.drawJungleTrees(cameraX * 0.35, h * 0.72);
    } else if (theme === 'canyons') {
      // Scorching canyon dust sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#7c2d12');
      skyGrad.addColorStop(0.5, '#9a3412');
      skyGrad.addColorStop(0.8, '#c2410c');
      skyGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Massive red rock bluffs
      ctx.fillStyle = 'rgba(67, 20, 7, 0.7)';
      this.drawCanyonBluffs(cameraX * 0.2, h * 0.6);

      // Canyon dust fog
      ctx.fillStyle = 'rgba(234, 88, 12, 0.15)';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
    } else if (theme === 'hangar') {
      // Overcast tropical runway with storm clouds
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(0.5, '#334155');
      skyGrad.addColorStop(0.8, '#1e3a5f');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Runway fence & warehouse silhouettes
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      this.drawHangarSilhouettes(cameraX * 0.3, h * 0.7);
    } else {
      // Level 5: Jaguar Rock summit! Dramatic lightning storm
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#111827');
      skyGrad.addColorStop(0.4, '#1f2937');
      skyGrad.addColorStop(0.7, '#064e3b');
      skyGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Colossal Jaguar Rock background silhouette (0.2x speed)
      this.drawJaguarRockBackground(cameraX * 0.15, h * 0.2);

      // Occasional lightning flash
      if (this.tick % 160 > 156) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(0, 0, w, h);
      }
    }
  }

  private drawMountains(offsetX: number, baseY: number, peakHeight: number, step: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = -200; x < this.width + 200; x += step) {
      const screenX = ((x - offsetX) % (this.width + 400)) - 100;
      const peakY = baseY - ((Math.sin(x * 0.01) * 0.5 + 0.5) * peakHeight);
      ctx.lineTo(screenX, peakY);
      ctx.lineTo(screenX + step * 0.5, baseY);
    }
    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();
  }

  private drawBazaarSilhouettes(offsetX: number, baseY: number) {
    const ctx = this.ctx;
    for (let i = 0; i < 12; i++) {
      const x = ((i * 220 - offsetX) % (this.width + 440)) - 100;
      // Dome
      ctx.beginPath();
      ctx.arc(x + 50, baseY - 40, 35, Math.PI, 0, false);
      ctx.rect(x + 15, baseY - 40, 70, 60);
      ctx.fill();
      // Minaret spire
      ctx.fillRect(x + 90, baseY - 90, 14, 110);
      ctx.beginPath();
      ctx.moveTo(x + 85, baseY - 90);
      ctx.lineTo(x + 97, baseY - 120);
      ctx.lineTo(x + 109, baseY - 90);
      ctx.fill();
    }
  }

  private drawJungleTrees(offsetX: number, baseY: number) {
    const ctx = this.ctx;
    for (let i = 0; i < 10; i++) {
      const x = ((i * 240 - offsetX) % (this.width + 480)) - 100;
      // Trunk
      ctx.fillRect(x + 35, baseY - 100, 22, 120);
      // Canopy cluster
      ctx.beginPath();
      ctx.arc(x + 46, baseY - 120, 50, 0, Math.PI * 2);
      ctx.arc(x + 15, baseY - 100, 36, 0, Math.PI * 2);
      ctx.arc(x + 75, baseY - 100, 36, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawCanyonBluffs(offsetX: number, baseY: number) {
    const ctx = this.ctx;
    for (let i = 0; i < 8; i++) {
      const x = ((i * 300 - offsetX) % (this.width + 600)) - 150;
      ctx.beginPath();
      ctx.moveTo(x, baseY + 60);
      ctx.lineTo(x + 30, baseY - 140);
      ctx.lineTo(x + 160, baseY - 150);
      ctx.lineTo(x + 200, baseY + 60);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawHangarSilhouettes(offsetX: number, baseY: number) {
    const ctx = this.ctx;
    for (let i = 0; i < 6; i++) {
      const x = ((i * 380 - offsetX) % (this.width + 760)) - 180;
      // Quonset hangar curve
      ctx.beginPath();
      ctx.arc(x + 100, baseY, 90, Math.PI, 0);
      ctx.lineTo(x + 190, baseY + 60);
      ctx.lineTo(x + 10, baseY + 60);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawJaguarRockBackground(offsetX: number, baseY: number) {
    const ctx = this.ctx;
    const centerX = ((this.width * 0.5 - offsetX * 0.3) % (this.width + 400));
    
    // Towering mountain peak
    ctx.fillStyle = '#062d22';
    ctx.beginPath();
    ctx.moveTo(centerX - 240, this.height);
    ctx.lineTo(centerX - 80, baseY + 100);
    ctx.lineTo(centerX, baseY);
    ctx.lineTo(centerX + 80, baseY + 100);
    ctx.lineTo(centerX + 240, this.height);
    ctx.closePath();
    ctx.fill();

    // Giant Jaguar Head Monument
    ctx.fillStyle = '#093a2c';
    ctx.beginPath();
    ctx.arc(centerX, baseY + 90, 65, 0, Math.PI * 2);
    ctx.fill();

    // Jaguar Ears
    ctx.beginPath();
    ctx.moveTo(centerX - 55, baseY + 50);
    ctx.lineTo(centerX - 75, baseY + 10);
    ctx.lineTo(centerX - 35, baseY + 40);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX + 55, baseY + 50);
    ctx.lineTo(centerX + 75, baseY + 10);
    ctx.lineTo(centerX + 35, baseY + 40);
    ctx.fill();

    // Glowing Green Eye Socket (where the jewel belongs!)
    const pulse = 0.5 + Math.sin(this.tick * 0.08) * 0.5;
    ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + pulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(centerX - 22, baseY + 80, 10, 0, Math.PI * 2);
    ctx.arc(centerX + 22, baseY + 80, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlatforms(platforms: Platform[], cameraX: number, theme: string) {
    const ctx = this.ctx;
    platforms.forEach((p) => {
      const rx = p.x - cameraX;
      if (rx + p.width < 0 || rx > this.width) return;

      if (theme === 'bazaar') {
        // Terracotta market stalls & stone flags
        ctx.fillStyle = '#b45309';
        ctx.fillRect(rx, p.y, p.width, p.height);
        // Awning stripes
        if (p.type === 'canopy') {
          const stripeW = 16;
          for (let sx = 0; sx < p.width; sx += stripeW) {
            ctx.fillStyle = (Math.floor(sx / stripeW) % 2 === 0) ? '#dc2626' : '#fef08a';
            ctx.fillRect(rx + sx, p.y, Math.min(stripeW, p.width - sx), 10);
          }
        } else {
          // Stone edge trim
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(rx, p.y, p.width, 5);
        }
      } else if (theme === 'fortress') {
        // Ancient carved mossy stone blocks
        ctx.fillStyle = '#1e3a2b';
        ctx.fillRect(rx, p.y, p.width, p.height);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(rx, p.y, p.width, 4); // Moss top
        // Ancient runes
        ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
        for (let bx = 20; bx < p.width - 20; bx += 50) {
          ctx.fillRect(rx + bx, p.y + 10, 12, 4);
          ctx.fillRect(rx + bx + 4, p.y + 6, 4, 12);
        }
      } else if (theme === 'canyons') {
        // Red-rock canyon ledges
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(rx, p.y, p.width, p.height);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(rx, p.y, p.width, 5);
      } else if (theme === 'hangar') {
        // Industrial steel runway & scaffolding
        ctx.fillStyle = '#334155';
        ctx.fillRect(rx, p.y, p.width, p.height);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(rx, p.y, p.width, 3);
        // Hazard stripes
        for (let sx = 0; sx < p.width; sx += 30) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(rx + sx, p.y + 3, 15, 4);
        }
      } else {
        // Jaguar Rock sacred stairs
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(rx, p.y, p.width, p.height);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(rx, p.y, p.width, 4);
      }
    });
  }

  private drawHazards(hazards: Hazard[], cameraX: number) {
    const ctx = this.ctx;
    hazards.forEach((h) => {
      const rx = h.x - cameraX;
      if (rx + h.width < 0 || rx > this.width) return;

      if (h.type === 'quicksand') {
        // Sinking bubbling mud
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx, h.y, h.width, h.height);
        const wave = Math.sin(this.tick * 0.1 + h.x) * 3;
        ctx.fillStyle = '#92400e';
        ctx.fillRect(rx, h.y + wave, h.width, 6);
        // Quicksand warning swirl
        ctx.fillStyle = 'rgba(217, 119, 6, 0.6)';
        ctx.beginPath();
        ctx.arc(rx + h.width * 0.5, h.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.type === 'dart_trap') {
        // Stone gargoyle face shooting darts
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx, h.y, h.width, h.height);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(rx + 6, h.y + 6, 6, 6); // Glowing red trap eye
      } else if (h.type === 'spike') {
        ctx.fillStyle = '#94a3b8';
        for (let sx = 0; sx < h.width; sx += 14) {
          ctx.beginPath();
          ctx.moveTo(rx + sx, h.y + h.height);
          ctx.lineTo(rx + sx + 7, h.y);
          ctx.lineTo(rx + sx + 14, h.y + h.height);
          ctx.fill();
        }
      }
    });
  }

  private drawCollectibles(collectibles: Collectible[], cameraX: number) {
    const ctx = this.ctx;
    collectibles.forEach((c) => {
      if (c.collected) return;
      const rx = c.x - cameraX;
      if (rx < -40 || rx > this.width + 40) return;

      const bobY = c.y + Math.sin(this.tick * 0.1 + c.x) * 6;

      if (c.type === 'jewel') {
        // Glowing Emerald of Jumanji!
        const pulse = Math.sin(this.tick * 0.15) * 4;
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 15;
        // Faceted diamond shape
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.moveTo(rx + 15, bobY - pulse);
        ctx.lineTo(rx + 30, bobY + 12);
        ctx.lineTo(rx + 15, bobY + 28 + pulse);
        ctx.lineTo(rx, bobY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ecfdf5';
        ctx.fillRect(rx + 12, bobY + 8, 6, 6);
        ctx.restore();
      } else if (c.type === 'map_piece') {
        // Rolled parchment map
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(rx + 4, bobY, 20, 24);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(rx + 8, bobY + 4, 12, 16);
      } else if (c.type === 'cake') {
        // Delicious but deadly cake (Mouse's weakness!)
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(rx + 4, bobY + 8, 20, 14);
        ctx.fillStyle = '#ffffff'; // Frosting
        ctx.fillRect(rx + 2, bobY + 4, 24, 6);
        ctx.fillStyle = '#fbbf24'; // Cherry
        ctx.beginPath();
        ctx.arc(rx + 14, bobY + 2, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.type === 'copter_part') {
        // Shiny metal helicopter turbine/gear
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(rx + 14, bobY + 14, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(rx + 8, bobY + 12, 12, 4);
      } else {
        // Tropical healing fruit
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(rx + 12, bobY + 12, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private drawPlayer(player: PlayerState, cameraX: number) {
    const ctx = this.ctx;
    const char = CHARACTERS[player.characterId];
    const screenX = player.x - cameraX;
    const screenY = player.y;

    ctx.save();

    // Sky-drop respawn visual effect: High altitude descent screaming down!
    if (player.isSkyDropping) {
      // Draw falling streak & cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(screenX + 10 + i * 6, screenY - 80 - i * 30, 3, 50);
      }
    }

    // Invulnerability flashing
    if (player.invulnerableTimer > 0 && Math.floor(this.tick / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Direction flip
    if (player.facing === 'left') {
      ctx.translate(screenX + player.width, screenY);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(screenX, screenY);
    }

    // 16-Bit Pixel Art Avatar Renderer
    this.renderPixelCharacter(player, char);

    ctx.restore();
  }

  private renderPixelCharacter(player: PlayerState, char: typeof CHARACTERS['bravestone']) {
    const ctx = this.ctx;
    const { skin, hair, shirt, pants } = char.spritePalette;
    const isMoving = Math.abs(player.vx) > 0.5;
    const legCycle = isMoving ? Math.sin(this.tick * 0.3) * 6 : 0;
    const isJumping = !player.isGrounded;

    // Special aura (Smoldering aura / Dance fighting aura)
    if (player.animState === 'Ability') {
      ctx.fillStyle = player.characterId === 'bravestone' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(236, 72, 153, 0.3)';
      ctx.beginPath();
      ctx.arc(player.width * 0.5, player.height * 0.5, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Legs / Boots
    ctx.fillStyle = pants;
    if (isJumping) {
      // Jump pose
      ctx.fillRect(6, 32, 8, 12);
      ctx.fillRect(18, 30, 8, 10);
    } else {
      // Running / Idle
      ctx.fillRect(6, 30 + legCycle, 8, 16 - legCycle);
      ctx.fillRect(18, 30 - legCycle, 8, 16 + legCycle);
    }
    // Leather boots
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(5, 42, 9, 6);
    ctx.fillRect(17, 42, 9, 6);

    // 2. Torso & Shirt
    ctx.fillStyle = shirt;
    ctx.fillRect(6, 16, 20, 16);

    // Character-specific details
    if (char.id === 'bravestone') {
      // Muscle chest cut & leather belt
      ctx.fillStyle = skin;
      ctx.fillRect(12, 16, 8, 6); // open collar
      ctx.fillStyle = '#78350f'; // belt
      ctx.fillRect(6, 30, 20, 3);
    } else if (char.id === 'ruby') {
      // Bare midriff
      ctx.fillStyle = skin;
      ctx.fillRect(8, 26, 16, 5);
      ctx.fillStyle = '#18181b'; // holster straps
      ctx.fillRect(10, 16, 3, 10);
      ctx.fillRect(19, 16, 3, 10);
    } else if (char.id === 'shelly') {
      // Suspenders & field satchel
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, 16, 2, 14);
      ctx.fillRect(22, 16, 2, 14);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(18, 22, 8, 8); // pouch
    } else if (char.id === 'mouse') {
      // GIGANTIC WEAPONS VALET BACKPACK!
      ctx.fillStyle = '#365314'; // Olive military backpack
      ctx.fillRect(-10, 10, 16, 24);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, 18, 16, 3);
      // Radio antenna / golf club sticking out!
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-8, 0, 3, 12);
      ctx.fillRect(-4, 3, 3, 9);
    }

    // 3. Arms & Hands
    ctx.fillStyle = skin;
    if (player.animState === 'Attack') {
      // Punching / Throwing
      ctx.fillRect(22, 18, 16, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(34, 17, 6, 8); // fist
    } else {
      ctx.fillRect(2, 18, 6, 12);
      ctx.fillRect(24, 18, 6, 12);
    }

    // 4. Head & Face
    ctx.fillStyle = skin;
    ctx.fillRect(8, 4, 16, 13);

    // Eyes
    ctx.fillStyle = '#111827';
    ctx.fillRect(18, 8, 3, 3);

    // 5. Hair & Headgear
    ctx.fillStyle = hair;
    if (char.id === 'bravestone') {
      // Shaved buzz hair / intense brow
      ctx.fillRect(8, 2, 16, 4);
    } else if (char.id === 'ruby') {
      // Flaming red hair & ponytail
      ctx.fillRect(6, 2, 18, 6);
      ctx.fillRect(2, 6, 6, 14); // ponytail swaying
    } else if (char.id === 'shelly') {
      // Pith helmet & round spectacles
      ctx.fillStyle = '#cbd5e1'; // Pith helmet
      ctx.fillRect(4, 0, 24, 6);
      ctx.fillRect(2, 5, 28, 3);
      // Spectacles
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(17, 8, 4, 3);
    } else if (char.id === 'mouse') {
      // Signature bright red beret!
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(4, 0, 22, 6);
      ctx.fillRect(2, 3, 26, 3);
    }
  }

  private drawEnemies(enemies: Enemy[], cameraX: number) {
    const ctx = this.ctx;
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const rx = enemy.x - cameraX;
      if (rx < -100 || rx > this.width + 100) return;

      ctx.save();
      if (enemy.facing === 'left') {
        ctx.translate(rx + enemy.width, enemy.y);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(rx, enemy.y);
      }

      if (enemy.type === 'motorcycle_raider' || enemy.type === 'assassin_boss') {
        // Roaring Motorcycle Henchman!
        this.renderMotorcycle(enemy);
      } else if (enemy.type === 'jungle_hippo') {
        // Enormous Hippo in swamp
        this.renderHippo(enemy);
      } else if (enemy.type === 'viper_snake') {
        // Venomous Cobra
        this.renderViper(enemy);
      } else if (enemy.type === 'bighorn_rhino' || enemy.type === 'rhino_stampede') {
        // Giant Albino Bighorn Rhino
        this.renderRhino(enemy);
      } else if (enemy.type === 'van_pelt_boss') {
        // Russell Van Pelt (Possessed with dark vines)
        this.renderVanPelt(enemy);
      } else {
        // Standard Henchman / Mercenary
        this.renderHenchman(enemy);
      }

      ctx.restore();

      // Enemy Health Bar
      if (enemy.hp < enemy.maxHp || enemy.isBoss) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(rx, enemy.y - 12, enemy.width, 6);
        const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = enemy.isBoss ? '#ef4444' : '#f59e0b';
        ctx.fillRect(rx, enemy.y - 12, enemy.width * hpPct, 6);
      }
    });
  }

  private renderMotorcycle(enemy: Enemy) {
    const ctx = this.ctx;
    const isBoss = enemy.isBoss;

    // Bike Frame
    ctx.fillStyle = isBoss ? '#991b1b' : '#334155';
    ctx.fillRect(10, 20, 48, 16);

    // Spinning Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(14, 40, 14, 0, Math.PI * 2);
    ctx.arc(54, 40, 14, 0, Math.PI * 2);
    ctx.fill();

    // Wheel hubs & spokes
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(14, 40, 5, 0, Math.PI * 2);
    ctx.arc(54, 40, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rider
    ctx.fillStyle = isBoss ? '#1e293b' : '#78350f';
    ctx.fillRect(24, 6, 16, 20); // body
    // Helmet
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(26, -2, 14, 10);
    ctx.fillStyle = '#eab308'; // visor
    ctx.fillRect(34, 0, 6, 4);

    // Headlamp beam
    ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
    ctx.beginPath();
    ctx.moveTo(60, 24);
    ctx.lineTo(120, 10);
    ctx.lineTo(120, 50);
    ctx.closePath();
    ctx.fill();
  }

  private renderHippo(enemy: Enemy) {
    const ctx = this.ctx;
    // Huge grey muddy body
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 10, enemy.width, enemy.height - 10);
    // Gaping jaws
    const jawOpen = Math.sin(this.tick * 0.1) * 8;
    ctx.fillStyle = '#e11d48'; // pink mouth
    ctx.fillRect(enemy.width - 20, 12, 18, 14 + jawOpen);
    // Big white teeth
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(enemy.width - 18, 12, 4, 6);
    ctx.fillRect(enemy.width - 8, 12, 4, 6);
  }

  private renderViper(enemy: Enemy) {
    const ctx = this.ctx;
    // Coiled striking cobra
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(14, 20, 12, 0, Math.PI * 2);
    ctx.fill();
    // Hood spread
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(6, 8, 16, 14);
    // Fangs & red tongue
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(20, 14, 6, 2);
  }

  private renderRhino(enemy: Enemy) {
    const ctx = this.ctx;
    // Massive albino stone rhino
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(10, 10, enemy.width - 20, enemy.height - 15);
    // Head & giant horn
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(enemy.width - 26, 12, 24, 22);
    // Colossal Bighorn
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(enemy.width - 10, 14);
    ctx.lineTo(enemy.width + 16, 0);
    ctx.lineTo(enemy.width - 2, 22);
    ctx.fill();

    // Heavy stomping hooves
    ctx.fillStyle = '#475569';
    ctx.fillRect(16, enemy.height - 10, 12, 10);
    ctx.fillRect(enemy.width - 32, enemy.height - 10, 12, 10);
  }

  private renderVanPelt(enemy: Enemy) {
    const ctx = this.ctx;
    // Dark safari trench coat
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(12, 16, 26, 34);
    // White ascot & dark hunting hat
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(20, 16, 10, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 2, 30, 8);
    ctx.fillRect(16, -2, 18, 6);

    // Glowing possessed green eyes & dark spirit tentacles
    ctx.fillStyle = '#10b981';
    ctx.fillRect(22, 8, 4, 3);
    ctx.fillRect(30, 8, 4, 3);

    // Dark energy tentacles
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const angle = this.tick * 0.1 + i * 2;
      ctx.beginPath();
      ctx.moveTo(25, 30);
      ctx.quadraticCurveTo(25 + Math.cos(angle) * 30, 30 + Math.sin(angle) * 30, 25 + Math.cos(angle) * 50, 30 + Math.sin(angle) * 50);
      ctx.stroke();
    }
  }

  private renderHenchman(enemy: Enemy) {
    const ctx = this.ctx;
    ctx.fillStyle = '#78350f'; // mercenary gear
    ctx.fillRect(6, 16, 18, 18);
    ctx.fillStyle = '#3f3f46'; // combat trousers
    ctx.fillRect(6, 34, 8, 14);
    ctx.fillRect(16, 34, 8, 14);
    // Head with bandanna
    ctx.fillStyle = '#d97706';
    ctx.fillRect(6, 4, 18, 12);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(6, 4, 18, 4);
  }

  private drawHelicopter(x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Vintage olive-drab helicopter cabin
    ctx.fillStyle = '#365314';
    ctx.beginPath();
    ctx.ellipse(30, 20, 40, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail boom
    ctx.fillRect(-35, 15, 40, 8);
    // Tail rotor
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(-38, 5 + Math.sin(this.tick * 0.8) * 10, 4, 20);

    // Glass bubble cockpit
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.beginPath();
    ctx.arc(52, 18, 14, 0, Math.PI * 2);
    ctx.fill();

    // Spinning Main Rotor Blades
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(28, -2, 6, 6);
    ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
    const rotorSpin = Math.sin(this.tick * 0.9) * 55;
    ctx.fillRect(30 - rotorSpin, -4, rotorSpin * 2, 4);

    // Landing skids
    ctx.fillStyle = '#475569';
    ctx.fillRect(10, 40, 45, 4);
    ctx.fillRect(18, 34, 4, 8);
    ctx.fillRect(44, 34, 4, 8);

    ctx.restore();
  }

  private drawProjectiles(projectiles: Projectile[], cameraX: number) {
    const ctx = this.ctx;
    projectiles.forEach((p) => {
      const rx = p.x - cameraX;
      if (rx < -30 || rx > this.width + 30) return;

      if (p.kind === 'boomerang') {
        // Spinning Australian Boomerang
        ctx.save();
        ctx.translate(rx, p.y);
        ctx.rotate(this.tick * 0.4);
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 1.2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#92400e';
        ctx.stroke();
        ctx.restore();
      } else if (p.kind === 'ordinance') {
        // High explosive backpack grenade
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(rx, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444'; // Flashing fuse
        ctx.fillRect(rx - 2, p.y - p.radius - 3, 4, 4);
      } else if (p.kind === 'curse_orb') {
        // Van Pelt dark spirit ball
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rx, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Dart or bullet
        ctx.fillStyle = p.owner === 'player' ? '#f59e0b' : '#ef4444';
        ctx.fillRect(rx - 4, p.y - 2, 8, 4);
      }
    });
  }

  private drawParticles(particles: Particle[], cameraX: number) {
    const ctx = this.ctx;
    particles.forEach((p) => {
      const rx = p.x - cameraX;
      if (rx < -20 || rx > this.width + 20) return;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(rx - p.size * 0.5, p.y - p.size * 0.5, p.size, p.size);
      ctx.restore();
    });
  }

  private drawForegroundDetails(theme: string, cameraX: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Atmospheric weather/dust particles
    if (theme === 'canyons') {
      ctx.fillStyle = 'rgba(254, 215, 170, 0.12)';
      for (let i = 0; i < 20; i++) {
        const px = ((i * 70 - this.tick * 4) % w + w) % w;
        const py = ((i * 45 + this.tick * 2) % h);
        ctx.fillRect(px, py, 4, 2);
      }
    } else if (theme === 'jaguar_statue') {
      // Mystical emerald ember particles floating upward
      ctx.fillStyle = 'rgba(52, 211, 153, 0.25)';
      for (let i = 0; i < 25; i++) {
        const px = ((i * 65 + cameraX * 0.5) % w);
        const py = h - ((this.tick * 2 + i * 50) % h);
        ctx.fillRect(px, py, 3, 3);
      }
    }
  }
}
