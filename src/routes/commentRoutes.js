import express from "express";
import { verifyToken } from "../middlewars/authMiddleware.js";
import {
  createCommnet,
  createReplies,
  getAllCommentsForPost,
  getAllReplies,
} from "../controllers/commentController.js";

const router = express.Router();

// protected routes

router.post("/create", verifyToken, createCommnet);
router.post("/create-reply", verifyToken, createReplies);
router.get("/comments/:postId", verifyToken, getAllCommentsForPost);
router.get("/reply/:postId/:parentCommentId", verifyToken, getAllReplies);
export default router;
