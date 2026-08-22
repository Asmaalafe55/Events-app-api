import Events from '../models/events.model.js';
import Users from '../models/users.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { findEventById } from '../utils/eventHelpers.js';

export const addEmail = catchAsync(async (req, res) => {
  const { email, eventId } = req.body;
  const userId = req.user?.id || req.body.userId;

  if (!email || !eventId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'email and eventId are required');
  }

  const event = await findEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event does not exist');
  }

  const emailExists = event.emails_registered.includes(email);
  if (emailExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already registered for this event');
  }

  event.emails_registered.push(email);
  await event.save();

  if (userId) {
    await Users.findByIdAndUpdate(userId, {
      $addToSet: { registeredEvents: eventId },
    });
  }

  res.status(httpStatus.OK).json({
    message: 'You are registered for this event',
    success: true,
    attendees: event.emails_registered.length,
  });
});

export const getRegisteredEvents = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await Users.findById(id).select('-password');
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const events = await Events.find({
    $or: [
      { id: { $in: user.registeredEvents || [] } },
      { emails_registered: user.email },
    ],
  }).sort({ date: 1 });

  res.status(httpStatus.OK).json(events);
});
