/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface GameLoadScreenProps {
  onContinue: () => void;
  onNewGame: () => void;
}

const GameLoadScreen: React.FC<GameLoadScreenProps> = ({ onContinue, onNewGame }) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-black/50">
      <div className="bg-[#20232c]/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/10 p-8 max-w-md text-center m-4">
        <h1 className="text-2xl font-bold text-white mb-4">🚂 歡迎回來</h1>
        <p className="text-gray-300 mb-6">
          偵測到您上次的冒險紀錄。您想要接續旅程，還是重新開啟一趟新的冒險？
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onContinue}
            className="w-full bg-[#ECD4D4] hover:bg-[#d9c1c1] text-[#20232c] font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#ECD4D4]"
          >
            繼續旅程
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            重新開始
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLoadScreen;
