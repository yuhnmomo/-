/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Player, Appearance } from '../types';
import PlayerForm from './PlayerForm';
import { X } from 'lucide-react';

interface SettingsProps {
  player: Player | null;
  onSave: (updatedPlayer: Player) => void;
  maleAppearances: Appearance[];
  femaleAppearances: Appearance[];
  onFullReset: () => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ player, onSave, maleAppearances, femaleAppearances, onFullReset, onClose }) => {
  if (!player) {
    return (
      <div className="flex flex-col h-full bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-md border border-[#FFCEC7]/50 p-4 items-center justify-center">
        <p className="text-stone-500">玩家資料載入中...</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-md border border-[#FFCEC7]/50 p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-stone-500 hover:text-stone-800 bg-[#FFCEC7]/60 rounded-md hover:bg-[#FFCEC7] transition-colors z-10"
        aria-label="關閉設定"
      >
        <X size={20} />
      </button>
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-stone-800">玩家設定</h2>
      </div>
      <PlayerForm
        initialData={player}
        onSave={onSave}
        buttonText="儲存變更"
        maleAppearances={maleAppearances}
        femaleAppearances={femaleAppearances}
      />
      <div className="flex-shrink-0 mt-6 pt-6 border-t border-[#FFCEC7]/50">
        <h3 className="text-lg font-semibold text-red-600 mb-2">危險區域</h3>
        <p className="text-sm text-stone-500 mb-4">
          重新開始將會刪除您所有的遊戲進度，包括對話紀錄與好感度。此操作無法復原。
        </p>
        <button
          onClick={onFullReset}
          className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          重新開始遊戲
        </button>
      </div>
    </div>
  );
};

export default Settings;