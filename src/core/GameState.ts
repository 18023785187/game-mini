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
 * 游戏状态管理器
 */
export class GameStateManager {
  private currentState: GameState = GameState.HOME;
  private previousState: GameState | null = null;
  private listeners: ((state: GameState) => void)[] = [];

  /**
   * 获取当前状态
   */
  getState(): GameState {
    return this.currentState;
  }

  /**
   * 设置状态
   */
  setState(state: GameState): void {
    if (this.currentState !== state) {
      this.previousState = this.currentState;
      this.currentState = state;
      this.notifyListeners();
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
  addListener(listener: (state: GameState) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentState));
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
