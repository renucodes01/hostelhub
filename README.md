# HostelHub – Online Hostel Management System
Stack: HTML/CSS, Bootstrap 5, jQuery, Node.js, Express, MongoDB Atlas (Mongoose), JWT

## Run locally
1. `.env` fill pannunga (see `.env.example`): MONGO_URI (without username/password), DB_USER, DB_PASS, JWT_SECRET.
2. Commands:
   npm install
   npm run check     (DB connect aagudha nu test, exact error hint tharum)
   npm run seed      (warden + 24 rooms, once)
   npm start
3. Open http://localhost:5000  (NOT Live Server)
   Warden: warden@hostel.com / warden123

## Deploy online (Render, free)
1. Push code to GitHub (`.env` is gitignored).
2. render.com -> New -> Web Service -> select repo. Build: `npm install`, Start: `npm start`.
3. Environment variables on Render: MONGO_URI, DB_USER, DB_PASS, JWT_SECRET (same values as .env).
4. Atlas -> Network Access -> 0.0.0.0/0 (Active).
5. Run `npm run seed` once from laptop (same DB). Open your Render URL.
Health check: /api/health
