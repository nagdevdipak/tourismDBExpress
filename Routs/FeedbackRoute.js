const express = require('express')
const router = express.Router()

const{createFeedback,getFeedback,getAllFeedback,deleteFeedback} = require("../Controller/FeedbackController")

router.post("/createfeedback",createFeedback)
router.get("/getfeedback",getFeedback)
router.get("/getAllfeedbacks",getAllFeedback)
router.delete("/delete/:id",deleteFeedback)
module.exports = router