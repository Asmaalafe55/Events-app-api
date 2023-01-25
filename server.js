import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router.js';
import { config } from 'dotenv';

import Categories from './models/eventsCategories.model.js';
import Events from './models/events.model.js';
import data from './data/data.json' assert { type: 'json' };

import { errorConverter, errorHandler } from './middlewares/error.js';

const app = express();
config();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5173',
    ],
    credentials: true,
  })
);

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

  Categories.insertMany(data.events_categories, (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Data saved successfully!');
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
        console.log('Data saved successfully!');
      }
    }
  );
  console.log('Connected successfully');
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});
