import Events from '../models/events.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';

export const getEvents = catchAsync(async (req, res, next) => {
  try {
    const events = await Events.find();
    res.status(httpStatus.OK).json(events);
  } catch (error) {
    next(error);
  }
});

export const getEventsByCategory = catchAsync(async (req, res, next) => {
  try {
    const events = await Events.find({ category: req.params.category });
    res.status(httpStatus.OK).json(events);
  } catch (error) {
    next(error);
  }
});

export const getEventById = catchAsync(async (req, res, next) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
    }
    res.status(httpStatus.OK).json(event);
  } catch (error) {
    next(error);
  }
});

export const createEvent = catchAsync(async (req, res, next) => {
  try {
    const event = await Events.create(req.body);
    res.status(httpStatus.CREATED).json(event);
  } catch (error) {
    next(error);
  }
});

export const updateEvent = catchAsync(async (req, res, next) => {
  try {
    const event = await Events.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
    }
    res.status(httpStatus.OK).json(event);
  } catch (error) {
    next(error);
  }
});

export const deleteEvent = catchAsync(async (req, res, next) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.id);
    if (!event) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
    }
    res.status(httpStatus.NO_CONTENT).json();
  } catch (error) {
    next(error);
  }
});
