import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  createAtivo,
  getAtivo,
  listAtivos,
  updateAtivo,
  validateAtivoInput,
} from '../services/ativoService';

export const ativosRouter = Router();

ativosRouter.use(requireAuth);

ativosRouter.get('/', async (req, res) => {
  const { tipo, localizacao } = req.query as { tipo?: string; localizacao?: string };
  const ativos = await listAtivos({ tipo, localizacao });
  res.json(ativos);
});

ativosRouter.get('/:id', async (req, res) => {
  const ativo = await getAtivo(req.params.id);
  if (!ativo) {
    res.status(404).json({ error: 'Ativo não encontrado' });
    return;
  }
  res.json(ativo);
});

ativosRouter.post('/', requireRole('SUPERVISOR', 'GESTOR'), async (req, res) => {
  const erro = validateAtivoInput(req.body);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }
  const ativo = await createAtivo(req.body);
  res.status(201).json(ativo);
});

ativosRouter.put('/:id', requireRole('SUPERVISOR', 'GESTOR'), async (req, res) => {
  const erro = validateAtivoInput(req.body);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const existente = await getAtivo(req.params.id);
  if (!existente) {
    res.status(404).json({ error: 'Ativo não encontrado' });
    return;
  }

  const ativo = await updateAtivo(req.params.id, req.body);
  res.json(ativo);
});
