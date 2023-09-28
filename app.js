import dotenv from 'dotenv';
dotenv.config({ path: './env' });

import connectToDatabase from './db/connection.js';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import * as routers from './routes/index.js';
import http from 'http';
import path from 'path';
import * as url from 'url';
import IO from './socketIO/socket.js';

const app = express();
const PORT = process.env.PORT || 4040;
const server = http.createServer(app);
const CHAT_WITH_CONSULTANT = 'CHAT_WITH_CONSULTANT';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SOCKET CONNECTION
IO(server);

// connectToDatabase();

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

app.get('/', (req, res, next) => {
  res.send('Welcome to my api {Application interface}');
});

app.use('/api/auth', routers.authRoute.default);
app.use('/api/users', routers.userRoute.default);
app.use('/api/transactions', routers.transactionRoute.default);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server running at PORT http://localhost:${PORT}`);
});
