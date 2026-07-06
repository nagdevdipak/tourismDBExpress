const express = require("express")
const router = express.Router()

const {updatevisitDetails,getvisitDetails} = require("../Controller/visitStatusController")

router.post("/linkvisits",updatevisitDetails)
router.get("/getvisitdetails",getvisitDetails)
router.put("/updatevisit/:id", updatevisitDetails);
module.exports = router