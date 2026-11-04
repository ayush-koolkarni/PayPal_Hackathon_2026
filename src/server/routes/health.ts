import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: Date.now(),
    service: 'nexus-global-shopping-intelligence',
    uptime: process.uptime(),
  });
});

export default router;
