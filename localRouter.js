import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { localStore } from './utils/localStore.js';

config();

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'local-dev-secret';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, lastActivityTimestamp: Math.floor(Date.now() / 1000) },
    SECRET,
    { expiresIn: '2h' }
  );

const publicUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'events-app-api', mode: 'local' });
});

router.get('/stats', (req, res) => {
  res.json({
    users: localStore.users.length,
    events: localStore.events.length,
    categories: localStore.categories.length,
    likes: localStore.likes.length,
    registrations: localStore.events.reduce(
      (sum, event) => sum + (event.emails_registered?.length || 0),
      0
    ),
  });
});

router.get('/categories', (req, res) => {
  res.json(localStore.categories);
});

router.get('/categories/:id', (req, res) => {
  const category = localStore.categories.find(
    (item) => item.category === req.params.id || item._id === req.params.id
  );
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
});

router.get('/events', (req, res) => {
  const { city, q, type, upcoming, sort } = req.query;
  let list = [...localStore.events];

  if (city) {
    list = list.filter((event) => event.category?.category === String(city).toLowerCase());
  }
  if (type) {
    list = list.filter((event) => event.type === type);
  }
  if (q) {
    const query = String(q).toLowerCase();
    list = list.filter((event) =>
      [
        event.title,
        event.titleHe,
        event.titleAr,
        event.description,
        event.descriptionHe,
        event.descriptionAr,
        event.venue,
        event.venueHe,
        event.venueAr,
        event.city,
        event.organizer,
        event.type,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }
  if (upcoming === 'true') {
    list = list.filter((event) => !event.date || new Date(event.date) >= new Date());
  }
  if (upcoming === 'false') {
    list = list.filter((event) => event.date && new Date(event.date) < new Date());
  }
  if (sort === 'popular') {
    list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }

  res.json(list);
});

router.get('/events/:id/related', (req, res) => {
  const event = localStore.events.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const related = localStore.events
    .filter(
      (item) =>
        item.id !== event.id &&
        (item.category?.category === event.category?.category ||
          item.type === event.type ||
          item.city === event.city)
    )
    .slice(0, 4);
  res.json(related);
});

router.get('/events/:id', (req, res) => {
  const event = localStore.events.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  res.json(event);
});

router.post('/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (localStore.users.some((user) => user.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = {
    _id: `user-${Date.now()}`,
    firstName,
    lastName,
    email,
    password: bcrypt.hashSync(password, 8),
    description: '',
    avatarUrl: '',
    role: 'user',
    registeredEvents: [],
  };
  localStore.users.push(user);
  res.status(201).json({
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: 'user',
    access_token: signToken(user),
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = localStore.users.find((item) => item.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase());
  const role =
    user.role === 'admin' || adminEmails.includes(email.toLowerCase())
      ? 'admin'
      : user.role || 'user';
  res.json({
    status: 200,
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role,
    access_token: signToken(user),
  });
});

router.get('/users', (req, res) => {
  res.json(localStore.users.map(publicUser));
});

router.get('/users/email/:email', (req, res) => {
  const user = localStore.users.find((item) => item.email === req.params.email);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  res.json(publicUser(user));
});

router.get('/users/:id/registered-events', (req, res) => {
  const user = localStore.users.find((item) => item._id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const events = localStore.events.filter(
    (event) =>
      user.registeredEvents.includes(event.id) ||
      event.emails_registered.includes(user.email)
  );
  res.json(events);
});

router.get('/users/:id', (req, res) => {
  const user = localStore.users.find((item) => item._id === req.params.id);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  res.json(publicUser(user));
});

router.put('/users/update/:id', (req, res) => {
  const user = localStore.users.find((item) => item._id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  Object.assign(user, req.body);
  res.json(publicUser(user));
});

router.post('/addEmail', (req, res) => {
  const { email, eventId, userId } = req.body;
  const event = localStore.events.find((item) => item.id === eventId);
  if (!event) {
    return res.status(400).json({ message: 'Event does not exist' });
  }
  if (event.emails_registered.includes(email)) {
    return res.status(400).json({ message: 'You are already registered for this event' });
  }
  event.emails_registered.push(email);
  if (userId) {
    const user = localStore.users.find((item) => item._id === userId);
    if (user && !user.registeredEvents.includes(eventId)) {
      user.registeredEvents.push(eventId);
    }
  }
  res.json({
    message: 'You are registered for this event',
    success: true,
    attendees: event.emails_registered.length,
  });
});

router.post('/like', (req, res) => {
  const auth = req.headers.authorization || '';
  let userId = req.body.userId;
  if (auth.startsWith('Bearer ')) {
    try {
      userId = jwt.verify(auth.split(' ')[1], SECRET).id;
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  const { eventId } = req.body;
  const event = localStore.events.find((item) => item.id === eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const existing = localStore.likes.find(
    (item) => item.userId === userId && item.eventId === eventId
  );
  if (existing) {
    localStore.likes = localStore.likes.filter((item) => item !== existing);
    event.likes = Math.max(0, event.likes - 1);
    return res.json({ liked: false, likes: event.likes, message: 'Event unliked' });
  }
  localStore.likes.push({ userId, eventId });
  event.likes += 1;
  res.status(201).json({ liked: true, likes: event.likes, message: 'Event liked' });
});

router.get('/likes/:userId/:eventId', (req, res) => {
  const liked = localStore.likes.some(
    (item) => item.userId === req.params.userId && item.eventId === req.params.eventId
  );
  res.json({ liked });
});

router.get('/likes/:id', (req, res) => {
  const eventIds = localStore.likes
    .filter((item) => item.userId === req.params.id)
    .map((item) => item.eventId);
  res.json(localStore.events.filter((event) => eventIds.includes(event.id)));
});

router.post('/contact', (req, res) => {
  res.json({ message: 'Your message has been sent!', success: true });
});

router.post('/emailNewsletter', (req, res) => {
  res.json({ message: 'Email sent successfully', success: true });
});

router.post('/renew-token', (req, res) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    const token = jwt.sign(
      { id: decoded.id, lastActivityTimestamp: Math.floor(Date.now() / 1000) },
      SECRET,
      { expiresIn: '2h' }
    );
    res.json({ status: 200, access_token: token });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

router.post('/create-event', (req, res) => {
  const payload = { ...req.body };
  payload.id = payload.id || slugify(payload.title);
  if (payload.category && typeof payload.category === 'string') {
    const category = localStore.categories.find((item) => item.category === payload.category);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }
    payload.category = category;
    payload.city = payload.city || category.title;
  }
  if (localStore.events.some((event) => event.id === payload.id)) {
    return res.status(400).json({ message: 'Event already exists' });
  }
  localStore.events.push({ ...payload, emails_registered: [], likes: 0 });
  res.status(201).json(payload);
});

router.put('/update-event/:id', (req, res) => {
  const event = localStore.events.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  const payload = { ...req.body };
  if (payload.category && typeof payload.category === 'string') {
    const category = localStore.categories.find((item) => item.category === payload.category);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }
    payload.category = category;
  }
  Object.assign(event, payload);
  res.json(event);
});

router.delete('/delete-event/:id', (req, res) => {
  const index = localStore.events.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  localStore.events.splice(index, 1);
  res.status(204).end();
});

router.post('/add-category', (req, res) => {
  if (localStore.categories.some((item) => item.category === req.body.category)) {
    return res.status(400).json({ message: 'Category already exists' });
  }
  const category = { ...req.body, _id: `cat-${Date.now()}` };
  localStore.categories.push(category);
  res.status(201).json(category);
});

router.put('/update-category/:id', (req, res) => {
  const category = localStore.categories.find((item) => item._id === req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  Object.assign(category, req.body);
  res.json(category);
});

router.delete('/delete-category/:id', (req, res) => {
  const index = localStore.categories.findIndex((item) => item._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  localStore.categories.splice(index, 1);
  res.json({ message: 'Deleted' });
});

export default router;
