import Users from '../models/users.model.js';
import Events from '../models/events.model.js';
import Categories from '../models/eventsCategories.model.js';
import LikedEvents from '../models/likedEvents.model.js';
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

const registrantsFor = async (event) => {
  const emails = event.emails_registered || [];
  const users = await Users.find({
    $or: [{ email: { $in: emails } }, { registeredEvents: event.id }],
  }).select('-password');
  return users;
};

export const getMe = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json(publicUser(req.currentUser));
});

export const getDashboard = catchAsync(async (req, res) => {
  const user = req.currentUser;
  if (user.role === 'admin') {
    return res.json({ role: 'admin', analytics: await buildAnalytics() });
  }
  if (user.role === 'organizer') {
    const mine = await Events.find({ organizerEmail: user.email });
    const events = await Promise.all(
      mine.map(async (event) => ({
        ...event.toObject(),
        attendees: event.emails_registered?.length || 0,
        registrants: await registrantsFor(event),
      }))
    );
    return res.json({
      role: 'organizer',
      events,
      stats: {
        events: events.length,
        registrations: events.reduce((sum, event) => sum + event.attendees, 0),
        likes: events.reduce((sum, event) => sum + (event.likes || 0), 0),
      },
    });
  }
  res.json({ role: 'user', billing: await billingFor(user) });
});

const billingFor = async (user) => {
  const events = await Events.find({
    $or: [{ id: { $in: user.registeredEvents || [] } }, { emails_registered: user.email }],
  });
  return events.map((event) => ({
    id: `${user._id}-${event.id}`,
    eventId: event.id,
    title: event.title,
    date: event.date,
    amount: event.price || 'Free',
    status: !event.price || /free/i.test(event.price) ? 'free' : 'paid',
  }));
};

const buildAnalytics = async () => {
  const [users, events, likes] = await Promise.all([
    Users.find().select('-password'),
    Events.find(),
    LikedEvents.countDocuments(),
  ]);
  const eventList = events.map((event) => ({
    ...event.toObject(),
    attendees: event.emails_registered?.length || 0,
  }));
  const cities = await Categories.find();
  return {
    users: users.length,
    guests: users.filter((item) => item.role === 'user').length,
    organizers: users.filter((item) => item.role === 'organizer').length,
    admins: users.filter((item) => item.role === 'admin').length,
    events: events.length,
    likes,
    registrations: eventList.reduce((sum, event) => sum + event.attendees, 0),
    topEvents: [...eventList].sort((a, b) => b.attendees - a.attendees).slice(0, 5),
    byCity: cities.map((city) => ({
      city: city.title,
      events: eventList.filter((event) => event.category?.category === city.category).length,
      registrations: eventList
        .filter((event) => event.category?.category === city.category)
        .reduce((sum, event) => sum + event.attendees, 0),
    })),
  };
};

export const getAnalytics = catchAsync(async (req, res) => {
  res.json(await buildAnalytics());
});

export const getBilling = catchAsync(async (req, res) => {
  res.json(await billingFor(req.currentUser));
});

export const getOrganizerEvents = catchAsync(async (req, res) => {
  const user = req.currentUser;
  const filter = user.role === 'admin' ? {} : { organizerEmail: user.email };
  const mine = await Events.find(filter);
  const events = await Promise.all(
    mine.map(async (event) => ({
      ...event.toObject(),
      attendees: event.emails_registered?.length || 0,
      registrants: await registrantsFor(event),
    }))
  );
  res.json(events);
});

export const getEventRegistrants = catchAsync(async (req, res) => {
  const event = await Events.findOne({ id: req.params.id });
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  const user = req.currentUser;
  if (user.role !== 'admin' && event.organizerEmail !== user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only view your own events');
  }
  res.json(await registrantsFor(event));
});

export const updateUserRole = catchAsync(async (req, res) => {
  const role = req.body.role;
  if (!['user', 'organizer', 'admin'].includes(role)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role');
  }
  const user = await Users.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
    '-password'
  );
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  res.json(user);
});

export const updateUserStatus = catchAsync(async (req, res) => {
  if (String(req.currentUser._id) === String(req.params.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot change your own status');
  }
  const status = req.body.status;
  if (!['active', 'suspended'].includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status');
  }
  const user = await Users.findByIdAndUpdate(req.params.id, { status }, { new: true }).select(
    '-password'
  );
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  res.json(user);
});

export const adminCreateUser = catchAsync(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Missing fields');
  }
  const existing = await Users.findOne({ email });
  if (existing) throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  const user = await Users.create({
    firstName,
    lastName,
    email,
    password: bcrypt.hashSync(password, 10),
    role: ['user', 'organizer', 'admin'].includes(role) ? role : 'user',
    status: 'active',
  });
  res.status(httpStatus.CREATED).json(publicUser(user));
});
