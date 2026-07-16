const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
     "http://localhost:3000",
    "https://tourismdbexpress.onrender.com"
  ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

//  app.use(cors())

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/Uploads',express.static('Uploads'))



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
  console.error("MongoDB Connection Error");
  console.error(err);
});

  app.get("/", (req, res) => {
  res.send("Tourism API is running...");
});

console.log(process.env.MONGO_URI);
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
// app.listen(5000,()=>console.log(`server is running on port 5000`))
 const PORT = process.env.PORT || 5000;

 app.listen(PORT,"0.0.0.0", () => console.log(`Server running on port ${PORT}`));