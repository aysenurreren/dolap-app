import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import wardrobeRoutes from './modules/wardrobe/wardrobe.routes';
import outfitRoutes from './modules/outfits/outfit.routes';
import cors from 'cors';
import colorRoutes from './modules/colors/color.routes';

const app = express();

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/wardrobe', wardrobeRoutes);
app.use('/outfits', outfitRoutes);
app.use('/colors', colorRoutes);

app.listen(env.PORT, () => {
  console.log(`Sunucu ${env.PORT} portunda çalışıyor`);
});