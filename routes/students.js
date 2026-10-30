const router = require('express').Router();
const User = require('../models/User');
const Room = require('../models/Room');
const Fee = require('../models/Fee');
const Complaint = require('../models/Complaint');
const { protect, wardenOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', wardenOnly, async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password').populate('room', 'number block').sort({ name: 1 });
  res.json(students);
});

router.put('/me', async (req, res) => {
  const { phone, course, year, guardianName, guardianPhone } = req.body;
  const u = await User.findByIdAndUpdate(req.user._id, { phone, course, year, guardianName, guardianPhone }, { new: true }).select('-password');
  res.json(u);
});

router.delete('/:id', wardenOnly, async (req, res) => {
  const s = await User.findById(req.params.id);
  if (!s || s.role !== 'student') return res.status(404).json({ message: 'Student not found' });
  if (s.room) await Room.findByIdAndUpdate(s.room, { $pull: { occupants: s._id } });
  await Fee.deleteMany({ student: s._id });
  await Complaint.deleteMany({ student: s._id });
  await s.deleteOne();
  res.json({ message: 'Student removed' });
});

module.exports = router;
