// import express, { Application, Request, Response } from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
// import path from 'path';

import app from "./app";
import { connectDatabase } from "./database/mongodb";
import { initializeSocket } from "./config/socket.config";
import { PORT } from "./config";

// import authRoutes from "./routes/auth.routes";
// import adminUserRoutes from "./routes/admin/user.routes"


// dotenv.config();

// const app: Application = express();

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//   })
// );

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello world");
// });


// app.use("/api/auth", authRoutes);
// app.use('/api/admin/users', adminUserRoutes);


const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

async function startServer() {
  try {
    await connectDatabase(); 
    console.log("Mongoose readyState:", mongoose.connection.readyState);

     // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = initializeSocket(server);
    console.log("✅ Socket.IO initialized successfully");

    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`✅ HTTP: http://localhost:${PORT}`);
      console.log(`✅ WebSocket: ws://localhost:${PORT}`);
      console.log(`✅ Frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
    });
    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}
// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error);
  process.exit(1);
});

startServer();
