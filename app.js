const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');
const { portNumber } = require('./utils/config');
const { login, createUser } = require('./controllers/user');
const { PORT = portNumber } = process.env;
const { auth } = require('./middlewares/auth');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);
app.use(router);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
