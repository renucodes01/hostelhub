const router = require('express').Router();
const Complaint = require('../models/Complaint');
const { protect, wardenOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const filter = req.user.role === 'warden' ? {} : { student: req.user._id };
  const list = await Complaint.find(filter).populate('student', 'name email').sort({ createdAt: -1 });
  res.json(list);
});

router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
    const { category, title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description required' });
    const c = await Complaint.create({ student: req.user._id, category, title, description });
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', wardenOnly, async (req, res) => {
  const { status, remark } = req.body;
  const c = await Complaint.findByIdAndUpdate(req.params.id, { status, remark }, { new: true });
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  res.json(c);
});

module.exports = router;
