-- Create schema for Loan Eligibility Engine

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    monthly_income INTEGER,
    credit_score INTEGER,
    employment_status VARCHAR(50),
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_score ON users (monthly_income, credit_score);
CREATE INDEX idx_email ON users (email);

CREATE TABLE IF NOT EXISTS loan_products (
    id SERIAL PRIMARY KEY,
    product_id UUID UNIQUE NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    lender_name VARCHAR(255),
    interest_rate DECIMAL(5, 2),
    min_monthly_income INTEGER,
    max_monthly_income INTEGER,
    min_credit_score INTEGER,
    max_credit_score INTEGER,
    allowed_employment_status TEXT[], -- Array of allowed statuses
    min_age INTEGER,
    max_age INTEGER,
    loan_amount_min INTEGER,
    loan_amount_max INTEGER,
    tenure_months INTEGER,
    description TEXT,
    source_url VARCHAR(512),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_range ON loan_products (min_monthly_income, max_monthly_income);
CREATE INDEX idx_credit_range ON loan_products (min_credit_score, max_credit_score);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    match_score DECIMAL(3, 2),
    match_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES loan_products(product_id),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_match_user ON matches (user_id);
CREATE INDEX idx_match_product ON matches (product_id);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    email VARCHAR(255),
    notification_type VARCHAR(50), -- 'matches_digest', 'new_match', etc.
    status VARCHAR(20), -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_notif_user_status ON notifications (user_id, status);

-- Indexes for performance
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_products_created ON loan_products(created_at);
CREATE INDEX idx_matches_created ON matches(created_at);
