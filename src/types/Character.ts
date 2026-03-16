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
 * 技能定义
 */
export interface Skill {
  name: string;
  description: string;
  cooldown: number;          // 冷却时间（秒）
}

/**
 * 角色配置
 */
export interface CharacterConfig {
  id: CharacterId;
  name: string;
  type: CharacterType;
  weapon: string;            // 武器名称
  attackDistance: number;    // 攻击距离（单位）
  attackDamage: number;      // 普通攻击伤害
  attackCooldown: number;    // 普通攻击冷却（秒）
  skills: [Skill, Skill, Skill];  // 三个技能
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
    weapon: '长剑',
    attackDistance: 3,
    attackDamage: 10,
    attackCooldown: 0.5,
    color: '#ff4444',
    iconShape: 'sword',
    skills: [
      {
        name: '强化斩击',
        description: '强化下一次普攻，造成双倍伤害',
        cooldown: 5,
      },
      {
        name: '冲刺挥砍',
        description: '向前冲刺8个单位挥砍，期间无敌，造成10点伤害',
        cooldown: 10,
      },
      {
        name: '蓄力重击',
        description: '按住蓄力0-5秒，造成10-50点伤害',
        cooldown: 30,
      },
    ],
  },
  [CharacterId.GUNNER]: {
    id: CharacterId.GUNNER,
    name: '神枪手',
    type: CharacterType.RANGED,
    weapon: '手枪',
    attackDistance: 10,
    attackDamage: 5,
    attackCooldown: 1,
    color: '#44ff44',
    iconShape: 'gun',
    skills: [
      {
        name: '双枪连射',
        description: '拿出双枪连开两枪，每枪伤害5点，攻击时不能移动',
        cooldown: 5,
      },
      {
        name: '快速突进',
        description: '快速向前突进4个单位，期间无敌',
        cooldown: 5,
      },
      {
        name: '弹幕风暴',
        description: '拿出双枪连开10枪，每秒2枪，每枪伤害5点，攻击时可移动',
        cooldown: 30,
      },
    ],
  },
  [CharacterId.TANK]: {
    id: CharacterId.TANK,
    name: '肉盾',
    type: CharacterType.MELEE,
    weapon: '刀和盾',
    attackDistance: 2,
    attackDamage: 10,
    attackCooldown: 0.5,
    color: '#4444ff',
    iconShape: 'shield',
    skills: [
      {
        name: '举盾防御',
        description: '按住举起盾牌，减少70%的伤害，但不能攻击',
        cooldown: 0,
      },
      {
        name: '盾牌冲撞',
        description: '举起盾牌向前冲撞8个单位，造成10点伤害，期间无敌',
        cooldown: 5,
      },
      {
        name: '装甲模式',
        description: '减少50%伤害，普通攻击造成15点伤害，持续15秒',
        cooldown: 30,
      },
    ],
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
