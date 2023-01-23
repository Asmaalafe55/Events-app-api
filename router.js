import emailRegistration from './controllers/emailRegistration.js';
import getEvents from './controllers/getEvents.js';
import getCategories, {
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from './controllers/eventsCategories.controller.js';

import getEvents, {
  getEventsByCategoty,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from './controllers/events.controller.js';

import express from 'express';
const router = express.Router();

router.post('/emailRegistration', emailRegistration);
router.get('/events', getEvents);

router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);
router.post('/add-category', addCategory);
router.put('/update-category/:id', updateCategory);
router.delete('/delete-category/:id', deleteCategory);

// router.get('/events/:id', getEventById);

export default router;
