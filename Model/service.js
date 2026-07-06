const mongoose = require("mongoose");

  const serviceSchema = new mongoose.Schema({
  food: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MultiService",
  }],

  stay: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MultiService",
  }],

  transport: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MultiService",
  }],

  guide: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MultiService",
  }],

  shopping: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MultiService",
  }],
  
},  { timestamps: true });

    // overall_rating: {
    //   type: Number,
    //   min: 1,
    //   max: 5,
    // },

module.exports = mongoose.model("Service", serviceSchema)