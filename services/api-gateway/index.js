const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/wallet", async(req,res)=>{

 const response = await axios({
   method:req.method,
   url:"http://wallet-service:3001"+req.url,
   data:req.body
 });

 res.json(response.data);

});

app.use("/payment", async(req,res)=>{

 const response = await axios({
   method:req.method,
   url:"http://payment-service:3002"+req.url,
   data:req.body
 });

 res.json(response.data);

});

app.listen(3000,()=>console.log("Gateway running"));