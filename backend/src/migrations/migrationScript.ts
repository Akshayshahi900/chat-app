import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()
// One-time migration script
async function migrateExistingRooms() {
  try {
    // Get all unique rooms from messages
    const rooms = await prisma.message.findMany({
      distinct: ['roomId'],
      select: { roomId: true }
    });

    for (const room of rooms) {
      // Get participants from messages in this room
      const participants = await prisma.message.findMany({
        where: { roomId: room.roomId },
        distinct: ['senderId', 'receiverId'],
        select: { senderId: true, receiverId: true }
      });

      const userIds = new Set<string>();
      participants.forEach(p => {
        userIds.add(p.senderId);
        userIds.add(p.receiverId);
      });

      // Add users to ChatRoomUser
      for (const userId of userIds) {
        try {
          await prisma.chatRoomUser.create({
            data: {
              userId,
              roomId: room.roomId
            }
          });
        } catch (error) {
          // Already exists, skip
        }
      }
    }
    console.log('✅ Migration completed');
  } catch (error) {
    console.error('Migration error:', error);
  }
}