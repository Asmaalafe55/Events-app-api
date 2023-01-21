const express = require('express');
const cors = require('cors');
const router = require('./router');

const { errorConverter, errorHandler } = require('./middlewares/error');

const app = express();
const port = process.env.PORT || 4000;

// app.use(
//     cors({
//       origin: [
//         'http://localhost:3000',
//         'http://127.0.0.1:5173',
//         'http://localhost:5173',
//       ],
//       credentials: true,
//     })
//   );

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.use(errorConverter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} `);
});
