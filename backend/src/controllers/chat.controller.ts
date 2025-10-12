
import { PrismaClient } from "@prisma/client";
import { CLIENT_RENEG_WINDOW, rootCertificates } from "tls";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

interface AuthRequest extends Request{
    user?:any;
}
export const getChatList = async (req:AuthRequest ,res:Response)=>{
    try {
        const userId = req.user.id;
        console.log(`Fetching chat list for uses: ${userId}`);

       //get all unique rooms where user has participated (from chat rooms)
    //room:id1:id2 is the mapping of rooms
       const userRooms = await prisma.chatRoom.findMany({
            where:{
                
                OR:[
                    {roomId:{startsWith:`room:${userId}:`}},
                    {roomId: {startsWith:`:${userId}`}}
                ]
            },
            orderBy:{
                lastActivity :'desc'
            }
        });

        console.log(`Found ${userRooms.length} rooms for user`);

        // for each room extract the other user

        const chat = await Promise.all(
            userRooms.map(async(room)=>{
                try{
                    //parse the room id to find the other participant

                    const roomParts = room.roomId.split(':');
                    const user1Id = roomParts[1];
                    const user2Id = roomParts[2];

                    //determine who the other user is

                    const otherUserId = user1Id === userId ? user2Id :userId;

                    //get the other user's details
                    const otherUser = await prisma.user.findUnique({
                        where:{id:otherUserId},
                        select:{
                            id:true,
                            name:true,
                            username:true,
                            profilePic:true,
                            About:true
                        }
                    });

                    if(!otherUser){
                        console.log(`Other user not found :${otherUserId}`);
                        return null;
                    }

                    //get last message in this room

                    const lastMessage = await prisma.message.findFirst({
                        where:{roomId:room.roomId},
                        orderBy:{timestamp:"desc"},
                        select:{
                            content:true,
                            timestamp:true,
                            senderId:true,
                            status:true
                        }
                    })

                    const unreadCount = await prisma.message.count({
                        where:{
                            roomId:room.roomId,
                            receiverId:userId,
                            status:'sent'
                        }
                    });

                    return {
                        roomId:room.roomId,
                        user:otherUser,
                        lastMessage:lastMessage?.content || 'Start Chatting...',
                        lastMessageTime:lastMessage?.timestamp || room.lastActivity,
                        unreadCount:unreadCount
                    };

                }catch(error){
                    console.error( `error processing room ${room.roomId}:`, error);
                    return null;
                }
            })
        );

        





    } catch (error) {
        
    }














}








