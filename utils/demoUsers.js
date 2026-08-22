import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import Users from '../models/users.model.js';

config();

export const getDemoAccountDefs = () => [
  {
    firstName: 'Admin',
    lastName: 'Events',
    email: process.env.DEMO_ADMIN_EMAIL || 'admin@events.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'Admin123!',
    role: 'admin',
    description: 'Demo administrator for EventsApp.',
    registeredEvents: ['zappa-tel-aviv-september-session'],
  },
  {
    firstName: 'Maya',
    lastName: 'Cohen',
    email: process.env.DEMO_USER_EMAIL || 'maya@events.com',
    password: process.env.DEMO_USER_PASSWORD || 'Maya123!',
    role: 'user',
    description: 'Tel Aviv guest. Demo account.',
    registeredEvents: ['zappa-tel-aviv-september-session', 'barby-indie-night'],
  },
  {
    firstName: 'Youssef',
    lastName: 'Khalil',
    email: process.env.DEMO_USER2_EMAIL || 'youssef@events.com',
    password: process.env.DEMO_USER2_PASSWORD || 'Youssef123!',
    role: 'user',
    description: 'Haifa guest. Demo account.',
    registeredEvents: ['haifa-film-festival-2026', 'sultans-pool-open-air'],
  },
  {
    firstName: 'Noa',
    lastName: 'Levi',
    email: process.env.DEMO_ORGANIZER_EMAIL || 'noa@events.com',
    password: process.env.DEMO_ORGANIZER_PASSWORD || 'Noa123!',
    role: 'organizer',
    description: 'Organizer at Hangar 11 / Zappa. Demo account.',
    registeredEvents: ['hangar-11-port-night', 'fresh-paint-tel-aviv'],
  },
];

export const hashedDemoUsers = (withIds = true) =>
  getDemoAccountDefs().map((user, index) => ({
    ...(withIds ? { _id: `demo-${index + 1}` } : {}),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: bcrypt.hashSync(user.password, 8),
    role: user.role,
    description: user.description,
    registeredEvents: [...user.registeredEvents],
    avatarUrl: '',
    address: '',
    status: 'active',
  }));

export const applyDemoRegistrations = (users, events) => {
  users.forEach((user) => {
    (user.registeredEvents || []).forEach((eventId) => {
      const event = events.find((item) => item.id === eventId);
      if (event && !event.emails_registered.includes(user.email)) {
        event.emails_registered.push(user.email);
      }
    });
  });
};

export const seedMongoDemoUsers = async () => {
  for (const user of hashedDemoUsers(false)) {
    await Users.findOneAndUpdate({ email: user.email }, { $set: user }, { upsert: true });
  }
};
