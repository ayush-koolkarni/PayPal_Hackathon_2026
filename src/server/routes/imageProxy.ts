import { Router } from 'express';
import { handleImageProxy } from '../services/imageProxy.js';

const router = Router();

router.get('/image-proxy', handleImageProxy);

export default router;
