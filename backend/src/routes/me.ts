import { Router } from 'express';
import { requireAuth } from '../middleware/auth';

export const meRouter = Router();

meRouter.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user!.sub, nome: req.user!.nome, papel: req.user!.papel });
});
