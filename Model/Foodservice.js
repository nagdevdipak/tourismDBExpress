const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true
    },
 image:{type:String},
    service_type: {
      type: String,
      default: "food"
    },
serviceId:{type:mongoose.Schema.Types.ObjectId,ref:"Service"},
    name: {
      type: String,
      required: true,
      trim: true
    },

    cuisine_type: {
      type: String,
      enum: ["veg", "non-veg", "chinese", "indian"],
      required: true,
      trim: true
    },

    price_per_person: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      default: ""
    },

    is_available: {
      type: Boolean,
      default: true
    },

    ratings: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Food",
  foodSchema
);