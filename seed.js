// Run once:  npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  if (!(await User.findOne({ email: 'warden@hostel.com' }))) {
    await User.create({ name: 'Chief Warden', email: 'warden@hostel.com', password: await bcrypt.hash('warden123', 10), role: 'warden' });
    console.log('Warden created -> warden@hostel.com / warden123');
  }
  if ((await Room.countDocuments()) === 0) {
    const rooms = [];
    ['A', 'B'].forEach((block) => {
      for (let floor = 1; floor <= 3; floor++) {
        for (let n = 1; n <= 4; n++) {
          const type = n % 2 === 0 ? 'Double' : 'Triple';
          rooms.push({ number: `${block}${floor}0${n}`, block, floor, type, capacity: type === 'Double' ? 2 : 3, fee: type === 'Double' ? 35000 : 28000 });
        }
      }
    });
    await Room.insertMany(rooms);
    console.log(`${rooms.length} sample rooms created`);
  }
  await mongoose.disconnect();
  console.log('Seed done');
})();
