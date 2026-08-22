import mongoose from 'mongoose';
import { config } from 'dotenv';

import Categories from '../models/eventsCategories.model.js';
import Events from '../models/events.model.js';
import data from '../data/data.json' assert { type: 'json' };

config();

function handleError(err) {
  console.error(err);
  process.exit(1);
}

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;

mongoose.connect(
  `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', async () => {
  try {
    await Categories.collection.drop().catch(() => {});
    await Events.collection.drop().catch(() => {});

    const categoryMap = Object.fromEntries(
      data.events_categories.map((category) => [
        category.category.toLowerCase(),
        category,
      ])
    );

    await Categories.insertMany(data.events_categories);
    console.log('Categories data saved successfully!');

    const events = data.allEvents.map((event) => {
      const slug = String(event.category).toLowerCase();
      return {
        ...event,
        category: categoryMap[slug] || data.events_categories[0],
        city: event.city || categoryMap[slug]?.title || event.category,
      };
    });

    await Events.insertMany(events);
    console.log('Events data saved successfully!');
    process.exit(0);
  } catch (err) {
    handleError(err);
  }
});
