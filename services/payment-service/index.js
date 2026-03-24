const express = require("express");
const connectDB = require("./shared/db");
const redis = require("./shared/redis");
const eventBus = require("./shared/eventBus");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

let pool;

// TRANSFER MONEY

app.post("/payments/transfer", async (req, res) => {

  const { fromWalletId, toWalletId, amount, currency, idempotencyKey } = req.body;

  if (!fromWalletId || !toWalletId || !amount || !currency || !idempotencyKey) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const client = await pool.connect();

  try {

    // IDEMPOTENCY CHECK

    const existing = await client.query(
      "SELECT * FROM payments WHERE idempotency_key=$1",
      [idempotencyKey]
    );

    if (existing.rows.length) {
      return res.json(existing.rows[0]);
    }


    // REDIS LOCK (prevent double spending)

    const lock = await redis.set(
      `lock:${fromWalletId}`,
      "locked",
      "NX",
      "EX",
      5
    );

    if (!lock) {
      return res.status(400).json({
        error: "Wallet currently locked"
      });
    }

    // START DB TRANSACTION

    await client.query("BEGIN");

    // CHECK BALANCE

    const balanceResult = await client.query(
      `SELECT balance
       FROM wallet_balances
       WHERE wallet_id=$1 AND currency=$2
       FOR UPDATE`,
      [fromWalletId, currency]
    );

    if (!balanceResult.rows.length) {
      throw new Error("Balance not found");
    }

    const balance = balanceResult.rows[0].balance;

    if (balance < amount) {
      throw new Error("Insufficient funds");
    }


//  CREATE PAYMENT RECORD


    const paymentId = uuidv4();

    await client.query(
      `INSERT INTO payments
      (id,from_wallet,to_wallet,amount,currency,status,idempotency_key)
      VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [
        paymentId,
        fromWalletId,
        toWalletId,
        amount,
        currency,
        "PROCESSING",
        idempotencyKey
      ]
    );


    // UPDATE WALLET BALANCES


    await client.query(
      `UPDATE wallet_balances
       SET balance = balance - $3
       WHERE wallet_id=$1 AND currency=$2`,
      [fromWalletId, currency, amount]
    );

    await client.query(
      `INSERT INTO wallet_balances(wallet_id,currency,balance)
       VALUES($1,$2,$3)
       ON CONFLICT(wallet_id,currency)
       DO UPDATE
       SET balance = wallet_balances.balance + $3`,
      [toWalletId, currency, amount]
    );


    // COMMIT TRANSACTION


    await client.query("COMMIT");


    // EMIT EVENT


    await eventBus.publish("payments", {
      type: "PAYMENT_SETTLED",
      paymentId,
      fromWalletId,
      toWalletId,
      amount,
      currency
    });

    res.json({
      paymentId,
      status: "COMPLETED"
    });

  } catch (err) {

    await client.query("ROLLBACK");

    console.error(err);

    res.status(400).json({
      error: err.message
    });

  } finally {

    client.release();

    await redis.del(`lock:${fromWalletId}`);

  }

});


// START SERVER

async function start() {

  pool = await connectDB();

  await eventBus.connectRabbit();

  app.listen(3002, () => {
    console.log("payment-service running");
  });

}

start();