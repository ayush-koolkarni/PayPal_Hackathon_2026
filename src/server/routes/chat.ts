import { Router, Request, Response } from 'express';
import { dbService } from '../db/index.js';
import { runShoppingAgent } from '../services/gemini.js';
import { getLocationByCountryCode } from '../services/geo.js';
import type { ChatMessage, UserLocation } from '../types/index.js';

const router = Router();

router.post('/chat/stream', async (req: Request, res: Response) => {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { message, sessionId: providedSessionId, userLocation: providedLocation } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      sendEvent({ type: 'error', error: 'User message is required.' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Resolve or generate Session
    let sessionId = providedSessionId;
    let existingSession = sessionId ? dbService.getSession(sessionId) : null;

    const userLocation: UserLocation = providedLocation || (existingSession
      ? getLocationByCountryCode(existingSession.countryCode)
      : getLocationByCountryCode('IN'));

    if (!existingSession) {
      sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      // Create a nice initial session title from the first query
      const autoTitle = message.trim().slice(0, 36) + (message.length > 36 ? '...' : '');
      existingSession = dbService.createSession({
        id: sessionId,
        title: autoTitle,
        countryCode: userLocation.countryCode,
        currencyCode: userLocation.currencyCode,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      sendEvent({ type: 'session_created', session: existingSession });
    }

    // Save User Message to Database
    const userMsgId = `msg_${Date.now()}_u`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      sessionId,
      role: 'user',
      content: message.trim(),
      createdAt: Date.now(),
    };
    dbService.addMessage(userMessage);

    // Fetch conversation history for context
    const history = dbService.getMessages(sessionId);

    // Extract API Key and Model overrides from headers or env
    const apiKey = (req.headers['x-gemini-api-key'] as string) || process.env.GEMINI_API_KEY;
    const modelName = (req.headers['x-gemini-model'] as string) || process.env.DEFAULT_GEMINI_MODEL || 'gemini-3.8-flash';

    // Run the 3-step Agent Pipeline
    const agentResult = await runShoppingAgent(message.trim(), {
      apiKey,
      modelName,
      userLocation,
      history,
      onProgress: (step, stepMsg, detail) => {
        sendEvent({
          type: 'progress',
          step,
          message: stepMsg,
          detail,
        });
      },
    });

    // Save Assistant Message to Database
    const assistantMsgId = `msg_${Date.now()}_a`;
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      sessionId,
      role: 'assistant',
      content: agentResult.content,
      action: agentResult.action,
      clarification: agentResult.clarification,
      products: agentResult.products,
      createdAt: Date.now(),
    };
    dbService.addMessage(assistantMessage);

    // If this was the first turn and the session title was default, update title to something neat
    if (history.length <= 1) {
      let smartTitle = message.trim().slice(0, 32);
      if (agentResult.products && agentResult.products[0]?.category) {
        smartTitle = `${agentResult.products[0].category} in ${userLocation.countryName}`;
      }
      dbService.updateSessionTitle(sessionId, smartTitle);
    }

    // Send Completion Event
    sendEvent({
      type: 'complete',
      message: assistantMessage,
      sessionId,
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    console.error('Chat stream error:', err);
    sendEvent({
      type: 'error',
      error: err.message || 'An unexpected error occurred while executing product research.',
    });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
