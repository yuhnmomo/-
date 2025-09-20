/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { X, Settings, BookUser } from 'lucide-react';
import { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  activeCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  onCloseSidebar?: () => void;
  onSetView: (view: 'chat' | 'status' | 'settings' | 'notebook') => void;
  currentView: 'chat' | 'status' | 'settings' | 'notebook';
  favorabilityData: Record<string, number>;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ 
  characters, 
  activeCharacterId,
  onSelectCharacter,
  onCloseSidebar,
  onSetView,
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
    <div className="p-4 bg-[#20232c]/80 backdrop-blur-sm shadow-md rounded-xl h-full flex flex-col border border-white/10">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-[#EFEFF1]">登場角色</h2>
        {onCloseSidebar && (
          <button
            onClick={onCloseSidebar}
            className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <div className="flex-shrink-0 mb-4 space-y-2">
        <button
          onClick={() => onSetView('status')}
          className={`w-full p-2.5 rounded-lg text-left transition-colors text-[#EFEFF1] font-semibold flex items-center gap-2 ${
            currentView === 'status' ? 'bg-[#ECD4D4]/50' : 'hover:bg-white/10'
          }`}
        >
          💞 關係狀態總覽
        </button>
        <button
          onClick={() => {
            if (activeCharacterId) {
                onSetView('notebook');
            } else {
                alert('請先選擇一位角色以查看筆記本。');
            }
          }}
          className={`w-full p-2.5 rounded-lg text-left transition-colors text-[#EFEFF1] font-semibold flex items-center gap-2 ${
            currentView === 'notebook' ? 'bg-[#ECD4D4]/50' : 'hover:bg-white/10'
          } ${!activeCharacterId ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <BookUser size={16} className="mr-1" /> 角色筆記本
        </button>
        <button
          onClick={() => onSetView('settings')}
          className={`w-full p-2.5 rounded-lg text-left transition-colors text-[#EFEFF1] font-semibold flex items-center gap-2 ${
            currentView === 'settings' ? 'bg-[#ECD4D4]/50' : 'hover:bg-white/10'
          }`}
        >
          <Settings size={16} className="mr-1" /> 玩家設定
        </button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-2 chat-container pt-2 border-t border-white/10">
        {sortedCharacters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelectCharacter(char.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
              activeCharacterId === char.id && currentView === 'chat'
                ? 'bg-[#ECD4D4]/50'
                : 'hover:bg-white/10'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#333744] flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {char.avatar.startsWith('http') ? (
                <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
              ) : (
                char.avatar
              )}
            </div>
            <div>
              <p className="font-semibold text-[#EFEFF1]">{char.name}</p>
              <p className="text-xs text-gray-400 line-clamp-2">
                {char.persona.split('.')[0]}.
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CharacterSelector;