const mongoose = require("mongoose");

const victimSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    dob:     { type: String },
    address: { type: String, trim: true },
    contact: { type: String, trim: true },
    gender:  { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Victim", victimSchema);
