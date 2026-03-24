-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------
-- USERS (optional but useful)
---------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    role TEXT DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT NOW()
);

---------------------------------------------------
-- WALLETS
---------------------------------------------------
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_user ON wallets(user_id);

---------------------------------------------------
-- WALLET BALANCES (multi-currency)
---------------------------------------------------
CREATE TABLE wallet_balances (
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(20,2) DEFAULT 0,

    PRIMARY KEY(wallet_id,currency)
);

CREATE INDEX idx_wallet_balance_wallet
ON wallet_balances(wallet_id);

---------------------------------------------------
-- PAYMENTS
---------------------------------------------------
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    from_wallet UUID REFERENCES wallets(id),
    to_wallet UUID REFERENCES wallets(id),

    amount NUMERIC(20,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,

    status VARCHAR(20) DEFAULT 'PENDING',

    idempotency_key TEXT UNIQUE,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_wallets
ON payments(from_wallet,to_wallet);

---------------------------------------------------
-- LEDGER (APPEND ONLY)
---------------------------------------------------
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    wallet_id UUID REFERENCES wallets(id),

    type VARCHAR(10) CHECK (type IN ('DEBIT','CREDIT')),

    amount NUMERIC(20,2) NOT NULL,
    currency VARCHAR(10),

    reference_id UUID,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ledger_wallet
ON ledger_entries(wallet_id);

---------------------------------------------------
-- PAYMENT REVERSALS
---------------------------------------------------
CREATE TABLE payment_reversals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    payment_id UUID REFERENCES payments(id),

    reason TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);