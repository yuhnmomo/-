/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Player, Appearance } from '../types';
import PlayerForm from './PlayerForm';

interface SettingsProps {
  player: Player | null;
  onSave: (updatedPlayer: Player) => void;
  maleAppearances: Appearance[];
  femaleAppearances: Appearance[];
  // FIX: Add onFullReset prop to fix type error from App.tsx and allow game reset.
  onFullReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ player, onSave, maleAppearances, femaleAppearances, onFullReset }) => {
  if (!player) {
    return (
      <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10 p-4 items-center justify-center">
        <p className="text-gray-400">玩家資料載入中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10 p-4">
      <div className="text-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-200">玩家設定</h2>
      </div>
      <PlayerForm
        initialData={player}
        onSave={onSave}
        buttonText="儲存變更"
        maleAppearances={maleAppearances}
        femaleAppearances={femaleAppearances}
      />
      <div className="flex-shrink-0 mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-red-400 mb-2">危險區域</h3>
        <p className="text-sm text-gray-400 mb-4">
          重新開始將會刪除您所有的遊戲進度，包括對話紀錄與好感度。此操作無法復原。
        </p>
        <button
          onClick={onFullReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          重新開始遊戲
        </button>
      </div>
    </div>
  );
};

export default Settings;
