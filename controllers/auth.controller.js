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

const registerValidationSchema = Joi.object({
  fName: Joi.string().required(),
  lName: Joi.string().required(),
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),

  password: Joi.string().min(6).required(),
});

const loginValidationSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org'] } })
    .required(),
  password: Joi.string().required(),
});

export const login = catchAsync(async (req, res) => {
  const { error, value } = loginValidationSchema.validate(req.body);
  if (error) {
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

  const token = jwt.sign({ id: user._id }, SECRET);

  res.status(httpStatus.OK).send({
    status: httpStatus.OK,
    email: user.email,
    access_token: token,
  });
});

export const register = catchAsync(async (req, res) => {
  const { error, value } = registerValidationSchema.validate(req.body);
  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.details[0].message);
  }

  const { fName, lName, email, password } = value;

  const userExists = await Users.findOne({ email });
  if (userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await Users.create({
    fName,
    lName,
    email,
    password: hash,
  });

  if (!newUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }

  const token = jwt.sign({ userId: newUser._id }, SECRET);

  res.status(httpStatus.CREATED).send({
    id: newUser._id,
    email: newUser.email,
    fName: newUser.fName,
    lName: newUser.lName,
    access_token: token,
  });
});
