import express from "express";
import { updateProfile } from "../controllers/profile.controller";
import { verifyAuth } from "../middleware/verifyAuth";

const router = express.Router();


router.put("/update" , verifyAuth , updateProfile);

export default router;


