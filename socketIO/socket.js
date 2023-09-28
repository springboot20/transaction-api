import { Server } from 'socket.io';

const IO = (server) => {
  return new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT'],
    },
  });
};

const init = new Server();

init.on('connection', (socket) => {
  console.log(`User ${socket.id}`);
});

export default IO;
