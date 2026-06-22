const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
    },

    company: {
      type: String,
    },

    source: {
      type: String,
      enum: ["Website", "LinkedIn", "Referral", "Instagram", "Other"],
      default: "Website",
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted"],
      default: "New",
    },
    priority: {
  type: String,
  enum: ["High", "Medium", "Low"],
  default: "Medium",
},

    followUpDate: {
      type: Date,
      default: null,
    },

    notes: [noteSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);