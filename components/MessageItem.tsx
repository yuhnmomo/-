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
  // Case 1: Player has an uploaded avatar (keep it round for player)
  if (sender === MessageSender.USER && player?.avatar) {
    return (
      <div className="w-10 h-10 rounded-full bg-orange-200 flex-shrink-0 overflow-hidden">
        <img src={player.avatar} alt={player.nickname} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Case 2: Model has an image URL avatar (change to square)
  if (sender === MessageSender.MODEL && avatar?.startsWith('http')) {
    return (
      <div className="w-10 h-10 rounded-lg bg-stone-200 flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80">
        <img src={avatar} alt="character avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Case 3: Text or Emoji Avatars
  let avatarContent: string | JSX.Element = '';
  let bgColorClass = '';
  let textColorClass = 'text-stone-800';
  let fontSizeClass = '';
  let shapeClass = 'rounded-full'; // Default to round

  switch (sender) {
    case MessageSender.USER:
      avatarContent = player?.nickname || 'U';
      bgColorClass = 'bg-[#FFD0A6]';
      // Use smaller font for full name to fit in the circle.
      fontSizeClass = 'text-sm font-semibold';
      shapeClass = 'rounded-full';
      break;
    case MessageSender.MODEL:
      avatarContent = avatar || 'AI';
      bgColorClass = 'bg-stone-200';
      fontSizeClass = 'text-base font-semibold';
      shapeClass = 'rounded-lg';
      break;
    case MessageSender.SYSTEM:
    default:
      avatarContent = 'S';
      bgColorClass = 'bg-stone-300';
      fontSizeClass = 'text-base font-semibold';
      shapeClass = 'rounded-full';
      break;
  }
  
  const isEmoji = typeof avatarContent === 'string' && /\p{Emoji}/u.test(avatarContent);
  if (isEmoji) {
    fontSizeClass = 'text-2xl';
    bgColorClass = 'bg-transparent';
  }
  
  const extraStyles = sender === MessageSender.MODEL && !isEmoji ? 'shadow-md border-2 border-white/80' : '';


  return (
    <div className={`w-10 h-10 ${shapeClass} ${bgColorClass} ${textColorClass} flex items-center justify-center text-center ${fontSizeClass} flex-shrink-0 p-0.5 ${extraStyles}`}>
      {avatarContent}
    </div>
  );
};

const MessageItem: React.FC<MessageItemProps> = ({ message, character, player }) => {
  if (message.type === 'summary' || message.type === 'milestone') {
      const isSummary = message.type === 'summary';
      const bgColor = isSummary ? 'bg-[#FFCEC7]/50 border-[#FFCEC7]' : 'bg-[#FFD0A6]/50 border-[#FFD0A6]';
      const icon = isSummary ? '💖' : '💞';
      const textColor = isSummary ? 'text-[#b17887]' : 'text-[#cc8b5a]';

      return (
          <div className={`my-4 text-center text-sm ${textColor}`}>
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
  let textColorClass = 'text-stone-800';

  if (isUser) {
    bubbleClasses += 'bg-[#E098AE]';
    textColorClass = 'text-white';
  } else if (isModel) {
    bubbleClasses += 'bg-white';
    textColorClass = 'text-stone-800';
  } else { // System message
    bubbleClasses += "bg-yellow-200";
    textColorClass = 'text-yellow-900';
  }

  const renderMessageContent = () => {
    if (isModel && !message.isLoading) {
      const proseClasses = `prose prose-base w-full min-w-0 ${textColorClass}`;
      const rawMarkup = marked.parse(message.text || "") as string;
      return <div className={proseClasses} dangerouslySetInnerHTML={{ __html: rawMarkup }} />;
    }
    
    return <div className={`whitespace-pre-wrap text-base ${textColorClass}`}>{message.text}</div>;
  };
  
  const bubble = (
    <div className={bubbleClasses}>
      {message.isLoading ? (
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
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
        {senderName && <p className="text-sm text-stone-500 mb-1 px-1">{senderName}</p>}
        
        {isModel && message.playerThought && message.characterThought && player && character ? (
          <div className="w-full">
            <div className="w-full p-2.5 mb-1.5 rounded-lg bg-[#FFCEC7]/30 border border-[#FFCEC7]/80 text-sm text-stone-700">
              <p className="font-semibold text-xs text-stone-500 mb-2 uppercase tracking-wider">
                  {character.name.split(' (')[0]} 的內心觀察
              </p>
              <p className="mb-1 italic">
                  <span className="font-semibold text-stone-600 not-italic">（對你的猜想）：</span>
                  {message.playerThought}
              </p>
              <p className="italic">
                  <span className="font-semibold text-stone-600 not-italic">（自己的想法）：</span>
                  {message.characterThought}
              </p>
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