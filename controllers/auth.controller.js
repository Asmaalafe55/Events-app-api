import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { config } from 'dotenv';
config();

const SECRET = process.env.JWT_SECRET;

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide email and password'
    );
  }
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
  const { fName, lName, email, password, account } = req.body;

  if (!fName || !lName || !email || !password || !account) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please provide all fields');
  }
  const userExists = await Users.findOne({ email });
  if (!!userExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = await Users.create({
    fName,
    lName,
    email,
    password: hash,
    account,
  });

  if (!newUser) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error'
    );
  }

  res.status(httpStatus.CREATED).send({ newUser });
});
