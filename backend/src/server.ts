import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes"
import { CORS_OPTIONS } from "./utils/constants";
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  SocketData, 
  InterServerEvents 
} from "../src/types/socket";
import { socketAuth } from "./middleware/socketAuth";
import { setupSocketHandlers } from "./sockets/socketHandlers";

// Import environment variables
import dotenv from "dotenv";
dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Socket.io setup
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: CORS_OPTIONS
});

// Socket authentication middleware
io.use(socketAuth);

// Middleware
app.use(express.json());
app.use(cors(CORS_OPTIONS));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats' , chatRoutes);
app.use('/api/messages', messageRoutes);

// Health check route
app.get("/api/health", (req: express.Request, res: express.Response) => {
  res.json({ 
    message: "Server is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Setup socket handlers
setupSocketHandlers(io, prisma);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler - FIXED: Remove the "*" or use app.all('*')
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io server is running`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export { io };
export default app;