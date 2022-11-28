const { on } = require('events');
const express = require('express')
const http = require('http');
const socketio = require('socket.io')
const path = require('path')
const formatMessage = require('./utils/messages')
const {userJoin, getUser,userLeaves, getRoomUsers} = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when client connects
io.on('connection', socket => {
    socket.on("joinRoom", ({username, room})=>{
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        socket.emit('message', formatMessage('chatApp Bot', 'Welcome to chatApp'));
         //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage('chatApp Bot', `${user.username} has joined the chat` ));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //Listen for chatMessage
    socket.on('chatMessage', msg=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    //Run when a client disconnects
    socket.on('disconnect', () =>{
        const user = userLeaves(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage('ChatApp Bot', `${user.username} left the chat`))  
            //Send users and room info
             io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        }

        
    })

})


server.listen(3000, ()=>{
    console.log("Listening on port 3000")
})