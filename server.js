const express = require('express')
const app = express()
// const cors = require('cors')
// app.use(cors())


const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});


const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs')
app.use(express.static('public'))

// main route
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

// room can be if there be an code 
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// one pipe
// video call mean req and res ... so we should have many pipes
// so we should use socket
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId);
    // messages ... after pressing enter .. will work
    socket.on('message', (message) => {
      //send message to the same room
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||3030)



