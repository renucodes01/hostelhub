const router = require('express').Router();
const Fee = require('../models/Fee');
const User = require('../models/User');
const { protect, wardenOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const filter = req.user.role === 'warden' ? {} : { student: req.user._id };
  const fees = await Fee.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
  res.json(fees);
});

// studentId = specific id OR "all" (bill every student)
router.post('/', wardenOnly, async (req, res) => {
  try {
    const { studentId, title, amount, dueDate } = req.body;
    if (!studentId || !title || !amount || !dueDate) return res.status(400).json({ message: 'All fields required' });
    const targets = studentId === 'all' ? await User.find({ role: 'student' }).select('_id') : [{ _id: studentId }];
    if (!targets.length) return res.status(400).json({ message: 'No students found' });
    await Fee.insertMany(targets.map((t) => ({ student: t._id, title, amount, dueDate })));
    res.status(201).json({ message: `Fee added for ${targets.length} student(s)` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id/pay', wardenOnly, async (req, res) => {
  const fee = await Fee.findByIdAndUpdate(req.params.id, { status: 'Paid', paidOn: new Date(), method: req.body.method || 'Cash' }, { new: true });
  if (!fee) return res.status(404).json({ message: 'Fee not found' });
  res.json(fee);
});

router.delete('/:id', wardenOnly, async (req, res) => {
  await Fee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Fee deleted' });
});

module.exports = router;
