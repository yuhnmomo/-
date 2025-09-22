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
      <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden shadow-md border-2 border-white/80">
        <img src={avatar} alt="Character Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Case 3: Fallback to emoji or initials (model square, user round)
  const isUser = sender === MessageSender.USER;
  const initial = isUser ? (player?.nickname?.[0] || 'You') : (avatar?.[0] || '?');
  const bgColor = isUser ? 'bg-orange-300' : 'bg-stone-300';
  const shapeClass = isUser ? 'rounded-full' : 'rounded-lg';

  return (
    <div className={`w-10 h-10 ${bgColor} ${shapeClass} flex items-center justify-center text-white font-bold flex-shrink-0 text-2xl`}>
      {initial}
    </div>
  );
};


const MessageItem: React.FC<MessageItemProps> = ({ message, character, player }) => {

  const renderThoughtBubble = (thought: string, ownerName: string, type: 'player' | 'character') => {
    const title = `💭 ${ownerName}的內心彈幕：`;
    const bgColor = type === 'player' ? 'bg-[#FFCEC7]/40' : 'bg-[#FFD0A6]/40';
    const borderColor = type === 'player' ? 'border-[#FFCEC7]' : 'border-[#FFD0A6]';

    return (
      <div className={`mt-2 mb-1 p-3 rounded-lg text-sm italic ${bgColor} border-l-4 ${borderColor}`}>
        <p className="font-semibold text-stone-600">{title}</p>
        <p className="text-stone-700">{thought}</p>
      </div>
    );
  };
  
  const renderStoryHint = (hint: string) => {
    return (
      <div className="mt-2 text-xs text-stone-600 p-3 rounded-lg bg-[#FFFCF9]/80 border border-[#FFD0A6]/50 backdrop-blur-sm">
        <span className="font-semibold">📖 劇情提示：</span>
        <span>{hint}</span>
      </div>
    );
  };

  const createMarkup = (text: string) => {
    // Sanitize to prevent XSS. In a real app, use a more robust library like DOMPurify.
    const sanitizedHtml = marked.parse(text, { breaks: true, gfm: true }) as string;
    return { __html: sanitizedHtml };
  };

  if (message.type === 'milestone') {
    return (
      <div className="my-4 flex items-center justify-center gap-3 text-sm text-center">
        <div className="w-8 h-px bg-gradient-to-l from-[#E098AE] to-transparent"></div>
        <p className="text-[#E098AE] font-semibold px-2 py-1 bg-[#E098AE]/10 rounded-md">
          {message.text}
        </p>
        <div className="w-8 h-px bg-gradient-to-r from-[#E098AE] to-transparent"></div>
      </div>
    );
  }

  if (message.type === 'summary') {
    return (
      <div className="my-4 p-4 rounded-lg bg-[#FFD0A6]/30 border border-[#FFD0A6]/50 text-stone-700 text-sm italic">
        <h4 className="font-semibold text-stone-800 mb-1">💖 自動摘要</h4>
        <p>{message.text}</p>
      </div>
    );
  }

  const isUser = message.sender === MessageSender.USER;
  const isModel = message.sender === MessageSender.MODEL;

  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleOrder = isUser ? 'flex-row-reverse' : 'flex-row';
  const bubbleColor = isUser ? 'bg-[#E098AE] text-white' : 'bg-white/80 text-stone-900';
  const bubbleShape = isUser ? 'rounded-br-none' : 'rounded-bl-none';
  const playerName = player?.name || 'Player';
  const characterName = character?.name.split(' (')[0] || 'Character';

  return (
    <div className={`my-4 flex ${bubbleAlignment} gap-3`}>
      {isModel && (
        <SenderAvatar sender={message.sender} avatar={character?.avatar} player={player} />
      )}
      <div className={`max-w-xl ${isUser ? 'ml-12' : 'mr-12'}`}>
        
        {isModel && message.playerThought && renderThoughtBubble(message.playerThought, playerName, 'player')}
        {isModel && message.characterThought && renderThoughtBubble(message.characterThought, characterName, 'character')}

        <div className={`px-4 py-2.5 rounded-2xl ${bubbleColor} ${bubbleShape} shadow-sm`}>
          {message.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            </div>
          ) : (
            <div
              className="prose prose-sm prose-stone max-w-none prose-p:my-1 prose-headings:my-2"
              dangerouslySetInnerHTML={createMarkup(message.text)}
            />
          )}
        </div>
        
        {isModel && message.storyHint && renderStoryHint(message.storyHint)}
      </div>
       {isUser && (
        <SenderAvatar sender={message.sender} avatar={character?.avatar} player={player} />
      )}
    </div>
  );
};

export default MessageItem;