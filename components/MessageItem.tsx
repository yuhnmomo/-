/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
// FIX: Remove MessageType as it's not an exported member of types.ts.
import { ChatMessage, MessageSender, Player, Character } from '../types';

marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
} as any);

interface MessageItemProps {
  message: ChatMessage;
  character?: Character | null;
  player?: Player | null;
}

const getCharacterGender = (character: Character | null | undefined): '男' | '女' | 'unknown' => {
  if (!character || !character.persona) {
    return 'unknown';
  }
  if (character.persona.includes('男性')) {
    return '男';
  }
  if (character.persona.includes('女性')) {
    return '女';
  }
  return 'unknown';
};


const SenderAvatar: React.FC<{ sender?: MessageSender, avatar?: string, player?: Player | null }> = ({ sender, avatar, player }) => {
  // Case 1: Player has an uploaded avatar
  if (sender === MessageSender.USER && player?.avatar) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#ECD4D4] flex-shrink-0 overflow-hidden">
        <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Case 2: Model has an image URL avatar
  if (sender === MessageSender.MODEL && avatar?.startsWith('http')) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#333744] flex-shrink-0 overflow-hidden">
        <img src={avatar} alt="character avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Case 3: Text or Emoji Avatars
  let avatarContent: string | JSX.Element = '';
  let bgColorClass = '';
  let textColorClass = 'text-[#20232c]';
  let fontSizeClass = '';

  switch (sender) {
    case MessageSender.USER:
      avatarContent = player?.nickname || 'U';
      bgColorClass = 'bg-[#ECD4D4]';
      // Use smaller font for full name to fit in the circle.
      fontSizeClass = 'text-xs font-semibold';
      break;
    case MessageSender.MODEL:
      avatarContent = avatar || 'AI';
      bgColorClass = 'bg-[#CCDBE2]';
      fontSizeClass = 'text-sm font-semibold';
      break;
    case MessageSender.SYSTEM:
    default:
      avatarContent = 'S';
      bgColorClass = 'bg-[#C9CBE0]';
      fontSizeClass = 'text-sm font-semibold';
      break;
  }
  
  const isEmoji = typeof avatarContent === 'string' && /\p{Emoji}/u.test(avatarContent);
  if (isEmoji) {
    fontSizeClass = 'text-xl';
    bgColorClass = 'bg-transparent';
  }

  return (
    <div className={`w-8 h-8 rounded-full ${bgColorClass} ${textColorClass} flex items-center justify-center text-center ${fontSizeClass} flex-shrink-0 p-0.5`}>
      {avatarContent}
    </div>
  );
};

const MessageItem: React.FC<MessageItemProps> = ({ message, character, player }) => {
  if (message.type === 'summary' || message.type === 'milestone') {
      const isSummary = message.type === 'summary';
      const bgColor = isSummary ? 'bg-[#C9CBE0]/10 border-[#C9CBE0]/30' : 'bg-[#ECD4D4]/10 border-[#ECD4D4]/30';
      const icon = isSummary ? '💖' : '💞';
      const textColor = isSummary ? 'text-[#C9CBE0]' : 'text-[#ECD4D4]';

      return (
          <div className={`my-4 text-center text-xs ${textColor}`}>
              <div className={`inline-block p-2 px-4 rounded-full border ${bgColor}`}>
                  <span className="mr-2">{icon}</span>
                  {message.text}
              </div>
          </div>
      );
  }


  const isUser = message.sender === MessageSender.USER;
  const isModel = message.sender === MessageSender.MODEL;

  let bubbleClasses = "p-3 rounded-lg shadow w-full "; 
  let textColorClass = 'text-gray-100';

  if (isUser && player) {
    if (player.gender === '男') {
      bubbleClasses += 'bg-blue-700';
      textColorClass = 'text-blue-200';
    } else {
      bubbleClasses += 'bg-purple-700';
      textColorClass = 'text-purple-200';
    }
  } else if (isModel && character) {
    const gender = getCharacterGender(character);
    if (gender === '男') {
      bubbleClasses += 'bg-blue-800';
      textColorClass = 'text-blue-200';
    } else if (gender === '女') {
      bubbleClasses += 'bg-purple-800';
      textColorClass = 'text-purple-200';
    } else {
      bubbleClasses += 'bg-gray-700';
      textColorClass = 'text-gray-200';
    }
  } else { // System message
    bubbleClasses += "bg-[#C9CBE0]";
    textColorClass = 'text-[#1a1c23]';
  }

  const renderMessageContent = () => {
    if (isModel && !message.isLoading) {
      const proseClasses = `prose prose-sm prose-invert w-full min-w-0 ${textColorClass}`;
      const rawMarkup = marked.parse(message.text || "") as string;
      return <div className={proseClasses} dangerouslySetInnerHTML={{ __html: rawMarkup }} />;
    }
    
    return <div className={`whitespace-pre-wrap text-sm ${textColorClass}`}>{message.text}</div>;
  };
  
  const bubble = (
    <div className={bubbleClasses}>
      {message.isLoading ? (
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      ) : (
        renderMessageContent()
      )}
    </div>
  );

  const senderName = isUser 
    ? player?.name 
    : (isModel ? character?.name.split(' (')[0] : null);

  return (
    <div className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <SenderAvatar sender={message.sender} avatar={character?.avatar} player={player} />
      <div className={`flex flex-col w-full max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {senderName && <p className="text-xs text-gray-400 mb-1 px-1">{senderName}</p>}
        
        {isModel && message.playerThought && message.characterThought && player && character ? (
          <div className="w-full">
            <div className="w-full p-2.5 mb-1.5 rounded-lg bg-black/30 border border-white/10 text-xs italic text-[#C9CBE0]">
              <p className="mb-1">💭 {player.nickname}： {message.playerThought}</p>
              <p>💭 {character.name.split(' (')[0]}： {message.characterThought}</p>
            </div>
            {bubble}
          </div>
        ) : (
          bubble
        )}
      </div>
    </div>
  );
};

export default MessageItem;