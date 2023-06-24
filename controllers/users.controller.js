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
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing fields');
  }
  const user = await Users.create({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });

  if (!user) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to create user'
    );
  }
  res.status(httpStatus.CREATED).send(user);
});

export const updateUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const id = req.params.id;

  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing fields');
  }
  const user = await Users.findByIdAndUpdate(id, {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const user = await Users.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send({ message: 'User deleted successfully' });
});
