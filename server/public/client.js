const usernameInput = document.querySelector('#username');
const roomID = document.querySelector('#room-id');
const ownUsernameDisplay = document.querySelector('#own-username');

const inputPanel = document.querySelector('#input-panel');
const chatPanel = document.querySelector('#chat-panel');

const joinRoomButton = document.querySelector('#join-room');
const createRoomButton = document.querySelector('#create-room');
const roomIDDisplay = document.querySelector('#room-id-display');

const warningContainer = document.querySelector('#warning-login');
const warningText = document.querySelector('#warning-text');
let warningTimeout;

const socket = io();

let connected = false;
let typing = false;
let roomName = '';
let username = '';


joinRoomButton.addEventListener('click', () => {
    if (usernameInput.value && roomID.value){
        joinChatRoom()
    }else{
        showWarning('Please provide a username and a roomID');
    }
});

createRoomButton.addEventListener('click', () => {
    if (usernameInput.value){
        createChatRoom();
    }else{
        showWarning('Please provide a username');
    }
});

function joinChatRoom() {
    
}

function createChatRoom() {
    socket.emit('createRoom', usernameInput.value);
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

socket.on('tooManyRooms', () => {
    showWarning('Too many rooms');
});

socket.on('joinRoom', (data) => {
    roomName = data.roomID;
    username = data.username;
    inputPanel.style.display = 'none';
    chatPanel.style.display = 'flex';
    roomIDDisplay.innerText = `Room ID: ${data.roomID}`;
    ownUsernameDisplay.innerText = `${username}@${roomName}: `;
});