import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SimpleUser,
  SimpleMessage,
} from '../types/socket';

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  prisma: PrismaClient
) => {
  // Simple online users storage
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;
    const username = socket.data.username;

    console.log(`🔗 User connected: ${username} (${userId})`);

    // Add to online users
    onlineUsers.set(userId, socket.id);

    // Notify everyone that this user is online
    socket.broadcast.emit('user:online', { userId, username });

    // 🔍 USER SEARCH
    socket.on('user:search', async (data) => {
      try {
        console.log(`🔍 ${username} searching for: ${data.username}`);

        const foundUser = await prisma.user.findUnique({
          where: { username: data.username },
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true,
            About: true
          }
        });

        if (foundUser && foundUser.id !== userId) {
          socket.emit('user:found', foundUser as SimpleUser);
        } else {
          socket.emit('user:not_found');
        }
      } catch (error) {
        console.error('Search error:', error);
        socket.emit('user:not_found');
      }
    });

    // 💬 SEND MESSAGE (with file support)
    socket.on("message:send", async (data) => {
      try {
        console.log(`📨 ${username} → ${data.receiverId}: ${data.content || "[file]"}`);

        const sortedIds = [userId, data.receiverId].sort();
        const roomId = `room:${sortedIds[0]}:${sortedIds[1]}`;

        // ✅ Ensure the chat room exists
        await prisma.chatRoom.upsert({
          where: { roomId },
          update: { lastActivity: new Date() },
          create: { roomId },
        });

        // ✅ Determine message type properly
        const messageType = data.messageType || "text";

        // ✅ Create message entry with optional file metadata
        const message = await prisma.message.create({
          data: {
            roomId,
            senderId: userId,
            receiverId: data.receiverId,
            content: data.content || "", // always string
            messageType,
            fileUrl: data.fileUrl || null, // Cloudinary URL
            fileType: data.fileType || null,
            fileName: data.fileName || null,
            fileSize: data.fileSize || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                username: true,
                profilePic: true,
              },
            },
          },
        });

        // ✅ Update the room's last message info
        await prisma.chatRoom.update({
          where: { roomId },
          data: {
            lastActivity: new Date(),
            lastMessageId: message.id,
            lastMessageContent:
              message.messageType === "text"
                ? message.content
                : `[${message.messageType.toUpperCase()}] ${message.fileName || ""}`,
          },
        });

        // ✅ Build simplified message object for frontend
        const simpleMessage: SimpleMessage = {
          id: message.id,
          roomId: message.roomId,
          senderId: message.senderId,
          receiverId: message.receiverId,
          content: message.content,
          messageType: message.messageType,
          timestamp: message.timestamp,
          sender: {
            ...message.sender,
            profilePic: message.sender.profilePic ?? undefined,
          },
          fileUrl: message.fileUrl ?? undefined,
          fileType: message.fileType ?? undefined,
          fileName: message.fileName ?? undefined,
          fileSize: message.fileSize ?? undefined,
        };

        // ✅ Send message to receiver (if online)
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:received", simpleMessage);
        }

        // ✅ Also echo to sender
        socket.emit("message:received", simpleMessage);

        console.log(`✅ Message (${messageType}) saved and delivered`);
      } catch (error) {
        console.error("Message send error:", error);
      }
    });

    // 🚪 JOIN ROOM (for receiving messages)
    socket.on('room:join', (data) => {
      socket.join(data.roomId);
      console.log(`🚪 ${username} joined room: ${data.roomId}`);
    });

    // 🔌 DISCONNECT
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${username}`);
      onlineUsers.delete(userId);
      socket.broadcast.emit('user:offline', { userId, username });
    });
  });
};