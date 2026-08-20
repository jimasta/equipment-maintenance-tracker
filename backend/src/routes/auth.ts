import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { signToken, verifyPassword } from '../services/authService';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const { email, senha } = req.body as { email?: string; senha?: string };

  if (!email || !senha) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    return;
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    res.status(401).json({ error: 'E-mail ou senha inválidos' });
    return;
  }

  const senhaValida = await verifyPassword(senha, usuario.senhaHash);
  if (!senhaValida) {
    res.status(401).json({ error: 'E-mail ou senha inválidos' });
    return;
  }

  const token = signToken({ sub: usuario.id, nome: usuario.nome, papel: usuario.papel });
  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
  });
});
