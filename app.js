import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// import connectToDatabase from './db/connection.js';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import path from 'path';
import * as url from 'url';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 4040;
const server = http.createServer(app);
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const io = new Server(server);

let connectedSockets = new Set();

io.on('connection', (socket) => {
  socket.emit('broadcast', 'connected');

  console.log(`connected socket id: ${socket.id}`);
  connectedSockets.add(socket.id);

  io.emit('total-sockets', connectedSockets.size);

  socket.on('disconnect', () => {
    console.log(`socket disconnected: ${socket.id}`);

    connectedSockets.delete(socket.id);
    io.emit('total-sockets', connectedSockets.size);
  });
});

// DATABASE CONNECTION
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

app.set('io', io);

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// static file configuration
app.use(express.static(path.join(__dirname, 'public')));

// cors configuration
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
server.listen(PORT, () => {
  console.log(`Server running at PORT http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} already in use`);
  } else {
    console.log(`Server error : ${error}`);
  }
});
