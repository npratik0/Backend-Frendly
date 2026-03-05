import { Request, Response } from "express";
import { MessageService } from "../services/message.service";

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  sendMessage = async (req: Request, res: Response) => {
    try {
      const senderId = req.user?._id;
      const { receiverId, content, messageType, fileUrl } = req.body;

      const message = await this.messageService.sendMessage(
        senderId,
        receiverId,
        content,
        messageType,
        fileUrl
      );

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getConversations = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const conversations = await this.messageService.getConversations(userId);

      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getMessages = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const otherUserId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;

      const messages = await this.messageService.getMessages(
        userId,
        otherUserId,
        page
      );

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  markAsRead = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const { conversationId } = req.params;

      const result = await this.messageService.markAsRead(
        conversationId,
        userId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const { messageId } = req.params;

      const result = await this.messageService.deleteMessage(messageId, userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  searchMessages = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const query = req.query.q as string;

      const messages = await this.messageService.searchMessages(userId, query);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
}