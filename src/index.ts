import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from 'path';

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

import authRoutes from "./routes/auth.routes";
import adminUserRoutes from "./routes/admin/user.routes"


dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world");
});


app.use("/api/auth", authRoutes);
app.use('/api/admin/users', adminUserRoutes);

async function startServer() {
  try {
    await connectDatabase(); 
    console.log("Mongoose readyState:", mongoose.connection.readyState);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
