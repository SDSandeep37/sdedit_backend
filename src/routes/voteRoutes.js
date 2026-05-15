import express from "express";

import { verifyToken } from "../middlewars/authMiddleware.js";
import { voteContoller } from "../controllers/voteController.js";

const router = express.Router();

// protected routes
router.post("/", verifyToken, voteContoller);
export default router;
