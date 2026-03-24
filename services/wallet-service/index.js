const express = require("express");
const cors = require("cors");
const pool = require("./shared/db");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());   // 👈 important
app.use(express.json());

app.post("/wallets", async (req, res) => {

  const { userId } = req.body;

  const id = uuidv4();

  await pool.query(
    "INSERT INTO wallets(id,user_id) VALUES($1,$2)",
    [id, userId]
  );

  res.json({ walletId: id });

});

app.listen(3001, () => {
  console.log("wallet-service running on 3001");
});