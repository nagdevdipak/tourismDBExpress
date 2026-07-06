const feedbackSchema = require('../Model/Feedback')

const Visitor = require("../Model/visitorRegistrationForm");

exports.createFeedback = async (req, res) => {
  try {
    const {
      visitorId,
      overall_rating,
      serviceFeedback,
      facilities,
      overallComment,
    } = req.body;

    // Check visitor
    const visitor = await Visitor.findById(visitorId);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Create feedback
    const feedback = await feedbackSchema.create({
      visitorId,
      location: visitor.location,
      overall_rating,
      serviceFeedback,
      facilities,
      overallComment,
    });

    // Populate references
    await feedback.populate([
      {
        path: "visitorId",
      },
      {
        path: "location",
      },
      {
        path: "serviceFeedback.serviceId", model: "MultiService",
    select: "name service_type image",
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: feedback,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// get feedback report

exports.getFeedback = async (req, res) => {
  try {
    const { visitorId, feedbackId } = req.body;

    let query = {};
    if (visitorId) query.visitorId = visitorId;
    if (feedbackId) query._id = feedbackId;

    const feedback = await feedbackSchema.find(query);

    res.status(200).json({
      msg: "feedback received",
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await feedbackSchema
      .find()
      .populate("visitorId", "full_name email").populate("location").populate({
        path: "serviceFeedback.serviceId",
        model: "MultiService",
        select: "name service_type image",
      }) // optional but useful
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      msg: "All feedback fetched",
      count: feedback.length,
      data: feedback
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
};

exports.deleteFeedback = async(req,res)=>{
     try{
 const {id}= req.params;

 const feedback = await feedbackSchema.findByIdAndDelete(id)
   if(!feedback){
    res.status(404).json({msg:"feedback not found"})
   }else{
    res.status(200).json({msg:"feedback deleted"})
   }
     }catch(err){
 res.status(500).json({msg:err.message})
     }
}