import { Router } from 'express';
import keepAliveService from '../services/keepAlive.service.js';

const router = Router();

/**
 * Health Check Endpoint
 * يستخدم للتحقق من أن السيرفر يعمل بشكل صحيح
 * مفيد لخدمات Keep-Alive وUptimeRobot
 */
router.get('/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    keepAlive: keepAliveService.getStatus()
  };

  res.status(200).json(healthData);
});

/**
 * Ping Endpoint (بسيط وأسرع)
 * للاستخدام في عمليات Ping السريعة
 */
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

/**
 * Keep-Alive Status Endpoint
 * للحصول على حالة خدمة Keep-Alive
 */
router.get('/keepalive/status', (req, res) => {
  const status = keepAliveService.getStatus();
  res.status(200).json(status);
});

export default router;
