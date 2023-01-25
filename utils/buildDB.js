import mongoose from 'mongoose';
import { config } from 'dotenv';

import Categories from '../models/eventsCategories.model.js';
import Events from '../models/events.model.js';
import data from '../data/data.json' assert { type: 'json' };

config();

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;

mongoose.connect(
  `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  // console.log(process.argv);

  // Categories.collection.drop();
  // Events.collection.drop();
  // function (err) {
  //   console.log('Categories collection dropped');
  //   if (err) return handleError(err);
  // }

  Categories.insertMany(data.events_categories, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Categories data saved successfully!');
    }
  });

  Events.insertMany(
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
  console.log('Connected successfully');
});
