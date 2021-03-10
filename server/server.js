const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;
const maxRooms = 10;
let activeRooms = 0;
let roomUserCount = {};
let usedColours = {};

server.listen(PORT, () => {
    console.log(`TCP Socket listening on port ${PORT}...`);
});

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', (socket) => {
    let addedUser = false;
    let roomID = '';
    let userColour = '';

    socket.on('createRoom', (username) => {
        if (addedUser) return;
        if(activeRooms >= maxRooms){
            return socket.emit('warning', 'Too many rooms');
        }
        socket.username = username.length > 18 ? 'Herr Lo' : username;
        addedUser = true;
        roomID = generateRoomID(3);
        socket.join(roomID);
        activeRooms++;
        roomUserCount[roomID] = 1;
        usedColours[roomID] = [];
        userColour = getRandomColour(roomID);
        socket.emit('joinRoom', {
            roomID,
            username: socket.username,
            currentUsers: 1,
            userColour
        });
    });

    socket.on('joinRoom', (data) => {
        if (addedUser) return;
        if(!io.sockets.adapter.rooms.has(data.roomID)){
            return socket.emit('warning', 'Room does not exist');
        }
        if (roomUserCount[data.roomID] >= 9){
            return socket.emit('warning', 'Room ist full');
        }
        roomID = data.roomID;
        socket.username = data.username.length > 18 ? 'Herr Lo' : data.username;
        addedUser = true;
        roomUserCount[roomID]++;
        userColour = getRandomColour(roomID);
        socket.join(data.roomID);
        socket.broadcast.to(roomID).emit('userJoined', {
            username: socket.username,
            currentUsers: roomUserCount[roomID],
            userColour
        });
        socket.emit('joinRoom', {
            roomID,
            username: socket.username,
            currentUsers: roomUserCount[roomID],
            userColour
        });
    });

    socket.on('sendMessage', (msg) => {
        let timestamp = getCurrentTimeStamp();
        socket.broadcast.to(roomID).emit('messageReceived', {
            username: socket.username,
            messageContent: msg,
            timestamp,
            userColour
        });
        socket.emit('ownMessage', {
            messageContent: msg,
            timestamp
        });
    });

    socket.on('disconnect', () => {
        if (addedUser) {
            roomUserCount[roomID]--;
            socket.broadcast.to(roomID).emit('userLeft', {
                username: socket.username,
                currentUsers: roomUserCount[roomID]
            });
            socket.leave(roomID);
        }
    });
});

function generateRoomID(len) {
    let res = 'tcp';
    let pool = '0123456789';
    for (let i = 0; i < len; i++) {
        res += pool.charAt(Math.floor(Math.random() * pool.length));
    }
    return res;
}

function getCurrentTimeStamp() {
    const date = new Date();
    return `${date.getHours() >= 10 ? date.getHours() : '0' + date.getHours()}:${date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()}`;
}

function getRandomColour(id) {
    const colours = ['#FFF100', '#ff8c00', '#e81123', '#ec008c', '#68217a', '#00bcf2', '#00b294', '#009e49', '#bad80a'];
    let res = '';
    do {
        res = colours[Math.floor(Math.random() * colours.length)];
    } while(usedColours[id].includes(res));
    return res;
}