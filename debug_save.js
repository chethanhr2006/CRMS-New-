const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "DAY24", "crms_backand", ".env") });

// Setup global mongoose serializers as done in server.js
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

const Criminal = require("./DAY24/crms_backand/models/Criminal");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Connected to MongoDB successfully!");
  try {
    const c = new Criminal({
      name: "Debug Criminal",
      status: "At Large",
      crimes: "Theft, Trespassing"
    });
    await c.save();
    console.log("Saved successfully!");
  } catch (e) {
    console.error("Error saving:", e);
  } finally {
    mongoose.disconnect();
  }
}).catch(err => {
  console.error("Connection failed:", err);
});
