/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { X, Heart } from 'lucide-react';
import { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  onCloseSidebar?: () => void;
  currentView: 'chat' | 'status' | 'settings' | 'notebook';
  favorabilityData: Record<string, number>;
}

const getFavorabilityLevelString = (value: number): string => {
  if (value < 0) return "敵對";
  if (value < 1) return "陌生";
  if (value < 2) return "認識";
  if (value < 3) return "友好";
  if (value < 4) return "信賴";
  if (value < 5) return "親密";
  return "命定";
};

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  characters, 
  activeCharacterId,
  onSelectCharacter,
  onCloseSidebar,
  currentView,
  favorabilityData,
}) => {
  const sortedCharacters = [...characters]
    .filter(c => c.id !== 'system_creator')
    .sort((a, b) => {
      const favA = favorabilityData[a.id] || 0;
      const favB = favorabilityData[b.id] || 0;
      return favB - favA; // Descending order
    });

  return (
    <div className="p-4 pt-16 bg-[#FCE9DA]/80 backdrop-blur-sm shadow-md rounded-xl h-full flex flex-col border border-[#FFCEC7]/50">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-stone-800">登場角色</h2>
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1 text-stone-500 hover:text-stone-800 rounded-md hover:bg-[#FFCEC7]/50 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-2 chat-container pt-2 border-t border-[#FFCEC7]/50">
        {sortedCharacters.map((char) => {
            const favorability = favorabilityData[char.id] || 0;
            const level = getFavorabilityLevelString(favorability);
            return (
              <button
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className={`w-full flex items-center gap-4 p-2.5 rounded-lg text-left transition-colors ${
                  activeCharacterId === char.id && currentView === 'chat'
                    ? 'bg-[#FFCEC7]'
                    : 'hover:bg-[#FFCEC7]/50'
                }`}
              >
                <div className="w-16 h-16 rounded-lg bg-stone-200 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80">
                  {char.avatar.startsWith('http') ? (
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.avatar
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg text-stone-900">{char.name}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-[#E098AE]">
                      <Heart size={14} />
                      <span>{level}</span>
                  </div>
                </div>
              </button>
            );
        })}
      </div>
    </div>
  );
};

export default CharacterSelector;