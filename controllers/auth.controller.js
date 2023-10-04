import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';
import Joi from 'joi';
config();

const SECRET = process.env.JWT_SECRET;

const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: Joi.string().required(),
});

export const login = catchAsync(async (req, res) => {
  const { error, value } = loginValidationSchema.validate(req.body);
  if (error) {
    console.log({ error });
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  const { email, password } = value;

  const user = await Users.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
  }

  // Get the current timestamp in seconds
  const lastActivityTimestamp = Math.floor(Date.now() / 1000);

  // Generate a token with expiration time and last activity timestamp
  const token = jwt.sign(
    { id: user._id, lastActivityTimestamp },
    SECRET,
    { expiresIn: '2h' } // Token expires in 2 hours
  );

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    email: user.email,
    access_token: token,
  });
});

const registerValidationSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: Joi.string().min(6).required(),
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

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await Users.create({
    firstName,
    lastName,
    email,
    password: hash,
  });

  if (!newUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }

  // Get the current timestamp in seconds
  const lastActivityTimestamp = Math.floor(Date.now() / 1000);

  // Generate a token with expiration time and last activity timestamp
  const token = jwt.sign(
    { id: newUser._id, lastActivityTimestamp },
    SECRET,
    { expiresIn: '2h' } // Token expires in 2 hours
  );

  res.status(httpStatus.CREATED).send({
    id: newUser._id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    access_token: token,
  });
});

export const renew_token = catchAsync(async (req, res) => {});
