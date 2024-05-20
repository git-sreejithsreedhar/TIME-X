const mongoose = require('mongoose')
const googleAuthUsersScema = mongoose.Schema({
    googleId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required:true
  }
})

module.exports= mongoose.model('googleAuthUsers',googleAuthUsersScema)