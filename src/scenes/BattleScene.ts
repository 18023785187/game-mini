/**
 * 演示场景
 * 只展示角色移动和UI
 */

import { Character, CharacterDirection, CharacterState } from '../entities/Character';
import { CharacterId, CHARACTERS, CharacterType } from '../types/Character';
import { Joystick } from '../ui/Joystick';
import { CharacterRenderer } from '../renderers/CharacterRenderer';
import { gameState, GameState, StateData } from '../core/GameState';
import { TouchManager, Button } from '../ui/Button';
import { BattleMap } from '../core/BattleMap';
import { SkillButton } from '../ui/SkillButton';
import { AttackButton } from '../ui/AttackButton';
import { Projectile, ProjectileType, ProjectileConfig } from '../entities/Projectile';
import { ProjectileRenderer } from '../renderers/ProjectileRenderer';

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
  private wasCharging: boolean = false; // 上一帧是否在蓄力

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

  // 投射物系统
  private projectiles: Projectile[] = [];
  private projectileRenderer: ProjectileRenderer;
  private lastProjectileTime: number = 0; // 上次发射投射物的时间

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
    
    // 初始化投射物渲染器
    this.projectileRenderer = new ProjectileRenderer();

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
   * 处理技能释放（非蓄力技能）
   */
  private handleSkill(skillId: string): void {
    console.log(`释放技能: ${skillId}`);

    // 找到对应的技能按钮
    const skillButton = this.skillButtons.find(btn => btn.getSkillId() === skillId);
    if (!skillButton) return;

    // 非蓄力技能：点击直接释放
    if (!skillButton.isCoolingDown()) {
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
      }
    }
  }

  /**
   * 处理攻击按钮按下
   */
  private handleAttackButtonPress(): void {
    // 尝试触发攻击
    const success = this.playerCharacter.attack();
    this.attackButton.setPressed(true);

    if (success) {
      console.log(`攻击成功！伤害：${this.playerCharacter.attackDamage}`);
      // 启动按钮冷却
      this.attackButton.startCooldown(this.playerCharacter.attackCooldown * 1000);
      
      // 如果是远程角色，创建投射物
      if (this.playerCharacter.config.type === CharacterType.RANGED) {
        this.createProjectile();
      }
      
      // 攻击成功，攻击动画会自动在renderCharacter中渲染
    } else {
      console.log('攻击冷却中...');
    }
  }

  /**
   * 创建投射物（远程角色专用）
   */
  private createProjectile(): void {
    const currentTime = Date.now();
    
    // 防止重复创建（攻击动画持续期间只创建一次）
    if (currentTime - this.lastProjectileTime < 200) {
      return;
    }
    this.lastProjectileTime = currentTime;

    // 计算投射物发射位置（从射击手的枪口位置发射）
    // 世界坐标系：Y轴向上为正
    // 角色y是脚底位置，枪口在身体上半部分（约向上45像素）
    // 向右时从右手枪口发射（向右偏移），向左时从左手枪口发射（向左偏移）
    const gunOffsetX = this.playerCharacter.direction === CharacterDirection.RIGHT ? 22 : -22;
    const projectileX = this.playerCharacter.x + gunOffsetX;
    const projectileY = this.playerCharacter.y + 45; // 从枪口位置发射（向上偏移，因为Y轴向上为正）

    // 创建投射物配置
    const projectileConfig: ProjectileConfig = {
      type: ProjectileType.BULLET,
      damage: this.playerCharacter.attackDamage,
      speed: 480, // 子弹速度480像素/秒（中等偏快）
      range: this.playerCharacter.attackRange * 60, // 射程转换为像素
      size: 20, // 子弹尺寸增大，使其清晰可见
      color: this.playerCharacter.config.color,
    };

    // 创建投射物
    const projectile = new Projectile(
      projectileX,
      projectileY,
      this.playerCharacter.direction,
      projectileConfig,
      this.playerCharacter.id
    );

    this.projectiles.push(projectile);
    console.log(`创建投射物，位置: (${projectileX}, ${projectileY}), 方向: ${this.playerCharacter.direction}, 速度: ${projectileConfig.speed}`);
  }

  /**
   * 处理攻击（由update方法调用）- 已废弃，直接在按钮按下时触发攻击
   */

  /**
   * 技能1：基础攻击增强（附魔）
   */
  private executeSkill1(): void {
    console.log('执行技能1：基础攻击增强 - 附魔');
    // 触发附魔效果
    this.playerCharacter.enchant(5000); // 附魔持续5秒
    // 更新渲染器的附魔状态
    this.playerRenderer.setEnchanted(true);
  }

  /**
   * 技能2：冲刺挥砍
   */
  private executeSkill2(): void {
    console.log('执行技能2：冲刺挥砍');
    // 触发冲刺
    this.playerCharacter.startDash();
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
      { skillId: 'skill1', icon: '1', color: '#4a90d9', cooldown: 5, isCharging: false },
      { skillId: 'skill2', icon: '2', color: '#34c759', cooldown: 10, isCharging: false },
      { skillId: 'skill3', icon: '3', color: '#ff9500', cooldown: 30, isCharging: true },
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
      isCharging: skillConfigs[0].isCharging,
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
      isCharging: skillConfigs[1].isCharging,
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
      isCharging: skillConfigs[2].isCharging,
      onPress: () => {
        // 按下时开始蓄力
        if (!this.playerCharacter.isCharging && !skill3Button.isCoolingDown()) {
          this.playerCharacter.startCharging();
        }
      },
      onRelease: () => {
        // 松开时释放攻击
        if (this.playerCharacter.isCharging) {
          this.playerCharacter.releaseCharge();

          // 触发技能冷却（仅在释放时触发）
          skill3Button.trigger();

          // 清除渲染器的蓄力状态
          this.playerRenderer.setChargeProgress(0);
        }
      },
    });
    this.skillButtons.push(skill3Button);
    this.touchManager.addComponent(skill3Button, () => {
      // 蓄力技能不使用handleSkill，而是通过onPress/onRelease处理
      if (!skill3Button.isChargingSkill()) {
        this.handleSkill(skillConfigs[2].skillId);
      }
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
    // 攻击时或冲刺时不能移动
    if (joystickState.isMoving && !this.playerCharacter.isAttacking && !this.playerCharacter.isDashing) {
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
    } else if (!this.playerCharacter.isAttacking && !this.playerCharacter.isJumping && !this.playerCharacter.isDashing) {
      // 不在攻击中、跳跃中或冲刺中，设置待机状态
      this.playerCharacter.setState(CharacterState.IDLE);
    }

    // 更新角色状态（重力、跳跃）
    this.playerCharacter.update(deltaTime);

    // 更新摄像机位置（跟随玩家）
    this.battleMap.updateCamera(this.playerCharacter.x);

    // 更新渲染器动画
    this.playerRenderer.update(deltaTime);

    // 更新附魔状态
    this.playerRenderer.setEnchanted(this.playerCharacter.isEnchanted);

    // 同步蓄力进度到渲染器
    // 使用 isCharging 属性判断，而不是 state（因为跳跃蓄力时 state 是 JUMPING）
    if (this.playerCharacter.isCharging) {
      const progress = this.playerCharacter.chargeProgress;
      this.playerRenderer.setChargeProgress(progress);
    } else if (this.playerCharacter.isAttacking && this.playerRenderer.getChargeProgress() > 0) {
      // 攻击状态且有蓄力进度，保持蓄力进度不变（用于蓄力攻击动画）
      // 不做任何操作，保持现有的chargeProgress
    } else {
      // 其他状态清零
      this.playerRenderer.setChargeProgress(0);
    }

    // 检测蓄力状态变化（用于自动释放时的冷却触发）
    if (this.wasCharging && !this.playerCharacter.isCharging) {
      // 从蓄力变为非蓄力，触发技能3冷却
      const skill3Button = this.skillButtons.find(btn => btn.getSkillId() === 'skill3');
      if (skill3Button && !skill3Button.isCoolingDown()) {
        skill3Button.trigger();
      }
    }
    this.wasCharging = this.playerCharacter.isCharging;

    // 更新技能按钮冷却状态
    for (const skillButton of this.skillButtons) {
      skillButton.update();
    }

    // 更新投射物
    this.updateProjectiles(deltaTime);
  }

  /**
   * 更新投射物状态
   */
  private updateProjectiles(deltaTime: number): void {
    // 更新每个投射物
    for (const projectile of this.projectiles) {
      projectile.update(deltaTime);
    }

    // 移除不活跃的投射物
    this.projectiles = this.projectiles.filter(p => p.isActive);
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

    // 渲染投射物
    this.renderProjectiles();

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
    // 注意：跳跃时也可以蓄力和攻击，需要正确处理状态优先级
    if (character.isCharging) {
      // 蓄力状态（包括跳跃蓄力），绘制蓄力动画
      this.playerRenderer.drawBattleCharging(config, size, character.direction, this.playerRenderer.getChargeProgress());
    } else if (character.isDashing) {
      // 冲刺状态，绘制冲刺挥砍动画
      this.playerRenderer.drawBattleDashing(config, size, character.direction, character.dashProgress);
    } else if (character.isAttacking) {
      // 攻击状态（包括跳跃攻击），绘制攻击动画
      const isChargedAttack = this.playerRenderer.getChargeProgress() > 0;
      this.playerRenderer.drawBattleAttacking(config, size, character.direction, character.attackProgress, isChargedAttack);
    } else if (character.state === CharacterState.MOVING || character.isJumping) {
      this.playerRenderer.drawBattleMoving(config, size);
    } else {
      this.playerRenderer.drawBattleIdle(config, size);
    }

    ctx.restore();
  }

  /**
   * 渲染投射物
   */
  private renderProjectiles(): void {
    const ctx = this.ctx;

    for (const projectile of this.projectiles) {
      // 使用地图系统将世界坐标转换为屏幕坐标
      const screenPos = this.battleMap.worldToScreen(projectile.x, projectile.y);

      ctx.save();
      ctx.translate(screenPos.x, screenPos.y);

      // 渲染投射物
      this.projectileRenderer.render(ctx, projectile);

      ctx.restore();
    }
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
    
    // 清理投射物
    this.projectiles = [];
  }
}
