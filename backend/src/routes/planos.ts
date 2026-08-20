import { Router } from 'express';
import { getAtivo } from '../services/ativoService';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createPlano,
  desativarPlano,
  getPlano,
  listPlanosPendentes,
  listPlanosPorAtivo,
  validatePlanoInput,
} from '../services/planoService';

export const planosRouter = Router();

planosRouter.use(requireAuth);

planosRouter.get('/pendentes', async (_req, res) => {
  const planos = await listPlanosPendentes();
  res.json(planos);
});

planosRouter.get('/', async (req, res) => {
  const { ativoId } = req.query as { ativoId?: string };
  if (!ativoId) {
    res.status(400).json({ error: 'ativoId é obrigatório' });
    return;
  }
  const planos = await listPlanosPorAtivo(ativoId);
  res.json(planos);
});

planosRouter.post('/', requireRole('SUPERVISOR', 'GESTOR'), async (req, res) => {
  const erro = validatePlanoInput(req.body);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const ativo = await getAtivo(req.body.ativoId);
  if (!ativo) {
    res.status(404).json({ error: 'Ativo não encontrado' });
    return;
  }

  const plano = await createPlano(req.body);
  res.status(201).json(plano);
});

planosRouter.patch('/:id/desativar', requireRole('SUPERVISOR', 'GESTOR'), async (req, res) => {
  const existente = await getPlano(req.params.id);
  if (!existente) {
    res.status(404).json({ error: 'Plano não encontrado' });
    return;
  }

  const plano = await desativarPlano(req.params.id);
  res.json(plano);
});
