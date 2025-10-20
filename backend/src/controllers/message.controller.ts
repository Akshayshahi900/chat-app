import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import cloudinary from "../lib/cloudinary";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// export const uploadFile = async(req:Request , res:Response) => {
//   try {
//     if(!req.file) return res.status(400).json({message: "No file uploaded"});

//     const file = req.file;

//     //upload to cloudinary
//     const uploadResult = await cloudinary.uploader.upload_stream(
//       {
//         resource_type:"auto",
//         folder:"chat_uploads"
//       },
//       (error , result) =>{
//         if (error){
//           console.error("Cloudinary upload error:", error);
//           return res.status(500).json({message: "Cloudinary upload failed"});
//         }
//         res.status(200).json({
//           url:result?.secure_url,
//           public_id:result?.public_id,
//           type:file.mimetype.split("/")[0],
//           name:file.originalname,
//           size:file.size,
//         })
//       }
  
//       )

//       uploadResult.end(file.buffer);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({message:"File upload failed"});
//   }
// }
//================================
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // auto-detect image/video/raw
        folder: "chat_uploads",
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        // Detect type (image / video / file)
        const type =
          file.mimetype.startsWith("image")
            ? "image"
            : file.mimetype.startsWith("video")
            ? "video"
            : "file";

        // Send response back
        res.status(200).json({
          url: result.secure_url,
          public_id: result.public_id,
          type,
          name: file.originalname,
          size: file.size,
        });
      }
    );

    // Write file buffer to Cloudinary stream
    uploadStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "File upload failed" });
  }
};










//===================================
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