/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { Save, X } from 'lucide-react';

interface NotebookProps {
  character: Character;
  note: string;
  onSave: (characterId: string, note: string) => void;
  onClose: () => void;
}

const Notebook: React.FC<NotebookProps> = ({ character, note, onSave, onClose }) => {
  const [currentNote, setCurrentNote] = useState(note);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCurrentNote(note);
  }, [note, character.id]);

  const handleSave = () => {
    onSave(character.id, currentNote);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10 p-4">
      <div className="flex-shrink-0 mb-4 pb-4 border-b border-white/10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#333744] flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
          {character.avatar.startsWith('http') ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            character.avatar
          )}
        </div>
        <div>
            <h2 className="text-2xl font-semibold text-gray-200">角色筆記本</h2>
            <p className="text-gray-400">關於 {character.name.split(' (')[0]} 的筆記</p>
        </div>
      </div>
      <textarea
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        placeholder={`在這裡寫下關於 ${character.name.split(' (')[0]} 的觀察、線索或計畫...`}
        className="flex-grow w-full bg-[#1a1c23] border border-white/20 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ECD4D4] focus:border-[#ECD4D4] resize-none chat-container text-sm"
      />
      <div className="flex-shrink-0 mt-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex-grow flex items-center justify-center gap-2 bg-[#ECD4D4] hover:bg-[#d9c1c1] text-[#20232c] font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <Save size={18} />
          {isSaved ? '筆記已儲存！' : '儲存筆記'}
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <X size={18} />
          關閉筆記
        </button>
      </div>
    </div>
  );
};

export default Notebook;