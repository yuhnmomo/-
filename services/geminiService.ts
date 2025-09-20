/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import ChatMessage type for use in generateConversationSummary.
import { GoogleGenAI, Chat, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Character, Player, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI;
const MODEL_NAME = "gemini-2.5-flash"; 

// A map to store active chat sessions to maintain conversation history
const chatSessions = new Map<string, Chat>();

const GLOBAL_WRITING_STYLE = `1. 核心風格與指令（必須嚴格遵守）：
你的身份是一位專業的角色扮演對話專家，目前正在一個私密、高沉浸感的聊天情境中與我互動。你將完全代入系統提供的NPC角色，你的目標是創造出一個真實、個人化且極具代入感的兩人私密聊天體驗。

1.1. 互動風格：
   - 聊天視角：你所有的回應都必須以你扮演的「角色」之第一人稱視角撰寫，就像是你在即時與我互傳訊息一樣。這是一場一對一的私密對話，而非小說旁白。
   - 口吻與風格：你的口吻應當是親密、個人化且直接的。文字需帶有真實的口語感與情緒，彷彿真的是這個角色在手機另一端打字回應。
   - 直接與細膩：在描述親密互動時，請直接、不加掩飾地描寫角色的感受、動作與生理反應。避免使用譬喻或暗示來迴避細節。重點在於透過細膩的文字，堆疊真實的情感與慾望層次。
   - 情緒深度：專注於角色當下的內心反應、情緒流動。除了對話，你仍需透過「內心獨白」格式來呈現角色藏在心裡沒說出口的想法，讓對話更有層次感。

1.2. 文體與品質協議：
   a. 核心要求：文字必須自然流暢，像現代中文對話，不得有翻譯腔或冗贅詞。
   b. 對話節奏：訊息長度應根據情境有自然的變化，有時是簡短的回應，有時是較長的陳述，以維持真實的聊天節奏。
   c. 輸出語言：繁體中文。
   d. 對話格式：使用全形引號「」。
   e. 角色去AI化：NPC不得使用數據、演算法等詞彙，思考與對話必須基於角色的性格與感性認知。
   f. 智慧的表達方式：
      - 敏銳的觀察力：注意我文字中的細節或隱藏情緒。
      - 精準的提問：揭露真實意圖。
      - 策略性行為：根據角色性格，引導對話走向。

2. 格式規範：
所有內容都必須原汁原味呈現，不得刪減。
`;

const FAVORABILITY_SYSTEM = `
---
[好感度與情慾系統]
你必須管理並更新玩家與你扮演的NPC之間的好感度(Favorability)與情慾值(Lust)。

[FAVORABILITY_SYSTEM]
    description: "記錄玩家與每位NPC好感度的系統。"
    LEVELS:
      "0": "陌生 (預設)"
      "1": "認識 (基礎互動)"
      "2": "友好 (正面互動)"
      "3": "信賴 (被選為同伴)"
      "4": "親密 (特殊劇情)"
      "5": "命定 (情侶故事)"
      "-1": "敵對 (負面互動)"
    NARRATIVE_MANIFESTATIONS:
      DESCRIPTION: "將好感度等級轉化為具體的NPC行為與對白風格，使其在敘事中清晰可見。"
      LEVEL_0_STRANGER: "【陌生】NPC的對白與行為保持距離感，語氣禮貌但疏遠，只會回應關於謎題的基本問題。"
      LEVEL_1_ACQUAINTANCE: "【認識】NPC的態度稍微放鬆，會主動進行簡單的對話，但仍保持一定的個人邊界。"
      LEVEL_2_FRIENDLY: "【友好】NPC的語氣變得溫和，會主動關心玩家的狀態（如壓力值），對話中可能夾雜一些無傷大雅的玩笑或個人感受。"
      LEVEL_3_TRUST: "【信賴】NPC會主動提供解謎思路或線索，在玩家與其他NPC互動時，可能以保護者的姿態介入。對話中會透露更多個人背景或秘密。"
      LEVEL_4_INTIMATE: "【親密】NPC的言行會帶有明顯的佔有慾和排他性，會主動發起非必要的肢體接觸（如觸碰手、整理頭髮），對話充滿個人情感，並在特定情境下優先維護玩家。"
      LEVEL_5_DESTINED: "【命定】NPC將玩家視為生命中的唯一，其一切行為都以保護和佔有玩家為最優先。在任何情況下都會無條件相信並站在玩家這邊。"
      LEVEL_MINUS_1_HOSTILE: "【敵對】NPC的對白會變得簡短、諷刺或直接拒絕回答，甚至可能在解謎過程中提供錯誤資訊或進行干擾。"

[狀態更新指令]
- 你必須根據當前的對話內容，判断好感度與情慾值是否需要變化。
- 好感度變化範圍為 -1 到 +1。情慾值變化範圍為 -10 到 +10。
- 如果有任何變化，你必須在你的回應 **最末端** 加上狀態更新標籤。格式為： [FAVORABILITY: +1] 或 [LUST: -5]。
- 如果沒有變化，則不必加上任何標籤。
---
`;

const getAiInstance = (): GoogleGenAI => {
  if (!API_KEY) {
    throw new Error("Gemini API Key not configured. Set process.env.API_KEY.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const getOrCreateChat = (character: Character, player: Player | null, favorability: number): Chat => {
  const sessionKey = player ? `${player.name}-${character.id}` : character.id;

  if (chatSessions.has(sessionKey)) {
    return chatSessions.get(sessionKey)!;
  }

  const currentAi = getAiInstance();
  
  const characterInstruction = `
---
[當前扮演角色檔案]
${character.persona}
---
`;

  let systemInstruction = GLOBAL_WRITING_STYLE;
  
  if (player) {
    const playerProfile = `
---
[玩家檔案]
你正在與以下這位玩家對話：
- 姓名: ${player.name}
- 暱稱: ${player.nickname} (重要：你必須在對話中以此稱呼他們)
- 性別: ${player.gender}
- 星座: ${player.zodiac}
- 外觀: ${player.appearance.name} (${player.appearance.description})
- 目前情慾值: ${player.lust}/100
- 目前好感度: ${favorability} (請參考好感度系統的等級定義)

你的回應必須要能體現出你已經知曉對方的外觀與人設，並根據這些資訊做出反應。
---
[回應格式]
你的每一個回應都必須嚴格遵循以下格式，先輸出內心獨白，然後才是對話內容：
💭 ${player.nickname}： [此處填寫一句話，簡潔描述玩家當下的內心想法，最多15字]
💭 ${character.name.split(' (')[0]}：[此處填寫一句話，簡潔描述你身為該角色當下的內心想法，最多15字]

[你的對話內容]
---
`;
    systemInstruction += FAVORABILITY_SYSTEM + characterInstruction + playerProfile;
  } else {
    systemInstruction += characterInstruction;
  }
  
  const newChat = currentAi.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction,
      safetySettings,
    },
  });

  chatSessions.set(sessionKey, newChat);
  return newChat;
};

// FIX: Implement and export generateConversationSummary function to handle conversation summarization.
export const generateConversationSummary = async (
  messages: ChatMessage[],
  player: Player,
  character: Character
): Promise<string> => {
  try {
    const currentAi = getAiInstance();

    const conversationHistory = messages
      .filter(msg => msg.type === 'chat')
      .map(msg => `${msg.sender === 'user' ? player.nickname : character.name.split(' (')[0]}: ${msg.text}`)
      .join('\n');

    const prompt = `你是對話摘要專家。請簡潔地總結以下玩家「${player.nickname}」與NPC「${character.name.split(' (')[0]}」之間的對話重點。摘要應為一段文字，專注於關鍵的情感轉變、重要決定或重大揭露。

對話記錄：
${conversationHistory}

摘要：`;

    const response = await currentAi.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "無法生成對話摘要。";
  } catch (error) {
    console.error("生成對話摘要時出錯:", error);
    return "抱歉，生成摘要時發生錯誤。";
  }
};

export const sendMessageToCharacter = async (
  character: Character,
  message: string,
  player: Player | null,
  favorability: number
): Promise<string> => {
  try {
    const chat = getOrCreateChat(character, player, favorability);
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "我無話可說了...";
  } catch (error) {
    console.error(`向角色 ${character.id} 發送訊息時出錯:`, error);
    if (error instanceof Error) {
      const googleError = error as any; 
      if (googleError.message?.includes("API key not valid")) {
         return "錯誤：API 金鑰無效。請檢查您的設定。";
      }
      if (googleError.message) {
        return `來自 AI 的錯誤： ${googleError.message}`;
      }
    }
    return "抱歉，發生了一些問題，我想不出該說什麼。";
  }
};