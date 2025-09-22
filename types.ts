/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum MessageSender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface Character {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  persona: string; // System instruction for the AI model
  greeting: string; // The character's first message
  description?: string;
}

export interface ChatMessage {
  id: string;
  // FIX: Add message type to support different kinds of messages in the chat interface.
  type: 'chat' | 'summary' | 'milestone';
  text: string;
  sender: MessageSender;
  timestamp: Date;
  isLoading?: boolean;
  playerThought?: string;
  characterThought?: string;
  storyHint?: string;
}

// --- TYPES FOR CHARACTER CREATION ---

export interface Attributes {
  O: number; // Observation
  I: number; // Insight
  B: number; // Body
  S: number; // Social
}

export interface Appearance {
  id: string;
  name: string;
  description: string;
  attributes: Attributes;
}

export interface Player {
  gender: '男' | '女';
  name: string;
  nickname: string;
  salutation: string;
  zodiac: string;
  appearance: Appearance;
  attributes: Attributes;
  lust: number;
  avatar?: string;
}