import { gameState, GameState, StateData } from '../core/GameState';
import { Button, TouchManager } from '../ui/Button';
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
 * 角色选择场景 - 手势循环滚动模式
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

  // 滚动相关
  private characterIds: CharacterId[] = [];
  private currentIndex: number = 0;           // 当前居中的角色索引
  private scrollOffset: number = 0;           // 滚动偏移量
  private isDragging: boolean = false;        // 是否正在拖动
  private dragStartX: number = 0;             // 拖动起始X坐标
  private dragStartOffset: number = 0;        // 拖动起始偏移量
  private dragStartTime: number = 0;          // 拖动起始时间
  private lastDragX: number = 0;              // 最后一次拖动X坐标
  private lastDragTime: number = 0;           // 最后一次拖动时间
  private velocity: number = 0;               // 滑动速度
  private targetOffset: number = 0;           // 目标偏移量（用于吸附动画）
  private isAnimating: boolean = false;       // 是否正在执行吸附动画
  private readonly cardWidth: number;         // 卡片宽度

  // 触摸监听器
  private touchStartHandler: ((e: WxTouchEvent) => void) | null = null;
  private touchMoveHandler: ((e: WxTouchEvent) => void) | null = null;
  private touchEndHandler: ((e: WxTouchEvent) => void) | null = null;

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

    // 初始化角色列表
    this.characterIds = getAllCharacterIds();
    this.cardWidth = width * 0.35;

    // 创建按钮
    const buttonWidth = 180;
    const buttonHeight = 60;
    const buttonY = height * 0.78;

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

    // 设置触摸监听
    this.setupTouchHandlers();

    // 双人模式下监听房间状态
    if (this.isMultiPlayer) {
      roomService.addListener(this.handleRoomChange.bind(this));
    }

    // 默认选中第一个角色
    this.selectedCharacter = this.characterIds[0];
  }

  /**
   * 设置触摸监听器
   */
  private setupTouchHandlers(): void {
    // 触摸开始
    this.touchStartHandler = (e: WxTouchEvent) => {
      const touch = e.changedTouches[0];
      this.handleTouchStart(touch.clientX, touch.clientY);
    };

    // 触摸移动
    this.touchMoveHandler = (e: WxTouchEvent) => {
      const touch = e.changedTouches[0];
      this.handleTouchMove(touch.clientX);
    };

    // 触摸结束
    this.touchEndHandler = () => {
      this.handleTouchEnd();
    };

    wx.onTouchStart(this.touchStartHandler);
    wx.onTouchMove(this.touchMoveHandler);
    wx.onTouchEnd(this.touchEndHandler);
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(x: number, _y: number): void {
    this.isDragging = true;
    this.dragStartX = x;
    this.dragStartOffset = this.scrollOffset;
    this.dragStartTime = Date.now();
    this.lastDragX = x;
    this.lastDragTime = this.dragStartTime;
    this.velocity = 0;
    this.isAnimating = false;
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(x: number): void {
    if (!this.isDragging) return;

    const now = Date.now();
    const deltaX = x - this.lastDragX;
    const deltaTime = now - this.lastDragTime;
    
    // 计算实时速度（像素/毫秒）
    if (deltaTime > 0) {
      this.velocity = deltaX / deltaTime;
    }

    this.lastDragX = x;
    this.lastDragTime = now;

    // 计算总偏移量
    const totalDeltaX = x - this.dragStartX;
    // 增加灵敏度：滑动的像素距离直接映射到卡片切换
    const offsetDelta = totalDeltaX / (this.cardWidth * 1.2);
    
    // 更新滚动偏移
    this.scrollOffset = this.dragStartOffset - offsetDelta;
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    // 获取起始位置的整数索引
    const startPosition = Math.round(this.dragStartOffset);
    
    // 计算当前滑动距离
    const dragged = this.scrollOffset - this.dragStartOffset;
    
    // 判断应该吸附到哪个位置（最多只能切换一个角色）
    let targetInteger: number;
    
    const speed = Math.abs(this.velocity);
    
    if (speed > 0.3) {
      // 快速滑动：根据方向切换一个角色
      const direction = this.velocity > 0 ? -1 : 1;
      targetInteger = startPosition + direction;
    } else if (Math.abs(dragged) > 0.25) {
      // 滑动距离超过25%，切换一个角色
      const direction = dragged > 0 ? -1 : 1;
      targetInteger = startPosition + direction;
    } else {
      // 慢速滑动：回到起始位置
      targetInteger = startPosition;
    }
    
    // 开始吸附动画
    this.targetOffset = targetInteger;
    this.isAnimating = true;
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
        this.currentIndex = 0;
        this.scrollOffset = 0;
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

    // 更新吸附动画
    if (this.isAnimating) {
      const diff = this.targetOffset - this.scrollOffset;
      // 使用平滑的动画速度（降低速度让过渡更明显）
      const animationSpeed = 8;
      this.scrollOffset += diff * Math.min(1, deltaTime * animationSpeed);
      
      // 判断动画是否完成
      if (Math.abs(diff) < 0.01) {
        this.scrollOffset = this.targetOffset;
        this.isAnimating = false;
        
        // 动画完成，更新选中的角色
        let mappedIndex = Math.round(this.targetOffset) % this.characterIds.length;
        if (mappedIndex < 0) {
          mappedIndex += this.characterIds.length;
        }
        this.currentIndex = mappedIndex;
        this.selectedCharacter = this.characterIds[mappedIndex];
        console.log('动画完成，选中角色:', this.selectedCharacter);
      }
    }
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

    // 绘制角色卡片（循环滚动）
    this.drawCharacterCards();

    // 绘制指示点
    this.drawIndicators();

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
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 副标题
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial';
    if (this.phase === SelectPhase.PLAYER_SELECT) {
      ctx.fillText('滑动选择你的战斗角色', width / 2, 90);
    } else if (this.phase === SelectPhase.AI_SELECT) {
      ctx.fillText('滑动选择AI控制的角色', width / 2, 90);
    } else if (this.phase === SelectPhase.WAITING) {
      ctx.fillText('等待对方选择...', width / 2, 90);
    }
  }

  /**
   * 绘制所有角色卡片（循环滚动）
   */
  private drawCharacterCards(): void {
    const centerX = this.width / 2;
    const centerY = this.height * 0.50;
    const cardHeight = this.height * 0.38;

    // 计算可见范围的角色索引
    const visibleRange = 2;

    // 使用 floor 避免跳变
    const baseIndex = Math.floor(this.scrollOffset);
    const decimal = this.scrollOffset - baseIndex;

    for (let i = -visibleRange; i <= visibleRange; i++) {
      // 计算虚拟索引
      const virtualIndex = baseIndex + i;
      
      // 循环映射到实际索引
      let actualIndex = virtualIndex % this.characterIds.length;
      if (actualIndex < 0) {
        actualIndex += this.characterIds.length;
      }

      // 计算相对于当前位置的偏移（连续变化，无跳变）
      const positionOffset = i - decimal;
      
      // 根据位置计算缩放和透明度
      const absOffset = Math.abs(positionOffset);
      
      // 使用平滑的缩放曲线
      const scale = 1 - absOffset * 0.2;
      const alpha = 1 - absOffset * 0.4;

      // 跳过太小或太透明的卡片
      if (scale < 0.3 || alpha < 0.1) continue;

      // 计算 X 位置
      const spacing = this.cardWidth * 0.85;
      const x = centerX + positionOffset * spacing;

      // 获取角色配置
      const characterId = this.characterIds[actualIndex];
      const character = CHARACTERS[characterId];
      const isSelected = absOffset < 0.25;

      // 绘制卡片
      this.drawCharacterCard(
        character,
        x,
        centerY,
        this.cardWidth * scale,
        cardHeight * scale,
        alpha,
        isSelected
      );
    }
  }

  /**
   * 绘制单个角色卡片
   */
  private drawCharacterCard(
    character: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number,
    alpha: number,
    isSelected: boolean
  ): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = alpha;

    // 卡片背景
    const bgGradient = ctx.createLinearGradient(x - cardWidth/2, y - cardHeight/2, x - cardWidth/2, y + cardHeight/2);
    bgGradient.addColorStop(0, 'rgba(30, 30, 50, 0.9)');
    bgGradient.addColorStop(1, 'rgba(20, 20, 40, 0.9)');
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    this.drawRoundRect(ctx, x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 12);
    ctx.fill();

    // 卡片边框
    const borderColor = isSelected ? character.color : 'rgba(255, 255, 255, 0.3)';
    const borderWidth = isSelected ? 3 : 1;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    this.drawRoundRect(ctx, x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 12);
    ctx.stroke();

    // 选中发光效果
    if (isSelected) {
      ctx.shadowColor = character.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      this.drawRoundRect(ctx, x - cardWidth/2, y - cardHeight/2, cardWidth, cardHeight, 12);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // 绘制角色图标
    const iconSize = Math.min(cardWidth, cardHeight) * 0.45;
    this.characterRenderer.drawPreview(character, x, y - cardHeight * 0.08, iconSize);

    // 绘制角色名字
    ctx.fillStyle = character.color;
    ctx.font = `bold ${Math.round(cardWidth * 0.07)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(character.name, x, y + cardHeight * 0.27);

    // 绘制角色类型
    ctx.fillStyle = '#aaaaaa';
    ctx.font = `${Math.round(cardWidth * 0.055)}px Arial`;
    ctx.fillText(
      character.type === 'melee' ? '近战型' : '远程型',
      x,
      y + cardHeight * 0.42
    );

    ctx.restore();
  }

  /**
   * 绘制指示点
   */
  private drawIndicators(): void {
    const ctx = this.ctx;
    const count = this.characterIds.length;
    const indicatorRadius = 6;
    const indicatorSpacing = 20;
    const totalWidth = (count - 1) * indicatorSpacing;
    const startX = this.width / 2 - totalWidth / 2;
    const y = this.height * 0.74;

    // 使用 scrollOffset 计算当前选中的索引，保证动画连续
    const currentSelectedIndex = Math.round(this.scrollOffset) % count;
    const normalizedIndex = currentSelectedIndex < 0 ? currentSelectedIndex + count : currentSelectedIndex;

    for (let i = 0; i < count; i++) {
      const x = startX + i * indicatorSpacing;
      const isSelected = i === normalizedIndex;

      ctx.beginPath();
      ctx.arc(x, y, indicatorRadius, 0, Math.PI * 2);
      
      if (isSelected) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 0;
      }
      
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    // 重置阴影颜色，避免影响其他场景
    ctx.shadowColor = 'transparent';
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

    // 移除触摸监听
    if (this.touchStartHandler) {
      wx.offTouchStart(this.touchStartHandler);
      this.touchStartHandler = null;
    }
    if (this.touchMoveHandler) {
      wx.offTouchMove(this.touchMoveHandler);
      this.touchMoveHandler = null;
    }
    if (this.touchEndHandler) {
      wx.offTouchEnd(this.touchEndHandler);
      this.touchEndHandler = null;
    }

    // 双人模式下移除房间监听
    if (this.isMultiPlayer) {
      roomService.removeListener(this.handleRoomChange.bind(this));
    }
  }
}
