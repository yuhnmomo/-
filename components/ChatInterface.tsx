/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Character, MessageSender, Player } from '../types'; 
import MessageItem from './MessageItem';
import { Send, Users, RefreshCw, BookUser, Smile, Menu } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  activeCharacter: Character | null;
  player: Player | null;
  favorability?: number;
  onRestartConversation: (characterId: string) => void;
  onOpenSidebar: () => void;
  onSetView: (view: 'chat' | 'settings' | 'notebook') => void;
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
  onOpenSidebar,
  onSetView,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const EMOJIS = ['😍','❤️','😘','🫣','🤤','😑','😒','🙄','😬','😮‍💨','😡','💋','💢','💦','🥺','🥹','😝','😆','🤣','😂','😰','😤','😭','😱','💖','😽','🥵','😵','😎'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'; // Reset height to recalculate
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [userQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  
  const handleEmojiSelect = (emoji: string) => {
    setUserQuery(prev => prev + emoji);
  };


  const placeholderText = activeCharacter 
    ? `與 ${activeCharacter.name} 對話...`
    : '請選擇一位角色開始對話';


  return (
    <div className="flex flex-col h-full bg-[#FCE9DA]/80 backdrop-blur-sm rounded-xl shadow-md border border-[#FFCEC7]/50">
      <div className="p-4 border-b border-[#FFCEC7]/50 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
              onClick={onOpenSidebar}
              className="p-2 bg-[#FCE9DA]/80 backdrop-blur-sm rounded-md text-stone-700 hover:bg-[#FFCEC7] transition-colors"
              aria-label="開啟角色列表"
          >
              <Menu size={20} />
          </button>
          {activeCharacter ? (
            <>
              <div className="w-16 h-16 rounded-lg bg-stone-200 flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80">
                {activeCharacter.avatar.startsWith('http') ? (
                  <img src={activeCharacter.avatar} alt={activeCharacter.name} className="w-full h-full object-cover" />
                ) : (
                  activeCharacter.avatar
                )}
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <h2 className="text-2xl font-semibold text-stone-800">{activeCharacter.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onSetView('notebook')}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 rounded-md bg-[#FFCEC7]/60 hover:bg-[#FFCEC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="查看角色筆記本"
                    >
                      <BookUser size={14} />
                      <span>筆記本</span>
                    </button>
                    <button 
                      onClick={handleRestart}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-600 hover:text-stone-900 rounded-md bg-[#FFCEC7]/60 hover:bg-[#FFCEC7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="重新開始對話"
                    >
                      <RefreshCw size={14} />
                       <span>重置對話</span>
                    </button>
                    {activeCharacter.description && (
                      <p className="text-xs text-stone-500 pl-2 border-l border-stone-400/30">
                        {activeCharacter.description}
                      </p>
                    )}
                </div>
              </div>
            </>
          ) : (
             <h2 className="text-xl font-semibold text-stone-800">魔幻列車聊天室</h2>
          )}
        </div>
      </div>
      
      {player && (
        <div className="p-2 px-4 text-sm text-stone-700 bg-[#FFCEC7]/40 border-b border-[#FFCEC7]/50 flex flex-wrap items-center gap-x-4 gap-y-1 flex-shrink-0">
          <span>玩家：{player.name} ({player.nickname} / {player.salutation})</span>
          <span>⚤ 性別：{player.gender}</span>
          <span>👤 外觀：{player.appearance.name}</span>
          <span>⭐ 星座：{player.zodiac}</span>
          <span className="font-bold text-[#E098AE]">️‍🔥 情慾：{player.lust}/100</span>
          <span className="font-bold text-[#E098AE]">💞 好感度：{getFavorabilityLevelString(favorability)}</span>
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
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-500">
              <Users size={48} className="mb-4" />
              <h3 className="text-lg font-semibold text-stone-900">歡迎來到魔幻列車</h3>
              <p className="max-w-xs">請從側邊欄選擇一位角色開始對話。</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="relative p-4 border-t border-[#FFCEC7]/50 bg-transparent rounded-b-xl flex-shrink-0">
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-full left-4 mb-2 w-fit bg-white border border-gray-200 rounded-lg p-2 shadow-lg flex flex-wrap gap-2 max-w-[280px]">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                className="text-2xl p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label={`insert emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <textarea
            ref={textareaRef}
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder={placeholderText}
            className="flex-grow max-h-20 min-h-[40px] py-2 px-3 border border-[#FFD0A6]/50 bg-[#FFFCF9] text-stone-800 placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-[#FFD0A6] transition-shadow resize-none text-sm chat-container"
            rows={1}
            disabled={isLoading || !activeCharacter}
          />
          <button
            ref={emojiButtonRef}
            onClick={() => setShowEmojiPicker(prev => !prev)}
            disabled={isLoading || !activeCharacter}
            className="h-10 w-10 p-2 bg-[#FFD0A6]/80 hover:bg-[#FFD0A6] text-stone-700 rounded-lg transition-colors disabled:bg-[#FFCEC7] disabled:text-stone-500 flex items-center justify-center flex-shrink-0"
            aria-label="選擇表情符號"
          >
            <Smile size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || !userQuery.trim() || !activeCharacter}
            className="h-10 w-10 p-2 bg-[#E098AE] hover:bg-[#d4879d] text-white rounded-lg transition-colors disabled:bg-[#FFCEC7] disabled:text-stone-500 flex items-center justify-center flex-shrink-0"
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