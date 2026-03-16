import secrets from '../config/secrets';

/**
 * 玩家状态
 */
export enum PlayerStatus {
  NOT_READY = 'not_ready',  // 未准备
  READY = 'ready',          // 已准备
}

/**
 * 玩家信息
 */
export interface Player {
  id: string;
  nickname: string;
  avatarUrl: string;
  status: PlayerStatus;
  isHost: boolean;
}

/**
 * 房间状态
 */
export enum RoomStatus {
  WAITING = 'waiting',      // 等待中
  READY = 'ready',          // 双方已准备
  PLAYING = 'playing',      // 游戏中
}

/**
 * 房间信息
 */
export interface Room {
  id: string;
  players: Player[];
  status: RoomStatus;
  createdAt: number;
}

/**
 * 房间状态变化回调
 */
export type RoomChangeListener = (room: Room) => void;

/**
 * 房间服务 - 基于 CloudBase 实现
 */
export class RoomService {
  private db: any = null;
  private collection: any = null;
  private watcher: any = null;
  private currentRoom: Room | null = null;
  private currentPlayerId: string = '';
  private listeners: RoomChangeListener[] = [];

  constructor() {
    this.initCloudBase();
  }

  /**
   * 初始化 CloudBase
   */
  private async initCloudBase(): Promise<void> {
    try {
      // 初始化云开发
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        return;
      }

      wx.cloud.init({
        env: secrets.CLOUD_BASE_ENV,
        traceUser: true,
      });

      this.db = wx.cloud.database();
      this.collection = this.db.collection('rooms');
      console.log('CloudBase 初始化成功');
    } catch (error) {
      console.error('CloudBase 初始化失败:', error);
    }
  }

  /**
   * 生成唯一房间ID
   */
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 获取当前玩家信息
   */
  private async getCurrentPlayer(): Promise<Player> {
    return new Promise((resolve) => {
      wx.getUserInfo({
        success: (res) => {
          const userInfo = res.userInfo;
          resolve({
            id: this.currentPlayerId,
            nickname: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            status: PlayerStatus.NOT_READY,
            isHost: true,
          });
        },
        fail: () => {
          // 如果获取用户信息失败，使用默认信息
          resolve({
            id: this.currentPlayerId,
            nickname: `玩家${this.currentPlayerId.slice(-4)}`,
            avatarUrl: '',
            status: PlayerStatus.NOT_READY,
            isHost: true,
          });
        },
      });
    });
  }

  /**
   * 创建房间
   */
  async createRoom(): Promise<Room> {
    if (!this.collection) {
      await this.initCloudBase();
    }

    this.currentPlayerId = wx.getStorageSync('playerId') || this.generateRoomId();
    wx.setStorageSync('playerId', this.currentPlayerId);

    const player = await this.getCurrentPlayer();
    const roomId = this.generateRoomId();

    const room: Room = {
      id: roomId,
      players: [player],
      status: RoomStatus.WAITING,
      createdAt: Date.now(),
    };

    try {
      await this.collection.add({
        data: {
          _id: roomId,
          ...room,
        },
      });

      this.currentRoom = room;
      this.startWatching(roomId);
      this.notifyListeners();

      console.log(`房间创建成功: ${roomId}`);
      return room;
    } catch (error) {
      console.error('创建房间失败:', error);
      throw error;
    }
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId: string): Promise<Room> {
    console.log(`joinRoom 被调用, roomId: ${roomId}`);

    if (!this.collection) {
      await this.initCloudBase();
    }

    this.currentPlayerId = wx.getStorageSync('playerId') || this.generateRoomId();
    wx.setStorageSync('playerId', this.currentPlayerId);

    try {
      // 查询房间
      console.log(`正在查询房间: ${roomId}`);
      const res = await this.collection.doc(roomId).get();
      console.log('查询结果:', res);

      if (!res.data) {
        throw new Error('房间不存在');
      }

      const room = res.data as Room;

      if (room.players.length >= 2) {
        throw new Error('房间已满');
      }

      // 添加玩家到房间
      const player = await this.getCurrentPlayer();
      player.isHost = false;
      room.players.push(player);

      await this.collection.doc(roomId).update({
        data: {
          players: room.players,
        },
      });

      this.currentRoom = room;
      this.startWatching(roomId);
      this.notifyListeners();

      console.log(`成功加入房间: ${roomId}`);
      return room;
    } catch (error) {
      console.error('加入房间失败:', error);
      throw error;
    }
  }

  /**
   * 更新玩家状态
   */
  async updatePlayerStatus(status: PlayerStatus): Promise<void> {
    if (!this.currentRoom) return;

    const playerIndex = this.currentRoom.players.findIndex(
      (p) => p.id === this.currentPlayerId
    );

    if (playerIndex === -1) return;

    this.currentRoom.players[playerIndex].status = status;

    // 检查是否双方都已准备
    const allReady = this.currentRoom.players.every(
      (p) => p.status === PlayerStatus.READY
    );

    if (allReady && this.currentRoom.players.length === 2) {
      this.currentRoom.status = RoomStatus.READY;
    }

    try {
      await this.collection.doc(this.currentRoom.id).update({
        data: {
          players: this.currentRoom.players,
          status: this.currentRoom.status,
        },
      });

      this.notifyListeners();
    } catch (error) {
      console.error('更新玩家状态失败:', error);
    }
  }

  /**
   * 开始监听房间变化
   */
  private startWatching(roomId: string): void {
    if (this.watcher) {
      this.watcher.close();
    }

    this.watcher = this.collection
      .doc(roomId)
      .watch({
        onChange: (snapshot: any) => {
          const doc = snapshot.docChanges[0];
          if (doc && doc.doc) {
            this.currentRoom = doc.doc as Room;
            this.notifyListeners();
          }
        },
        onError: (error: any) => {
          console.error('房间监听错误:', error);
        },
      });
  }

  /**
   * 离开房间
   */
  async leaveRoom(): Promise<void> {
    if (!this.currentRoom) return;

    try {
      if (this.watcher) {
        this.watcher.close();
        this.watcher = null;
      }

      // 如果是房主，删除房间
      const currentPlayer = this.currentRoom.players.find(
        (p) => p.id === this.currentPlayerId
      );

      if (currentPlayer?.isHost) {
        await this.collection.doc(this.currentRoom.id).remove();
      } else {
        // 否则移除玩家
        const players = this.currentRoom.players.filter(
          (p) => p.id !== this.currentPlayerId
        );
        await this.collection.doc(this.currentRoom.id).update({
          data: { players },
        });
      }

      this.currentRoom = null;
    } catch (error) {
      console.error('离开房间失败:', error);
    }
  }

  /**
   * 获取当前房间信息
   */
  getCurrentRoom(): Room | null {
    return this.currentRoom;
  }

  /**
   * 获取当前玩家ID
   */
  getCurrentPlayerId(): string {
    return this.currentPlayerId;
  }

  /**
   * 添加房间状态监听器
   */
  addListener(listener: RoomChangeListener): void {
    this.listeners.push(listener);
  }

  /**
   * 移除房间状态监听器
   */
  removeListener(listener: RoomChangeListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    if (this.currentRoom) {
      this.listeners.forEach((listener) => listener(this.currentRoom!));
    }
  }

  /**
   * 检查是否双方都已准备
   */
  isAllReady(): boolean {
    return (
      this.currentRoom?.status === RoomStatus.READY &&
      this.currentRoom.players.length === 2
    );
  }
}

/**
 * 全局房间服务实例
 */
export const roomService = new RoomService();
