const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`TCP Socket listening on port ${PORT}...`);
});

app.use(express.static(path.join(__dirname, "public")));
