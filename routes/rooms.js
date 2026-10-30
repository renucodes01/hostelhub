const router = require('express').Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { protect, wardenOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const rooms = await Room.find().populate('occupants', 'name email course year').sort({ block: 1, number: 1 });
  res.json(rooms);
});

router.post('/', wardenOnly, async (req, res) => {
  try {
    const { number, block, floor, type, capacity, fee } = req.body;
    const room = await Room.create({ number, block, floor, type, capacity, fee });
    res.status(201).json(room);
  } catch (e) {
    res.status(400).json({ message: e.code === 11000 ? 'Room number already exists' : e.message });
  }
});

router.delete('/:id', wardenOnly, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (room.occupants.length) return res.status(400).json({ message: 'Vacate the room before deleting' });
  await room.deleteOne();
  res.json({ message: 'Room deleted' });
});

router.post('/:id/allocate', wardenOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const student = await User.findById(req.body.studentId);
    if (!room || !student) return res.status(404).json({ message: 'Room or student not found' });
    if (student.room) return res.status(400).json({ message: 'Student already has a room' });
    if (room.occupants.length >= room.capacity) return res.status(400).json({ message: 'Room is full' });
    room.occupants.push(student._id);
    student.room = room._id;
    await room.save();
    await student.save();
    res.json({ message: 'Room allocated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/:id/vacate', wardenOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    room.occupants = room.occupants.filter((o) => String(o) !== req.body.studentId);
    await room.save();
    await User.findByIdAndUpdate(req.body.studentId, { room: null });
    res.json({ message: 'Student vacated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
