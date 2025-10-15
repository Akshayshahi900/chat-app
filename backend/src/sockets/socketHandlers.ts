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



    // async function ensureChatRoomUsers(roomId: string, user1Id: string, user2Id: string) {
    //   try {
    //     //check if users are already in the room
    //     const existingUsers = await prisma.chatRoomUser.findMany({
    //       where: { roomId }
    //     })

    //     const existingUserIds = existingUsers.map(u => userId);
    //     const usersToAdd = [user1Id, user2Id].filter(id => !existingUserIds.includes(id));

    //     if (usersToAdd.length > 0) {
    //       await prisma.chatRoomUser.createMany({
    //         data: usersToAdd.map(userId => ({
    //           userId,
    //           roomId
    //         }))
    //       });
    //       console.log(`Added ${usersToAdd.length} users to room ${roomId}`);
    //     }
    //   } catch (error) {
    //     console.error('Error ensuring ChatRoomUsers:', error);
    //   }
    // }
    // 💬 SEND MESSAGE (THE CORE FEATURE)
    // 💬 SEND MESSAGE (THE CORE FEATURE)
    socket.on('message:send', async (data) => {
      try {
        console.log(`📨 ${username} to ${data.receiverId}: ${data.content}`);

        // Create room ID (sorted to ensure consistency)
        const sortedIds = [userId, data.receiverId].sort();
        const roomId = `room:${sortedIds[0]}:${sortedIds[1]}`;

        // Ensure room exists AND users are added to ChatRoomUser

        await prisma.chatRoom.upsert({
          where: { roomId },
          update: { lastActivity: new Date() },
          create: { roomId }
        });

        // 🆕 FIRST: Ensure room exists with last message fields
        const room = await prisma.chatRoom.upsert({
          where: { roomId },
          update: {
            // We'll update last message after creating the message
          },
          create: {
            roomId,
            lastMessageContent: data.content // Set initial last message
          }
        });

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
                // About: true
              }
            }
          }
        });
        // 🆕 CRITICAL: Update room with last message info
        await prisma.chatRoom.update({
          where: { roomId },
          data: {
            lastActivity: new Date(),
            lastMessageId: message.id,
            lastMessageContent: data.content
          }
        });

        console.log(`Message saved and room updated with the last message`);

        // Create simple message object for socket emission
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
            profilePic: message.sender.profilePic ?? undefined
          },
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