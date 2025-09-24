/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Character, Player } from '../types';
import { Heart } from 'lucide-react';

const getFavorabilityStyle = (value: number): { emoji: string; color: string; level: string } => {
  if (value < 0) return { emoji: '💔', color: 'text-slate-500', level: '敵對' };
  if (value < 1) return { emoji: '🤍', color: 'text-stone-500', level: '陌生' };
  if (value < 2) return { emoji: '🩷', color: 'text-cyan-600', level: '認識' };
  if (value < 3) return { emoji: '❤️', color: 'text-emerald-600', level: '友好' };
  if (value < 4) return { emoji: '💗', color: 'text-amber-600', level: '信賴' };
  if (value < 5) return { emoji: '❤️‍🔥', color: 'text-pink-600', level: '親密' };
  return { emoji: '💖', color: 'text-rose-600', level: '命定' };
};

interface RelationshipStatusProps {
  characters: Character[];
  player: Player | null;
  favorabilityData: Record<string, number>;
  onSelectCharacter: (id: string) => void;
}

const RelationshipStatus: React.FC<RelationshipStatusProps> = ({ characters, player, favorabilityData, onSelectCharacter }) => {
  if (!player) return null;

  return (
    <div className="flex flex-col h-full bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-md border border-[#FFCEC7]/50 p-4">
      <h2 className="text-2xl font-semibold text-stone-800 mb-6 text-center">關係狀態總覽</h2>
      <div className="flex-grow overflow-y-auto chat-container pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters
            .filter(c => c.id !== 'system_creator')
            .map(char => {
            const favorability = favorabilityData[char.id] || 0;
            const { emoji, color, level } = getFavorabilityStyle(favorability);
            return (
              <div 
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className="bg-white/50 rounded-lg p-4 flex flex-col items-center text-center border border-transparent hover:border-[#E098AE] hover:bg-[#FFCEC7]/50 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-lg bg-stone-200 flex items-center justify-center text-4xl mb-3 overflow-hidden flex-shrink-0 shadow-md border-2 border-white/80">
                  {char.avatar.startsWith('http') ? (
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.avatar
                  )}
                </div>
                <h3 className="font-semibold text-lg text-stone-800">{char.name.split(' (')[0]}</h3>
                <div className={`flex items-center gap-2 mt-2 ${color}`}>
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium text-sm">{level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RelationshipStatus;