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
    <div className="flex flex-col h-full bg-[#FCE9DA]/95 backdrop-blur-sm rounded-xl shadow-md border border-[#FFCEC7]/50 p-4">
      <div className="flex-shrink-0 mb-4 pb-4 border-b border-[#FFCEC7]/50 flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-stone-200 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80">
          {character.avatar.startsWith('http') ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            character.avatar
          )}
        </div>
        <div>
            <h2 className="text-2xl font-semibold text-stone-800">角色筆記本</h2>
            <p className="text-stone-500">關於 {character.name.split(' (')[0]} 的筆記</p>
        </div>
      </div>
      <textarea
        value={currentNote}
        onChange={(e) => setCurrentNote(e.target.value)}
        placeholder={`在這裡寫下關於 ${character.name.split(' (')[0]} 的觀察、線索或計畫...`}
        className="flex-grow w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg p-3 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6] resize-none chat-container text-sm"
      />
      <div className="flex-shrink-0 mt-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          className="flex-grow flex items-center justify-center gap-2 bg-[#E098AE] hover:bg-[#d4879d] text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <Save size={18} />
          {isSaved ? '筆記已儲存！' : '儲存筆記'}
        </button>
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 bg-[#FFD0A6] hover:bg-[#fcc392] text-stone-700 font-bold py-3 px-4 rounded-lg transition-colors"
        >
          <X size={18} />
          關閉筆記
        </button>
      </div>
    </div>
  );
};

export default Notebook;