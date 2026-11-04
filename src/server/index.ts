import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';
import locationRouter from './routes/location.js';
import sessionsRouter from './routes/sessions.js';
import imageProxyRouter from './routes/imageProxy.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  if (!req.url.startsWith('/api/health') && !req.url.startsWith('/api/image-proxy')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Register API Endpoints
app.use('/api', healthRouter);
app.use('/api', locationRouter);
app.use('/api', sessionsRouter);
app.use('/api', imageProxyRouter);
app.use('/api', chatRouter);

// Serve compiled frontend in production
const clientDistPath = path.resolve(process.cwd(), 'dist/client');
if (fs.existsSync(clientDistPath)) {
  console.log(`Serving static client assets from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for client routing
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('Client dist folder not found. Serving API only (Run `npm run build:client` to compile frontend).');
  app.get('/', (_req, res) => {
    res.json({
      service: 'nexus-global-shopping-intelligence',
      status: 'API operational',
      docs: '/api/health',
    });
  });
}

// Start Server
const server = app.listen(PORT, HOST, () => {
  console.log(`✨ NEXUS Global Shopping Intelligence Server running at http://${HOST}:${PORT}`);
  console.log(`🌍 Default Gemini Model: ${process.env.DEFAULT_GEMINI_MODEL || 'gemini-3.8-flash'}`);
  console.log(`🔑 Gemini API Key configured in env: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

// Graceful termination
const handleShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down cleanly...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
