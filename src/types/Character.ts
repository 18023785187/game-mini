/**
 * 角色类型定义
 */

/**
 * 角色ID枚举
 */
export enum CharacterId {
  BERSERKER = 'berserker',   // 狂战士
  GUNNER = 'gunner',         // 神枪手
  TANK = 'tank',             // 肉盾
}

/**
 * 角色类型
 */
export enum CharacterType {
  MELEE = 'melee',           // 近战型
  RANGED = 'ranged',         // 远战型
}

/**
 * 角色配置
 */
export interface CharacterConfig {
  id: CharacterId;
  name: string;
  type: CharacterType;
  color: string;             // 角色主题色
  iconShape: 'sword' | 'gun' | 'shield';  // 图标形状
}

/**
 * 所有角色配置
 */
export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  [CharacterId.BERSERKER]: {
    id: CharacterId.BERSERKER,
    name: '狂战士',
    type: CharacterType.MELEE,
    color: '#ff4444',
    iconShape: 'sword',
  },
  [CharacterId.GUNNER]: {
    id: CharacterId.GUNNER,
    name: '神枪手',
    type: CharacterType.RANGED,
    color: '#44ff44',
    iconShape: 'gun',
  },
  [CharacterId.TANK]: {
    id: CharacterId.TANK,
    name: '肉盾',
    type: CharacterType.MELEE,
    color: '#4444ff',
    iconShape: 'shield',
  },
};

/**
 * 获取角色配置
 */
export function getCharacterConfig(id: CharacterId): CharacterConfig {
  return CHARACTERS[id];
}

/**
 * 获取所有角色ID列表
 */
export function getAllCharacterIds(): CharacterId[] {
  return [CharacterId.BERSERKER, CharacterId.GUNNER, CharacterId.TANK];
}
