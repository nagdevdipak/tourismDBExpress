const router = require('express').Router()

const {registerVisitor,send_OTP,verifyOTP,getVisitor,resendOTP,deleteVisitor} = require('../Controller/VisitorController')

router.post("/sendOTP",send_OTP)
router.post("/verifyOtp",verifyOTP)
router.post('/register',registerVisitor)
router.post('/resend',resendOTP)
router.get("/getVisitor",getVisitor)
router.delete('/delete/:id',deleteVisitor)
module.exports = router;