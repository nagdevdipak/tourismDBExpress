const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/Uploads',express.static('Uploads'))
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/user", require("./Routs/UserRout"));
app.use("/api/Service",require("./Routs/DSRouter"))
app.use("/api/visitor",require("./Routs/VisitorRoute"));
app.use("/api/locations",require("./Routs/locationRoute"))
app.use("/api/feedback",require("./Routs/FeedbackRoute"))
app.use("/api/foodservice",require("./Routs/foodseviceRoute"))
app.use("/api/services",require("./Routs/ServiceRoute"))
app.use("/api/stay",require("./Routs/stayserviceRoute"))
app.use("/api/visits",require("./Routs/visitDetailsRoute"))
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.listen(5000, () => console.log("Server running on port 5000"));