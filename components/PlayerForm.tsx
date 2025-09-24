/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Player, Appearance } from '../types';
import { Save, ImageUp } from 'lucide-react';

interface PlayerFormProps {
  initialData: Partial<Player> | null;
  onSave: (playerData: Player) => void;
  buttonText: string;
  maleAppearances: Appearance[];
  femaleAppearances: Appearance[];
}

const ZODIAC_SIGNS = [
  '♈ 牡羊座', '♉ 金牛座', '♊ 雙子座', '♋ 巨蟹座', '♌ 獅子座', '♍ 處女座',
  '♎ 天秤座', '♏ 天蠍座', '♐ 射手座', '♑ 摩羯座', '♒ 水瓶座', '♓ 雙魚座'
];


const PlayerForm: React.FC<PlayerFormProps> = ({ initialData, onSave, buttonText, maleAppearances, femaleAppearances }) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [salutation, setSalutation] = useState('');
  const [gender, setGender] = useState<'男' | '女'>('女');
  const [zodiac, setZodiac] = useState(ZODIAC_SIGNS[0]);
  const [selectedAppearanceId, setSelectedAppearanceId] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setNickname(initialData.nickname || '');
      setSalutation(initialData.salutation || '');
      setGender(initialData.gender || '女');
      setZodiac(initialData.zodiac || ZODIAC_SIGNS[0]);
      setSelectedAppearanceId(initialData.appearance?.id || (initialData.gender === '男' ? maleAppearances[0].id : femaleAppearances[0].id));
      setAvatar(initialData.avatar);
    } else {
        // Defaults for creation form
        setSelectedAppearanceId(femaleAppearances[0].id);
    }
  }, [initialData, maleAppearances, femaleAppearances]);

  const handleGenderChange = (newGender: '男' | '女') => {
    setGender(newGender);
    if (gender !== newGender) {
        const defaultAppearance = newGender === '男' ? maleAppearances[0] : femaleAppearances[0];
        setSelectedAppearanceId(defaultAppearance.id);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatar(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  const getDefaultAvatarUrl = (gender: '男' | '女', appearanceId: string): string | undefined => {
    if (!appearanceId) return undefined;
    const baseUrl = 'https://raw.githubusercontent.com/yuhnmomo/yuhnmomo.github.io/main/Role/RLGuide/images/';
    const match = appearanceId.match(/\d{2}$/);
    if (!match) return undefined;
    const num = match[0];
    if (gender === '男') {
        return `${baseUrl}M${num}.png`;
    } else {
        return `${baseUrl}F${num}.png`;
    }
  };


  const handleSave = () => {
    if (!name.trim() || !nickname.trim() || !salutation.trim() || !zodiac.trim()) {
        alert("請填寫所有必填欄位。");
        return;
    }
    const availableAppearances = gender === '男' ? maleAppearances : femaleAppearances;
    const selectedAppearance = availableAppearances.find(app => app.id === selectedAppearanceId);

    if (selectedAppearance) {
      const defaultAvatarUrl = getDefaultAvatarUrl(gender, selectedAppearance.id);
      const finalAvatar = avatar || defaultAvatarUrl;

      const playerData: Player = {
        name,
        nickname,
        salutation,
        gender,
        zodiac,
        appearance: selectedAppearance,
        attributes: selectedAppearance.attributes,
        avatar: finalAvatar,
        // Use existing lust value or default to 0
        lust: initialData?.lust || 0,
      };
      onSave(playerData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
        alert("錯誤：找不到所選的外觀。");
    }
  };
  
  const availableAppearances = gender === '男' ? maleAppearances : femaleAppearances;
  const selectedAppearance = availableAppearances.find(app => app.id === selectedAppearanceId);
  const displayAvatar = avatar || getDefaultAvatarUrl(gender, selectedAppearanceId);

  return (
    <div className="flex-grow overflow-y-auto chat-container pr-2">
      <div className="max-w-xl mx-auto w-full space-y-6">
        
        {/* Row 1: Avatar */}
        <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full bg-stone-200 flex-shrink-0 overflow-hidden border-2 border-black/10">
                {displayAvatar ? <img src={displayAvatar} alt="Avatar Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-500 text-sm">無頭像</div>}
            </div>
            <label htmlFor="avatar-upload" className="cursor-pointer bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5">
                <ImageUp size={16} />
                更換頭像
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
        </div>
        
        {/* Row 2: Name */}
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-600 mb-2">姓名</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6]"/>
        </div>
        
        {/* Row 3: Nickname & Salutation */}
        <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
                <label htmlFor="nickname" className="block text-sm font-medium text-stone-600 mb-2">暱稱</label>
                <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6]"/>
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="salutation" className="block text-sm font-medium text-stone-600 mb-2">稱呼</label>
                <input type="text" id="salutation" value={salutation} onChange={(e) => setSalutation(e.target.value)} className="w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6]"/>
            </div>
        </div>
        
        {/* Row 4: Gender & Zodiac */}
        <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-stone-600 mb-2">性別</label>
                <div className="flex gap-2 h-[42px] items-stretch">
                    {(['男', '女'] as const).map(g => (
                        <button key={g} onClick={() => handleGenderChange(g)} className={`w-full justify-center flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${gender === g ? 'bg-[#E098AE] text-white border-transparent' : 'bg-transparent border-[#FFD0A6] hover:border-[#E098AE]'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 w-full">
                <label htmlFor="zodiac" className="block text-sm font-medium text-stone-600 mb-2">星座</label>
                <select
                    id="zodiac"
                    value={zodiac}
                    onChange={(e) => setZodiac(e.target.value)}
                    className="w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6] h-[42px]"
                >
                    {ZODIAC_SIGNS.map(sign => (
                        <option key={sign} value={sign}>
                            {sign}
                        </option>
                    ))}
                </select>
            </div>
        </div>

         <div>
            <label htmlFor="appearance" className="block text-sm font-medium text-stone-600 mb-2">外觀</label>
            <select
                id="appearance"
                value={selectedAppearanceId}
                onChange={(e) => setSelectedAppearanceId(e.target.value)}
                className="w-full bg-[#FFFCF9] border border-[#FFD0A6]/50 rounded-lg px-3 py-2 text-stone-900 focus:ring-2 focus:ring-[#FFD0A6] focus:border-[#FFD0A6]"
            >
                {availableAppearances.map(app => (
                <option key={app.id} value={app.id}>
                    {app.name}
                </option>
                ))}
            </select>
            {selectedAppearance && (
                <div className="mt-2 p-3 bg-[#FFCEC7]/30 rounded-md text-xs text-stone-600 border border-[#FFCEC7]/50">
                    <p className="whitespace-pre-line">{selectedAppearance.description}</p>
                    <div className="mt-2 pt-2 border-t border-[#FFCEC7]/50 text-stone-800 font-medium">
                        魅力指數：
                        <span className="ml-2 font-mono tracking-wider">
                            O:{selectedAppearance.attributes.O} / I:{selectedAppearance.attributes.I} / B:{selectedAppearance.attributes.B} / S:{selectedAppearance.attributes.S}
                        </span>
                    </div>
                </div>
            )}
        </div>
        
        <div className="pt-4">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-[#E098AE] hover:bg-[#d4879d] text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              <Save size={18} />
              {isSaved ? '已儲存！' : buttonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerForm;