import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';

export const updateDescription = catchAsync(async (req, res) => {
  const { description } = req.body;
  const id = req.params.id;

  if (!description) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    description: description,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateAvatar = catchAsync(async (req, res) => {
  const { avatar } = req.body;
  const id = req.params.id;

  if (!avatar) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    avatar: avatar,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateImage = catchAsync(async (req, res) => {
  const { image } = req.body;
  const id = req.params.id;

  if (!image) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    image: image,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateAddress = catchAsync(async (req, res) => {
  const { address } = req.body;
  const id = req.params.id;

  if (!address) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    address: address,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateBirthdate = catchAsync(async (req, res) => {
  const { birthdate } = req.body;
  const id = req.params.id;

  if (!birthdate) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    birthdate: birthdate,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});

export const updateGender = catchAsync(async (req, res) => {
  const { gender } = req.body;
  const id = req.params.id;

  if (!gender) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Content');
  }
  const user = await Users.findByIdAndUpdate(id, {
    gender: gender,
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send(user);
});
