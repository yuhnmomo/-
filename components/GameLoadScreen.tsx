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
      <div className="bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#FFCEC7]/50 p-8 max-w-md text-center m-4">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">🚂 歡迎回來</h1>
        <p className="text-stone-600 mb-6">
          偵測到您上次的冒險紀錄。您想要接續旅程，還是重新開啟一趟新的冒險？
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onContinue}
            className="w-full bg-[#E098AE] hover:bg-[#d4879d] text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD0A6]"
          >
            繼續旅程
          </button>
          <button
            onClick={onNewGame}
            className="w-full bg-[#FFD0A6] hover:bg-[#fcc392] text-stone-700 font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFCEC7]"
          >
            重新開始
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLoadScreen;