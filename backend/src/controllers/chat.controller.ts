import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserChats = async (userId:string)=>{
const rooms = await prisma.chatRoom.findMany({
    where:{
        OR : [
            {roomId: {startsWith: `room:${userId}:`}},
            {roomId :{contains : `${userId}`}},
        ],
    },
    orderBy:{
        lastActivity :"desc",
    },
});













}








