import express from "express";
import { verifyToken } from "../middlewars/authMiddleware.js";
import {
  createCommunityController,
  updateCommunityAvatarController,
  updateCommunityBannerController,
  updateCommunityDescriptionController,
  deleteCommunity,
  getAllCommunity,
  getCommunity,
} from "../controllers/communityController.js";
import { createImageUploader } from "../utils/uploads.js";

const router = express.Router();
const uploadAvatarImage = createImageUploader("uploads/community/avatar", [
  "avatar",
  "image",
  "file",
]);
const uploadBannerImage = createImageUploader("uploads/community/banner", [
  "avatar",
  "image",
  "file",
]);

router.post("/create", verifyToken, createCommunityController);
router.put("/", verifyToken, updateCommunityDescriptionController);
router.get("/", verifyToken, getAllCommunity);
router.get("/:communityId", verifyToken, getCommunity);
router.delete("/:communityId", verifyToken, deleteCommunity);
router.post(
  "/avatar",
  verifyToken,
  uploadAvatarImage,
  updateCommunityAvatarController,
);
router.post(
  "/banner",
  verifyToken,
  uploadBannerImage,
  updateCommunityBannerController,
);

export default router;
