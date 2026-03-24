import axios from "axios";
import { useState } from "react";
import "./App.css";

export default function App() {

  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");

  const API = "http://localhost:3000";

  const createWallet = async () => {
    try {

      const res = await axios.post(`${API}/wallets`, {
        userId: "user1"
      });

      setWallet(res.data.walletId);
      setMessage("Wallet created successfully!");

    } catch (err) {
      setMessage("Error creating wallet");
    }
  };

  const deposit = async () => {

    if (!wallet) {
      setMessage("Create wallet first");
      return;
    }

    try {

      await axios.post(`${API}/wallet/deposit`, {
        walletId: wallet,
        currency,
        amount
      });

      setMessage("Deposit successful!");

    } catch (err) {
      setMessage("Deposit failed");
    }
  };

  return (
    <div className="container">

      <h1 className="title">💳 Payment Orchestration Wallet</h1>

      <div className="card">

        <button className="btn-primary" onClick={createWallet}>
          Create Wallet
        </button>

        {wallet && (
          <div className="wallet-box">
            Wallet ID:
            <span>{wallet}</span>
          </div>
        )}

      </div>

      <div className="card">

        <h2>Deposit Money</h2>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option>USD</option>
          <option>INR</option>
          <option>EUR</option>
        </select>

        <button className="btn-success" onClick={deposit}>
          Deposit
        </button>

      </div>

      {message && <div className="message">{message}</div>}

    </div>
  );
}