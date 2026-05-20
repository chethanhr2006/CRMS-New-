
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ─────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/crms";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅  MongoDB connected →", MONGO_URI))
  .catch((err) => { console.error("❌  MongoDB error:", err); process.exit(1); });

// ── Utility: convert _id → id in JSON responses ────────────────────────────
const schemaOptions = {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

const toJSON = (doc) => doc.toJSON();
const toJSONMany = (docs) => docs.map(toJSON);

// ── Mongoose Schemas & Models ──────────────────────────────────────────────
const Station = mongoose.model(
  "Station",
  new mongoose.Schema(
    { name: String, location: String, contact: String, incharge: String },
    schemaOptions
  )
);

const Officer = mongoose.model(
  "Officer",
  new mongoose.Schema(
    { name: String, rank: String, station_id: String, badge: String, contact: String },
    schemaOptions
  )
);

const Criminal = mongoose.model(
  "Criminal",
  new mongoose.Schema(
    { name: String, dob: String, address: String, gender: String, crimes: String, status: String },
    schemaOptions
  )
);

const Victim = mongoose.model(
  "Victim",
  new mongoose.Schema(
    { name: String, dob: String, address: String, contact: String, gender: String },
    schemaOptions
  )
);

const CrimeType = mongoose.model(
  "CrimeType",
  new mongoose.Schema(
    { name: String, severity: String, ipc: String },
    schemaOptions
  )
);

const FIR = mongoose.model(
  "FIR",
  new mongoose.Schema(
    {
      date: String,
      crime_id: String,
      description: String,
      officer_id: String,
      station_id: String,
      victim_id: String,
      status: String,
    },
    schemaOptions
  )
);

const Case = mongoose.model(
  "Case",
  new mongoose.Schema(
    {
      fir_id: String,
      criminal_id: String,
      status: String,
      court_date: String,
      verdict: String,
      notes: String,
    },
    schemaOptions
  )
);

// ── Generic CRUD Router Factory ────────────────────────────────────────────
function makeCrud(Model) {
  const router = express.Router();

  // GET all
  router.get("/", async (req, res) => {
    try {
      res.json(toJSONMany(await Model.find().sort({ _id: 1 })));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST create
  router.post("/", async (req, res) => {
    try {
      const { id, _id, ...body } = req.body; // strip any stale id fields
      res.json(toJSON(await new Model(body).save()));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PUT update
  router.put("/:id", async (req, res) => {
    try {
      const { id, _id, ...body } = req.body;
      const doc = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(toJSON(doc));
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE
  router.delete("/:id", async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}

// ── Mount Routes ───────────────────────────────────────────────────────────
app.use("/api/stations",    makeCrud(Station));
app.use("/api/officers",    makeCrud(Officer));
app.use("/api/criminals",   makeCrud(Criminal));
app.use("/api/victims",     makeCrud(Victim));
app.use("/api/crime-types", makeCrud(CrimeType));
app.use("/api/firs",        makeCrud(FIR));
app.use("/api/cases",       makeCrud(Case));

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));

// ── Seed Initial Data ──────────────────────────────────────────────────────
app.post("/api/seed", async (req, res) => {
  try {
    // Clear all collections
    await Promise.all(
      [Station, Officer, Criminal, Victim, CrimeType, FIR, Case].map((M) => M.deleteMany({}))
    );

    // Stations
    const [s1, s2] = await Station.insertMany([
      { name: "MG Road Station",     location: "Bangalore", contact: "080-22221111", incharge: "DCP Sharma" },
      { name: "Koramangala Station", location: "Bangalore", contact: "080-25530000", incharge: "DCP Verma"  },
    ]);

    // Officers
    const [o1, o2] = await Officer.insertMany([
      { name: "Rajesh Kumar", rank: "Inspector",     station_id: s1._id.toString(), badge: "KA-1001", contact: "9988776655" },
      { name: "Priya Nair",   rank: "Sub-Inspector", station_id: s2._id.toString(), badge: "KA-1002", contact: "9876543210" },
      { name: "Amit Singh",   rank: "Constable",     station_id: s1._id.toString(), badge: "KA-1003", contact: "9123456789" },
    ]);

    // Criminals
    const [cr1, cr2] = await Criminal.insertMany([
      { name: "Ravi Das",     dob: "1995-03-22", address: "Hebbal, Bangalore", gender: "Male", crimes: "Theft (2022), Burglary (2023)", status: "At Large" },
      { name: "Suresh Gowda", dob: "1988-07-14", address: "Mysore",            gender: "Male", crimes: "Fraud (2021)",                  status: "Arrested" },
    ]);

    // Victims
    const [v1, v2] = await Victim.insertMany([
      { name: "Arun Sharma", dob: "1990-05-10", address: "HSR Layout",  contact: "9123456789", gender: "Male"   },
      { name: "Meena Patel", dob: "1985-11-22", address: "Indiranagar", contact: "9876501234", gender: "Female" },
    ]);

    // Crime Types
    const cts = await CrimeType.insertMany([
      { name: "Theft",    severity: "Medium", ipc: "IPC 379" },
      { name: "Murder",   severity: "High",   ipc: "IPC 302" },
      { name: "Fraud",    severity: "Medium", ipc: "IPC 420" },
      { name: "Assault",  severity: "High",   ipc: "IPC 351" },
      { name: "Burglary", severity: "High",   ipc: "IPC 457" },
    ]);

    // FIRs
    const [f1, f2] = await FIR.insertMany([
      {
        date: "2024-01-15",
        crime_id: cts[0]._id.toString(),
        description: "Mobile theft near KR Market bus stop",
        officer_id: o1._id.toString(),
        station_id: s1._id.toString(),
        victim_id:  v1._id.toString(),
        status: "Registered",
      },
      {
        date: "2024-02-10",
        crime_id: cts[2]._id.toString(),
        description: "Online fraud of ₹2 lakhs",
        officer_id: o2._id.toString(),
        station_id: s2._id.toString(),
        victim_id:  v2._id.toString(),
        status: "Under Investigation",
      },
    ]);

    // Cases
    await Case.insertMany([
      { fir_id: f1._id.toString(), criminal_id: cr1._id.toString(), status: "Open",    court_date: "2024-04-01", verdict: "", notes: "Suspect identified from CCTV footage" },
      { fir_id: f2._id.toString(), criminal_id: cr2._id.toString(), status: "Pending", court_date: "2024-05-15", verdict: "", notes: "Awaiting forensic report"              },
    ]);

    res.json({ success: true, message: "✅ Database seeded with initial data!" });
  } catch (e) {
    console.error("Seed error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  CRMS API running  →  http://localhost:${PORT}`);
  console.log(`💾  Seed data         →  POST http://localhost:${PORT}/api/seed`);
  console.log(`🏥  Health check      →  GET  http://localhost:${PORT}/api/health`);
});
