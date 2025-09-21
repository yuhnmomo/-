/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Character, MessageSender, Player } from '../types'; 
import MessageItem from './MessageItem';
import { Send, Users, RefreshCw, BookUser } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  activeCharacter: Character | null;
  player: Player | null;
  favorability?: number;
  onRestartConversation: (characterId: string) => void;
  onSetView: (view: 'chat' | 'status' | 'settings' | 'notebook') => void;
}

const getFavorabilityLevelString = (value: number): string => {
  if (value < 0) return "敵對";
  if (value < 1) return "陌生";
  if (value < 2) return "認識";
  if (value < 3) return "友好";
  if (value < 4) return "信賴";
  if (value < 5) return "親密";
  return "命定";
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  activeCharacter,
  player,
  favorability = 0,
  onRestartConversation,
  onSetView,
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
  
  const handleRestart = () => {
    if (activeCharacter && window.confirm(`您確定要重新開始與 ${activeCharacter.name.split(' (')[0]} 的對話嗎？\n\n系統會先為您將整段對話生成一份最終摘要並存入筆記本，好感度不會受到影響。`)) {
      onRestartConversation(activeCharacter.id);
    }
  };

  const placeholderText = activeCharacter 
    ? `與 ${activeCharacter.name} 對話...`
    : '請選擇一位角色開始對話';


  return (
    <div className="flex flex-col h-full bg-[#20232c]/80 backdrop-blur-sm rounded-xl shadow-md border border-white/10">
      <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          {activeCharacter ? (
            <>
              <div className="w-16 h-16 rounded-full bg-[#333744] flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden ml-20 md:ml-0">
                {activeCharacter.avatar.startsWith('http') ? (
                  <img src={activeCharacter.avatar} alt={activeCharacter.name} className="w-full h-full object-cover" />
                ) : (
                  activeCharacter.avatar
                )}
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <h2 className="text-2xl font-semibold text-[#EFEFF1]">{activeCharacter.name}</h2>
                <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSetView('notebook')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="查看角色筆記本"
                    >
                      <BookUser size={14} />
                      <span>筆記本</span>
                    </button>
                    <button 
                      onClick={handleRestart}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-300 hover:text-white rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="重新開始對話"
                    >
                      <RefreshCw size={14} />
                       <span>重置對話</span>
                    </button>
                </div>
              </div>
            </>
          ) : (
             <h2 className="text-xl font-semibold text-[#EFEFF1] ml-14 md:ml-0">魔幻列車聊天室</h2>
          )}
        </div>
      </div>
      
      {player && (
        <div className="p-2 px-4 text-sm text-[#C9CBE0] bg-black/20 border-b border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1 flex-shrink-0">
          <span>玩家：{player.name} ({player.nickname} / {player.salutation})</span>
          <span>⚤ 性別：{player.gender}</span>
          <span>👤 外觀：{player.appearance.name}</span>
          <span>⭐ 星座：{player.zodiac}</span>
          <span className="font-bold text-[#ECD4D4]/90">️‍🔥 情慾：{player.lust}/100</span>
          <span className="font-bold text-[#ECD4D4]/90">💞 好感度：{getFavorabilityLevelString(favorability)}</span>
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