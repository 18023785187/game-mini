import { gameState, GameState } from '../core/GameState';
import { Button, TouchManager, TouchPoint } from '../ui/Button';
import {
  roomService,
  Room,
  Player,
  PlayerStatus,
} from '../services/RoomService';

/**
 * 席位配置
 */
interface SeatConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 微信触摸事件类型
 */
interface WxTouchEvent {
  changedTouches: Array<{ clientX: number; clientY: number }>;
}

/**
 * 房间场景
 */
export class RoomScene {
  private ctx: CanvasRenderingContext2D;
  private touchManager: TouchManager;
  private sceneId: symbol;
  private width: number;
  private height: number;
  private animationTime: number = 0;
  private room: Room | null = null;
  private isHost: boolean = false;
  private seatTouchHandler: ((e: WxTouchEvent) => void) | null = null;

  // UI元素
  private readyButton: Button;
  private backButton: Button;

  // 席位配置
  private seat1Config: SeatConfig;
  private seat2Config: SeatConfig;

  constructor(
    ctx: CanvasRenderingContext2D,
    touchManager: TouchManager,
    width: number,
    height: number,
    roomId?: string
  ) {
    this.ctx = ctx;
    this.touchManager = touchManager;
    this.width = width;
    this.height = height;

    // 创建并激活场景
    this.sceneId = this.touchManager.createScene();
    this.touchManager.switchScene(this.sceneId);

    // 计算席位位置（优化后的百分比布局）
    const seatWidth = width * 0.42;
    const seatHeight = height * 0.38;
    const seatGap = width * 0.04;
    const seatStartX = (width - seatWidth * 2 - seatGap) / 2;
    const seatY = height * 0.35;  // 下移避免遮挡标题

    this.seat1Config = {
      x: seatStartX,
      y: seatY,
      width: seatWidth,
      height: seatHeight,
    };

    this.seat2Config = {
      x: seatStartX + seatWidth + seatGap,
      y: seatY,
      width: seatWidth,
      height: seatHeight,
    };

    // 创建按钮
    const buttonWidth = 160;
    const buttonHeight = 55;
    const buttonY = height * 0.78;

    this.readyButton = new Button({
      x: width / 2 - buttonWidth / 2,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: '准备',
      fontSize: 26,
    });

    this.backButton = new Button({
      x: 20,
      y: 20,
      width: 90,
      height: 44,
      text: '返回',
      fontSize: 20,
    });

    // 注册按钮事件
    this.touchManager.addButton(this.readyButton, this.handleReady.bind(this));
    this.touchManager.addButton(this.backButton, this.handleBack.bind(this));

    // 监听房间状态变化
    roomService.addListener(this.handleRoomChange.bind(this));

    // 监听触摸事件（用于席位点击）
    this.setupSeatTouchHandler();

    // 初始化房间
    this.initRoom(roomId);
  }

  /**
   * 设置席位触摸处理
   */
  private setupSeatTouchHandler(): void {
    this.seatTouchHandler = (e: WxTouchEvent) => {
      const touch = e.changedTouches[0];
      const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

      // 检查是否点击了空席位
      if (this.isHost && this.room && this.room.players.length < 2) {
        if (this.containsPoint(this.seat2Config, point)) {
          this.handleInvite();
        }
      }
    };
    wx.onTouchEnd(this.seatTouchHandler);
  }

  /**
   * 检测点是否在席位内
   */
  private containsPoint(config: SeatConfig, point: TouchPoint): boolean {
    return (
      point.x >= config.x &&
      point.x <= config.x + config.width &&
      point.y >= config.y &&
      point.y <= config.y + config.height
    );
  }

  /**
   * 初始化房间
   */
  private async initRoom(roomId?: string): Promise<void> {
    try {
      if (roomId) {
        // 加入已有房间
        console.log(`正在加入房间: ${roomId}`);
        this.room = await roomService.joinRoom(roomId);
        this.isHost = false;
        console.log(`成功加入房间: ${roomId}`);
      } else {
        // 创建新房间
        console.log('正在创建新房间');
        this.room = await roomService.createRoom();
        this.isHost = true;
        console.log(`成功创建房间: ${this.room.id}`);
      }
    } catch (error) {
      console.error('初始化房间失败:', error);
      // 显示错误提示
      wx.showModal({
        title: '提示',
        content: roomId ? `加入房间失败: ${error}` : `创建房间失败: ${error}`,
        showCancel: false,
      });
      gameState.setState(GameState.HOME);
    }
  }

  /**
   * 处理房间状态变化
   */
  private handleRoomChange(room: Room): void {
    this.room = room;

    // 检查是否双方都已准备
    if (roomService.isAllReady()) {
      console.log('双方已准备，进入角色选择');
      gameState.setState(GameState.CHARACTER_SELECT);
    }
  }

  /**
   * 处理准备按钮
   */
  private async handleReady(): Promise<void> {
    if (!this.room) return;

    const currentPlayer = this.room.players.find(
      (p) => p.id === roomService.getCurrentPlayerId()
    );

    if (currentPlayer) {
      const newStatus =
        currentPlayer.status === PlayerStatus.NOT_READY
          ? PlayerStatus.READY
          : PlayerStatus.NOT_READY;

      await roomService.updatePlayerStatus(newStatus);
    }
  }

  /**
   * 处理邀请好友
   */
  private handleInvite(): void {
    if (!this.room) return;

    wx.shareAppMessage({
      title: '来和我对战吧！',
      query: `roomId=${this.room.id}`,
    });
  }

  /**
   * 处理返回按钮
   */
  private async handleBack(): Promise<void> {
    await roomService.leaveRoom();
    gameState.setState(GameState.HOME);
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // 更新准备按钮文本
    if (this.room) {
      const currentPlayer = this.room.players.find(
        (p) => p.id === roomService.getCurrentPlayerId()
      );
      if (currentPlayer) {
        this.readyButton.getConfig().text =
          currentPlayer.status === PlayerStatus.READY ? '取消准备' : '准备';
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

    // 绘制房间ID
    this.drawRoomId();

    // 绘制席位
    this.drawSeats();

    // 绘制按钮
    this.backButton.draw(ctx);
    this.readyButton.draw(ctx);
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
    ctx.shadowBlur = 20;

    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('对战房间', width / 2, 60);

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  /**
   * 绘制房间ID
   */
  private drawRoomId(): void {
    const ctx = this.ctx;
    const { width } = this;

    if (!this.room) return;

    ctx.fillStyle = '#ff00ff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`房间号: ${this.room.id}`, width / 2, 100);
  }

  /**
   * 绘制席位
   */
  private drawSeats(): void {
    this.drawSeat(this.seat1Config, this.room?.players[0], '玩家1', false);
    this.drawSeat(this.seat2Config, this.room?.players[1], '空席位', true);
  }

  /**
   * 绘制邀请提示
   */
  private drawInvitePrompt(seatX: number, seatY: number, seatWidth: number, seatHeight: number): void {
    const ctx = this.ctx;
    const centerX = seatX + seatWidth / 2;
    const centerY = seatY + seatHeight / 2 - 10;

    // 绘制加号图标背景光晕
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    glowGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    glowGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();

    // 绘制加号图标
    const iconSize = 50;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // 横线
    ctx.beginPath();
    ctx.moveTo(centerX - iconSize / 2, centerY);
    ctx.lineTo(centerX + iconSize / 2, centerY);
    ctx.stroke();

    // 竖线
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - iconSize / 2);
    ctx.lineTo(centerX, centerY + iconSize / 2);
    ctx.stroke();

    // 提示文字
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('点击邀请好友', centerX, centerY + 55);
  }

  /**
   * 绘制单个席位
   */
  private drawSeat(
    config: SeatConfig,
    player: Player | undefined,
    emptyText: string,
    isSeat2: boolean = false
  ): void {
    const ctx = this.ctx;
    const { x, y, width, height } = config;

    // 席位背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

    // 空席位且有房主权限时，显示高亮边框
    const canInvite = !player && isSeat2 && this.isHost && this.room && this.room.players.length < 2;
    if (canInvite) {
      // 闪烁效果
      const alpha = 0.5 + Math.sin(this.animationTime * 0.005) * 0.3;
      ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
    } else {
      ctx.strokeStyle = player ? '#00ffff' : 'rgba(255, 255, 255, 0.3)';
    }
    ctx.lineWidth = 2;

    ctx.beginPath();
    this.drawRoundRect(ctx, x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();

    if (player) {
      // 绘制玩家信息
      this.drawPlayerInfo(player, x, y, width, height);
    } else if (canInvite) {
      // 绘制点击邀请提示
      this.drawInvitePrompt(x, y, width, height);
    } else {
      // 绘制空席位提示
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emptyText, x + width / 2, y + height / 2);
    }
  }

  /**
   * 绘制玩家信息
   */
  private drawPlayerInfo(
    player: Player,
    seatX: number,
    seatY: number,
    seatWidth: number,
    seatHeight: number
  ): void {
    const ctx = this.ctx;
    const centerX = seatX + seatWidth / 2;

    // 计算内容区域（留出边距）
    const padding = 15;
    const contentY = seatY + padding;
    const contentHeight = seatHeight - padding * 2;

    // 头像大小根据席位高度动态调整
    const avatarSize = Math.min(70, contentHeight * 0.35);
    const avatarY = contentY + 10;

    // 绘制头像背景光晕
    const gradient = ctx.createRadialGradient(
      centerX, avatarY + avatarSize / 2,
      avatarSize / 4,
      centerX, avatarY + avatarSize / 2,
      avatarSize / 2 + 5
    );
    gradient.addColorStop(0, player.isHost ? 'rgba(255, 107, 107, 0.8)' : 'rgba(78, 205, 196, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制头像占位
    ctx.fillStyle = player.isHost ? '#ff6b6b' : '#4ecdc4';
    ctx.beginPath();
    ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制头像边框
    ctx.strokeStyle = player.isHost ? '#ff8888' : '#6eeee4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 绘制玩家名称
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.nickname, centerX, avatarY + avatarSize + 25);

    // 绘制状态标签背景
    const statusText = player.status === PlayerStatus.READY ? '已准备' : '未准备';
    const statusColor = player.status === PlayerStatus.READY ? '#00ff00' : '#ff6b6b';
    const statusBgColor = player.status === PlayerStatus.READY ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 107, 107, 0.2)';

    const statusY = avatarY + avatarSize + 55;
    const statusWidth = 80;
    const statusHeight = 28;

    // 状态背景
    ctx.fillStyle = statusBgColor;
    ctx.beginPath();
    this.drawRoundRect(ctx, centerX - statusWidth / 2, statusY - statusHeight / 2, statusWidth, statusHeight, 14);
    ctx.fill();

    // 状态边框
    ctx.strokeStyle = statusColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.drawRoundRect(ctx, centerX - statusWidth / 2, statusY - statusHeight / 2, statusWidth, statusHeight, 14);
    ctx.stroke();

    // 状态文字
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(statusText, centerX, statusY);

    // 如果是房主，绘制房主标识
    if (player.isHost) {
      const crownY = avatarY - 8;
      ctx.fillStyle = '#ffd700';
      ctx.font = '16px Arial';
      ctx.fillText('👑', centerX, crownY);
    }
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
    roomService.removeListener(this.handleRoomChange.bind(this));

    // 移除席位触摸监听
    if (this.seatTouchHandler) {
      wx.offTouchEnd(this.seatTouchHandler);
      this.seatTouchHandler = null;
    }
  }
}
