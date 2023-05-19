const mongoose = require('mongoose');
const Message = require('./models/message');

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

mongoose.connect('mongodb://127.0.0.1:27017/chat_app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New Socket.IO connection');

  socket.on('join', ({ topic, pseudo }) => {
    socket.join(topic);
    console.log(`${pseudo} joined ${topic}`);

    Message.find({ topic })
    .then(messages => {
      socket.emit('previousMessages', messages);
    })
    .catch(err => console.log(err));
  });

  socket.on('message', ({ topic, pseudo, message }) => {
    const msg = new Message({ topic, pseudo, message });
    msg.save()
      .then((doc) => {
        io.to(topic).emit('message', { 
          _id: doc._id,
          pseudo: pseudo, 
          message: message
        });
        console.log(`Message from ${pseudo} in ${topic} : ${message}`);
      })
      .catch(err => console.log(err));
  });

  socket.on('editMessage', ({ id, newContent, pseudo }) => {
    Message.findById(id)
      .then(message => {
        if (message && message.pseudo === pseudo) {
          message.message = newContent;
          return message.save();
        }
      })
      .then(message => {
        if (message) {
          io.to(message.topic).emit('messageEdited', { id: message._id, newContent: message.message });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });  

  socket.on('deleteMessage', ({ id, pseudo }) => {
    let topic;

    Message.findById(id)
      .then(message => {
        if (message.pseudo === pseudo) {
          topic = message.topic;
          return Message.findByIdAndDelete(id);
        }
      })
      .then(() => {
        io.to(topic).emit('messageDeleted', id);
      })
      .catch(err => {
        console.error(err);
      });
  });  
  
  socket.on('leave', ({ topic, pseudo }) => {
    socket.leave(topic);
    console.log(`${pseudo} has left the topic ${topic}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = 3001;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
