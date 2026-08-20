import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { relatorioCustoPorAtivo } from '../services/relatorioService';

export const relatoriosRouter = Router();

relatoriosRouter.use(requireAuth);

relatoriosRouter.get('/custos', requireRole('GESTOR'), async (_req, res) => {
  const relatorio = await relatorioCustoPorAtivo();
  res.json(relatorio);
});
