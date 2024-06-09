import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import LikedEvents from '../models/likedEvents.model.js'

export const addLikedEvent = catchAsync(async (req, res, next) => {
  const { userId, eventId } = req.body;

  // Check if the event is already liked by the user
  const existingLike = await LikedEvents.findOne({ userId, eventId });
  if (existingLike) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Event already liked' });
  }

  // Add the liked event
  const likedEvent = new LikedEvents({ userId, eventId });
  await likedEvent.save();

  // Increment the like counter for the event
  await Events.findByIdAndUpdate(eventId, { $inc: { likes: 1 } });

  res.status(httpStatus.CREATED).json(likedEvent);
});

  
  export const getLikedEvents = catchAsync(async (req, res, next) => {
    const { userId } = req.params.userId;
    
    const likedEvents = await LikedEvents.find({ userId }).populate('eventId');
    
    res.status(httpStatus.OK).json(likedEvents);
  });