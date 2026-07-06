const Service = require("../Model/DynamicServices");

exports.addService = async (req, res) => {
  try {
   const {
  location_id,
  service_type,
  name,
  description,
  ratings,
  is_available,
} = req.body;


const details = req.body.details
  ? JSON.parse(req.body.details)
  : {};

    const existingService = await Service.findOne({
  location_id,
  service_type,
  name: name.trim(),
});

if (existingService) {
  return res.status(409).json({
    success: false,
    msg: "This service already exists at this location.",
  });
}

const duplicates = await Service.aggregate([
  {
    $group: {
      _id: {
        location_id: "$location_id",
        service_type: "$service_type",
        name: { $toLower: "$name" }
      },
      ids: { $push: "$_id" },
      count: { $sum: 1 }
    }
  },
  {
    $match: {
      count: { $gt: 1 }
    }
  }
]);

for (const dup of duplicates) {
  dup.ids.shift(); // keep first
  await Service.deleteMany({
    _id: { $in: dup.ids }
  });
}

    const service = await Service.create({
      location_id,
      image: req.file ? req.file.filename : null,
      service_type,
      name,
      description,
      ratings,
      is_available,
      details,
    });

     await service.populate("location_id");

    res.status(201).json({
      success: true,
      msg: "Service added successfully",
      data: service,
    });
  } catch (err) {
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      msg: "This service already exists at this location.",
    });
  }

  return res.status(500).json({
    success: false,
    msg: "Server error",
    error: err.message,
  });
}
};

exports.fetchServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("location_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.fetchServiceById = async(req,res)=>{
  try{
    const {id} = req.params;
    const service = await Service.findById(id)
    if(!service){
      res.status(404).json({msg:"service not found"})
    }else{
      res.status(200).json({msg:"service found",data:{service}})
    }

  }catch(err){
 console.error(err.res?.message)
  }
}
exports.fetchByType = async (req, res) => {
  try {
    const { type } = req.params;

    const services = await Service.find({
      service_type: type,
    }).populate("location_id");

    res.status(200).json({
      success: true,
      data: services,
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
req.file.filename;
    if (
      req.body.details &&
      typeof req.body.details === "string"
    ) {
      req.body.details = JSON.parse(req.body.details);
    }

    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Service.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("location_id");

    if (!updated) {
      return res.status(404).json({
        success: false,
        msg: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updated,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateRatings = async(req,res)=>{
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,{
        $set:{ ratings: req.body.ratings }
      },
      
      { new: true }
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
exports.deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        msg: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Service deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

