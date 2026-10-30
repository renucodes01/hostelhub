# HostelHub – Online Hostel Management System
Stack: HTML/CSS, Bootstrap 5, jQuery, Node.js, Express.js, MongoDB (Mongoose)

## Run locally
1. Install Node.js (v18+) and create a free MongoDB Atlas cluster.
2. Open `.env` and paste your Atlas connection string in `MONGO_URI`, set any long `JWT_SECRET`.
3. Commands:
   npm install
   npm run seed      (creates warden + 24 sample rooms, run once)
   npm start
4. Open http://localhost:5000
   Warden login: warden@hostel.com / warden123  (change the password after first login/seed)
   Students register themselves from the Student Register tab.

## Deploy free (Render + MongoDB Atlas)
GitHub Pages = static only, Node backend run aagadhu. So: code -> GitHub, hosting -> Render.
1. Push this folder to a GitHub repo (`.env` is gitignored, don't push it).
2. render.com -> New -> Web Service -> connect repo.
   Build: npm install | Start: npm start
3. Environment variables: MONGO_URI, JWT_SECRET
4. Atlas -> Network Access -> Add IP 0.0.0.0/0
5. Deploy. Run seed once from your laptop (same MONGO_URI) -> `npm run seed`.
