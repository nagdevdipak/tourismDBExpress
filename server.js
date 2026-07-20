const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const dns = require("dns");
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);
dns.setDefaultResultOrder("ipv4first");
const net = require("net");

const socket = net.connect(587, "smtp.gmail.com");

socket.setTimeout(15000);

socket.on("connect", () => {
  console.log("TCP Connected to smtp.gmail.com:587");
  socket.end();
});

socket.on("timeout", () => {
  console.log("TCP Connection Timeout");
  socket.destroy();
});

socket.on("error", (err) => {
  console.log("TCP Error:", err);
});

const tls = require("tls");


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

dns.lookup("smtp.gmail.com", (err, address, family) => {
  if (err) {
    console.error("DNS Lookup Error:", err);
  } else {
    console.log("smtp.gmail.com resolved to:", address);
    console.log("IP Family:", family === 4 ? "IPv4" : "IPv6");
  }
});



app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.get("/tcp-test", async (req, res) => {
  const net = require("net");

  const socket = net.connect({
    host: "74.125.195.108",
    port: 587,
  });

  socket.setTimeout(10000);

  socket.on("connect", () => {
    socket.destroy();
    res.send("CONNECTED");
  });

  socket.on("timeout", () => {
    socket.destroy();
    res.send("TIMEOUT");
  });

  socket.on("error", (err) => {
    res.json(err);
  });
});

app.get("/smtp-test", async (req, res) => {

  const ips = [
    "74.125.142.108",
    "74.125.195.108",
    "74.125.199.108",
    "142.250.99.108"
  ];

  const results = [];

  for (const ip of ips) {

    console.log("Testing", ip);

    try {

      await new Promise((resolve, reject) => {

 const socket = net.connect({
  host: ip,
  port: 587,
  timeout: 10000,
});

socket.on("lookup", (...args) => console.log("lookup", args));

socket.on("connect", () => console.log("CONNECTED"));

socket.on("ready", () => console.log("READY"));

socket.on("timeout", () => console.log("TIMEOUT"));

socket.on("close", hadError => console.log("CLOSE", hadError));

socket.on("end", () => console.log("END"));

socket.on("error", err => console.log(err));

        socket.on("connect", () => {
          console.log(ip, "CONNECTED");
          results.push({ ip, status: "CONNECTED" });
          socket.destroy();
          resolve();
        });

        socket.on("timeout", () => {
          console.log(ip, "TIMEOUT");
          results.push({ ip, status: "TIMEOUT" });
          socket.destroy();
          reject(new Error("TIMEOUT"));
        });

        socket.on("error", (err) => {
          console.log(ip, err.message);
          results.push({ ip, status: err.message });
          reject(err);
        });

      });

    } catch (e) {}
  }

  res.json(results);
});
app.use('/Uploads',express.static('Uploads'))



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(error => {
  console.error("MongoDB Connection Error");
console.error("Name:", error.name);
console.error("Code:", error.code);
console.error("Command:", error.command);
console.error("Message:", error.message);
console.error("Stack:", error.stack);
});

  app.get("/", (req, res) => {
  res.send("Tourism API is running...");
});

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