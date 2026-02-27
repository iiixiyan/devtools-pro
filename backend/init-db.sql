-- Create database
CREATE DATABASE devtools_pro
  WITH
  OWNER = postgres
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.utf8'
  LC_CTYPE = 'en_US.utf8'
  TABLESPACE = pg_default
  CONNECTION LIMIT = -1;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  plan VARCHAR(50) DEFAULT 'free',
  usage_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Insert demo user (password: password123)
INSERT INTO users (email, password, name, plan) VALUES
  ('demo@devtoolspro.com', '$2a$10$rX7ZrX7ZrX7ZrX7ZrX7Zr.O5rX7ZrX7ZrX7ZrX7ZrX7ZrX7ZrX7', 'Demo User', 'free')
  ON CONFLICT (email) DO NOTHING;

-- Insert usage log for demo user
INSERT INTO usage_logs (user_id, action, details)
SELECT id, 'first_visit', '{"plan": "free"}'::jsonb
FROM users
WHERE email = 'demo@devtoolspro.com'
ON CONFLICT DO NOTHING;

-- Function to update usage count
CREATE OR REPLACE FUNCTION update_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'code_generation' THEN
    UPDATE users
    SET usage_count = usage_count + 1,
        last_reset_date = CURRENT_DATE
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER track_usage
  AFTER INSERT ON usage_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_count();

-- Comments
COMMENT ON TABLE users IS 'User accounts and subscription plans';
COMMENT ON TABLE usage_logs IS 'Track user API usage and actions';
COMMENT ON COLUMN users.plan IS 'Subscription plan: free, pro, enterprise';
COMMENT ON COLUMN users.usage_count IS 'Daily usage count for free tier users';
