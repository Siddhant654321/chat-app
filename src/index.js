const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const path = require('path');
const PORT = process.env.PORT;
const socketio = require('socket.io');
const io = socketio(server);
const filter = require('bad-words');
const public = path.join(path.dirname('../'), 'public');
let users = {};
let userLeft= {};

app.use(express.static(public));

app.get('/isValid', (req, res) => {
    if(!users.hasOwnProperty(req.query.room)){
        return res.send({isValid: 'true'})
    }
    const arr = users[req.query.room].filter((value) => {
        return value.toLowerCase() == req.query.username.toLowerCase()
    })
    if(arr.length != 0){
        return res.send({isValid: 'false'})
    } 
    res.send({isValid: 'true'})
})

io.on('connection', (socket) => {
    socket.on('newConnection', (username, room) => {
        socket.broadcast.to(room).emit('newJoin', username)
        socket.join(room);
        if(userLeft.hasOwnProperty(room)){
            if(userLeft[room].includes(username)){
                userLeft[room].splice(userLeft[room].indexOf(username), 1);
            }
        }
        if(users.hasOwnProperty(room)){
            if(!users[room].includes(username)){
                users[room].push(username)
            }
        } else {
            users[room] = [username];
        }
        io.to(room).emit('userList', users[room], userLeft[room])
        socket.on('disconnect', () => {
            socket.broadcast.to(room).emit('userLeft', username)
            users[room].splice(users[room].indexOf(username), 1)
            if(users[room].length == 0){
                delete users[room]
            }
            if(userLeft.hasOwnProperty(room)){
                userLeft[room].push(username);
            } else {
                userLeft[room] = [username];
            }
            io.to(room).emit('userList', users[room], userLeft[room])
        })
        socket.emit('welcomeMessage')
        socket.on('sendMessage', (message, callback) => {
            const Filter = new filter();

            if(Filter.isProfane(message)){
                return callback()
            }
            io.to(room).emit('message', message, username)
        })
        socket.on('shareLocation', (lat, lon, callback) => {
            socket.broadcast.to(room).emit('location', lat, lon, username);
            callback();
        })
    })
    
    
})

server.listen(PORT, () => {
    console.log(`Server is up on Port ${PORT}`)
})