const nodemailer = require("nodemailer");
const dns = require("dns");
const Visitor = require("../Model/visitorRegistrationForm");
 const VisitsStats = require("../Model/visitsStats")
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

exports.send_OTP = async (req, res) => {
  console.log("========================================");
  console.log("SEND OTP REQUEST");
  console.log("Method:", req.method);
  console.log("Body:", req.body);

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

    // Resolve ONLY IPv4
    const { address } = await dns.promises.lookup("smtp.gmail.com", {
      family: 4,
    });

    console.log("========================================");
    console.log("Resolved IPv4:", address);

    const transporter = nodemailer.createTransport({
      host: address,              // connect directly to IPv4
      port: 587,
      secure: false,              // STARTTLS
      requireTLS: true,

      tls: {
        servername: "smtp.gmail.com", // certificate validation
      },

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 120000,
      greetingTimeout: 120000,
      socketTimeout: 120000,

      logger: true,
      debug: true,
    });

    console.log("TRANSPORTER");
    console.log({
      host: transporter.options.host,
      port: transporter.options.port,
      secure: transporter.options.secure,
    });

    console.log("Verifying SMTP...");

    const net = require("net");

await new Promise((resolve, reject) => {
  const socket = net.connect({
    host: address,
    port: 587,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("TCP CONNECT SUCCESS");
    socket.destroy();
    resolve();
  });

  socket.on("timeout", () => {
    console.log("TCP TIMEOUT");
    socket.destroy();
    reject(new Error("TCP Timeout"));
  });

  socket.on("error", (err) => {
    console.log("TCP ERROR", err);
    reject(err);
  });
});


    console.log("SMTP VERIFY SUCCESS");

    const otp = generateOTP();

    let visitor = await Visitor.findOne({ email });

    if (!visitor) {
      visitor = new Visitor({ email });
    }

    visitor.otp = otp;
    visitor.otp_expiry = new Date(Date.now() + 5 * 60 * 1000);
    visitor.is_verified = false;

    await visitor.save();

    console.log("Sending Email...");

    const info = await transporter.sendMail({
      from: `"Tourism App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Visitor OTP Verification",
      html: `
        <h2>Visitor OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
      `,
    });

    console.log("MAIL SENT");
    console.log(info);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.log("========================================");
    console.log("SMTP ERROR");

    console.log("Name:", error.name);
    console.log("Code:", error.code);
    console.log("Command:", error.command);
    console.log("Address:", error.address);
    console.log("Port:", error.port);
    console.log("Response:", error.response);
    console.log("ResponseCode:", error.responseCode);
    console.log("Message:", error.message);

    console.log("Full Error");
    console.dir(error, { depth: null });

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
const { getDefaultAutoSelectFamily } = require("net");

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