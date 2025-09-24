/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Menu, Settings as SettingsIcon } from 'lucide-react';
import { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  onCloseSidebar?: () => void;
  onShowSettings?: () => void;
  onAvatarClick: (imageUrl: string) => void;
  currentView: 'chat' | 'status' | 'settings' | 'notebook';
  favorabilityData: Record<string, number>;
}

const getFavorabilityStyle = (value: number): { emoji: string; color: string; level: string } => {
  if (value < 0) return { emoji: '💔', color: 'text-slate-500', level: '敵對' };
  if (value < 1) return { emoji: '🤍', color: 'text-stone-500', level: '陌生' };
  if (value < 2) return { emoji: '🩷', color: 'text-cyan-600', level: '認識' };
  if (value < 3) return { emoji: '❤️', color: 'text-emerald-600', level: '友好' };
  if (value < 4) return { emoji: '💗', color: 'text-amber-600', level: '信賴' };
  if (value < 5) return { emoji: '❤️‍🔥', color: 'text-pink-600', level: '親密' };
  return { emoji: '💖', color: 'text-rose-600', level: '命定' };
};


const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  characters, 
  activeCharacterId,
  onSelectCharacter,
  onCloseSidebar,
  onShowSettings,
  onAvatarClick,
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
    <div className="p-4 bg-[#FCE9DA]/80 backdrop-blur-sm shadow-md rounded-xl h-full flex flex-col border border-[#FFCEC7]/50">
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-1">
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-[#FFCEC7]/50 transition-colors md:hidden"
              aria-label="Close sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          {onShowSettings && (
            <button
              onClick={onShowSettings}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-md hover:bg-[#FFCEC7]/50 transition-colors"
              aria-label="開啟玩家設定"
            >
              <SettingsIcon size={20} />
            </button>
          )}
        </div>
        <h2 className="text-xl font-semibold text-stone-800 mt-2">登場角色</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-2 chat-container pt-2 border-t border-[#FFCEC7]/50">
        {sortedCharacters.map((char) => {
            const favorability = favorabilityData[char.id] || 0;
            const { emoji, color, level } = getFavorabilityStyle(favorability);
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
                <div 
                  onClick={(e) => { e.stopPropagation(); onAvatarClick(char.avatar); }}
                  className="w-16 h-16 rounded-lg bg-stone-200 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80 cursor-pointer transition-transform hover:scale-105"
                >
                  {char.avatar.startsWith('http') ? (
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.avatar
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg text-stone-900">{char.name}</p>
                  <div className={`flex items-center gap-1.5 mt-1 text-sm font-medium ${color}`}>
                      <span className="text-base">{emoji}</span>
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