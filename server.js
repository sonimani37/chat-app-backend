const http = require('http'); // Import the http module
const express = require('express');
const socketIo = require('socket.io');

const SimplePeer = require('simple-peer');

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


const { ActiveCall } = require('./models');

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

const peerConnections = {};

// Socket.IO connection event
io.on('connection', (socket) => {

    // Example: Listen for a chat message event
    socket.on('user-message', (message) => {
        // Broadcast the message to all connected clients
        io.emit('chatMessage', message);
    });

    // Listen for group chat messages
    socket.on('group-message', (data) => {
        // Broadcast the message to all group users in the room
        io.emit('chatGroupMessage', data);
    });

    // Listen for user status change events
    socket.on('status-change', (data) => {
        // Broadcast the status change to all connected clients
        io.emit('userStatusChange', data);
    });

    socket.on('join', (userId) => {
        socket.join(userId);
    });

    socket.on('callUser', (data) => {
        console.log(data);
        io.to(data.to).emit('incomingCalls', { signal: data.signalData, from: data.from });
    });

    socket.on('answerCall', (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    });


    // Handle call initiation
    socket.on('call', async ({ callerId, receiverId }) => {
        // Check if the receiver is available
        console.log('---------3---------- callerId, receiverId', callerId, receiverId);

        socket.data = {
            userId: receiverId
        };

        // const receiverSocket = io.sockets.sockets.get(receiverId);
        const receiverSocket = getReceiverSocket(receiverId);

        // console.log('receiverSocket', receiverSocket);

        if (receiverSocket) {
            console.log('-----call--4-------- callerId, receiverId', callerId, receiverId);

            // Update the call status
            await ActiveCall.create({ callerId, receiverId, status: 'pending' });

            // Notify the receiver about the incoming call
            io.emit('incomingCall', { callerId, receiverId });

            // // Create WebRTC peer connections
            // const callerPeer = new SimplePeer({ initiator: true, trickle: false });
            // const receiverPeer = new SimplePeer({ trickle: false });

            // // Store the peer connections in a global array or data structure to manage multiple ongoing calls

            // peerConnections[callerId] = callerPeer;
            // peerConnections[receiverId] = receiverPeer;

            // // Exchange SDP offer and answer
            // callerPeer.on('signal', (data) => {
            //     io.to(receiverSocket.id).emit('offer', data);
            // });

            // receiverPeer.on('signal', (data) => {
            //     io.to(callerId).emit('answer', data);
            // });

            // // Establish WebRTC data channel
            // callerPeer.on('connect', () => {
            //     console.log('WebRTC connection established');
            // });

            // // Handle incoming audio stream
            // callerPeer.on('stream', (stream) => {
            //     io.to(receiverId).emit('incomingAudio', stream);
            // });

            // // Add the peers to your global array or data structure for further management

            // // // Notify the receiver about the incoming call
            // // io.to(receiverSocket.id).emit('incomingCall', { callerId, receiverId });
            // io.emit('incomingCall', { callerId, receiverId });
        } else {
            console.log('-----call--4-------- else',);
            // Handle the case where the receiver is not available
            io.emit('callError', { message: 'User is not available.' });
        }
    });

    // Handle call acceptance
    socket.on('acceptCall', async ({ callerId, receiverId }) => {
        console.log('-------acceptCall--3----------' + callerId);
        // Update the call status to ongoing
        await ActiveCall.update({ status: 'ongoing' }, { where: { callerId, receiverId } });

        // // Notify both the caller and the receiver that the call is accepted
        io.to(callerId).emit('callAccepted', { callerId, receiverId });
        io.to(receiverId).emit('callAccepted', { callerId, receiverId });
        // io.emit('callAccepted', { callerId, receiverId });
    });

    // Handle call termination
    socket.on('endCall', async ({ callerId, receiverId }) => {
        console.log('-------endCall--3----------' + this.callerId);
        // Update the call status to ended
        await ActiveCall.update({ status: 'ended' }, { where: { callerId, receiverId } });

        // // Notify both the caller and the receiver that the call has ended
        // io.to(callerId).emit('callEnded', { callerId, receiverId });
        io.to(receiverId).emit('callEnded', { callerId, receiverId });
        // io.emit('callEnded', { callerId, receiverId });
    });

    // Example: Listen for a disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socket.data && socket.data.userId) {
            const userId = socket.data.userId;
            const peer = peerConnections[userId];
            if (peer) {
                peer.destroy();
                delete peerConnections[userId];
            }
        }
    });
});


function getReceiverSocket(receiverId) {
    const connectedSockets = io.sockets.sockets;

    for (const [socketId, socket] of connectedSockets.entries()) {
        // Assuming the receiverId is stored in the socket's data
        if (socket.data && socket.data.userId === receiverId) {
            return socket;
        }
    }
    return null;
}


server.listen(7000, (req, resp) => {
    console.log('Server is running on http://localhost:7000');
})

