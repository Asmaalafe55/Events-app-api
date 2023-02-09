import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';

export const getUsers = catchAsync(async (req, res) => {
  const users = await Users.find();
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Users not found');
  }
  res.status(httpStatus.OK).send(users);
});

export const getUserById = catchAsync(async (req, res) => {
  const id = req.body.id;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing id');
  }
  const user = await Users.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const getUserByEmail = catchAsync(async (req, res) => {
  const email = req.body.email;
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing email');
  }
  const user = await Users.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const createUser = catchAsync(async (req, res) => {
  const { fName, lName, email, password, account } = req.body;

  if (!fName || !lName || !email || !password || !account) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing fields');
  }
  const user = await Users.create({
    fName: fName,
    lName: lName,
    email: email,
    password: password,
    account: account,
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user'
    );
  }
  res.status(httpStatus.CREATED).send(user);
});
