import express from "express";
import {
  login,
  logout,
  register,
  updateAvatar,
  updateUserDetailsController,
  userSession,
} from "../controllers/userController.js";
import { verifyToken } from "../middlewars/authMiddleware.js";
import { createImageUploader } from "../utils/uploads.js";

const router = express.Router();
const uploadAvatarImage = createImageUploader("uploads/user/avatar", [
  "avatar",
  "image",
  "file",
]);
router.post("/register", register);
router.post("/login", login);
// protected routes
router.post("/logout", verifyToken, logout);
router.put("/update", verifyToken, updateUserDetailsController);
router.post("/avatar", verifyToken, uploadAvatarImage, updateAvatar);
router.get("/session", verifyToken, userSession);
export default router;
