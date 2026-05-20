const mongoose = require("mongoose");

const crimeTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "Serious", "High", "Extreme"],
      required: true,
    },

    punishment: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CrimeType", crimeTypeSchema);