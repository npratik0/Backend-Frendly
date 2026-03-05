import { MessageRepository } from "../repositories/message.repository";
import { NotFoundError, BadRequestError } from "../errors/custom-errors";

export class MessageService {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    messageType: "text" | "image" | "file" = "text",
    fileUrl?: string
  ) {
    if (!content && !fileUrl) {
      throw new BadRequestError("Message content or file is required");
    }

    if (senderId === receiverId) {
      throw new BadRequestError("Cannot send message to yourself");
    }

    const message = await this.messageRepository.createMessage(
      senderId,
      receiverId,
      content,
      messageType,
      fileUrl
    );

    return {
      _id: message._id,
      conversationId: message.conversationId,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      messageType: message.messageType,
      fileUrl: message.fileUrl,
      isRead: message.isRead,
      isDelivered: message.isDelivered,
      createdAt: message.createdAt,
    };
  }

  async getConversations(userId: string) {
    return await this.messageRepository.getUserConversations(userId);
  }

  async getMessages(userId: string, otherUserId: string, page: number = 1) {
    const messages = await this.messageRepository.getMessagesBetweenUsers(
      userId,
      otherUserId,
      page
    );

    return messages.reverse(); // Return in chronological order
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.messageRepository.markMessagesAsRead(conversationId, userId);
    return { success: true };
  }

  async deleteMessage(messageId: string, userId: string) {
    const deleted = await this.messageRepository.deleteMessage(
      messageId,
      userId
    );
    if (!deleted) {
      throw new BadRequestError("Cannot delete this message");
    }
    return { success: true };
  }

  async searchMessages(userId: string, query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestError("Search query must be at least 2 characters");
    }
    return await this.messageRepository.searchMessages(userId, query);
  }
}