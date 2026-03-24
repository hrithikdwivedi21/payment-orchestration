const express = require("express");
const cors = require("cors");
const connectDB = require("./shared/db");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

let pool;


app.post("/wallets", async (req, res) => {

  try {

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }

    const walletId = uuidv4();

    await pool.query(
      `INSERT INTO wallets(id,user_id)
       VALUES($1,$2)`,
      [walletId, userId]
    );

    res.json({
      walletId
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "wallet creation failed"
    });

  }

});


app.post("/wallet/deposit", async (req, res) => {

  try {

    const { walletId, amount, currency } = req.body;

    if (!walletId || !amount || !currency) {
      return res.status(400).json({ error: "invalid request" });
    }

    await pool.query(
      `INSERT INTO wallet_balances(wallet_id,currency,balance)
       VALUES($1,$2,$3)
       ON CONFLICT(wallet_id,currency)
       DO UPDATE
       SET balance = wallet_balances.balance + $3`,
      [walletId, currency, amount]
    );

    res.json({
      status: "deposit successful"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "deposit failed"
    });

  }

});


app.post("/wallet/withdraw", async (req, res) => {

  try {

    const { walletId, amount, currency } = req.body;

    const result = await pool.query(
      `SELECT balance
       FROM wallet_balances
       WHERE wallet_id=$1 AND currency=$2`,
      [walletId, currency]
    );

    if (!result.rows.length || result.rows[0].balance < amount) {
      return res.status(400).json({ error: "insufficient funds" });
    }

    await pool.query(
      `UPDATE wallet_balances
       SET balance = balance - $3
       WHERE wallet_id=$1 AND currency=$2`,
      [walletId, currency, amount]
    );

    res.json({
      status: "withdraw successful"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "withdraw failed"
    });

  }

});


app.get("/wallet/:id/balance", async (req, res) => {

  try {

    const walletId = req.params.id;

    const result = await pool.query(
      `SELECT currency,balance
       FROM wallet_balances
       WHERE wallet_id=$1`,
      [walletId]
    );

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "failed to fetch balance"
    });

  }

});

async function start() {

  pool = await connectDB();

  app.listen(3001, () => {
    console.log("wallet-service running on 3001");
  });

}

start();