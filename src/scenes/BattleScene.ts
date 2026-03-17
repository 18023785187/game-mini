/**
 * 演示场景
 * 只展示角色移动和UI
 */

import { Character, CharacterDirection, CharacterState } from '../entities/Character';
import { CharacterId, CHARACTERS } from '../types/Character';
import { Joystick } from '../ui/Joystick';
import { CharacterRenderer } from '../renderers/CharacterRenderer';
import { gameState, GameState, StateData } from '../core/GameState';
import { TouchManager, Button } from '../ui/Button';

/**
 * 演示场景
 */
export class BattleScene {
  private ctx: CanvasRenderingContext2D;
  private touchManager: TouchManager;
  private width: number;
  private height: number;
  private sceneId: symbol;

  // 角色
  private playerCharacter: Character;
  private playerRenderer: CharacterRenderer;

  // UI控件
  private joystick: Joystick;
  private backButton: Button;

  // 角色移动速度
  private readonly MOVE_SPEED = 200;

  constructor(
    ctx: CanvasRenderingContext2D,
    touchManager: TouchManager,
    width: number,
    height: number,
    data?: StateData
  ) {
    this.ctx = ctx;
    this.touchManager = touchManager;
    this.width = width;
    this.height = height;

    // 创建场景
    this.sceneId = this.touchManager.createScene();
    this.touchManager.switchScene(this.sceneId);

    // 初始化角色
    const playerId = (data?.playerCharacter as CharacterId) || CharacterId.BERSERKER;
    this.playerCharacter = new Character(playerId);

    // 设置初始位置（地面）
    const groundY = height - 80;
    this.playerCharacter.setPosition(width / 2, groundY);
    this.playerCharacter.setGroundY(groundY); // 设置地面Y坐标
    this.playerCharacter.setDirection(CharacterDirection.RIGHT);

    // 初始化渲染器
    this.playerRenderer = new CharacterRenderer(ctx);

    // 初始化UI控件（摇杆位置）
    const joystickX = 150;
    const joystickY = height - 80;
    this.joystick = new Joystick(joystickX, joystickY, 55);

    this.backButton = new Button({
      x: 20,
      y: 20,
      width: 80,
      height: 40,
      text: '返回',
      fontSize: 18,
      backgroundColor: '#444444',
    });
    this.touchManager.addButton(this.backButton, this.handleBack.bind(this));
  }

  /**
   * 处理返回按钮
   */
  private handleBack(): void {
    gameState.setState(GameState.HOME);
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    // 更新摇杆动画
    this.joystick.update(deltaTime);

    // 更新摇杆状态
    const joystickState = this.joystick.getState();

    // 处理跳跃
    if (joystickState.isJumping) {
      this.playerCharacter.jump();
    }

    // 更新玩家移动
    if (joystickState.isMoving) {
      const moveAmount = joystickState.direction.x * this.MOVE_SPEED * (deltaTime / 1000);

      // 更新位置
      const newX = this.playerCharacter.x + moveAmount;

      // 边界限制
      const minX = 50;
      const maxX = this.width - 50;
      const clampedX = Math.max(minX, Math.min(maxX, newX));

      this.playerCharacter.x = clampedX;

      // 设置方向（只有当移动量足够时才设置方向，避免微小抖动）
      if (Math.abs(moveAmount) > 0.1) {
        if (moveAmount > 0) {
          this.playerCharacter.setDirection(CharacterDirection.RIGHT);
        } else {
          this.playerCharacter.setDirection(CharacterDirection.LEFT);
        }
        if (!this.playerCharacter.isJumping) {
          this.playerCharacter.setState(CharacterState.MOVING);
        }
      }
    } else {
      if (!this.playerCharacter.isJumping) {
        this.playerCharacter.setState(CharacterState.IDLE);
      }
    }

    // 更新角色状态（重力、跳跃）
    this.playerCharacter.update(deltaTime);

    // 更新渲染器动画
    this.playerRenderer.update(deltaTime);
  }

  /**
   * 渲染场景
   */
  render(): void {
    const ctx = this.ctx;

    // 清空画布
    ctx.clearRect(0, 0, this.width, this.height);

    // 绘制背景
    this.drawBackground();

    // 绘制地面
    this.drawGround();

    // 渲染角色
    this.renderCharacter();

    // 渲染UI
    this.renderUI();
  }

  /**
   * 绘制背景
   */
  private drawBackground(): void {
    const ctx = this.ctx;

    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 装饰性网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }
  }

  /**
   * 绘制地面
   */
  private drawGround(): void {
    const ctx = this.ctx;
    const groundY = this.height - 80;
    const groundHeight = 80;

    // 地面渐变
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, this.height);
    groundGradient.addColorStop(0, '#3d5a80');
    groundGradient.addColorStop(0.3, '#324a65');
    groundGradient.addColorStop(1, '#293241');

    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, this.width, groundHeight);

    // 地面线条
    ctx.strokeStyle = '#548ca8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.width, groundY);
    ctx.stroke();

    // 地面装饰线条（增加层次感）
    ctx.strokeStyle = 'rgba(84, 140, 168, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY + groundHeight * 0.3);
    ctx.lineTo(this.width, groundY + groundHeight * 0.3);
    ctx.stroke();
  }

  /**
   * 渲染角色
   */
  private renderCharacter(): void {
    const ctx = this.ctx;
    const character = this.playerCharacter;
    const config = CHARACTERS[character.id];
    const size = 100;

    ctx.save();

    // 根据方向翻转
    if (character.direction === CharacterDirection.LEFT) {
      // 向左时，需要先移动到角色中心，翻转，再移回
      // character.y是脚底位置，角色高度是size，脚底在底部
      ctx.translate(character.x, character.y - size);
      ctx.translate(size * 0.5, size * 0.5); // 移到角色中心
      ctx.scale(-1, 1); // 翻转
      ctx.translate(-size * 0.5, -size * 0.5); // 移回原点
    } else {
      // 向右时正常绘制
      ctx.translate(character.x, character.y - size);
    }

    // 根据状态绘制角色
    if (character.state === CharacterState.MOVING || character.isJumping) {
      this.playerRenderer.drawBattleMoving(config, size);
    } else {
      this.playerRenderer.drawBattleIdle(config, size);
    }

    ctx.restore();
  }

  /**
   * 渲染UI控件
   */
  private renderUI(): void {
    // 渲染摇杆
    this.joystick.draw(this.ctx);

    // 渲染返回按钮
    this.backButton.draw(this.ctx);

    // 显示角色信息
    this.drawCharacterInfo();
  }

  /**
   * 绘制角色信息
   */
  private drawCharacterInfo(): void {
    const ctx = this.ctx;
    const character = this.playerCharacter;
    const config = CHARACTERS[character.id];

    const infoX = this.width / 2;
    const infoY = 50;

    // 角色名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name, infoX, infoY);

    // 角色类型
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '16px Arial';
    ctx.fillText(config.type === 'melee' ? '近战型' : '远程型', infoX, infoY + 25);
  }

  /**
   * 销毁场景
   */
  destroy(): void {
    this.touchManager.destroyScene(this.sceneId);
    this.joystick.destroy();
  }
}
