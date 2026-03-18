/**
 * 物理系统
 * 处理重力、碰撞检测、角色移动
 * 
 * 注意：此文件目前未被使用，保留以备将来扩展
 */

/* eslint-disable */
// @ts-nocheck
import { Character, CharacterDirection } from '../entities/Character';
import { BattleMap } from './BattleMap';

/**
 * 物理常量
 */
export const PHYSICS = {
  GRAVITY: 1500,           // 重力加速度（像素/秒²）
  JUMP_VELOCITY: 600,      // 跳跃初速度（像素/秒）
  MOVE_SPEED: 200,         // 移动速度（像素/秒）
  DASH_SPEED: 800,         // 冲刺速度（像素/秒）
  GROUND_FRICTION: 0.85,   // 地面摩擦系数
  AIR_FRICTION: 0.95,      // 空气阻力系数
  MAX_FALL_SPEED: 1000,    // 最大下落速度
  UNIT_SIZE: 60,           // 单位尺寸（像素）
  CHARACTER_SIZE: 60,      // 角色尺寸（1单位=60像素）
};

/**
 * 碰撞结果
 */
export interface CollisionResult {
  isColliding: boolean;
  groundY: number | null;
  hitPlatform: boolean;
}

/**
 * 物理引擎
 */
export class Physics {
  private map: BattleMap;

  constructor(map: BattleMap) {
    this.map = map;
  }

  /**
   * 更新角色物理状态
   */
  updateCharacter(character: Character, deltaTime: number): void {
    // 应用重力
    if (!this.isOnGround(character)) {
      character.velocityY -= PHYSICS.GRAVITY * deltaTime;
      // 限制最大下落速度
      if (character.velocityY < -PHYSICS.MAX_FALL_SPEED) {
        character.velocityY = -PHYSICS.MAX_FALL_SPEED;
      }
    }

    // 应用摩擦力
    if (this.isOnGround(character)) {
      character.velocityX *= PHYSICS.GROUND_FRICTION;
    } else {
      character.velocityX *= PHYSICS.AIR_FRICTION;
    }

    // 更新位置
    character.x += character.velocityX * deltaTime;
    character.y += character.velocityY * deltaTime;

    // 检测地面碰撞
    const groundCollision = this.checkGroundCollision(character);
    if (groundCollision.isColliding && groundCollision.groundY !== null) {
      character.y = groundCollision.groundY;
      character.velocityY = 0;
    }

    // 检测边界
    this.checkBoundaryCollision(character);
  }

  /**
   * 检测角色是否在地面
   */
  isOnGround(character: Character): boolean {
    const groundY = this.map.getGroundBelow(character.x, character.y - 1);
    return character.y <= groundY + 5; // 5像素容差
  }

  /**
   * 检测地面碰撞
   */
  checkGroundCollision(character: Character): CollisionResult {
    const groundLevel = this.map.getGroundBelow(character.x, character.y);

    if (character.y >= groundLevel) {
      return {
        isColliding: true,
        groundY: groundLevel,
        hitPlatform: this.isOnPlatform(character),
      };
    }

    return {
      isColliding: false,
      groundY: null,
      hitPlatform: false,
    };
  }

  /**
   * 检测角色是否在平台上
   */
  isOnPlatform(character: Character): boolean {
    const platforms = this.map.getPlatforms();
    const charBottom = character.y;
    const charLeft = character.x - PHYSICS.CHARACTER_SIZE / 2;
    const charRight = character.x + PHYSICS.CHARACTER_SIZE / 2;

    for (const platform of platforms) {
      const platLeft = platform.x * PHYSICS.UNIT_SIZE;
      const platRight = platLeft + platform.width * PHYSICS.UNIT_SIZE;
      const platTop = platform.y * PHYSICS.UNIT_SIZE;

      // 检查角色底部是否在平台上方
      if (charBottom <= platTop + 5 && charBottom >= platTop - 5) {
        // 检查角色是否在平台水平范围内
        if (charRight >= platLeft && charLeft <= platRight) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检测边界碰撞
   */
  checkBoundaryCollision(character: Character): void {
    const mapWidth = this.map.getMapWidth();

    // 左边界
    if (character.x < PHYSICS.CHARACTER_SIZE / 2) {
      character.x = PHYSICS.CHARACTER_SIZE / 2;
      character.velocityX = 0;
    }

    // 右边界
    if (character.x > mapWidth - PHYSICS.CHARACTER_SIZE / 2) {
      character.x = mapWidth - PHYSICS.CHARACTER_SIZE / 2;
      character.velocityX = 0;
    }

    // 上边界（限制跳跃高度）
    if (character.y > this.map['screenHeight'] + 100) {
      character.y = this.map['screenHeight'] + 100;
      character.velocityY = 0;
    }
  }

  /**
   * 角色跳跃
   */
  jump(character: Character): boolean {
    if (this.isOnGround(character)) {
      character.velocityY = PHYSICS.JUMP_VELOCITY;
      return true;
    }
    return false;
  }

  /**
   * 角色移动
   */
  move(character: Character, direction: number): void {
    // direction: -1 左, 0 停止, 1 右
    if (direction !== 0) {
      character.velocityX = direction * PHYSICS.MOVE_SPEED;
      character.setDirection(direction > 0 ? CharacterDirection.RIGHT : CharacterDirection.LEFT);
    }
  }

  /**
   * 角色冲刺（用于技能）
   */
  dash(character: Character, distance: number): void {
    const direction = character.direction === CharacterDirection.RIGHT ? 1 : -1;
    character.velocityX = direction * PHYSICS.DASH_SPEED;
    // 冲刺期间设置无敌
    character.setInvincible(true);
    // 计算冲刺持续时间
    const dashTime = distance / PHYSICS.DASH_SPEED;
    setTimeout(() => {
      character.velocityX = 0;
      character.setInvincible(false);
    }, dashTime * 1000);
  }

  /**
   * 检测两个角色之间的攻击碰撞
   */
  checkAttackCollision(
    attacker: Character,
    defender: Character,
    attackRange: number
  ): boolean {
    // 计算两个角色之间的距离
    const distance = Math.abs(attacker.x - defender.x);

    // 检查是否在攻击范围内
    if (distance > attackRange) {
      return false;
    }

    // 检查攻击方向是否正确
    const isFacingDefender =
      (attacker.direction === CharacterDirection.RIGHT && attacker.x < defender.x) ||
      (attacker.direction === CharacterDirection.LEFT && attacker.x > defender.x);

    return isFacingDefender;
  }

  /**
   * 计算两点之间的距离
   */
  getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 检测两个角色是否碰撞
   */
  checkCharacterCollision(char1: Character, char2: Character): boolean {
    const distance = this.getDistance(char1.x, char1.y, char2.x, char2.y);
    return distance < PHYSICS.CHARACTER_SIZE;
  }

  /**
   * 分离碰撞的角色
   */
  separateCharacters(char1: Character, char2: Character): void {
    const distance = this.getDistance(char1.x, char1.y, char2.x, char2.y);
    if (distance >= PHYSICS.CHARACTER_SIZE) return;

    const overlap = PHYSICS.CHARACTER_SIZE - distance;
    const dx = char2.x - char1.x;

    if (distance === 0) {
      // 如果角色完全重叠，随机分开
      char1.x -= overlap / 2;
      char2.x += overlap / 2;
    } else {
      // 根据距离比例分开
      const ratio = overlap / distance / 2;
      char1.x -= dx * ratio;
      char2.x += dx * ratio;
    }
  }
}
