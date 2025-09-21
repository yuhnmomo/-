/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Player, Appearance } from '../types';
import PlayerForm from './PlayerForm';

interface CharacterCreationProps {
  onCreationComplete: (playerData: Player) => void;
  maleAppearances: Appearance[];
  femaleAppearances: Appearance[];
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCreationComplete, maleAppearances, femaleAppearances }) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-black/50">
        <div className="flex flex-col h-full max-h-[95vh] w-full max-w-lg bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#FFCEC7]/50 p-6 m-4">
            <div className="text-center mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-stone-800 mb-2">🚂 創建您的角色</h1>
                <p className="text-stone-600">
                    歡迎來到魔幻列車！請完成您的個人資料以開始旅程。
                </p>
            </div>
            <PlayerForm
                initialData={null}
                onSave={onCreationComplete}
                buttonText="開啟旅程"
                maleAppearances={maleAppearances}
                femaleAppearances={femaleAppearances}
            />
        </div>
    </div>
  );
};

export default CharacterCreation;