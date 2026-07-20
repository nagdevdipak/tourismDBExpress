const nodemailer = require("nodemailer");
const Visitor = require("../Model/visitorRegistrationForm");
const VisitsStats = require("../Model/visitsStats")
// ================= OTP Generator =================

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
});

exports.send_OTP = async (req, res) => {
  console.log("Request Method:", req.method);
  console.log("Request Body:", req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();

    let visitor = await Visitor.findOne({ email });

    if (!visitor) {
      visitor = new Visitor({ email });
    }

    visitor.otp = otp;
    visitor.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    visitor.is_verified = false;

    await visitor.save();
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

try {
  await transporter.verify();
  console.log("SMTP Connected");
} catch (err) {
  console.error("SMTP Verify Error:", err);
  return res.status(500).json({
    success: false,
    error: err.message,
  });
}

    // Send OTP Email using Nodemailer
    const info = await transporter.sendMail({
      from: `"Tourism App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Visitor OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Visitor OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color:#0d6efd;">${otp}</h1>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you didn't request this OTP, you can safely ignore this email.</p>
        </div>
      `,
    });

    console.log("Email Sent:", info.response);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};
// ================= Verify OTP =================

exports.verifyOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    console.log("Stored OTP:", visitor.otp);
    console.log("Expiry:", visitor.otp_expiry);

    // expiry check
    if (visitor.otp_expiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // otp check
    if (visitor.otp.toString() !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // verified
    visitor.is_verified = true;

    await visitor.save();

    return res.status(200).json({
      message: "OTP verification success"
    });

  } catch (err) {

    console.error("VERIFY OTP ERROR:", err);

    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

exports.registerVisitor = async (req, res) => {

  try {

    const {
      full_name,
      email,
      mobile,
      group_size,
      age_group,
      gender,
      purpose_of_visit,
      travel_mode,
      entry_type,
      location,
      latitude,
      longitude
    } = req.body;

    // validation
    if (
      !full_name ||
      !email ||
      !mobile ||
      !age_group ||
      !gender ||
      !purpose_of_visit ||
      !travel_mode ||
      !entry_type ||
      !location
    ) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // existing visitor
    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    // OTP verification check
    if (!visitor.is_verified) {
      return res.status(403).json({
        message: "Please verify OTP first"
      });
    }

    // update visitor details
    visitor.full_name = full_name;
    visitor.mobile = mobile;
    visitor.group_size = group_size;
    visitor.age_group = age_group;
    visitor.gender = gender;
    visitor.purpose_of_visit = purpose_of_visit;
    visitor.travel_mode = travel_mode;
    visitor.entry_type = entry_type;
    visitor.location = location;
    visitor.latitude = latitude;
    visitor.longitude = longitude;

    await visitor.save();

    // =========================
    // ADD VISITOR TO VISIT COLLECTION
    // =========================

    let visitDoc = await VisitsStats.findOne();

    // create visit document if not exists
    if (!visitDoc) {
      visitDoc = await VisitsStats.create({
        visitor: [visitor._id]
      });
    } else {

      // add unique visitor id
      await VisitsStats.findByIdAndUpdate(
        visitDoc._id,
        {
          $addToSet: {
            visitor: visitor._id
          }
        },
        { new: true }
      );
    }

    // total verified visitors
    const totalVisitors = await Visitor.countDocuments({
      is_verified: true
    });

    return res.status(200).json({
      message: "Visitor registered successfully",
      data: visitor,
      totalVisitors
    });

  } catch (err) {

    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Visitor server error",
      error: err.message
    });
  }
};


// ================= Resend OTP =================

exports.resendOTP = async (req, res) => {

  try {

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const visitor = await Visitor.findOne({ email });

    if (!visitor) {
      return res.status(404).json({
        message: "Visitor not found"
      });
    }

    const otp = generateOTP();

    visitor.otp = otp;
    visitor.otp_expiry = Date.now() + 5 * 60 * 1000;
    visitor.is_verified = false;

    await visitor.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend OTP",
      text: `Your new OTP is ${otp}`
    });

    return res.status(200).json({
      message: "OTP resent successfully"
    });

  } catch (err) {

    console.error("RESEND OTP ERROR:", err);

    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

// ================= Get Visitors =================

exports.getVisitor = async (req, res) => {

  try {

    const visitors = await Visitor.find().populate("location")


    return res.status(200).json({
      message: "Fetching visitors data",
      count: visitors.length,
      data: visitors,count:visitors.length
    });

  } catch (err) {

    console.error("GET VISITOR ERROR:", err.response);

    return res.status(500).json({
      message: err.message
    });
  }
};

const mongoose = require("mongoose");

exports.deleteVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        msg: "Invalid visitor ID",
      });
    }

    const deletedVisitor = await Visitor.findByIdAndDelete(id);

    if (!deletedVisitor) {
      return res.status(404).json({
        msg: "Visitor not found",
      });
    }

    return res.status(200).json({
      msg: "Visitor deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      msg: err.message,
    });
  }
};