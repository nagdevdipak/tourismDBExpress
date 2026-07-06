const express = require("express")
const router = express.Router()

const{addFoodService,fetchSingleFoodService,deletefoodservice,fetchfoodservice,updatefoodservice,fetchfoodserviceByGroupLocation} = require("../Controller/foodController")
const {photoUpload} = require("../fileUploads")
router.post("/addfoodservice",addFoodService)
router.put('/updatefood/:id',photoUpload,updatefoodservice)
router.get("/getfoodservice",fetchfoodservice)
router.get("/food/:id",fetchSingleFoodService)
router.get('/getGroupFoodByLocation',fetchfoodserviceByGroupLocation)
router.delete("/delete/:id",deletefoodservice)
module.exports = router