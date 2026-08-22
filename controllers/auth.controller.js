import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';
import {
  loginValidationSchema,
  registerValidationSchema,
} from '../utils/joiSchemas.js';
import { isAdminUser } from '../middlewares/auth.js';

config();

const SECRET = process.env.JWT_SECRET;

const signToken = (user) => {
  const lastActivityTimestamp = Math.floor(Date.now() / 1000);
  return jwt.sign({ id: user._id, lastActivityTimestamp }, SECRET, {
    expiresIn: '2h',
  });
};

const authPayload = (user, token, status = httpStatus.OK) => ({
  status,
  id: user._id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: isAdminUser(user) ? 'admin' : user.role || 'user',
  access_token: token,
});

export const login = catchAsync(async (req, res) => {
  const { error, value } = loginValidationSchema.validate(req.body);
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  const { email, password } = value;
  const user = await Users.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email or password');
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email or password');
  }

  if (user.status === 'suspended') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Account suspended');
  }

  const token = signToken(user);
  res.status(httpStatus.OK).send(authPayload(user, token));
});

export const register = catchAsync(async (req, res) => {
  const { error, value } = registerValidationSchema.validate(req.body);
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  const { firstName, lastName, email, password } = value;
  const userExists = await Users.findOne({ email });
  if (userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const hash = bcrypt.hashSync(password, 10);
  const newUser = await Users.create({
    firstName,
    lastName,
    email,
    password: hash,
  });

  const token = signToken(newUser);
  res.status(httpStatus.CREATED).send(authPayload(newUser, token, httpStatus.CREATED));
});

export const renewToken = catchAsync(async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  const token = header.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token');
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const maxInactiveTime = 15 * 60;
  const isUserActive =
    currentTime - decodedToken.lastActivityTimestamp <= maxInactiveTime;

  if (!isUserActive) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Session expired, please sign in again'
    );
  }

  const newToken = jwt.sign(
    { id: decodedToken.id, lastActivityTimestamp: currentTime },
    SECRET,
    { expiresIn: '2h' }
  );

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    access_token: newToken,
  });
});
