import axios from "axios";
import { useState } from "react";
import "./App.css";

export default function App() {

  const WALLET_API = "http://localhost:3001";
  const PAYMENT_API = "http://localhost:3002";

  const [walletId, setWalletId] = useState("");
  const [receiverWallet, setReceiverWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [balances, setBalances] = useState([]);
  const [message, setMessage] = useState("");

  // CREATE WALLET

  const createWallet = async () => {

    try {

      const res = await axios.post(`${WALLET_API}/wallets`, {
        userId: "user1"
      });

      setWalletId(res.data.walletId);

      setMessage("Wallet created successfully");

    } catch {

      setMessage("Wallet creation failed");

    }

  };

  // DEPOSIT

  const deposit = async () => {

    try {

      await axios.post(`${WALLET_API}/wallet/deposit`, {
        walletId,
        amount: Number(amount),
        currency
      });

      setMessage("Deposit successful");

      fetchBalance();

    } catch {

      setMessage("Deposit failed");

    }

  };

  // WITHDRAW

  const withdraw = async () => {

    try {

      await axios.post(`${WALLET_API}/wallet/withdraw`, {
        walletId,
        amount: Number(amount),
        currency
      });

      setMessage("Withdraw successful");

      fetchBalance();

    } catch {

      setMessage("Withdraw failed");

    }

  };

  // BALANCE

  const fetchBalance = async () => {

    try {

      const res = await axios.get(
        `${WALLET_API}/wallet/${walletId}/balance`
      );

      setBalances(res.data);

    } catch {

      setMessage("Failed to fetch balance");

    }

  };

  // TRANSFER


  const transfer = async () => {

    try {

      await axios.post(`${PAYMENT_API}/payments/transfer`, {

        fromWalletId: walletId,
        toWalletId: receiverWallet,
        amount: Number(amount),
        currency,
        idempotencyKey: Date.now().toString()

      });

      setMessage("Transfer successful");

      fetchBalance();

    } catch {

      setMessage("Transfer failed");

    }

  };

  return (

  <div className="container">

<h1 className="title">💳 Payment Platform</h1>

<div className="grid">

<div className="card">
<button className="btn-primary" onClick={createWallet}>
Create Wallet
</button>

{walletId && (
<div className="wallet-box">
Wallet ID:<span>{walletId}</span>
</div>
)}
</div>

<div className="card">
<input
type="number"
placeholder="Amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
/>

<select
value={currency}
onChange={(e)=>setCurrency(e.target.value)}
>
<option>USD</option>
<option>INR</option>
<option>EUR</option>
</select>

<button className="btn-success" onClick={deposit}>Deposit</button>
<button className="btn-warning" onClick={withdraw}>Withdraw</button>
<button className="btn-info" onClick={fetchBalance}>Check Balance</button>
</div>

<div className="card">
<input
type="text"
placeholder="Receiver Wallet ID"
value={receiverWallet}
onChange={(e)=>setReceiverWallet(e.target.value)}
/>

<button className="btn-transfer" onClick={transfer}>
Transfer
</button>
</div>

<div className="card">
<div className="balance-list">
{balances.map((b,i)=>(
<div key={i}>{b.currency} : {b.balance}</div>
))}
</div>
</div>

</div>

{message && <div className="message">{message}</div>}

</div>

  );

}