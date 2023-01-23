import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router.js';
import { config } from 'dotenv';

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
  console.log('Connected successfully');
});

const Person = mongoose.model('Person', {
  name: String,
  age: Number,
  email: String,
  phone: String,
});

// make a query to persons
Person.find({}).then((persons) => {
  console.log(persons);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});
