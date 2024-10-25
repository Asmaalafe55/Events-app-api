import { addEmail } from './controllers/emailRegistration.js';
import { emailNewsletter } from './controllers/emailNewsletter.js';
import { contact } from './controllers/contact.controller.js';
import { addLikedEvent, getLikedEvents } from './controllers/likedEvents.controller.js';

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
  createEvent,
  updateEvent,
  deleteEvent,
} from './controllers/events.controller.js';

import {
  getUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  updateUserInfo,
  deleteUser,
} from './controllers/users.controller.js';

import { login, register, renewToken } from './controllers/auth.controller.js';
import {
  updateDescription,
  updateAvatar,
  updateImage,
  updateAddress,
  updateBirthdate,
  updateGender,
} from './controllers/usersInfo.controller.js';

// import logout from './controllers/logout.controller.js';

import express from 'express';
const router = express.Router();

router.put('/update-description/:id', updateDescription);
router.put('/update-avatar/:id', updateAvatar);
router.put('/update-image/:id', updateImage);
router.put('/update-address/:id', updateAddress);
router.put('/update-birthdate/:id', updateBirthdate);
router.put('/update-gender/:id', updateGender);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.get('/users/email/:email', getUserByEmail);
router.post('/create-user', createUser);
router.put('/update-user/:id', updateUser);
router.put('/users/update/:id', updateUserInfo);
router.delete('/delete-user/:id', deleteUser);

router.post('/login', login);
router.post('/register', register);
router.post('/renew-token', renewToken);

router.post('/emailNewsletter', emailNewsletter);

router.post('/contact', contact);

router.post('/addEmail', addEmail);

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/add-category', addCategory);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);

router.get('/events', getEvents);
router.get('/events/:id', getEventById);
// router.get('/categories/:id/:id', getEventsByCategoty);
router.post('/create-event', createEvent);
router.put('/update-event/:id', updateEvent);
router.delete('/delete-event/:id', deleteEvent);

router.post('/like',addLikedEvent);
router.get('/likes/:id', getLikedEvents);

export default router;
