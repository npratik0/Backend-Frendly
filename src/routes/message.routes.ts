import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();
const messageController = new MessageController();

router.use(authenticateToken);

// Get all conversations
router.get("/conversations", messageController.getConversations);

// Get messages with a specific user
router.get("/user/:userId", messageController.getMessages);

// Send message
router.post("/", messageController.sendMessage);

// Mark messages as read
router.put("/:conversationId/read", messageController.markAsRead);

// Delete message
router.delete("/:messageId", messageController.deleteMessage);

// Search messages
router.get("/search", messageController.searchMessages);

export default router;