const express = require("express");
const router = express.Router();

const { addstayservice,getStayservice ,updateStayservice,getGroupStayservice,deleteStayservice} = require("../Controller/stayController");
const {photoUpload} = require('../fileUploads')
router.post("/addstay",photoUpload, addstayservice);
router.get('/getStay',getStayservice)
router.get('/getGroupedStay',getGroupStayservice)
router.put('/update/:id',photoUpload,updateStayservice)
router.delete('/delete/:id',deleteStayservice)
// router.put('/update/:id',updateStayservice)
module.exports = router;