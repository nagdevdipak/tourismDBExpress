const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
    image:{type:String},
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true
    },
service_type:{type:String},
    name: {
        type: String,
        required: true,
        
    },
serviceId:{type:mongoose.Schema.Types.ObjectId,ref:"Service"},
    stay_type: {
        type: String, // hotel, hostel, resort, homestay
        
    },

    price_per_night: {
        type: Number,
        required: true,
        min: 0
    },

    amenities: [{
        type: String // wifi, parking, pool, AC, etc.
    }],

    description: {
        type: String
    },

    availability: {
        type: Boolean,
        default: true
    },

    ratings: {
        type: Number,
        min: 1,
        max: 5
    }

}, { timestamps: true });

module.exports = mongoose.model("Stay", staySchema);