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
config();

const SECRET = process.env.JWT_SECRET;

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
    id: user._id,
    email: user.email,
    access_token: token,
  });
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

export const renewToken = catchAsync(async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Assuming token is sent in the Authorization header

  console.log('Request Headers:', req.headers);

  jwt.verify(token, SECRET, (err, decodedToken) => {
    if (err) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .send({ message: 'Invalid token' });
    }

    const { lastActivityTimestamp } = decodedToken;

    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const maxInactiveTime = 15 * 60; // Max inactive time allowed: 15 minutes in seconds

    const isUserActive = currentTime - lastActivityTimestamp <= maxInactiveTime;

    if (isUserActive) {
      // User is active, renew the token and send it back
      const newToken = jwt.sign(
        { id: decodedToken.id, lastActivityTimestamp: currentTime },
        SECRET,
        { expiresIn: '2h' }
      );

      // Send the new token to the client
      res.status(httpStatus.OK).send({
        status: httpStatus.OK,
        access_token: newToken,
      });
    } else {
      // User is not active
      res
        .status(httpStatus.UNAUTHORIZED)
        .send({ message: 'User is not active, re-authentication required' });
    }
  });
});
