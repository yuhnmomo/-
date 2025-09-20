/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Character, Player } from '../types';
import { Heart } from 'lucide-react';

const FAVORABILITY_LEVELS: Record<number, string> = {
  "0": "陌生",
  "1": "認識",
  "2": "友好",
  "3": "信賴",
  "4": "親密",
  "5": "命定",
  "-1": "敵對",
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
            const level = FAVORABILITY_LEVELS[favorability];
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