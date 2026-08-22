import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config();

const SECRET = process.env.JWT_SECRET || 'local-dev-secret';

export const signToken = (payload, expiresIn = '2h') =>
  jwt.sign(payload, SECRET, { algorithm: 'HS256', expiresIn });

export const verifyToken = (token) =>
  jwt.verify(token, SECRET, { algorithms: ['HS256'] });
