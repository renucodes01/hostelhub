const router = require('express').Router();
const User = require('../models/User');
const Room = require('../models/Room');
const Fee = require('../models/Fee');
const Complaint = require('../models/Complaint');
const { protect, wardenOnly } = require('../middleware/auth');

router.get('/', protect, wardenOnly, async (req, res) => {
  const [students, rooms, fees, complaints] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Room.find(),
    Fee.find(),
    Complaint.find()
  ]);
  const capacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupied = rooms.reduce((s, r) => s + r.occupants.length, 0);
  const sum = (arr) => arr.reduce((s, f) => s + f.amount, 0);
  res.json({
    students,
    totalRooms: rooms.length,
    capacity,
    occupied,
    vacant: capacity - occupied,
    feeCollected: sum(fees.filter((f) => f.status === 'Paid')),
    feePending: sum(fees.filter((f) => f.status === 'Pending')),
    complaints: {
      Open: complaints.filter((c) => c.status === 'Open').length,
      'In Progress': complaints.filter((c) => c.status === 'In Progress').length,
      Resolved: complaints.filter((c) => c.status === 'Resolved').length
    }
  });
});

module.exports = router;
