import emailRegistration from './controllers/emailRegistration.js';
import getEvents from './controllers/getEvents.js';
import eventCategories from './controllers/eventCategories.js';

import express from 'express';
const router = express.Router();

router.post('/emailRegistration', emailRegistration);
router.get('/events', getEvents);

router.post('/add-category', eventCategories);

export default router;
