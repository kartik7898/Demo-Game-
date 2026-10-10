import React from 'react';
import { PlayerState, DialogueLine } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Volume2, VolumeX, Map as MapIcon, Shield, Sparkles } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface GameHUDProps {
  player: PlayerState;
  levelName: string;
  levelIndex: number;
  dialogue: DialogueLine | null;
  onOpenMap: () => void;
  onShoutJumanji: () => void;
  readyForJumanjiShout: boolean;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  player,
  levelName,
  levelIndex,
  dialogue,
  onOpenMap,
  onShoutJumanji,
  readyForJumanjiShout,
  isMuted,
  onToggleSound,
}) => {
  const char = CHARACTERS[player.characterId];
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const specialReady = player.specialCooldown <= 0;

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-3 sm:p-4 flex flex-col justify-between h-full z-10 select-none">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 w-full">
        {/* Top-Left: Avatar & Forearm Tattoo Lives */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-lg p-2.5 sm:p-3 shadow-xl flex items-center gap-3">
          {/* Avatar Icon Box */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-md border-2 border-amber-600/70 overflow-hidden relative flex flex-col items-center justify-center shadow-inner"
            style={{ backgroundColor: char.spritePalette.shirt }}
          >
            <div
              className="w-7 h-7 rounded-full border border-stone-800 shadow-sm"
              style={{ backgroundColor: char.spritePalette.skin }}
            />
            <div
              className="w-8 h-4 rounded-t-sm mt-0.5"
              style={{ backgroundColor: char.spritePalette.pants }}
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[160px]">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider truncate max-w-[120px]">
                {char.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-stone-400 font-mono tabular-nums">
                {Math.max(0, Math.round(player.hp))}/{player.maxHp}
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full h-3 bg-stone-950 rounded border border-stone-700 overflow-hidden relative">
              <div
                className="h-full transition-all duration-150 ease-out"
                style={{
                  width: `${hpPct}%`,
                  backgroundColor: hpPct > 50 ? '#10b981' : hpPct > 25 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            {/* 3 WRIST-TATTOO LIFE BARS (Movie-Accurate!) */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono">
                Wrist Tattoos:
              </span>
              <div className="flex items-center gap-1.5 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-800">
                {[1, 2, 3].map((lifeNum) => {
                  const hasLife = player.lives >= lifeNum;
                  return (
                    <div
                      key={lifeNum}
                      className={`w-1.5 h-4.5 rounded-full transition-all duration-300 transform ${
                        hasLife
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] -rotate-12 scale-100'
                          : 'bg-stone-800 opacity-20 -rotate-12 scale-90'
                      }`}
                      title={hasLife ? `Life ${lifeNum} Active` : `Life ${lifeNum} Extinguished`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right: Inventory, Level Indicator & Sound Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Ancient Map Button */}
          <button
            onClick={onOpenMap}
            className="flex items-center gap-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/70 text-amber-200 px-3 py-2 rounded-lg font-pixel text-[10px] transition-colors shadow-lg active:scale-95"
            title="Inspect Island Map"
          >
            <MapIcon className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Island Map</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2.5 bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg transition-colors shadow-lg active:scale-95"
            title={isMuted ? 'Unmute Jungle Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Level Badge */}
          <div className="bg-stone-900/90 border border-stone-700 rounded-lg px-3 py-2 text-right shadow-lg">
            <div className="text-[9px] text-stone-400 uppercase font-mono">Stage {levelIndex + 1} / 5</div>
            <div className="font-pixel text-[10px] text-amber-300 truncate max-w-[130px] sm:max-w-[180px]">
              {levelName.split(' ')[0]} {levelName.split(' ')[1] || ''}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Banner: Dynamic Movie Dialogue Banter Box */}
      {dialogue && (
        <div className="pointer-events-auto self-center my-auto max-w-xl w-full px-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-stone-950/92 backdrop-blur-md border-2 border-amber-600/80 rounded-xl p-3 sm:p-4 shadow-2xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-md bg-stone-800 border border-amber-500/50 flex items-center justify-center shrink-0 text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-pixel text-[10px] sm:text-xs text-amber-400 mb-1 flex items-center justify-between">
                <span>{dialogue.speaker}</span>
                {dialogue.mood && (
                  <span className="text-[9px] font-mono text-stone-400 lowercase italic">
                    [{dialogue.mood}]
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">
                "{dialogue.text}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Level 5 FINAL CLIMAX: SHOUT JUMANJI BUTTON! */}
      {readyForJumanjiShout && (
        <div className="pointer-events-auto self-center mb-6 animate-bounce">
          <button
            onClick={onShoutJumanji}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-stone-950 font-pixel text-base sm:text-xl font-black rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.8)] border-4 border-emerald-300 transition-transform active:scale-95 flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-stone-950 animate-spin" />
            <span>SHOUT: JUMANJI!</span>
            <Sparkles className="w-6 h-6 text-stone-950 animate-spin" />
          </button>
        </div>
      )}

      {/* Bottom Status: Special Ability Readiness & Controls Hint */}
      <div className="flex items-end justify-between w-full pointer-events-none pb-1">
        <div className="pointer-events-auto bg-stone-900/85 backdrop-blur-sm border border-stone-700/80 rounded-lg px-3 py-1.5 text-xs text-stone-300 flex items-center gap-2">
          <span className="font-pixel text-[9px] text-amber-400 uppercase">Special:</span>
          <span className="text-stone-200 font-medium">{char.specialAbility.name}</span>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
              specialReady ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600' : 'bg-stone-800 text-stone-400'
            }`}
          >
            {specialReady ? 'READY [K / Skill]' : `${Math.ceil(player.specialCooldown / 1000)}s`}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-stone-900/85 backdrop-blur-sm border border-stone-700/80 rounded-lg px-3 py-1.5 text-[10px] text-stone-400 font-mono">
          <span>A/D / ← →: Move</span>
          <span>·</span>
          <span>W / ↑ / Space: Jump</span>
          <span>·</span>
          <span>J: Attack</span>
          <span>·</span>
          <span>K: Ability</span>
        </div>
      </div>
    </div>
  );
};
