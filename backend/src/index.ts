import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);

app.listen(env.PORT, () => {
  console.log(`Sunucu ${env.PORT} portunda çalışıyor`);
});