const express = require('express');

const router = express.Router();

const {
  addLocation,
  verifyLocation,
  findAllLocation,findGroupLocation,
  deleteLocation,
  updateStatus,
  updatePhoto,deleteItem,UpdateCity
} = require('../Controller/locationController');

const {
  photoUpload
} = require("../fileUploads");
router.post(
  "/addLocation",
  photoUpload,
  addLocation
);

router.post(
  "/verifyLocation",
  verifyLocation
);

router.put(
  '/updatestatus/:id',
  updateStatus
);

router.get(
  "/findAll",
  findAllLocation
);
router.get('/findGroupLocation',findGroupLocation)
router.delete(
  '/deletelocation/:id',
  deleteLocation
);

router.put(
  '/photo/:id',photoUpload,
  updatePhoto
);

router.put('/image/:id',photoUpload,deleteItem)
router.put('/city/:id',UpdateCity)
console.log(addLocation);
console.log(photoUpload);

module.exports = router;