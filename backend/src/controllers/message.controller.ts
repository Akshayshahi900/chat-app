import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

export const getRoomMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { roomId } = req.params;
    const { limit = "20", cursor } = req.query;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required"
      });
    }

    console.log(`📨 Fetching messages for room: ${roomId}, user: ${userId}`);

    // Verify user has access to this room by checking roomId format
    const roomParts = roomId.split(':');
    if (roomParts.length !== 3 || roomParts[0] !== 'room') {
      return res.status(400).json({
        success: false,
        message: "Invalid room format"
      });
    }

    const user1Id = roomParts[1];
    const user2Id = roomParts[2];

    if (user1Id !== userId && user2Id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this chat room"
      });
    }

    // Build query for messages - USING COMPOUND INDEX!
    const messageWhere: any = { roomId: roomId };
    
    // Add cursor for pagination (load older messages)
    if (cursor) {
      messageWhere.timestamp = { lt: new Date(cursor as string) };
    }

    //  THIS QUERY USES THE COMPOUND INDEX {roomId: 1, timestamp: -1}
    const messages = await prisma.message.findMany({
      where: messageWhere,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            profilePic: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }, // Uses compound index for sorting
      take: parseInt(limit as string) // Load 20 messages at a time
    });

    console.log(`✅ Found ${messages.length} messages in room ${roomId}`);

    // Mark messages as delivered if they're sent to current user
    if (messages.length > 0) {
      await prisma.message.updateMany({
        where: {
          roomId: roomId,
          receiverId: userId,
          status: 'sent'
        },
        data: {
          status: 'delivered',
          // deliveredAt: new Date() // Uncomment if you add this field
        }
      });
    }

    // Determine if there are more messages to load
    const hasMore = messages.length === parseInt(limit as string);
    const nextCursor = hasMore ? messages[messages.length - 1].timestamp.toISOString() : null;

    res.json({
      success: true,
      messages: messages.reverse(), // Return oldest first for proper display
      pagination: {
        hasMore,
        nextCursor
      }
    });

  } catch (error) {
    console.error('❌ Error fetching room messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};