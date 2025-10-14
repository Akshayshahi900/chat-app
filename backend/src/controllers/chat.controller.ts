
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();


interface AuthRequest extends Request {
    user?: any;
}
export const getChatList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    console.log(`📋 Fetching rooms for user: ${userId}`);

    // Step 1: Get all rooms where user is a participant
    const userRooms = await prisma.chatRoom.findMany({
      where: {
        OR: [
          { roomId: { startsWith: `room:${userId}:` } },  // User is first participant
          { roomId: { endsWith: `:${userId}` } }          // User is second participant
        ]
      },
      orderBy: {
        lastActivity: 'desc'  // Most recent chats first
      }
    });

    console.log(`📍 Found ${userRooms.length} rooms for user`);

    // Step 2: For each room, extract the other user
    const chats = await Promise.all(
      userRooms.map(async (room) => {
        try {
          // Parse room ID to find the other participant
          const roomParts = room.roomId.split(':');
          const user1Id = roomParts[1];
          const user2Id = roomParts[2];

          // Determine who the other user is
          const otherUserId = user1Id === userId ? user2Id : user1Id;

          // Get the other user's details
          const otherUser = await prisma.user.findUnique({
            where: { id: otherUserId },
            select: {
              id: true,
              name: true,
              username: true,
              profilePic: true,
              About: true
            }
          });

          if (!otherUser) {
            console.log(`❌ Other user not found: ${otherUserId}`);
            return null;
          }

          // Get last message in this room
          const lastMessage = await prisma.message.findFirst({
            where: { roomId: room.roomId },
            orderBy: { timestamp: 'desc' },
            select: {
              content: true,
              timestamp: true,
              senderId: true,
              status: true
            }
          });

          // Count unread messages
          const unreadCount = await prisma.message.count({
            where: {
              roomId: room.roomId,
              receiverId: userId,
              status: 'sent'
            }
          });

          return {
            roomId: room.roomId,
            user: otherUser,
            lastMessage: lastMessage?.content || 'Start chatting...',
            lastMessageTime: lastMessage?.timestamp || room.lastActivity,
            unreadCount: unreadCount
          };

        } catch (error) {
          console.error(`Error processing room ${room.roomId}:`, error);
          return null;
        }
      })
    );

    // Filter out nulls
    const validChats = chats.filter(chat => chat !== null);

    console.log(`✅ Returning ${validChats.length} chats`);

    res.json({
      success: true,
      chats: validChats
    });

  } catch (error) {
    console.error('❌ Error fetching chat list:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};









