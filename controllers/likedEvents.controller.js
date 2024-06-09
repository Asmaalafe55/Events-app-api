import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import LikedEvents from './likedEvents.model.js';


export const addLikedEvent = catchAsync(async (req, res, next) => {
    const { userId, eventId } = req.body;
    
    const likedEvent = new LikedEvents({ userId, eventId });
    await likedEvent.save();
  
    res.status(httpStatus.CREATED).json(likedEvent);
  });
  
  export const getLikedEvents = catchAsync(async (req, res, next) => {
    const { userId } = req.params;
    
    const likedEvents = await LikedEvents.find({ userId }).populate('eventId');
    
    res.status(httpStatus.OK).json(likedEvents);
  });