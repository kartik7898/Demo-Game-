import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sword, Zap } from 'lucide-react';

interface VirtualControlsProps {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  specialAbilityName: string;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onKeyDown,
  onKeyUp,
  specialAbilityName,
}) => {
  return (
    <div className="md:hidden absolute inset-x-0 bottom-4 px-4 flex items-end justify-between pointer-events-none z-20 select-none">
      {/* D-Pad: Left & Right */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onTouchStart={() => onKeyDown('ArrowLeft')}
          onTouchEnd={() => onKeyUp('ArrowLeft')}
          onMouseDown={() => onKeyDown('ArrowLeft')}
          onMouseUp={() => onKeyUp('ArrowLeft')}
          className="w-13 h-13 bg-stone-900/90 active:bg-amber-600 border-2 border-stone-700 active:border-amber-400 rounded-xl flex items-center justify-center text-stone-200 active:text-stone-950 shadow-lg"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onTouchStart={() => onKeyDown('ArrowRight')}
          onTouchEnd={() => onKeyUp('ArrowRight')}
          onMouseDown={() => onKeyDown('ArrowRight')}
          onMouseUp={() => onKeyUp('ArrowRight')}
          className="w-13 h-13 bg-stone-900/90 active:bg-amber-600 border-2 border-stone-700 active:border-amber-400 rounded-xl flex items-center justify-center text-stone-200 active:text-stone-950 shadow-lg"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons: Jump, Attack, Special */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Special Ability */}
        <button
          onTouchStart={() => onKeyDown('KeyK')}
          onTouchEnd={() => onKeyUp('KeyK')}
          onMouseDown={() => onKeyDown('KeyK')}
          onMouseUp={() => onKeyUp('KeyK')}
          className="w-12 h-12 bg-amber-950/90 active:bg-amber-500 border-2 border-amber-600 rounded-xl flex flex-col items-center justify-center text-amber-300 active:text-stone-950 shadow-lg"
          title={specialAbilityName}
          aria-label="Special Ability"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[8px] font-pixel">SKILL</span>
        </button>

        {/* Attack */}
        <button
          onTouchStart={() => onKeyDown('KeyJ')}
          onTouchEnd={() => onKeyUp('KeyJ')}
          onMouseDown={() => onKeyDown('KeyJ')}
          onMouseUp={() => onKeyUp('KeyJ')}
          className="w-13 h-13 bg-rose-950/90 active:bg-rose-500 border-2 border-rose-600 rounded-xl flex flex-col items-center justify-center text-rose-200 active:text-stone-950 shadow-lg"
          aria-label="Attack"
        >
          <Sword className="w-5 h-5" />
          <span className="text-[8px] font-pixel">ATK</span>
        </button>

        {/* Jump */}
        <button
          onTouchStart={() => onKeyDown('Space')}
          onTouchEnd={() => onKeyUp('Space')}
          onMouseDown={() => onKeyDown('Space')}
          onMouseUp={() => onKeyUp('Space')}
          className="w-14 h-14 bg-emerald-950/90 active:bg-emerald-500 border-2 border-emerald-500 rounded-xl flex flex-col items-center justify-center text-emerald-200 active:text-stone-950 shadow-lg"
          aria-label="Jump"
        >
          <ArrowUp className="w-6 h-6" />
          <span className="text-[8px] font-pixel">JUMP</span>
        </button>
      </div>
    </div>
  );
};
