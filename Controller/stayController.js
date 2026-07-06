const StayService = require("../Model/Stayservice");
const ServiceRef = require("../Model/service")

// ADD STAY SERVICE
exports.addstayservice = async (req, res) => {

  try {

    console.log("REQ BODY:", req.body);

    const {
      location_id,image,
      name,
      stay_type,
      price_per_night,
      amenities,
      description,
      availability,
      ratings
    } = req.body;

    // VALIDATION
    if (
      !location_id ||
      !name ||
      !stay_type ||
      !price_per_night
    ) {

      return res.status(400).json({
        success: false,
        msg: "Required fields missing"
      });

    }

    // CREATE DOCUMENT
    const stay = new StayService({

      location_id,
     image: req.file ? req.file.filename : null,
      service_type: "stay",

      name,

      stay_type: stay_type.toLowerCase(),

      price_per_night: Number(price_per_night),

      amenities: Array.isArray(amenities)
        ? amenities
        : [amenities],

      description,

      availability:
        availability !== undefined
          ? availability
          : true,

      ratings: Number(ratings) || 1

    });

    // SAVE
    const savedStay = await stay.save();

    // POPULATE LOCATION
    await savedStay.populate("location_id");

    res.status(201).json({

      success: true,

      msg: "Stay service added successfully",

      data: savedStay

    });

  } catch (err) {

    console.error("ADD STAY ERROR:", err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

};


// GET ALL STAY SERVICES
exports.getStayservice = async (req, res) => {

  try {

    const stay = await StayService.find()

      .populate("location_id")

      .sort({ createdAt: -1 });

    res.status(200).json({

      success: true,

      totalStay: stay.length,

      data: stay

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

};

exports.getGroupStayservice = async (req, res) => {
  try {
    const stay = await StayService.find()
      .populate("location_id")
      .sort({ createdAt: -1 });

    // GROUP: city -> location -> stays
    const grouped = stay.reduce((acc, item) => {
      const city = item.location_id?.city || "Unknown City";
      const location = item.location_id?.name || "Unknown Location";

      if (!acc[city]) acc[city] = {};
      if (!acc[city][location]) acc[city][location] = [];

      acc[city][location].push(item);

      return acc;
    }, {});

    res.status(200).json({
      success: true,
      totalStay: stay.length,
      data: grouped
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
};
exports.updateStayservice = async (req, res) => {

  try {

    const { id } = req.params;

    const {
      location_id,
      image,
      name,
      stay_type,
      price_per_night,
      amenities,
      description,
      availability,
      ratings
    } = req.body;

    // FIND SERVICE
    const existingStay =
      await StayService.findById(id);

    if (!existingStay) {

      return res.status(404).json({

        success: false,

        msg: "Stay service not found"

      });

    }

    // UPDATE DATA
    existingStay.location_id =
      location_id || existingStay.location_id;

existingStay.image =
  req.file ? req.file.filename : existingStay.image;

    existingStay.name =
      name || existingStay.name;

    existingStay.stay_type =
      stay_type
        ? stay_type.toLowerCase()
        : existingStay.stay_type;

    existingStay.price_per_night =
      price_per_night !== undefined
        ? Number(price_per_night)
        : existingStay.price_per_night;

    existingStay.amenities =
      amenities
        ? (
            Array.isArray(amenities)
              ? amenities
              : amenities
                  .split(",")
                  .map((a) => a.trim())
          )
        : existingStay.amenities;

    existingStay.description =
      description || existingStay.description;

    existingStay.availability =
      availability !== undefined
        ? availability
        : existingStay.availability;

    existingStay.ratings =
      ratings !== undefined
        ? Number(ratings)
        : existingStay.ratings;

    // SAVE UPDATED
    const updatedStay =
      await existingStay.save();

    await updatedStay.populate(
      "location_id"
    );

    res.status(200).json({

      success: true,

      msg: "Stay service updated successfully",

      data: updatedStay

    });

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

};

exports.deleteStayservice = async (req, res) => {

  try {

    const { id } = req.params;

    // FIND & DELETE
    const deletedStay =
      await StayService.findByIdAndDelete(id);
  console.log(deletedStay)
    if (!deletedStay) {

      return res.status(404).json({

        success: false,

        msg: "Stay service not found"

      });

    }

       // 2. Remove deleted food id from Service food array
        await ServiceRef.updateMany(
          { stay: id },
          { $pull: { stay: id } }
        );
    
        return res.status(200).json({
          success: true,
          msg: "stay service deleted and reference removed from services",
          data: deletedStay
        });



  } catch (err) {

    console.error("DELETE ERROR:", err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

};