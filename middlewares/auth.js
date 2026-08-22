import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { config } from 'dotenv';
import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';

config();

const SECRET = process.env.JWT_SECRET;
const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      req.user = jwt.verify(token, SECRET);
    }
  } catch {
    req.user = undefined;
  }
  next();
};

export const adminOnly = async (req, res, next) => {
  try {
    const user = await Users.findById(req.user?.id).select('-password');
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    const isAdmin =
      user.role === 'admin' || adminEmails.includes(user.email.toLowerCase());

    if (!isAdmin) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Admin access required');
    }

    req.admin = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdminUser = (user) =>
  user?.role === 'admin' ||
  adminEmails.includes((user?.email || '').toLowerCase());
