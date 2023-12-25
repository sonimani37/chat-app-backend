const http = require('http'); // Import the http module
const express = require('express');
const socketIo = require('socket.io');

const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const cors = require('cors')
const bodyParser = require('body-parser');
const routes = require('./routes/index-route');

const app = express();

const server = http.createServer(app); // Create an http server
// const io = socketIo(server); // Attach Socket.IO to the server


app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("./uploads"));

const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

const crypto = require('crypto');
// Generate a random string to use as the secret key
const secretKey = crypto.randomBytes(32).toString('hex');

app.use(session({ secret: secretKey, resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use('/api', routes);

// Socket.IO connection event
io.on('connection', (socket) => {

    // Example: Listen for a chat message event
    socket.on('user-message', (message) => {
        // Broadcast the message to all connected clients
        io.emit('chatMessage', message);
    });

    // Listen for group chat messages
    socket.on('group-message', (data) => {
        // Broadcast the message to all users in the room
        io.emit('chatGroupMessage', data);
    });

    // Listen for user status change events
    socket.on('status-change', (data) => {
        // Broadcast the status change to all connected clients
        io.emit('userStatusChange', data);
    });

    // Handle call initiation
    socket.on('call', async ({ callerId, receiverId }) => {
        // Check if the receiver is available
        console.log('callerId, receiverId',callerId, receiverId);
        const receiverSocket = io.sockets.sockets.get(receiverId);

        console.log('receiverSocket',receiverSocket);

        if (receiverSocket) {
            // Update the call status
            await ActiveCall.create({ callerId, receiverId, status: 'pending' });

            // Notify the receiver about the incoming call
            receiverSocket.emit('incomingCall', { callerId, receiverId });
        } else {
            // Handle the case where the receiver is not available
            socket.emit('callError', { message: 'User is not available.' });
        }
    });

    // Handle call acceptance
    socket.on('acceptCall', async ({ callerId, receiverId }) => {
        // Update the call status to ongoing
        await ActiveCall.update({ status: 'ongoing' }, { where: { callerId, receiverId } });

        // Notify both the caller and the receiver that the call is accepted
        io.to(callerId).emit('callAccepted', { callerId, receiverId });
        io.to(receiverId).emit('callAccepted', { callerId, receiverId });
    });

    // Handle call termination
    socket.on('endCall', async ({ callerId, receiverId }) => {
        // Update the call status to ended
        await ActiveCall.update({ status: 'ended' }, { where: { callerId, receiverId } });

        // Notify both the caller and the receiver that the call has ended
        io.to(callerId).emit('callEnded', { callerId, receiverId });
        io.to(receiverId).emit('callEnded', { callerId, receiverId });
    });

    // Example: Listen for a disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(7000, (req, resp) => {
    console.log('Server is running on http://localhost:7000');
})


