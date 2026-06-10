export interface GameSet {
  id: string;
  name: string;
  description: string;
}

export interface BaseResource {
  id: string; // Auto-generated string ID: e.g. ITEM_001
  seqId: number; // Incrementing sequence
  name: string;
  createdAt: number;
}

export interface ItemResource extends BaseResource {
  starLevel: number; // 1 - 5 stars
  isActiveItem: boolean;
  isPartOfSet: boolean;
  setId?: string; // Links to GameSet
  effect: string;
  remark: string;
  texture1: string; // Base64 image
  idleAnimation?: string[]; // Array of Base64 images
  activeAnimation?: string[]; // Array of Base64 images
}

export interface GearResource extends BaseResource {
  type: 'weapon' | 'armor'; // Shared Weapons and armor templates
  passiveEffect: string;
  hasActiveSkill: boolean;
  activeSkillName?: string;
  recipeSource: string;
  craftLevel: string; // Craft requisites
  materials: string; // Consumed materials
  blueprintTexture: string; // Base64 image
  texture1: string; // Base64 image
  inGameTexture: string; // Base64 image
  vfxAnimation?: string[]; // Array of Base64 images for effects
}

export interface EnemyResource extends BaseResource {
  category: 'normal' | 'elite' | 'boss'; // 小怪 / 精英 / BOSS
  hp: number;
  maxHp: number;
  initDefense: number;
  atk: number;
  def: number;
  mp: number;
  traits?: string; // 特性
  behaviorLogic: string; // 行动逻辑
  drops: string; // 掉落物及掉率
  unlockBlueprint: boolean;
  blueprintName?: string; // 解锁的图纸
  idleFrameSeq?: string[];
  hitFrameSeq?: string[];
  actionFrameSeq1?: string[];
  actionFrameSeq2?: string[];
}

export interface EventOption {
  id: string;
  text: string;
  result: string;
  probability: number; // Trigger chance 0-100
  nextDescription?: string; // Next level event description/text
  nextIllustration?: string; // Next level event illustration (Base64)
  nestedOptions?: EventOption[];
}

export interface EventResource extends BaseResource {
  state: 'combat' | 'non-combat'; // 战斗状态事件 / 非战斗状态事件
  description: string;
  options: EventOption[];
  illustration: string; // Base64 image
}

export type ResourceType = 'items' | 'weapons' | 'armors' | 'enemies' | 'events' | 'sets';
