import Events from '../models/events.model.js';

export const findEventById = (eventId) => Events.findOne({ id: eventId });

export const slugify = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
