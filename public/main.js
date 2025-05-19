const socket = io();

socket.on('broadcast', (message) => {
  console.log(message);
});
socket.on('total-sockets', (data) => {
  console.log(data);
});
