import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// import { createServer } from 'http';
// import { initializeWebSocket } from './services/websocketService.js';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import inventoryRoutes from './routes/inventory.js';
import productionRoutes from './routes/production.js';
import financeRoutes from './routes/finance.js';
import marketingRoutes from './routes/marketing.js';
import communicationRoutes from './routes/communication.js';
import aiRoutes from './routes/ai.js';
import reportRoutes from './routes/reports.js';
import uploadRoutes from './routes/upload.js';
import roleRoutes from './routes/roles.js';
import messageRoutes from './routes/messages.js';
import './jobs/scheduler.js';

dotenv.config();

const app = express();
// const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket
// const io = initializeWebSocket(server);
// export { io };

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', customerRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', productionRoutes);
app.use('/api', financeRoutes);
app.use('/api', marketingRoutes);
app.use('/api', communicationRoutes);
app.use('/api', aiRoutes);
app.use('/api', reportRoutes);
app.use('/api', uploadRoutes);
app.use('/api', roleRoutes);
app.use('/api', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Smart Market Backend running on port ${PORT}`);
  // console.log('WebSocket server initialized');
});

export default app;