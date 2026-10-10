import React from 'react';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { PlayerState } from '../types/game';
import { CHARACTERS } from '../data/characters';

interface VictoryModalProps {
  player: PlayerState;
  onPlayAgain: () => void;
  jaguarImg: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ player, onPlayAgain, jaguarImg }) => {
  const char = CHARACTERS[player.characterId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
      <div className="relative max-w-2xl w-full bg-stone-900 border-4 border-emerald-500 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.5)] flex flex-col items-center text-center p-6 sm:p-8">
        {/* Background Artwork */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src={jaguarImg}
            alt="Jaguar Shrine"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 w-full">
          {/* Trophy Header */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-pixel text-xs tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>THE CURSE OF JUMANJI HAS BEEN LIFTED!</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-adventure text-4xl sm:text-6xl font-black text-amber-300 tracking-wider drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
              JUMANJI!
            </h1>
          </div>

          <p className="text-stone-300 text-sm max-w-md font-sans leading-relaxed">
            The sacred emerald shines bright in the Jaguar's eye once more. The dark spirits have retreated, and Nigel Billingsley extends his grateful hand!
          </p>

          {/* Victory Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg my-2">
            <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-lg">
              <div className="text-[10px] text-stone-400 uppercase font-mono">Avatar Champion</div>
              <div className="font-pixel text-xs text-amber-400 mt-1 truncate">{char.name.split(' ')[0]}</div>
            </div>
            <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-lg">
              <div className="text-[10px] text-stone-400 uppercase font-mono">Tattoos Preserved</div>
              <div className="font-pixel text-xs text-emerald-400 mt-1">{player.lives} / 3 Lives</div>
            </div>
            <div className="bg-stone-950/80 border border-stone-800 p-3 rounded-lg col-span-2 sm:col-span-1">
              <div className="text-[10px] text-stone-400 uppercase font-mono">Expedition Score</div>
              <div className="font-pixel text-xs text-amber-300 mt-1">{player.score + 5000} PTS</div>
            </div>
          </div>

          {/* Nigel Billingsley Farewell */}
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 max-w-lg text-left text-xs text-amber-200">
            <span className="font-pixel text-[10px] text-amber-400 block mb-1">Nigel Billingsley:</span>
            "Splendid work, adventurers! You have returned harmony to our enchanted realm. Now, it is time for you to return home!"
          </div>

          {/* Play Again Button */}
          <button
            onClick={onPlayAgain}
            className="mt-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-stone-950 font-pixel text-xs sm:text-sm font-bold rounded-xl shadow-lg border-2 border-emerald-400 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN / CHANGE AVATAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
