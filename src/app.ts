import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from 'path';

// import { connectDatabase } from "./database/mongodb";
// import { PORT } from "./config";

import authRoutes from "./routes/auth.routes";
import adminUserRoutes from "./routes/admin/user.routes";
import postRoutes from "./routes/post.routes";
import messageRoutes from "./routes/message.routes";


dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// // Handle preflight requests
// app.options("*", cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});

// Increase payload limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// async function startServer() {
//   try {
//     await connectDatabase(); 
//     console.log("Mongoose readyState:", mongoose.connection.readyState);

//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Server startup failed:", error);
//     process.exit(1);
//   }
// }

// startServer();

// Add this before export default app
app.get("/socket-test", (req, res) => {
  res.json({
    message: "Server is running, socket connection is enabled",
    port: process.env.PORT || 5050,
    timestamp: new Date().toISOString(),
  });
});

export default app;
