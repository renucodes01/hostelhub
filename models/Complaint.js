const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Electrical', 'Plumbing', 'Cleaning', 'Food/Mess', 'Internet', 'Furniture', 'Other'], default: 'Other' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  remark: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Complaint', complaintSchema);
