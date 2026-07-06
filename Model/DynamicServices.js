const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    image: {
      type: String,
    },

    service_type: {
      type: String,
      required: true,
      enum: ["food", "stay", "transport", "guide", "shopping"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    ratings: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },

    is_available: {
      type: Boolean,
      default: true,
    },

    /*
      Dynamic fields for each service type
    */
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MultiService", serviceSchema);