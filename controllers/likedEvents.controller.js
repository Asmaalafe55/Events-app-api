import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import LikedEvents from '../models/likedEvents.model.js';
import Events from '../models/events.model.js';
import { findEventById } from '../utils/eventHelpers.js';

export const addLikedEvent = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { eventId } = req.body;

  if (!userId || !eventId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'userId and eventId are required');
  }

  const event = await findEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const existingLike = await LikedEvents.findOne({ userId, eventId });
  if (existingLike) {
    await existingLike.deleteOne();
    event.likes = Math.max(0, (event.likes || 0) - 1);
    await event.save();
    return res.status(httpStatus.OK).json({
      liked: false,
      likes: event.likes,
      message: 'Event unliked',
    });
  }

  await LikedEvents.create({ userId, eventId });
  event.likes = (event.likes || 0) + 1;
  await event.save();

  res.status(httpStatus.CREATED).json({
    liked: true,
    likes: event.likes,
    message: 'Event liked',
  });
});

export const getLikedEvents = catchAsync(async (req, res) => {
  const { id } = req.params;
  const likedEvents = await LikedEvents.find({ userId: id });
  const eventIds = likedEvents.map((item) => item.eventId);
  const events = await Events.find({ id: { $in: eventIds } });

  res.status(httpStatus.OK).send(events);
});

export const getLikeStatus = catchAsync(async (req, res) => {
  const { userId, eventId } = req.params;
  const existingLike = await LikedEvents.findOne({ userId, eventId });
  res.status(httpStatus.OK).json({ liked: Boolean(existingLike) });
});
