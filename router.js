import { addEmail, getRegisteredEvents } from './controllers/emailRegistration.js';
import { emailNewsletter } from './controllers/emailNewsletter.js';
import { contact } from './controllers/contact.controller.js';
import {
  addLikedEvent,
  getLikedEvents,
  getLikeStatus,
} from './controllers/likedEvents.controller.js';

import {
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from './controllers/eventsCategories.controller.js';

import {
  getEvents,
  getEventsByCategoty,
  getEventById,
  getRelatedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getStats,
} from './controllers/events.controller.js';

import {
  getUsers,
  getUserByEmail,
  getUserById,
  updateUser,
  updateUserInfo,
  deleteUser,
} from './controllers/users.controller.js';

import { login, register, renewToken } from './controllers/auth.controller.js';
import {
  getMe,
  getDashboard,
  getAnalytics,
  getBilling,
  getOrganizerEvents,
  getEventRegistrants,
  updateUserRole,
  updateUserStatus,
  adminCreateUser,
} from './controllers/roles.controller.js';
import {
  updateDescription,
  updateAvatar,
  updateImage,
  updateAddress,
  updateBirthdate,
  updateGender,
} from './controllers/usersInfo.controller.js';
import { auth, optionalAuth, adminOnly, attachUser, requireRoles } from './middlewares/auth.js';

import express from 'express';
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'events-app-api' });
});

router.get('/stats', getStats);

router.put('/update-description/:id', auth, updateDescription);
router.put('/update-avatar/:id', auth, updateAvatar);
router.put('/update-image/:id', auth, updateImage);
router.put('/update-address/:id', auth, updateAddress);
router.put('/update-birthdate/:id', auth, updateBirthdate);
router.put('/update-gender/:id', auth, updateGender);

router.get('/users', auth, adminOnly, getUsers);
router.get('/users/email/:email', getUserByEmail);
router.get('/users/:id/registered-events', getRegisteredEvents);
router.put('/users/:id/role', auth, attachUser, adminOnly, updateUserRole);
router.put('/users/:id/status', auth, attachUser, adminOnly, updateUserStatus);
router.get('/users/:id', getUserById);
router.post('/create-user', auth, adminOnly, adminCreateUser);
router.put('/update-user/:id', auth, updateUser);
router.put('/users/update/:id', auth, updateUserInfo);
router.delete('/delete-user/:id', auth, adminOnly, deleteUser);
router.delete('/users/:id', auth, attachUser, adminOnly, deleteUser);

router.post('/login', login);
router.post('/register', register);
router.post('/renew-token', renewToken);
router.get('/me', auth, attachUser, getMe);
router.get('/dashboard', auth, attachUser, getDashboard);
router.get('/analytics', auth, attachUser, adminOnly, getAnalytics);
router.get('/billing', auth, attachUser, getBilling);
router.get('/organizer/events', auth, attachUser, requireRoles('organizer'), getOrganizerEvents);

router.post('/emailNewsletter', emailNewsletter);
router.post('/contact', contact);
router.post('/addEmail', optionalAuth, addEmail);

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/add-category', auth, adminOnly, addCategory);
router.put('/update-category/:id', auth, adminOnly, updateCategory);
router.delete('/delete-category/:id', auth, adminOnly, deleteCategory);

router.get('/events', getEvents);
router.get('/events/category/:category', getEventsByCategoty);
router.get('/events/:id/related', getRelatedEvents);
router.get('/events/:id/registrants', auth, attachUser, getEventRegistrants);
router.get('/events/:id', getEventById);
router.post('/create-event', auth, attachUser, requireRoles('organizer'), createEvent);
router.put('/update-event/:id', auth, attachUser, requireRoles('organizer'), updateEvent);
router.delete('/delete-event/:id', auth, attachUser, requireRoles('organizer'), deleteEvent);

router.post('/like', auth, addLikedEvent);
router.get('/likes/:id', getLikedEvents);
router.get('/likes/:userId/:eventId', getLikeStatus);

export default router;
