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

mongoose.connect(
  `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
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
