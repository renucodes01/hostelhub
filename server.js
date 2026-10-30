require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { connect, hint } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) =>
  res.json({ server: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' })
);

// While DB is not connected, give a clear JSON message instead of hanging
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  res.status(503).json({ message: 'Database not connected yet. Please try again in a few seconds.' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/students', require('./routes/students'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/stats', require('./routes/stats'));

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

// Any error inside a route -> JSON message (server does not crash)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

async function startDb() {
  try {
    await connect();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    const h = hint(err);
    if (h) console.error('HINT:', h);
    if (/placeholder|missing/i.test(err.message)) return; // config problem, retrying will not help
    console.error('Retrying in 10 seconds...');
    setTimeout(startDb, 10000);
  }
}
startDb();
