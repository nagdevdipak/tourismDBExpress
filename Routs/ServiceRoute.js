const express = require("express")
const router = express.Router()

const {getServiceCounts,updateService,servicesByLocationId,updateServiceReference,removeReference,getCombinedservices,deleteService, getAllservices}= require("../Controller/serviceController")

 router.get("/count",getServiceCounts)
 router.get("/all",getAllservices)
router.get("/location/:locationId", servicesByLocationId);
router.get('/getCombinedServices',getCombinedservices)
router.put('/update/:_id',updateService)
router.put("/removeRef/:id",removeReference)
router.delete("/delete/:id",deleteService)
router.put("/toggleRef/:id",updateServiceReference)
module.exports = router