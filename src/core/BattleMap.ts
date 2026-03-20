/**
 * 地图系统
 * 地图宽度100单位，1单位=60px
 * 角色跳跃高度为3个单位
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
  generateRandomPlatforms?: boolean;  // 是否随机生成平台
  background: {
    skyColor: string;        // 天空颜色
    groundColor: string;     // 地面颜色
    platformColor?: string;  // 平台颜色
    decorations?: {          // 装饰物
      type: 'cloud' | 'star' | 'moon' | 'sun' | 'cactus' | 'snowflake' | 'flame';
      x: number;
      y: number;
      size: number;
    }[];
  };
}

/**
 * 随机生成平台
 * 确保玩家能够跳跃到达（高度差不超过3单位）
 */
function generateRandomPlatforms(seed?: number): Platform[] {
  const platforms: Platform[] = [];
  const usedAreas: { start: number; end: number }[] = [];
  
  let currentSeed = seed || Date.now();
  
  const random = (max: number): number => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return Math.floor((currentSeed / 233280) * max);
  };
  
  const platformCount = 4 + random(3);
  
  for (let i = 0; i < platformCount; i++) {
    let attempts = 0;
    let platform: Platform | null = null;
    
    while (attempts < 20 && !platform) {
      const width = 5 + random(6);
      const x = 10 + random(75);
      const height = 2 + random(2);
      const y = 5 + random(15);
      
      const overlaps = usedAreas.some(area => 
        (x >= area.start && x <= area.end) ||
        (x + width >= area.start && x + width <= area.end) ||
        (x <= area.start && x + width >= area.end)
      );
      
      if (!overlaps) {
        platform = { x, y, width, height };
        usedAreas.push({ start: x - 3, end: x + width + 3 });
      }
      attempts++;
    }
    
    if (platform) {
      platforms.push(platform);
    }
  }
  
  return platforms.sort((a, b) => a.x - b.x);
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
  // 地图2：台阶 - 月黑风高（随机生成台阶）
  {
    id: 'stepped',
    name: '暗夜台阶',
    groundY: 2,
    platforms: [],
    generateRandomPlatforms: true,
    background: {
      skyColor: '#0a0a1a',
      groundColor: '#1a1a2a',
      platformColor: '#2a2a3a',
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
  // 地图3：沙漠 - 烈日黄沙
  {
    id: 'desert',
    name: '烈日黄沙',
    groundY: 2,
    platforms: [
      { x: 10, y: 5, width: 10, height: 2 },
      { x: 30, y: 8, width: 8, height: 2 },
      { x: 50, y: 5, width: 12, height: 2 },
      { x: 75, y: 10, width: 8, height: 2 },
    ],
    background: {
      skyColor: '#F4A460',
      groundColor: '#DEB887',
      platformColor: '#8B4513',
      decorations: [
        { type: 'sun', x: 80, y: 90, size: 2.5 },
        { type: 'cactus', x: 20, y: 4, size: 1 },
        { type: 'cactus', x: 60, y: 4, size: 0.8 },
        { type: 'cactus', x: 85, y: 4, size: 1.2 },
      ],
    },
  },
  // 地图4：冰原 - 极地寒霜
  {
    id: 'icefield',
    name: '极地寒霜',
    groundY: 2,
    platforms: [
      { x: 5, y: 6, width: 12, height: 2 },
      { x: 25, y: 9, width: 10, height: 2 },
      { x: 45, y: 6, width: 8, height: 2 },
      { x: 60, y: 12, width: 10, height: 2 },
      { x: 82, y: 8, width: 10, height: 2 },
    ],
    background: {
      skyColor: '#E0FFFF',
      groundColor: '#B0E0E6',
      platformColor: '#4682B4',
      decorations: [
        { type: 'snowflake', x: 15, y: 85, size: 0.8 },
        { type: 'snowflake', x: 35, y: 90, size: 0.6 },
        { type: 'snowflake', x: 55, y: 88, size: 0.7 },
        { type: 'snowflake', x: 75, y: 92, size: 0.5 },
        { type: 'snowflake', x: 90, y: 87, size: 0.9 },
      ],
    },
  },
  // 地图5：火山 - 熔岩地狱
  {
    id: 'volcano',
    name: '熔岩地狱',
    groundY: 2,
    platforms: [
      { x: 8, y: 7, width: 10, height: 2 },
      { x: 28, y: 5, width: 8, height: 2 },
      { x: 48, y: 10, width: 12, height: 2 },
      { x: 70, y: 6, width: 8, height: 2 },
      { x: 85, y: 12, width: 8, height: 2 },
    ],
    background: {
      skyColor: '#2F0000',
      groundColor: '#4A0000',
      platformColor: '#3D3D3D',
      decorations: [
        { type: 'flame', x: 15, y: 4, size: 1 },
        { type: 'flame', x: 40, y: 4, size: 0.8 },
        { type: 'flame', x: 65, y: 4, size: 1.2 },
        { type: 'flame', x: 90, y: 4, size: 0.9 },
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
    const baseConfig = MAPS.find(m => m.id === mapId) || MAPS[0];
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    if (baseConfig.generateRandomPlatforms) {
      this.config = {
        ...baseConfig,
        platforms: generateRandomPlatforms(),
      };
    } else {
      this.config = baseConfig;
    }
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
   * 获取地面高度（像素，世界坐标）
   */
  getGroundHeight(): number {
    return this.config.groundY * this.unitSize;
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

    // 限制摄像机不超出地图边界，考虑角色宽度
    const minCameraX = 0;
    const maxCameraX = mapWidth - this.screenWidth;
    
    // 平滑跟随，但确保角色不会超出屏幕
    let cameraX = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    
    // 额外检查：如果角色接近边界，调整摄像机位置
    if (playerX < this.screenWidth / 2) {
      // 角色在左半屏，摄像机保持在最左
      cameraX = 0;
    } else if (playerX > mapWidth - this.screenWidth / 2) {
      // 角色在右半屏，摄像机保持在最右
      cameraX = maxCameraX;
    }
    
    this.cameraX = cameraX;
  }

  /**
   * 获取摄像机X偏移
   */
  getCameraX(): number {
    return this.cameraX;
  }

  /**
   * 世界坐标转屏幕坐标
   * 世界坐标系：Y轴向上为正（角色在地面上时Y=地面高度）
   * 屏幕坐标系：Y轴向下为正（屏幕顶部Y=0）
   * 转换公式：screenY = screenHeight - worldY
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
      case 'cactus':
        this.drawCactus(ctx, screenX, screenY, deco.size);
        break;
      case 'snowflake':
        this.drawSnowflake(ctx, screenX, screenY, deco.size);
        break;
      case 'flame':
        this.drawFlame(ctx, screenX, screenY, deco.size);
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
   * 绘制仙人掌
   */
  private drawCactus(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const baseSize = 20 * size;
    ctx.fillStyle = '#228B22';

    // 主干
    ctx.fillRect(x - baseSize * 0.3, y - baseSize * 2, baseSize * 0.6, baseSize * 2);
    
    // 左分支
    ctx.fillRect(x - baseSize * 0.8, y - baseSize * 1.5, baseSize * 0.5, baseSize * 0.4);
    ctx.fillRect(x - baseSize * 0.8, y - baseSize * 1.5, baseSize * 0.4, baseSize * 0.8);
    
    // 右分支
    ctx.fillRect(x + baseSize * 0.3, y - baseSize * 1.2, baseSize * 0.5, baseSize * 0.4);
    ctx.fillRect(x + baseSize * 0.4, y - baseSize * 1.2, baseSize * 0.4, baseSize * 0.7);
  }

  /**
   * 绘制雪花
   */
  private drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const r = 15 * size;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // 六角雪花
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      ctx.stroke();
      
      // 分支
      const branchLen = r * 0.4;
      const branchX = x + r * 0.6 * Math.cos(angle);
      const branchY = y + r * 0.6 * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + branchLen * Math.cos(angle + Math.PI / 4),
        branchY + branchLen * Math.sin(angle + Math.PI / 4)
      );
      ctx.moveTo(branchX, branchY);
      ctx.lineTo(
        branchX + branchLen * Math.cos(angle - Math.PI / 4),
        branchY + branchLen * Math.sin(angle - Math.PI / 4)
      );
      ctx.stroke();
    }
  }

  /**
   * 绘制火焰
   */
  private drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const baseSize = 25 * size;
    
    // 外层火焰（红色）
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.moveTo(x, y - baseSize * 1.5);
    ctx.quadraticCurveTo(x + baseSize * 0.8, y - baseSize * 0.8, x + baseSize * 0.5, y);
    ctx.quadraticCurveTo(x + baseSize * 0.3, y - baseSize * 0.3, x, y - baseSize * 0.5);
    ctx.quadraticCurveTo(x - baseSize * 0.3, y - baseSize * 0.3, x - baseSize * 0.5, y);
    ctx.quadraticCurveTo(x - baseSize * 0.8, y - baseSize * 0.8, x, y - baseSize * 1.5);
    ctx.fill();
    
    // 内层火焰（黄色）
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x, y - baseSize * 1.1);
    ctx.quadraticCurveTo(x + baseSize * 0.4, y - baseSize * 0.5, x + baseSize * 0.25, y - baseSize * 0.1);
    ctx.quadraticCurveTo(x + baseSize * 0.1, y - baseSize * 0.2, x, y - baseSize * 0.3);
    ctx.quadraticCurveTo(x - baseSize * 0.1, y - baseSize * 0.2, x - baseSize * 0.25, y - baseSize * 0.1);
    ctx.quadraticCurveTo(x - baseSize * 0.4, y - baseSize * 0.5, x, y - baseSize * 1.1);
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

    const platformColor = this.config.background.platformColor || '#555555';
    const darkColor = this.darkenColor(platformColor, 0.2);

    // 平台渐变
    const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + height);
    gradient.addColorStop(0, platformColor);
    gradient.addColorStop(1, darkColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(screenX, screenY, width, height);

    // 平台边框
    ctx.strokeStyle = this.darkenColor(platformColor, 0.3);
    ctx.lineWidth = 2;
    ctx.strokeRect(screenX, screenY, width, height);

    // 平台顶部高亮
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
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
