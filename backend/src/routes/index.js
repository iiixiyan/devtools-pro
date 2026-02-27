import codeRoutes from './code.js';
import subscriptionsRoutes from './subscriptions.js';
import templatesRoutes from './templates.js';
import apiDocsRoutes from './api-docs.js';
import testsRoutes from './tests.js';

// Health check
const healthRoutes = [
  {
    path: '/health',
    handler: async (req, res) => {
      try {
        const dbRes = await pool.query('SELECT NOW()');
        const redisRes = await redisClient.ping();
        res.json({
          status: 'ok',
          database: 'connected',
          redis: redisRes === 'PONG' ? 'connected' : 'disconnected',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
      }
    }
  }
];

// All routes
const routes = [
  ...healthRoutes,
  {
    path: '/api/v1/code',
    routes: codeRoutes
  },
  {
    path: '/api/v1/subscriptions',
    routes: subscriptionsRoutes
  },
  {
    path: '/api/v1/templates',
    routes: templatesRoutes
  },
  {
    path: '/api/v1/api-docs',
    routes: apiDocsRoutes
  },
  {
    path: '/api/v1/tests',
    routes: testsRoutes
  }
];

export default routes;
