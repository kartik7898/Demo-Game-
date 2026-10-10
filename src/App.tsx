/**
 * Jumanji: Welcome to the Jungle - 16-Bit Retro Arcade
 * Complete 2D platformer / action-adventure game engine with 4 avatars,
 * 3-life wrist tattoos, sky-drop respawns, 5 movie stages, and dynamic dialogue banter.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterId, GameScreen, DialogueLine } from './types/game';
import { CHARACTERS } from './data/characters';
import { LEVELS } from './data/levels';
import { INTRO_SCRIPT, RESPAWN_TAUNTS } from './data/dialogueScript';
import { GameEngine } from './game/gameEngine';
import { CanvasRenderer } from './game/canvasRenderer';
import { GameHUD } from './components/GameHUD';
import { CharacterSelect } from './components/CharacterSelect';
import { MapModal } from './components/MapModal';
import { VictoryModal } from './components/VictoryModal';
import { VirtualControls } from './components/VirtualControls';
import { sound } from './audio/soundEngine';
import { Play, RotateCcw, Tv, Volume2, VolumeX, Sparkles, AlertTriangle } from 'lucide-react';

// Imported Generated Pixel Art Assets
import titleBannerImg from './assets/images/jumanji_title_banner_1791615652628.jpg';
import jaguarShrineImg from './assets/images/jumanji_jaguar_shrine_1791615665806.jpg';
import ancientMapImg from './assets/images/jumanji_ancient_map_1791615677386.jpg';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [characterId, setCharacterId] = useState<CharacterId>('bravestone');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dialogue, setDialogue] = useState<DialogueLine | null>(null);
  const [respawnAlert, setRespawnAlert] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const dialogueTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger dialogue helper with auto-hide timer
  const triggerDialogue = useCallback((text: string, speaker: string, avatarId?: CharacterId | 'van_pelt' | 'nigel' | 'system') => {
    if (dialogueTimeoutRef.current) {
      clearTimeout(dialogueTimeoutRef.current);
    }
    setDialogue({ text, speaker, avatarId });
    dialogueTimeoutRef.current = window.setTimeout(() => {
      setDialogue(null);
    }, 4200);
  }, []);

  // Initialize or reconfigure game engine
  const initEngine = useCallback((charId: CharacterId, levelIdx: number = 0) => {
    const engine = new GameEngine(charId, {
      onLifeLost: (remainingLives) => {
        // Taunt or banter when respawning
        const taunts = RESPAWN_TAUNTS[charId];
        const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
        setRespawnAlert(`SKY-DROP RESPAWN! ${remainingLives} Tattoo marks left!`);
        setTimeout(() => setRespawnAlert(null), 3000);
        triggerDialogue(randomTaunt, CHARACTERS[charId].name, charId);
      },
      onSkyDropLanded: () => {
        // When sky-drop hits the earth
        setRespawnAlert('CRATER IMPACT! Ground shockwave!');
        setTimeout(() => setRespawnAlert(null), 1500);
      },
      onLevelComplete: (lvlId) => {
        if (lvlId < 5) {
          setCurrentLevelIndex(lvlId);
          setScreen('LEVEL_CLEARED');
        } else {
          setScreen('VICTORY');
        }
      },
      onGameOver: () => {
        setScreen('GAME_OVER');
      },
      onVictory: () => {
        setScreen('VICTORY');
      },
      onOpenPuzzle: () => {
        // Puzzle handler
      },
      onDialogueTrigger: (text, speaker, avatar) => {
        triggerDialogue(text, speaker, avatar);
      },
    });

    engineRef.current = engine;
    engine.loadLevel(levelIdx);
    setCurrentLevelIndex(levelIdx);
  }, [triggerDialogue]);

  // Handle character choice from select screen
  const handleCharacterSelect = (charId: CharacterId) => {
    setCharacterId(charId);
    initEngine(charId, 0);
    setScreen('PLAYING');
  };

  // Toggle audio
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Proceed to next level
  const handleNextLevel = () => {
    if (currentLevelIndex < 4) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      if (engineRef.current) {
        engineRef.current.loadLevel(nextIdx);
      }
      setScreen('PLAYING');
    }
  };

  // Restart / Try again
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(currentLevelIndex);
      engineRef.current.player.lives = 3;
      engineRef.current.player.hp = CHARACTERS[characterId].baseHp;
      setScreen('PLAYING');
    }
  };

  // Return to title / char select
  const handleResetToCharacterSelect = () => {
    setScreen('CHAR_SELECT');
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.keys.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') engine.keys.jump = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') engine.keys.down = true;
      if (e.code === 'KeyJ' || e.code === 'KeyZ') engine.keys.attack = true;
      if (e.code === 'KeyK' || e.code === 'KeyX') engine.keys.special = true;
      if (e.code === 'KeyE' || e.code === 'Enter') engine.keys.interact = true;
      if (e.code === 'KeyM') setIsMapOpen((prev) => !prev);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.keys.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') engine.keys.jump = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') engine.keys.down = false;
      if (e.code === 'KeyJ' || e.code === 'KeyZ') engine.keys.attack = false;
      if (e.code === 'KeyK' || e.code === 'KeyX') engine.keys.special = false;
      if (e.code === 'KeyE' || e.code === 'Enter') engine.keys.interact = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp pixel rendering
    const updateSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (rendererRef.current) {
        rendererRef.current.resize(rect.width, rect.height);
      } else {
        rendererRef.current = new CanvasRenderer(ctx, rect.width, rect.height);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    let animationFrameId: number;

    const loop = () => {
      const engine = engineRef.current;
      const renderer = rendererRef.current;

      if (engine && renderer) {
        engine.update();
        renderer.render(
          engine.player,
          LEVELS[engine.currentLevelIndex],
          engine.cameraX,
          engine.platforms,
          engine.hazards,
          engine.enemies,
          engine.projectiles,
          engine.particles,
          engine.collectibles,
          engine.screenShake,
          engine.isHelicopterMode,
          engine.helicopterY
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [screen]);

  // Handle Virtual Controls Input from mobile/touch
  const handleVirtualKeyDown = (code: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (code === 'ArrowLeft') engine.keys.left = true;
    if (code === 'ArrowRight') engine.keys.right = true;
    if (code === 'Space') engine.keys.jump = true;
    if (code === 'KeyJ') engine.keys.attack = true;
    if (code === 'KeyK') engine.keys.special = true;
  };

  const handleVirtualKeyUp = (code: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (code === 'ArrowLeft') engine.keys.left = false;
    if (code === 'ArrowRight') engine.keys.right = false;
    if (code === 'Space') engine.keys.jump = false;
    if (code === 'KeyJ') engine.keys.attack = false;
    if (code === 'KeyK') engine.keys.special = false;
  };

  return (
    <div className={`relative w-screen h-screen bg-[#070d09] text-stone-100 flex flex-col overflow-hidden font-sans ${crtEnabled ? 'crt-overlay' : ''}`}>
      {/* Top Bar Navigation */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-stone-800 bg-stone-950/90 z-30 shrink-0">
        {/* Brand Zone */}
        <div className="font-adventure text-lg sm:text-xl font-bold tracking-tight text-amber-300 whitespace-nowrap shrink-0 flex items-center gap-2">
          <span>JUMANJI: 16-BIT RETRO ARCADE</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-stone-300">
          <button
            onClick={() => setScreen('TITLE')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Title Screen
          </button>
          <button
            onClick={() => setScreen('CHAR_SELECT')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Avatar Selection
          </button>
          <button
            onClick={() => setIsMapOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Island Map
          </button>
          <button
            onClick={() => setCrtEnabled((prev) => !prev)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>CRT Scanlines: {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </nav>

        {/* Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-stone-900 border border-stone-700 hover:bg-stone-800 text-stone-300 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {screen === 'PLAYING' ? (
            <button
              onClick={() => setScreen('CHAR_SELECT')}
              className="px-3.5 py-1.5 text-xs font-pixel text-amber-300 bg-stone-900 border border-amber-600/70 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Change Avatar
            </button>
          ) : (
            <button
              onClick={() => {
                if (screen === 'TITLE') setScreen('CHAR_SELECT');
                else if (screen === 'CHAR_SELECT') handleCharacterSelect(characterId);
                else setScreen('PLAYING');
              }}
              className="px-4 py-1.5 text-xs font-pixel text-stone-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {screen === 'TITLE' ? 'START GAME' : 'PLAY'}
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* 1. TITLE SCREEN */}
        {screen === 'TITLE' && (
          <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-y-auto">
            {/* Background art */}
            <div className="absolute inset-0 z-0">
              <img
                src={titleBannerImg}
                alt="Jumanji 16-Bit Title Screen"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
            </div>

            <div className="relative z-10 max-w-3xl text-center flex flex-col items-center gap-4 mt-6">
              <div className="font-pixel text-xs text-emerald-400 tracking-widest bg-stone-950/80 px-3 py-1 rounded-full border border-emerald-600/50">
                ★ 1993 RETRO ARCADE EDITION ★
              </div>
              <h1 className="font-adventure text-4xl sm:text-6xl font-black text-amber-300 drop-shadow-[0_4px_20px_rgba(245,158,11,0.6)]">
                JUMANJI
              </h1>
              <div className="font-pixel text-sm sm:text-base text-amber-400 -mt-2">
                WELCOME TO THE JUNGLE
              </div>
            </div>

            {/* Nigel Billingsley Intro Dialog */}
            <div className="relative z-10 max-w-xl w-full bg-stone-950/90 border-2 border-amber-600/80 rounded-2xl p-4 sm:p-5 shadow-2xl my-4 text-left">
              <div className="flex items-center gap-2 mb-2 font-pixel text-xs text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Nigel Billingsley's Dispatch:</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans mb-3">
                "{INTRO_SCRIPT[1].text} {INTRO_SCRIPT[2].text}"
              </p>
              <div className="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 p-2 rounded-lg font-mono">
                ⚠ 3 Forearm Tattoo Marks = 3 Lives. Lose them and you remain trapped forever!
              </div>
            </div>

            {/* Start Button */}
            <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
              <button
                onClick={() => setScreen('CHAR_SELECT')}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-stone-950 font-pixel text-sm sm:text-base font-bold rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.7)] border-2 border-emerald-300 transition-transform active:scale-95 flex items-center gap-3 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-stone-950" />
                <span>PUSH START BUTTON</span>
              </button>
              <span className="font-pixel text-[10px] text-stone-400 animate-pulse">
                SELECT YOUR AVATAR TO BEGIN
              </span>
            </div>
          </div>
        )}

        {/* 2. CHARACTER SELECTION SCREEN */}
        {screen === 'CHAR_SELECT' && (
          <CharacterSelect
            onSelect={handleCharacterSelect}
            bannerImg={titleBannerImg}
          />
        )}

        {/* 3. ACTIVE GAME CANVAS SCREEN */}
        {screen === 'PLAYING' && engineRef.current && (
          <div ref={containerRef} className="relative w-full h-full bg-[#0b130e]">
            {/* HTML5 2D Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block pixelated"
            />

            {/* In-Game HUD & Dialogue banters */}
            <GameHUD
              player={engineRef.current.player}
              levelName={LEVELS[currentLevelIndex].name}
              levelIndex={currentLevelIndex}
              dialogue={dialogue}
              onOpenMap={() => setIsMapOpen(true)}
              onShoutJumanji={() => {
                engineRef.current?.shoutJumanji();
              }}
              readyForJumanjiShout={engineRef.current.readyForJumanjiShout}
              isMuted={isMuted}
              onToggleSound={handleToggleSound}
            />

            {/* Sky-Drop Respawn Announcement Banner */}
            {respawnAlert && (
              <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-30 animate-in zoom-in-90 duration-150">
                <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-200 px-6 py-2.5 rounded-xl font-pixel text-xs sm:text-sm shadow-[0_0_30px_rgba(244,63,94,0.8)] flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                  <span>{respawnAlert}</span>
                </div>
              </div>
            )}

            {/* Mobile / Touch Arcade Virtual Controls */}
            <VirtualControls
              onKeyDown={handleVirtualKeyDown}
              onKeyUp={handleVirtualKeyUp}
              specialAbilityName={CHARACTERS[characterId].specialAbility.name}
            />
          </div>
        )}

        {/* 4. LEVEL CLEARED MODAL */}
        {screen === 'LEVEL_CLEARED' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-stone-950/90 backdrop-blur-md z-40">
            <div className="max-w-md w-full bg-stone-900 border-2 border-emerald-500 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="font-pixel text-xs text-emerald-400">STAGE COMPLETE!</div>
              <h2 className="font-adventure text-3xl font-bold text-amber-300">
                {LEVELS[currentLevelIndex - 1]?.name} Cleared!
              </h2>

              <div className="w-full bg-stone-950 p-3 rounded-lg border border-stone-800 text-left text-xs text-stone-300 flex flex-col gap-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Wrist Tattoos:</span>
                  <span className="text-amber-400">{engineRef.current?.player.lives} / 3 Preserved</span>
                </div>
                <div className="flex justify-between">
                  <span>Stage Score:</span>
                  <span className="text-emerald-400">+{engineRef.current?.player.score} PTS</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Destination:</span>
                  <span className="text-amber-300">{LEVELS[currentLevelIndex]?.name}</span>
                </div>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl text-left text-xs text-amber-200">
                <span className="font-pixel text-[10px] text-amber-400 block mb-1">Jungle Alert:</span>
                "{LEVELS[currentLevelIndex]?.objective}"
              </div>

              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-stone-950 font-pixel text-xs font-bold rounded-xl shadow-lg border-2 border-emerald-400 transition-transform active:scale-95 cursor-pointer"
              >
                PROCEED TO STAGE {currentLevelIndex + 1}
              </button>
            </div>
          </div>
        )}

        {/* 5. GAME OVER MODAL (0 Lives Left) */}
        {screen === 'GAME_OVER' && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-black/95 z-40">
            <div className="max-w-md w-full bg-stone-950 border-2 border-rose-600 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(225,29,72,0.6)] flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
              <div className="font-pixel text-xs text-rose-500">ALL 3 TATTOOS EXTINGUISHED</div>
              <h2 className="font-adventure text-4xl font-black text-rose-400">
                GAME OVER
              </h2>

              <p className="text-xs text-stone-300 font-sans">
                You ran out of lives in Jumanji. The jungle spirits have claimed another group of adventurers!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>CONTINUE (3 LIVES)</span>
                </button>
                <button
                  onClick={handleResetToCharacterSelect}
                  className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 font-pixel text-xs rounded-xl transition-colors cursor-pointer"
                >
                  CHANGE AVATAR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. VICTORY MODAL */}
        {screen === 'VICTORY' && engineRef.current && (
          <VictoryModal
            player={engineRef.current.player}
            onPlayAgain={() => {
              setScreen('CHAR_SELECT');
            }}
            jaguarImg={jaguarShrineImg}
          />
        )}

        {/* Island Map Parchment Modal */}
        {isMapOpen && (
          <MapModal
            currentLevelIndex={currentLevelIndex}
            onClose={() => setIsMapOpen(false)}
            mapImg={ancientMapImg}
          />
        )}
      </main>
    </div>
  );
}
