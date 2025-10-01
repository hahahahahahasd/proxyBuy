import { io, Socket } from 'socket.io-client';
import { reactive } from 'vue';

interface SocketState {
  isConnected: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  public state: SocketState = reactive({
    isConnected: false,
  });

  private getSocket(): Socket {
    if (!this.socket) {
      // 在开发环境中，我们明确指向后端服务的地址
      // 在生产环境中，可以留空，它会自动使用当前页面的主机
      const socketUrl = import.meta.env.DEV ? 'http://localhost:3000' : '';
      this.socket = io(socketUrl, {
        transports: ['websocket'],
        autoConnect: false, // 我们将手动控制连接
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.state.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected.');
        this.state.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket Connection Error:', error);
        this.state.isConnected = false;
      });
    }
    return this.socket;
  }

  connect() {
    if (this.socket?.connected) return;
    this.getSocket().connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null; // 清理实例以便下次可以重新创建
    }
  }

  joinOrderRoom(orderId: number) {
    this.getSocket().emit('joinOrderRoom', { orderId });
  }

  onOrderStatusUpdate(callback: (updatedOrder: any) => void) {
    // 在注册新监听器前，先移除旧的，防止重复监听
    this.getSocket().off('orderStatusUpdate');
    this.getSocket().on('orderStatusUpdate', callback);
  }
}

// 导出单例
export const socketService = new SocketService();
