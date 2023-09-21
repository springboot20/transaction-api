require('dotenv').config();
require('./db/connection')();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const routers = require('./routes/index');
const http = require('http');

const SocketIO = require('socket.io');

const CHAT_WITH_CONSULTANT = 'CHAT_WITH_CONSULTANT';

const app = express();
const PORT = process.env.PORT || 4040;
const server = http.createServer(app);

const io = new SocketIO.Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// io.on('connection', () => {});

mongoose.connection.on('connect', () => {
  console.log('Mongodb connected ....');
});

process.on('SIGINT', () => {
  mongoose.connection.once('disconnect', () => {
    console.log('Mongodb disconnected..... ');
    process.exit(0);
  });
});

app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

/**
 * API ROUTES
 */

app.use('/api/auth', routers.authRoute);
app.use('/api/users', routers.userRoute);
app.use('/api/transactions', routers.transactionRoute);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running at PORT http://localhost:${PORT}`);
});
