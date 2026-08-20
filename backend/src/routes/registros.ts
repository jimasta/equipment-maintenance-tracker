import { Router } from 'express';
import { getPlano } from '../services/planoService';
import { requireAuth } from '../middleware/auth';
import {
  createRegistro,
  listRegistrosPorPlano,
  validateRegistroInput,
} from '../services/registroService';

export const registrosRouter = Router();

registrosRouter.use(requireAuth);

registrosRouter.get('/', async (req, res) => {
  const { planoManutencaoId } = req.query as { planoManutencaoId?: string };
  if (!planoManutencaoId) {
    res.status(400).json({ error: 'planoManutencaoId é obrigatório' });
    return;
  }
  const registros = await listRegistrosPorPlano(planoManutencaoId);
  res.json(registros);
});

registrosRouter.post('/', async (req, res) => {
  const erro = validateRegistroInput(req.body);
  if (erro) {
    res.status(400).json({ error: erro });
    return;
  }

  const plano = await getPlano(req.body.planoManutencaoId);
  if (!plano) {
    res.status(404).json({ error: 'Plano de manutenção não encontrado' });
    return;
  }

  const registro = await createRegistro(req.user!.sub, req.body);
  res.status(201).json(registro);
});
