/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Character, Player } from '../types';
import { Heart } from 'lucide-react';

const getFavorabilityLevelString = (value: number): string => {
  if (value < 0) return "敵對";
  if (value < 1) return "陌生";
  if (value < 2) return "認識";
  if (value < 3) return "友好";
  if (value < 4) return "信賴";
  if (value < 5) return "親密";
  return "命定";
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
    <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10 p-4">
      <h2 className="text-2xl font-semibold text-gray-200 mb-6 text-center">關係狀態總覽</h2>
      <div className="flex-grow overflow-y-auto chat-container pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters
            .filter(c => c.id !== 'system_creator')
            .map(char => {
            const favorability = favorabilityData[char.id] || 0;
            const level = getFavorabilityLevelString(favorability);
            return (
              <div 
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className="bg-black/30 rounded-lg p-4 flex flex-col items-center text-center border border-white/10 hover:border-[#ECD4D4] hover:bg-black/50 transition-all cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full bg-[#333744] flex items-center justify-center text-4xl mb-3 overflow-hidden flex-shrink-0">
                  {char.avatar.startsWith('http') ? (
                    <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    char.avatar
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-200">{char.name.split(' (')[0]}</h3>
                <div className="flex items-center gap-2 mt-2 text-[#ECD4D4]">
                  <Heart size={16} />
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