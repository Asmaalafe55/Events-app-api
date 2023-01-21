import emailRegistration from './controllers/emailRegistration.js';
import getEvents from './controllers/getEvents.js';

import express from 'express';
const router = express.Router();

router.post('/emailRegistration', emailRegistration);
router.get('/events', getEvents);

export default router;
