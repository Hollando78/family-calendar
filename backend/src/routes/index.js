import { Router } from 'express';
import authRoutes from './auth.js';
import meRoutes from './me.js';
import eventsRoutes from './events.js';
import pushRoutes from './push.js';

const router = Router();

router.use(authRoutes);
router.use(meRoutes);
router.use(eventsRoutes);
router.use(pushRoutes);

export default router;
