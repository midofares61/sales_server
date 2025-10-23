import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/index.js';
import router from './routes/index.js';
import { connectDatabase } from './models/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { SocketEvents, emitEvent } from './utils/socketEvents.js';
import keepAliveService from './services/keepAlive.service.js';

// Validate required environment variables
if (!env.jwt.secret) {
  console.error('❌ JWT_SECRET environment variable is required');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS and logging
app.use(cors());
app.use(morgan('dev'));

// Attach io to req for controllers to emit
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api', router);

app.use(errorHandler);

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const start = async () => {
  try {
    await connectDatabase();
    server.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${env.port}`);
      
      // تفعيل خدمة Keep-Alive إذا كان SERVER_URL موجود في المتغيرات البيئية
      if (env.serverUrl) {
        const pingInterval = env.keepAlivePingInterval || 10; // افتراضي 10 دقائق
        keepAliveService.start(env.serverUrl, pingInterval);
        console.log(`🔄 Keep-Alive service activated for: ${env.serverUrl}`);
      } else {
        console.log('ℹ️ Keep-Alive service disabled (SERVER_URL not set)');
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();


