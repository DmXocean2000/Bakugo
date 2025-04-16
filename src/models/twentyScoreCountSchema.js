const mongoose = require('mongoose');

const twentyScoreCountSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  score: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('TwentyScore', twentyScoreCountSchema);
