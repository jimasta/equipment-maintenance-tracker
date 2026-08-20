import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { ativosRouter } from './routes/ativos';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';
import { planosRouter } from './routes/planos';
import { registrosRouter } from './routes/registros';

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use(meRouter);
  app.use('/ativos', ativosRouter);
  app.use('/planos', planosRouter);
  app.use('/registros', registrosRouter);

  return app;
}
