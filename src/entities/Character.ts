/**
 * 角色实体类
 * 管理角色的位置、方向等基础属性
 */

import { CharacterId, CharacterConfig, CHARACTERS } from '../types/Character';

/**
 * 角色方向
 */
export enum CharacterDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 角色状态
 */
export enum CharacterState {
  IDLE = 'idle',           // 待机
  MOVING = 'moving',       // 移动中
  JUMPING = 'jumping',     // 跳跃中
}

/**
 * 角色实体
 */
export class Character {
  // 基础属性
  readonly id: CharacterId;
  readonly config: CharacterConfig;

  // 位置和移动
  private _x: number = 0;
  private _y: number = 0;
  private _direction: CharacterDirection = CharacterDirection.RIGHT;

  // 跳跃相关
  private _groundY: number = 0;      // 地面Y坐标
  private _velocityY: number = 0;     // 垂直速度
  private _isJumping: boolean = false; // 是否在跳跃中
  private readonly JUMP_FORCE = 400;   // 跳跃力度（正值，因为Y轴向上为正）
  private readonly GRAVITY = -1200;    // 重力加速度（负值，向下拉）
  private readonly JUMP_HEIGHT_LIMIT = 180; // 跳跃高度限制(3个单位,60px/单位)

  // 状态
  private _state: CharacterState = CharacterState.IDLE;

  constructor(characterId: CharacterId) {
    this.id = characterId;
    this.config = CHARACTERS[characterId];
  }

  // Getters
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get direction(): CharacterDirection { return this._direction; }
  get state(): CharacterState { return this._state; }
  get isJumping(): boolean { return this._isJumping; }

  // Setters
  set x(value: number) { this._x = value; }
  set y(value: number) { this._y = value; }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  /**
   * 设置方向
   */
  setDirection(direction: CharacterDirection): void {
    this._direction = direction;
  }

  /**
   * 设置状态
   */
  setState(state: CharacterState): void {
    this._state = state;
  }

  /**
   * 触发跳跃
   */
  jump(): void {
    if (!this._isJumping) {
      this._isJumping = true;
      this._velocityY = this.JUMP_FORCE;
      this._state = CharacterState.JUMPING;
    }
  }

  /**
   * 设置地面Y坐标
   */
  setGroundY(groundY: number): void {
    this._groundY = groundY;
  }

  /**
   * 获取地面Y坐标
   */
  get groundY(): number {
    return this._groundY;
  }

  /**
   * 更新角色状态
   */
  update(deltaTime: number): void {
    // 更新跳跃物理
    if (this._isJumping) {
      const dt = deltaTime / 1000;
      this._y += this._velocityY * dt;
      this._velocityY += this.GRAVITY * dt;

      // 跳跃高度限制(3个单位 = 180px)
      if (this._y > this._groundY + this.JUMP_HEIGHT_LIMIT) {
        this._y = this._groundY + this.JUMP_HEIGHT_LIMIT;
        this._velocityY = 0; // 达到最大高度后停止上升
      }

      // 落地检测
      if (this._y <= this._groundY) {
        this._y = this._groundY;
        this._isJumping = false;
        this._velocityY = 0;

        // 根据是否在移动更新状态
        if (this._state === CharacterState.JUMPING) {
          this._state = CharacterState.IDLE;
        }
      }
    }
  }

  /**
   * 重置角色状态
   */
  reset(): void {
    this._x = 0;
    this._y = 0;
    this._groundY = 0;
    this._velocityY = 0;
    this._isJumping = false;
    this._direction = CharacterDirection.RIGHT;
    this._state = CharacterState.IDLE;
  }
}
