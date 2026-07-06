const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visitor",
      required: true,
    },

    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },

    // Overall location experience
    overall_rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Ratings for services visited
    serviceFeedback: [
      {
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MultiService",
          required: true,
        },

        service_type: {
          type: String,
          enum: ["food", "stay", "transport", "guide", "shopping"],
          required: true,
        },

        rating: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },

        comments: {
          type: String,
          default: "",
        },
      },
    ],

    // Location facilities
    facilities: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },

      safety: {
        type: Number,
        min: 1,
        max: 5,
      },

      parking: {
        type: Number,
        min: 1,
        max: 5,
      },

      washroom: {
        type: Number,
        min: 1,
        max: 5,
      },

      accessibility: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    overallComment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);