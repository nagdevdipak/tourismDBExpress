const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
      location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",  
    },
    full_name: {
        type: String,
        required: false,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true
    },

    mobile: {
        type: String,
       
    },

    otp: {
        type: Number
    },
 otp_expiry: { type: Date },

  is_verified: { type: Boolean, default: false },
    group_size: {
        type: Number,
        default: 1,
        min: 1
    },

    age_group: {
        type: String,
        enum: ["child", "adult", "senior"]
    },

    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },

    purpose_of_visit: {
        type: String,
        enum: ["tourism", "religious", "business", "other"]
    },

    travel_mode: {
        type: String,
        enum: ["bike", "car", "bus"]
    },

  

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    entry_type: {
        type: String,
        enum: ["QR", "Manual"],
        default: "QR"
    },

   

}, { timestamps: true });

module.exports = mongoose.model("Visitor", visitorSchema);