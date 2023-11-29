const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');

const routes = require('./routes/index-route');
const app = express();

const http = require('http'); // Import the http module
const socketIo = require('socket.io');
const server = http.createServer(app); // Create an http server
const io = socketIo(server); // Attach Socket.IO to the server


app.use(express.json());
app.use(cors())
app.use(bodyParser.json());

app.use('/api', routes);


// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected');

    // Example: Listen for a chat message event
    socket.on('chatMessage', (message) => {
        console.log('Message from client:', message);

        // Broadcast the message to all connected clients
        io.emit('chatMessage', message);
    });

    // Example: Listen for a disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



app.listen(7000, (req, resp) => {
    console.log('Server is running on http://localhost:7000');
})
