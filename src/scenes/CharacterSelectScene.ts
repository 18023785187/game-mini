import { gameState, GameState, StateData } from '../core/GameState';
import { Button, TouchManager, TouchPoint } from '../ui/Button';
import {
  CharacterId,
  CharacterConfig,
  CHARACTERS,
  getAllCharacterIds,
} from '../types/Character';
import { roomService } from '../services/RoomService';
import { CharacterRenderer } from '../renderers/CharacterRenderer';

/**
 * 选择阶段
 */
enum SelectPhase {
  PLAYER_SELECT = 'player_select',     // 玩家选择自己的角色
  AI_SELECT = 'ai_select',             // 单人模式：选择AI角色
  WAITING = 'waiting',                 // 双人模式：等待对方选择
  READY = 'ready',                     // 选择完成
}

/**
 * 微信触摸事件类型
 */
interface WxTouchEvent {
  changedTouches: Array<{ clientX: number; clientY: number }>;
}

/**
 * 角色卡片配置
 */
interface CardConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 角色选择场景
 */
export class CharacterSelectScene {
  private ctx: CanvasRenderingContext2D;
  private touchManager: TouchManager;
  private sceneId: symbol;
  private width: number;
  private height: number;
  private animationTime: number = 0;
  private characterRenderer: CharacterRenderer;

  // 模式相关
  private isMultiPlayer: boolean;
  private phase: SelectPhase = SelectPhase.PLAYER_SELECT;

  // 选择状态
  private selectedCharacter: CharacterId | null = null;
  private _aiCharacter: CharacterId | null = null;  // 单人模式AI角色（对战场景使用）
  private _opponentCharacter: CharacterId | null = null;  // 双人模式对方角色（对战场景使用）

  // UI元素
  private confirmButton: Button;
  private backButton: Button;
  private cardConfigs: CardConfig[] = [];

  // 触摸监听器
  private cardTouchHandler: ((e: WxTouchEvent) => void) | null = null;

  constructor(
    ctx: CanvasRenderingContext2D,
    touchManager: TouchManager,
    width: number,
    height: number,
    _data?: StateData
  ) {
    this.ctx = ctx;
    this.touchManager = touchManager;
    this.width = width;
    this.height = height;

    // 初始化角色渲染器
    this.characterRenderer = new CharacterRenderer(ctx);

    // 判断模式：如果有房间信息则为双人模式
    this.isMultiPlayer = !!roomService.getCurrentRoom();

    // 创建并激活场景
    this.sceneId = this.touchManager.createScene();
    this.touchManager.switchScene(this.sceneId);

    // 计算卡片位置
    this.calculateCardPositions();

    // 创建按钮
    const buttonWidth = 180;
    const buttonHeight = 60;
    const buttonY = height * 0.80;

    this.confirmButton = new Button({
      x: width / 2 - buttonWidth / 2,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: '确认选择',
      fontSize: 28,
      backgroundColor: '#44aa44',
    });

    this.backButton = new Button({
      x: 25,
      y: 25,
      width: 100,
      height: 50,
      text: '返回',
      fontSize: 22,
    });

    // 注册按钮事件
    this.touchManager.addButton(this.confirmButton, this.handleConfirm.bind(this));
    
    // 单人模式才显示返回按钮
    if (!this.isMultiPlayer) {
      this.touchManager.addButton(this.backButton, this.handleBack.bind(this));
    }

    // 设置卡片触摸监听
    this.setupCardTouchHandler();

    // 双人模式下监听房间状态
    if (this.isMultiPlayer) {
      roomService.addListener(this.handleRoomChange.bind(this));
    }
  }

  /**
   * 计算角色卡片位置
   */
  private calculateCardPositions(): void {
    const cardWidth = this.width * 0.28;
    const cardHeight = this.height * 0.48;
    const gap = this.width * 0.04;
    const startX = (this.width - cardWidth * 3 - gap * 2) / 2;
    const startY = this.height * 0.28;

    const characterIds = getAllCharacterIds();
    this.cardConfigs = characterIds.map((_id, index) => ({
      x: startX + (cardWidth + gap) * index,
      y: startY,
      width: cardWidth,
      height: cardHeight,
    }));
  }

  /**
   * 设置卡片触摸监听
   */
  private setupCardTouchHandler(): void {
    this.cardTouchHandler = (e: WxTouchEvent) => {
      const touch = e.changedTouches[0];
      const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

      // 检查点击了哪个卡片
      for (let i = 0; i < this.cardConfigs.length; i++) {
        if (this.containsPoint(this.cardConfigs[i], point)) {
          const characterIds = getAllCharacterIds();
          this.handleCardSelect(characterIds[i]);
          break;
        }
      }
    };
    wx.onTouchEnd(this.cardTouchHandler);
  }

  /**
   * 检测点是否在卡片内
   */
  private containsPoint(config: CardConfig, point: TouchPoint): boolean {
    return (
      point.x >= config.x &&
      point.x <= config.x + config.width &&
      point.y >= config.y &&
      point.y <= config.y + config.height
    );
  }

  /**
   * 处理角色卡片选择
   */
  private handleCardSelect(characterId: CharacterId): void {
    this.selectedCharacter = characterId;
    console.log(`选择了角色: ${CHARACTERS[characterId].name}`);
  }

  /**
   * 处理房间状态变化（双人模式）
   */
  private handleRoomChange(): void {
    // TODO: 实现双人模式角色同步
    // 需要在RoomService中添加角色选择字段
  }

  /**
   * 处理确认按钮
   */
  private async handleConfirm(): Promise<void> {
    if (!this.selectedCharacter) {
      wx.showToast({ title: '请先选择角色', icon: 'none' });
      return;
    }

    if (this.phase === SelectPhase.PLAYER_SELECT) {
      if (this.isMultiPlayer) {
        // 双人模式：发送选择并等待对方
        // TODO: 实现双人模式选择同步
        console.log('双人模式：等待对方选择');
        this.phase = SelectPhase.WAITING;
      } else {
        // 单人模式：进入AI选择阶段
        this.phase = SelectPhase.AI_SELECT;
        this.selectedCharacter = null;
        this.confirmButton.getConfig().text = '开始对战';
      }
    } else if (this.phase === SelectPhase.AI_SELECT) {
      // 单人模式：AI角色已选择，开始对战
      if (this.selectedCharacter) {
        this._aiCharacter = this.selectedCharacter;
        this.startBattle();
      }
    }
  }

  /**
   * 开始对战
   */
  private startBattle(): void {
    console.log('开始对战');
    // TODO: 进入对战场景
    wx.showToast({ title: '对战功能开发中...', icon: 'none' });
  }

  /**
   * 处理返回按钮
   */
  private handleBack(): void {
    if (this.isMultiPlayer) {
      // 双人模式返回房间
      gameState.setState(GameState.ROOM);
    } else {
      // 单人模式返回首页
      gameState.setState(GameState.HOME);
    }
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
    this.characterRenderer.update(deltaTime);
  }

  /**
   * 渲染场景
   */
  render(): void {
    const ctx = this.ctx;
    const { width, height } = this;

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制装饰性网格
    this.drawGrid();

    // 绘制标题
    this.drawTitle();

    // 绘制角色卡片
    this.drawCharacterCards();

    // 绘制按钮
    // 单人模式才显示返回按钮
    if (!this.isMultiPlayer) {
      this.backButton.draw(ctx);
    }
    this.confirmButton.draw(ctx);
  }

  /**
   * 绘制装饰性网格
   */
  private drawGrid(): void {
    const ctx = this.ctx;
    const { width, height } = this;

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // 绘制垂直线
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * 绘制标题
   */
  private drawTitle(): void {
    const ctx = this.ctx;
    const { width } = this;

    // 标题发光效果
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 25;

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let title = '选择角色';
    if (this.phase === SelectPhase.AI_SELECT) {
      title = '选择AI对手';
    }

    ctx.fillText(title, width / 2, 55);

    // 重置阴影
    ctx.shadowBlur = 0;

    // 副标题
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial';
    if (this.phase === SelectPhase.PLAYER_SELECT) {
      ctx.fillText('选择你的战斗角色', width / 2, 90);
    } else if (this.phase === SelectPhase.AI_SELECT) {
      ctx.fillText('选择AI控制的角色', width / 2, 90);
    } else if (this.phase === SelectPhase.WAITING) {
      ctx.fillText('等待对方选择...', width / 2, 90);
    }
  }

  /**
   * 绘制所有角色卡片
   */
  private drawCharacterCards(): void {
    const characterIds = getAllCharacterIds();
    characterIds.forEach((characterId, index) => {
      this.drawCharacterCard(characterId, this.cardConfigs[index]);
    });
  }

  /**
   * 绘制单个角色卡片
   */
  private drawCharacterCard(characterId: CharacterId, config: CardConfig): void {
    const ctx = this.ctx;
    const character = CHARACTERS[characterId];
    const { x, y, width: cardWidth, height: cardHeight } = config;
    const isSelected = this.selectedCharacter === characterId;

    // 卡片背景
    const bgGradient = ctx.createLinearGradient(x, y, x, y + cardHeight);
    bgGradient.addColorStop(0, 'rgba(30, 30, 50, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 20, 40, 0.9)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    this.drawRoundRect(ctx, x, y, cardWidth, cardHeight, 12);
    ctx.fill();

    // 卡片边框
    const borderColor = isSelected ? character.color : 'rgba(255, 255, 255, 0.3)';
    const borderWidth = isSelected ? 3 : 1;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    this.drawRoundRect(ctx, x, y, cardWidth, cardHeight, 12);
    ctx.stroke();

    // 选中发光效果
    if (isSelected) {
      ctx.shadowColor = character.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      this.drawRoundRect(ctx, x, y, cardWidth, cardHeight, 12);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 绘制角色图标和名字
    this.drawCharacterIcon(character, x, y, cardWidth, cardHeight);

    // 绘制角色名字
    this.drawCharacterName(character, x, y, cardWidth, cardHeight);
  }

  /**
   * 绘制角色图标
   */
  private drawCharacterIcon(
    character: CharacterConfig,
    cardX: number,
    cardY: number,
    cardWidth: number,
    cardHeight: number
  ): void {
    const centerX = cardX + cardWidth / 2;
    const centerY = cardY + cardHeight * 0.45;
    const iconSize = Math.min(cardWidth, cardHeight) * 0.5;

    // 使用角色渲染器绘制预览
    this.characterRenderer.drawPreview(character, centerX, centerY, iconSize);
  }

  /**
   * 绘制角色名字
   */
  private drawCharacterName(
    character: CharacterConfig,
    cardX: number,
    cardY: number,
    cardWidth: number,
    cardHeight: number
  ): void {
    const ctx = this.ctx;
    const centerX = cardX + cardWidth / 2;
    const nameY = cardY + cardHeight * 0.85;

    // 角色名称
    ctx.fillStyle = character.color;
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character.name, centerX, nameY);
  }

  /**
   * 绘制圆角矩形路径
   */
  private drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * 销毁场景
   */
  destroy(): void {
    this.touchManager.destroyScene(this.sceneId);

    // 移除卡片触摸监听
    if (this.cardTouchHandler) {
      wx.offTouchEnd(this.cardTouchHandler);
      this.cardTouchHandler = null;
    }

    // 双人模式下移除房间监听
    if (this.isMultiPlayer) {
      roomService.removeListener(this.handleRoomChange.bind(this));
    }
  }
}
