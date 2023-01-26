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
  // console.log(process.argv);

  try {
    await Categories.collection.drop();
    console.log('Categories collection dropped');
    await Events.collection.drop();
    console.log('Events collection dropped');
    await Categories.insertMany(data.events_categories, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Categories data saved successfully!');
      }
    });

    await Events.insertMany(
      data.allEvents.map((e) => {
        const index = Math.floor(Math.random() * 3);
        e.category = data.events_categories[index];
        return e;
      }),
      (error, data) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Events data saved successfully!');
        }
      }
    );
  } catch (err) {
    return handleError(err);
  }

  console.log('Connected successfully');
});
