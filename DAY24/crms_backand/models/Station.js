const mongoose = require("mongoose");

const stationSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    contact:  { type: String, trim: true },
    incharge: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Station", stationSchema);
