const usernameInput = document.querySelector('#username');
const roomID = document.querySelector('#room-id');
const ownUsernameDisplay = document.querySelector('#own-username');

const inputPanel = document.querySelector('#input-panel');
const chatPanel = document.querySelector('#chat-panel');
const chatContainer = document.querySelector('#chat-container');
const messageInput = document.querySelector('#message-input');

const joinRoomButton = document.querySelector('#join-room');
const createRoomButton = document.querySelector('#create-room');
const roomIDDisplay = document.querySelector('#room-id-display');

const warningContainer = document.querySelector('#warning-login');
const warningText = document.querySelector('#warning-text');
let warningTimeout;

const socket = io();

let connected = false;
let roomName = '';
let username = '';


joinRoomButton.addEventListener('click', () => {
    if (usernameInput.value && roomID.value){
        joinChatRoom(usernameInput.value, roomID.value);
    }else{
        showWarning('Please provide a username and a roomID');
    }
});

createRoomButton.addEventListener('click', () => {
    if (usernameInput.value){
        createChatRoom(usernameInput.value);
    }else{
        showWarning('Please provide a username');
    }
});

messageInput.addEventListener('keydown', (ev) => {
    if (ev.keyCode === 13){
        if (messageInput.value){
            socket.emit('sendMessage', messageInput.value);
            messageInput.value = '';
        }
    }
});

function joinChatRoom(usr, room) {
    socket.emit('joinRoom', {
        username: usr,
        roomID: room
    });
}

function createChatRoom(usr) {
    socket.emit('createRoom', usr);
}
function showWarning(warn) {
    clearTimeout(warningTimeout);
    warningText.innerText = warn;
    warningContainer.style.display = 'flex';
    warningTimeout = setTimeout(() => {
        warningText.innerText = '';
        warningContainer.style.display = 'none';
    }, 3000);
}

function appendMessageLine(type, data) {
    let htmlString = '';
    switch (type) {
        case 'info': {
            htmlString = createInfoMessage(data.infoText);
            break;
        }
        case 'userJoined': {
            htmlString = createJoinMessage(data.joinedUser, data.numUsers);
            break;
        }
        case 'userLeft': {
            htmlString = createLeaveMessage(data.leftUser, data.numUsers);
            break;
        }
        case 'ownMessage': {
            htmlString = createOwnMessage(data.messageContent, data.timestamp);
            break;
        }
        case 'messageReceived': {
            htmlString = createReceivedMessage(data.messageContent, data.userReceived, data.timestamp, data.userColour);
        }
    }
    chatContainer.innerHTML += htmlString;
}

function createInfoMessage(infoText) {
    return `<div class="msg-line center">
                <p class="msg-text">
                    <span class="info">${infoText}</span>
                </p>
            </div>`;
}

function createJoinMessage(joinedUser, numUsers) {
    return `<div class="msg-line center">
                <p class="msg-text">
                    <span class="user-joined">${joinedUser} joined</span>
                    <span class="info"> --> Current participants: ${numUsers}</span>
                </p>
            </div>`;
}
function createLeaveMessage(leftUser, numUsers) {
    return `<div class="msg-line center">
                <p class="msg-text">
                    <span class="user-left">${leftUser} left</span>
                    <span class="info"> --> Current participants: ${numUsers}</span>
                </p>
            </div>`;
}

function createOwnMessage(msg, timestamp) {
    return `<div class="msg-line right">
                <p class="msg-text">
                    <span class="sent">${msg}</span>
                    <span class="timestamp-received info">${timestamp}</span>
                </p>
            </div>`;
}

function createReceivedMessage(msg, usr, timestamp, col) {
    return `<div class="msg-line received">
                <p class="msg-text">
                    <span class="timestamp-received info">${timestamp}</span>
                    <span class="username-received" style="color: ${col}">${usr}: </span>
                    <span class="sent">${msg}</span>
                </p>
            </div>`;
}

socket.on('warning', (str) => {
    showWarning(str);
});

socket.on('joinRoom', (data) => {
    roomName = data.roomID;
    username = data.username;
    inputPanel.style.display = 'none';
    chatPanel.style.display = 'flex';
    roomIDDisplay.innerText = `Room ID: ${data.roomID}`;
    ownUsernameDisplay.innerText = `${username}: `;
    ownUsernameDisplay.style.color = data.userColour;
    connected = true;
    appendMessageLine('info', {
        infoText: `== == == == Welcome to chat room ${roomName} == == == ==`
    });
    appendMessageLine('info', {
        infoText: `Current participants: ${data.currentUsers}`
    });
});
socket.on('userJoined', (data) => {
    appendMessageLine('userJoined', {
        joinedUser: data.username,
        numUsers: data.currentUsers
    });
    scrollToBottom();
});

socket.on('userLeft', (data) => {
    appendMessageLine('userLeft', {
        leftUser: data.username,
        numUsers: data.currentUsers
    });
    scrollToBottom();
});

socket.on('ownMessage', (data) => {
    appendMessageLine('ownMessage', {
        messageContent: data.messageContent,
        timestamp: data.timestamp,
    });
    scrollToBottom();
});

socket.on('messageReceived', (data) => {
    appendMessageLine('messageReceived', {
        messageContent: data.messageContent,
        userReceived: data.username,
        timestamp: data.timestamp,
        userColour: data.userColour
    });
    scrollToBottom();
});

function scrollToBottom(){
    chatContainer.scrollTop = chatContainer.scrollHeight;
}