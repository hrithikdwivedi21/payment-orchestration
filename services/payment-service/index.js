const express = require("express");
const redis = require("./shared/redis");
const pool = require("./shared/db");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

app.post("/transfer", async (req,res)=>{

 const {fromWalletId,toWalletId,amount,currency,idempotencyKey} = req.body;

 const existing = await pool.query(
   "SELECT * FROM payments WHERE idempotency_key=$1",
   [idempotencyKey]
 );

 if(existing.rows.length){
   return res.json(existing.rows[0]);
 }

 const lock = await redis.set(
   `lock:${fromWalletId}`,
   "locked",
   "NX",
   "EX",
   5
 );

 if(!lock){
   return res.status(400).json({error:"wallet locked"});
 }

 const id = uuidv4();

 await pool.query(
 `INSERT INTO payments
 VALUES($1,$2,$3,$4,$5,'PENDING',$6)`,
 [id,fromWalletId,toWalletId,amount,currency,idempotencyKey]);

 res.json({paymentId:id});

});

app.listen(3002,()=>console.log("payment-service running"));