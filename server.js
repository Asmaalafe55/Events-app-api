import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './router.js';

import { errorConverter, errorHandler } from './middlewares/error.js';

const app = express();
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

const username = '<mongodb username>';
const password = '<password>';
const cluster = '<cluster name>';
const dbname = 'myFirstDatabase';

mongoose.connect(
  'mongodb+srv://eventsApp:<password>@clusterforeventsapp.yjih8bo.mongodb.net/?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});
