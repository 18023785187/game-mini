import { gameState, GameState, StateData } from '../core/GameState';
import { Button, TouchManager } from '../ui/Button';
import {
  CharacterId,
  CharacterConfig,
  CHARACTERS,
  getAllCharacterIds,
} from '../types/Character';
import { CharacterCardRenderer } from '../renderers/CharacterCardRenderer';

/**
 * 选择阶段
 */
enum SelectPhase {
  PLAYER_SELECT = 'player_select',     // 玩家选择角色
  AI_SELECT = 'ai_select',             // AI选择对手
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
  private cardRenderer: CharacterCardRenderer;

  // 模式相关
  private phase: SelectPhase = SelectPhase.PLAYER_SELECT;

  // 选择状态
  private selectedCharacter: CharacterId | null = null;
  private _playerCharacter: CharacterId | null = null;  // 玩家角色
  private _aiCharacter: CharacterId | null = null;     // AI角色

  // UI元素
  private confirmButton: Button;
  private backButton: Button;

  // 滚动相关
  private characterIds: CharacterId[] = [];
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

    // 初始化卡片渲染器
    this.cardRenderer = new CharacterCardRenderer(ctx);

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
    this.touchManager.addButton(this.backButton, this.handleBack.bind(this));

    // 设置触摸监听
    this.setupTouchHandlers();

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
   * 处理确认按钮
   */
  private handleConfirm(): void {
    if (!this.selectedCharacter) {
      wx.showToast({ title: '请先选择角色', icon: 'none' });
      return;
    }

    if (this.phase === SelectPhase.PLAYER_SELECT) {
      // 保存玩家角色，进入AI选择阶段
      this._playerCharacter = this.selectedCharacter;
      this.phase = SelectPhase.AI_SELECT;
      // 重置选择
      this.selectedCharacter = null;
      this.scrollOffset = 0;
      this.velocity = 0;
      this.isAnimating = false;
      wx.showToast({ title: '请选择对手角色', icon: 'none' });
    } else if (this.phase === SelectPhase.AI_SELECT) {
      // 保存AI角色，进入演示场景
      this._aiCharacter = this.selectedCharacter;
      this.startDemo();
    }
  }

  /**
   * 开始演示
   */
  private startDemo(): void {
    console.log('开始演示', '玩家:', this._playerCharacter, '对手:', this._aiCharacter);
    // 传递玩家角色和对手角色到演示场景
    gameState.setState(GameState.PLAYING, {
      playerCharacter: this._playerCharacter,
      aiCharacter: this._aiCharacter,
    });
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
    this.animationTime += deltaTime;
    this.cardRenderer.update(deltaTime);

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

    // 绘制已选角色信息
    this.drawSelectedInfo();

    // 绘制按钮
    this.backButton.draw(ctx);
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

    const title = this.phase === SelectPhase.PLAYER_SELECT ? '选择你的角色' : '选择对手角色';

    ctx.fillText(title, width / 2, 55);

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // 副标题
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '18px Arial';
    const subtitle = this.phase === SelectPhase.PLAYER_SELECT ? '滑动选择你的角色' : '滑动选择对手角色';
    ctx.fillText(subtitle, width / 2, 90);
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
   * 绘制单个角色卡片 - 使用新的炫酷渲染器
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
    this.cardRenderer.drawCard(
      character,
      x,
      y,
      cardWidth,
      cardHeight,
      isSelected,
      alpha
    );
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
   * 绘制已选角色信息
   */
  private drawSelectedInfo(): void {
    const ctx = this.ctx;
    const { width, height } = this;

    if (this._playerCharacter) {
      const playerConfig = CHARACTERS[this._playerCharacter];

      // 绘制玩家角色信息
      ctx.fillStyle = playerConfig.color;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const playerText = `你的角色: ${playerConfig.name}`;
      ctx.fillText(playerText, 25, height * 0.78 - 80);
    }

    if (this.phase === SelectPhase.AI_SELECT && this._playerCharacter) {
      // 绘制对战信息
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const vsText = 'VS';
      ctx.fillText(vsText, width / 2, height * 0.78 - 50);
    }
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
  }
}
