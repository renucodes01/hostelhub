const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  block: { type: String, required: true },
  floor: { type: Number, default: 1 },
  type: { type: String, enum: ['Single', 'Double', 'Triple', 'Four'], default: 'Double' },
  capacity: { type: Number, required: true, min: 1 },
  fee: { type: Number, default: 30000 },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
module.exports = mongoose.model('Room', roomSchema);
