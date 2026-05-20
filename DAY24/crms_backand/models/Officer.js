const mongoose = require("mongoose");

const officerSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    rank:       { type: String, required: true },
    station_id: { type: mongoose.Schema.Types.ObjectId, ref: "Station", required: true },
    badge:      { type: String, required: true, unique: true, trim: true },
    contact:    { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Officer", officerSchema);
