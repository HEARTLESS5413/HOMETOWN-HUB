import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import env from '../config/env';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`🔌 User connected: ${userId}`);

    // Join personal room for targeted notifications
    socket.join(`user:${userId}`);

    // Join community rooms
    socket.on('join-community', (communityId: string) => {
      socket.join(`community:${communityId}`);
    });

    socket.on('leave-community', (communityId: string) => {
      socket.leave(`community:${communityId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Helper to send notification to a specific user
export const sendNotificationToUser = (userId: string, notification: Record<string, unknown>): void => {
  if (io) io.to(`user:${userId}`).emit('notification', notification);
};

// Helper to broadcast to a community
export const broadcastToCommunity = (communityId: string, event: string, data: Record<string, unknown>): void => {
  if (io) io.to(`community:${communityId}`).emit(event, data);
};
