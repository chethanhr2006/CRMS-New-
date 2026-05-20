# CRMS4
# CRMS — Crime Record Management System
### Node.js + Express + MongoDB Backend

---

## 📁 Project Structure

```
crms-backend/
├── server.js          ← Express entry point
├── seed.js            ← Populates DB with demo data
├── .env               ← Environment variables
├── package.json
├── models/
│   ├── Station.js
│   ├── Officer.js
│   ├── Criminal.js
│   ├── Victim.js
│   ├── CrimeType.js
│   ├── FIR.js
│   └── Case.js
├── routes/
│   ├── stations.js
│   ├── officers.js
│   ├── criminals.js
│   ├── victims.js
│   ├── crimeTypes.js
│   ├── firs.js
│   └── cases.js
└── App.jsx            ← Updated React frontend
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on port 27017 (for example) 
  *(or provide a MongoDB Atlas URI in `.env`)*

---

## 🚀 Backend Setup

```bash
# 1. Install dependencies
cd crms-backend
npm install

# 2. Configure environment
# Edit .env — default works for local MongoDB:
#   MONGO_URI=mongodb://localhost:27017/crms
#   PORT=5000

# 3. Seed the database with demo data (run once)
npm run seed

# 4. Start the server
npm start          # production
npm run dev        # development (auto-restart with nodemon)
```

Server starts at: **http://localhost:5000**

---

## 🌐 API Endpoints

| Resource    | GET all          | POST create      | PUT update           | DELETE             |
|-------------|------------------|------------------|----------------------|--------------------|
| Stations    | GET /api/stations   | POST /api/stations   | PUT /api/stations/:id   | DELETE /api/stations/:id   |
| Officers    | GET /api/officers   | POST /api/officers   | PUT /api/officers/:id   | DELETE /api/officers/:id   |
| Criminals   | GET /api/criminals  | POST /api/criminals  | PUT /api/criminals/:id  | DELETE /api/criminals/:id  |
| Victims     | GET /api/victims    | POST /api/victims    | PUT /api/victims/:id    | DELETE /api/victims/:id    |
| Crime Types | GET /api/crimetypes | POST /api/crimetypes | PUT /api/crimetypes/:id | DELETE /api/crimetypes/:id |
| FIRs        | GET /api/firs       | POST /api/firs       | PUT /api/firs/:id       | DELETE /api/firs/:id       |
| Cases       | GET /api/cases      | POST /api/cases      | PUT /api/cases/:id      | DELETE /api/cases/:id      |
| Health      | GET /api/health     | —                    | —                       | —                          |

---

## ⚛️ Frontend Setup (React + Vite)

```bash
# Create a new Vite React project
npm create vite@latest crms-frontend -- --template react
cd crms-frontend
npm install

# Copy App.jsx into src/
cp ../crms-backend/App.jsx src/App.jsx

# Start frontend dev server
npm run dev
```

Frontend starts at: **http://localhost:5173**

> Make sure the backend is running on port 5000 before starting the frontend.

---

## 🌱 Using MongoDB Atlas (Cloud)

1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string
3. Update `.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/crms
   ```

---

## 🔑 Demo Login Credentials

| Username | Password   | Role           |
|----------|------------|----------------|
| admin    | admin123   | Administrator  |
| sharma   | sharma123  | Inspector      |
| verma    | verma123   | Sub-Inspector  |

---

## 📊 Data Models

- **Station** — Police station with location, contact, in-charge
- **Officer** — Police officer linked to a station
- **Criminal** — Criminal record with crime history and status
- **Victim** — Victim personal details
- **CrimeType** — Crime categories with IPC sections
- **FIR** — First Information Report linking crime, officer, station, victim
- **Case** — Court case tracking linked to FIR and criminal
