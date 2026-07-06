const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  
  name: String,

  type: {
    type: String,
    enum: ["Fort", "Dam", "Temple", "hillstation","Cave"]
  },

  latitude: {
    type: Number,
    required: true
  },

  longitude: {
    type: Number,
    required: true
  },
city:String,
  description: String,

  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },

  Img: {
    type: String
  }
});

module.exports = mongoose.model(
  "Location",
  locationSchema
);