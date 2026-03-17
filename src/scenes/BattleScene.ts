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
import { BattleMap } from '../core/BattleMap';
import { SkillButton } from '../ui/SkillButton';
import { AttackButton } from '../ui/AttackButton';

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

  // 地图
  private battleMap: BattleMap;

  // UI控件
  private joystick: Joystick;
  private backButton: Button;
  
  // 攻击和技能按钮（类似王者荣耀布局）
  private attackButton!: AttackButton; // 使用明确赋值断言
  private skillButtons: SkillButton[] = [];

  // 角色移动速度（像素/秒）
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

    // 初始化地图（默认使用第一个地图）
    this.battleMap = new BattleMap('plain', width, height);

    // 初始化角色
    const playerId = (data?.playerCharacter as CharacterId) || CharacterId.BERSERKER;
    this.playerCharacter = new Character(playerId);

    // 设置初始位置（使用地图系统计算）
    const mapWidth = 100 * 60; // 地图宽度100单位 × 60像素/单位 = 6000像素
    const initialX = mapWidth / 2; // 地图中心
    // 角色在地面站立，Y坐标应该为地面高度（世界坐标）
    const groundHeight = this.battleMap.getGroundHeight(); // 世界坐标的地面高度
    this.playerCharacter.setPosition(initialX, groundHeight);
    this.playerCharacter.setGroundY(groundHeight); // 设置地面Y坐标（世界坐标）
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

    // 初始化攻击和技能按钮（类似王者荣耀布局）
    this.initAttackAndSkillButtons();
  }

  /**
   * 处理返回按钮
   */
  private handleBack(): void {
    gameState.setState(GameState.HOME);
  }

  /**
   * 处理技能释放
   */
  private handleSkill(skillId: string): void {
    console.log(`释放技能: ${skillId}`);
    
    // 找到对应的技能按钮
    const skillButton = this.skillButtons.find(btn => btn.getSkillId() === skillId);
    if (skillButton && !skillButton.isCoolingDown()) {
      // 触发技能冷却
      skillButton.trigger();
      
      // 根据技能ID执行不同的技能效果
      switch (skillId) {
      case 'skill1':
        this.executeSkill1();
        break;
      case 'skill2':
        this.executeSkill2();
        break;
      case 'skill3':
        this.executeSkill3();
        break;
      }
    }
  }

  /**
   * 处理攻击按钮按下
   */
  private handleAttackButtonPress(): void {
    console.log('攻击按钮按下');
    this.attackButton.setPressed(true);
  }

  /**
   * 处理攻击（由update方法调用）
   */
  private handleAttack(): void {
    console.log('执行攻击');
    // 这里可以添加攻击逻辑，比如创建攻击动画、检测敌人等
  }

  /**
   * 技能1：基础攻击增强
   */
  private executeSkill1(): void {
    console.log('执行技能1：基础攻击增强');
    // 这里可以添加技能1的效果，比如增加攻击力、播放特效等
  }

  /**
   * 技能2：范围攻击
   */
  private executeSkill2(): void {
    console.log('执行技能2：范围攻击');
    // 这里可以添加技能2的效果
  }

  /**
   * 技能3：终极技能
   */
  private executeSkill3(): void {
    console.log('执行技能3：终极技能');
    // 这里可以添加技能3的效果
  }

  /**
   * 初始化攻击和技能按钮（类似王者荣耀布局）
   */
  private initAttackAndSkillButtons(): void {
    const buttonSize = 70; // 技能按钮大小
    const attackButtonSize = 90; // 攻击按钮更大
    const bottomPadding = 30; // 底部间距

    // 攻击按钮 - 右下角中心位置
    const attackButtonX = this.width - attackButtonSize - 60;
    const attackButtonY = this.height - attackButtonSize - bottomPadding;
    
    this.attackButton = new AttackButton({
      x: attackButtonX,
      y: attackButtonY,
      size: attackButtonSize,
      icon: '攻',
      color: '#ff6b6b',
    });

    // 技能按钮配置（不同颜色和图标）
    const skillConfigs = [
      { skillId: 'skill1', icon: '1', color: '#4a90d9', cooldown: 3 },
      { skillId: 'skill2', icon: '2', color: '#34c759', cooldown: 5 },
      { skillId: 'skill3', icon: '3', color: '#ff9500', cooldown: 8 },
    ];

    // 按钮大小已定义，直接使用
    
    // 技能1 - 左下（攻击按钮左下方）
    const skill1Button = new SkillButton({
      x: attackButtonX - buttonSize - 20,
      y: attackButtonY - buttonSize + 70,
      size: buttonSize,
      skillId: skillConfigs[0].skillId,
      icon: skillConfigs[0].icon,
      color: skillConfigs[0].color,
      cooldown: skillConfigs[0].cooldown,
    });
    this.skillButtons.push(skill1Button);
    this.touchManager.addComponent(skill1Button, () => {
      this.handleSkill(skillConfigs[0].skillId);
    });
    
    // 技能2 - 中上（在技能1上方）
    const skill2Button = new SkillButton({
      x: attackButtonX - buttonSize + 20,
      y: attackButtonY - buttonSize,
      size: buttonSize,
      skillId: skillConfigs[1].skillId,
      icon: skillConfigs[1].icon,
      color: skillConfigs[1].color,
      cooldown: skillConfigs[1].cooldown,
    });
    this.skillButtons.push(skill2Button);
    this.touchManager.addComponent(skill2Button, () => {
      this.handleSkill(skillConfigs[1].skillId);
    });
    
    // 技能3 - 左上（在技能2左侧）
    const skill3Button = new SkillButton({
      x: attackButtonX - buttonSize + 100,
      y: attackButtonY - buttonSize - 15,
      size: buttonSize,
      skillId: skillConfigs[2].skillId,
      icon: skillConfigs[2].icon,
      color: skillConfigs[2].color,
      cooldown: skillConfigs[2].cooldown,
    });
    this.skillButtons.push(skill3Button);
    this.touchManager.addComponent(skill3Button, () => {
      this.handleSkill(skillConfigs[2].skillId);
    });
    
    // 注册攻击按钮触摸事件
    this.touchManager.addComponent(this.attackButton, () => {
      this.handleAttackButtonPress();
    });
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

      // 边界限制（使用地图宽度，考虑角色宽度）
      const mapWidth = 100 * 60; // 地图宽度100单位 × 60像素/单位
      const characterWidth = 100; // 角色宽度（像素）
      const minX = characterWidth / 2; // 地图左边界，角色左边缘不超出
      const maxX = mapWidth - characterWidth / 2; // 地图右边界，角色右边缘不超出
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

    // 更新摄像机位置（跟随玩家）
    this.battleMap.updateCamera(this.playerCharacter.x);

    // 更新渲染器动画
    this.playerRenderer.update(deltaTime);

    // 更新技能按钮冷却状态
    for (const skillButton of this.skillButtons) {
      skillButton.update();
    }

    // 更新攻击按钮状态，如果攻击按钮被按下则执行攻击
    if (this.attackButton.update()) {
      this.handleAttack();
    }
  }

  /**
   * 渲染场景
   */
  render(): void {
    const ctx = this.ctx;

    // 清空画布
    ctx.clearRect(0, 0, this.width, this.height);

    // 渲染地图（包括背景、地面、平台、装饰物）
    this.battleMap.render(ctx);

    // 渲染角色
    this.renderCharacter();

    // 渲染UI
    this.renderUI();
  }

  /**
   * 渲染角色
   */
  private renderCharacter(): void {
    const ctx = this.ctx;
    const character = this.playerCharacter;
    const config = CHARACTERS[character.id];
    const size = 100;

    // 使用地图系统将世界坐标转换为屏幕坐标
    const screenPos = this.battleMap.worldToScreen(character.x, character.y);

    ctx.save();

    // 根据方向翻转
    if (character.direction === CharacterDirection.LEFT) {
      // 向左时，需要先移动到角色中心，翻转，再移回
      // character.y是脚底位置，角色高度是size，脚底在底部
      ctx.translate(screenPos.x, screenPos.y - size);
      ctx.translate(size * 0.5, size * 0.5); // 移到角色中心
      ctx.scale(-1, 1); // 翻转
      ctx.translate(-size * 0.5, -size * 0.5); // 移回原点
    } else {
      // 向右时正常绘制
      ctx.translate(screenPos.x, screenPos.y - size);
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

    // 渲染攻击和技能按钮
    this.renderAttackAndSkillButtons();

    // 显示角色信息
    this.drawCharacterInfo();
  }

  /**
   * 渲染攻击和技能按钮
   */
  private renderAttackAndSkillButtons(): void {
    // 渲染技能按钮
    for (const skillButton of this.skillButtons) {
      skillButton.draw(this.ctx);
    }

    // 渲染攻击按钮
    this.attackButton.draw(this.ctx);
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

    // 调试信息：显示角色位置和边界
    ctx.fillStyle = '#ff9900';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`角色X: ${Math.round(this.playerCharacter.x)}`, 20, this.height - 60);
    ctx.fillText(`角色Y: ${Math.round(this.playerCharacter.y)}`, 20, this.height - 40);
    ctx.fillText(`摄像机: ${Math.round(this.battleMap.getCameraX())}`, 20, this.height - 20);
  }

  /**
   * 销毁场景
   */
  destroy(): void {
    this.touchManager.destroyScene(this.sceneId);
    this.joystick.destroy();
  }
}
