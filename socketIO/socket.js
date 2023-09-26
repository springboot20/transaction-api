import { Server } from 'socket.io';

const initiateIO = (server) => {
  return new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
};
Server.on('connection', (_socket) => {});

export default initiateIO;
