import Events from '../models/events.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';

export const addEmail = catchAsync(async (req, res) => {
  const { email, eventId } = req.body;

  const event = await Events.findById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event does not exist');
  }

  const emailExists = event.emails_registered.includes(email);
  if (emailExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
  }

  event.emails_registered.push(email);
  await event.save();

  res.status(httpStatus.OK).json({ message: 'Email added' });
});
