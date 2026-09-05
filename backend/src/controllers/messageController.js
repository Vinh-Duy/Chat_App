import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import {
  emitNewMessage,
  updateConversationAfterCreateMessage,
} from "../utils/messageHelper.js";
import { io } from "../socket/index.js";
import { uploadImageFromBuffer } from "../middlewares/uploadMiddleware.js";

export const uploadMessageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const result = await uploadImageFromBuffer(req.file.buffer, {
      folder: "moji_chat/messages",
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    });

    return res.status(201).json({ imgUrl: result.secure_url });
  } catch (error) {
    console.error("Lỗi khi upload ảnh tin nhắn", error);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const { recipientId, content, conversationId, replyToId } = req.body;
    const senderId = req.user._id;

    let conversation;

    if (!content && !req.body.imgUrl) {
      return res.status(400).json({ message: "Thiếu nội dung" });
    }

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        participants: [
          { userId: senderId, joinedAt: new Date() },
          { userId: recipientId, joinedAt: new Date() },
        ],
        lastMessageAt: new Date(),
        unreadCounts: new Map(),
      });
    }

    const replyTo = replyToId ? await Message.findById(replyToId).select("content senderId") : null;
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      content,
      imgUrl: req.body.imgUrl,
      replyTo: replyTo
        ? { messageId: replyTo._id, content: replyTo.content, senderId: replyTo.senderId }
        : undefined,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();

    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn trực tiếp", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { conversationId, content, replyToId } = req.body;
    const senderId = req.user._id;
    const conversation = req.conversation;

    if (!content && !req.body.imgUrl) {
      return res.status(400).json("Thiếu nội dung");
    }

    const replyTo = replyToId ? await Message.findById(replyToId).select("content senderId") : null;
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      imgUrl: req.body.imgUrl,
      replyTo: replyTo
        ? { messageId: replyTo._id, content: replyTo.content, senderId: replyTo.senderId }
        : undefined,
    });

    updateConversationAfterCreateMessage(conversation, message, senderId);

    await conversation.save();
    emitNewMessage(io, conversation, message);

    return res.status(201).json({ message });
  } catch (error) {
    console.error("Lỗi xảy ra khi gửi tin nhắn nhóm", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const toggleMessageReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const allowedEmojis = ["❤️", "👍", "😂", "😮", "😢", "😡"];

    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({ message: "Unsupported reaction" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const conversation = await Conversation.findById(message.conversationId);
    const isMember = conversation?.participants.some(
      (participant) => participant.userId.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "You are not in this conversation" });
    }

    const userId = req.user._id.toString();
    const existing = message.reactions.find(
      (reaction) => reaction.userId.toString() === userId
    );

    if (existing?.emoji === emoji) {
      message.reactions = message.reactions.filter(
        (reaction) => reaction.userId.toString() !== userId
      );
    } else if (existing) {
      existing.emoji = emoji;
    } else {
      message.reactions.push({ userId: req.user._id, emoji });
    }

    await message.save();
    io.to(message.conversationId.toString()).emit("message-reaction", {
      messageId: message._id,
      conversationId: message.conversationId,
      reactions: message.reactions,
    });

    return res.status(200).json({ reactions: message.reactions });
  } catch (error) {
    console.error("Failed to toggle message reaction", error);
    return res.status(500).json({ message: "Could not update reaction" });
  }
};
