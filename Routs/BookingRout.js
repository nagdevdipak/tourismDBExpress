// routes/bookingRoutes.js
const router = require("express").Router();
const { createBooking } = require("../Controller/BookingController");

router.post("/", createBooking);

module.exports = router;