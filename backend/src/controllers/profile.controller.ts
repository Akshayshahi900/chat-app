import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }
        const {name , About , profilePic } = req.body;
        if(!name || !About || !profilePic){
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: req.body.name,
                About: req.body.About,
                profilePic: req.body.profilePic,

            }
        });
        res.status(200).json({ message: "Profile updated successfully", user });
    }
    catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }

    finally {
        prisma.$disconnect();
    }

}