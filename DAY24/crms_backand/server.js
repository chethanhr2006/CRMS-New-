const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ── Global Mongoose Serializer Configuration ──────────────────────────────────
mongoose.plugin((schema) => {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
      }
      return ret;
    }
  });
  schema.set("toObject", { virtuals: true });
});


const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/stations",   require("./routes/stations"));
app.use("/api/officers",   require("./routes/officers"));
app.use("/api/criminals",  require("./routes/criminals"));
app.use("/api/victims",    require("./routes/victims"));
app.use("/api/crimetypes", require("./routes/crimeTypes"));
app.use("/api/crime-types", require("./routes/crimeTypes"));
app.use("/api/firs",       require("./routes/firs"));
app.use("/api/cases",      require("./routes/cases"));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ── Connect & Listen ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://chethan:Chethan2006@ac-jz1cv1u-shard-00-00.8fdlnmr.mongodb.net:27017,ac-jz1cv1u-shard-00-01.8fdlnmr.mongodb.net:27017,ac-jz1cv1u-shard-00-02.8fdlnmr.mongodb.net:27017/?ssl=true&replicaSet=atlas-x4slrz-shard-0&authSource=admin&appName=chethan";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

if (require.main === module || process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
