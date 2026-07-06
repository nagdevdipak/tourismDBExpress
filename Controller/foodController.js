const Foodservice = require("../Model/Foodservice");
const Service = require("../Model/service")

// ================= ADD FOOD SERVICE =================

exports.addFoodService = async (req, res) => {

  try {

    const {
      location_id,image,
      name,service_type,
      cuisine_type,
      price_per_person,
      description,
      is_available,
      ratings
    } = req.body;

    // VALIDATION

    if (
      !location_id ||
      !name ||
      !cuisine_type ||
      !price_per_person
    ) {

      return res.status(400).json({
        success: false,
        msg: "Required fields missing"
      });
    }

    // CREATE

    const foodservice =
      await Foodservice.create({

        location_id,
        image:req.file ? req.file.filename :null,
        service_type: "food",

        name,

        cuisine_type,

        price_per_person,

        description,

        is_available,

        ratings
      });

    // POPULATE LOCATION

    await foodservice.populate(
      "location_id"
    );

    return res.status(201).json({

      success: true,

      msg:
        "Food service added successfully",

      data: foodservice
    });

  } catch (err) {

    console.error(err.message);

    return res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message
    });
  }
};


// ================= FETCH ALL =================

exports.fetchfoodservice = async (
  req,
  res
) => {

  try {

    const food =
      await Foodservice.find()

        .populate("location_id")

        .sort({ createdAt: -1 });

    return res.status(200).json({

      success: true,

      msg:
        "Food services fetched successfully",

      count: food.length,

      data: food
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message
    });
  }
};

exports.fetchfoodserviceByGroupLocation = async (req, res) => {
  try {
    const food = await Foodservice.find()
      .populate("location_id")
      .sort({ createdAt: -1 });

    // GROUP: city -> location -> food services
    const grouped = food.reduce((acc, item) => {
      const city = item.location_id?.city || "Unknown City";
      const location = item.location_id?.name || "Unknown Location";

      if (!acc[city]) acc[city] = {};
      if (!acc[city][location]) acc[city][location] = [];

      acc[city][location].push(item);

      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      count: food.length,
      data: grouped
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
};
// ================= FETCH SINGLE =================

exports.fetchSingleFoodService = async (req, res) => {

    try {

      const { id } = req.params;

      const food =
        await Foodservice.findById(id)

          .populate("location_id");

      if (!food) {

        return res.status(404).json({

          success: false,

          msg:
            "Food service not found"
        });
      }

      return res.status(200).json({

        success: true,

        data: food
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({

        success: false,

        msg: "Server error",

        error: err.message
      });
    }
  };


// ================= UPDATE =================

exports.updatefoodservice = async (req, res) => {

    try {

      const { id } = req.params;

      const updated = await Foodservice.findByIdAndUpdate(

          id,

         { ...req.body},

          {
            returnDocument:"after",
            runValidators: true
          }
        ).populate("location_id","_id");

        const existingFood = await Foodservice.findById(id)
        if(!existingFood){
            return res.status(404).json({

        success: false,

        msg: "Food service not found"

      });
      existingFood.image = image || existingFood.image;

        }
      if (!updated) {

        return res.status(404).json({

          success: false,

          msg:
            "Food service not found"
        });
      }

      return res.status(200).json({

        success: true,

        msg:
          "Food service updated successfully",

        data: updated
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({

        success: false,

        msg: "Server error",

        error: err.response?.message
      });
    }
  };


// ================= DELETE =================

exports.deletefoodservice = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Delete food service from Food collection
    const deleted = await Foodservice.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        msg: "Food service not found"
      });
    }

    // 2. Remove deleted food id from Service food array
    await Service.updateMany(
      { food: id },
      { $pull: { food: id } }
    );

    return res.status(200).json({
      success: true,
      msg: "Food service deleted and reference removed from services",
      data: deleted
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
};

  