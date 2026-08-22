import express from 'express';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { localStore } from './utils/localStore.js';
import { signToken as jwtSign, verifyToken } from './utils/jwt.js';

config();

const router = express.Router();

const signToken = (user) =>
  jwtSign({
    id: user._id,
    lastActivityTimestamp: Math.floor(Date.now() / 1000),
  });

const publicUser = (user) => {
  const { password, ...rest } = user;
  return rest;
};

const getCurrentUser = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const decoded = verifyToken(header.split(' ')[1]);
    return localStore.users.find((item) => item._id === decoded.id) || null;
  } catch {
    return null;
  }
};

const requireUser = (req, res) => {
  const user = getCurrentUser(req);
  if (!user) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }
  if (user.status === 'suspended') {
    res.status(403).json({ message: 'Account suspended' });
    return null;
  }
  return user;
};

const isAdmin = (user) => user?.role === 'admin';
const isOrganizer = (user) => user?.role === 'organizer';
const canManageEvents = (user) => isAdmin(user) || isOrganizer(user);
const ownsEvent = (user, event) =>
  isAdmin(user) || (event && event.organizerEmail === user.email);

const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const registrantsFor = (event) =>
  localStore.users
    .filter(
      (user) =>
        event.emails_registered?.includes(user.email) ||
        user.registeredEvents?.includes(event.id)
    )
    .map(publicUser);

const withEventMeta = (event) => ({
  ...event,
  attendees: event.emails_registered?.length || 0,
  registrants: registrantsFor(event),
});

const resolveCategory = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  return localStore.categories.find((item) => item.category === value) || null;
};

const billingFor = (user) => {
  const events = localStore.events.filter(
    (event) =>
      user.registeredEvents?.includes(event.id) ||
      event.emails_registered?.includes(user.email)
  );
  return events.map((event) => ({
    id: `${user._id}-${event.id}`,
    eventId: event.id,
    title: event.title,
    date: event.date,
    amount: event.price || 'Free',
    status: !event.price || /free/i.test(event.price) ? 'free' : 'paid',
  }));
};

const analyticsPayload = () => {
  const users = localStore.users.map(publicUser);
  const events = localStore.events.map(withEventMeta);
  return {
    users: users.length,
    guests: users.filter((item) => item.role === 'user').length,
    organizers: users.filter((item) => item.role === 'organizer').length,
    admins: users.filter((item) => item.role === 'admin').length,
    events: events.length,
    likes: localStore.likes.length,
    registrations: events.reduce((sum, event) => sum + event.attendees, 0),
    topEvents: [...events].sort((a, b) => b.attendees - a.attendees).slice(0, 5),
    byCity: localStore.categories.map((city) => ({
      city: city.title,
      events: events.filter((event) => event.category?.category === city.category).length,
      registrations: events
        .filter((event) => event.category?.category === city.category)
        .reduce((sum, event) => sum + event.attendees, 0),
    })),
  };
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
  if (user.status === 'suspended') {
    return res.status(403).json({ message: 'Account suspended' });
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

router.get('/me', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(publicUser(user));
});

router.get('/dashboard', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (isAdmin(user)) {
    return res.json({ role: 'admin', analytics: analyticsPayload() });
  }
  if (isOrganizer(user)) {
    const mine = localStore.events
      .filter((event) => event.organizerEmail === user.email)
      .map(withEventMeta);
    return res.json({
      role: 'organizer',
      events: mine,
      stats: {
        events: mine.length,
        registrations: mine.reduce((sum, event) => sum + event.attendees, 0),
        likes: mine.reduce((sum, event) => sum + (event.likes || 0), 0),
      },
    });
  }
  res.json({
    role: 'user',
    billing: billingFor(user),
  });
});

router.get('/analytics', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!isAdmin(user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  res.json(analyticsPayload());
});

router.get('/billing', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  res.json(billingFor(user));
});

router.get('/organizer/events', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!canManageEvents(user)) {
    return res.status(403).json({ message: 'Organizer access required' });
  }
  const list = isAdmin(user)
    ? localStore.events
    : localStore.events.filter((event) => event.organizerEmail === user.email);
  res.json(list.map(withEventMeta));
});

router.get('/events/:id/registrants', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const event = localStore.events.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (!ownsEvent(user, event)) {
    return res.status(403).json({ message: 'You can only view your own events' });
  }
  res.json(registrantsFor(event));
});

router.put('/users/:id/role', (req, res) => {
  const actor = requireUser(req, res);
  if (!actor) return;
  if (!isAdmin(actor)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const target = localStore.users.find((item) => item._id === req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }
  const role = req.body.role;
  if (!['user', 'organizer', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  target.role = role;
  res.json(publicUser(target));
});

router.put('/users/:id/status', (req, res) => {
  const actor = requireUser(req, res);
  if (!actor) return;
  if (!isAdmin(actor)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const target = localStore.users.find((item) => item._id === req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (target._id === actor._id) {
    return res.status(400).json({ message: 'You cannot change your own status' });
  }
  const status = req.body.status;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  target.status = status;
  res.json(publicUser(target));
});

router.delete('/users/:id', (req, res) => {
  const actor = requireUser(req, res);
  if (!actor) return;
  if (!isAdmin(actor)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const index = localStore.users.findIndex((item) => item._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (localStore.users[index]._id === actor._id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }
  localStore.users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

router.post('/create-user', (req, res) => {
  const actor = requireUser(req, res);
  if (!actor) return;
  if (!isAdmin(actor)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (localStore.users.some((item) => item.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const created = {
    _id: `user-${Date.now()}`,
    firstName,
    lastName,
    email,
    password: bcrypt.hashSync(password, 8),
    description: '',
    avatarUrl: '',
    role: ['user', 'organizer', 'admin'].includes(role) ? role : 'user',
    status: 'active',
    registeredEvents: [],
  };
  localStore.users.push(created);
  res.status(201).json(publicUser(created));
});

router.get('/users', (req, res) => {
  const actor = requireUser(req, res);
  if (!actor) return;
  if (!isAdmin(actor)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
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
  const actor = requireUser(req, res);
  if (!actor) return;
  const user = localStore.users.find((item) => item._id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (!isAdmin(actor) && actor._id !== user._id) {
    return res.status(403).json({ message: 'You can only edit your own profile' });
  }
  const { password, role, status, ...safe } = req.body;
  Object.assign(user, safe);
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
      userId = verifyToken(auth.split(' ')[1]).id;
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
    const decoded = verifyToken(auth.split(' ')[1]);
    const token = jwtSign({
      id: decoded.id,
      lastActivityTimestamp: Math.floor(Date.now() / 1000),
    });
    res.json({ status: 200, access_token: token });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/create-event', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!canManageEvents(user)) {
    return res.status(403).json({ message: 'Organizer or admin access required' });
  }
  const payload = { ...req.body };
  payload.id = payload.id || slugify(payload.title);
  const category = resolveCategory(payload.category);
  if (payload.category && !category) {
    return res.status(400).json({ message: 'Category not found' });
  }
  if (category) {
    payload.category = category;
    payload.city = payload.city || category.title;
  }
  if (localStore.events.some((event) => event.id === payload.id)) {
    return res.status(400).json({ message: 'Event already exists' });
  }
  if (!isAdmin(user) || !payload.organizerEmail) {
    payload.organizerEmail = user.email;
    payload.organizer = payload.organizer || `${user.firstName} ${user.lastName}`.trim();
  }
  const event = {
    image: '/images/pic/e1.jpg',
    emails_registered: [],
    likes: 0,
    wheelchairAccessible: true,
    ...payload,
  };
  localStore.events.push(event);
  res.status(201).json(withEventMeta(event));
});

router.put('/update-event/:id', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const event = localStore.events.find((item) => item.id === req.params.id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (!ownsEvent(user, event)) {
    return res.status(403).json({ message: 'You can only edit your own events' });
  }
  const payload = { ...req.body };
  const category = resolveCategory(payload.category);
  if (payload.category && !category) {
    return res.status(400).json({ message: 'Category not found' });
  }
  if (category) payload.category = category;
  if (!isAdmin(user)) {
    delete payload.organizerEmail;
  }
  Object.assign(event, payload);
  res.json(withEventMeta(event));
});

router.delete('/delete-event/:id', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  const index = localStore.events.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Event not found' });
  }
  if (!ownsEvent(user, localStore.events[index])) {
    return res.status(403).json({ message: 'You can only delete your own events' });
  }
  localStore.events.splice(index, 1);
  res.status(204).end();
});

router.post('/add-category', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!isAdmin(user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  if (localStore.categories.some((item) => item.category === req.body.category)) {
    return res.status(400).json({ message: 'Category already exists' });
  }
  const category = { ...req.body, _id: `cat-${Date.now()}` };
  localStore.categories.push(category);
  res.status(201).json(category);
});

router.put('/update-category/:id', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!isAdmin(user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const category = localStore.categories.find((item) => item._id === req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  Object.assign(category, req.body);
  res.json(category);
});

router.delete('/delete-category/:id', (req, res) => {
  const user = requireUser(req, res);
  if (!user) return;
  if (!isAdmin(user)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const index = localStore.categories.findIndex((item) => item._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }
  localStore.categories.splice(index, 1);
  res.json({ message: 'Deleted' });
});

export default router;
