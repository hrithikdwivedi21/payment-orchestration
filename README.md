# Payment Orchestration Platform

A simplified **distributed payment orchestration system** that simulates how modern fintech platforms process wallet transactions using microservices.

The platform supports:

* Multi-currency wallets
* Wallet deposits and withdrawals
* Peer-to-peer transfers
* Idempotent payment processing
* Event-driven ledger updates
* Role-based access control
* Transaction reversals

The system demonstrates how **real payment infrastructure** (similar to Stripe or PayPal architecture) can be implemented using microservices.

---

# Tech Stack

Backend

* Node.js
* Express.js
* PostgreSQL
* Redis
* RabbitMQ

Infrastructure

* Docker
* Docker Compose

Frontend

* React
* CSS

---

# System Architecture

```
Frontend (React)
       |
API Gateway
       |
------------------------------------
| Wallet Service                   |
| Payment Service                  |
| Ledger Service                   |
------------------------------------
       |
Event Bus (RabbitMQ)
       |
PostgreSQL + Redis
```

Services:

Wallet Service
Manages wallets, deposits, withdrawals and balance queries.

Payment Service
Handles peer-to-peer transfers with idempotency and locking.

Ledger Service
Stores immutable transaction records.

Redis
Used for distributed locking.

RabbitMQ
Used for event-driven processing.

PostgreSQL
Primary database.

---

# Core Features

### Wallet Service

Create wallet

Maintain balances in multiple currencies

Example wallet

```
Wallet {
 id
 userId
 balances: {
   USD: 1200
   INR: 40000
 }
}
```

Capabilities

* Create wallet
* Deposit funds
* Withdraw funds
* Query balances

---

### Payment Service

Supports peer-to-peer transfers.

Example request

```
POST /payments/transfer
{
 fromWalletId
 toWalletId
 amount
 currency
 idempotencyKey
}
```

Responsibilities

* Prevent double spending
* Handle retries safely
* Validate sufficient balance
* Emit events to ledger service

---

### Event Driven Processing

Payment flow

```
Payment Requested
        ↓
Funds Reserved
        ↓
Payment Settled
        ↓
Ledger Updated
```

RabbitMQ is used for message passing between services.

---

### Ledger System

Append-only ledger.

Example entry

```
LedgerEntry {
 id
 walletId
 type: DEBIT | CREDIT
 amount
 currency
 referenceId
 timestamp
}
```

Rules

* Immutable
* Never update historical transactions
* Support reconciliation

---

### Role Based Access Control

Roles

```
ADMIN
USER
AUDITOR
```

Permissions

| Role    | Capability           |
| ------- | -------------------- |
| USER    | Transfer funds       |
| ADMIN   | Reverse transactions |
| AUDITOR | Read ledger          |

---

### Transaction Reversal

Admins can reverse transactions.

Endpoint

```
POST /payments/reverse/{transactionId}
```

Rules

* Original ledger entries remain unchanged
* Reversal generates new ledger entries

---

# Project Structure

```
payment-orchestration
│
├── services
│   ├── wallet-service
│   ├── payment-service
│   ├── ledger-service
│   └── api-gateway
│
├── shared
│   ├── db.js
│   ├── redis.js
│   └── eventBus.js
│
├── frontend
│
├── schema.sql
├── docker-compose.yml
└── README.md
```

---

# Setup Instructions

## 1 Install Docker

Install Docker Desktop

[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

---

## 2 Clone Repository

```
git clone <repository-url>
cd payment-orchestration
```

---

## 3 Setup Database

Yes, the database must be set up.

Run the schema inside PostgreSQL.

```
psql -U admin -d payments -f schema.sql
```

If using Docker:

```
docker exec -i payments_db psql -U admin -d payments < schema.sql
```

---

## 4 Start Services

Run the system using Docker.

```
docker compose up --build
```

This starts

* PostgreSQL
* Redis
* RabbitMQ
* Wallet Service
* Payment Service
* Ledger Service
* API Gateway

---

## 5 Run Frontend

```
cd frontend
npm install
npm start
```

Open

```
http://localhost:3003
```

---

# API Endpoints

### Create Wallet

```
POST /wallets
```

Request

```
{
 "userId": "user1"
}
```

---

### Deposit Funds

```
POST /wallet/deposit
```

```
{
 "walletId": "...",
 "amount": 100,
 "currency": "USD"
}
```

---

### Withdraw Funds

```
POST /wallet/withdraw
```

---

### Transfer Money

```
POST /payments/transfer
```

```
{
 fromWalletId
 toWalletId
 amount
 currency
 idempotencyKey
}
```

---

### Get Balance

```
GET /wallet/{walletId}/balance
```

---

# Authentication and Authorization

Authentication and authorization should be implemented.

Possible approaches

* JWT based authentication
* API Gateway authentication middleware
* RBAC enforcement at service level

For this implementation:

* Users are identified by `userId`
* RBAC roles can be extended in the user service

---

# Wallet User ID Handling

Wallet IDs should not use serial numbers.

Instead they should use globally unique identifiers.

Examples

```
UUID
CUID
ULID
```

This prevents predictable wallet IDs and improves security.

Example wallet ID

```
550e8400-e29b-41d4-a716-446655440000
```

The frontend stores the wallet ID for the session so users can reuse it for transfers.

---

# Observability

The system supports logging and monitoring.

Recommended tools

* OpenTelemetry
* Prometheus
* Grafana

---

# Fault Tolerance

The platform handles

* Duplicate requests via idempotency keys
* Concurrent wallet updates via Redis locks
* Event failures via RabbitMQ retries

---

# Bonus Features

Future improvements

* Fraud detection engine
* Currency conversion service
* Event replay for ledger rebuild
* Saga pattern for distributed transactions

---

# Conclusion

This project demonstrates the core concepts used in real fintech payment systems including

* distributed architecture
* event driven processing
* idempotent transaction handling
* ledger based accounting
* microservices communication
