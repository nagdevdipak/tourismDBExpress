// controllers/bookingController.js
const Booking = require("../Model/Booking");
const Package = require("../Model/Package");

exports.createBooking = async (req, res) => {
  try {
    const { userId, destination, hotel, budget } = req.body;

    const pkg = await Package.findOne({ destination, hotel });

    if (!pkg) return res.status(404).json({ msg: "Package not found" });

    let multiplier = 1;

    if (budget === "Low") multiplier = 0.8;
    if (budget === "Medium") multiplier = 1;
    if (budget === "High") multiplier = 1.5;

    const totalPrice = pkg.basePrice * multiplier;

    const booking = new Booking({
      userId,
      destination,
      hotel,
      budget,
      totalPrice
    });

    await booking.save();

    res.json({ message: "Booking successful", booking });

  } catch (err) {
    res.status(500).json(err);
  }
};