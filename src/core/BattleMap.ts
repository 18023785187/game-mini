/**
 * 地图系统
 * 地图宽度100单位，1单位=60px
 */

/**
 * 平台定义
 */
export interface Platform {
  x: number;        // 左边界位置（单位）
  y: number;        // 底部位置（单位，从下往上）
  width: number;    // 平台宽度（单位）
  height: number;   // 平台高度（单位）
}

/**
 * 地图配置
 */
export interface MapConfig {
  id: string;
  name: string;
  groundY: number;           // 地面高度（单位）
  platforms: Platform[];     // 平台列表
  background: {
    skyColor: string;        // 天空颜色
    groundColor: string;     // 地面颜色
    decorations?: {          // 装饰物
      type: 'cloud' | 'star' | 'moon' | 'sun';
      x: number;
      y: number;
      size: number;
    }[];
  };
}

/**
 * 预定义地图
 */
export const MAPS: MapConfig[] = [
  // 地图1：平地 - 蓝天白云草地
  {
    id: 'plain',
    name: '草原平原',
    groundY: 2,
    platforms: [],
    background: {
      skyColor: '#87CEEB',
      groundColor: '#228B22',
      decorations: [
        { type: 'cloud', x: 15, y: 85, size: 1 },
        { type: 'cloud', x: 40, y: 90, size: 1.2 },
        { type: 'cloud', x: 70, y: 88, size: 0.9 },
        { type: 'sun', x: 85, y: 92, size: 2 },
      ],
    },
  },
  // 地图2：台阶 - 月黑风高
  {
    id: 'stepped',
    name: '暗夜台阶',
    groundY: 2,
    platforms: [
      { x: 15, y: 6, width: 8, height: 2 },
      { x: 35, y: 10, width: 8, height: 2 },
      { x: 55, y: 6, width: 8, height: 2 },
      { x: 75, y: 10, width: 8, height: 2 },
    ],
    background: {
      skyColor: '#0a0a1a',
      groundColor: '#1a1a2a',
      decorations: [
        { type: 'star', x: 10, y: 90, size: 0.5 },
        { type: 'star', x: 25, y: 85, size: 0.3 },
        { type: 'star', x: 45, y: 92, size: 0.4 },
        { type: 'star', x: 60, y: 88, size: 0.3 },
        { type: 'star', x: 80, y: 90, size: 0.5 },
        { type: 'moon', x: 90, y: 88, size: 1.5 },
      ],
    },
  },
];

/**
 * 地图管理器
 */
export class BattleMap {
  private config: MapConfig;
  private unitSize: number = 60;  // 1单位=60px
  private screenWidth: number;
  private screenHeight: number;
  private cameraX: number = 0;    // 摄像机X偏移

  constructor(mapId: string, screenWidth: number, screenHeight: number) {
    this.config = MAPS.find(m => m.id === mapId) || MAPS[0];
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  /**
   * 获取地图配置
   */
  getConfig(): MapConfig {
    return this.config;
  }

  /**
   * 获取地图宽度（像素）
   */
  getMapWidth(): number {
    return 100 * this.unitSize;
  }

  /**
   * 获取地面Y坐标（像素，屏幕坐标）
   */
  getGroundY(): number {
    return this.screenHeight - this.config.groundY * this.unitSize;
  }

  /**
   * 获取所有平台
   */
  getPlatforms(): Platform[] {
    return this.config.platforms;
  }

  /**
   * 更新摄像机位置（跟随玩家）
   */
  updateCamera(playerX: number): void {
    const mapWidth = this.getMapWidth();
    const targetX = playerX - this.screenWidth / 2;

    // 限制摄像机不超出地图边界
    this.cameraX = Math.max(0, Math.min(mapWidth - this.screenWidth, targetX));
  }

  /**
   * 获取摄像机X偏移
   */
  getCameraX(): number {
    return this.cameraX;
  }

  /**
   * 世界坐标转屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX - this.cameraX,
      y: this.screenHeight - worldY,
    };
  }

  /**
   * 渲染地图
   */
  render(ctx: CanvasRenderingContext2D): void {
    const { background, platforms, groundY } = this.config;

    // 绘制天空渐变
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.screenHeight);
    skyGradient.addColorStop(0, background.skyColor);
    skyGradient.addColorStop(0.7, this.lightenColor(background.skyColor, 0.3));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.screenWidth, this.screenHeight);

    // 绘制装饰物（云、星星等）
    this.renderDecorations(ctx);

    // 绘制地面
    const groundScreenY = this.screenHeight - groundY * this.unitSize;
    const groundGradient = ctx.createLinearGradient(0, groundScreenY, 0, this.screenHeight);
    groundGradient.addColorStop(0, background.groundColor);
    groundGradient.addColorStop(1, this.darkenColor(background.groundColor, 0.3));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundScreenY, this.screenWidth, this.screenHeight - groundScreenY);

    // 绘制平台
    for (const platform of platforms) {
      this.renderPlatform(ctx, platform);
    }
  }

  /**
   * 渲染装饰物
   */
  private renderDecorations(ctx: CanvasRenderingContext2D): void {
    const decorations = this.config.background.decorations;
    if (!decorations) return;

    for (const deco of decorations) {
      const screenX = deco.x * this.unitSize - this.cameraX;
      const screenY = this.screenHeight - deco.y * this.unitSize;

      // 只渲染在屏幕范围内的装饰物
      if (screenX < -100 || screenX > this.screenWidth + 100) continue;

      switch (deco.type) {
      case 'cloud':
        this.drawCloud(ctx, screenX, screenY, deco.size);
        break;
      case 'star':
        this.drawStar(ctx, screenX, screenY, deco.size);
        break;
      case 'moon':
        this.drawMoon(ctx, screenX, screenY, deco.size);
        break;
      case 'sun':
        this.drawSun(ctx, screenX, screenY, deco.size);
        break;
      }
    }
  }

  /**
   * 绘制云
   */
  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const baseSize = 30 * size;

    ctx.beginPath();
    ctx.arc(x, y, baseSize, 0, Math.PI * 2);
    ctx.arc(x + baseSize * 1.2, y - baseSize * 0.3, baseSize * 0.8, 0, Math.PI * 2);
    ctx.arc(x + baseSize * 2, y, baseSize * 0.6, 0, Math.PI * 2);
    ctx.arc(x - baseSize * 0.8, y + baseSize * 0.1, baseSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制星星
   */
  private drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const r = 5 * size;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制月亮
   */
  private drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const r = 25 * size;
    ctx.fillStyle = '#f5f5dc';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // 绘制阴影形成月牙
    ctx.fillStyle = this.config.background.skyColor;
    ctx.beginPath();
    ctx.arc(x + r * 0.4, y - r * 0.1, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制太阳
   */
  private drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const r = 30 * size;

    // 光晕
    ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 太阳本体
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 渲染平台
   */
  private renderPlatform(ctx: CanvasRenderingContext2D, platform: Platform): void {
    const screenX = platform.x * this.unitSize - this.cameraX;
    const screenY = this.screenHeight - platform.y * this.unitSize;
    const width = platform.width * this.unitSize;
    const height = platform.height * this.unitSize;

    // 平台渐变
    const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + height);
    gradient.addColorStop(0, '#555555');
    gradient.addColorStop(1, '#333333');

    ctx.fillStyle = gradient;
    ctx.fillRect(screenX, screenY, width, height);

    // 平台边框
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, width, height);

    // 平台顶部高亮
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(screenX, screenY, width, 4);
  }

  /**
   * 颜色变亮
   */
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 颜色变暗
   */
  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 检测点是否在地面或平台上
   */
  isOnGround(x: number, y: number): boolean {
    const groundY = this.config.groundY * this.unitSize;

    // 检查是否在地面
    if (y <= groundY) return true;

    // 检查是否在平台上
    for (const platform of this.config.platforms) {
      const platLeft = platform.x * this.unitSize;
      const platRight = platLeft + platform.width * this.unitSize;
      const platTop = platform.y * this.unitSize;
      const platBottom = platTop + platform.height * this.unitSize;

      if (x >= platLeft && x <= platRight && y <= platTop && y >= platBottom) {
        return true;
      }
    }

    return false;
  }

  /**
   * 获取某点下方的地面Y坐标（像素）
   */
  getGroundBelow(x: number, y: number): number {
    const groundY = this.config.groundY * this.unitSize;

    // 如果在地面上方，返回地面Y
    if (y < groundY) return groundY;

    // 检查平台
    let highestPlatform = groundY;
    for (const platform of this.config.platforms) {
      const platLeft = platform.x * this.unitSize;
      const platRight = platLeft + platform.width * this.unitSize;
      const platTop = platform.y * this.unitSize;

      if (x >= platLeft && x <= platRight && platTop > y && platTop < highestPlatform) {
        highestPlatform = platTop;
      }
    }

    return highestPlatform;
  }

  /**
   * 随机获取地图
   */
  static getRandomMapId(): string {
    const index = Math.floor(Math.random() * MAPS.length);
    return MAPS[index].id;
  }
}
