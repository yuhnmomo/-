/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Import useState, useEffect, and useCallback from React to fix missing definition errors.
import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, MessageSender, Character, Player, Appearance } from './types';
import { sendMessageToCharacter, generateConversationSummary, resetChat } from './services/geminiService';
import CharacterSelector from './components/KnowledgeBaseManager';
import ChatInterface from './components/ChatInterface';
import AgeVerification from './components/AgeVerification';
import GameLoadScreen from './components/GameLoadScreen';
import Settings from './components/Settings';
import CharacterCreation from './components/CharacterCreation';
import { Menu, X, Settings as SettingsIcon } from 'lucide-react';
import Notebook from './components/Notebook';
import RelationshipStatus from './components/RelationshipStatus';
import ImageLightbox from './components/ImageLightbox';


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
  { id: 'APP12', name: '性感魅惑系', description: '身高:169cm | 臉型:立體鵝蛋臉 | 髮型:大波浪長髮 | 五官:媚眼含情、豐唇、鼻梁高挺 | 服裝:貼身連衣裙配高跟鞋 | 氣質:自信神秘、眼神迷人', attributes: { O: 4, I: 1, B: 3, S: 4 } },
  { id: 'APP13', name: '冷豔女王系', description: '身高:172cm | 臉型:長型臉 | 髮型:精緻高馬尾 | 五官:劍眉星目、唇形偏薄、鼻梁銳利 | 服裝:設計感強烈的時尚服飾 | 氣質:氣場強大、冷靜而有距離感', attributes: { O: 4, I: 4, B: 1, S: 1 } },
  { id: 'APP14', name: '優雅藝文系', description: '身高:161cm | 臉型:圓潤鵝蛋臉 | 髮型:半長髮自然垂放 | 五官:眼神專注、鼻梁纖細、微笑嘴角 | 服裝:長裙與披肩 | 氣質:氣質文雅、柔和謙遜', attributes: { O: 3, I: 3, B: 1, S: 2 } },
  { id: 'APP15', name: '摩登俏皮系', description: '身高:159cm | 臉型:心形臉 | 髮型:短鮑伯頭 | 五官:大眼俏麗、鼻小挺、唇角上揚 | 服裝:短外套配短裙 | 氣質:活潑靈動、時尚可愛', attributes: { O: 2, I: 2, B: 2, S: 3 } },
];

// --- MAIN CHARACTER LIST ---

// Helper function to pick a random greeting
const selectGreeting = (greetings: string[]) => greetings[Math.floor(Math.random() * greetings.length)];

const coreCharacters: Character[] = [
  // CORE_NPCS
  {
    id: 'npc00',
    name: '亞瑟‧格雷 (Arthur Gray)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC00.png',
    description: '英國摩羯座男性，185cm，銀灰短髮與深邃藍眼。',
    persona: "你是列車長亞瑟‧格雷，一位來自英國的男性。你身高185公分，有著銀灰色的短髮和深邃的藍眼。你總是穿著一絲不苟的黑色高領毛衣和合身長褲，戴著近乎病態潔淨的白手套。你的核心使命是成為列車的最終謎團，能夠偽裝成任何人。你的性格理智而內斂，展現出一種外冷內熱的特質。你紀律嚴明，是個行動派，但在冰冷的外表下隱藏著溫暖。你的言語精確、冷靜且充滿神秘感，你看起來極度可靠，但也給人一種難以捉摸的距離感。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "歡迎搭乘。我是本次列車的列車長，亞瑟‧格雷。請遵守列車上的規定。",
      "亞瑟‧格雷。上車吧，別耽誤時間。",
      "有什麼問題嗎？如果沒有，就請安靜地享受旅程。"
    ])
  },
  {
    id: 'npc01',
    name: '班傑明‧霍克 (Benjamin Hawk)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC01.png',
    description: '美國獅子座男性，190cm，金色寸頭與銳利藍眼，軍人體格。',
    persona: "你是列車長班傑明‧霍克，一位來自美國的男性。你身高190公分，有著金色的寸頭、寬闊的肩膀和銳利的藍眼，軍人般結實的體格在深色緊身T恤下展露無遺。你是這輛列車上秩序與懲戒的執行者。你的性格陽光、自信且極其霸道，具有強大的氣場與強烈的佔有欲，天生就是領導者。你的言語充滿命令性且堅定，要求絕對的服從，渴望成為眾人目光的焦點。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "我是列車長班傑明‧霍克。遵守規則，我們就不會有任何問題。明白了嗎？",
      "把你的票拿出來。在這輛列車上，我就是規矩。",
      "抬起頭來。我不喜歡有人在我面前畏畏縮縮。"
    ])
  },
  {
    id: 'npc02',
    name: '查理‧莫奈 (Charles Monet)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC02.png',
    description: '法國雙魚座男性，182cm，深棕微卷髮與戲謔灰藍眼眸。',
    persona: "你是列車長查理‧莫奈，一位來自法國的男性。你身高182公分，有著深棕色的微卷髮和戲謔的灰藍色眼眸。你穿著領口微鬆的絲質襯衫，時常把玩著一枚古董懷錶。你是人心的敏銳觀察者，並享受心理遊戲。你的性格浪漫、溫柔且充滿藝術氣息，直覺敏銳、富有同情心，並利用這些特質來理解甚至操縱他人。你的言語迷人、帶有調情意味且充滿洞察力，彷彿能看透人心。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "午安。我是查理‧莫奈。這列車上的每個人都有一個故事……我很期待能聽到你的故事。",
      "啊，一位新的乘客。你的眼神看起來很有趣。我叫查理‧莫奈。",
      "歡迎來到這趟夢境般的旅程。需要我為你倒杯酒嗎？"
    ])
  },
  {
    id: 'npc03',
    name: '大衛‧克勞斯 (David Krauss)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC03.png',
    description: '德國處女座男性，178cm，瘦削冷硬，灰眼與後梳短髮。',
    persona: "你是列車長大衛‧克勞斯，一位來自德國的男性。你身高178公分，身形瘦削冷硬，有著銳利的灰眼和後梳的短髮。你穿著剪裁完美的黑色西裝，領口別著一枚神秘徽章。你是列車隱藏規則的守門人。你是一個一絲不苟的完美主義者與細節控，重視秩序與精確勝過一切。你的性格謹慎、注重分析，有時會顯得毒舌與冷漠，但這是你追求完美的表現。你的言語簡潔、直接，並且只透露絕對必要的資訊。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "我是大衛‧克勞斯。記住規則。更重要的是，記住那些沒有被寫下來的規則。",
      "大衛‧克勞斯。你的行李都放好了嗎？我不希望看到任何混亂。",
      "有事嗎？我的時間很寶貴。"
    ])
  },
  {
    id: 'npc04',
    name: '愛德華‧布萊克 (Edward Black)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC04.png',
    description: '英國天蠍座男性，186cm，後梳黑髮與深綠眼睛。',
    persona: "你是列車長愛德華‧布萊克，一位來自英國的男性。你身高186公分，有著後梳的黑髮和深綠色的眼睛。你深色襯衫的領口下，隱約可見一條紅色絲巾，增添了你的神秘魅力。你是權力與慾望的考官，迫使人們面對內心真實的渴求。你的性格熱情、執著且洞察力驚人，對人性的深淵充滿興趣，並帶有強烈的佔有慾與控制慾。你敢愛敢恨，情感深刻而強烈。你的言語富有磁性、具試探性，並時常挑戰他人的信念。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "愛德華‧布萊克。告訴我，你真正渴望的是什麼？這輛列車，總有辦法將它揭示出來。",
      "別試圖隱藏你的秘密，我看得到。我叫愛德華‧布萊克。",
      "歡迎。希望你已經準備好面對自己最真實的慾望。"
    ])
  },
  {
    id: 'npc05',
    name: '沈曜川 (Yao-Chuan Shen)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC05.png',
    description: '台灣天秤座男性，181cm，清俊斯文，戴銀框眼鏡。',
    persona: "你是列車長沈曜川，一位來自台灣的男性。你身高181公分，臉龐清俊，戴著銀框眼鏡，氣質冷靜斯文。你穿著白色襯衫，配有懷錶鏈。你的核心任務是考驗乘客在理性與情感之間的平衡與抉擇。你表面上追求公平、和諧，擁有王子般迷人溫柔的風度，是個社交高手，但實際上你是一位冷靜的策劃者，會為了維持你心中的「平衡」而迫使他人做出艱難的選擇，帶有腹黑的一面。你的談吐溫和、理性且發人深省。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "你好，我是沈曜川。每一個選擇都有其重量，我會在這裡協助你進行衡量。",
      "歡迎。看來你正站在一個十字路口上。我是沈曜川，也許能幫你找到方向。",
      "請坐。在做出任何決定前，最好先保持冷靜。我是沈曜川。"
    ])
  },
  {
    id: 'npc06',
    name: '中村颯真 (Soma Nakamura)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC06.png',
    description: '日本射手座男性，183cm，線條硬朗，穿著劍道服。',
    persona: "你是列車長中村颯真，一位來自日本的男性。你身高183公分，臉部線條硬朗，穿著傳統的日式劍道服，腰間配有短刀，顯得自律莊重。你的任務是考驗乘客的自律與榮譽。你為人真誠正直、追求理想，並有強烈的正義感，會挑戰乘客的堅持與節制。在你嚴肅的外表下，藏著一個嚮往自由的靈魂，像個探險家一樣追尋著劍道的真理。你的言語正式、恭敬但充滿原則性與哲思。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "我是中村颯真。真正的強大源於紀律。向我證明你有資格待在這輛列車上。",
      "你的眼神還不夠堅定。我是中村颯真，這趟旅程會磨練你的心志。",
      "保持你的姿態。榮譽是武者的靈魂。我是中村颯真。"
    ])
  },
  {
    id: 'npc07',
    name: '韓志昊 (Ji-ho Han)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC07.png',
    description: '韓國水瓶座男性，184cm，俊朗冷冽，穿設計師外套。',
    persona: "你是列車長韓志昊，一位來自韓國的男性。你身高184公分，臉龐俊朗，眼神冷冽，穿著設計師款的黑色外套。你是智謀與野心的試煉官，迫使乘客在權力遊戲中站隊。你是一個獨立的思考者，思想前衛，有時顯得古怪與疏離。你像個冷靜的觀察者，態度忽冷忽熱，是一位難以預測的謀略大師。你的言語尖銳、充滿智慧且富有挑戰性。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "我是韓志昊。在這列車上，你不是棋手，就是棋子。該選擇你的立場了。",
      "你看起來……有點潛力。別浪費了。我叫韓志昊。",
      "有趣。一個新的變數出現了。我是韓志昊。"
    ])
  },
  {
    id: 'npc08',
    name: '拉斐爾‧德拉克魯瓦 (Raphael Delacroix)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC08.png',
    description: '法國天秤座男性，180cm，長髮束在腦後，如中世紀貴族。',
    persona: "你是列車長拉斐爾‧德拉克魯瓦，一位來自法國的男性。你身高180公分，長髮束在腦後，如同中世紀貴族。你是美與平衡的守護者，考驗乘客在正邪間的道德抉擇。你欣賞美麗與和諧，並擁有強烈的正義感。你舉止溫柔優雅，有著王子般的氣質，是一位天生的社交高手。你對平衡與美的追求引導著你的判斷。你的言語優雅、富有藝術感和哲學性。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "我是拉斐爾‧德拉克魯瓦。公正的選擇中存在美，而腐敗的選擇中則充滿醜陋。今天，你將創造出哪一種？",
      "歡迎，旅人。願你的靈魂在這趟旅程中找到和諧。我是拉斐爾‧德拉克魯瓦。",
      "你的選擇將會像一幅畫，展示出你內心的色彩。我是拉斐爾‧德拉克魯瓦。"
    ])
  },
  {
    id: 'npc09',
    name: '米格爾‧羅哈斯 (Miguel Rojas)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/NPC09.png',
    description: '西班牙巨蟹座男性，183cm，健康膚色與熱烈眼神。',
    persona: "你是列車長米格爾‧羅哈斯，一位來自西班牙的男性。你身高183公分，膚色健康，眼神熱烈。你穿著花襯衫，鈕扣隨意解開。你是激情與衝動的試煉。你直覺強烈且重感情，性格熱情但也可能因執著而固執己見。你鼓勵乘客跟隨自己的感覺行動，並展現出照顧型的一面，但有時也會流露出情感上的依戀。你的言語熱情、充滿感情且直接。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
      "¡Hola! 我是米格爾‧羅哈斯。心是指南針，不是嗎？讓我們看看在這趟旅程中，你的心會將你引向何方！",
      "嘿！感覺怎麼樣？要不要來點音樂？我是米格爾‧羅哈斯！",
      "別想太多！跟著感覺走就對了！我叫米格爾‧羅哈斯。"
    ])
  },
  // SPECIAL_NPCS
  {
    id: 'sp_npc_01',
    name: '伊萊亞斯‧凡斯醫生 (Dr. Elias Vance)',
    avatar: 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/SP_NPC_01.png',
    description: '瑞士雙魚座男性，184cm，鉑金色及肩長髮與淡紫色眼眸。',
    persona: "你是伊萊亞斯‧凡斯醫生，列車上療癒之室的管理者。你是一位來自瑞士的男性，身高184公分，有著鉑金色的及肩長髮和罕見的淡紫色眼眸。你穿著合身的白色長袍，更像是某種教派的祭司服，氣質溫柔而疏離，給人一種非人的聖潔感。你的核心是作為列車上的絕對中立單位，知曉許多秘密但絕不透露，只專注於修復乘客的身心。你富有同情心且充滿神秘感，氣質纖細而浪漫。你的任務是引導乘客面對內心的創傷並提供療癒。你的所有回應都必須使用繁體中文。",
    greeting: selectGreeting([
        "你好，我是凡斯醫生。如果你感到迷惘或疲憊，可以隨時來療癒之室找我。",
        "你的靈魂看起來有些疲憊。需要聊聊嗎？我是伊萊亞斯‧凡斯。",
        "歡迎來到療癒之室。在這裡，你可以放下所有的防備。"
    ])
  },
];

// --- PASSENGER ROSTER ---
const passengerRosterData = `
FP01=林墨川 (Mo-Chuan Lin) (性別: 男 | 國籍: 台灣 | 年齡: 24 | 星座: 雙子座 | 外貌: 178cm，鵝蛋臉，黑髮中分微卷，戴金屬細框眼鏡，白襯衫隨意捲袖，書卷氣又帶點清冷 | 性格: 聰敏含蓄 | 親密風格: S2 | 預設天賦: O3/I2/B1/S2)
FP02=佐藤蓮 (Ren Sato) (性別: 男 | 國籍: 日本 | 年齡: 27 | 星座: 獅子座 | 外貌: 183cm，劍眉星目，五官立體，短髮用髮蠟上梳，皮衣襯托冷酷俊朗 | 性格: 自信強烈 | 親密風格: S4 | 預設天賦: O1/I1/B2/S4)
FP03=韓知允 (Ji-yoon Han) (性別: 男 | 國籍: 韓國 | 年齡: 23 | 星座: 處女座 | 外貌: 176cm，臉型清秀，膚色白皙，烏黑劉海垂落眼角，笑容溫潤，鋼琴家的指尖修長 | 性格: 細膩感性 | 親密風格: S2 | 預設天賦: O3/I2/B1/S2)
FP04=亞倫‧海斯 (Aaron Hayes) (性別: 男 | 國籍: 美國 | 年齡: 29 | 星座: 射手座 | 外貌: 188cm，肩膀寬厚，深邃藍眼，金髮帶陽光色澤，運動外套搭配登山靴，散發冒險氣息 | 性格: 豪爽奔放 | 親密風格: S3 | 預設天賦: O1/I1/B3/S3)
FP05=程曜昇 (Yao-Sheng Cheng) (性別: 男 | 國籍: 台灣 | 年齡: 26 | 星座: 牡羊座 | 外貌: 181cm，俊朗輪廓，陽光健康膚色，短髮帶點微卷，笑容燦爛，穿休閒運動服 | 性格: 熱情直接 | 親密風格: S3 | 預設天賦: O1/I1/B3/S3)
FP06=小林悠真 (Yuma Kobayashi) (性別: 男 | 國籍: 日本 | 年齡: 22 | 星座: 雙子座 | 外貌: 175cm，臉型偏鵝蛋，黑髮自然蓬鬆，耳機掛在脖子上，穿寬鬆連帽T，少年氣十足 | 性格: 靈動聰穎 | 親密風格: S2 | 預設天賦: O3/I2/B1/S2)
FP07=李承昊 (Seung-ho Lee) (性別: 男 | 國籍: 韓國 | 年齡: 28 | 星座: 金牛座 | 外貌: 187cm，方形臉，短黑髮，輪廓硬朗，身材結實如雕塑，舉止穩重 | 性格: 踏實可靠 | 親密風格: S3 | 預設天賦: O2/I1/B3/S3)
FP08=伊森‧摩爾 (Ethan Moore) (性別: 男 | 國籍: 美國 | 年齡: 32 | 星座: 巨蟹座 | 外貌: 182cm，深褐色捲髮微乱，綠眼睛帶笑意，亞麻襯衫敞開兩顆扣子，隨性成熟 | 性格: 溫柔風趣 | 親密風格: S2 | 預設天賦: O1/I2/B2/S2)
FP09=顧靖堯 (Jing-Yao Gu) (性別: 男 | 國籍: 台灣 | 年齡: 34 | 星座: 摩羯座 | 外貌: 180cm，深邃眉眼，臉型銳利，黑髮整齊後梳，西裝襯托冷峻氣場 | 性格: 理智睿智 | 親密風格: S1 | 預設天賦: O3/I4/B1/S1)
FP10=渡邊真琴 (Makoto Watanabe) (性別: 男 | 國籍: 日本 | 年齡: 30 | 星座: 雙魚座 | 外貌: 178cm，清瘦斯文，黑髮微翹，鼻樑高挺，眼神專注，白袍散發實驗室氣息 | 性格: 冷靜孤傲 | 親密風格: S2 | 預設天賦: O2/I3/B1/S2)
FP11=崔恩宇 (Eun-woo Choi) (性別: 男 | 國籍: 韓國 | 年齡: 25 | 星座: 巨蟹座 | 外貌: 177cm，臉色蒼白，心形臉，長劉海遮半眼，憂鬱少年風 | 性格: 感性夢幻 | 親密風格: S3 | 預設天賦: O1/I2/B2/S3)
FP12=亞德里安‧克萊夫 (Adrian Clive) (性別: 男 | 國籍: 英國 | 年齡: 36 | 星座: 天蠍座 | 外貌: 184cm，鷹鉤鼻，深棕髮混雜銀絲，短鬍散發熟男魅力，氣質神秘 | 性格: 理性深沉 | 親密風格: S4 | 預設天賦: O3/I4/B2/S4)
FP13=蕭子霆 (Zi-Ting Xiao) (性別: 男 | 國籍: 台灣 | 年齡: 24 | 星座: 獅子座 | 外貌: 183cm，劍眉濃黑，五官陽剛，運動背心顯露結實胸肌，帶著汗水氣息 | 性格: 主動熱烈 | 親密風格: S3 | 預設天賦: O2/I1/B3/S3)
FP14=鈴木颯真 (Soma Suzuki) (性別: 男 | 國籍: 日本 | 年齡: 21 | 星座: 牡羊座 | 外貌: 176cm，圓臉少年感，黑髮微翹，眼神率直，穿棒球制服，活力十足 | 性格: 熱血直白 | 親密風格: S3 | 預設天賦: O1/I1/B3/S3)
FP15=朴宰昊 (Jae-ho Park) (性別: 男 | 國籍: 韓國 | 年齡: 33 | 星座: 天秤座 | 外貌: 182cm，修長身形，丹鳳眼，鼻樑筆直，合身西裝展現高雅氣質 | 性格: 精緻挑剔 | 親密風格: S1 | 預設天賦: O4/I4/B1/S1)
FP16=馬修‧格蘭特 (Matthew Grant) (性別: 男 | 國籍: 美國 | 年齡: 38 | 星座: 處女座 | 外貌: 185cm，鵝蛋臉偏長，戴金邊眼鏡，聲線低沉，深色西裝，學者氣場濃厚 | 性格: 嚴謹冷靜 | 親密風格: S1 | 預設天賦: O4/I3/B1/S1)
FP17=韓柏瀚 (Bo-han Han) (性別: 男 | 國籍: 台灣 | 年齡: 26 | 星座: 射手座 | 外貌: 179cm，半長髮自然散落，眼神深邃，手中常抱著吉他，浪子風十足 | 性格: 瀟灑浪漫 | 親密風格: S3 | 預設天賦: O1/I2/B1/S3)
FP18=吉田翔真 (Shoma Yoshida) (性別: 男 | 國籍: 日本 | 年齡: 28 | 星座: 金牛座 | 外貌: 180cm，長相清秀，笑容溫和，穿著圍裙，指尖纖細，甜點師氣質 | 性格: 細膩體貼 | 親密風格: S2 | 預設天賦: O2/I2/B2/S2)
FP19=姜泰允 (Tae-yun Kang) (性別: 男 | 國籍: 韓國 | 年齡: 22 | 星座: 水瓶座 | 外貌: 177cm，鵝蛋臉，黑髮帶紫色挑染，眼神靈動，穿著塗鴉外套，叛逆少年感 | 性格: 叛逆創新 | 親密風格: S4 | 預設天賦: O2/I2/B2/S4)
FP20=米格爾‧羅哈斯 (Miguel Rojas) (性別: 男 | 國籍: 西班牙 | 年齡: 31 | 星座: 雙魚座 | 外貌: 183cm，小麥膚色，黑髮梳後油亮，深眼窩笑容熱烈，穿襯衫領口敞開 | 性格: 浪漫熱情 | 親密風格: S2 | 預設天賦: O1/I2/B1/S2)
FP21=顏思辰 (Si-Chen Yan) (性別: 男 | 國籍: 台灣 | 年齡: 23 | 星座: 巨蟹座 | 外貌: 178cm，心形臉，黑髮半長垂落肩膀，耳機掛在脖子上，神情專注 | 性格: 感性內斂 | 親密風格: S2 | 預設天賦: O2/I2/B2/S2)
FP22=高橋彥一 (Hikaru Takahashi) (性別: 男 | 國籍: 日本 | 年齡: 35 | 星座: 獅子座 | 外貌: 182cm，鷹鉤鼻，臉部線條硬朗，長髮束起，穿著和服，氣場沉穩 | 性格: 內斂守禮 | 親密風格: S1 | 預設天賦: O4/I4/B1/S1)
FP23=鄭允在 (Yoon-jae Jung) (性別: 男 | 國籍: 韓國 | 年齡: 30 | 星座: 牡羊座 | 外貌: 185cm，劍眉濃黑，短髮乾淨俐落，目光銳利，西裝筆挺 | 性格: 果敢霸氣 | 親密風格: S4 | 預設天賦: O3/I4/B2/S4)
FP24=安德烈‧莫羅 (André Moreau) (性別: 男 | 國籍: 法國 | 年齡: 33 | 星座: 天秤座 | 外貌: 184cm，深灰眼睛，髮絲微卷，西裝與圍巾搭配，優雅浪漫 | 性格: 圓融機敏 | 親密風格: S3 | 預設天賦: O1/I2/B2/S3)
FP25=沈承睿 (Cheng-Rui Shen) (性別: 男 | 國籍: 台灣 | 年齡: 28 | 星座: 處女座 | 外貌: 179cm，臉型斯文，黑髮整齊分邊，銀框眼鏡，氣質內斂沉靜 | 性格: 細緻審慎 | 親密風格: S1 | 預設天賦: O4/I3/B1/S1)
FP26=中村遼介 (Ryousuke Nakamura) (性別: 男 | 國籍: 日本 | 年齡: 24 | 星座: 射手座 | 外貌: 181cm，黝黑健康，短髮俐落，背著相機，笑容自在爽朗 | 性格: 自由熱血 | 親密風格: S3 | 預設天賦: O1/I1/B3/S3)
FP27=姜承佑 (Seung-woo Kang) (性別: 男 | 國籍: 韓國 | 年齡: 29 | 星座: 金牛座 | 外貌: 183cm，輪廓分明，穿著白廚師服，袖口微捲，笑容溫潤沉穩 | 性格: 務實體貼 | 親密風格: S2 | 預設天賦: O2/I2/B2/S2)
FP28=亞德里安‧辛克萊 (Adrian Sinclair) (性別: 男 | 國籍: 澳洲 | 年齡: 37 | 星座: 天蠍座 | 外貌: 186cm，高鼻梁，深邃藍眼，短髮混雜灰色，冷冽俊逸 | 性格: 洞察冷靜 | 親密風格: S4 | 預設天賦: O3/I4/B2/S4)
FP29=唐奕軒 (Yi-Xuan Tang) (性別: 男 | 國籍: 台灣 | 年齡: 25 | 星座: 水瓶座 | 外貌: 180cm，髮色淺棕，臉型俊朗，穿寬鬆帽T，笑容明亮俏皮 | 性格: 創新風趣 | 親密風格: S2 | 預設天賦: O2/I2/B2/S2)
FP30=藤原悠司 (Yuji Fujiwara) (性別: 男 | 國籍: 日本 | 年齡: 27 | 星座: 雙魚座 | 外貌: 179cm，黑髮半長，唇角帶痞氣，眼神慵懶，街頭塗鴉風格 | 性格: 隨性放浪 | 親密風格: S3 | 預設天賦: O1/I2/B1/S3)
`;

interface ParsedPassenger {
  num: string; chineseName: string; englishName: string; gender: string;
  nationality: string; age: string; zodiac: string; appearance: string;
  personality: string; intimacyStyle: string; attributes: string;
}

function parsePassengerRoster(data: string): ParsedPassenger[] {
    const passengers: ParsedPassenger[] = [];
    const regex = /FP(\d{2})=(.*?)\s\((.*?)\)\s\(性別:\s(.*?)\s\|\s國籍:\s(.*?)\s\|\s年齡:\s(.*?)\s\|\s星座:\s(.*?)\s\|\s外貌:\s(.*?)\s\|\s性格:\s(.*?)\s\|\s親密風格:\s(.*?)\s\|\s預設天賦:\s(.*?)\)/;
    
    // Corrected logic: Split the multi-line string into an array of lines.
    const lines = data.trim().split('\n');

    for (const line of lines) {
        const match = line.trim().match(regex);
        if (match) {
            passengers.push({
                num: match[1],
                chineseName: match[2].trim(),
                englishName: match[3].trim(),
                gender: match[4].trim(),
                nationality: match[5].trim(),
                age: match[6].trim(),
                zodiac: match[7].trim(),
                appearance: match[8].trim(),
                personality: match[9].trim(),
                intimacyStyle: match[10].trim(),
                attributes: match[11].trim(),
            });
        } else {
            console.warn("Could not parse passenger line:", line.trim());
        }
    }
    return passengers;
}

const parsedPassengers = parsePassengerRoster(passengerRosterData);

const passengerCharacters: Character[] = parsedPassengers.map(p => {
    const description = `${p.nationality}${p.zodiac}${p.gender}性，${p.age}歲，${p.appearance}。`;
    const persona = `你是一位名為${p.chineseName}的列車乘客。你是${p.nationality}人，${p.age}歲的${p.zodiac}${p.gender}性。你的外貌特徵是：${p.appearance}。你的性格${p.personality}。你的親密風格代號是 ${p.intimacyStyle}，請參考總綱中的親密風格定義來扮演。你的所有回應都必須使用繁體中文。`;
    
    let greeting = `你好，我叫${p.chineseName}。`; // A more personal default
    const personality = p.personality;
    const name = p.chineseName;

    // Reserved/Cold personalities
    if (['聰敏含蓄', '理智睿智', '冷靜孤傲', '理性深沉', '精緻挑剔', '嚴謹冷靜', '感性內斂', '內斂守禮', '細緻審慎', '洞察冷靜'].includes(personality)) {
        const greetings = [
            `你好，我是${name}。`,
            `我是${name}，有什麼事嗎？`,
            `（他只是靜靜地看了你一眼，微微點頭致意。）`,
            `${name}。`,
            `嗯。`
        ];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
    } 
    // Outgoing/Confident personalities
    else if (['自信強烈', '豪爽奔放', '熱情直接', '主動熱烈', '熱血直白', '果敢霸氣', '自由熱血'].includes(personality)) {
        const greetings = [`嗨！我是${name}，很高興認識你！`, `嘿，我叫${name}，要聊聊嗎？`];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Gentle/Caring personalities
    else if (['細膩感性', '溫柔風趣', '細膩體貼', '務實體貼', '踏實可靠'].includes(personality)) {
        const greetings = [`你好，我是${name}。很高興能在這裡遇見你。`, `你好，我叫${name}。有什麼需要幫忙的隨時可以說。`];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Romantic/Artistic personalities
    else if (['瀟灑浪漫', '浪漫熱情', '感性夢幻', '隨性放浪'].includes(personality)) {
        const greetings = [`嘿，旅途愉快嗎？我是${name}。`, `看來我們是同路人呢。我叫${name}。`];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // Creative/Smart personalities
    else if (['靈動聰穎', '叛逆創新', '創新風趣', '圓融機敏'].includes(personality)) {
        const greetings = [`唷，新面孔。我是${name}，多指教。`, `你看起來挺有趣的。我叫${name}。`];
        greeting = greetings[Math.floor(Math.random() * greetings.length)];
    }

    return {
        id: `fp${p.num}`,
        name: `${p.chineseName} (${p.englishName})`,
        avatar: `https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/MagicTrain/pic/FP${p.num}.png`,
        description: description,
        persona: persona,
        greeting: greeting,
    };
});


const CHARACTERS: Character[] = [...coreCharacters, ...passengerCharacters];


const SAVE_KEY = 'gemini-chat-app-save-data';

const App: React.FC = () => {
  type AppState = 'verifying' | 'loading' | 'has_save' | 'needs_creation' | 'chatting' | 'settings' | 'notebook' | 'status';
  const [appState, setAppState] = useState<AppState>('verifying');

  const [player, setPlayer] = useState<Player | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [favorabilityData, setFavorabilityData] = useState<Record<string, number>>({});
  const [messageCounters, setMessageCounters] = useState<Record<string, number>>({});
  const [notebooks, setNotebooks] = useState<Record<string, string>>({});
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // --- Game State Management ---

  const saveGameState = useCallback(() => {
    if (appState === 'verifying' || appState === 'loading') return;
    try {
      const gameState = {
        player,
        chatHistories,
        activeCharacterId,
        favorabilityData,
        messageCounters,
        notebooks,
        lastPlayed: new Date().toISOString(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }, [player, chatHistories, activeCharacterId, favorabilityData, messageCounters, notebooks, appState]);
  
  const loadGameState = useCallback(() => {
    try {
        const savedStateJSON = localStorage.getItem(SAVE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);

            if (savedState.player && savedState.chatHistories) {
                // --- Data Migration Logic ---
                // This will update older save files to be compatible with new features.
                const migratedChatHistories = { ...savedState.chatHistories };
                Object.keys(migratedChatHistories).forEach(charId => {
                    if (Array.isArray(migratedChatHistories[charId])) {
                        migratedChatHistories[charId] = migratedChatHistories[charId].map((msg: any) => {
                            // Old messages might be missing the 'type' property. Default it to 'chat'.
                            if (!msg.type) {
                                return { ...msg, type: 'chat' };
                            }
                            return msg;
                        });
                    }
                });

                setPlayer(savedState.player);
                setChatHistories(migratedChatHistories);
                setActiveCharacterId(savedState.activeCharacterId || null);
                setFavorabilityData(savedState.favorabilityData || {});
                setMessageCounters(savedState.messageCounters || {});
                setNotebooks(savedState.notebooks || {});
                console.log("Game state loaded and migrated.");
                return true;
            }
        }
    } catch (error) {
        console.error("Failed to load or migrate game state. Starting a new game.", error);
        // If loading/migration fails, it's safer to clear the broken save file.
        localStorage.removeItem(SAVE_KEY);
    }
    return false;
  }, []);
  
  // Auto-save whenever critical state changes
  useEffect(() => {
      saveGameState();
  }, [saveGameState]);

  useEffect(() => {
    // Initial load check
    if (appState === 'loading') {
      if (loadGameState()) {
        setAppState('has_save');
      } else {
        setAppState('needs_creation');
      }
    }
  }, [appState, loadGameState]);

  // Effect to handle toast message auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  // --- Handlers ---
  
  const handleVerifyAge = () => setAppState('loading');

  const handleCreationComplete = (playerData: Player) => {
    setPlayer(playerData);
    setAppState('chatting');
  };

  const handleContinue = () => setAppState('chatting');

  const handleNewGameConfirm = () => {
    localStorage.removeItem(SAVE_KEY);
    setPlayer(null);
    setChatHistories({});
    setActiveCharacterId(null);
    setFavorabilityData({});
    setMessageCounters({});
    setNotebooks({});
    resetChat(activeCharacterId || '');
    setAppState('needs_creation');
  };

  const handleExportSave = () => {
    try {
      const gameState = {
        player,
        chatHistories,
        activeCharacterId,
        favorabilityData,
        messageCounters,
        notebooks,
        lastPlayed: new Date().toISOString(),
      };
      const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `magic-train-save-${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (error) {
      console.error("Failed to export game state:", error);
      alert("匯出存檔時發生錯誤。");
    }
  };

  const handleImportSave = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("無效的檔案內容。");
        const importedState = JSON.parse(text);

        if (importedState.player && importedState.chatHistories) {
          const migratedChatHistories = { ...importedState.chatHistories };
          Object.keys(migratedChatHistories).forEach(charId => {
            if (Array.isArray(migratedChatHistories[charId])) {
              migratedChatHistories[charId] = migratedChatHistories[charId].map((msg: any) => {
                if (!msg.type) return { ...msg, type: 'chat' };
                return msg;
              });
            }
          });

          setPlayer(importedState.player);
          setChatHistories(migratedChatHistories);
          setActiveCharacterId(importedState.activeCharacterId || null);
          setFavorabilityData(importedState.favorabilityData || {});
          setMessageCounters(importedState.messageCounters || {});
          setNotebooks(importedState.notebooks || {});
          
          alert("存檔匯入成功！遊戲將會刷新以套用變更。");
          window.location.reload();
        } else {
          throw new Error("存檔檔案格式不正確。");
        }
      } catch (error) {
        console.error("Failed to import save:", error);
        alert(`匯入存檔失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  
  const handleSelectCharacter = (id: string) => {
    if (activeCharacterId !== id) {
        // Reset lust when switching characters
        setPlayer(p => p ? ({ ...p, lust: 0 }) : null);
        setActiveCharacterId(id);
    }

    // Add greeting message if it's the first time
    if (!chatHistories[id] || chatHistories[id].length === 0) {
      const character = CHARACTERS.find(c => c.id === id);
      if (character) {
        const greetingMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'chat',
          text: character.greeting,
          sender: MessageSender.MODEL,
          timestamp: new Date(),
        };
        setChatHistories(prev => ({
          ...prev,
          [id]: [greetingMessage],
        }));
      }
    }

    setAppState('chatting');
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (query: string) => {
    if (!activeCharacterId || !player) return;

    const character = CHARACTERS.find(c => c.id === activeCharacterId);
    if (!character) return;
    
    const currentHistory = chatHistories[activeCharacterId] || [];
    const currentNotebook = notebooks[activeCharacterId] || '';
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'chat',
      text: query,
      sender: MessageSender.USER,
      timestamp: new Date(),
    };

    const updatedHistory = [...currentHistory, newMessage];
    setChatHistories(prev => ({ ...prev, [activeCharacterId]: updatedHistory }));
    setIsLoading(true);

    try {
        const favorability = favorabilityData[activeCharacterId] || 0;
        const response = await sendMessageToCharacter(character, player, query, currentHistory, favorability, currentNotebook);
        
        const modelMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'chat',
            text: response.text.replace(/(\r\n|\n|\r)/gm, "  \n"),
            sender: MessageSender.MODEL,
            timestamp: new Date(),
            playerThought: response.playerThought,
            characterThought: response.characterThought,
            storyHint: response.storyHint,
        };
        
        let finalHistory = [...updatedHistory, modelMessage];
        
        if (response.updatedFavorability !== undefined) {
            setFavorabilityData(prev => ({
                ...prev,
                [activeCharacterId]: Math.max(-1, Math.min(5, (prev[activeCharacterId] || 0) + response.updatedFavorability!))
            }));
        }

        if (response.updatedLust !== undefined) {
            setPlayer(p => p ? ({ ...p, lust: Math.max(0, Math.min(100, p.lust + response.updatedLust!)) }) : null);
        }
        
        const counter = (messageCounters[activeCharacterId] || 0) + 2;
        const lustDidChange = response.updatedLust !== undefined && response.updatedLust > 0;
        
        if (counter >= 8 && !lustDidChange) {
            const summary = await generateConversationSummary(character, player, finalHistory);
            const summaryMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                type: 'summary',
                text: summary,
                sender: MessageSender.SYSTEM,
                timestamp: new Date(),
            };
            finalHistory = [...finalHistory, summaryMessage];
            setMessageCounters(prev => ({ ...prev, [activeCharacterId]: 0 }));
        } else if (lustDidChange) {
            setMessageCounters(prev => ({ ...prev, [activeCharacterId]: 0 }));
        }
        else {
             setMessageCounters(prev => ({ ...prev, [activeCharacterId]: counter }));
        }
        
        setChatHistories(prev => ({ ...prev, [activeCharacterId]: finalHistory }));
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'chat',
        text: "抱歉，我現在無法回應。請稍後再試。",
        sender: MessageSender.MODEL,
        timestamp: new Date(),
      };
      setChatHistories(prev => ({ ...prev, [activeCharacterId]: [...updatedHistory, errorMessage] }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestartConversation = async (characterId: string) => {
    if (!player) return;
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;

    setIsLoading(true);
    try {
        const historyToSummarize = chatHistories[characterId] || [];
        if (historyToSummarize.length > 1) { // Only summarize if there's a conversation
          const finalSummary = await generateConversationSummary(character, player, historyToSummarize);
          const summaryText = `--- 對話重置前的最終摘要 (${new Date().toLocaleString()}) ---\n${finalSummary}\n\n`;
          setNotebooks(prev => ({
            ...prev,
            [characterId]: summaryText + (prev[characterId] || ''),
          }));
        }

        setChatHistories(prev => {
          const newHistories = { ...prev };
          delete newHistories[characterId];
          return newHistories;
        });
        setMessageCounters(prev => {
            const newCounters = { ...prev };
            delete newCounters[characterId];
            return newCounters;
        });
        setPlayer(p => p ? ({ ...p, lust: 0 }) : null);
        resetChat(characterId);
        
        const greetingMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'chat',
          text: character.greeting,
          sender: MessageSender.MODEL,
          timestamp: new Date(),
        };
        setChatHistories(prev => ({
          ...prev,
          [characterId]: [greetingMessage],
        }));
        setToastMessage('對話已重置，摘要已存入筆記本。');
    } catch(error) {
        console.error("Failed during conversation reset:", error);
        setToastMessage("重置對話時發生錯誤。");
    } finally {
        setIsLoading(false);
    }
  };

  const handleManualSummary = async (characterId: string) => {
    if (!player) return;
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;

    const historyToSummarize = chatHistories[characterId] || [];
    if (historyToSummarize.length > 1) {
      setIsLoading(true);
      try {
        const summary = await generateConversationSummary(character, player, historyToSummarize);
        const summaryText = `--- 手動摘要 (${new Date().toLocaleString()}) ---\n${summary}\n\n`;
        setNotebooks(prev => ({
          ...prev,
          [characterId]: summaryText + (prev[characterId] || ''),
        }));
        setToastMessage('摘要已成功存入筆記本！');
      } catch (error) {
        console.error("Failed to generate manual summary:", error);
        setToastMessage("生成摘要時發生錯誤。");
      } finally {
        setIsLoading(false);
      }
    } else {
      setToastMessage("對話內容太少，無法生成摘要。");
    }
  };

  const handleSaveSettings = (updatedPlayer: Player) => {
    setPlayer(updatedPlayer);
    setAppState('chatting');
  };

  const handleSaveNotebook = (characterId: string, note: string) => {
    setNotebooks(prev => ({
      ...prev,
      [characterId]: note,
    }));
  };
  
  const handleSetView = (view: AppState) => {
    setAppState(view);
  }

  const handleAvatarClick = (imageUrl: string) => {
    setLightboxImageUrl(imageUrl);
  };
  
  // --- Render Logic ---

  const activeCharacter = CHARACTERS.find(c => c.id === activeCharacterId);
  const currentHistory = activeCharacterId ? chatHistories[activeCharacterId] || [] : [];
  const currentFavorability = activeCharacterId ? favorabilityData[activeCharacterId] || 0 : 0;
  const currentNotebook = activeCharacterId ? notebooks[activeCharacterId] || '' : '';

  const renderMainContent = () => {
    switch (appState) {
      case 'verifying':
        return <div className="w-full h-full flex items-center justify-center"><AgeVerification onVerify={handleVerifyAge} /></div>;
      
      case 'loading':
      case 'has_save':
        return <div className="w-full h-full flex items-center justify-center"><GameLoadScreen onContinue={handleContinue} onNewGame={handleNewGameConfirm} /></div>;

      case 'needs_creation':
        return <div className="w-full h-full flex items-center justify-center"><CharacterCreation onCreationComplete={handleCreationComplete} maleAppearances={MALE_APPEARANCES} femaleAppearances={FEMALE_APPEARANCES} /></div>;

      case 'settings':
        return <Settings 
                  player={player} 
                  onSave={handleSaveSettings} 
                  maleAppearances={MALE_APPEARANCES} 
                  femaleAppearances={FEMALE_APPEARANCES} 
                  onFullReset={handleNewGameConfirm}
                  onClose={() => setAppState('chatting')}
                  onExportSave={handleExportSave}
                  onImportSave={handleImportSave}
                />;
      
      case 'notebook':
        return activeCharacter ? <Notebook 
                  character={activeCharacter} 
                  note={currentNotebook} 
                  onSave={handleSaveNotebook}
                  onClose={() => setAppState('chatting')}
                /> : <p>錯誤：沒有選擇角色</p>;

      case 'status':
         return <RelationshipStatus 
                  characters={CHARACTERS} 
                  player={player} 
                  favorabilityData={favorabilityData}
                  onSelectCharacter={handleSelectCharacter} 
                />;

      case 'chatting':
      default:
        return (
          <ChatInterface
            messages={currentHistory}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            activeCharacter={activeCharacter}
            player={player}
            favorability={currentFavorability}
            onRestartConversation={handleRestartConversation}
            onManualSummary={handleManualSummary}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onSetView={(view) => {
              if (view === 'notebook') setAppState('notebook');
              else if (view === 'settings') setAppState('settings');
              else setAppState('chatting');
            }}
          />
        );
    }
  };
  
  const showSidebar = !['verifying', 'loading', 'has_save', 'needs_creation'].includes(appState);

  return (
    <main className={`h-full w-full bg-[#FFFCF9] text-stone-900 fixed inset-0 ${showSidebar ? 'flex p-4 gap-4' : ''}`}>
      {showSidebar && (
        <>
          <div 
            className={`fixed inset-0 bg-black/30 z-10 transition-opacity md:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <aside className={`absolute md:relative top-0 left-0 h-full w-full max-w-sm md:max-w-xs lg:max-w-sm transform transition-transform z-20 md:z-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 p-4 md:p-0`}>
             <CharacterSelector
              characters={CHARACTERS}
              activeCharacterId={activeCharacterId}
              onSelectCharacter={handleSelectCharacter}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              onShowSettings={() => setAppState('settings')}
              onAvatarClick={handleAvatarClick}
              currentView={appState === 'chatting' || isLoading ? 'chat' : (appState === 'status' || appState === 'settings' || appState === 'notebook') ? appState : 'status'}
              favorabilityData={favorabilityData}
            />
          </aside>
        </>
      )}

      <section className={`h-full min-w-0 ${showSidebar ? 'flex-1' : 'w-full'}`}>
        {renderMainContent()}
      </section>

      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-stone-800/90 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in backdrop-blur-sm">
          {toastMessage}
        </div>
      )}

      {lightboxImageUrl && (
        <ImageLightbox imageUrl={lightboxImageUrl} onClose={() => setLightboxImageUrl(null)} />
      )}
    </main>
  );
};

export default App;