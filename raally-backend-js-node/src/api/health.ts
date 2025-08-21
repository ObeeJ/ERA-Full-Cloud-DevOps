import { Router } from 'express';
import { healthCheck } from '../services';

const routes = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *                   properties:
 *                     redis:
 *                       type: boolean
 *                     kafka:
 *                       type: boolean
 *                     database:
 *                       type: boolean
 *       503:
 *         description: Application is unhealthy
 */
routes.get('/health', async (req, res) => {
  try {
    const services = await healthCheck();
    
    // Check database health by running a simple query
    let databaseHealth = false;
    try {
      const { database } = req;
      if (database) {
        await database.query('SELECT 1');
        databaseHealth = true;
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    const allServicesHealthy = services.redis && services.kafka && databaseHealth;
    const status = allServicesHealthy ? 'healthy' : 'degraded';
    const statusCode = allServicesHealthy ? 200 : 503;

    res.status(statusCode).json({
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        redis: services.redis,
        kafka: services.kafka,
        database: databaseHealth,
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Returns 200 when the application is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is ready
 *       503:
 *         description: Application is not ready
 */
routes.get('/health/ready', async (req, res) => {
  try {
    const services = await healthCheck();
    const isReady = services.redis && services.kafka;
    
    if (isReady) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', services });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Returns 200 when the application is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
routes.get('/health/live', (req, res) => {
  res.status(200).json({ 
    status: 'alive', 
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

export default routes;
