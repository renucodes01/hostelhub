// Run:  npm run check   -> tells exactly which step fails
require('dotenv').config();
const mongoose = require('mongoose');
const { connect, hint } = require('./db');
(async () => {
  console.log('User     :', process.env.DB_USER || '(inside MONGO_URI)');
  console.log('Pass len :', (process.env.DB_PASS || '').length);
  console.log('Cluster  :', (process.env.MONGO_URI || '').replace(/\/\/.*@/, '//').split('?')[0]);
  try {
    await connect();
    console.log('\nCONNECTED OK  -> now run: npm run seed, then npm start');
  } catch (e) {
    console.log('\nFAILED:', e.message);
    console.log('HINT  :', hint(e) || '-');
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(0);
})();
