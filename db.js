// Shared MongoDB connection helper (used by server.js, seed.js, check-db.js)
const dns = require('dns');
const mongoose = require('mongoose');

// Fixes "querySrv ECONNREFUSED" on networks / routers that block SRV DNS lookups
try { dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']); } catch (e) { /* ignore */ }

function checkEnv() {
  const uri = process.env.MONGO_URI || '';
  if (!uri || uri.includes('<') || uri.includes('xxxxx')) {
    throw new Error('MONGO_URI is missing or still a placeholder. Fix it in .env (local) or Render Environment (online).');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('change_this')) {
    throw new Error('JWT_SECRET is missing. Set a long random value in .env / Render Environment.');
  }
}

function connect() {
  checkEnv();
  const opts = { serverSelectionTimeoutMS: 15000 };
  // Username / password kept separate => no URL-encoding problems with special characters
  if (process.env.DB_USER && process.env.DB_PASS) {
    opts.user = process.env.DB_USER;
    opts.pass = process.env.DB_PASS;
    opts.authSource = 'admin';
  }
  return mongoose.connect(process.env.MONGO_URI, opts);
}

function hint(err) {
  const m = (err && err.message) || '';
  if (/bad auth|authentication failed/i.test(m))
    return 'Atlas reached, but DB_USER / DB_PASS rejected. Check: (1) Database Access user is in the SAME Atlas Project as this cluster, (2) password saved with "Update User" and "Deploying" finished, (3) user is not Temporary / restricted to another cluster.';
  if (/querySrv|ENOTFOUND|ECONNREFUSED/i.test(m))
    return 'DNS / network problem. Try mobile hotspot, or check VPN / antivirus / college firewall.';
  if (/whitelist|Could not connect to any servers|ETIMEDOUT/i.test(m))
    return 'Atlas Network Access: add 0.0.0.0/0 and wait until it shows Active. Also check the cluster is not paused.';
  return '';
}

module.exports = { connect, hint };
