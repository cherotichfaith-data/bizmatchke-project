-- Add financial projections table
CREATE TABLE IF NOT EXISTS financial_projections (
    id SERIAL PRIMARY KEY,
    business_idea_id INTEGER REFERENCES business_ideas(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    initial_investment DECIMAL(12, 2) NOT NULL,
    monthly_expenses JSONB NOT NULL,
    revenue_projections JSONB NOT NULL,
    break_even_point INTEGER, -- in months
    profit_margin DECIMAL(5, 2), -- percentage
    roi_estimate DECIMAL(5, 2), -- percentage
    cash_flow_projection JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX idx_financial_projections_business_idea_id ON financial_projections(business_idea_id);
