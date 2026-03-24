CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE wallets (
 id UUID PRIMARY KEY,
 user_id UUID
);

CREATE TABLE wallet_balances (
 wallet_id UUID,
 currency VARCHAR(10),
 balance NUMERIC,
 PRIMARY KEY(wallet_id,currency)
);

CREATE TABLE payments (
 id UUID PRIMARY KEY,
 from_wallet UUID,
 to_wallet UUID,
 amount NUMERIC,
 currency VARCHAR(10),
 status VARCHAR(20),
 idempotency_key VARCHAR(255) UNIQUE
);

CREATE TABLE ledger_entries (
 id UUID PRIMARY KEY,
 wallet_id UUID,
 type VARCHAR(10),
 amount NUMERIC,
 currency VARCHAR(10),
 reference_id UUID,
 created_at TIMESTAMP DEFAULT now()
);