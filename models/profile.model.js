// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  profileDescription: {
    type: String,
    default: 'Hello! This is me 👋🏼',
  },
  avatarUrl: {
    type: String,
    default:    'https://xsgames.co/randomusers/avatar.php?g=pixel'
    ,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
