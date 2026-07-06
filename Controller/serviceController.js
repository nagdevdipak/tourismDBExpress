const Service = require("../Model/service");


const MultiService = require("../Model/DynamicServices")
exports.updateServiceReference = async (req, res) => {
  try {
    const { id } = req.params; // Service document ID

    const {
      service_type,
      service_id,
      referenced,
    } = req.body;

    const allowedTypes = [
      "food",
      "stay",
      "transport",
      "guide",
      "shopping",
    ];

    console.log("BODY:", req.body);
    if (!allowedTypes.includes(service_type)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid service type",
      });
    }

    const update = referenced
      ? {
          $addToSet: {
            [service_type]: service_id,
          },
        }
      : {
          $pull: {
            [service_type]: service_id,
          },
        };

    const updated =
      await Service.findByIdAndUpdate(
        id,
        update,
        { returnDocument:"after" }
      )
        .populate("food")
        .populate("stay")
        .populate("transport")
        .populate("guide")
        .populate("shopping");

    if (!updated) {
      return res.status(404).json({
        success: false,
        msg: "Service document not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: referenced
        ? "Reference added"
        : "Reference removed",
      data: updated,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateService = async (req, res) => {

  try {

    const { id } = req.params;

    let {
      food = [],
      stay = [],
    
    } = req.body;


    food = Array.isArray(food)
      ? food
      : [food];

    stay = Array.isArray(stay)
      ? stay
      : [stay];


    food = [...new Set(food)];
    stay = [...new Set(stay)];
    // transport = [...new Set(transport)];

 const updated =
  await Service.findOneAndUpdate(

    { id: id },

    {
      $addToSet: {

        food: {
          $each: food
        },

        stay: {
          $each: stay
        }

      }
    },

    {
      returnDocument:"after"
    }

  )

        .populate("food")

        .populate("stay")

 
    if (!updated) {

      return res.status(404).json({

        success: false,

        msg: "Service not found"

      });

    }

    res.status(200).json({

      success: true,

      msg: "Services linked successfully",

      data: updated

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

};

//Remove stay and food service reference
exports.removeReference = async(req,res)=>{
  
  try {

    const { id } = req.params;

    let {
      food = [],
      stay = [],
    
    } = req.body;

    // convert single values into arrays

    food = Array.isArray(food)
      ? food
      : [food];

    stay = Array.isArray(stay)
      ? stay
      : [stay];

    // transport = Array.isArray(transport)
    //   ? transport
    //   : [transport];

    // remove duplicates from request

    food = [...new Set(food)];
    stay = [...new Set(stay)];
    // transport = [...new Set(transport)];

 const updated =
  await Service.findOneAndUpdate(

    { _id: id },

    {
      $pull: {

        food: {
          $in: food
        },

        stay: {
          $in: stay
        }

      }
    },

    {
      returnDocument:"after"
    }

  )
        .populate("food")

        .populate("stay")

     

    if (!updated) {

      return res.status(404).json({

        success: false,

        msg: "Service not found"

      });

    }

    res.status(200).json({

      success: true,

      msg: "Services removed successfully",

      data: updated

    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      success: false,

      msg: "Server error",

      error: err.message

    });

  }

}
// ================= GET ALL SERVICES =================


exports.getAllservices = async (req, res) => {
  try {
    const services = await MultiService.find()
      .populate("location_id")
      .sort({ createdAt: -1 });

    const counts = {
      food: 0,
      stay: 0,
      transport: 0,
      guide: 0,
      shopping: 0,
    };

    services.forEach((service) => {
      counts[service.service_type] =
        (counts[service.service_type] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      data: services,

      totalServices: services.length,

      counts,

      foodServices: services.filter(
        (s) => s.service_type === "food"
      ),

      stayServices: services.filter(
        (s) => s.service_type === "stay"
      ),

      transportServices: services.filter(
        (s) => s.service_type === "transport"
      ),

      guideServices: services.filter(
        (s) => s.service_type === "guide"
      ),

      shoppingServices: services.filter(
        (s) => s.service_type === "shopping"
      ),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: err.message,
    });
  }
};

exports.getServiceCounts = async (req, res) => {
  try {
    const counts = await MultiService.aggregate([
      {
        $group: {
          _id: "$service_type",
          count: { $sum: 1 },
        },
      },
    ]);

      const totalCount = counts.reduce(
      (sum, item) => sum + item.count,
      0
    );

    res.status(200).json({
      success: true,totalCount
    
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getCombinedservices = async (req, res) => {
  try {
    const groupData = await MultiService.find()
      .populate("location_id")
      .sort({
        "location_id.city": 1,
        "location_id.name": 1,
        service_type: 1,
      });

    const grouped = {};

    const addToGroup = (item, type) => {
      const city = item.location_id?.city || "Unknown City";
      const location = item.location_id?.name || "Unknown Location";

      // Create city
      if (!grouped[city]) {
        grouped[city] = {};
      }

      // Create location
      if (!grouped[city][location]) {
        grouped[city][location] = {
          food: [],
          stay: [],
          transport: [],
          guide: [],
          shopping: [],
        };
      }

      grouped[city][location][type].push(item);
    };

    groupData.forEach((item) => {
      addToGroup(item, item.service_type);
    });

    return res.status(200).json({
      success: true,
      total: groupData.length,
      data: grouped,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
};

exports.removeDuplicateStay = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        msg: "Service not found"
      });
    }

    // Remove duplicate ObjectIds
    service.stay = [
      ...new Set(
        service.stay.map(item => item.toString())
      )
    ];

    await service.save();

    res.status(200).json({
      success: true,
      msg: "Duplicates removed",
      data: service
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
// ================= GET SINGLE SERVICE =================

exports.getSingleService =
  async (req, res) => {

    try {

      const { id } = req.params;

      const service =
        await Service.findById(id)

          .populate("food")

          .populate("stay")

          // .populate("transport")

          // .populate("activities");

      if (!service) {

        return res.status(404).json({

          success: false,

          msg:
            "Service not found"
        });
      }

      return res.status(200).json({

        success: true,

        data: service
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


// ================= DELETE SERVICE =================

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find service first
    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        msg: "Service not found"
      });
    }

    // 2. Remove serviceId from Food collection
    await Food.updateMany(
      { service: id },
      { $pull: { service: id } }
    );

    // 3. Remove serviceId from Stay collection
    await StayService.updateMany(
      { service: id },
      { $pull: { service: id } }
    );

    // 4. Delete Service
    await Service.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      msg: "Service deleted and references removed"
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


exports.servicesByLocationId = async (req, res) => {
  try {
    const { locationId } = req.params;

    const services = await MultiService.find({
      location_id: locationId,
      is_available: true,
    });

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found for this location.",
      });
    }

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};