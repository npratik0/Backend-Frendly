// import { MessageModel, IMessage } from "../models/message.model";
// import { ConversationModel } from "../models/conversation.model";
// import mongoose from "mongoose";

// export class MessageRepository {
//   async createMessage(
//     senderId: string,
//     receiverId: string,
//     content: string,
//     messageType: "text" | "image" | "file" = "text",
//     fileUrl?: string
//   ): Promise<IMessage> {
//     // Find or create conversation
//     let conversation = await ConversationModel.findOne({
//       participants: { $all: [senderId, receiverId] },
//     });

//     if (!conversation) {
//       conversation = await ConversationModel.create({
//         participants: [senderId, receiverId],
//         unreadCount: new Map([
//           [senderId, 0],
//           [receiverId, 0],
//         ]),
//       });
//     }

//     // Create message
//     const message = await MessageModel.create({
//       conversationId: conversation._id,
//       sender: senderId,
//       receiver: receiverId,
//       content,
//       messageType,
//       fileUrl,
//       isRead: false,
//       isDelivered: false,
//     });

//     // Update conversation
//     await ConversationModel.findByIdAndUpdate(conversation._id, {
//       lastMessage: message._id,
//       lastMessageTime: new Date(),
//       $inc: {
//         [`unreadCount.${receiverId}`]: 1,
//       },
//     });

//     return message;
//   }

//   async getConversationMessages(
//     conversationId: string,
//     page: number = 1,
//     limit: number = 50
//   ): Promise<IMessage[]> {
//     const skip = (page - 1) * limit;
//     return await MessageModel.find({ conversationId })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate("sender", "username fullName profilePicture")
//       .populate("receiver", "username fullName profilePicture");
//   }

//   async getMessagesBetweenUsers(
//     userId1: string,
//     userId2: string,
//     page: number = 1,
//     limit: number = 50
//   ): Promise<IMessage[]> {
//     const conversation = await ConversationModel.findOne({
//       participants: { $all: [userId1, userId2] },
//     });

//     if (!conversation) {
//       return [];
//     }

//     return this.getConversationMessages(
//       conversation._id.toString(),
//       page,
//       limit
//     );
//   }

//   async getUserConversations(userId: string): Promise<any[]> {
//     const conversations = await ConversationModel.find({
//       participants: userId,
//     })
//       .populate("participants", "username fullName profilePicture")
//       .populate({
//         path: "lastMessage",
//         populate: {
//           path: "sender",
//           select: "username fullName profilePicture",
//         },
//       })
//       .sort({ lastMessageTime: -1 });

//     return conversations.map((conv: any) => {
//       const otherParticipant = conv.participants.find(
//         (p: any) => p._id.toString() !== userId
//       );

//       return {
//         _id: conv._id,
//         participant: {
//           _id: otherParticipant._id,
//           username: otherParticipant.username,
//           fullName: otherParticipant.fullName,
//           profilePicture: otherParticipant.profilePicture,
//         },
//         lastMessage: conv.lastMessage
//           ? {
//               _id: conv.lastMessage._id,
//               content: conv.lastMessage.content,
//               sender: conv.lastMessage.sender._id,
//               createdAt: conv.lastMessage.createdAt,
//               isRead: conv.lastMessage.isRead,
//             }
//           : null,
//         unreadCount: conv.unreadCount.get(userId) || 0,
//         lastMessageTime: conv.lastMessageTime,
//       };
//     });
//   }

//   async markMessagesAsRead(
//     conversationId: string,
//     userId: string
//   ): Promise<void> {
//     await MessageModel.updateMany(
//       {
//         conversationId,
//         receiver: userId,
//         isRead: false,
//       },
//       {
//         isRead: true,
//       }
//     );

//     await ConversationModel.findByIdAndUpdate(conversationId, {
//       [`unreadCount.${userId}`]: 0,
//     });
//   }

//   async markMessageAsDelivered(messageId: string): Promise<void> {
//     await MessageModel.findByIdAndUpdate(messageId, { isDelivered: true });
//   }

//   async deleteMessage(messageId: string, userId: string): Promise<boolean> {
//     const message = await MessageModel.findById(messageId);
//     if (!message || message.sender.toString() !== userId) {
//       return false;
//     }
//     await MessageModel.findByIdAndDelete(messageId);
//     return true;
//   }

//   async searchMessages(userId: string, query: string): Promise<IMessage[]> {
//     return await MessageModel.find({
//       $or: [{ sender: userId }, { receiver: userId }],
//       content: { $regex: query, $options: "i" },
//     })
//       .populate("sender", "username fullName profilePicture")
//       .populate("receiver", "username fullName profilePicture")
//       .sort({ createdAt: -1 })
//       .limit(50);
//   }
// }





import { MessageModel, IMessage } from "../models/message.model";
import { ConversationModel } from "../models/conversation.model";
import mongoose from "mongoose";

export class MessageRepository {
  async createMessage(
    senderId: string,
    receiverId: string,
    content: string,
    messageType: "text" | "image" | "file" = "text",
    fileUrl?: string
  ): Promise<IMessage> {
    // Convert string IDs to ObjectId
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // Find or create conversation
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderObjectId, receiverObjectId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderObjectId, receiverObjectId],
        unreadCount: new Map([
          [senderId, 0],
          [receiverId, 0],
        ]),
      });
    }

    // Create message
    const message = await MessageModel.create({
      conversationId: conversation._id,
      sender: senderObjectId,
      receiver: receiverObjectId,
      content,
      messageType,
      fileUrl,
      isRead: false,
      isDelivered: false,
    });

    // Update conversation
    await ConversationModel.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageTime: new Date(),
      $inc: {
        [`unreadCount.${receiverId}`]: 1,
      },
    });

    return message;
  }

  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<IMessage[]> {
    const skip = (page - 1) * limit;
    return await MessageModel.find({ 
      conversationId: new mongoose.Types.ObjectId(conversationId) 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username fullName profilePicture")
      .populate("receiver", "username fullName profilePicture");
  }

  async getMessagesBetweenUsers(
    userId1: string,
    userId2: string,
    page: number = 1,
    limit: number = 50
  ): Promise<IMessage[]> {
    const user1ObjectId = new mongoose.Types.ObjectId(userId1);
    const user2ObjectId = new mongoose.Types.ObjectId(userId2);

    const conversation = await ConversationModel.findOne({
      participants: { $all: [user1ObjectId, user2ObjectId] },
    });

    if (!conversation) {
      return [];
    }

    return this.getConversationMessages(
      conversation._id.toString(),
      page,
      limit
    );
  }

  async getUserConversations(userId: string): Promise<any[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await ConversationModel.find({
      participants: userObjectId,
    })
      .populate("participants", "username fullName profilePicture")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username fullName profilePicture",
        },
      })
      .sort({ lastMessageTime: -1 });

    return conversations.map((conv: any) => {
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== userId
      );

      return {
        _id: conv._id,
        participant: {
          _id: otherParticipant._id,
          username: otherParticipant.username,
          fullName: otherParticipant.fullName,
          profilePicture: otherParticipant.profilePicture,
        },
        lastMessage: conv.lastMessage
          ? {
              _id: conv.lastMessage._id,
              content: conv.lastMessage.content,
              sender: conv.lastMessage.sender._id,
              createdAt: conv.lastMessage.createdAt,
              isRead: conv.lastMessage.isRead,
            }
          : null,
        unreadCount: conv.unreadCount.get(userId) || 0,
        lastMessageTime: conv.lastMessageTime,
      };
    });
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    await MessageModel.updateMany(
      {
        conversationId: conversationObjectId,
        receiver: userObjectId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    await ConversationModel.findByIdAndUpdate(conversationObjectId, {
      [`unreadCount.${userId}`]: 0,
    });
  }

  async markMessageAsDelivered(messageId: string): Promise<void> {
    await MessageModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(messageId),
      { isDelivered: true }
    );
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const message = await MessageModel.findById(
      new mongoose.Types.ObjectId(messageId)
    );
    if (!message || message.sender.toString() !== userId) {
      return false;
    }
    await MessageModel.findByIdAndDelete(new mongoose.Types.ObjectId(messageId));
    return true;
  }

  async searchMessages(userId: string, query: string): Promise<IMessage[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    return await MessageModel.find({
      $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      content: { $regex: query, $options: "i" },
    })
      .populate("sender", "username fullName profilePicture")
      .populate("receiver", "username fullName profilePicture")
      .sort({ createdAt: -1 })
      .limit(50);
  }
}