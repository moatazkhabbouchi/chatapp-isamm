const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById("room-name")
const userList = document.getElementById("users")

// Get username and room from url

const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});

console.log(username, room)

const socket = io();

//Join room
socket.emit("joinRoom", {username, room})

//Get room and users
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room)
    outputUsers(users)
})

socket.on('message', mes => {
    console.log(mes.text)
    outputMessage(mes)
    //Scroll the buttom of the page
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


//Message submit
chatForm.addEventListener('submit', (e) =>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    //Emitting message to the server
    socket.emit('chatMessage', msg)

    //Clearing the text box after sending
    e.target.elements.msg.value = " "
    e.target.elements.msg.focus();
})


//Output message to dom
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);    
}

//Output room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Output users to DOM
function outputUsers(users){
    console.log(users)
    userList.innerHTML = `
        ${users.map(user => `<li> ${user.username} </li>`).join('')}
    `;
}