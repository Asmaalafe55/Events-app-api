import Events from '../models/events.model.js';
import Users from '../models/users.model.js';
import Categories from '../models/eventsCategories.model.js';
import LikedEvents from '../models/likedEvents.model.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';
import httpStatus from 'http-status';
import { findEventById, slugify } from '../utils/eventHelpers.js';

export const getEvents = catchAsync(async (req, res) => {
  const { city, q, type, upcoming, sort } = req.query;
  const filter = {};
  const and = [];

  if (city) {
    filter['category.category'] = city.toLowerCase();
  }

  if (type) {
    filter.type = type;
  }

  if (q) {
    const regex = new RegExp(q, 'i');
    and.push({
      $or: [
        { title: regex },
        { titleHe: regex },
        { titleAr: regex },
        { description: regex },
        { descriptionHe: regex },
        { descriptionAr: regex },
        { venue: regex },
        { venueHe: regex },
        { venueAr: regex },
        { city: regex },
        { organizer: regex },
        { type: regex },
      ],
    });
  }

  if (upcoming === 'true') {
    and.push({
      $or: [
        { date: { $gte: new Date() } },
        { date: { $exists: false } },
        { date: null },
      ],
    });
  }

  if (upcoming === 'false') {
    filter.date = { $lt: new Date() };
  }

  if (and.length) {
    filter.$and = and;
  }

  let query = Events.find(filter);

  if (sort === 'popular') {
    query = query.sort({ likes: -1 });
  } else if (sort === 'date') {
    query = query.sort({ date: 1 });
  } else {
    query = query.sort({ date: 1, title: 1 });
  }

  const events = await query;
  res.status(httpStatus.OK).json(events);
});

export const getEventsByCategoty = catchAsync(async (req, res) => {
  const events = await Events.find({
    'category.category': req.params.category,
  }).sort({ date: 1 });
  res.status(httpStatus.OK).json(events);
});

export const getEventById = catchAsync(async (req, res) => {
  const event = await findEventById(req.params.id);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  res.status(httpStatus.OK).json(event);
});

export const getRelatedEvents = catchAsync(async (req, res) => {
  const event = await findEventById(req.params.id);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  const related = await Events.find({
    id: { $ne: event.id },
    $or: [
      { 'category.category': event.category?.category },
      { type: event.type },
      { city: event.city },
    ],
  }).limit(4);

  res.status(httpStatus.OK).json(related);
});

export const createEvent = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  payload.id = payload.id || slugify(payload.title);

  if (payload.category && typeof payload.category === 'string') {
    const category = await Categories.findOne({
      category: payload.category,
    });
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
    payload.category = category;
    payload.city = payload.city || category.title;
  }

  const existing = await findEventById(payload.id);
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event already exists');
  }

  const event = await Events.create(payload);
  res.status(httpStatus.CREATED).json(event);
});

export const updateEvent = catchAsync(async (req, res) => {
  const payload = { ...req.body };

  if (payload.category && typeof payload.category === 'string') {
    const category = await Categories.findOne({
      category: payload.category,
    });
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
    }
    payload.category = category;
  }

  const event = await Events.findOneAndUpdate({ id: req.params.id }, payload, {
    new: true,
  });
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  res.status(httpStatus.OK).json(event);
});

export const deleteEvent = catchAsync(async (req, res) => {
  const event = await Events.findOneAndDelete({ id: req.params.id });
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  await LikedEvents.deleteMany({ eventId: req.params.id });
  res.status(httpStatus.NO_CONTENT).json();
});

export const getStats = catchAsync(async (req, res) => {
  const [users, events, categories, likes] = await Promise.all([
    Users.countDocuments(),
    Events.countDocuments(),
    Categories.countDocuments(),
    LikedEvents.countDocuments(),
  ]);

  const registrationAgg = await Events.aggregate([
    {
      $project: {
        count: { $size: { $ifNull: ['$emails_registered', []] } },
      },
    },
    { $group: { _id: null, total: { $sum: '$count' } } },
  ]);

  res.status(httpStatus.OK).json({
    users,
    events,
    categories,
    likes,
    registrations: registrationAgg[0]?.total || 0,
  });
});
