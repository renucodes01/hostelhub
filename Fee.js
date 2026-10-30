const mongoose = require('mongoose');
const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paidOn: Date,
  method: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Fee', feeSchema);
