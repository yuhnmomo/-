/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Character, MessageSender, Player, CreationStep } from '../types'; 
import MessageItem from './MessageItem';
import { Send, Menu, Users, Paperclip } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  onToggleSidebar?: () => void;
  activeCharacter: Character | null;
  player: Player | null;
  favorability?: number;
  creationStep?: CreationStep;
  onAvatarUpload?: (file: File) => void;
}

const FAVORABILITY_LEVELS: Record<number, string> = {
  "0": "陌生",
  "1": "認識",
  "2": "友好",
  "3": "信賴",
  "4": "親密",
  "5": "命定",
  "-1": "敵對",
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  onToggleSidebar,
  activeCharacter,
  player,
  favorability = 0,
  creationStep,
  onAvatarUpload,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (userQuery.trim() && !isLoading) {
      onSendMessage(userQuery.trim());
      setUserQuery('');
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
    event.target.value = ''; // Reset to allow re-uploading the same file
  };

  const placeholderText = activeCharacter 
    ? `與 ${activeCharacter.name} 對話...`
    : '請選擇一位角色開始對話';


  return (
    <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button 
              onClick={onToggleSidebar}
              className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors md:hidden"
              aria-label="開啟角色選單"
            >
              <Menu size={20} />
            </button>
          )}
          {activeCharacter ? (
            <>
              <div className="w-10 h-10 rounded-full bg-[#333744] flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                {activeCharacter.avatar.startsWith('http') ? (
                  <img src={activeCharacter.avatar} alt={activeCharacter.name} className="w-full h-full object-cover" />
                ) : (
                  activeCharacter.avatar
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#EFEFF1]">{activeCharacter.name}</h2>
              </div>
            </>
          ) : (
             <h2 className="text-xl font-semibold text-[#EFEFF1]">魔幻列車聊天室</h2>
          )}
        </div>
      </div>
      
      {player && activeCharacter?.id !== 'system_creator' && (
        <div className="p-2 px-4 text-xs text-[#C9CBE0] bg-black/20 border-b border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1 flex-shrink-0">
          <span>玩家：{player.name}({player.nickname})</span>
          <span>⚤ 性別：{player.gender}</span>
          <span>👤 外觀：{player.appearance.name}</span>
          <span>⭐ 星座：{player.zodiac}</span>
          <span className="font-bold text-[#ECD4D4]/90">️‍🔥 情慾：{player.lust}/100</span>
          <span className="font-bold text-[#ECD4D4]/90">💞 好感度：{FAVORABILITY_LEVELS[favorability]}</span>
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto chat-container">
        <div className="max-w-4xl mx-auto w-full">
          {activeCharacter ? (
            <>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} character={activeCharacter} player={player} />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <Users size={48} className="mb-4" />
              <h3 className="text-lg font-semibold text-[#EFEFF1]">歡迎來到魔幻列車</h3>
              <p className="max-w-xs">請從側邊欄選擇一位角色開始對話。</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-transparent rounded-b-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder={placeholderText}
            className="flex-grow h-10 min-h-[40px] py-2 px-3 border-none bg-[#1a1c23] text-[#EFEFF1] placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-[#ECD4D4] transition-shadow resize-none text-sm"
            rows={1}
            disabled={isLoading || !activeCharacter}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          {creationStep === CreationStep.AWAITING_AVATAR && (
            <label htmlFor="avatar-upload" className="h-10 w-10 p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer" aria-label="上傳頭像">
              <Paperclip size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
          <button
            onClick={handleSend}
            disabled={isLoading || !userQuery.trim() || !activeCharacter}
            className="h-10 w-10 p-2 bg-[#ECD4D4] hover:bg-[#d9c1c1] text-[#20232c] rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 flex items-center justify-center flex-shrink-0"
            aria-label="傳送訊息"
          >
            {isLoading ? 
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
              : <Send size={20} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;