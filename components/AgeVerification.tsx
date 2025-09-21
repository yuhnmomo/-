/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface AgeVerificationProps {
  onVerify: () => void;
}

const AgeVerification: React.FC<AgeVerificationProps> = ({ onVerify }) => {
  return (
    <div className="flex items-center justify-center h-full w-full bg-black/50">
      <div className="bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-lg border border-[#FFCEC7]/50 p-8 max-w-md text-center m-4">
        <h1 className="text-2xl font-bold text-stone-800 mb-4">🔞 年齡確認</h1>
        <p className="text-stone-600 mb-6">
          本遊戲包含限制級內容，請確認您已年滿18歲。
        </p>
        <button
          onClick={onVerify}
          className="w-full bg-[#E098AE] hover:bg-[#d4879d] text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFD0A6]"
        >
          我已年滿18歲，進入遊戲
        </button>
      </div>
    </div>
  );
};

export default AgeVerification;