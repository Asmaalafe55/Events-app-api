import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './router.js';
import localRouter from './localRouter.js';
import { config } from 'dotenv';
import { enableLocalMode, isLocalMode } from './utils/localStore.js';
import { seedMongoDemoUsers } from './utils/demoUsers.js';

import { errorConverter, errorHandler } from './middlewares/error.js';

const app = express();
config();
mongoose.set('strictQuery', true);

const port = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://10.0.0.5:3000',
  'http://127.0.0.1:3000',
  'https://events-app-silk.vercel.app',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/login', loginLimiter);
app.use('/api/register', loginLimiter);
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'events-app-api',
    mode: isLocalMode() ? 'local' : 'mongo',
  });
});

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;
const mongoUri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 4000 })
  .then(async () => {
    console.log('Connected successfully');
    await seedMongoDemoUsers().catch((err) =>
      console.error('Could not seed demo users:', err.message)
    );
    app.use('/api', router);
    app.use(errorConverter);
    app.use(errorHandler);
    startServer();
  })
  .catch((error) => {
    console.error('MongoDB unavailable, using local sample data.');
    console.error(error.message);
    enableLocalMode();
    app.use('/api', localRouter);
    app.use(errorConverter);
    app.use(errorHandler);
    startServer();
  });

let started = false;
function startServer() {
  if (started) return;
  started = true;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port} `);
    if (isLocalMode()) {
      console.log('Local mode: sample events loaded from data.json');
    }
  });
}
