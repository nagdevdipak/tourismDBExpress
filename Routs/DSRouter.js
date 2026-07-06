const express = require("express")
const router = express.Router()

const{addService,fetchServices,fetchByType,updateService,deleteService,updateRatings,fetchServiceById}=require("../Controller/DynamicServiceController")
const {photoUpload}=require("../fileUploads")
router.post("/add",photoUpload,addService)
router.get("/service/:id",fetchServiceById)
router.get("/services",fetchServices)
router.put('/ratings/:id',updateRatings)
router.put("/update/:id",photoUpload,updateService)
router.put("/image/:id",photoUpload,updateService)
router.get("/types/:type",fetchByType)
router.delete("/delete/:id",deleteService)
module.exports = router