import { config } from 'dotenv';
import data from '../data/data.json' assert { type: 'json' };
import { applyDemoRegistrations, hashedDemoUsers } from './demoUsers.js';

config();

let localMode = false;

const categories = data.events_categories.map((category, index) => ({
  ...category,
  _id: `cat-${index + 1}`,
}));

const events = data.allEvents.map((event) => {
  const category =
    categories.find((item) => item.category === String(event.category).toLowerCase()) ||
    categories[0];
  return {
    ...event,
    category,
    city: event.city || category.title,
    emails_registered: [...(event.emails_registered || [])],
    likes: event.likes || 0,
  };
});

const users = hashedDemoUsers(true);
applyDemoRegistrations(users, events);

const likes = [
  { userId: users[1]?._id, eventId: 'zappa-tel-aviv-september-session' },
  { userId: users[1]?._id, eventId: 'docaviv-2027' },
  { userId: users[2]?._id, eventId: 'haifa-film-festival-2026' },
  { userId: users[3]?._id, eventId: 'hangar-11-port-night' },
].filter((item) => item.userId);

likes.forEach((like) => {
  const event = events.find((item) => item.id === like.eventId);
  if (event) event.likes = (event.likes || 0) + 1;
});

export const enableLocalMode = () => {
  localMode = true;
};

export const isLocalMode = () => localMode;

export const localStore = {
  categories,
  events,
  users,
  likes,
};
