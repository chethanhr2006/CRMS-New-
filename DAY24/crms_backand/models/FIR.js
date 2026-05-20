const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    date:        { type: String, required: true },
    crime_id:    { type: mongoose.Schema.Types.ObjectId, ref: "CrimeType", required: true },
    description: { type: String },
    officer_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Officer",   required: true },
    station_id:  { type: mongoose.Schema.Types.ObjectId, ref: "Station",   required: true },
    victim_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Victim",    required: true },
    status: {
      type: String,
      enum: ["Registered", "Under Investigation", "Chargesheet Filed", "Closed"],
      default: "Registered",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FIR", firSchema);
