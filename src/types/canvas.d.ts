/**
 * Canvas 相关类型定义
 * 补充微信小游戏缺少的类型
 */

interface CanvasGradient {
  addColorStop(offset: number, color: string): void;
}

/**
 * 图片源类型
 */
type CanvasImageSource = HTMLCanvasElement | ImageBitmap;

interface CanvasRenderingContext2D {
  canvas: HTMLCanvasElement;
  fillStyle: string | CanvasGradient;
  strokeStyle: string | CanvasGradient;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
  font: string;
  textAlign: 'start' | 'end' | 'left' | 'right' | 'center';
  textBaseline: 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom';

  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;

  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  rect(x: number, y: number, width: number, height: number): void;
  roundRect(x: number, y: number, width: number, height: number, radii?: number | number[]): void;
  fill(fillRule?: 'nonzero' | 'evenodd'): void;
  stroke(): void;

  save(): void;
  restore(): void;
  scale(x: number, y: number): void;
  rotate(angle: number): void;
  translate(x: number, y: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;

  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;

  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;

  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dWidth: number, dHeight: number): void;
  drawImage(image: CanvasImageSource, sx: number, sy: number, sWidth: number, sHeight: number, dx: number, dy: number, dWidth: number, dHeight: number): void;

  clip(fillRule?: 'nonzero' | 'evenodd'): void;
  isPointInPath(x: number, y: number, fillRule?: 'nonzero' | 'evenodd'): boolean;
  isPointInStroke(x: number, y: number): boolean;

  globalAlpha: number;
  globalCompositeOperation: string;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  imageSmoothingEnabled: boolean;
  filter: string;

  // 椭圆绘制方法
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
}

interface TextMetrics {
  width: number;
  actualBoundingBoxLeft?: number;
  actualBoundingBoxRight?: number;
  actualBoundingBoxAscent?: number;
  actualBoundingBoxDescent?: number;
}

/**
 * 微信API扩展类型定义
 */
declare namespace WechatMinigame {
  interface UserInfoButton {
    onTap(callback: (res: UserInfoButtonTapResult) => void): void;
    offTap(callback: (res: UserInfoButtonTapResult) => void): void;
    show(): void;
    hide(): void;
    destroy(): void;
  }

  interface UserInfoButtonTapResult {
    userInfo?: UserInfo;
    errMsg: string;
  }

  interface CreateUserInfoButtonOption {
    type: 'text' | 'image';
    text?: string;
    image?: string;
    style: {
      left: number;
      top: number;
      width: number;
      height: number;
      lineHeight?: number;
      backgroundColor?: string;
      color?: string;
      textAlign?: 'left' | 'center' | 'right';
      fontSize?: number;
      fontWeight?: 'normal' | 'bold';
      borderRadius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
    withCredentials?: boolean;
    lang?: 'en' | 'zh_CN' | 'zh_TW';
  }

  interface Wx {
    createUserInfoButton(option: CreateUserInfoButtonOption): UserInfoButton;
  }
}
