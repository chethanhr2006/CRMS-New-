const mongoose = require("mongoose");

const criminalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    alias: {
      type: String,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    address: {
      type: String,
    },

    phone: {
      type: String,
    },

    crimeHistory: [
      {
        type: String,
      },
    ],

    crimes: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Active", "Wanted", "Under Trial", "Arrested", "Closed", "At Large", "Convicted", "Released"],
      required: true,
    },

    dangerLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Extreme"],
      default: "Low",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (!ret.crimes && ret.crimeHistory) {
          ret.crimes = ret.crimeHistory.join(", ");
        }
        return ret;
      }
    }
  }
);

criminalSchema.pre("save", function() {
  if (this.crimes && typeof this.crimes === "string") {
    this.crimeHistory = this.crimes
      .split(",")
      .map(c => c.trim())
      .filter(Boolean);
  } else if (this.crimeHistory && this.crimeHistory.length > 0 && !this.crimes) {
    this.crimes = this.crimeHistory.join(", ");
  }
});

module.exports = mongoose.model("Criminal", criminalSchema);