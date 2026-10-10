import React from 'react';
import { X, Compass, MapPin } from 'lucide-react';
import { LEVELS } from '../data/levels';

interface MapModalProps {
  currentLevelIndex: number;
  onClose: () => void;
  mapImg: string;
}

export const MapModal: React.FC<MapModalProps> = ({ currentLevelIndex, onClose, mapImg }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full bg-stone-900 border-2 border-amber-600/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-amber-900/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <span className="font-pixel text-xs sm:text-sm text-amber-300">
              ANCIENT CARTOGRAPHY OF JUMANJI
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Body */}
        <div className="relative flex-1 overflow-auto p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Map Image with Pins */}
          <div className="relative rounded-xl overflow-hidden border border-amber-800/80 shadow-inner max-w-lg w-full">
            <img
              src={mapImg}
              alt="Ancient Map of Jumanji"
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Level List / Progression */}
          <div className="flex-1 flex flex-col gap-2.5 w-full">
            <div className="text-xs uppercase font-mono text-amber-400 font-bold mb-1">
              Island Expedition Path:
            </div>
            {LEVELS.map((lvl, idx) => {
              const isCurrent = idx === currentLevelIndex;
              const isCompleted = idx < currentLevelIndex;

              return (
                <div
                  key={lvl.id}
                  className={`p-2.5 rounded-lg border text-xs transition-colors flex items-start gap-2.5 ${
                    isCurrent
                      ? 'bg-amber-950/70 border-amber-500 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800 text-stone-300'
                      : 'bg-stone-950/50 border-stone-800 text-stone-400 opacity-60'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCurrent ? (
                      <MapPin className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                    ) : isCompleted ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-stone-800 text-stone-400 text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-pixel text-[10px] ${isCurrent ? 'text-amber-300' : 'text-stone-200'}`}>
                        {lvl.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono bg-amber-500 text-stone-950 px-1 rounded font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
                      {lvl.objective}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-stone-950 border-t border-amber-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-pixel text-xs rounded-lg transition-transform active:scale-95 font-bold cursor-pointer"
          >
            RETURN TO EXPEDITION
          </button>
        </div>
      </div>
    </div>
  );
};
