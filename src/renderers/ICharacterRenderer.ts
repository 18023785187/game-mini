/**
 * 角色渲染器接口
 * 定义所有角色渲染器必须实现的统一接口
 */

import { CharacterConfig } from '../types/Character';
import { CharacterDirection } from '../entities/Character';

/**
 * 渲染参数接口
 */
export interface RenderParams {
  cx: number;           // 中心X坐标
  cy: number;           // 中心Y坐标
  size: number;         // 角色尺寸
  scale: number;        // 缩放比例
  walkCycle: number;    // 行走周期
  isMoving: boolean;    // 是否移动中
  attackProgress: number;    // 攻击进度 0-1
  swingAngle: number;        // 挥砍角度
  direction: CharacterDirection;  // 朝向
  isEnchanted: boolean;      // 是否附魔
  isChargedAttack: boolean;  // 是否蓄力攻击
  chargeProgress: number;    // 蓄力进度 0-1
  isRapidFire: boolean;      // 是否在双枪连射中
  rapidFireProgress: number; // 双枪连射进度 0-1
  rapidFireShotsFired: number; // 已射击次数
}

/**
 * 预览渲染参数接口
 */
export interface PreviewRenderParams {
  x: number;      // 中心X坐标
  y: number;      // 中心Y坐标
  size: number;   // 角色尺寸
  scale: number;  // 缩放比例
  color: string;  // 主题色
}

/**
 * 角色渲染器接口
 * 所有角色渲染器必须实现此接口
 */
export interface ICharacterRenderer {
  /**
   * 渲染战斗场景中的角色
   */
  renderBattle(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: RenderParams): void;

  /**
   * 渲染角色预览（用于选角色界面）
   */
  renderPreview(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: PreviewRenderParams): void;
}
