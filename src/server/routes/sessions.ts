import { Router, Request, Response } from 'express';
import { dbService } from '../db/index.js';
import type { ChatSession } from '../types/index.js';

const router = Router();

// GET all sessions
router.get('/sessions', (_req: Request, res: Response) => {
  try {
    const sessions = dbService.getSessions();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new session
router.post('/sessions', (req: Request, res: Response) => {
  try {
    const { id, title, countryCode, currencyCode } = req.body;
    const session: ChatSession = {
      id: id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: title || 'New Shopping Thread',
      countryCode: countryCode || 'IN',
      currencyCode: currencyCode || 'INR',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dbService.createSession(session);
    res.status(201).json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET a specific session and all its messages
router.get('/sessions/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const session = dbService.getSession(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    const messages = dbService.getMessages(id);
    res.json({ session, messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RENAME session title
router.patch('/sessions/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'Title is required' });
      return;
    }
    dbService.updateSessionTitle(id, title);
    res.json({ success: true, id, title });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE session
router.delete('/sessions/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    dbService.deleteSession(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
