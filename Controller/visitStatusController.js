const Visit = require("../Model/visitsStats");
const Visitor = require("../Model/visitorRegistrationForm");

// ================= UPDATE VISIT DETAILS =================

exports.updatevisitDetails = async (req, res) => {

  try {

    let { visitor = [] } = req.body;

    // convert single id into array
    visitor = Array.isArray(visitor)
      ? visitor
      : [visitor];

    // remove duplicates
    visitor = [...new Set(visitor)];

    // find existing visit document
    let visitDoc = await Visit.findOne();

    // create if not exists
    if (!visitDoc) {

      visitDoc = await Visit.create({
        visitor
      });

    } else {

      // update visitor array
      visitDoc = await Visit.findByIdAndUpdate(
        visitDoc._id,
        {
          $addToSet: {
            visitor: {
              $each: visitor
            }
          }
        },
        { new: true }
      ).populate("visitor");
    }

    res.status(200).json({
      success: true,
      msg: "Visitors added successfully",
      data: visitDoc
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      msg: "Server error"
    });
  }
};

// ================= GET VISIT DETAILS =================

exports.getvisitDetails = async (req, res) => {

  try {

   const visitData = await Visit.find()
  .populate({
    path: "visitor",
    populate: {
      path: "location",
    },
  });
const totalVisitors = visitData[0]?.visitor?.length || 0;
    res.status(200).json({
      success: true,
      msg: "Visitor details fetched successfully",
      data: visitData,
      totalVisitors
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      msg: "Internal server error",
    });
  }
};