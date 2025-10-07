import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
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
      // Type assertion to SimpleUser
      socket.emit('user:found', foundUser as SimpleUser);
    } else {
      socket.emit('user:not_found');
    }
  } catch (error) {
    console.error('Search error:', error);
    socket.emit('user:not_found');
  }
});

    // 💬 SEND MESSAGE (THE CORE FEATURE)
  // 💬 SEND MESSAGE (THE CORE FEATURE)
socket.on('message:send', async (data) => {
  try {
    console.log(`📨 ${username} to ${data.receiverId}: ${data.content}`);
    
    // Create room ID (sorted to ensure consistency)
    const sortedIds = [userId, data.receiverId].sort();
    const roomId = `room:${sortedIds[0]}:${sortedIds[1]}`;

    // Ensure room exists
    await prisma.chatRoom.upsert({
      where: { roomId },
      update: { lastActivity: new Date() },
      create: { roomId }
    });

    // Save message to database
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: 'text'
      },
      include: {
        sender: {
          select: { 
            id: true, 
            name: true, 
            username: true, 
            profilePic: true,
            About: true
          }
        }
      }
    });

    // Create simple message object for socket emission
    const simpleMessage = {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      messageType: message.messageType,
      timestamp: message.timestamp,
      sender: message.sender
    };

    // Check if receiver is online
    const receiverSocketId = onlineUsers.get(data.receiverId);
    
    if (receiverSocketId) {
      // Send to receiver
      io.to(receiverSocketId).emit('message:received', simpleMessage);
    }
    
    // Also send back to sender (so they see their own message)
    socket.emit('message:received', simpleMessage);

    console.log(`✅ Message saved and delivered`);

  } catch (error) {
    console.error('Message send error:', error);
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