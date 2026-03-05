// // // import { Server as HTTPServer } from "http";
// // // import { Server, Socket } from "socket.io";
// // // import jwt from "jsonwebtoken";
// // // import { MessageRepository } from "../repositories/message.repository";

// // // interface AuthenticatedSocket extends Socket {
// // //   userId?: string;
// // // }

// // // const userSockets = new Map<string, string>(); // userId -> socketId
// // // const socketUsers = new Map<string, string>(); // socketId -> userId

// // // export const initializeSocket = (httpServer: HTTPServer) => {
// // //   const io = new Server(httpServer, {
// // //     cors: {
// // //       origin: process.env.FRONTEND_URL || "http://localhost:3000",
// // //       credentials: true,
// // //     },
// // //   });

// // //   const messageRepository = new MessageRepository();

// // //   // Authentication middleware
// // //   io.use((socket: AuthenticatedSocket, next) => {
// // //     try {
// // //       const token = socket.handshake.auth.token;
// // //       if (!token) {
// // //         return next(new Error("Authentication error"));
// // //       }

// // //       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
// // //         userId: string;
// // //       };
// // //       socket.userId = decoded.userId;
// // //       next();
// // //     } catch (error) {
// // //       next(new Error("Authentication error"));
// // //     }
// // //   });

// // //   io.on("connection", (socket: AuthenticatedSocket) => {
// // //     const userId = socket.userId!;
// // //     console.log(`User connected: ${userId}`);

// // //     // Store user socket mapping
// // //     userSockets.set(userId, socket.id);
// // //     socketUsers.set(socket.id, userId);

// // //     // Emit user online status
// // //     socket.broadcast.emit("user_online", { userId });

// // //     // Join user's personal room
// // //     socket.join(userId);

// // //     // Handle send message
// // //     socket.on("send_message", async (data) => {
// // //       try {
// // //         const { receiverId, content, messageType, fileUrl } = data;

// // //         const message = await messageRepository.createMessage(
// // //           userId,
// // //           receiverId,
// // //           content,
// // //           messageType || "text",
// // //           fileUrl
// // //         );

// // //         const populatedMessage = await messageRepository
// // //           .getConversationMessages(message.conversationId.toString(), 1, 1)
// // //           .then((msgs) => msgs[0]);

// // //         // Send to receiver if online
// // //         const receiverSocketId = userSockets.get(receiverId);
// // //         if (receiverSocketId) {
// // //           io.to(receiverSocketId).emit("receive_message", {
// // //             message: populatedMessage,
// // //           });

// // //           // Mark as delivered
// // //           await messageRepository.markMessageAsDelivered(
// // //             message._id.toString()
// // //           );
// // //           socket.emit("message_delivered", { messageId: message._id });
// // //         }

// // //         // Confirm to sender
// // //         socket.emit("message_sent", { message: populatedMessage });
// // //       } catch (error: any) {
// // //         socket.emit("message_error", { error: error.message });
// // //       }
// // //     });

// // //     // Handle typing indicator
// // //     socket.on("typing_start", (data) => {
// // //       const { receiverId } = data;
// // //       const receiverSocketId = userSockets.get(receiverId);
// // //       if (receiverSocketId) {
// // //         io.to(receiverSocketId).emit("user_typing", { userId });
// // //       }
// // //     });

// // //     socket.on("typing_stop", (data) => {
// // //       const { receiverId } = data;
// // //       const receiverSocketId = userSockets.get(receiverId);
// // //       if (receiverSocketId) {
// // //         io.to(receiverSocketId).emit("user_stopped_typing", { userId });
// // //       }
// // //     });

// // //     // Handle mark as read
// // //     socket.on("mark_as_read", async (data) => {
// // //       try {
// // //         const { conversationId } = data;
// // //         await messageRepository.markMessagesAsRead(conversationId, userId);

// // //         // Notify sender that messages were read
// // //         const conversation = await messageRepository.getUserConversations(userId);
// // //         const conv = conversation.find(
// // //           (c) => c._id.toString() === conversationId
// // //         );
// // //         if (conv) {
// // //           const otherUserId = conv.participant._id.toString();
// // //           const otherSocketId = userSockets.get(otherUserId);
// // //           if (otherSocketId) {
// // //             io.to(otherSocketId).emit("messages_read", { conversationId });
// // //           }
// // //         }
// // //       } catch (error: any) {
// // //         console.error("Error marking messages as read:", error);
// // //       }
// // //     });

// // //     // Handle disconnect
// // //     socket.on("disconnect", () => {
// // //       console.log(`User disconnected: ${userId}`);
// // //       userSockets.delete(userId);
// // //       socketUsers.delete(socket.id);
// // //       socket.broadcast.emit("user_offline", { userId });
// // //     });
// // //   });

// // //   return io;
// // // };




// // import { Server as HTTPServer } from "http";
// // import { Server, Socket } from "socket.io";
// // import jwt from "jsonwebtoken";
// // import { MessageRepository } from "../repositories/message.repository";

// // interface AuthenticatedSocket extends Socket {
// //   userId?: string;
// // }

// // const userSockets = new Map<string, string>();
// // const socketUsers = new Map<string, string>();

// // export const initializeSocket = (httpServer: HTTPServer) => {
// //   const io = new Server(httpServer, {
// //     cors: {
// //       origin: process.env.FRONTEND_URL || "http://localhost:3000",
// //       credentials: true,
// //       methods: ["GET", "POST"],
// //     },
// //     transports: ["websocket", "polling"],
// //   });

// //   const messageRepository = new MessageRepository();

// //   // Authentication middleware
// //   io.use((socket: AuthenticatedSocket, next) => {
// //     try {
// //       const token = socket.handshake.auth.token;
      
// //       console.log("🔐 Socket authentication attempt");
      
// //       if (!token) {
// //         console.log("❌ No token provided");
// //         return next(new Error("Authentication error: No token"));
// //       }

// //       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
// //         userId: string;
// //       };
      
// //       socket.userId = decoded.userId;
// //       console.log(`✅ User authenticated: ${decoded.userId}`);
// //       next();
// //     } catch (error) {
// //       console.error("❌ Socket authentication error:", error);
// //       next(new Error("Authentication error"));
// //     }
// //   });

// //   io.on("connection", (socket: AuthenticatedSocket) => {
// //     const userId = socket.userId!;
// //     console.log(`✅ User connected: ${userId}, Socket ID: ${socket.id}`);

// //     // Store user socket mapping
// //     userSockets.set(userId, socket.id);
// //     socketUsers.set(socket.id, userId);

// //     // Emit user online status
// //     socket.broadcast.emit("user_online", { userId });

// //     // Join user's personal room
// //     socket.join(userId);

// //     // Handle send message
// //     socket.on("send_message", async (data) => {
// //       console.log("📨 Received send_message event:", data);
      
// //       try {
// //         const { receiverId, content, messageType, fileUrl } = data;

// //         if (!receiverId || !content) {
// //           console.error("❌ Missing receiverId or content");
// //           socket.emit("message_error", { error: "Missing required fields" });
// //           return;
// //         }

// //         console.log(`Creating message from ${userId} to ${receiverId}`);

// //         const message = await messageRepository.createMessage(
// //           userId,
// //           receiverId,
// //           content,
// //           messageType || "text",
// //           fileUrl
// //         );

// //         console.log("✅ Message created:", message._id);

// //         const populatedMessage = await messageRepository
// //           .getConversationMessages(message.conversationId.toString(), 1, 1)
// //           .then((msgs) => msgs[0]);

// //         console.log("✅ Message populated");

// //         // Send to receiver if online
// //         const receiverSocketId = userSockets.get(receiverId);
// //         if (receiverSocketId) {
// //           console.log(`📤 Sending message to receiver socket: ${receiverSocketId}`);
// //           io.to(receiverSocketId).emit("receive_message", {
// //             message: populatedMessage,
// //           });

// //           // Mark as delivered
// //           await messageRepository.markMessageAsDelivered(
// //             message._id.toString()
// //           );
// //           socket.emit("message_delivered", { messageId: message._id });
// //           console.log("✅ Message delivered");
// //         } else {
// //           console.log(`⚠️ Receiver ${receiverId} is offline`);
// //         }

// //         // Confirm to sender
// //         socket.emit("message_sent", { message: populatedMessage });
// //         console.log("✅ Message sent confirmation sent to sender");
// //       } catch (error: any) {
// //         console.error("❌ Error sending message:", error);
// //         socket.emit("message_error", { error: error.message });
// //       }
// //     });

// //     // Handle typing indicator
// //     socket.on("typing_start", (data) => {
// //       console.log("⌨️ User typing:", userId);
// //       const { receiverId } = data;
// //       const receiverSocketId = userSockets.get(receiverId);
// //       if (receiverSocketId) {
// //         io.to(receiverSocketId).emit("user_typing", { userId });
// //       }
// //     });

// //     socket.on("typing_stop", (data) => {
// //       console.log("⌨️ User stopped typing:", userId);
// //       const { receiverId } = data;
// //       const receiverSocketId = userSockets.get(receiverId);
// //       if (receiverSocketId) {
// //         io.to(receiverSocketId).emit("user_stopped_typing", { userId });
// //       }
// //     });

// //     // Handle mark as read
// //     socket.on("mark_as_read", async (data) => {
// //       console.log("👁️ Mark as read:", data);
// //       try {
// //         const { conversationId } = data;
// //         await messageRepository.markMessagesAsRead(conversationId, userId);

// //         // Notify sender that messages were read
// //         const conversations = await messageRepository.getUserConversations(userId);
// //         const conv = conversations.find(
// //           (c) => c._id.toString() === conversationId
// //         );
// //         if (conv) {
// //           const otherUserId = conv.participant._id.toString();
// //           const otherSocketId = userSockets.get(otherUserId);
// //           if (otherSocketId) {
// //             io.to(otherSocketId).emit("messages_read", { conversationId });
// //             console.log("✅ Messages marked as read");
// //           }
// //         }
// //       } catch (error: any) {
// //         console.error("❌ Error marking messages as read:", error);
// //       }
// //     });

// //     // Handle disconnect
// //     socket.on("disconnect", () => {
// //       console.log(`❌ User disconnected: ${userId}`);
// //       userSockets.delete(userId);
// //       socketUsers.delete(socket.id);
// //       socket.broadcast.emit("user_offline", { userId });
// //     });
// //   });

// //   return io;
// // };


// import { Server as HTTPServer } from "http";
// import { Server, Socket } from "socket.io";
// import jwt from "jsonwebtoken";
// import { MessageRepository } from "../repositories/message.repository";

// interface AuthenticatedSocket extends Socket {
//   userId?: string;
// }

// interface JWTPayload {
//   id?: string;
//   userId?: string;
//   email: string;
// }

// const userSockets = new Map<string, string>();
// const socketUsers = new Map<string, string>();

// export const initializeSocket = (httpServer: HTTPServer) => {
//   const io = new Server(httpServer, {
//     cors: {
//       origin: process.env.FRONTEND_URL || "http://localhost:3000",
//       credentials: true,
//       methods: ["GET", "POST"],
//     },
//     transports: ["websocket", "polling"],
//   });

//   const messageRepository = new MessageRepository();

//   // Authentication middleware
//   io.use((socket: AuthenticatedSocket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
      
//       console.log("🔐 Socket authentication attempt");
      
//       if (!token) {
//         console.log("❌ No token provided");
//         return next(new Error("Authentication error: No token"));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
//       // Handle both 'id' and 'userId' fields
//       const userId = decoded.userId || decoded.id;
      
//       if (!userId) {
//         console.log("❌ No userId found in token");
//         return next(new Error("Authentication error: No userId in token"));
//       }
      
//       socket.userId = userId;
//       console.log(`✅ User authenticated: ${userId}`);
//       next();
//     } catch (error: any) {
//       console.error("❌ Socket authentication error:", error.message);
//       next(new Error("Authentication error"));
//     }
//   });

//   io.on("connection", (socket: AuthenticatedSocket) => {
//     const userId = socket.userId!;
//     console.log(`✅ User connected: ${userId}, Socket ID: ${socket.id}`);

//     // Store user socket mapping
//     userSockets.set(userId, socket.id);
//     socketUsers.set(socket.id, userId);

//     // Emit user online status
//     socket.broadcast.emit("user_online", { userId });

//     // Join user's personal room
//     socket.join(userId);

//     // Handle send message
//     socket.on("send_message", async (data) => {
//       console.log("📨 Received send_message event:", data);
      
//       try {
//         const { receiverId, content, messageType, fileUrl } = data;

//         if (!receiverId || !content) {
//           console.error("❌ Missing receiverId or content");
//           socket.emit("message_error", { error: "Missing required fields" });
//           return;
//         }

//         console.log(`Creating message from ${userId} to ${receiverId}`);

//         const message = await messageRepository.createMessage(
//           userId,
//           receiverId,
//           content,
//           messageType || "text",
//           fileUrl
//         );

//         console.log("✅ Message created:", message._id);

//         const populatedMessage = await messageRepository
//           .getConversationMessages(message.conversationId.toString(), 1, 1)
//           .then((msgs) => msgs[0]);

//         console.log("✅ Message populated");

//         // Send to receiver if online
//         const receiverSocketId = userSockets.get(receiverId);
//         if (receiverSocketId) {
//           console.log(`📤 Sending message to receiver socket: ${receiverSocketId}`);
//           io.to(receiverSocketId).emit("receive_message", {
//             message: populatedMessage,
//           });

//           // Mark as delivered
//           await messageRepository.markMessageAsDelivered(
//             message._id.toString()
//           );
//           socket.emit("message_delivered", { messageId: message._id });
//           console.log("✅ Message delivered");
//         } else {
//           console.log(`⚠️ Receiver ${receiverId} is offline`);
//         }

//         // Confirm to sender
//         socket.emit("message_sent", { message: populatedMessage });
//         console.log("✅ Message sent confirmation sent to sender");
//       } catch (error: any) {
//         console.error("❌ Error sending message:", error);
//         socket.emit("message_error", { error: error.message });
//       }
//     });

//     // Handle typing indicator
//     socket.on("typing_start", (data) => {
//       console.log("⌨️ User typing:", userId);
//       const { receiverId } = data;
//       const receiverSocketId = userSockets.get(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("user_typing", { userId });
//       }
//     });

//     socket.on("typing_stop", (data) => {
//       console.log("⌨️ User stopped typing:", userId);
//       const { receiverId } = data;
//       const receiverSocketId = userSockets.get(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("user_stopped_typing", { userId });
//       }
//     });

//     // Handle mark as read
//     socket.on("mark_as_read", async (data) => {
//       console.log("👁️ Mark as read:", data);
//       try {
//         const { conversationId } = data;
//         await messageRepository.markMessagesAsRead(conversationId, userId);

//         // Notify sender that messages were read
//         const conversations = await messageRepository.getUserConversations(userId);
//         const conv = conversations.find(
//           (c) => c._id.toString() === conversationId
//         );
//         if (conv) {
//           const otherUserId = conv.participant._id.toString();
//           const otherSocketId = userSockets.get(otherUserId);
//           if (otherSocketId) {
//             io.to(otherSocketId).emit("messages_read", { conversationId });
//             console.log("✅ Messages marked as read");
//           }
//         }
//       } catch (error: any) {
//         console.error("❌ Error marking messages as read:", error);
//       }
//     });

//     // Handle disconnect
//     socket.on("disconnect", () => {
//       console.log(`❌ User disconnected: ${userId}`);
//       userSockets.delete(userId);
//       socketUsers.delete(socket.id);
//       socket.broadcast.emit("user_offline", { userId });
//     });
//   });

//   return io;
// };


import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { MessageRepository } from "../repositories/message.repository";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface JWTPayload {
  id?: string;
  userId?: string;
  email: string;
}

const userSockets = new Map<string, string>();
const socketUsers = new Map<string, string>();

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  console.log("🔌 Socket.IO server created");

  const messageRepository = new MessageRepository();

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log("❌ No token provided in socket handshake");
        return next(new Error("Authentication error: No token"));
      }

      console.log("🔐 Verifying token...");
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      
      // Handle both 'id' and 'userId' fields
      const userId = decoded.userId || decoded.id;
      
      if (!userId) {
        console.log("❌ No userId found in token");
        return next(new Error("Authentication error: No userId in token"));
      }
      
      socket.userId = userId;
      console.log(`✅ User authenticated: ${userId}`);
      next();
    } catch (error: any) {
      console.error("❌ Socket authentication error:", error.message);
      next(new Error(`Authentication error: ${error.message}`));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`\n✅ NEW CONNECTION`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   Transport: ${socket.conn.transport.name}\n`);

    // Store user socket mapping
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Emit user online status
    socket.broadcast.emit("user_online", { userId });

    // Join user's personal room
    socket.join(userId);

    // Send connection confirmation
    socket.emit("connected", { userId, socketId: socket.id });

    // Handle send message
    socket.on("send_message", async (data) => {
      console.log("\n📨 SEND MESSAGE EVENT");
      console.log("   From:", userId);
      console.log("   To:", data.receiverId);
      console.log("   Content:", data.content?.substring(0, 50));
      
      try {
        const { receiverId, content, messageType, fileUrl } = data;

        if (!receiverId || !content) {
          console.error("❌ Missing receiverId or content");
          socket.emit("message_error", { error: "Missing required fields" });
          return;
        }

        const message = await messageRepository.createMessage(
          userId,
          receiverId,
          content,
          messageType || "text",
          fileUrl
        );

        console.log("   ✅ Message saved to DB:", message._id);

        const populatedMessage = await messageRepository
          .getConversationMessages(message.conversationId.toString(), 1, 1)
          .then((msgs) => msgs[0]);

        // Send to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          console.log("   📤 Receiver is online, sending message");
          io.to(receiverSocketId).emit("receive_message", {
            message: populatedMessage,
          });

          // Mark as delivered
          await messageRepository.markMessageAsDelivered(
            message._id.toString()
          );
          socket.emit("message_delivered", { messageId: message._id });
        } else {
          console.log("   ⚠️ Receiver is offline");
        }

        // Confirm to sender
        socket.emit("message_sent", { message: populatedMessage });
        console.log("   ✅ Confirmation sent to sender\n");
      } catch (error: any) {
        console.error("❌ Error sending message:", error);
        socket.emit("message_error", { error: error.message });
      }
    });

    // Handle typing indicator
    socket.on("typing_start", (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_typing", { userId });
      }
    });

    socket.on("typing_stop", (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user_stopped_typing", { userId });
      }
    });

    // Handle mark as read
    socket.on("mark_as_read", async (data) => {
      try {
        const { conversationId } = data;
        await messageRepository.markMessagesAsRead(conversationId, userId);

        const conversations = await messageRepository.getUserConversations(userId);
        const conv = conversations.find(
          (c) => c._id.toString() === conversationId
        );
        if (conv) {
          const otherUserId = conv.participant._id.toString();
          const otherSocketId = userSockets.get(otherUserId);
          if (otherSocketId) {
            io.to(otherSocketId).emit("messages_read", { conversationId });
          }
        }
      } catch (error: any) {
        console.error("❌ Error marking messages as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`\n❌ DISCONNECTION`);
      console.log(`   User ID: ${userId}`);
      console.log(`   Reason: ${reason}\n`);
      
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      socket.broadcast.emit("user_offline", { userId });
    });
  });

  console.log("✅ Socket.IO event handlers registered");
  return io;
};