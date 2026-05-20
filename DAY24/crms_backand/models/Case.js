const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    fir_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
    },

    criminal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Criminal",
      required: true,
    },

    court: {
      type: String,
    },

    judge: {
      type: String,
    },

    nextHearingDate: {
      type: Date,
    },

    court_date: {
      type: String,
    },

    verdict: {
      type: String,
    },

    notes: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Open", "Under Trial", "Closed", "Pending", "Dismissed"],
      default: "Open",
    },

    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (!ret.court_date && ret.nextHearingDate) {
          try {
            ret.court_date = new Date(ret.nextHearingDate).toISOString().slice(0, 10);
          } catch (e) {
            ret.court_date = "";
          }
        }
        if (!ret.notes && ret.remarks) {
          ret.notes = ret.remarks;
        }
        return ret;
      }
    }
  }
);

// Pre-validate hook to auto-generate unique caseNumber if not provided
caseSchema.pre("validate", function() {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.caseNumber = `CC/${year}/BLR/${rand}`;
  }
});

// Pre-save hook to keep dates and remarks/notes in sync
caseSchema.pre("save", function() {
  if (this.court_date) {
    try {
      this.nextHearingDate = new Date(this.court_date);
    } catch (e) {}
  } else if (this.nextHearingDate && !this.court_date) {
    try {
      this.court_date = this.nextHearingDate.toISOString().slice(0, 10);
    } catch (e) {}
  }

  if (this.notes) {
    this.remarks = this.notes;
  } else if (this.remarks && !this.notes) {
    this.notes = this.remarks;
  }
});

module.exports = mongoose.model("Case", caseSchema);