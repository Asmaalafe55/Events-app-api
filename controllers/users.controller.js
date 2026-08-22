import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';

const publicUser = (user) => {
  if (!user) return user;
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  return value;
};

export const getUsers = catchAsync(async (req, res) => {
  const users = await Users.find().select('-password');
  res.status(httpStatus.OK).send(users);
});

export const getUserById = catchAsync(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing id');
  }
  const user = await Users.findById(id).select('-password');
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const getUserByEmail = catchAsync(async (req, res) => {
  const email = req.params.email;
  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing email');
  }

  const user = await Users.findOne({ email }).select('-password');
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const createUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing fields');
  }

  const existing = await Users.findOne({ email });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = await Users.create({
    firstName,
    lastName,
    email,
    password: hash,
    role: role === 'admin' ? 'admin' : 'user',
  });

  res.status(httpStatus.CREATED).send(publicUser(user));
});

export const updateUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  const id = req.params.id;
  const updates = {};

  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (email) updates.email = email;
  if (role) updates.role = role;
  if (password) updates.password = bcrypt.hashSync(password, 10);

  if (!Object.keys(updates).length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No fields to update');
  }

  const user = await Users.findByIdAndUpdate(id, updates, { new: true }).select(
    '-password'
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateUserInfo = catchAsync(async (req, res) => {
  const userId = req.params.id || req.params.userId;
  const { firstName, lastName, description, avatarUrl, address, birthdate, gender } =
    req.body;

  const updatedUser = await Users.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      description,
      avatarUrl,
      address,
      birthdate,
      gender,
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  res.status(httpStatus.OK).send(updatedUser);
});

export const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const user = await Users.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send({ message: 'User deleted successfully' });
});
