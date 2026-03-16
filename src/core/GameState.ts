/**
 * 游戏状态枚举
 */
export enum GameState {
  HOME = 'home',           // 首页
  ROOM = 'room',           // 房间
  CHARACTER_SELECT = 'character_select', // 角色选择
  PLAYING = 'playing',     // 游戏中
  PAUSED = 'paused',       // 暂停
  RESULT = 'result',       // 结算
}

/**
 * 游戏配置
 */
export interface GameConfig {
  title: string;
  version: string;
}

/**
 * 状态附加数据类型
 */
export interface StateData {
  roomId?: string;
  [key: string]: unknown;
}

/**
 * 状态变化监听器类型
 */
export type StateChangeListener = (state: GameState, data?: StateData) => void;

/**
 * 游戏状态管理器
 */
export class GameStateManager {
  private currentState: GameState = GameState.HOME;
  private previousState: GameState | null = null;
  private listeners: StateChangeListener[] = [];
  private currentData: StateData | null = null;

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return this.currentState;
  }

  /**
   * 获取当前状态数据
   */
  getData(): StateData | null {
    return this.currentData;
  }

  /**
   * 设置状态
   */
  setState(state: GameState, data?: StateData): void {
    if (this.currentState !== state || data !== undefined) {
      this.previousState = this.currentState;
      this.currentState = state;
      this.currentData = data || null;
      this.notifyListeners(data);
    }
  }

  /**
   * 返回上一个状态
   */
  goBack(): void {
    if (this.previousState) {
      this.setState(this.previousState);
    }
  }

  /**
   * 添加状态变化监听器
   */
  addListener(listener: StateChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(data?: StateData): void {
    this.listeners.forEach(listener => listener(this.currentState, data));
  }
}

/**
 * 全局游戏状态管理器实例
 */
export const gameState = new GameStateManager();

/**
 * 游戏配置
 */
export const gameConfig: GameConfig = {
  title: '格斗王者',
  version: '1.0.0',
};
