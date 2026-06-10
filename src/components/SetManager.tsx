import React, { useState } from 'react';
import { GameSet } from '../types';
import { GothicCard } from './GothicCard';
import { Plus, X, Award, ShieldAlert, Sparkles } from 'lucide-react';

interface SetManagerProps {
  sets: GameSet[];
  onAddSet: (newSet: Omit<GameSet, 'id'>) => void;
  onDeleteSet: (id: string) => void;
}

export const SetManager: React.FC<SetManagerProps> = ({ sets, onAddSet, onDeleteSet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入套装名称');
      return;
    }
    if (!description.trim()) {
      setError('请输入套装效果描述');
      return;
    }

    onAddSet({ name, description });
    setName('');
    setDescription('');
    // Keep set creation flow intuitive
    const notifyElem = document.getElementById('set-success-alert');
    if (notifyElem) {
      notifyElem.classList.remove('opacity-0');
      setTimeout(() => notifyElem.classList.add('opacity-0'), 2500);
    }
  };

  return (
    <div className="border border-[#b89b5c] rounded-lg p-5 bg-black/40 relative shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-black border border-[#b89b5c] text-[#d4a853] text-[10px] font-mono uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
        <Award className="w-3 h-3" />
        <span>套装配置管理</span>
      </div>
 
      <div className="flex flex-col md:flex-row gap-6 mt-2">
        {/* Left column: Add/New Form */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-[#b89b5c]/20 pb-5 md:pb-0 md:pr-6">
          <h3 className="text-sm font-semibold text-[#d4a853] mb-3 flex items-center gap-1.5 font-gothic">
            <Sparkles className="w-4 h-4 text-[#d4a853]" />
            新建套装数据
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#b89b5c] mb-1 font-medium">套装名称 <span className="text-[#a13d3d]">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：雷霆套装"
                className="w-full bg-black border border-[#b89b5c]/40 hover:border-[#b89b5c]/60 rounded px-3 py-2 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] transition-colors placeholder-[#b89b5c]/40"
              />
            </div>
            <div>
              <label className="block text-[#b89b5c] mb-1 font-medium">套装效果与属性描述 <span className="text-[#a13d3d]">*</span></label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="例如：二件套：雷电属性抗性增加；三件套：攻击产生雷击效果..."
                className="w-full bg-black border border-[#b89b5c]/40 hover:border-[#b89b5c]/60 rounded px-3 py-2 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] transition-colors resize-none placeholder-[#b89b5c]/40"
              />
            </div>
 
            {error && (
              <p className="text-[#a13d3d] text-[11px] flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
 
            <button
               type="submit"
               className="w-full cursor-pointer bg-[#d4a853]/15 hover:bg-[#d4a853]/25 text-[#d4a853] border border-[#d4a853]/55 px-4 py-2 rounded font-medium hover:shadow-[0_0_12px_rgba(212,168,83,0.3)] transition-all flex items-center justify-center gap-1.5"
             >
               <Plus className="w-4 h-4" />
               <span>保存新套装</span>
             </button>
  
             <div id="set-success-alert" className="opacity-0 transition-opacity duration-300 text-emerald-500 text-[11px] text-center pt-1 font-mono">
               ✦ 套装保存成功 ✦
             </div>
           </form>
         </div>
 
         {/* Right column: Current List */}
         <div className="w-full md:w-3/5">
           <h3 className="text-sm font-semibold text-[#b89b5c] mb-3">当前共有 {sets.length} 个自定义套装</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sets.map((set) => (
              <div
                key={set.id}
                className="relative bg-neutral-900/60 border border-neutral-800 rounded-md p-3 hover:border-[#b89b5c]/30 transition-all flex items-start justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#e6d8b5] font-gothic">{set.name}</span>
                    <span className="text-[9px] font-mono bg-neutral-950 px-1.5 py-0.5 rounded text-[#b89b5c] border border-[#b89b5c]/20">
                      {set.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed max-w-md">{set.description}</p>
                </div>
                {/* Prevent deleting core sets that are active to safeguard references */}
                <button
                  type="button"
                  onClick={() => onDeleteSet(set.id)}
                  className="p-1 rounded text-neutral-500 hover:text-[#a13d3d] hover:bg-neutral-950 transition-all opacity-0 group-hover:opacity-100"
                  title="删除此套装"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
