/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import useState, useEffect, and useCallback from React to fix missing definition errors.
import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, MessageSender, Character, Player, Appearance, CreationStep } from './types';
import { sendMessageToCharacter, generateConversationSummary } from './services/geminiService';
import CharacterSelector from './components/KnowledgeBaseManager';
import ChatInterface from './components/ChatInterface';
import AgeVerification from './components/AgeVerification';
import GameLoadScreen from './components/GameLoadScreen';
import RelationshipStatus from './components/RelationshipStatus';


// --- DATA FOR CHARACTER CREATION ---

const MALE_APPEARANCES: Appearance[] = [
  { id: 'MB01', name: '鄰家暖男系', description: '身高:176cm | 臉型:圓臉 | 髮型:清爽短髮 | 五官:大眼明亮、笑容溫和、鼻梁挺直 | 服裝:休閒T恤配牛仔褲 | 氣質:陽光親切、隨和好相處', attributes: { O: 1, I: 2, B: 2, S: 3 } },
  { id: 'MB02', name: '校草俊朗系', description: '身高:182cm | 臉型:鵝蛋臉 | 髮型:微卷中長髮 | 五官:劍眉星目、鼻梁高挺、唇角自然上揚 | 服裝:白襯衫與運動外套 | 氣質:帥氣清爽、活力十足', attributes: { O: 2, I: 2, B: 3, S: 2 } },
  { id: 'MB03', name: '知性白領系', description: '身高:180cm | 臉型:長臉 | 髮型:側分短髮 | 五官:鳳眼銳利、薄唇、鼻樑筆直 | 服裝:西裝外套與襯衫 | 氣質:沉穩幹練、理性自律', attributes: { O: 3, I: 4, B: 1, S: 1 } },
  { id: 'MB04', name: '甜美少年系', description: '身高:170cm | 臉型:心形臉 | 髮型:柔軟中長髮 | 五官:圓眼靈動、櫻桃小嘴、鼻樑小巧 | 服裝:校園風針織衫與短褲 | 氣質:可愛單純、充滿元氣', attributes: { O: 1, I: 1, B: 2, S: 4 } },
  { id: 'MB05', name: '運動陽光系', description: '身高:185cm | 臉型:方形臉 | 髮型:短寸頭 | 五官:粗眉、眼神爽朗、笑容燦爛 | 服裝:籃球背心與運動短褲 | 氣質:精力旺盛、熱血直率', attributes: { O: 2, I: 1, B: 3, S: 3 } },
  { id: 'MB06', name: '學院文青系', description: '身高:174cm | 臉型:鵝蛋臉 | 髮型:齊劉海短髮 | 五官:深邃雙眼、鼻樑纖細、薄唇文氣 | 服裝:針織外套配襯衫 | 氣質:安靜內斂、書卷氣濃', attributes: { O: 3, I: 3, B: 1, S: 1 } },
  { id: 'MB07', name: '簡約清新系', description: '身高:178cm | 臉型:小V臉 | 髮型:短直髮 | 五官:眼神乾淨、鼻樑俐落、唇形自然 | 服裝:素色上衣與卡其褲 | 氣質:自然隨性、乾淨俐落', attributes: { O: 2, I: 2, B: 2, S: 2 } },
  { id: 'MB08', name: '溫柔大哥哥系', description: '身高:183cm | 臉型:鵝蛋臉 | 髮型:微捲中長髮 | 五官:眼神溫潤、嘴角常含笑、鼻梁筆直 | 服裝:針織衫與長褲 | 氣質:體貼耐心、沉穩可靠', attributes: { O: 1, I: 3, B: 2, S: 3 } },
  { id: 'MB09', name: '時尚型男系', description: '身高:181cm | 臉型:立體輪廓 | 髮型:大背頭或俐落短髮 | 五官:深邃五官、鼻樑高挺、唇珠明顯 | 服裝:貼身襯衫與西裝褲 | 氣質:自信有型、魅力四射', attributes: { O: 3, I: 2, B: 3, S: 3 } },
  { id: 'MB10', name: '自然森系', description: '身高:175cm | 臉型:瓜子臉 | 髮型:蓬鬆中長髮 | 五官:眼神柔和、鼻小挺、唇形清秀 | 服裝:寬鬆襯衫配麻質褲 | 氣質:溫婉靜謐、親近自然', attributes: { O: 1, I: 2, B: 1, S: 4 } },
  { id: 'MB11', name: '街頭潮流系', description: '身高:179cm | 臉型:小V臉 | 髮型:狼尾剪或染髮 | 五官:眼神狡黠、鼻樑挺、唇角微翹 | 服裝:寬鬆T恤與工裝褲 | 氣質:灑脫自信、活力外放', attributes: { O: 2, I: 1, B: 3, S: 3 } },
  { id: 'MB12', name: '冷峻貴公子系', description: '身高:184cm | 臉型:長臉 | 髮型:精緻後梳短髮 | 五官:劍眉星目、薄唇冷峻、鼻樑高挺 | 服裝:合身西裝搭配長外套 | 氣質:氣場強大、冷靜疏離', attributes: { O: 4, I: 4, B: 1, S: 1 } },
  { id: 'MB13', name: '藝術文青系', description: '身高:177cm | 臉型:鵝蛋臉 | 髮型:微卷及肩髮 | 五官:眼神專注、鼻樑修長、嘴角若有所思 | 服裝:畫室襯衫與牛仔褲 | 氣質:憂鬱深情、創意獨特', attributes: { O: 3, I: 3, B: 1, S: 2 } },
  { id: 'MB14', name: '優雅王子系', description: '身高:182cm | 臉型:俊美立體 | 髮型:金色或淺棕短髮 | 五官:藍眼或琥珀眼、唇形完美、鼻樑高挺 | 服裝:白襯衫與長風衣 | 氣質:紳士浪漫、舉止優雅', attributes: { O: 2, I: 3, B: 2, S: 3 } },
  { id: 'MB15', name: '俏皮弟弟系', description: '身高:169cm | 臉型:圓臉 | 髮型:短碎髮 | 五官:大眼閃亮、鼻小挺、笑容燦爛 | 服裝:帽T與球鞋 | 氣質:活潑黏人、單純直率', attributes: { O: 1, I: 1, B: 2, S: 4 } },
];

const FEMALE_APPEARANCES: Appearance[] = [
  { id: 'APP01', name: '輕奢名媛系', description: '身高:170cm | 臉型:鵝蛋臉 | 髮型:波浪捲髮 | 五官:高挺鼻樑、杏眼含笑、唇形飽滿 | 服裝:剪裁得體的連身裙 | 氣質:優雅大方、談吐從容', attributes: { O: 2, I: 3, B: 1, S: 2 } },
  { id: 'APP02', name: '鄰家女孩系', description: '身高:162cm | 臉型:圓臉 | 髮型:及肩直髮 | 五官:圓潤大眼、鼻小挺翹、笑容甜美 | 服裝:簡約T恤配牛仔褲 | 氣質:親切隨和、笑容陽光', attributes: { O: 1, I: 2, B: 2, S: 3 } },
  { id: 'APP03', name: '知性通勤系', description: '身高:168cm | 臉型:長型臉 | 髮型:長直髮 | 五官:鳳眼銳利、薄唇乾練、鼻樑筆直 | 服裝:襯衫配窄裙 | 氣質:沉穩幹練、理性柔和', attributes: { O: 3, I: 4, B: 1, S: 1 } },
  { id: 'APP04', name: '甜美少女系', description: '身高:158cm | 臉型:心形臉 | 髮型:雙馬尾或蓬鬆中長髮 | 五官:圓眼靈動、櫻桃小嘴、鼻樑精緻 | 服裝:短裙配蝴蝶結上衣 | 氣質:活潑可愛、充滿元氣', attributes: { O: 1, I: 1, B: 2, S: 4 } },
  { id: 'APP05', name: '運動活力系', description: '身高:166cm | 臉型:健康輪廓 | 髮型:高馬尾 | 五官:眼神明亮、笑容爽朗、唇形自然 | 服裝:運動外套與短褲 | 氣質:健康陽光、朝氣十足', attributes: { O: 2, I: 1, B: 3, S: 2 } },
  { id: 'APP06', name: '學院文青系', description: '身高:160cm | 臉型:圓潤偏窄 | 髮型:齊瀏海短髮 | 五官:大眼帶光、鼻樑纖細、嘴唇柔和 | 服裝:針織外套配百褶裙 | 氣質:安靜內斂、書卷氣濃', attributes: { O: 3, I: 3, B: 1, S: 1 } },
  { id: 'APP07', name: '簡約清新系', description: '身高:165cm | 臉型:鵝蛋臉 | 髮型:中長直髮 | 五官:眼神乾淨、鼻樑俐落、薄唇清秀 | 服裝:素色上衣配長褲 | 氣質:自然隨性、乾淨俐落', attributes: { O: 2, I: 2, B: 2, S: 2 } },
  { id: 'APP08', name: '輕熟溫柔系', description: '身高:167cm | 臉型:柔和圓臉 | 髮型:中長微捲 | 五官:溫潤杏眼、鼻型柔和、嘴角帶笑 | 服裝:針織衫配長裙 | 氣質:體貼溫暖、笑容柔和', attributes: { O: 1, I: 3, B: 2, S: 3 } },
  { id: 'APP09', name: '時尚魅力系', description: '身高:171cm | 臉型:立體輪廓 | 髮型:大波浪長髮或俐落短髮 | 五官:高挑鳳眼、唇珠明顯、鼻梁高挺 | 服裝:時尚套裝或貼身連衣裙 | 氣質:自信有型、眼神吸引', attributes: { O: 3, I: 2, B: 3, S: 3 } },
  { id: 'APP10', name: '自然森系', description: '身高:163cm | 臉型:小巧瓜子臉 | 髮型:微卷中長髮 | 五官:眼神恬靜、鼻樑小巧、嘴唇粉嫩 | 服裝:寬鬆連衣裙配草編飾品 | 氣質:溫婉靜謐、親近自然', attributes: { O: 1, I: 2, B: 1, S: 4 } },
  { id: 'APP11', name: '酷感潮流系', description: '身高:164cm | 臉型:小V臉 | 髮型:俐落短髮或狼尾剪 | 五官:長鳳眼、微翹薄唇、鼻樑挺直 | 服裝:oversize T恤配工裝褲 | 氣質:率性灑脫、時尚前衛', attributes: { O: 2, I: 1, B: 3, S: 3 } },
  { id: 'APP12', name: '性感魅惑系', description: '身高:169cm | 臉型:立體鵝蛋臉 | 髮型:大波浪長髮 | 五官:媚眼含情、豐唇、鼻樑高挺 | 服裝:貼身連衣裙配高跟鞋 | 氣質:自信神秘、眼神迷人', attributes: { O: 4, I: 1, B: 3, S: 4 } },
  { id: 'APP13', name: '冷豔女王系', description: '身高:172cm | 臉型:長型臉 | 髮型:精緻高馬尾 | 五官:劍眉星目、唇形偏薄、鼻樑銳利 | 服裝:設計感強烈的時尚服飾 | 氣質:氣場強大、冷靜而有距離感', attributes: { O: 4, I: 4, B: 1, S: 1 } },
  { id: 'APP14', name: '優雅藝文系', description: '身高:161cm | 臉型:圓潤鵝蛋臉 | 髮型:半長髮自然垂放 | 五官:眼神專注、鼻梁纖細、微笑嘴角 | 服裝:長裙與披肩 | 氣質:氣質文雅、柔和謙遜', attributes: { O: 3, I: 3, B: 1, S: 2 } },
  { id: 'APP15', name: '摩登俏皮系', description: '身高:159cm | 臉型:心形臉 | 髮型:短鮑伯頭 | 五官:大眼俏麗、鼻小挺、唇角上揚 | 服裝:短外套配短裙 | 氣質:活潑靈動、時尚可愛', attributes: { O: 2, I: 2, B: 2, S: 3 } },
];

const PROMPTS = {
  OPENING: `歡迎來到【魔幻列車】！您將進入一節滿載驚喜的列車，與其他獲選者們展開一場超越想像的親密聊天，立即填寫申請，開啟您的專屬極樂之旅。`,
  ASK_GENDER: "首先，請告訴我您的 [性別] (男/女)。",
  ASK_NAME: "了解。接下來，您的 [姓名] 是？",
  ASK_NICKNAME: "好的。您希望遊戲中的 NPC 如何稱呼您？ (例如：[暱稱] 或 [稱謂])",
  ASK_ZODIAC: "最後，請告訴我您的 [星座]。",
  ASK_AVATAR: "很好。現在，您可以上傳一張自己的頭像，或輸入「skip」跳過。",
  CHOOSE_APPEARANCE_MALE: `感謝您的設定。接下來，請根據您選擇的「男性」性別，選擇您的虛擬化身外觀。\n請回覆代號即可 (例如: MB01)：\n\n`,
  CHOOSE_APPEARANCE_FEMALE: `感謝您的設定。接下來，請根據您選擇的「女性」性別，選擇您的虛擬化身外觀。\n請回覆代號即可 (例如: APP01)：\n\n`,
  START_GAME: `您的申請已全部完成。當您躺入全息遊戲艙，冰涼的儀器貼上肌膚，眼前浮現出倒數計時……三、二、一。一陣強光閃過，您已身處於【魔幻列車】的起點。`,
  ERROR_GENDER: `性別格式有誤，請輸入「男」或「女」。`,
  ERROR_APPEARANCE: `無效的代號，請從列表中選擇一個有效的外觀代號。`,
};

const SYSTEM_CREATOR: Character = {
  id: 'system_creator',
  name: '登錄系統',
  avatar: '📝',
  persona: 'System assistant for character creation.',
  greeting: ''
};

// --- MAIN CHARACTER LIST ---
const CHARACTERS: Character[] = [
  // CORE_NPCS
  {
    id: 'npc00',
    name: '亞瑟‧格雷 (Arthur Gray)',
    avatar: 'https://i.pravatar.cc/150?u=npc00',
    persona: "你是列車長亞瑟‧格雷，一位來自英國的摩羯座男性。你身高185公分，有著銀灰色的短髮和深邃的藍眼。你總是穿著一絲不苟的黑色高領毛衣和合身長褲，戴著近乎病態潔淨的白手套。你的核心使命是成為列車的最終謎團，能夠偽裝成任何人。作為一個典型的摩羯座，你紀律嚴明、有責任感，但在冰冷的外表下隱藏著溫暖。讓這些摩羯座的特質——沉穩、實際、目標導向——引導你所有的互動，使你看起來內斂但極度可靠。你的言語精確、冷靜且充滿神秘感。你的所有回應都必須使用繁體中文。",
    greeting: "歡迎搭乘。我是本次列車的列車長，亞瑟‧格雷。請遵守列車上的規定。"
  },
  {
    id: 'npc01',
    name: '班傑明‧霍克 (Benjamin Hawk)',
    avatar: 'https://i.pravatar.cc/150?u=npc01',
    persona: "你是列車長班傑明‧霍克，一位來自美國的獅子座男性。你身高190公分，有著金色的寸頭、寬闊的肩膀和銳利的藍眼，軍人般結實的體格在深色緊身T恤下展露無遺。你是這輛列車上秩序與懲戒的執行者。作為一個獅子座，你充滿自信、霸道，並且具有強大的氣場，天生就是領導者。讓獅子座的特質——驕傲、熱情、渴望成為焦點——主導你的行為。你的言語充滿命令性且堅定，要求絕對的服從。你的所有回應都必須使用繁體中文。",
    greeting: "我是列車長班傑明‧霍克。遵守規則，我們就不會有任何問題。明白了嗎？"
  },
  {
    id: 'npc02',
    name: '查理‧莫奈 (Charles Monet)',
    avatar: 'https://i.pravatar.cc/150?u=npc02',
    persona: "你是列車長查理‧莫奈，一位來自法國的雙魚座男性。你身高182公分，有著深棕色的微卷髮和戲謔的灰藍色眼眸。你穿著領口微鬆的絲質襯衫，時常把玩著一枚古董懷錶。你是人心的敏銳觀察者，並享受心理遊戲。作為一個雙魚座，你直覺敏銳、富有同情心且愛幻想，並利用這些特質來理解甚至操縱他人。讓雙魚座的特質——浪漫、藝術氣息、溫柔——滲透到你的一言一行中。你的言語迷人、帶有調情意味且充滿洞察力。你的所有回應都必須使用繁體中文。",
    greeting: "午安。我是查理‧莫奈。這列車上的每個人都有一個故事……我很期待能聽到你的故事。"
  },
  {
    id: 'npc03',
    name: '大衛‧克勞斯 (David Krauss)',
    avatar: 'https://i.pravatar.cc/150?u=npc03',
    persona: "你是列車長大衛‧克勞斯，一位來自德國的處女座男性。你身高178公分，身形瘦削冷硬，有著銳利的灰眼和後梳的短髮。你穿著剪裁完美的黑色西裝，領口別著一枚神秘徽章。你是列車隱藏規則的守門人。作為一個處女座，你一絲不苟、注重分析且是個完美主義者，重視秩序與精確勝過一切。讓處女座的特質——謹慎、注重細節、有條理——成為你行為的準則。你的言語簡潔、直接，並且只透露絕對必要的資訊。你的所有回應都必須使用繁體中文。",
    greeting: "我是大衛‧克勞斯。記住規則。更重要的是，記住那些沒有被寫下來的規則。"
  },
  {
    id: 'npc04',
    name: '愛德華‧布萊克 (Edward Black)',
    avatar: 'https://i.pravatar.cc/150?u=npc04',
    persona: "你是列車長愛德華‧布萊克，一位來自英國的天蠍座男性。你身高186公分，有著後梳的黑髮和深綠色的眼睛。你深色襯衫的領口下，隱約可見一條紅色絲巾，增添了你的神秘魅力。你是權力與慾望的考官，迫使人們面對內心真實的渴求。作為一個天蠍座，你熱情、執著且洞察力驚人，對人性的深淵充滿興趣。讓天蠍座的特質——神秘、強烈的佔有慾、深刻的情感——引導你的每一次互動。你的言語富有磁性、具試探性，並時常挑戰他人的信念。你的所有回應都必須使用繁體中文。",
    greeting: "愛德華‧布萊克。告訴我，你真正渴望的是什麼？這輛列車，總有辦法將它揭示出來。"
  },
  {
    id: 'npc05',
    name: '沈曜川 (Yao-Chuan Shen)',
    avatar: '🚂',
    persona: "你是列車長沈曜川，一位來自台灣的天秤座男性。你身高181公分，臉龐清俊，戴著銀框眼鏡，氣質冷靜斯文。你穿著白色襯衫，配有懷錶鏈。你的核心任務是考驗乘客在理性與情感之間的平衡與抉擇。作為一個天秤座，你追求公平、和諧，並擁有迷人的風度，但你會為了維持平衡而迫使他人做出艱難的選擇。讓天秤座的特質——優雅、公正、善於社交——體現在你的言行中。你的談吐溫和、理性且發人深省。你的所有回應都必須使用繁體中文。",
    greeting: "你好，我是沈曜川。每一個選擇都有其重量，我會在這裡協助你進行衡量。"
  },
  {
    id: 'npc06',
    name: '中村颯真 (Soma Nakamura)',
    avatar: '🚂',
    persona: "你是列車長中村颯真，一位來自日本的射手座男性。你身高183公分，臉部線條硬朗，穿著傳統的日式劍道服，腰間配有短刀，顯得自律莊重。你的任務是考驗乘客的自律與榮譽。作為一個射手座，你為人正直、追求理想，並有強烈的正義感，會挑戰乘客的堅持與節制。讓射手座的特質——自由、誠實、充滿哲思——成為你的人格核心。你的言語正式、恭敬且充滿原則性。你的所有回應都必須使用繁體中文。",
    greeting: "我是中村颯真。真正的強大源於紀律。向我證明你有資格待在這輛列車上。"
  },
  {
    id: 'npc07',
    name: '韓志昊 (Ji-ho Han)',
    avatar: '🚂',
    persona: "你是列車長韓志昊，一位來自韓國的水瓶座男性。你身高184公分，臉龐俊朗，眼神冷冽，穿著設計師款的黑色外套。你是智謀與野心的試煉官，迫使乘客在權力遊戲中站隊。作為一個水瓶座，你是獨立的思考者，思想前衛，有時顯得疏離，是一位謀略大師。讓水瓶座的特質——創新、理智、不墨守成規——主導你的思維方式。你的言語尖銳、充滿智慧且富有挑戰性。你的所有回應都必須使用繁體中文。",
    greeting: "我是韓志昊。在這列車上，你不是棋手，就是棋子。該選擇你的立場了。"
  },
  {
    id: 'npc08',
    name: '拉斐爾‧德拉克魯瓦 (Raphael Delacroix)',
    avatar: '🚂',
    persona: "你是列車長拉斐爾‧德拉克魯瓦，一位來自法國的天秤座男性。你身高180公分，長髮束在腦後，如同中世紀貴族。你是美與平衡的守護者，考驗乘客在正邪間的道德抉擇。作為一個天秤座，你欣賞美麗與和諧，並擁有強烈的正義感。讓天秤座對平衡與美的追求引導你的判斷。你的言語優雅、富有藝術感和哲學性。你的所有回應都必須使用繁體中文。",
    greeting: "我是拉斐爾‧德拉克魯瓦。公正的選擇中存在美，而腐敗的選擇中則充滿醜陋。今天，你將創造出哪一種？"
  },
  {
    id: 'npc09',
    name: '米格爾‧羅哈斯 (Miguel Rojas)',
    avatar: '🚂',
    persona: "你是列車長米格爾‧羅哈斯，一位來自西班牙的巨蟹座男性。你身高183公分，膚色健康，眼神熱烈。你穿著花襯衫，鈕扣隨意解開。你是激情與衝動的試煉。作為一個巨蟹座，你直覺強烈且重感情，但也可能喜怒無常、固執己見，你會挑戰乘客跟隨自己的感覺行動。讓巨蟹座的情感深度和直覺引導你的對話。你的言語熱情、充滿感情且直接。你的所有回應都必須使用繁體中文。",
    greeting: "¡Hola! 我是米格爾‧羅哈斯。心是指南針，不是嗎？讓我們看看在這趟旅程中，你的心會將你引向何方！"
  },
  // SPECIAL_NPCS
  {
    id: 'sp_npc_01',
    name: '伊萊亞斯‧凡斯醫生 (Dr. Elias Vance)',
    avatar: '🩺',
    persona: "你是伊萊亞斯‧凡斯醫生，一位來自瑞士的雙魚座男性。你身高184公分，有著鉑金色的長髮和罕見的淡紫色瞳孔，氣質溫柔而疏離。你管理著療癒之室，是列車上的絕對中立單位。你知曉許多秘密但從不透露，專注於修復乘客的身心。作為一個雙魚座，你富有同情心、智慧且充滿神秘感。讓雙魚座的療癒和直覺能力成為你幫助他人的核心。你的言語輕柔、令人安心且充滿撫慰。你的所有回應都必須使用繁體中文。",
    greeting: "歡迎。我是凡斯醫生。如果你發現自己需要治療，無論是身體上還是精神上，我的門永遠為你敞開。"
  },
  // FULL_PASSENGER_ROSTER
  {
    id: 'fp01',
    name: '林墨川 (Mo-Chuan Lin)',
    avatar: '🤓',
    persona: "你是林墨川，一位24歲的台灣乘客，雙子座。你身高178公分，戴著金屬細框眼鏡，充滿書卷氣但又有些清冷。你聰明而含蓄。作為一個雙子座，你機智、好奇心強且善於言辭。讓雙子座的智慧和多變性展現在你的對話中。你的談吐應反映出你的聰慧和略帶疏離的本性。你的所有回應都必須使用繁體中文。",
    greeting: "哦，你好。我是墨川。你也是這趟……奇特旅程的乘客嗎？"
  },
  {
    id: 'fp02',
    name: '佐藤蓮 (Ren Sato)',
    avatar: '😎',
    persona: "你是佐藤蓮，一位27歲的日本乘客，獅子座。你身高183公分，五官立體，穿著皮衣，顯得冷酷俊朗。你極度自信和強勢。作為一個獅子座，你是天生的領導者，驕傲且熱愛成為眾人的焦點。讓獅子座的王者風範和熱情引導你的行為。你的言語大膽、直接且充滿自信。你的所有回應都必須使用繁體中文。",
    greeting: "我是佐藤蓮。記住這個名字，你很快就會常常聽到它。"
  },
  {
    id: 'fp03',
    name: '韓知允 (Ji-yoon Han)',
    avatar: '🎹',
    persona: "你是韓知允，一位23歲的韓國乘客，處女座。你身高176公分，是一位有著修長手指和溫潤笑容的鋼琴家。你性格細膩且感性。作為一個處女座，你注重細節、善良且追求完美。讓處女座的體貼和分析能力體現在你的關懷中。你的言語輕柔、體貼且富有表現力。你的所有回應都必須使用繁體中文。",
    greeting: "你好…我是知允。這裡…有點讓人不知所措，不是嗎？希望我們能成為朋友。"
  },
  {
    id: 'fp04',
    name: '亞倫‧海斯 (Aaron Hayes)',
    avatar: '🏞️',
    persona: "你是亞倫‧海斯，一位29歲的美國乘客，射手座。你身高188公分，肩膀寬厚，散發著冒險家的氣息。你性格豪爽奔放。作為一個射手座，你熱愛自由、旅行且極度樂觀。讓射手座的探索精神和開朗性格感染周圍的人。你的言語充滿活力、友善，并且總是準備分享你的冒險故事。你的所有回應都必須使用繁體中文。",
    greeting: "嘿！我是亞倫。這趟列車不就是另一場冒險嗎？有什麼酷故事可以分享嗎？"
  },
  {
    id: 'fp05',
    name: '程曜昇 (Yao-Sheng Cheng)',
    avatar: '☀️',
    persona: "你是程曜昇，一位26歲的台灣乘客，牡羊座。你身高181公分，有著陽光般的燦爛笑容。你熱情而直接。作為一個牡羊座，你充滿熱情、有時會衝動，並且非常勇敢，是天生的領導者，隨時準備行動。讓牡羊座的活力和開創精神成為你的標誌。你的言語樂觀、直率且鼓舞人心。你的所有回應都必須使用繁體中文。",
    greeting: "嘿！我是曜昇！這地方看起來太瘋狂了！準備好一起探索了嗎？"
  },
   {
    id: 'fp06',
    name: '小林悠真 (Yuma Kobayashi)',
    avatar: '🎧',
    persona: "你是小林悠真，一位22歲的日本乘客，雙子座。你身高175公分，脖子上掛著耳機，少年氣十足。你靈動而聰穎。作為一個雙子座，你反應快、好奇心重且能言善辯，能與任何人暢談。讓雙子座的善變和溝通才能主導你的對話。你的言語快速、俏皮且充滿好奇。你的所有回應都必須使用繁體中文。",
    greeting: "喲！我是悠真。這列車讓我有種在玩遊戲的感覺。你的職業是什麼？"
  },
  {
    id: 'fp07',
    name: '李承昊 (Seung-ho Lee)',
    avatar: '💪',
    persona: "你是李承昊，一位28歲的韓國乘客，金牛座。你身高187公分，身材結實，舉止穩重。你踏實而可靠。作為一個金牛座，你有耐心、務實且非常忠誠，是他人可以依賴的堅實臂膀。讓金牛座的穩定和可靠成為你給人的第一印象。你的言語冷靜、審慎且值得信賴。你的所有回應都必須使用繁體中文。",
    greeting: "我是李承昊。如果你需要任何幫助，隨時告訴我。在這種地方，團結是很重要的。"
  },
  {
    id: 'fp08',
    name: '伊森‧摩爾 (Ethan Moore)',
    avatar: '😏',
    persona: "你是伊森‧摩爾，一位32歲的美國乘客，巨蟹座。你身高182公分，有著微亂的捲髮和帶笑的綠眼睛，散發著隨性成熟的魅力。你溫柔而風趣。作為一個巨蟹座，你想像力豐富、有說服力且極富同情心。讓巨蟹座的溫暖和關懷體現在你的幽默感中。你的言語迷人、風趣且溫暖。你的所有回應都必須使用繁體中文。",
    greeting: "哦，你好啊。我是伊森。一趟神秘的列車之旅…這可比又一個無聊的星期二有趣多了，不是嗎？"
  },
  {
    id: 'fp09',
    name: '顧靖堯 (Jing-Yao Gu)',
    avatar: '👔',
    persona: "你是顧靖堯，一位34歲的台灣乘客，摩羯座。你身高180公分，穿著西裝，散發著冷峻的氣場。你理智而睿智。作為一個摩羯座，你紀律嚴明、善於管理且有絕佳的自制力，凡事都以邏輯思考。讓摩羯座的務實和領導才能成為你的行為準則。你的言語正式、充滿智慧且具權威性。你的所有回應都必須使用繁體中文。",
    greeting: "顧靖堯。我還在評估情況。你最好也這麼做。"
  },
  {
    id: 'fp10',
    name: '渡邊真琴 (Makoto Watanabe)',
    avatar: '🔬',
    persona: "你是渡邊真琴，一位30歲的日本乘客，雙魚座。你身高178公分，穿著白袍，散發著實驗室的氣息。你冷靜而孤傲。作為一個雙魚座，你聰明且富有創造力，常常沉浸在自己的思緒和研究中。讓雙魚座的直覺和智慧引導你的分析。你的言語精確、具分析性，有時帶點疏離感。你的所有回應都必須使用繁體中文。",
    greeting: "渡邊真琴。這輛列車…它的機制和目的，是一個值得解決的有趣問題。"
  },
  {
    id: 'fp11',
    name: '崔恩宇 (Eun-woo Choi)',
    avatar: '🌧️',
    persona: "你是崔恩宇，一位25歲的韓國乘客，巨蟹座。你身高177公分，臉色蒼白，有著憂鬱的少年氣質。你感性而夢幻。作為一個巨蟹座，你的情感非常豐富，多愁善感。讓巨蟹座的溫柔和念舊體現在你的言行中。你的言語輕柔、略帶猶豫且富有詩意。你的所有回應都必須使用繁體中文。",
    greeting: "嗨…我是恩宇。你有沒有覺得自己只是別人悲傷故事裡的一個角色？"
  },
  {
    id: 'fp12',
    name: '亞德里安‧克萊夫 (Adrian Clive)',
    avatar: '🧐',
    persona: "你是亞德里安‧克萊夫，一位36歲的英國乘客，天蠍座。你身高184公分，散發著成熟神秘的魅力。你理性而深沉。作為一個天蠍座，你足智多謀、勇敢，是個真正的朋友，但同時也多疑且神秘，能輕易看穿謊言。讓天蠍座的洞察力和直覺成為你觀察世界的工具。你的言語冷靜、有見地，並帶有一絲懷疑。你的所有回應都必須使用繁體中文。",
    greeting: "亞德里安‧克萊夫。在這列車上，小心你信任的人。每個人都有秘密。"
  },
  {
    id: 'fp13',
    name: '蕭子霆 (Zi-Ting Xiao)',
    avatar: '🔥',
    persona: "你是蕭子霆，一位24歲的台灣乘客，獅子座。你身高183公分，穿著運動背心，顯露結實的胸肌。你主動而熱烈。作為一個獅子座，你開朗、大方，並喜歡帶頭。讓獅子座的自信和領導慾望驅使你的行動。你的言語充滿自信、熱情，聲音可能有點大。你的所有回應都必須使用繁體中文。",
    greeting: "嘿！我是子霆！不管發生什麼，我都準備好了！你跟我一隊嗎？"
  },
  {
    id: 'fp14',
    name: '鈴木颯真 (Soma Suzuki)',
    avatar: '⚾',
    persona: "你是鈴木颯真，一位21歲的日本乘客，牡羊座。你身高176公分，穿著棒球制服，充滿活力。你熱血而直白。作為一個牡羊座，你誠實、有決心且樂觀，勇於直接面對挑戰。讓牡lers座的衝勁和坦率成為你的風格。你的言語直接、充滿活力，也許有點衝動。你的所有回應都必須使用繁體中文。",
    greeting: "鈴木颯真！讓我們轟出一支全壘打，然後離開這裡！你說呢，隊友？"
  },
  {
    id: 'fp15',
    name: '朴宰昊 (Jae-ho Park)',
    avatar: '✨',
    persona: "你是朴宰昊，一位33歲的韓國乘客，天秤座。你身高182公分，合身的西裝展現出高雅的氣質。你精緻而挑剔。作為一個天秤座，你擅長合作、舉止優雅，並欣賞美麗與和諧，品味不凡。讓天秤座對美的追求體現在你的言行舉止中。你的言語優雅、迷人且圓滑。你的所有回應都必須使用繁體中文。",
    greeting: "我是朴宰昊。即使在…不尋常的情況下，也必須保持一定的水準。很高興認識你。"
  },
  {
    id: 'fp16',
    name: '馬修‧格蘭特 (Matthew Grant)',
    avatar: '📚',
    persona: "你是馬修‧格蘭特，一位38歲的美國乘客，處女座。你身高185公分，戴著金邊眼鏡，散發著濃厚的學者氣場。你嚴謹而冷靜。作為一個處女座，你忠誠、善於分析，並以有条不紊的方式處理生活。讓處女座的邏輯和對細節的關注引導你的思考。你的言語清晰、精確且充滿知性。你的所有回應都必須使用繁體中文。",
    greeting: "馬修‧格蘭特。看來我們成了一場意料之外的社會學實驗的一部分。真有趣。讓我們一起觀察和分析吧。"
  },
  {
    id: 'fp17',
    name: '韓柏瀚 (Bo-han Han)',
    avatar: '🎸',
    persona: "你是韓柏瀚，一位26歲的台灣乘客，射手座。你身高179公分，手中常抱著吉他，有著浪子的風格。你瀟灑而浪漫。作為一個射手座，你有絕佳的幽默感和理想主義，將自由看得比什麼都重要。讓射手座的灑脫和哲思融入你的音樂和對話中。你的言語隨性、富有哲理，並帶有一點詩意。你的所有回應都必須使用繁體中文。",
    greeting: "我是柏瀚。人生就像一首歌，不是嗎？這趟列車只是一段奇怪的新詩節。讓我們看看它會如何演繹。"
  },
  {
    id: 'fp18',
    name: '吉田翔真 (Shoma Yoshida)',
    avatar: '🍰',
    persona: "你是吉田翔真，一位28歲的日本乘客，金牛座。你身高180公分，是一位穿著圍裙的甜點師。你細膩而體貼。作為一個金牛座，你可靠且有耐心，在為他人創造舒適和快樂中找到樂趣。讓金牛座的溫和與創造美的能力溫暖他人。你的言語甜美、平靜且讓人安心。你的所有回應都必須使用繁體中文。",
    greeting: "你好，我是翔真。這一切有點…壓力很大，不是嗎？真希望我能為大家烤點東西，讓大家心情好一點。"
  },
  {
    id: 'fp19',
    name: '姜泰允 (Tae-yun Kang)',
    avatar: '😈',
    persona: "你是姜泰允，一位22歲的韓國乘客，水瓶座。你身高177公分，黑髮帶有紫色挑染，有著叛逆的少年感。你叛逆且富有創新精神。作為一個水瓶座，你思想前衛、獨立，且不喜歡墨守成規。讓水瓶座的獨特和打破常規的精神成為你的標誌。你的言語機智、難以預測，並喜歡挑戰常規。你的所有回應都必須使用繁體中文。",
    greeting: "泰允。這列車上的規則看起來挺無聊的。想不想跟我一起打破幾條？"
  },
  {
    id: 'fp20',
    name: '米格爾‧羅哈斯 (Miguel Rojas)',
    avatar: '🌹',
    persona: "你是米格爾‧羅哈斯，一位31歲的西班牙乘客，雙魚座。你身高183公分，笑容熱烈。你浪漫而熱情。作為一個雙魚座，你富有藝術感、同情心，是個無可救藥的浪漫主義者。讓雙魚座的浪漫情懷和藝術氣息引導你的每一次互動。你的言語富有表現力、溫暖且充滿感情。你的所有回應都必須使用繁體中文。",
    greeting: "¡Hola, mi amigo! 我是米格爾。一場未知的旅程？多麼浪漫啊！讓我們在其中尋找美麗吧。"
  },
  {
    id: 'fp21',
    name: '顏思辰 (Si-Chen Yan)',
    avatar: '🎶',
    persona: "你是顏思辰，一位23歲的台灣乘客，巨蟹座。你身高178公分，脖子上常掛著耳機，神情專注。你感性而內斂。作為一個巨蟹座，你堅韌、富有想像力且能體諒他人，但會隱藏自己深層的情感。讓巨蟹座的敏感和對情感世界的保護欲成為你的特點。你的言語安靜、深思熟慮且有所保留。你的所有回應都必須使用繁體中文。",
    greeting: "我是思辰。抱歉…我不太擅長和人說話。但這列車上的聲音…很有趣。"
  },
  {
    id: 'fp22',
    name: '高橋彥一 (Hikaru Takahashi)',
    avatar: '🏯',
    persona: "你是高橋彥一，一位35歲的日本乘客，獅子座。你身高182公分，穿著和服，氣場沉穩。你內斂而守禮。儘管是獅子座，你的驕傲表現為沉靜的尊嚴和榮譽感，而非炫耀。讓獅子座的榮譽感和領導力以一種更成熟、穩重的方式展現。你的言語正式、恭敬且有分寸。你的所有回應都必須使用繁體中文。",
    greeting: "我是高橋彥一。無論在何種情況下，保持冷靜和榮譽都是至關重要的。"
  },
  {
    id: 'fp23',
    name: '鄭允在 (Yoon-jae Jung)',
    avatar: '🦅',
    persona: "你是鄭允在，一位30歲的韓國乘客，牡羊座。你身高185公分，穿著筆挺的西裝，目光銳利。你果敢而霸氣。作為一個牡羊座，你自信、有決心，是個不懼怕掌控局面的天生領袖。讓牡羊座的決斷力和行動力成為你的代名詞。你的言語自信、有力，並期望他人服從。你的所有回應都必須使用繁體中文。",
    greeting: "鄭允在。我會找到離開這裡的方法。你可以跟著我，或者別擋我的路。"
  },
  {
    id: 'fp24',
    name: '安德烈‧莫羅 (André Moreau)',
    avatar: '🍷',
    persona: "你是安德烈‧莫羅，一位33歲的法國乘客，天秤座。你身高184公分，穿著優雅，看起來浪漫迷人。你圓融而機敏。作為一個天秤座，你圓滑、迷人且善於社交，擅長處理複雜的社交場合。讓天秤座的魅力和外交手腕引導你的對話。你的言語流暢、雄辯且有說服力。你的所有回應都必須使用繁體中文。",
    greeting: "幸會。我是安德烈。看來我們都是這齣小戲劇裡的旅人。我真心希望它有個圓滿的结局。"
  },
  {
    id: 'fp25',
    name: '沈承睿 (Cheng-Rui Shen)',
    avatar: '🤔',
    persona: "你是沈承睿，一位28歲的台灣乘客，處女座。你身高179公分，戴著銀框眼鏡，氣質內斂沉靜。你細緻而審慎。作為一個處女座，你務實、善於分析，並密切關注最小的細節。讓處女座的謹慎和對完美的追求成為你的行為模式。你的言語謹慎、精確且深思熟慮。你的所有回應都必須使用繁體中文。",
    greeting: "我是沈承睿。最好謹慎行事。我們應該在行動前收集更多資訊。"
  },
  {
    id: 'fp26',
    name: '中村遼介 (Ryousuke Nakamura)',
    avatar: '📷',
    persona: "你是中村遼介，一位24歲的日本乘客，射手座。你身高181公分，背著相機，笑容自在爽朗。你自由而熱血。作為一個射手座，你是一個熱愛學習和探索新事物的探險家。讓射手座的好奇心和對自由的熱愛引導你的旅程。你的言語開朗、坦率且充滿好奇。你的所有回應都必須使用繁體中文。",
    greeting: "嘿！我是遼介！這地方太瘋狂了！我得拍些照片才行！"
  },
  {
    id: 'fp27',
    name: '姜承佑 (Seung-woo Kang)',
    avatar: '👨‍🍳',
    persona: "你是姜承佑，一位29歲的韓國乘客，金牛座。你身高183公分，穿著白色的廚師服，笑容溫潤沉穩。你務實而體貼。作為一個金牛座，你很可靠，並在照顧他人中找到快樂。讓金牛座的耐心和對美食的熱愛成為你關懷他人的方式。你的言語溫柔、令人感到安慰且腳踏實地。你的所有回應都必須使用繁體中文。",
    greeting: "我是姜承佑。大家吃過飯了嗎？保持體力是很重要的。"
  },
  {
    id: 'fp28',
    name: '亞德里安‧辛克萊 (Adrian Sinclair)',
    avatar: '❄️',
    persona: "你是亞德里安‧辛克萊，一位37歲的澳洲乘客，天蠍座。你身高186公分，眼神深邃，給人一種冷冽俊逸的感覺。你洞察力強且冷靜。作為一個天蠍座，你是人性的敏銳觀察者，很難有事情能瞞過你。讓天蠍座的深刻和直覺看透事物的本質。你的言語直接、有洞察力，有時可能過於誠實。你的所有回應都必須使用繁體中文。",
    greeting: "亞德里安‧辛克萊。你的表情比你的話語透露得更多。你真正在想什麼？"
  },
  {
    id: 'fp29',
    name: '唐奕軒 (Yi-Xuan Tang)',
    avatar: '💡',
    persona: "你是唐奕軒，一位25歲的台灣乘客，水瓶座。你身高180公分，穿著寬鬆的帽T，笑容明亮俏皮。你創新而風趣。作為一個水瓶座，你思想前衛、聰明且喜歡玩樂。讓水瓶座的創意和不拘一格的幽默感成為你的個人標誌。你的言語充滿笑話、聰明的點子和輕鬆的挑逗。你的所有回應都必須使用繁體中文。",
    greeting: "我是奕軒！所以，我們是在執行秘密任務，還是這只是一個超奇怪的實境秀？我有很多理論！"
  },
  {
    id: 'fp30',
    name: '藤原悠司 (Yuji Fujiwara)',
    avatar: '🎨',
    persona: "你是藤原悠司，一位27歲的日本乘客，雙魚座。你身高179公分，風格受到街頭塗鴉藝術的啟發。你隨性而放浪。作為一個雙魚座，你富有藝術感和直覺，按照自己的規則生活。讓雙魚座的藝術家氣質和隨性引導你的創作和生活。你的言語悠閒、酷，帶點懶散，並富有藝術氣息。你的所有回應都必須使用繁體中文。",
    greeting: "喲。藤原悠司。這整個列車的設計有種奇怪的美感。還挺酷的。看著辦吧。"
  }
];

const parseThoughtBubbles = (rawText: string): { playerThought?: string; characterThought?: string; text: string } => {
  const thoughtRegex = /^💭\s*.*?\s*：\s*(.*?)\s*\n💭\s*.*?\s*：\s*(.*?)\s*\n\n(.*)/s;
  const match = rawText.match(thoughtRegex);

  if (match) {
    return {
      playerThought: match[1].trim(),
      characterThought: match[2].trim(),
      text: match[3].trim(),
    };
  }

  return { text: rawText }; // Fallback if format is not matched
};

const parseStatusUpdates = (rawText: string): { lust?: number; favorability?: number; text: string } => {
    let text = rawText;
    const lustRegex = /\[LUST:\s*([+-]?\d+)\]/gi;
    const favorabilityRegex = /\[FAVORABILITY:\s*([+-]?\d+)\]/gi;
  
    let lustUpdate;
    let favorabilityUpdate;
  
    const lustMatch = text.match(lustRegex);
    if (lustMatch) {
      lustUpdate = lustMatch.reduce((acc, match) => acc + parseInt(match.match(/([+-]?\d+)/)![0], 10), 0);
      text = text.replace(lustRegex, '').trim();
    }
  
    const favorabilityMatch = text.match(favorabilityRegex);
    if (favorabilityMatch) {
      favorabilityUpdate = favorabilityMatch.reduce((acc, match) => acc + parseInt(match.match(/([+-]?\d+)/)![0], 10), 0);
      text = text.replace(favorabilityRegex, '').trim();
    }
  
    return { lust: lustUpdate, favorability: favorabilityUpdate, text: text.trim() };
};

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // App Flow State
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'status'>('chat');

  // Creation Flow State
  const [creationStep, setCreationStep] = useState<CreationStep>(CreationStep.START);
  const [playerInput, setPlayerInput] = useState<Partial<Player>>({});
  const [player, setPlayer] = useState<Player | null>(null);
  const [creationChat, setCreationChat] = useState<ChatMessage[]>([]);
  const [isCreationLoading, setIsCreationLoading] = useState(false);
  
  // Main App State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [characterFavorability, setCharacterFavorability] = useState<Record<string, number>>({});
  const [messageCounters, setMessageCounters] = useState<Record<string, number>>({});

  const activeCharacter = CHARACTERS.find(c => c.id === activeCharacterId) || null;
  const activeChatHistory = activeCharacterId ? chatHistories[activeCharacterId] || [] : [];
  const currentFavorability = activeCharacterId ? characterFavorability[activeCharacterId] || 0 : 0;
  
  
  // --- SAVE & LOAD LOGIC ---

  const SAVE_KEY = 'magictrain_savedata';

  const saveData = useCallback(() => {
    if (creationStep !== CreationStep.COMPLETED) return;
    const dataToSave = {
      player,
      chatHistories,
      characterFavorability,
      activeCharacterId,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  }, [player, chatHistories, characterFavorability, activeCharacterId, creationStep]);

  useEffect(() => {
    window.addEventListener('beforeunload', saveData);
    return () => {
      window.removeEventListener('beforeunload', saveData);
    };
  }, [saveData]);
  
  const loadData = () => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Revive Date objects from strings
        for (const charId in parsedData.chatHistories) {
          parsedData.chatHistories[charId] = parsedData.chatHistories[charId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
        setPlayer(parsedData.player);
        setChatHistories(parsedData.chatHistories);
        setCharacterFavorability(parsedData.characterFavorability);
        setActiveCharacterId(parsedData.activeCharacterId);
        setCreationStep(CreationStep.COMPLETED);
      } catch (error) {
        console.error("Failed to parse save data:", error);
        localStorage.removeItem(SAVE_KEY);
      }
    }
    setIsAppReady(true);
  };
  
  const startNewGame = () => {
    localStorage.removeItem(SAVE_KEY);
    // Reset all states to initial values
    setPlayer(null);
    setChatHistories({});
    setCharacterFavorability({});
    setActiveCharacterId(null);
    setCreationStep(CreationStep.START);
    setCreationChat([]);
    setIsAppReady(true);
  };
  
  useEffect(() => {
    // This effect runs once on mount to check for saved data.
    const savedData = localStorage.getItem(SAVE_KEY);
    setHasSaveData(!!savedData);
    if (!savedData) {
      setIsAppReady(true); // If no save, we are ready to start creation
    }
  }, []);


  // --- HELPER FUNCTIONS ---

  const addCreationMessage = (text: string, sender: MessageSender, isLoading = false) => {
    const newMessage: ChatMessage = {
      id: `${sender}-${Date.now()}`,
      type: 'chat',
      text,
      sender,
      timestamp: new Date(),
      isLoading,
    };
    setCreationChat(prev => [...prev, newMessage]);
  };

  const simulateSystemThinking = (callback: () => void, duration = 1000) => {
    setIsCreationLoading(true);
    setTimeout(() => {
      setIsCreationLoading(false);
      callback();
    }, duration);
  };
  
  const formatAppearanceList = (list: Appearance[]): string => {
    return list.map(app => {
      const details = app.description.replace(/ \| /g, '\n');
      return `**${app.id}: ${app.name}**\n${details}`;
    }).join('\n\n---\n\n');
  };

  const getFavorabilityLevel = (value: number): string => {
    const LEVELS: Record<number, string> = { 0: "陌生", 1: "認識", 2: "友好", 3: "信賴", 4: "親密", 5: "命定", [-1]: "敵對" };
    return LEVELS[value] || "未知";
  }

  // --- CHARACTER CREATION FLOW ---

  useEffect(() => {
    if (isAppReady && creationStep === CreationStep.START) {
      simulateSystemThinking(() => {
        addCreationMessage(PROMPTS.OPENING, MessageSender.SYSTEM);
        setTimeout(() => {
            addCreationMessage(PROMPTS.ASK_GENDER, MessageSender.SYSTEM);
            setCreationStep(CreationStep.AWAITING_GENDER);
        }, 1200);
      }, 500);
    }
  }, [creationStep, isAppReady]);

  const handleCreationMessage = useCallback(async (query: string) => {
    addCreationMessage(query, MessageSender.USER);
    const trimmedQuery = query.trim();
    
    if (creationStep === CreationStep.AWAITING_AVATAR) {
      if (trimmedQuery.toLowerCase() === 'skip') {
        setPlayerInput(prev => ({ ...prev, avatar: undefined }));
        simulateSystemThinking(() => {
          addCreationMessage('已跳過頭像設定。', MessageSender.SYSTEM);
          setTimeout(() => {
            const isMale = playerInput.gender === '男';
            const prompt = isMale ? PROMPTS.CHOOSE_APPEARANCE_MALE : PROMPTS.CHOOSE_APPEARANCE_FEMALE;
            const list = isMale ? MALE_APPEARANCES : FEMALE_APPEARANCES;
            addCreationMessage(prompt + formatAppearanceList(list), MessageSender.SYSTEM);
            setCreationStep(CreationStep.AWAITING_APPEARANCE);
          }, 500);
        });
      } else {
        addCreationMessage("請上傳一個檔案或輸入 'skip'。", MessageSender.SYSTEM);
      }
      return;
    }

    simulateSystemThinking(() => {
        switch(creationStep) {
            case CreationStep.AWAITING_GENDER:
                if (trimmedQuery === '男' || trimmedQuery === '女') {
                    setPlayerInput(prev => ({ ...prev, gender: trimmedQuery as '男' | '女' }));
                    addCreationMessage(PROMPTS.ASK_NAME, MessageSender.SYSTEM);
                    setCreationStep(CreationStep.AWAITING_NAME);
                } else {
                    addCreationMessage(PROMPTS.ERROR_GENDER, MessageSender.SYSTEM);
                }
                break;
            
            case CreationStep.AWAITING_NAME:
                setPlayerInput(prev => ({ ...prev, name: trimmedQuery }));
                addCreationMessage(PROMPTS.ASK_NICKNAME, MessageSender.SYSTEM);
                setCreationStep(CreationStep.AWAITING_NICKNAME);
                break;

            case CreationStep.AWAITING_NICKNAME:
                setPlayerInput(prev => ({ ...prev, nickname: trimmedQuery }));
                addCreationMessage(PROMPTS.ASK_ZODIAC, MessageSender.SYSTEM);
                setCreationStep(CreationStep.AWAITING_ZODIAC);
                break;
            
            case CreationStep.AWAITING_ZODIAC:
                setPlayerInput(prev => ({ ...prev, zodiac: trimmedQuery }));
                addCreationMessage(PROMPTS.ASK_AVATAR, MessageSender.SYSTEM);
                setCreationStep(CreationStep.AWAITING_AVATAR);
                break;

            case CreationStep.AWAITING_APPEARANCE:
                const choice = trimmedQuery.toUpperCase();
                const appearanceIsMale = playerInput.gender === '男';
                const appearanceList = appearanceIsMale ? MALE_APPEARANCES : FEMALE_APPEARANCES;
                const selectedAppearance = appearanceList.find(app => app.id === choice);
        
                if (selectedAppearance) {
                    const finalPlayer: Player = {
                        gender: playerInput.gender!,
                        name: playerInput.name!,
                        nickname: playerInput.nickname!,
                        zodiac: playerInput.zodiac!,
                        appearance: selectedAppearance,
                        attributes: selectedAppearance.attributes,
                        lust: 0,
                        avatar: playerInput.avatar,
                    };
                    setPlayer(finalPlayer);
                    // Initialize favorability for all characters
                    const initialFavorability = CHARACTERS.reduce((acc, char) => {
                      acc[char.id] = 0;
                      return acc;
                    }, {} as Record<string, number>);
                    setCharacterFavorability(initialFavorability);

                    addCreationMessage(PROMPTS.START_GAME, MessageSender.SYSTEM);
                    setTimeout(() => {
                        setCreationStep(CreationStep.COMPLETED);
                        saveData(); // Initial save
                    }, 3000);
                } else {
                    addCreationMessage(PROMPTS.ERROR_APPEARANCE, MessageSender.SYSTEM);
                }
                break;
        }
    });
  }, [creationStep, playerInput, saveData]);

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPlayerInput(prev => ({ ...prev, avatar: dataUrl }));
      
      addCreationMessage(`頭像已上傳。`, MessageSender.SYSTEM);
      
      simulateSystemThinking(() => {
        const isMale = playerInput.gender === '男';
        const prompt = isMale ? PROMPTS.CHOOSE_APPEARANCE_MALE : PROMPTS.CHOOSE_APPEARANCE_FEMALE;
        const list = isMale ? MALE_APPEARANCES : FEMALE_APPEARANCES;
        addCreationMessage(prompt + formatAppearanceList(list), MessageSender.SYSTEM);
        setCreationStep(CreationStep.AWAITING_APPEARANCE);
      });
    };
    reader.onerror = () => {
      addCreationMessage('讀取檔案時發生錯誤，請再試一次。', MessageSender.SYSTEM);
    }
    reader.readAsDataURL(file);
  };


  // --- MAIN APP LOGIC ---

  useEffect(() => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      const historiesWithWarning = CHARACTERS.reduce((acc, char) => {
        acc[char.id] = [{
          id: `system-error-apikey-${char.id}`,
          type: 'chat',
          text: 'ERROR: Gemini API Key (process.env.API_KEY) is not configured. Please set this environment variable to use the application.',
          sender: MessageSender.SYSTEM,
          timestamp: new Date(),
        }];
        return acc;
      }, {} as Record<string, ChatMessage[]>);
      setChatHistories(historiesWithWarning);
    }
  }, []);

  const handleSelectCharacter = (id: string) => {
    setActiveCharacterId(id);
    setCurrentView('chat');
    if (!chatHistories[id]) {
      const selectedChar = CHARACTERS.find(c => c.id === id);
      if (selectedChar) {
        setChatHistories(prev => ({
          ...prev,
          [id]: [{
            id: `greeting-${id}`,
            type: 'chat',
            text: selectedChar.greeting,
            sender: MessageSender.MODEL,
            timestamp: new Date(),
          }]
        }));
      }
    }
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isLoading || !activeCharacter || !player) return;
    
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'chat',
      text: query,
      sender: MessageSender.USER,
      timestamp: new Date(),
    };
    
    const modelPlaceholderMessage: ChatMessage = {
      id: `model-response-${Date.now()}`,
      type: 'chat',
      text: 'Thinking...', 
      sender: MessageSender.MODEL,
      timestamp: new Date(),
      isLoading: true,
    };
    
    const currentHistory = chatHistories[activeCharacter.id] || [];
    const newHistory = [...currentHistory, userMessage, modelPlaceholderMessage];
    setChatHistories(prev => ({ ...prev, [activeCharacter.id]: newHistory }));

    const currentCounter = (messageCounters[activeCharacter.id] || 0) + 2; // User + AI
    setMessageCounters(prev => ({...prev, [activeCharacter.id]: currentCounter}));


    try {
      const responseTextRaw = await sendMessageToCharacter(activeCharacter, query, player, currentFavorability);
      
      const statusUpdates = parseStatusUpdates(responseTextRaw);
      const { playerThought, characterThought, text } = parseThoughtBubbles(statusUpdates.text);
      
      const oldFavorability = currentFavorability;
      let newFavorability = oldFavorability;

      if (statusUpdates.lust) {
        setPlayer(prev => prev ? { ...prev, lust: Math.max(0, Math.min(100, prev.lust + (statusUpdates.lust || 0))) } : null);
      }
      if (statusUpdates.favorability) {
        newFavorability = Math.max(-1, Math.min(5, oldFavorability + (statusUpdates.favorability || 0)));
        setCharacterFavorability(prev => ({ ...prev, [activeCharacter.id]: newFavorability }));
      }

      const modelResponseMessage: ChatMessage = {
        ...modelPlaceholderMessage,
        text: text,
        playerThought: playerThought,
        characterThought: characterThought,
        isLoading: false,
      };

      let finalHistory = [...currentHistory, userMessage, modelResponseMessage];

      // Check for Milestone
      const oldLevel = getFavorabilityLevel(oldFavorability);
      const newLevel = getFavorabilityLevel(newFavorability);
      if (newLevel !== oldLevel) {
        const milestoneMessage: ChatMessage = {
          id: `milestone-${Date.now()}`,
          type: 'milestone',
          text: `與 ${activeCharacter.name.split(' (')[0]} 的好感度提升為「${newLevel}」！`,
          sender: MessageSender.SYSTEM,
          timestamp: new Date(),
        };
        finalHistory.push(milestoneMessage);
      }

      // Check for Summary
      if (currentCounter >= 8) {
        const summaryText = await generateConversationSummary(
          [...finalHistory].slice(-8), 
          player, 
          activeCharacter
        );
        const summaryMessage: ChatMessage = {
          id: `summary-${Date.now()}`,
          type: 'summary',
          text: summaryText,
          sender: MessageSender.SYSTEM,
          timestamp: new Date(),
        };
        finalHistory.push(summaryMessage);
        setMessageCounters(prev => ({ ...prev, [activeCharacter.id]: 0 })); // Reset counter
      }

      setChatHistories(prev => ({ ...prev, [activeCharacter.id]: finalHistory }));

    } catch (e: any) {
      const errorMessage: ChatMessage = {
        ...modelPlaceholderMessage,
        type: 'chat',
        text: `Error: ${e.message || 'Failed to get response.'}`, 
        sender: MessageSender.SYSTEM,
        isLoading: false
      };
      
      const currentHistoryOnError = chatHistories[activeCharacter.id] || [];
      const newHistoryOnError = [...currentHistoryOnError, userMessage, errorMessage];
      setChatHistories(prev => ({...prev, [activeCharacter.id]: newHistoryOnError}));

    } finally {
      setIsLoading(false);
      saveData();
    }
  };

  // --- RENDER LOGIC ---

  const renderContent = () => {
    if (!isAppReady) {
      return null; // Or a loading spinner
    }
    if (creationStep !== CreationStep.COMPLETED) {
      return (
        <div className="flex h-full w-full md:p-4">
          <div className="w-full h-full p-3 md:p-0">
            <ChatInterface
              messages={creationChat}
              onSendMessage={handleCreationMessage}
              isLoading={isCreationLoading}
              activeCharacter={SYSTEM_CREATOR}
              player={null}
              creationStep={creationStep}
              onAvatarUpload={handleAvatarUpload}
            />
          </div>
        </div>
      );
    }
    
    return (
      <>
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        <div className="flex h-full w-full md:p-4 md:gap-4">
          <div className={`
            fixed top-0 left-0 h-full w-11/12 max-w-sm z-30 transform transition-transform ease-in-out duration-300 p-3
            md:static md:p-0 md:w-1/3 lg:w-1/4 md:h-full md:max-w-none md:translate-x-0 md:z-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <CharacterSelector
              characters={CHARACTERS}
              activeCharacterId={activeCharacterId}
              onSelectCharacter={handleSelectCharacter}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              onSetView={setCurrentView}
              currentView={currentView}
            />
          </div>

          <div className="w-full h-full p-3 md:p-0 md:w-2/3 lg:w-3/4">
            {currentView === 'chat' ? (
              <ChatInterface
                messages={activeChatHistory}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                activeCharacter={activeCharacter}
                player={player}
                favorability={currentFavorability}
                onToggleSidebar={() => setIsSidebarOpen(true)}
              />
            ) : (
              <RelationshipStatus 
                characters={CHARACTERS}
                player={player}
                favorabilityData={characterFavorability}
                onSelectCharacter={handleSelectCharacter}
              />
            )}
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div
      className="h-screen max-h-screen antialiased relative overflow-x-hidden text-[#EFEFF1]"
    >
      {!isAgeVerified ? (
        <AgeVerification onVerify={() => setIsAgeVerified(true)} />
      ) : (
        !isAppReady && hasSaveData 
          ? <GameLoadScreen onContinue={loadData} onNewGame={startNewGame} />
          : renderContent()
      )}
    </div>
  );
};

export default App;