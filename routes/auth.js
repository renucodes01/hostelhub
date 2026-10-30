const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, course, year, guardianName, guardianPhone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'student', phone, course, year, guardianName, guardianPhone });
    res.status(201).json({ token: sign(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(400).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: { id: user._id, name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('room');
  res.json(user);
});

module.exports = router;
