const locationSchema = require('../Model/Location')

exports.addLocation = async (req, res) => {
  try {
    console.log(req.file)
    const {
      name,
      type,
      city,
      latitude,
      longitude,
      status
    } = req.body;

    // image path from multer
    const Img = req.file
      ? req.file.filename
      : "";

    const location = new locationSchema({
      name,
      type,city,
      latitude,
      longitude,
      status,
      Img
    });

    await location.save();

    res.status(200).json({
      msg: "Location added successfully",
      data: location
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "server error"
    });
  }
};
//
// update photo
 exports.updatePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
 const {id} = req.params;
    const location = await locationSchema.findByIdAndUpdate(
          id,         // pass ID directly
      { $set: { Img: req.file.filename } }, // store filename
      { returnDocument: 'after' }                  // return updated document
    );

    if (!location) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Photo updated successfully",
      data: location
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.verifyLocation = async (req, res) => {
  try {
    const { name, latitude, longitude } = req.body;

    // 🔥 find location in DB
    const location = await locationSchema.findOne({ name });

    if (!location) {
      return res.status(404).json({ msg: "Location not found" });
    }

    // ⚠️ compare numbers (important)
    const latMatch = Number(latitude) === Number(location.latitude);
    const longMatch = Number(longitude) === Number(location.longitude);

    if (latMatch && longMatch) {
      return res.status(200).json({ msg: "Location verified ✅" ,name});
    } else {
      return res.status(400).json({ msg: "Location mismatch ❌" });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "server error" });
  }
};

exports.findAllLocation = async (req, res) => {
  try {
    // const { name, latitude, longitude } = req.body;

    // 🔥 find location in DB
    const location = await locationSchema.find();

    if (!location) {
      return res.status(404).json({ msg: "Location not found" });
    }
const groupedLocations = location.reduce((acc, location) => {
  (acc[location.city] ||= []).push(location);
  return acc;
}, {});
      return res.status(200).json({ msg: "Location fetched ✅" ,data:location ,count:location.length});
  

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "server error" });
  }
};

exports.findGroupLocation = async (req, res) => {
  try {
    const locations = await locationSchema.find();

    // group by city
    // const groupedLocations = locations.reduce((acc, loc) => {

    //   const city = loc.city
    //   if (!acc[city]) {
    //     acc[city] = [];
    //   }
    //   acc[city].push(loc);
    //   return acc;
    // }, {});

    const groupedLocations = locations.reduce((acc, loc) => {
      // Normalize city for grouping
      const cityKey = loc.city.trim().toLowerCase();

      // Display name (Nashik, Pune, Satara...)
      const cityName =
        cityKey.charAt(0).toUpperCase() + cityKey.slice(1);

      if (!acc[cityName]) {
        acc[cityName] = [];
      }

      acc[cityName].push(loc);

      return acc;
    }, {});

    return res.status(200).json({
      msg: "Location fetched ✅",
      data: groupedLocations,
      count: locations.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "server error" });
  }
};
exports.updateStatus =async (req, res) => {

    try {

      const { id } =
        req.params;

      const { status } =
        req.body;

      const updatedLocation =
        await locationSchema.findByIdAndUpdate(
          id,
          { status },
          { returnDocument:'after' }
        );

      if (!updatedLocation) {

        return res.status(404).json({
          success: false,
          message:
            "Location not found"
        });
      }

      res.status(200).json({
        success: true,
        data: updatedLocation
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message
      });
    }
};
//delete location
exports.deleteLocation = async (req, res) => {
  try {

    const { id } = req.params;

    const deleteLoc =
      await locationSchema.findByIdAndDelete(id);

    if (!deleteLoc) {
      return res.status(404).json({
        msg: "no location found"
      });
    }

    res.status(200).json({
      msg: "location deleted successfully"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "server error"
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await locationSchema.findByIdAndUpdate(
      id,
      { $unset: { Img: "" } },
      { returnDocument :"after" }
    );

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    return res.status(200).json({ msg: "Image removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.UpdateCity = async (req, res) => {
  const { id } = req.params;
  const { city } = req.body;

  try {
    if (!city) {
      return res.status(400).json({ msg: "City name is required" });
    }

    const cityExists = await locationSchema.findOne({
      city: city,
      _id: { $ne: id }
    });

    if (cityExists) {
      return res.status(409).json({ msg: "City name already exists" });
    }

    const updatedCity = await locationSchema.findByIdAndUpdate(
      id,
      { $set: { city: city } },
      { new: true }
    );

    if (!updatedCity) {
      return res.status(404).json({ msg: "Location not found" });
    }

    return res.status(200).json({
      msg: "City name updated successfully",
      data: updatedCity
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ msg: "Server error" });
  }
};