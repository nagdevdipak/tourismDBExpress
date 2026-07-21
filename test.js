const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.cluster0.58lgry7.mongodb.net",
  (err, records) => {
    console.log(err);
    console.log(records);
  }
);

// const dns = require("dns");

// dns.setServers(["8.8.8.8", "1.1.1.1"]);

// console.log("Servers:", dns.getServers());

// dns.resolveSrv(
//   "_mongodb._tcp.cluster0.58lgry7.mongodb.net",
//   (err, records) => {
//     console.log(err);
//     console.log(records);
//   }
// );