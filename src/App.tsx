import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_SETS,
  INITIAL_ITEMS,
  INITIAL_GEARS,
  INITIAL_ENEMIES,
  INITIAL_EVENTS,
  PRESETS,
  SVG_ICONS
} from './data';
import {
  GameSet,
  ItemResource,
  GearResource,
  EnemyResource,
  EventResource,
  EventOption,
  ResourceType
} from './types';
import { GothicCard } from './components/GothicCard';
import { FramePreview } from './components/FramePreview';
import { SetManager } from './components/SetManager';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Info,
  Shield,
  Zap,
  Sword,
  Skull,
  Eye,
  FileJson,
  Archive,
  Star,
  Settings,
  Flame,
  Check,
  MapPin,
  ChevronRight,
  ArrowDownCircle,
  HelpCircle,
  Award,
  GitBranch
} from 'lucide-react';
import JSZip from 'jszip';
import { playSound } from './utils/audio';

interface RecursiveOptionsEditorProps {
  options: EventOption[];
  parentPath: string[];
  depth: number;
  onUpdateField: (path: string[], field: string, value: any) => void;
  onRemoveNode: (path: string[]) => void;
  onAddNestedOption: (path: string[]) => void;
}

const RecursiveOptionsEditor: React.FC<RecursiveOptionsEditorProps> = ({
  options,
  parentPath,
  depth,
  onUpdateField,
  onRemoveNode,
  onAddNestedOption
}) => {
  const depthColors = [
    'border-[#10b981]/55', // Emerald
    'border-[#06b6d4]/55', // Cyan
    'border-[#f59e0b]/55', // Amber
    'border-[#ec4899]/55', // Pink
    'border-[#8b5cf6]/55'  // Violet
  ];
  const borderClass = depthColors[depth % depthColors.length];

  return (
    <div className="space-y-4">
      {options.map((opt, oIdx) => {
        const currentPath = [...parentPath, opt.id];
        const hasNextEvent = opt.nextDescription !== undefined || (opt.nestedOptions && opt.nestedOptions.length > 0) || opt.nextIllustration !== undefined;

        const handleToggleNextEvent = () => {
          if (hasNextEvent) {
            onUpdateField(currentPath, 'nextDescription', undefined);
            onUpdateField(currentPath, 'nextIllustration', undefined);
            onUpdateField(currentPath, 'nestedOptions', undefined);
          } else {
            onUpdateField(currentPath, 'nextDescription', '在做出选择后，剧情发生了新的偏转与展开...');
            onUpdateField(currentPath, 'nextIllustration', SVG_ICONS.event);
            onUpdateField(currentPath, 'nestedOptions', [
              {
                id: `opt_nest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                text: '次级决策选项支',
                result: '引发更深一层的后果',
                probability: 100
              }
            ]);
          }
        };

        return (
          <div 
            key={opt.id} 
            className={`bg-neutral-950/80 p-4 rounded-lg border border-neutral-850 shadow-md relative pl-4 border-l-4 ${borderClass} text-left animate-fade`}
          >
            <div className="absolute top-2 right-3 flex items-center gap-1.5">
              <span className="text-[9px] text-[#b89b5c] font-mono select-none px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                {depth === 0 ? `根选项 [分支-${oIdx + 1}]` : `${depth}级子选项 [分支-${oIdx + 1}]`}
              </span>
            </div>

            {/* Fields input */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-[10px] text-neutral-400 mb-1 font-medium">选项文字内容 *</label>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => onUpdateField(currentPath, 'text', e.target.value)}
                  className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 focus:border-[#d4a853] focus:outline-none text-neutral-200"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[10px] text-neutral-400 mb-1 font-medium">即时后果/选项结果</label>
                <input
                  type="text"
                  value={opt.result}
                  onChange={(e) => onUpdateField(currentPath, 'result', e.target.value)}
                  className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-yellow-105/90 focus:border-[#d4a853] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] text-neutral-400 mb-1 font-medium">触发几率 (%)</label>
                <input
                  type="number"
                  value={opt.probability}
                  onChange={(e) => onUpdateField(currentPath, 'probability', Number(e.target.value))}
                  className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-center text-neutral-200 focus:border-[#d4a853] focus:outline-none"
                />
              </div>
              <div className="md:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onRemoveNode(currentPath)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                  title="删除该选项"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-event Toggle Button */}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handleToggleNextEvent}
                className={`text-[10px] border px-2.5 py-1 rounded transition-all font-mono flex items-center gap-1 ${
                  hasNextEvent 
                    ? 'bg-[#064e3b]/40 text-emerald-300 border-[#059669]/40 font-semibold shadow-inner' 
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-[#00ffd5]/90 hover:border-[#00ffd5]/40'
                }`}
              >
                <ChevronRight className={`w-3 h-3 transform transition-transform ${hasNextEvent ? 'rotate-90 text-emerald-400' : ''}`} />
                <span>{hasNextEvent ? '✓ 已配置下一级事件内容' : '+ 配置下一级事件(选项嵌套)'}</span>
              </button>
            </div>

            {/* Sub-event Form */}
            {hasNextEvent && (
              <div className="mt-3.5 pl-3.5 border-l border-dashed border-neutral-800 bg-black/40 p-3 rounded space-y-4 pt-4 animate-fade">
                <div className="flex items-center gap-1.5 border-b border-neutral-900 pb-1.5 text-[#00ffd5]">
                  <GitBranch className="w-3.5 h-3.5 block text-[#00ffd5]" />
                  <span className="text-[10px] font-bold tracking-wider font-mono uppercase">
                    第 {depth + 1} 层暗线嵌套子事件
                  </span>
                </div>

                {/* Sub-Event Description input */}
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1 font-medium">
                    下一级事件详细描述内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={opt.nextDescription || ''}
                    onChange={(e) => onUpdateField(currentPath, 'nextDescription', e.target.value)}
                    rows={2}
                    placeholder="请输入这一层后续子剧情更深一步的遭遇状况详细剧情内容描述"
                    className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200 focus:outline-none focus:border-[#d4a853] resize-none"
                  />
                </div>

                {/* Sub-Event Illustration upload */}
                <div className="bg-neutral-900/40 p-2.5 border border-neutral-850 rounded grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-8 space-y-1 text-left">
                    <label className="block text-[10px] text-[#d4a853] font-medium">
                      下一级事件独立插图贴图 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onloadend = () => {
                            onUpdateField(currentPath, 'nextIllustration', r.result as string);
                          };
                          r.readAsDataURL(file);
                        }
                      }}
                      className="text-[10px] text-neutral-500 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 cursor-pointer w-full"
                    />
                  </div>
                  <div className="sm:col-span-4 flex justify-end">
                    <img 
                      src={opt.nextIllustration || SVG_ICONS.event} 
                      alt="nest illust preview" 
                      className="h-14 w-20 object-contain bg-neutral-950 border border-neutral-850 rounded p-0.5"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Recursive options rendering inside nesting */}
                <div className="space-y-3 pt-1 text-left">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-1.5">
                    <span className="text-[10px] text-neutral-300 font-medium font-mono">
                      【下一级子事件后续分支】
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddNestedOption(currentPath)}
                      className="text-[9px] bg-neutral-900 hover:bg-neutral-850 border border-[#00ffd5]/40 text-[#00ffd5] font-mono px-2 py-0.5 rounded transition-all"
                    >
                      + 新增后置选择支
                    </button>
                  </div>

                  {opt.nestedOptions && opt.nestedOptions.length > 0 ? (
                    <RecursiveOptionsEditor
                      options={opt.nestedOptions}
                      parentPath={currentPath}
                      depth={depth + 1}
                      onUpdateField={onUpdateField}
                      onRemoveNode={onRemoveNode}
                      onAddNestedOption={onAddNestedOption}
                    />
                  ) : (
                    <div className="text-[10px] text-neutral-500 italic pl-1 text-left">
                      暂无后置选择支，请点击新增子选择支
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const RecursiveTreePreview: React.FC<{ options: EventOption[]; depth: number }> = ({ options, depth }) => {
  return (
    <div className="space-y-2 mt-2 text-left">
      {options.map((opt, idx) => (
        <div key={opt.id} className="pl-3.5 border-l border-dashed border-neutral-800/85 space-y-1.5 pt-1 bg-black/15 p-2.5 rounded">
          <p className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
            <span className="text-neutral-500">[{depth}层] 支线 {idx + 1}:</span>
            <span className="text-[#d4a853]">{opt.text}</span>
            <span className="text-neutral-550 text-[10px]">({opt.probability}%)</span>
          </p>
          <p className="text-[11px] text-[#00ffd5]/95 pl-4">
            ↳ 触发后果: {opt.result || '无'}
          </p>
          {opt.nextDescription && (
            <div className="pl-4 py-1.5 text-[11px] text-neutral-400 border-l border-neutral-800/60 max-w-full my-1">
              <span className="text-neutral-500 font-bold block text-[9px] font-mono tracking-widest uppercase mb-0.5">【下一级子遭遇剧情】</span>
              <p className="italic text-[#e6d8b5]/85">{opt.nextDescription}</p>
              {opt.nextIllustration && (
                <div className="mt-1.5 flex items-center gap-2.5">
                  <span className="text-[9px] text-[#b89b5c] font-mono">专属贴图: </span>
                  <img src={opt.nextIllustration} className="h-10 w-16 object-contain bg-neutral-950 border border-neutral-900 rounded p-0.5" alt="Sub illustration" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          )}
          {opt.nestedOptions && opt.nestedOptions.length > 0 && (
            <div className="pl-2">
              <RecursiveTreePreview options={opt.nestedOptions} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 3. LANDING PAGE LOGO INTRO ANIMATION (ANVIL ELEMENTS)
// ==========================================
interface LandingIntroProps {
  onEnter: () => void;
}

const LandingIntro: React.FC<LandingIntroProps> = ({ onEnter }) => {
  const [isStriking, setIsStriking] = useState(false);

  const handleStrike = () => {
    setIsStriking(true);
    playSound('clang');
    // Sound mock/visual bloom animation transition
    setTimeout(() => {
      onEnter();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center p-6 z-50 overflow-hidden text-[#e6d8b5]">
      
      {/* Ambient glowing blacksmith atmospheric smoke/dust particles background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-900/30 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-orange-900/40 rounded-full blur-[110px] animate-pulse duration-1000" />
      </div>

      <div className="max-w-md w-full text-center space-y-8 relative z-10">
        
        {/* Animated Anvil Vector Art container */}
        <div className="relative flex flex-col items-center justify-center py-4">
          <div className="absolute inset-0 bg-[#d4a853]/5 rounded-full blur-[80px] animate-pulse" />
          
          <div className={`transform transition-all duration-300 ${isStriking ? 'scale-90 rotate-2 translate-y-2' : 'hover:scale-105'}`}>
            <svg viewBox="0 0 160 120" className={`w-64 h-48 filter drop-shadow-[0_0_35px_rgba(212,168,83,0.3)] transition-colors ${isStriking ? 'text-amber-300' : 'text-[#d4a853]'}`}>
              <defs>
                <linearGradient id="introAnvilGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="40%" stopColor="#fbbf24" />
                  <stop offset="70%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
                <radialGradient id="introCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="60%" stopColor="#f97316" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>
              
              {/* Stand/base pedestal */}
              <path d="M 40,85 L 120,85 L 130,105 L 30,105 Z" fill="#18130d" stroke="url(#introAnvilGold)" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Anvil middle waist */}
              <path d="M 50,55 Q 80,60 80,85 Q 80,60 110,55 Z" fill="#241910" stroke="url(#introAnvilGold)" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Horn left */}
              <path d="M 50,35 C 20,35 10,48 50,55 Z" fill="#352416" stroke="url(#introAnvilGold)" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Anvil right block/face */}
              <path d="M 50,35 L 140,35 L 140,55 L 110,55 Z" fill="#452f1e" stroke="url(#introAnvilGold)" strokeWidth="2.5" strokeLinejoin="round" />
              
              {/* Hot forging energy core */}
              <ellipse cx="95" cy="45" rx="16" ry="4" fill="url(#introCoreGlow)" className="animate-pulse" />
              <rect x="87" y="44" width="16" height="2" rx="1" fill="#fff" className="animate-pulse" />
            </svg>
          </div>

          {/* Golden Reforging Sparks effect */}
          {isStriking && (
            <div className="absolute inset-x-0 top-1/2 flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-amber-400 rounded-full blur-xl animate-ping opacity-90 scale-150" />
              <div className="absolute w-2 h-2 bg-white rounded-full scale-[20] animate-ping" />
              
              <div className="absolute text-[#d4a853] text-[15px] select-none pointer-events-none tracking-widest font-bold font-mono animate-bounce">
                💥 CLANG!!
              </div>
            </div>
          )}
        </div>

        {/* Brand name definitions inside core */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold font-gothic tracking-[0.15em] text-[#d4a853] glow-text-amber uppercase">
              FORGE  CRAFT
            </h1>
            <p className="text-[10px] font-mono tracking-[0.25em] text-neutral-500 uppercase">
              Blacksmith Reforger Enterprise v2.0
            </p>
          </div>
          
          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#b89b5c]/70 to-transparent mx-auto" />
          
          <p className="text-[11px] text-[#e6d8b5]/75 tracking-wider max-w-sm mx-auto leading-relaxed">
            欢迎载入 ForgeCraft 内部精铸协理数据库。
            我们遵循精简内聚法则，点击下方按钮重铸铁砧。
          </p>
        </div>

        {/* Click triggers animation bloom */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleStrike}
            disabled={isStriking}
            className={`px-8 py-3 bg-neutral-950 border-2 border-[#d4a853] text-[#d4a853] text-xs font-mono font-bold tracking-[0.15em] hover:bg-[#d4a853] hover:text-neutral-950 transition-all duration-300 rounded shadow-[0_0_15px_rgba(212,168,83,0.15)] focus:outline-none ${
              isStriking ? 'opacity-50 cursor-wait scale-95 border-amber-400 text-amber-400' : 'animate-pulse hover:animate-none'
            }`}
          >
            {isStriking ? '🛠 重排熔铸核心数据...' : '⚔ 敲击铁砧进入系统'}
          </button>
        </div>

      </div>

      <div className="absolute bottom-6 font-mono text-[9px] text-neutral-600 tracking-wider">
        ANVIL_SIGNAL_OK // SECURE SECTOR
      </div>

    </div>
  );
};

// API helper for server-side storage
const API_BASE = '/api/resources';

async function apiGetAll(): Promise<Record<string, any[]>> {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return {};
  }
}

async function apiSaveAll(data: {
  sets: GameSet[];
  items: ItemResource[];
  weapons: GearResource[];
  armors: GearResource[];
  enemies: EnemyResource[];
  events: EventResource[];
}) {
  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error('Failed to save to server:', err);
  }
}

async function apiSaveType(type: string, data: any[]) {
  try {
    await fetch(`${API_BASE}/${type}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error(`Failed to save ${type} to server:`, err);
  }
}

export default function App() {
  // State for resources backed by server API
  const [sets, setSets] = useState<GameSet[]>([]);
  const [items, setItems] = useState<ItemResource[]>([]);
  const [weapons, setWeapons] = useState<GearResource[]>([]);
  const [armors, setArmors] = useState<GearResource[]>([]);
  const [enemies, setEnemies] = useState<EnemyResource[]>([]);
  const [events, setEvents] = useState<EventResource[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<ResourceType>('items');
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStar, setFilterStar] = useState<number>(0);
  const [filterSet, setFilterSet] = useState<string>('all');
  const [filterEnemyCategory, setFilterEnemyCategory] = useState<string>('all');
  const [filterEventState, setFilterEventState] = useState<string>('all');
  const [eventDetailMode, setEventDetailMode] = useState<'simulator' | 'tree'>('simulator');
  
  // Selection / Detail viewer state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<EventOption[]>([]);

  useEffect(() => {
    setSimulationHistory([]);
  }, [selectedItem?.id]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'blood' | 'cyan' } | null>(null);

  // Form states
  // Common states
  const [formName, setFormName] = useState('');
  
  // Items Form
  const [formStarLevel, setFormStarLevel] = useState<number>(3);
  const [formIsActiveItem, setFormIsActiveItem] = useState(false);
  const [formIsPartOfSet, setFormIsPartOfSet] = useState(false);
  const [formSetId, setFormSetId] = useState('');
  const [formItemEffect, setFormItemEffect] = useState('');
  const [formItemRemark, setFormItemRemark] = useState('');
  const [formItemTexture1, setFormItemTexture1] = useState(SVG_ICONS.potion);
  const [formItemIdleAnim, setFormItemIdleAnim] = useState<string[]>([]);
  const [formItemActiveAnim, setFormItemActiveAnim] = useState<string[]>([]);

  // Weapons & Armors Form
  const [formGearPassiveEffect, setFormGearPassiveEffect] = useState('');
  const [formGearHasActiveSkill, setFormGearHasActiveSkill] = useState(false);
  const [formGearActiveSkillName, setFormGearActiveSkillName] = useState('');
  const [formGearRecipeSource, setFormGearRecipeSource] = useState('');
  const [formGearCraftLevel, setFormGearCraftLevel] = useState('');
  const [formGearMaterials, setFormGearMaterials] = useState('');
  const [formGearBlueprintText, setFormGearBlueprintText] = useState(SVG_ICONS.blueprint_gear);
  const [formGearTexture1, setFormGearTexture1] = useState(SVG_ICONS.sword);
  const [formGearInGameTexture, setFormGearInGameTexture] = useState(SVG_ICONS.sword);
  const [formGearVfxAnim, setFormGearVfxAnim] = useState<string[]>([]);

  // Enemies Form
  const [formEnemyCategory, setFormEnemyCategory] = useState<'normal' | 'elite' | 'boss'>('normal');
  const [formEnemyHp, setFormEnemyHp] = useState<number>(500);
  const [formEnemyMaxHp, setFormEnemyMaxHp] = useState<number>(500);
  const [formEnemyInitDefense, setFormEnemyInitDefense] = useState<number>(20);
  const [formEnemyAtk, setFormEnemyAtk] = useState<number>(45);
  const [formEnemyDef, setFormEnemyDef] = useState<number>(15);
  const [formEnemyMp, setFormEnemyMp] = useState<number>(50);
  const [formEnemyTraits, setFormEnemyTraits] = useState('');
  const [formEnemyBehavior, setFormEnemyBehavior] = useState('');
  const [formEnemyDrops, setFormEnemyDrops] = useState('');
  const [formEnemyUnlockBlueprint, setFormEnemyUnlockBlueprint] = useState(false);
  const [formEnemyBlueprintName, setFormEnemyBlueprintName] = useState('');
  const [formEnemyIdleSeq, setFormEnemyIdleSeq] = useState<string[]>([]);
  const [formEnemyHitSeq, setFormEnemyHitSeq] = useState<string[]>([]);
  const [formEnemyActionSeq1, setFormEnemyActionSeq1] = useState<string[]>([]);
  const [formEnemyActionSeq2, setFormEnemyActionSeq2] = useState<string[]>([]);

  // Events Form
  const [formEventState, setFormEventState] = useState<'combat' | 'non-combat'>('non-combat');
  const [formEventDescription, setFormEventDescription] = useState('');
  const [formEventIllustration, setFormEventIllustration] = useState(SVG_ICONS.event);
  const [formEventOptions, setFormEventOptions] = useState<EventOption[]>([
    { id: 'opt_init_1', text: '触摸雕像', result: '获得随机诅咒', probability: 100 }
  ]);

  // Load from server API
  useEffect(() => {
    apiGetAll().then(data => {
      setSets(data.sets || []);
      setItems(data.items || []);
      setWeapons(data.weapons || []);
      setArmors(data.armors || []);
      setEnemies(data.enemies || []);
      setEvents(data.events || []);
      // Check if user has entered before
      const hasData = (data.items?.length || 0) > 0 || (data.weapons?.length || 0) > 0 || (data.enemies?.length || 0) > 0;
      setHasEntered(hasData);
    });
  }, []);

  // Sync to server API on edits
  const saveAllToServer = (
    updatedSets: GameSet[],
    updatedItems: ItemResource[],
    updatedWeapons: GearResource[],
    updatedArmors: GearResource[],
    updatedEnemies: EnemyResource[],
    updatedEvents: EventResource[]
  ) => {
    apiSaveAll({
      sets: updatedSets,
      items: updatedItems,
      weapons: updatedWeapons,
      armors: updatedArmors,
      enemies: updatedEnemies,
      events: updatedEvents
    });
  };

  const showToast = (text: string, type: 'success' | 'blood' | 'cyan' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Preset loading (Auto-fill) helper
  const loadDesignTemplate = (presetIndex: number) => {
    if (activeTab === 'items') {
      const preset = PRESETS.items[presetIndex % PRESETS.items.length];
      setFormName(preset.name);
      setFormStarLevel(preset.starLevel);
      setFormIsActiveItem(preset.isActiveItem);
      setFormIsPartOfSet(preset.isPartOfSet);
      setFormSetId(preset.setId || '');
      setFormItemEffect(preset.effect);
      setFormItemRemark(preset.remark);
      setFormItemTexture1(preset.isActiveItem ? SVG_ICONS.potion_active : SVG_ICONS.potion);
      setFormItemIdleAnim([SVG_ICONS.potion, SVG_ICONS.potion_active]);
      setFormItemActiveAnim([SVG_ICONS.potion_active, SVG_ICONS.potion]);
      showToast(`已成功载入道具模板: 《${preset.name}》`, 'cyan');
    }
    else if (activeTab === 'weapons' || activeTab === 'armors') {
      const presetList = activeTab === 'weapons' ? PRESETS.weapons : PRESETS.armors;
      const preset = presetList[presetIndex % presetList.length];
      setFormName(preset.name);
      setFormGearPassiveEffect(preset.passiveEffect);
      setFormGearHasActiveSkill(preset.hasActiveSkill);
      setFormGearActiveSkillName(preset.activeSkillName || '');
      setFormGearRecipeSource(preset.recipeSource);
      setFormGearCraftLevel(preset.craftLevel);
      setFormGearMaterials(preset.materials);
      setFormGearTexture1(activeTab === 'weapons' ? SVG_ICONS.sword : SVG_ICONS.shield);
      setFormGearInGameTexture(activeTab === 'weapons' ? SVG_ICONS.sword : SVG_ICONS.shield);
      setFormGearBlueprintText(SVG_ICONS.blueprint_gear);
      setFormGearVfxAnim(activeTab === 'weapons' ? [SVG_ICONS.sword, SVG_ICONS.potion_active] : [SVG_ICONS.shield, SVG_ICONS.potion]);
      showToast(`已成功载入装备模板: 《${preset.name}》`, 'cyan');
    }
    else if (activeTab === 'enemies') {
      const preset = PRESETS.enemies[presetIndex % PRESETS.enemies.length];
      setFormName(preset.name);
      setFormEnemyCategory(preset.category);
      setFormEnemyHp(preset.hp);
      setFormEnemyMaxHp(preset.maxHp);
      setFormEnemyInitDefense(preset.initDefense);
      setFormEnemyAtk(preset.atk);
      setFormEnemyDef(preset.def);
      setFormEnemyMp(preset.mp);
      setFormEnemyTraits(preset.traits || '');
      setFormEnemyBehavior(preset.behaviorLogic);
      setFormEnemyDrops(preset.drops);
      setFormEnemyUnlockBlueprint(preset.unlockBlueprint);
      if (preset.unlockBlueprint) {
        setFormEnemyBlueprintName(preset.blueprintName || '');
      }
      setFormEnemyIdleSeq([SVG_ICONS.enemy]);
      showToast(`已成功载入敌人模板: 《${preset.name}》`, 'cyan');
    }
    else if (activeTab === 'events') {
      const preset = PRESETS.events[presetIndex % PRESETS.events.length];
      setFormName(preset.name);
      setFormEventState(preset.state);
      setFormEventDescription(preset.description);
      setFormEventOptions(preset.options);
      setFormEventIllustration(SVG_ICONS.event);
      showToast(`已成功载入事件模板: 《${preset.name}》`, 'cyan');
    }
  };

  // Save changes/Add new items
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      showToast('请输入资源名称', 'blood');
      return;
    }

    if (activeTab === 'items') {
      // Setup Sequential ID
      const nextSeqVal = items.length > 0 ? Math.max(...items.map(i => i.seqId)) + 1 : 1;
      const formattedId = `ITEM_${String(nextSeqVal).padStart(3, '0')}`;

      const newItem: ItemResource = {
        id: formattedId,
        seqId: nextSeqVal,
        name: formName,
        starLevel: formStarLevel,
        isActiveItem: formIsActiveItem,
        isPartOfSet: formIsPartOfSet,
        setId: formIsPartOfSet ? formSetId : undefined,
        effect: formItemEffect || '未输入效果描述',
        remark: formItemRemark,
        texture1: formItemTexture1,
        idleAnimation: formItemIdleAnim.length > 0 ? formItemIdleAnim : undefined,
        activeAnimation: formItemActiveAnim.length > 0 ? formItemActiveAnim : undefined,
        createdAt: Date.now()
      };

      const freshList = [newItem, ...items];
      setItems(freshList);
      saveAllToServer(sets, freshList, weapons, armors, enemies, events);
      showToast(`已成功录入新道具: ${newItem.id} - ${newItem.name}`);
    } 
    else if (activeTab === 'weapons' || activeTab === 'armors') {
      const activeList = activeTab === 'weapons' ? weapons : armors;
      const nextSeqVal = activeList.length > 0 ? Math.max(...activeList.map(g => g.seqId)) + 1 : 1;
      const prefix = activeTab === 'weapons' ? 'WEAPON' : 'ARMOR';
      const formattedId = `${prefix}_${String(nextSeqVal).padStart(3, '0')}`;

      const newGear: GearResource = {
        id: formattedId,
        seqId: nextSeqVal,
        type: activeTab === 'weapons' ? 'weapon' : 'armor',
        name: formName,
        passiveEffect: formGearPassiveEffect || '全图伤害减免 5%',
        hasActiveSkill: formGearHasActiveSkill,
        activeSkillName: formGearHasActiveSkill ? formGearActiveSkillName : undefined,
        recipeSource: formGearRecipeSource || '熔炉废土矿箱或铁匠铺掉落',
        craftLevel: formGearCraftLevel || '熔铸锻造 1级',
        materials: formGearMaterials || '暗铁锭 x2',
        blueprintTexture: formGearBlueprintText,
        texture1: formGearTexture1,
        inGameTexture: formGearInGameTexture,
        vfxAnimation: formGearVfxAnim.length > 0 ? formGearVfxAnim : undefined,
        createdAt: Date.now()
      };

      if (activeTab === 'weapons') {
        const freshList = [newGear, ...weapons];
        setWeapons(freshList);
        saveAllToServer(sets, items, freshList, armors, enemies, events);
      } else {
        const freshList = [newGear, ...armors];
        setArmors(freshList);
        saveAllToServer(sets, items, weapons, freshList, enemies, events);
      }
      showToast(`已成功录入新装备: ${newGear.id} - ${newGear.name}`);
    }
    else if (activeTab === 'enemies') {
      const nextSeqVal = enemies.length > 0 ? Math.max(...enemies.map(e => e.seqId)) + 1 : 1;
      const formattedId = `ENEMY_${String(nextSeqVal).padStart(3, '0')}`;

      const newEnemy: EnemyResource = {
        id: formattedId,
        seqId: nextSeqVal,
        category: formEnemyCategory,
        name: formName,
        hp: formEnemyHp,
        maxHp: formEnemyMaxHp,
        initDefense: formEnemyInitDefense,
        atk: formEnemyAtk,
        def: formEnemyDef,
        mp: formEnemyMp,
        traits: formEnemyTraits || undefined,
        behaviorLogic: formEnemyBehavior || '锁定玩家并普通攻击',
        drops: formEnemyDrops || '碎金属或铁锭 x1',
        unlockBlueprint: formEnemyUnlockBlueprint,
        blueprintName: formEnemyUnlockBlueprint ? formEnemyBlueprintName : undefined,
        idleFrameSeq: formEnemyIdleSeq.length > 0 ? formEnemyIdleSeq : undefined,
        hitFrameSeq: formEnemyHitSeq.length > 0 ? formEnemyHitSeq : undefined,
        actionFrameSeq1: formEnemyActionSeq1.length > 0 ? formEnemyActionSeq1 : undefined,
        actionFrameSeq2: formEnemyActionSeq2.length > 0 ? formEnemyActionSeq2 : undefined,
        createdAt: Date.now()
      };

      const freshList = [newEnemy, ...enemies];
      setEnemies(freshList);
      saveAllToServer(sets, items, weapons, armors, freshList, events);
      showToast(`已成功录入新敌人类: ${newEnemy.id} - ${newEnemy.name}`);
    }
    else if (activeTab === 'events') {
      const nextSeqVal = events.length > 0 ? Math.max(...events.map(e => e.seqId)) + 1 : 1;
      const formattedId = `EVENT_${String(nextSeqVal).padStart(3, '0')}`;

      const newEvent: EventResource = {
        id: formattedId,
        seqId: nextSeqVal,
        state: formEventState,
        name: formName,
        description: formEventDescription || '你在荒室遇到了谜之低语...',
        options: formEventOptions,
        illustration: formEventIllustration,
        createdAt: Date.now()
      };

      const freshList = [newEvent, ...events];
      setEvents(freshList);
      saveAllToServer(sets, items, weapons, armors, enemies, freshList);
      showToast(`已成功录入新事件: ${newEvent.id} - ${newEvent.name}`);
    }

    // Reset Form Fields
    resetFormInputs();
    setShowAddForm(false);
    playSound('success');
  };

  const resetFormInputs = () => {
    setFormName('');
    setFormStarLevel(3);
    setFormIsActiveItem(false);
    setFormIsPartOfSet(false);
    setFormSetId('');
    setFormItemEffect('');
    setFormItemRemark('');
    setFormItemTexture1(SVG_ICONS.potion);
    setFormItemIdleAnim([]);
    setFormItemActiveAnim([]);

    setFormGearPassiveEffect('');
    setFormGearHasActiveSkill(false);
    setFormGearActiveSkillName('');
    setFormGearRecipeSource('');
    setFormGearCraftLevel('');
    setFormGearMaterials('');
    setFormGearTexture1(SVG_ICONS.sword);
    setFormGearInGameTexture(SVG_ICONS.sword);
    setFormGearBlueprintText(SVG_ICONS.blueprint_gear);
    setFormGearVfxAnim([]);

    setFormEnemyCategory('normal');
    setFormEnemyHp(500);
    setFormEnemyMaxHp(500);
    setFormEnemyInitDefense(20);
    setFormEnemyAtk(45);
    setFormEnemyDef(15);
    setFormEnemyMp(50);
    setFormEnemyTraits('');
    setFormEnemyBehavior('');
    setFormEnemyDrops('');
    setFormEnemyUnlockBlueprint(false);
    setFormEnemyBlueprintName('');
    setFormEnemyIdleSeq([]);
    setFormEnemyHitSeq([]);
    setFormEnemyActionSeq1([]);
    setFormEnemyActionSeq2([]);

    setFormEventState('non-combat');
    setFormEventDescription('');
    setFormEventIllustration(SVG_ICONS.event);
    setFormEventOptions([
      { id: 'opt_init_1', text: '触摸雕像', result: '获得随机诅咒', probability: 100 }
    ]);
  };

  // Deletion logic
  const handleDeleteResource = (type: ResourceType, id: string, name: string) => {
    if (!window.confirm(`确认要删除该项数据 [${id} - ${name}] 吗？`)) return;

    let updatedItems = [...items];
    let updatedWeapons = [...weapons];
    let updatedArmors = [...armors];
    let updatedEnemies = [...enemies];
    let updatedEvents = [...events];

    switch (type) {
      case 'items':
        updatedItems = items.filter(r => r.id !== id);
        setItems(updatedItems);
        break;
      case 'weapons':
        updatedWeapons = weapons.filter(r => r.id !== id);
        setWeapons(updatedWeapons);
        break;
      case 'armors':
        updatedArmors = armors.filter(r => r.id !== id);
        setArmors(updatedArmors);
        break;
      case 'enemies':
        updatedEnemies = enemies.filter(r => r.id !== id);
        setEnemies(updatedEnemies);
        break;
      case 'events':
        updatedEvents = events.filter(r => r.id !== id);
        setEvents(updatedEvents);
        break;
    }

    saveAllToServer(sets, updatedItems, updatedWeapons, updatedArmors, updatedEnemies, updatedEvents);
    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(null);
    }
    showToast(`已删除数据 [${id}]`, 'blood');
    playSound('delete');
  };

  // Image Upload base64 utility
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (res: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
      showToast('主贴图上传成功', 'cyan');
    };
    reader.readAsDataURL(file);
  };

  // Multiple frames loader helper
  const handleMultipleFramesUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const loadedUrls: string[] = [];
    const fileArray = Array.from(files) as File[];
    
    // Sort files alphabetically to ensure frame sequence counts
    fileArray.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    let loadedCount = 0;
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        loadedUrls.push(reader.result as string);
        loadedCount++;
        if (loadedCount === fileArray.length) {
          setter(loadedUrls);
          showToast(`成功解析 ${fileArray.length} 张单帧图像`, 'cyan');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ZIP sequential frame file extractor
  const handleZipUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('开始解析帧序列ZIP文件...', 'cyan');
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const frameEntries: { name: string; file: any }[] = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && /\.(png|jpe?g|gif|svg)$/i.test(zipEntry.name)) {
          frameEntries.push({ name: zipEntry.name, file: zipEntry });
        }
      });

      if (frameEntries.length === 0) {
        showToast('ZIP中没有找到有效的图片帧文件', 'blood');
        return;
      }

      // Sort alphabetically logic for naming consistency
      frameEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

      const base64Frames: string[] = [];
      for (const entry of frameEntries) {
        const fileBlob = await entry.file.async('blob');
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(fileBlob);
        });
        base64Frames.push(dataUrl);
      }

      setter(base64Frames);
      showToast(`✓ ZIP解析完成！共加载了 ${base64Frames.length} 帧流畅动画`, 'success');
    } catch (err) {
      console.error(err);
      showToast('ZIP文件损坏或在此解析失败', 'blood');
    }
  };

  // Individual Asset Export (ZIP format)
  const handleExportIndividual = async (resource: any, type: string) => {
    try {
      showToast('正在为您打包下载此项资产...', 'cyan');
      const zip = new JSZip();
      
      const meta = { ...resource };
      
      // Helper to convert base64 image and inject into ZIP binary folder
      const putBase64InZip = (filename: string, base64Str: string | undefined): string | null => {
        if (!base64Str) return null;
        
        // Handle SVG Data URLs
        if (base64Str.startsWith('data:image/svg+xml')) {
          const content = decodeURIComponent(base64Str.replace(/^data:image\/svg\+xml;utf8,/, ''));
          zip.file(`${filename}.svg`, content);
          return `./${filename}.svg`;
        }
        
        // Handle standard base64 PNG/JPG
        const match = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
        if (match) {
          const ext = match[1];
          const data = match[2];
          zip.file(`${filename}.${ext}`, data, { base64: true });
          return `./${filename}.${ext}`;
        }
        return null;
      };

      const putBase64ArrayInZip = (folderName: string, base64Arr: string[] | undefined): string[] => {
        if (!base64Arr || base64Arr.length === 0) return [];
        const folder = zip.folder(folderName);
        if (!folder) return [];
        
        const pathList: string[] = [];
        base64Arr.forEach((base64Str, idx) => {
          if (base64Str.startsWith('data:image/svg+xml')) {
            const content = decodeURIComponent(base64Str.replace(/^data:image\/svg\+xml;utf8,/, ''));
            folder.file(`frame_${idx}.svg`, content);
            pathList.push(`./${folderName}/frame_${idx}.svg`);
          } else {
            const match = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
            if (match) {
              const ext = match[1];
              const data = match[2];
              folder.file(`frame_${idx}.${ext}`, data, { base64: true });
              pathList.push(`./${folderName}/frame_${idx}.${ext}`);
            }
          }
        });
        return pathList;
      };

      // Transform properties
      if (type === 'items') {
        const item = resource as ItemResource;
        const mainPath = putBase64InZip('item_primary_texture', item.texture1);
        if (mainPath) meta.texture1 = mainPath;
        
        if (item.idleAnimation) {
          meta.idleAnimation = putBase64ArrayInZip('anim_idle_sequence', item.idleAnimation);
        }
        if (item.activeAnimation) {
          meta.activeAnimation = putBase64ArrayInZip('anim_active_sequence', item.activeAnimation);
        }
      } 
      else if (type === 'weapons' || type === 'armors') {
        const gear = resource as GearResource;
        const mainPath = putBase64InZip('gear_primary_texture', gear.texture1);
        const blueprintPath = putBase64InZip('gear_blueprint_schematic', gear.blueprintTexture);
        const ingamePath = putBase64InZip('gear_ingame_sprite', gear.inGameTexture);
        
        if (mainPath) meta.texture1 = mainPath;
        if (blueprintPath) meta.blueprintTexture = blueprintPath;
        if (ingamePath) meta.inGameTexture = ingamePath;
        
        if (gear.vfxAnimation) {
          meta.vfxAnimation = putBase64ArrayInZip('vfx_spark_sequence', gear.vfxAnimation);
        }
      }
      else if (type === 'enemies') {
        const enemy = resource as EnemyResource;
        if (enemy.idleFrameSeq) {
          meta.idleFrameSeq = putBase64ArrayInZip('anim_idle', enemy.idleFrameSeq);
        }
        if (enemy.hitFrameSeq) {
          meta.hitFrameSeq = putBase64ArrayInZip('anim_hurt', enemy.hitFrameSeq);
        }
        if (enemy.actionFrameSeq1) {
          meta.actionFrameSeq1 = putBase64ArrayInZip('anim_attack_1', enemy.actionFrameSeq1);
        }
        if (enemy.actionFrameSeq2) {
          meta.actionFrameSeq2 = putBase64ArrayInZip('anim_attack_2', enemy.actionFrameSeq2);
        }
      }
      else if (type === 'events') {
        const evt = resource as EventResource;
        const illPath = putBase64InZip('illustration_full', evt.illustration);
        if (illPath) meta.illustration = illPath;
      }

      // Add schema documentation
      zip.file(`resource_manifest.json`, JSON.stringify(meta, null, 2));
      
      const readme = `ForgeCraft (FORGE CRAFT) - 材料与装备资源导出说明

本资产包对应游戏内部资源记录:
------------------------------------------
类型: ${type.toUpperCase()}
标志ID: ${resource.id}
名称: ${resource.name}
时间戳: ${new Date(resource.createdAt).toLocaleString()}
------------------------------------------
本ZIP包内置了该资源对应的设计规约JSON文件 (${resource.id}_manifest.json) 以及解析提取出的独立图片纹理在各序列子目录中。
格式适用于各类游戏引擎（如Unity, Godot, RPGMaker, Unreal）进行资源映射或程序化自增组装。`;
      zip.file("README_ARCHIVE.txt", readme);

      // Generate blob
      const blob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = `${resource.id}_${resource.name}.zip`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);
      showToast('✓ 资产包打包完毕并开始分发下载！', 'success');
    } catch (e) {
      console.error(e);
      showToast('打包ZIP资产包失败', 'blood');
    }
  };

  // Backup state export (Entire database as a JSON dump)
  const handleBackupExport = () => {
    try {
      const backupData = {
        sets,
        items,
        weapons,
        armors,
        enemies,
        events,
        exportVersion: '1.2.0',
        exportedAt: Date.now()
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);
      
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = `ForgeCraft_全量数据备份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(downloadUrl);
      showToast('✓ 数据备份已导出 (JSON)', 'success');
    } catch (e) {
      showToast('导出备份失败', 'blood');
    }
  };

  // Restore/Import database dump
  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawText = event.target?.result as string;
        const backup = JSON.parse(rawText);

        if (backup.items || backup.weapons || backup.armors || backup.enemies || backup.events) {
          // Confirm overwrite mode
          const proceed = window.confirm('检测到有效的备份数据！是否覆盖当前所有内容并加载？');
          if (!proceed) return;

          const restoredSets = backup.sets || [];
          const restoredItems = backup.items || [];
          const restoredWeapons = backup.weapons || [];
          const restoredArmors = backup.armors || [];
          const restoredEnemies = backup.enemies || [];
          const restoredEvents = backup.events || [];

          setSets(restoredSets);
          setItems(restoredItems);
          setWeapons(restoredWeapons);
          setArmors(restoredArmors);
          setEnemies(restoredEnemies);
          setEvents(restoredEvents);

          saveAllToServer(
            restoredSets,
            restoredItems,
            restoredWeapons,
            restoredArmors,
            restoredEnemies,
            restoredEvents
          );
          showToast('✓ 数据导入成功！', 'success');
        } else {
          showToast('备份文件格式不正确，缺少必要字段', 'blood');
        }
      } catch (err) {
        showToast('备份文件解析失败，请检查文件是否损坏', 'blood');
      }
    };
    reader.readAsText(file);
  };

  // Reset to default presets
  const handleResetToPresets = () => {
    if (!window.confirm('确定要清空所有数据吗？此操作不可恢复。')) return;

    setSets(INITIAL_SETS);
    setItems(INITIAL_ITEMS);
    setWeapons(INITIAL_GEARS.filter(g => g.type === 'weapon'));
    setArmors(INITIAL_GEARS.filter(g => g.type === 'armor'));
    setEnemies(INITIAL_ENEMIES);
    setEvents(INITIAL_EVENTS);

    saveAllToServer(
      INITIAL_SETS,
      INITIAL_ITEMS,
      INITIAL_GEARS.filter(g => g.type === 'weapon'),
      INITIAL_GEARS.filter(g => g.type === 'armor'),
      INITIAL_ENEMIES,
      INITIAL_EVENTS
    );

    setSelectedItem(null);
    showToast('全部数据已清空，系统重置为初始空白状态', 'blood');
  };

  // Custom addition of set
  const handleAddSet = (newSet: Omit<GameSet, 'id'>) => {
    const nextSeq = sets.length > 0 ? Math.max(...sets.map(s => parseInt(s.id.split('_')[1] || '0'))) + 1 : 1;
    const formattedId = `SET_${String(nextSeq).padStart(3, '0')}`;
    const added = { id: formattedId, ...newSet };
    const fresh = [...sets, added];
    setSets(fresh);
    saveAllToServer(fresh, items, weapons, armors, enemies, events);
    playSound('socket');
  };

  const handleDeleteSet = (id: string) => {
    const associatedItemsCount = items.filter(i => i.isPartOfSet && i.setId === id).length;
    if (associatedItemsCount > 0) {
      showToast(`拒绝操作：当前有 ${associatedItemsCount} 枚道具正隶属此套装！请先将这批道具移出套装方能销毁其封号。`, 'blood');
      playSound('click');
      return;
    }
    const fresh = sets.filter(s => s.id !== id);
    setSets(fresh);
    apiSaveType('sets', fresh);
    showToast(`套装 [${id}] 已解散并从规则中除名`, 'blood');
    playSound('delete');
  };

  // Recursive options builder functions for events
  // Add direct branch
  const handleAddEventOption = () => {
    const newId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newOpt: EventOption = {
      id: newId,
      text: '新决策选项',
      result: '触发后果细节',
      probability: 100
    };
    setFormEventOptions([...formEventOptions, newOpt]);
    playSound('socket');
  };

  // Add highly interactive sub-options nesting
  const handleAddNestedOption = (optionPath: string[]) => {
    const deepCloneOptions = (opts: EventOption[], indices: string[]): EventOption[] => {
      return opts.map(opt => {
        if (opt.id === indices[0]) {
          if (indices.length === 1) {
            const nested = opt.nestedOptions || [];
            return {
              ...opt,
              nestedOptions: [
                ...nested,
                {
                  id: `opt_nest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  text: '衍生决策选项',
                  result: '深层反噬或馈赠后果',
                  probability: 50
                }
              ]
            };
          } else {
            return {
              ...opt,
              nestedOptions: deepCloneOptions(opt.nestedOptions || [], indices.slice(1))
            };
          }
        }
        return opt;
      });
    };
    setFormEventOptions(deepCloneOptions(formEventOptions, optionPath));
    showToast('衍生嵌套分支已筑造', 'cyan');
    playSound('socket');
  };

  const handleUpdateOptionField = (optionPath: string[], field: 'text' | 'result' | 'probability', value: any) => {
    const updateInPath = (opts: EventOption[], indices: string[]): EventOption[] => {
      return opts.map(opt => {
        if (opt.id === indices[0]) {
          if (indices.length === 1) {
            return { ...opt, [field]: value };
          } else {
            return {
              ...opt,
              nestedOptions: updateInPath(opt.nestedOptions || [], indices.slice(1))
            };
          }
        }
        return opt;
      });
    };
    setFormEventOptions(updateInPath(formEventOptions, optionPath));
  };

  const handleRemoveOptionNode = (optionPath: string[]) => {
    const removeInPath = (opts: EventOption[], indices: string[]): EventOption[] => {
      if (indices.length === 1) {
        return opts.filter(opt => opt.id !== indices[0]);
      }
      return opts.map(opt => {
        if (opt.id === indices[0]) {
          return {
            ...opt,
            nestedOptions: removeInPath(opt.nestedOptions || [], indices.slice(1))
          };
        }
        return opt;
      });
    };
    setFormEventOptions(removeInPath(formEventOptions, optionPath));
    showToast('分支节点拔除完毕', 'blood');
    playSound('delete');
  };

  // Search & Filters computation
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'items':
        return items.filter(item => {
          const matchedSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                item.effect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                item.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchedStar = filterStar === 0 || item.starLevel === filterStar;
          const matchedSet = filterSet === 'all' || (item.isPartOfSet && item.setId === filterSet);
          return matchedSearch && matchedStar && matchedSet;
        });

      case 'weapons':
        return weapons.filter(w => {
          const matchedSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                w.passiveEffect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                w.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchedSearch;
        });

      case 'armors':
        return armors.filter(a => {
          const matchedSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                a.passiveEffect.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                a.id.toLowerCase().includes(searchQuery.toLowerCase());
          return matchedSearch;
        });

      case 'enemies':
        return enemies.filter(e => {
          const matchedSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                e.behaviorLogic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                e.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchedCat = filterEnemyCategory === 'all' || e.category === filterEnemyCategory;
          return matchedSearch && matchedCat;
        });

      case 'events':
        return events.filter(ev => {
          const matchedSearch = ev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ev.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchedState = filterEventState === 'all' || ev.state === filterEventState;
          return matchedSearch && matchedState;
        });
      default:
        return [];
    }
  };

  const filteredList = getFilteredItems();

  // Selected details item resolver
  const getActiveItemDetails = () => {
    if (!selectedItem) return null;
    return selectedItem;
  };

  const currentDetails = getActiveItemDetails();

  if (!hasEntered) {
    return (
      <LandingIntro 
        onEnter={() => {
          setHasEntered(true);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen text-[#e6d8b5] p-3 md:p-6 pb-20 selection:bg-[#d4a853] selection:text-neutral-900">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-lg border flex items-center gap-2.5 shadow-2xl backdrop-blur-md animate-bounce
          ${notification.type === 'success' ? 'bg-neutral-950/90 border-[#d4a853] text-[#d4a853]' : ''}
          ${notification.type === 'blood' ? 'bg-[#241111]/90 border-[#a13d3d] text-[#ff6b6b]' : ''}
          ${notification.type === 'cyan' ? 'bg-neutral-950/90 border-[#00ffd5]/60 text-[#00ffd5]' : ''}
        `}>
          <div className={`w-2 h-2 rounded-full animate-ping 
            ${notification.type === 'success' ? 'bg-[#d4a853]' : ''}
            ${notification.type === 'blood' ? 'bg-[#a13d3d]' : ''}
            ${notification.type === 'cyan' ? 'bg-[#00ffd5]' : ''}
          `} />
          <span className="text-xs font-mono font-medium">{notification.text}</span>
        </div>
      )}

      {/* Header Panel */}
      <header className="max-w-7xl mx-auto mb-6 relative border-b border-[#b89b5c] pb-5 pt-4 bg-black/40 px-6 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left py-1">
            <div className="flex items-center justify-center md:justify-start gap-3">
              {/* Shrunk logo with interactive recap of intro animation */}
              <div 
                onClick={() => {
                  setHasEntered(false);
                }}
                className="w-5 h-5 border border-[#d4a853]/40 flex items-center justify-center rotate-45 bg-black shrink-0 hover:border-[#d4a853] hover:shadow-[0_0_8px_rgba(212,168,83,0.35)] transition-all cursor-pointer"
                title="重温铁砧序幕动画"
              >
                <span className="-rotate-45 font-bold font-gothic text-[8px] text-[#d4a853] tracking-normal">FC</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-gothic tracking-widest text-[#d4a853] glow-text-amber">
                  ForgeCraft ⁃ 游戏内锻造资源管理系统
                </h1>
                <p className="text-[11px] text-[#b89b5c] tracking-widest font-mono">
                  ForgeCraft 内部配方、防具武器与物料协同系统
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick backup actions */}
            <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-[#b89b5c]/30 rounded-md p-1">
              <label 
                className="cursor-pointer hover:bg-neutral-800 text-neutral-300 hover:text-[#d4a853] text-[10px] uppercase font-mono px-2 py-1.5 rounded transition-all flex items-center gap-1"
                title="导入JSON格式备份文件"
              >
                <Upload className="w-3.5 h-3.5 text-[#00ffd5]" />
                <span>导入备份</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleBackupImport}
                />
              </label>

              <button
                type="button"
                onClick={handleBackupExport}
                className="hover:bg-neutral-800 text-neutral-300 hover:text-[#d4a853] text-[10px] uppercase font-mono px-2 py-1.5 rounded transition-all flex items-center gap-1"
                title="导出JSON格式备份文件"
              >
                <Download className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>导出全量</span>
              </button>

              <button
                type="button"
                onClick={handleResetToPresets}
                className="hover:bg-[#a13d3d]/15 text-neutral-400 hover:text-[#ff6b6b] text-[10px] uppercase font-mono px-2 py-1.5 rounded transition-all flex items-center gap-1"
                title="彻底清空当前所有数据"
              >
                <RefreshCw className="w-3 h-3 text-[#a13d3d]" />
                <span>清空数据</span>
              </button>
            </div>
          </div>
        </div>

        {/* Warning Badge of missing variables: handled safely according to sandbox */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-[#b89b5c]/80 bg-[#b89b5c]/5 border border-[#b89b5c]/20 px-3 py-1.5 rounded-md font-mono">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>团队协约状态：在线（本地缓存一致可信）。单项资产以 ZIP 打包导出，直接交付开发主引擎进行集成。</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* Tab Selection Row & Filter Tools */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch">
          
          {/* Six Resource Pools Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-black/40 p-1.5 rounded-lg border border-[#b89b5c]/30">
            {[
              { id: 'items', label: '材料库', icon: <Zap className="w-4 h-4" /> },
              { id: 'weapons', label: '武器库', icon: <Sword className="w-4 h-4" /> },
              { id: 'armors', label: '防具库', icon: <Shield className="w-4 h-4" /> },
              { id: 'enemies', label: '怪物/守卫库', icon: <Skull className="w-4 h-4" /> },
              { id: 'events', label: '事件库', icon: <MapPin className="w-4 h-4" /> },
              { id: 'sets', label: '自定义套装', icon: <Award className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as ResourceType);
                  setSelectedItem(null);
                  setShowAddForm(false);
                  playSound('click');
                }}
                className={`
                  cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-semibold tracking-wide transition-all z-10 border-b-2
                  ${activeTab === tab.id 
                    ? 'border-[#d4a853] text-[#d4a853] bg-[#d4a853]/10 font-gothic shadow-[0_4px_12px_rgba(212,168,83,0.06)]' 
                    : 'border-transparent text-[#999] hover:text-[#d4a853]'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Real-time filtering panel depending on activeTab */}
          {activeTab !== 'sets' ? (
            <div className="flex flex-wrap items-center gap-3 bg-black/40 border border-[#b89b5c]/30 p-2 rounded-lg">
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-[#b89b5c]/75" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="键入检索词: 名称、描述或ID..."
                  className="bg-black/80 border border-[#b89b5c]/40 rounded px-8 pr-3 py-1.5 text-xs w-48 focus:outline-none focus:border-[#d4a853] text-[#e6d8b5] placeholder-[#b89b5c]/50"
                />
              </div>

              {/* Star Filters for Items */}
              {activeTab === 'items' && (
                <select
                  value={filterStar}
                  onChange={(e) => setFilterStar(Number(e.target.value))}
                  className="bg-black border border-[#b89b5c]/40 rounded text-xs px-2.5 py-1.5 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853]"
                >
                  <option value={0} className="bg-black">全部材料星级</option>
                  <option value={1} className="bg-black">★ 1星 基础材料</option>
                  <option value={2} className="bg-black">★★ 2星 普通材料</option>
                  <option value={3} className="bg-black">★★★ 3星 优秀材料</option>
                  <option value={4} className="bg-black">★★★★ 4星 精良材料</option>
                </select>
              )}

              {/* Set Association for Items */}
              {activeTab === 'items' && (
                <select
                  value={filterSet}
                  onChange={(e) => setFilterSet(e.target.value)}
                  className="bg-black border border-[#b89b5c]/40 rounded text-xs px-2.5 py-1.5 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] max-w-[160px]"
                >
                  <option value="all" className="bg-black">全套装关联</option>
                  <option value="none" className="bg-black">无套装散件</option>
                  {sets.map(s => (
                    <option key={s.id} value={s.id} className="bg-black">{s.name}</option>
                  ))}
                </select>
              )}

              {/* Category selection for Enemies */}
              {activeTab === 'enemies' && (
                <select
                  value={filterEnemyCategory}
                  onChange={(e) => setFilterEnemyCategory(e.target.value)}
                  className="bg-black border border-[#b89b5c]/40 rounded text-xs px-2.5 py-1.5 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853]"
                >
                  <option value="all" className="bg-black">全部角色分类</option>
                  <option value="normal" className="bg-black">普通怪物</option>
                  <option value="elite" className="bg-black">精英怪物</option>
                  <option value="boss" className="bg-black">首领/Boss</option>
                </select>
              )}

              {/* States selection for Events */}
              {activeTab === 'events' && (
                <select
                  value={filterEventState}
                  onChange={(e) => setFilterEventState(e.target.value)}
                  className="bg-black border border-[#b89b5c]/40 rounded text-xs px-2.5 py-1.5 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853]"
                >
                  <option value="all" className="bg-black">全部事件类型</option>
                  <option value="combat" className="bg-black">战斗事件</option>
                  <option value="non-combat" className="bg-black">非战斗事件</option>
                </select>
              )}

              {/* Create Button */}
              <button
                type="button"
                onClick={() => {
                  resetFormInputs();
                  setShowAddForm(!showAddForm);
                }}
                className="cursor-pointer bg-[#d4a853] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(212,168,83,0.25)]"
              >
                <Plus className="w-4 h-4 stroke-2" />
                <span>{showAddForm ? '收起表单' : '录入新数据'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs bg-black/40 border border-[#b89b5c]/30 px-4 py-2.5 rounded-lg text-neutral-400">
              <Award className="w-4 h-4 text-[#d4a853]" />
              <span>当前区域为套装库：创建与管理的自定义套装可在录入武器、防具或材料数据时进行匹配。</span>
            </div>
          )}

        </div>

        {/* Layout Column Splitting: Left grid lists/forms | Right detailed card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 50, rotateY: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, rotateY: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            style={{ perspective: 1000, transformStyle: "preserve-3d" }}
          >
            {activeTab === 'sets' ? (
              <div className="animate-fade">
                <SetManager 
                  sets={sets}
                  onAddSet={handleAddSet}
                  onDeleteSet={handleDeleteSet}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel (column scale: 7) - Switch between form editor and card lists */}
          <div className="lg:col-span-7 space-y-4">
            
            {showAddForm ? (
              /* Inline Submission and Schema checking template form */
              <div className="bg-black/95 border border-[#d4a853] rounded-lg p-5 space-y-4 relative shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-[#d4a853] text-black text-[9px] font-bold font-mono px-2 py-0.5 rounded tracking-wider flex items-center gap-1 uppercase shadow-[0_0_8px_rgba(212,168,83,0.3)]">
                  <Settings className="w-3 h-3 anim-spin" />
                  <span>数据录入表单 (DATA ENTRY)</span>
                </div>



                {/* Form header */}
                <div className="border-b border-neutral-800 pb-2">
                  <h3 className="text-sm font-semibold text-[#e6d8b5]">
                    新增数据排号： {activeTab === 'items' ? 'ITEM_' : activeTab === 'weapons' ? 'WEAPON_' : activeTab === 'armors' ? 'ARMOR_' : activeTab === 'enemies' ? 'ENEMY_' : 'EVENT_'}
                    {String(
                      activeTab === 'items' ? items.length + 1 :
                      activeTab === 'weapons' ? weapons.length + 1 :
                      activeTab === 'armors' ? armors.length + 1 :
                      activeTab === 'enemies' ? enemies.length + 1 :
                      events.length + 1
                    ).padStart(3, '0')}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    请如实填空下方必要设计参数，系统后台将进行字段清洗与规范化校验。
                  </p>
                </div>

                <form onSubmit={handleAddNewItem} className="space-y-4">
                  
                  {/* Name field (All categories) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs text-neutral-400 mb-1 font-medium">资源名称 <span className="text-[#a13d3d]">*</span></label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="请输入游戏内显示的名称"
                        className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                      />
                    </div>

                    {/* Star selection for Items */}
                    {activeTab === 'items' && (
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">材料品阶 (星级) <span className="text-[#a13d3d]">*</span></label>
                        <select
                          value={formStarLevel}
                          onChange={(e) => setFormStarLevel(Number(e.target.value))}
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                        >
                          <option value={1}>★ 1星 基础</option>
                          <option value={2}>★★ 2星 普通</option>
                          <option value={3}>★★★ 3星 优秀</option>
                          <option value={4}>★★★★ 4星 精良</option>
                        </select>
                      </div>
                    )}

                    {/* Class categories choosing for enemies */}
                    {activeTab === 'enemies' && (
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">角色分类 <span className="text-[#a13d3d]">*</span></label>
                        <select
                          value={formEnemyCategory}
                          onChange={(e) => setFormEnemyCategory(e.target.value as any)}
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                        >
                          <option value="normal">普通怪物 (Normal)</option>
                          <option value="elite">精英怪物 (Elite)</option>
                          <option value="boss">首领/Boss (Boss)</option>
                        </select>
                      </div>
                    )}

                    {/* Combat types selection for events */}
                    {activeTab === 'events' && (
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">触发状态条件 <span className="text-[#a13d3d]">*</span></label>
                        <select
                          value={formEventState}
                          onChange={(e) => setFormEventState(e.target.value as any)}
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                        >
                          <option value="non-combat">工坊平静铸造 (非战斗状态事件)</option>
                          <option value="combat">金属过载暴烈 (战斗状态事件)</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* ITEM SPECIAL FIELDS */}
                  {activeTab === 'items' && (
                    <div className="space-y-4">
                      
                      {/* Checkboxes: Active/Set */}
                      <div className="flex flex-wrap items-center gap-6 bg-neutral-900/60 p-3 rounded border border-neutral-800">
                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsActiveItem}
                            onChange={(e) => setFormIsActiveItem(e.target.checked)}
                            className="rounded border-[#b89b5c]/50 bg-neutral-950 text-[#d4a853] focus:ring-0 focus:ring-offset-0 w-4 h-4"
                          />
                          <span>是否为主动装备/激活技能道具 (需玩家释放键位)</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formIsPartOfSet}
                            onChange={(e) => setFormIsPartOfSet(e.target.checked)}
                            className="rounded border-[#b89b5c]/50 bg-neutral-950 text-[#d4a853] focus:ring-0 focus:ring-offset-0 w-4 h-4"
                          />
                          <span>属于既有套装系列</span>
                        </label>
                      </div>

                      {/* Association dropdown */}
                      {formIsPartOfSet && (
                        <div className="bg-[#1c1a16] p-3 rounded border border-[#b89b5c]/30">
                          <label className="block text-xs text-[#d4a853] mb-1.5 font-medium">关联现行神龙套装 <span className="text-[#a13d3d]">*</span></label>
                          <select
                            value={formSetId}
                            onChange={(e) => setFormSetId(e.target.value)}
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/45 rounded px-2.5 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                          >
                            <option value="">-- 请选择关联哪一套装效果 --</option>
                            {sets.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-neutral-400 mt-1">
                            没有满意的套装？您可以首先在页面顶部的 <strong>申请创建新套装</strong> 模块发布之后再分配。
                          </p>
                        </div>
                      )}

                      {/* Effect and Remarks */}
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">道具效果描述 <span className="text-[#a13d3d]">*</span></label>
                        <textarea
                          value={formItemEffect}
                          onChange={(e) => setFormItemEffect(e.target.value)}
                          rows={3}
                          placeholder="请输入道具效果及数值属性描述"
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853] resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">设计备注/艺术杂谈 (非硬性)</label>
                        <input
                          type="text"
                          value={formItemRemark}
                          onChange={(e) => setFormItemRemark(e.target.value)}
                          placeholder="请输入设计备注或背景说明"
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                        />
                      </div>

                      {/* IMAGE UPLOADS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-800 pt-3">
                        <div className="space-y-1">
                          <label className="block text-xs text-[#d4a853] font-medium">主展示贴图 (必上传) <span className="text-[#a13d3d]">*</span></label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleMediaUpload(e, setFormItemTexture1)}
                              className="text-xs text-neutral-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:bg-neutral-800 file:text-neutral-300 hover:file:bg-neutral-700 cursor-pointer"
                            />
                            <img src={formItemTexture1} alt="preview" className="w-10 h-10 object-contain bg-neutral-900 border border-neutral-700" referrerPolicy="no-referrer" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-neutral-400">局内平静待机帧序列 (ZIP/多图)</label>
                          <div className="space-y-1">
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormItemIdleAnim)}
                              className="block text-[10px] text-neutral-500 file:py-1 file:px-2 file:bg-neutral-850 file:text-neutral-300"
                              title="单包ZIP解析"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleMultipleFramesUpload(e, setFormItemIdleAnim)}
                              className="block text-[10px] text-neutral-500 file:py-1 file:px-2 file:bg-neutral-850 file:text-neutral-300"
                              title="多图多帧序列"
                            />
                            {formItemIdleAnim.length > 0 && (
                              <span className="text-[10px] text-emerald-500 font-mono">已就绪 {formItemIdleAnim.length} 帧</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-neutral-400">局内激活特效帧序列 (ZIP/多图)</label>
                          <div className="space-y-1">
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormItemActiveAnim)}
                              className="block text-[10px] text-neutral-500 file:py-1 file:px-2 file:bg-neutral-850 file:text-neutral-300"
                            />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleMultipleFramesUpload(e, setFormItemActiveAnim)}
                              className="block text-[10px] text-neutral-500 file:py-1 file:px-2 file:bg-neutral-850 file:text-neutral-300"
                            />
                            {formItemActiveAnim.length > 0 && (
                              <span className="text-[10px] text-emerald-500 font-mono">已就绪 {formItemActiveAnim.length} 帧</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* WEAPONS & EQUIPMENT SPECIAL FIELDS */}
                  {(activeTab === 'weapons' || activeTab === 'armors') && (
                    <div className="space-y-4">
                      
                      {/* Passive effect */}
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">装备/武器 被动效果描述 <span className="text-[#a13d3d]">*</span></label>
                        <textarea
                          value={formGearPassiveEffect}
                          onChange={(e) => setFormGearPassiveEffect(e.target.value)}
                          rows={2}
                          placeholder="请输入被动的效果加成与效果描述"
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853] resize-none"
                        />
                      </div>

                      {/* Active Skill Checkbox & Input */}
                      <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800 space-y-2">
                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formGearHasActiveSkill}
                            onChange={(e) => setFormGearHasActiveSkill(e.target.checked)}
                            className="rounded border-[#b89b5c]/50 bg-neutral-950 text-[#d4a853] focus:ring-0 focus:ring-offset-0 w-4 h-4"
                          />
                          <span>是否拥有专属局端触发性主动大招技能 (勾选填写)</span>
                        </label>

                        {formGearHasActiveSkill && (
                          <div className="pt-1.5 border-t border-neutral-800/60 animate-fade">
                            <label className="block text-xs text-[#d4a853] mb-1 font-medium">主动大招技能效果细则 <span className="text-[#a13d3d]">*</span></label>
                            <input
                              type="text"
                              value={formGearActiveSkillName}
                              onChange={(e) => setFormGearActiveSkillName(e.target.value)}
                              placeholder="大招名称与对应的主动释放后的细节效果描述"
                              className="w-full text-xs bg-neutral-950 border border-[#b89b5c]/40 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Crafting Requirements */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1 font-medium">图纸掉落与获取来源 (必填) <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="text"
                            value={formGearRecipeSource}
                            onChange={(e) => setFormGearRecipeSource(e.target.value)}
                            placeholder="请输入图纸获取途径或掉落场景/敌人"
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1 font-medium">熔铸工艺等级要求 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="text"
                            value={formGearCraftLevel}
                            onChange={(e) => setFormGearCraftLevel(e.target.value)}
                            placeholder="请输入工艺或级别相关的限定条件要求"
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-neutral-400 mb-1 font-medium">制造消耗资源与材料 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="text"
                            value={formGearMaterials}
                            onChange={(e) => setFormGearMaterials(e.target.value)}
                            placeholder="请输入所需的配方材料清单和数量"
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                          />
                        </div>
                      </div>

                      {/* GEAR TEXTURE SPECIFICS */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border-t border-neutral-800 pt-3 text-[11px]">
                        
                        <div className="space-y-1">
                          <label className="block text-neutral-400">图纸样式贴图 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(e, setFormGearBlueprintText)}
                            className="w-full"
                          />
                          <img src={formGearBlueprintText} className="w-8 h-8 object-contain bg-neutral-900 border border-neutral-700" referrerPolicy="no-referrer" />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-neutral-400">主体贴图 (必上传) <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(e, setFormGearTexture1)}
                            className="w-full"
                          />
                          <img src={formGearTexture1} className="w-8 h-8 object-contain bg-neutral-900 border border-neutral-700" referrerPolicy="no-referrer" />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-neutral-400">局内随行展示贴图 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(e, setFormGearInGameTexture)}
                            className="w-full"
                          />
                          <img src={formGearInGameTexture} className="w-8 h-8 object-contain bg-neutral-900 border border-neutral-700" referrerPolicy="no-referrer" />
                        </div>

                        <div className="space-y-1 col-span-1">
                          <label className="block text-neutral-400">武器特效帧 (ZIP)</label>
                          <input
                            type="file"
                            accept=".zip"
                            onChange={(e) => handleZipUpload(e, setFormGearVfxAnim)}
                            className="w-full text-[9px]"
                          />
                          {formGearVfxAnim.length > 0 && <span className="text-[#00ffd5]">{formGearVfxAnim.length} 帧动画</span>}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ENEMIES SPECIAL FIELDS */}
                  {activeTab === 'enemies' && (
                    <div className="space-y-4">
                      
                      {/* STATS BENTO ROW (血量、防御、魔力等) */}
                      <p className="text-xs text-[#d4a853] font-medium border-b border-neutral-900 pb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>敌人基础数值战斗参数 (必填)</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-neutral-400 mb-0.5">生命上限 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="number"
                            value={formEnemyHp}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setFormEnemyHp(val);
                              setFormEnemyMaxHp(val);
                            }}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-0.5">初始硬护甲 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="number"
                            value={formEnemyInitDefense}
                            onChange={(e) => setFormEnemyInitDefense(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-0.5">初始攻击力 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="number"
                            value={formEnemyAtk}
                            onChange={(e) => setFormEnemyAtk(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-0.5">基础魔法值 <span className="text-[#a13d3d]">*</span></label>
                          <input
                            type="number"
                            value={formEnemyMp}
                            onChange={(e) => setFormEnemyMp(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-neutral-200"
                          />
                        </div>
                      </div>

                      {/* Traits, drops, logic */}
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">怪兽核心战斗特性 (非硬性)</label>
                        <input
                          type="text"
                          value={formEnemyTraits}
                          onChange={(e) => setFormEnemyTraits(e.target.value)}
                          placeholder="请输入怪物战斗属性、免疫能力或特殊抗性描述"
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#d4a853]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1 font-medium">敌方行动与AI逻辑行为树 <span className="text-[#a13d3d]">*</span></label>
                          <textarea
                            value={formEnemyBehavior}
                            onChange={(e) => setFormEnemyBehavior(e.target.value)}
                            rows={3}
                            placeholder="请输入怪物 AI 行为顺序、攻击技能和行动逻辑描述"
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-400 mb-1 font-medium">击败掉落物品与掉落几率统计 <span className="text-[#a13d3d]">*</span></label>
                          <textarea
                            value={formEnemyDrops}
                            onChange={(e) => setFormEnemyDrops(e.target.value)}
                            rows={3}
                            placeholder="请输入怪物被战胜时会产出的掉落物、材料配方或是道具和百分比几率"
                            className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] resize-none"
                          />
                        </div>
                      </div>

                      {/* Drop unlock blueprint */}
                      <div className="bg-neutral-900/60 p-3 rounded border border-neutral-800 space-y-2">
                        <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formEnemyUnlockBlueprint}
                            onChange={(e) => setFormEnemyUnlockBlueprint(e.target.checked)}
                            className="rounded border-[#b89b5c]/50 bg-neutral-950 text-[#d4a853] w-4 h-4"
                          />
                          <span>击败该敌人可解锁隐藏装备制造图纸设计图吗？</span>
                        </label>

                        {formEnemyUnlockBlueprint && (
                          <div className="pt-2 border-t border-neutral-800/80 animate-fade">
                            <label className="block text-xs text-[#d4a853] mb-1 font-medium">解锁的制造图纸全称 <span className="text-[#a13d3d]">*</span></label>
                            <input
                              type="text"
                              value={formEnemyBlueprintName}
                              onChange={(e) => setFormEnemyBlueprintName(e.target.value)}
                              placeholder="请输入解锁的图纸或防具武器配方名称"
                              className="w-full text-xs bg-neutral-950 border border-[#b89b5c]/45 rounded px-3 py-2 text-neutral-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* ENEMY ANIMATION CLIPS (FOUR CLIPS AS REQUESTED) */}
                      <div className="bg-neutral-950 border border-neutral-900 p-3 rounded space-y-3">
                        <p className="text-[11px] text-neutral-400 font-mono">
                          团队设计师可在下方上传敌人各个阶段的表现帧动画（ZIP格式/上传多图自组序列）：
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] text-[#b89b5c] block font-medium">1. 待机表现动画帧</span>
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormEnemyIdleSeq)}
                              className="text-[9px]"
                            />
                            {formEnemyIdleSeq.length > 0 && <span className="text-emerald-500 text-[10px] block">已注入 {formEnemyIdleSeq.length} 帧</span>}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-[#b89b5c] block font-medium">2. 受伤表现动画帧</span>
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormEnemyHitSeq)}
                              className="text-[9px]"
                            />
                            {formEnemyHitSeq.length > 0 && <span className="text-emerald-500 text-[10px] block">已注入 {formEnemyHitSeq.length} 帧</span>}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-[#b89b5c] block font-medium">3. 行动/攻击一表现帧</span>
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormEnemyActionSeq1)}
                              className="text-[9px]"
                            />
                            {formEnemyActionSeq1.length > 0 && <span className="text-emerald-500 text-[10px] block">已注入 {formEnemyActionSeq1.length} 帧</span>}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-[#b89b5c] block font-medium">4. 行动/攻击二表现帧</span>
                            <input
                              type="file"
                              accept=".zip"
                              onChange={(e) => handleZipUpload(e, setFormEnemyActionSeq2)}
                              className="text-[9px]"
                            />
                            {formEnemyActionSeq2.length > 0 && <span className="text-emerald-500 text-[10px] block">已注入 {formEnemyActionSeq2.length} 帧</span>}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* EVENTS SPECIAL FIELDS */}
                  {activeTab === 'events' && (
                    <div className="space-y-4">
                      
                      {/* Event description */}
                      <div>
                        <label className="block text-xs text-neutral-400 mb-1 font-medium">事件详细描述内容 <span className="text-[#a13d3d]">*</span></label>
                        <textarea
                          value={formEventDescription}
                          onChange={(e) => setFormEventDescription(e.target.value)}
                          rows={3}
                          placeholder="请输入事件宏观剧情、前因后果或发生场景内容"
                          className="w-full text-xs bg-neutral-900 border border-[#b89b5c]/35 rounded px-3 py-2 text-[#e6d8b5] focus:outline-none focus:border-[#d4a853] resize-none"
                        />
                      </div>

                      {/* Event image upload */}
                      <div>
                        <label className="block text-xs text-[#d4a853] mb-1 font-medium">事件配图/插图贴图 <span className="text-[#a13d3d]">*</span></label>
                        <div className="flex items-center gap-3 bg-neutral-900/40 p-2.5 rounded border border-neutral-800">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMediaUpload(e, setFormEventIllustration)}
                            className="text-xs"
                          />
                          {formEventIllustration && (
                            <img src={formEventIllustration} className="w-12 h-12 object-contain border border-[#b89b5c]/30 rounded bg-neutral-950" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>

                      {/* HIGHLY ADVANCED RECURSIVE OPTION BUILDER */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-1.5">
                          <p className="text-xs text-[#00ffd5] font-semibold flex items-center gap-1.5">
                            <Zap className="w-4 h-4" />
                            <span>决策选项、触发后果与多层剧情贴图嵌套树</span>
                          </p>
                          <button
                            type="button"
                            onClick={handleAddEventOption}
                            className="bg-neutral-900 border border-[#00ffd5]/40 text-[#00ffd5] text-[10px] font-mono px-2 py-1 rounded hover:bg-[#00ffd5]/10"
                          >
                            + 新增根触发选项
                          </button>
                        </div>

                        {/* Outer mapping using recursive editor component */}
                        <div className="space-y-4">
                          {formEventOptions && formEventOptions.length > 0 ? (
                            <RecursiveOptionsEditor
                              options={formEventOptions}
                              parentPath={[]}
                              depth={0}
                              onUpdateField={handleUpdateOptionField}
                              onRemoveNode={handleRemoveOptionNode}
                              onAddNestedOption={handleAddNestedOption}
                            />
                          ) : (
                            <div className="text-xs text-neutral-500 italic p-4 text-center bg-neutral-950 rounded border border-neutral-900">
                              暂无决策分支，点击上方按钮新增根选项
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Submission and Close buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-md hover:bg-neutral-800 text-xs"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer bg-[#d4a853] text-neutral-950 font-bold px-5 py-2 rounded-md hover:bg-[#b89b5c] shadow-[0_0_15px_rgba(212,168,83,0.3)] text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4 stroke-2" />
                      <span>审核并录入档案馆</span>
                    </button>
                  </div>

                </form>
              </div>
            ) : (
              /* Resource Inventory List Cards */
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                    数据总数 ({filteredList.length} 件匹配)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    单击对应项目可在右侧查看 <strong>详细属性与图片预览</strong>
                  </p>
                </div>

                {filteredList.length === 0 ? (
                  <div className="border border-dashed border-[#b89b5c]/20 bg-neutral-950/50 rounded-lg p-10 text-center text-neutral-500 text-xs">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>未找到符合条件的筛选数据</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredList.map((res) => {
                      // Resolve background glow color according to types / categories
                      let glowType: 'amber' | 'crimson' | 'cyan' | 'gray' = 'amber';
                      if (activeTab === 'enemies') {
                        const enemy = res as EnemyResource;
                        glowType = enemy.category === 'boss' ? 'crimson' : enemy.category === 'elite' ? 'cyan' : 'gray';
                      } else if (activeTab === 'events') {
                        glowType = 'cyan';
                      }

                      return (
                        <GothicCard
                          key={res.id}
                          glowColor={glowType}
                          onClick={() => {
                            setSelectedItem(res);
                            playSound('click');
                          }}
                          className={`
                            border-l-4 transition-all
                            ${selectedItem && selectedItem.id === res.id 
                              ? 'border-[#d4a853] bg-neutral-900/90 shadow-[0_0_15px_rgba(212,168,83,0.2)] scale-[1.01]' 
                              : 'border-l-[#b89b5c]/70'
                            }
                          `}
                        >
                          <div className="flex gap-3.5 items-start">
                            
                            {/* Texture display */}
                            <div className="w-12 h-12 bg-neutral-950 border border-[#b89b5c]/35 rounded p-1.5 flex items-center justify-center shrink-0">
                              {activeTab === 'items' && (
                                <img src={res.texture1} className="w-full h-full object-contain image-render-pixelated" alt="item" referrerPolicy="no-referrer" />
                              )}
                              {(activeTab === 'weapons' || activeTab === 'armors') && (
                                <img src={res.texture1} className="w-full h-full object-contain image-render-pixelated" alt="gear" referrerPolicy="no-referrer" />
                              )}
                              {activeTab === 'enemies' && (
                                <div className="w-full h-full flex items-center justify-center">
                                  {res.idleFrameSeq && res.idleFrameSeq.length > 0 ? (
                                    <img src={res.idleFrameSeq[0]} className="w-full h-full object-contain image-render-pixelated" alt="enemy" referrerPolicy="no-referrer" />
                                  ) : (
                                    <Skull className="w-5 h-5 text-neutral-500" />
                                  )}
                                </div>
                              )}
                              {activeTab === 'events' && (
                                <img src={res.illustration} className="w-full h-full object-contain image-render-pixelated" alt="event" referrerPolicy="no-referrer" />
                              )}
                            </div>

                            {/* Text Summary */}
                            <div className="space-y-1 w-full min-w-0">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[9px] font-mono text-neutral-500 uppercase">
                                  {res.id}
                                </span>
                                <span className="text-[10px] font-mono text-neutral-400">
                                  {new Date(res.createdAt).toLocaleDateString()}
                                </span>
                              </div>

                              <h4 className="text-sm font-semibold tracking-wide text-neutral-100 truncate font-gothic">
                                {res.name}
                              </h4>

                              {/* Metadata tags based on category */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {activeTab === 'items' && (
                                  <>
                                    <span className="text-[9px] bg-amber-500/10 text-[#d4a853] px-1 rounded border border-[#d4a853]/20 flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-current" />
                                      <span>{res.starLevel}星</span>
                                    </span>
                                    {res.isActiveItem && (
                                      <span className="text-[9px] bg-red-950/80 text-red-400 px-1 rounded border border-red-900/30">
                                        主动激活
                                      </span>
                                    )}
                                    {res.isPartOfSet && (
                                      <span className="text-[9px] bg-indigo-950/80 text-indigo-400 px-1 rounded border border-indigo-900/30 truncate max-w-[80px]">
                                        {sets.find(s => s.id === res.setId)?.name || '未知套装'}
                                      </span>
                                    )}
                                  </>
                                )}

                                {activeTab === 'weapons' && (
                                  <>
                                    <span className="text-[9px] bg-red-950 text-red-400 px-2 rounded-full border border-red-900/40">
                                      物理/魔法武器
                                    </span>
                                    {res.hasActiveSkill && (
                                      <span className="text-[9px] bg-yellow-950 text-yellow-400 px-1 rounded">
                                        战技：带法术
                                      </span>
                                    )}
                                  </>
                                )}

                                {activeTab === 'armors' && (
                                  <span className="text-[9px] bg-[#1a2e1d] text-[#6ee7b7] px-2 rounded-full border border-[#065f46]">
                                    防具装备
                                  </span>
                                )}

                                {activeTab === 'enemies' && (
                                  <>
                                    <span className={`text-[9px] px-2 rounded-full border ${
                                      res.category === 'boss' ? 'bg-[#3b0712] text-[#fda4af] border-[#9f1239]' :
                                      res.category === 'elite' ? 'bg-[#06242c] text-[#67e8f9] border-[#0891b2]' :
                                      'bg-neutral-900 text-neutral-400 border-neutral-700'
                                    }`}>
                                      {res.category === 'boss' ? '☠ 首领/Boss' : res.category === 'elite' ? '✦ 精英怪' : '☉ 普通怪'}
                                    </span>
                                    <span className="text-[9px] text-neutral-400 font-mono">
                                      HP: {res.hp} | ATK: {res.atk}
                                    </span>
                                  </>
                                )}

                                {activeTab === 'events' && (
                                  <span className={`text-[9px] px-1.5 rounded ${
                                    res.state === 'combat' ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                                  }`}>
                                    {res.state === 'combat' ? '战斗事件' : '非战斗事件'}
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        </GothicCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel (column scale: 5) - Detail inspector, fade animations, ZIP assets packages */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-black/40 backdrop-blur-md border border-[#b89b5c] rounded-lg p-5 space-y-5 relative min-h-[400px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-black border border-[#b89b5c] text-[#b89b5c] text-[9px] font-mono px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#d4a853]" />
                <span>属性详情与预览 (DETAIL VIEW)</span>
              </div>

              {!currentDetails ? (
                <div className="flex flex-col items-center justify-center text-center p-20 text-neutral-500 h-full">
                  <div className="w-16 h-16 rounded-full border border-dashed border-[#b89b5c]/35 flex items-center justify-center mb-4 text-[#b89b5c]/50 animate-pulse">
                    <Info className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-semibold font-gothic text-neutral-400 mb-1">
                    未选取项目
                  </h4>
                  <p className="text-[11px] text-neutral-500 max-w-xs leading-relaxed">
                    请在左侧列表中点击任意项目查看其属性、预览以及下载资源。
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade">
                  
                  {/* Title detail Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 text-neutral-400">
                          {currentDetails.id}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          自增排序：#{currentDetails.seqId}
                        </span>
                      </div>
                      <h3 className="text-base font-bold font-gothic text-[#d4a853]">
                        {currentDetails.name}
                      </h3>
                    </div>

                    <div className="flex gap-1">
                      {/* Packing individual asset download as ZIP */}
                      <button
                        type="button"
                        onClick={() => handleExportIndividual(currentDetails, activeTab)}
                        className="bg-neutral-900 hover:bg-[#d4a853]/15 text-neutral-300 hover:text-[#d4a853] p-1.5 rounded border border-neutral-800 hover:border-[#d4a853]/40 transition-all flex items-center gap-1 text-[10px] uppercase font-mono"
                        title="将此资源的配置表与原画贴图全部打包成 ZIP 交付"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>ZIP打包</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteResource(activeTab, currentDetails.id, currentDetails.name)}
                        className="bg-neutral-900 hover:bg-[#a13d3d]/20 text-neutral-400 hover:text-[#ff6b6b] p-1.5 rounded border border-neutral-800 hover:border-[#a13d3d]/50 transition-all"
                        title="剔除此资产"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DETAILS BODY MAPS DEPENDING ON TAB */}
                  {activeTab === 'items' && (
                    <div className="space-y-4">
                      
                      {/* Potion/item main frame and idle/active loops */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col items-center justify-center">
                          <span className="text-[10px] font-mono text-neutral-400 mb-2">主展示原贴图 1</span>
                          <img src={currentDetails.texture1} className="h-24 w-24 object-contain image-render-pixelated" alt="item skin" referrerPolicy="no-referrer" />
                        </div>

                        <div>
                          {/* Idle sequence preview */}
                          <FramePreview 
                            frames={currentDetails.idleAnimation} 
                            heightClass="h-24"
                            speedMs={450}
                          />
                        </div>
                      </div>

                      {/* Info list */}
                      <div className="space-y-2 text-xs">
                        <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded space-y-1.5">
                          <span className="text-[10px] text-neutral-400 block tracking-wider uppercase font-mono">
                            「物品星级品阶」
                          </span>
                          <div className="flex items-center gap-1.5 text-[#d4a853]">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < currentDetails.starLevel ? 'fill-current' : 'opacity-20'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-neutral-900/50 p-3 rounded space-y-2">
                          <div>
                            <span className="text-[10px] text-[#00ffd5] block font-mono">【熔铸材料与金属效用】</span>
                            <p className="text-xs text-neutral-200 leading-relaxed mt-0.5">{currentDetails.effect}</p>
                          </div>

                          {currentDetails.remark && (
                            <div className="border-t border-neutral-800/80 pt-1.5">
                              <span className="text-[10px] text-neutral-500 block font-mono">《艺术设计卷宗纪要》</span>
                              <p className="text-xs italic text-neutral-400 mt-0.5">“ {currentDetails.remark} ”</p>
                            </div>
                          )}

                          {currentDetails.isPartOfSet && (
                            <div className="bg-[#1a110a] border border-[#b89b5c]/30 rounded p-2.5 mt-2 flex items-start gap-2.5">
                              <Award className="w-5 h-5 text-[#d4a853] shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="block text-xs font-semibold text-[#d4a853]">
                                  专属套装件： {sets.find(s => s.id === currentDetails.setId)?.name || '未发现配置'}
                                </span>
                                <p className="text-[11px] text-neutral-400 leading-normal">
                                  {sets.find(s => s.id === currentDetails.setId)?.description || '当前套装属性在规则表中缺失描述。'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* WEAPONS & EQUIPMENT DETAIL BODY */}
                  {(activeTab === 'weapons' || activeTab === 'armors') && (
                    <div className="space-y-3 text-xs">
                      
                      {/* Graphics frame layouts */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-neutral-950 border border-neutral-900 rounded flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] text-neutral-500 mb-1">图纸形态</span>
                          <img src={currentDetails.blueprintTexture} className="h-14 w-14 object-contain image-render-pixelated" alt="blueprint" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-2 bg-neutral-950 border border-neutral-900 rounded flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] text-neutral-500 mb-1">道具卡贴图</span>
                          <img src={currentDetails.texture1} className="h-14 w-14 object-contain image-render-pixelated" alt="skin" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-2 bg-neutral-950 border border-neutral-900 rounded flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] text-neutral-500 mb-1">局内常驻</span>
                          <img src={currentDetails.inGameTexture} className="h-14 w-14 object-contain image-render-pixelated" alt="sprite" referrerPolicy="no-referrer" />
                        </div>
                      </div>

                      {/* VFX Sequential frames view */}
                      {currentDetails.vfxAnimation && currentDetails.vfxAnimation.length > 0 && (
                        <div className="bg-neutral-950 p-2 border border-neutral-900 rounded-lg">
                          <FramePreview 
                            frames={currentDetails.vfxAnimation} 
                            heightClass="h-20"
                            speedMs={350}
                          />
                        </div>
                      )}

                      {/* Details specs */}
                      <div className="bg-neutral-900/50 p-3.5 rounded-lg space-y-3">
                        <div>
                          <span className="text-[10px] text-neutral-400 block font-mono">【常驻被动武装加成】</span>
                          <p className="text-xs text-neutral-200 font-medium leading-relaxed">{currentDetails.passiveEffect}</p>
                        </div>

                        {currentDetails.hasActiveSkill && (
                          <div className="border-t border-neutral-800/80 pt-2 text-[#d4a853]">
                            <span className="text-[10px] block font-mono">【专属局端释出主动招式】</span>
                            <p className="text-xs leading-relaxed mt-0.5">{currentDetails.activeSkillName}</p>
                          </div>
                        )}

                        <div className="border-t border-neutral-800/80 pt-2 space-y-1 text-neutral-300">
                          <div>
                            <span className="text-[10px] text-neutral-400">图纸获取路径: </span>
                            <span className="font-medium text-neutral-200">{currentDetails.recipeSource}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400">工艺精炼门槛: </span>
                            <span className="font-mono text-[#b89b5c]">{currentDetails.craftLevel}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400">熔炼材料清单: </span>
                            <span className="font-medium text-amber-100">{currentDetails.materials}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ENEMIES DETAIL BODY */}
                  {activeTab === 'enemies' && (
                    <div className="space-y-4 text-xs">
                      
                      {/* STATS BENTO BARS FOR ENEMY INTENSIVE READ */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-left">
                        <div className="bg-neutral-900 border border-neutral-800 rounded p-1.5">
                          <span className="text-[9px] text-neutral-500 block uppercase font-mono">生命上限</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">{currentDetails.hp}</span>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded p-1.5">
                          <span className="text-[9px] text-neutral-500 block uppercase font-mono">硬度</span>
                          <span className="text-xs font-bold text-[#b89b5c] font-mono">{currentDetails.initDefense}</span>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded p-1.5">
                          <span className="text-[9px] text-neutral-500 block uppercase font-mono">物理攻击</span>
                          <span className="text-xs font-bold text-red-400 font-mono">{currentDetails.atk}</span>
                        </div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded p-1.5">
                          <span className="text-[9px] text-neutral-500 block uppercase font-mono">最高法力蓄值</span>
                          <span className="text-xs font-bold text-cyan-400 font-mono">{currentDetails.mp}</span>
                        </div>
                      </div>

                      {/* Display Anim clips list */}
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-900 space-y-2 text-left">
                        <span className="text-[10px] text-neutral-500 block font-mono">
                          「全阶段动画解离 (淡入式切帧 preview)」
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="text-[9px] text-neutral-400 block mb-0.5">待机 Idle Animation</span>
                            <FramePreview 
                              frames={currentDetails.idleFrameSeq} 
                              heightClass="h-16" 
                              speedMs={500}
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-neutral-400 block mb-0.5">受击 Hurt/Hit Animation</span>
                            <FramePreview 
                              frames={currentDetails.hitFrameSeq} 
                              heightClass="h-16" 
                              speedMs={250}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Descriptions and drops */}
                      <div className="bg-[#1b1712] border border-neutral-850 p-3.5 rounded space-y-2.5 text-left">
                        
                        {currentDetails.traits && (
                          <div>
                            <span className="text-[10px] text-amber-400 block font-mono">✦ 妖魔天赋加权: </span>
                            <p className="text-xs text-neutral-200 mt-0.5">{currentDetails.traits}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] text-[#00ffd5] block font-mono">✦ AI 行动力场逻辑行为树: </span>
                          <p className="text-xs text-neutral-200 leading-relaxed mt-0.5 whitespace-pre-line">{currentDetails.behaviorLogic}</p>
                        </div>

                        <div className="border-t border-neutral-800/80 pt-2 flex justify-between items-center bg-neutral-950/40 p-2 rounded">
                          <div>
                            <span className="text-[10px] text-neutral-500 block">击杀必定掉率配比: </span>
                            <span className="text-xs text-amber-200 font-medium">{currentDetails.drops}</span>
                          </div>
                          {currentDetails.unlockBlueprint && (
                            <div className="bg-blue-950 border border-blue-900 text-[10px] text-blue-300 px-2 py-1 rounded">
                              ✓ 击败解锁图纸 《{currentDetails.blueprintName}》
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* EVENTS DETAIL BODY */}
                  {activeTab === 'events' && (
                    <div className="space-y-4 text-xs">
                      <div className="flex bg-neutral-900/60 p-1.5 rounded border border-neutral-800 gap-1 font-mono">
                        <button
                          type="button"
                          onClick={() => setEventDetailMode('simulator')}
                          className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 ${
                            eventDetailMode === 'simulator' 
                              ? 'bg-[#d4a853] text-[#121212]' 
                              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          <span>🎮 交互式沙盒推演</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEventDetailMode('tree')}
                          className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 ${
                            eventDetailMode === 'tree' 
                              ? 'bg-[#00ffd5]/90 text-[#121212]' 
                              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          <span>💾 暗线全局结构树</span>
                        </button>
                      </div>

                      {eventDetailMode === 'tree' ? (
                        <div className="space-y-3.5 animate-fade text-left">
                          {/* Macro illustration */}
                          <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col items-center justify-center">
                            <span className="text-[10px] font-mono text-[#00ffd5] mb-2 font-bold tracking-wider">【主事件基准插画】</span>
                            <img src={currentDetails.illustration} className="h-44 w-full object-contain image-render-pixelated bg-neutral-900/60" alt="event draw" referrerPolicy="no-referrer" />
                          </div>

                          <div className="bg-neutral-900/80 p-3.5 rounded border border-neutral-800 text-left">
                            <span className="text-[10px] text-neutral-400 block font-mono font-bold">【主事件初始遭遇详细描述】</span>
                            <p className="text-xs text-[#e6d8b5] leading-relaxed mt-1.5 whitespace-pre-wrap">
                              {currentDetails.description}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-neutral-400 block font-mono font-bold text-left mb-2">【完整剧情展开脉络结构】</span>
                            {currentDetails.options && currentDetails.options.length > 0 ? (
                              <RecursiveTreePreview options={currentDetails.options} depth={1} />
                            ) : (
                              <p className="text-xs text-neutral-500 italic text-center py-4">暂无预载的选项/分支脉络</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 text-xs animate-fade text-left">
                          {/* SIMULATOR MODE */}
                          {(() => {
                            // Compute simulation states
                            const simIllustration = (() => {
                              if (simulationHistory.length > 0) {
                                for (let i = simulationHistory.length - 1; i >= 0; i--) {
                                  if (simulationHistory[i].nextIllustration) {
                                    return simulationHistory[i].nextIllustration;
                                  }
                                }
                              }
                              return currentDetails.illustration;
                            })();

                            const simDescription = (() => {
                              if (simulationHistory.length > 0) {
                                const deepestNode = simulationHistory[simulationHistory.length - 1];
                                return deepestNode.nextDescription || `触发了分支【${deepestNode.text}】。后果：${deepestNode.result || '无'}`;
                              }
                              return currentDetails.description;
                            })();

                            const simOptions = (() => {
                              if (simulationHistory.length > 0) {
                                const deepestNode = simulationHistory[simulationHistory.length - 1];
                                return deepestNode.nestedOptions || [];
                              }
                              return currentDetails.options || [];
                            })();

                            return (
                              <div className="space-y-3.5 text-left">
                                {/* Simulator illustration */}
                                <div className="p-3 bg-neutral-950 border border-neutral-900 rounded-lg flex flex-col items-center justify-center relative">
                                  <span className="absolute top-2 left-3 text-[8px] font-mono text-[#d4a853] bg-neutral-950/80 px-2 py-0.5 border border-neutral-800 rounded shadow-md">
                                    {simulationHistory.length === 0 ? '【主线·基准插画】' : `【嵌套暗线 · ${simulationHistory.length}层插画】`}
                                  </span>
                                  <img 
                                    src={simIllustration} 
                                    className="h-44 w-full object-contain image-render-pixelated bg-neutral-900/60" 
                                    alt="dynamic scene draw" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>

                                {/* Story text parchment */}
                                <div className="bg-neutral-900/95 p-4 rounded border-2 border-[#b89b5c]/35 shadow-inner">
                                  <span className="text-[9px] text-[#b89b5c] font-mono font-bold block mb-1">
                                    {simulationHistory.length === 0 ? 'STATUS: 主线剧情启动遭遇' : `STATUS: 深入后续抉择 chain x${simulationHistory.length}`}
                                  </span>
                                  <p className="text-xs text-[#e6d8b5] leading-relaxed select-text whitespace-pre-wrap">
                                    {simDescription}
                                  </p>
                                </div>

                                {/* Choice list buttons */}
                                <div className="space-y-2">
                                  <span className="text-[10px] text-[#00ffd5] tracking-widest block font-mono font-bold uppercase mb-1">
                                    {simOptions.length > 0 ? '✦ 做出您的抉择决策分支 :' : '✦ 本分支故事结局终点 :'}
                                  </span>

                                  {simOptions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2.5 text-left">
                                      {simOptions.map((opt: EventOption, idx: number) => (
                                        <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() => setSimulationHistory([...simulationHistory, opt])}
                                          className="w-full text-left bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-[#d4a853]/55 p-3 rounded-md transition-all group duration-200 shadow-md relative pr-12"
                                        >
                                          <div className="flex items-start gap-2">
                                            <span className="text-[10px] text-[#d4a853] font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                                              #{idx + 1}
                                            </span>
                                            <div>
                                              <p className="font-semibold text-neutral-200 text-xs">
                                                {opt.text}
                                              </p>
                                              <p className="text-[10px] text-yellow-101/60 mt-0.5">
                                                即时后果: {opt.result || '未预知结果'}
                                              </p>
                                            </div>
                                          </div>
                                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-neutral-600 font-mono group-hover:text-[#00ffd5] transition-colors">
                                            {opt.probability}% →
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="bg-[#241111]/45 border border-red-950/40 p-3 rounded text-center text-[11px] text-[#ff6b6b] italic">
                                      已抵达本支遭遇终点。请点击下方按钮退回上级或重置，可以浏览其他暗线与对应贴图。
                                    </div>
                                  )}
                                </div>

                                {/* Step controls & tracer breadcrumbs */}
                                {simulationHistory.length > 0 && (
                                  <div className="pt-3 border-t border-neutral-900 mt-4 space-y-3">
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] leading-relaxed">
                                      <span className="text-neutral-500 font-bold font-mono">追溯印记:</span>
                                      <span className="text-neutral-400 bg-neutral-950 border border-neutral-850 px-1.5 py-0.5 rounded font-mono">
                                        起点
                                      </span>
                                      {simulationHistory.map((h, hIdx) => (
                                        <React.Fragment key={h.id}>
                                          <span className="text-neutral-600">→</span>
                                          <span className="text-[#00ffd5] bg-[#00ffd5]/10 border border-[#00ffd5]/20 px-1.5 py-0.5 rounded font-mono">
                                            {h.text}
                                          </span>
                                        </React.Fragment>
                                      ))}
                                    </div>

                                    <div className="flex gap-2.5 text-left">
                                      <button
                                        type="button"
                                        onClick={() => setSimulationHistory(simulationHistory.slice(0, -1))}
                                        className="flex-1 text-center py-2 px-3 bg-neutral-900 text-xs text-neutral-300 rounded border border-neutral-800 hover:bg-neutral-850 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <span>↩ 返回上级</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSimulationHistory([])}
                                        className="flex-1 text-center py-2 px-3 bg-neutral-900 text-xs text-red-400 rounded border border-neutral-800 hover:bg-[#241111] hover:text-red-350 font-semibold transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <span>↺ 重新遭遇</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

        </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer system specs */}
      <footer className="mt-16 border-t border-[#b89b5c]/30 pt-8 pb-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 font-mono tracking-wider">
        <p>ForgeCraft v2.0.0 - Blacksmith & Metal Reforger Coordinator</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span>在线协作者: 4</span>
          <span className="text-[#d4a853]">● 系统状态: 正常</span>
        </div>
      </footer>

    </div>
  );
}
