import axios from 'axios';

/**
 * Keep-Alive Service
 * يمنع السيرفر من الدخول في وضع Sleep على Render
 * عن طريق إرسال طلبات HTTP دورية للسيرفر نفسه
 */
class KeepAliveService {
  constructor() {
    this.intervalId = null;
    this.pingIntervalMinutes = 10; // كل 10 دقائق (Render ينام بعد 15 دقيقة)
    this.serverUrl = null;
    this.isEnabled = false;
  }

  /**
   * تفعيل خدمة Keep-Alive
   * @param {string} serverUrl - رابط السيرفر (مثال: https://your-app.onrender.com)
   * @param {number} intervalMinutes - المدة بين كل طلب (دقائق)
   */
  start(serverUrl, intervalMinutes = 10) {
    if (this.intervalId) {
      console.log('⚠️ Keep-Alive service is already running');
      return;
    }

    this.serverUrl = serverUrl;
    this.pingIntervalMinutes = intervalMinutes;
    this.isEnabled = true;

    // تحويل الدقائق إلى ملي ثانية
    const intervalMs = this.pingIntervalMinutes * 60 * 1000;

    console.log(`✅ Keep-Alive service started - Pinging ${this.serverUrl} every ${this.pingIntervalMinutes} minutes`);

    // بدء عملية الـ Ping الدورية
    this.intervalId = setInterval(async () => {
      await this.ping();
    }, intervalMs);

    // إرسال أول Ping فوراً
    this.ping();
  }

  /**
   * إيقاف خدمة Keep-Alive
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isEnabled = false;
      console.log('🛑 Keep-Alive service stopped');
    }
  }

  /**
   * إرسال Ping للسيرفر
   */
  async ping() {
    if (!this.serverUrl) {
      console.error('❌ Server URL not set for Keep-Alive service');
      return;
    }

    try {
      const startTime = Date.now();
      const response = await axios.get(`${this.serverUrl}/api/health`, {
        timeout: 30000, // 30 ثانية timeout
        headers: {
          'User-Agent': 'KeepAlive-Service/1.0'
        }
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`🏓 Keep-Alive ping successful - Response time: ${duration}ms - Status: ${response.status}`);
      
      return {
        success: true,
        duration,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Keep-Alive ping failed:`, {
        message: error.message,
        code: error.code,
        url: `${this.serverUrl}/api/health`
      });
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * الحصول على حالة الخدمة
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      serverUrl: this.serverUrl,
      pingIntervalMinutes: this.pingIntervalMinutes,
      nextPingIn: this.intervalId ? `${this.pingIntervalMinutes} minutes` : 'N/A'
    };
  }
}

// إنشاء instance واحد من الخدمة
const keepAliveService = new KeepAliveService();

export default keepAliveService;
