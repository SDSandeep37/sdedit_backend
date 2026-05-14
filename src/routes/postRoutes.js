import express from "express";
import { verifyToken } from "../middlewars/authMiddleware.js";
import { createImageUploader } from "../utils/uploads.js";
import {
  createPostController,
  deletePost,
  getAllPost,
  getPOst,
  updatePostDetails,
  updatePostImage,
} from "../controllers/postController.js";

const router = express.Router();
const uploadAvatarImage = createImageUploader("uploads/post/image", [
  "avatar",
  "image",
  "file",
]);
// protected routes

router.post("/create", verifyToken, uploadAvatarImage, createPostController);
router.put("/poster", verifyToken, uploadAvatarImage, updatePostImage);
router.put("/details", verifyToken, updatePostDetails);
router.delete("/:postId", verifyToken, deletePost);
router.get("/:postId", verifyToken, getPOst);
router.get("/", verifyToken, getAllPost);
router.delete("/:postId", verifyToken, deletePost);
export default router;
