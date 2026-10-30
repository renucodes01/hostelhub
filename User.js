const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'warden'], default: 'student' },
  phone: String,
  course: String,
  year: String,
  guardianName: String,
  guardianPhone: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);
