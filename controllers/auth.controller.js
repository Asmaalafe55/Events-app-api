import Users from '../models/users.model';
import ApiError from '../utils/ApiError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { config } from 'dotenv';
config();

const SECRET = process.env.JWT_SECRET;

const login = catchAsync(async (req, res) => {
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
  const isMatch = await bcrypt.compare(password, user.password);
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
