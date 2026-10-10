import React, { useState } from 'react';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Shield, Zap, Skull, Award, CheckCircle } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface CharacterSelectProps {
  onSelect: (characterId: CharacterId) => void;
  bannerImg: string;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, bannerImg }) => {
  const [selectedId, setSelectedId] = useState<CharacterId>('bravestone');

  const handleSelect = (id: CharacterId) => {
    setSelectedId(id);
    sound.playAttack(id);
  };

  const handleConfirm = () => {
    sound.playJewelChime();
    onSelect(selectedId);
  };

  const selectedChar = CHARACTERS[selectedId];

  return (
    <div className="relative min-h-screen w-full bg-[#0b130e] text-stone-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto">
      {/* Background Graphic with dark emerald tint */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <img
          src={bannerImg}
          alt="Jumanji Title Art"
          className="w-full h-full object-cover filter blur-xs"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b130e] via-[#0b130e]/80 to-[#0b130e]/60" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col gap-6">
        {/* Header Title */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="font-pixel text-xs sm:text-sm text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <span>◆</span>
            <span>CHOOSE YOUR AVATAR</span>
            <span>◆</span>
          </div>
          <h1 className="font-adventure text-3xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)]">
            JUMANJI: WELCOME TO THE JUNGLE
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-sans">
            Every player begins with <span className="text-amber-400 font-semibold">3 Wrist Tattoo Marks</span> (3 Lives).
            Die in the game, and you will drop from the stratosphere to respawn. Run out of marks, and it's Game Over!
          </p>
        </div>

        {/* 4 Avatars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
            const char = CHARACTERS[id];
            const isSelected = selectedId === id;

            return (
              <div
                key={id}
                onClick={() => handleSelect(id)}
                className={`relative cursor-pointer rounded-xl p-4 transition-all duration-200 border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-stone-900/95 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]'
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-600 hover:bg-stone-900/60'
                }`}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 text-emerald-400">
                    <CheckCircle className="w-5 h-5 fill-emerald-950" />
                  </div>
                )}

                {/* Avatar Portrait Preview */}
                <div className="flex flex-col items-center mb-3">
                  <div
                    className="w-20 h-20 rounded-lg border-2 border-amber-600/60 shadow-md flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: char.spritePalette.shirt }}
                  >
                    <div
                      className="w-10 h-10 rounded-full border border-stone-800"
                      style={{ backgroundColor: char.spritePalette.skin }}
                    />
                    <div
                      className="w-12 h-6 rounded-t-sm mt-1"
                      style={{ backgroundColor: char.spritePalette.pants }}
                    />
                  </div>
                  <h3 className="font-pixel text-xs text-amber-300 mt-2 text-center">
                    {char.name}
                  </h3>
                  <div className="text-[11px] text-stone-400 font-mono">
                    "{char.realName}"
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium italic mt-0.5">
                    {char.actorRole}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="flex flex-col gap-2.5 my-2 text-xs">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-emerald-400 mb-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Strengths</span>
                    </div>
                    <ul className="text-[11px] text-stone-300 flex flex-wrap gap-1">
                      {char.strengths.map((str, idx) => (
                        <li
                          key={idx}
                          className="bg-stone-900 border border-stone-700/60 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[10px] uppercase font-mono text-rose-400 mb-1">
                      <Skull className="w-3.5 h-3.5 text-rose-400" />
                      <span>Weakness</span>
                    </div>
                    <div className="text-[11px] text-rose-200/90 bg-rose-950/40 border border-rose-900/60 px-2 py-1 rounded">
                      {char.weakness}
                    </div>
                  </div>
                </div>

                {/* Signature Ability */}
                <div className="mt-2 pt-2 border-t border-stone-800 text-[11px]">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                    <Zap className="w-3 h-3" />
                    <span>Special: {char.specialAbility.name}</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-0.5 leading-tight line-clamp-2">
                    {char.specialAbility.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Avatar Detail Banner */}
        <div className="bg-stone-900/90 border border-stone-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="font-pixel text-xs text-amber-400">
                Selected: {selectedChar.name}
              </div>
              <p className="text-xs text-stone-300 mt-0.5 max-w-lg">
                {selectedChar.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-stone-950 font-pixel text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-transform active:scale-95 border-2 border-emerald-400 cursor-pointer whitespace-nowrap"
          >
            ENTER THE JUNGLE
          </button>
        </div>
      </div>
    </div>
  );
};
