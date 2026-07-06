const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema(
  {
    visitor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Visitor",
        required: true,
      
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitSchema);