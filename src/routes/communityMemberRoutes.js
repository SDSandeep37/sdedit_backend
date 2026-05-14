import express from "express";

import { verifyToken } from "../middlewars/authMiddleware.js";
import { addCommunityMember } from "../controllers/communityMemberController.js";

const router = express.Router();

// protected routes
router.post("/create", verifyToken, addCommunityMember);
export default router;
