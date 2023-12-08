const http = require('http'); // Import the http module
const express = require('express');
const socketIo = require('socket.io');

const cors = require('cors')
const bodyParser = require('body-parser');
const routes = require('./routes/index-route');
const runCronJob = require('./helper/cronjobs');

const app = express();

const server = http.createServer(app); // Create an http server

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("./uploads"));

const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

// runCronJob();

app.use(bodyParser.json());
app.use('/api', routes);

// Socket.IO connection event
io.on('connection', (socket) => {
    // Listen for a chat message event
    socket.on('user-message', (message) => {
        // Broadcast the message to all connected clients
        io.emit('chatMessage', message);
    });

    // Listen for group chat messages
    socket.on('group-message', (data) => {
        // Broadcast the message to all users in the room
        io.emit('chatGroupMessage', data);
    });

    // Example: Listen for a disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(7000, (req, resp) => {
    console.log('Server is running on http://localhost:7000');
})


