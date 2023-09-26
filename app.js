import dotenv from 'dotenv';
import connectToDatabase from './db/connection';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler';
import routers from './routes/index';
import http from 'http';
import initiateIO from './socketIO/socket';
// const hbs = require("express-handlebar")

const app = express();
const PORT = process.env.PORT || 4040;
const server = http.createServer(app);
const CHAT_WITH_CONSULTANT = 'CHAT_WITH_CONSULTANT';

// SOCKET CONNECTION
initiateIO(server);
connectToDatabase();
dotenv.config({ path: './env' });

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

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
