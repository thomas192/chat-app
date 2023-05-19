const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
