import express from "express";

import {
  sendDirectMessage,
  sendGroupMessage,
  uploadMessageImage,
  toggleMessageReaction,
  editMessage,
  deleteMessage,
} from "../controllers/messageController.js";
import {
  checkFriendship,
  checkGroupMembership,
} from "../middlewares/friendMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/direct", checkFriendship, sendDirectMessage);
router.post("/group", checkGroupMembership, sendGroupMessage);
router.post("/upload-image", upload.single("file"), uploadMessageImage);
router.patch("/:messageId/reaction", toggleMessageReaction);
router.patch("/:messageId", editMessage);
router.delete("/:messageId", deleteMessage);

export default router;
