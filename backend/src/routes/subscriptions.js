import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const router = express.Router();
const pool = new Pool();

// Pricing plans
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '3 code generations per day',
      'Basic code optimization',
      'Community support',
      'Standard response time'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9,
    features: [
      'Unlimited code generations',
      'Advanced optimization',
      'Priority support',
      'Faster response time',
      'API access',
      'Advanced bug detection'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 29,
    features: [
      'Everything in Pro',
      '24/7 priority support',
      'Custom integrations',
      'Dedicated account manager',
      'Volume discounts'
    ]
  }
};

// Get all pricing plans
router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// Create user account
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, plan, created_at',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        token
      }
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ success: false, error: 'Email already exists' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Failed to register user' });
    }
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await pool.query(
      'SELECT id, email, name, plan, created_at, usage_count FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// Upgrade plan
router.post('/upgrade', async (req, res) => {
  try {
    const { plan, token } = req.body;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, error: 'Invalid plan' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    await pool.query(
      'UPDATE users SET plan = $1 WHERE id = $2',
      [plan, decoded.userId]
    );

    res.json({
      success: true,
      message: 'Plan upgraded successfully',
      plan: PLANS[plan]
    });
  } catch (error) {
    console.error('Plan upgrade error:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade plan' });
  }
});

// Get usage statistics
router.get('/usage', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    const result = await pool.query(
      'SELECT id, email, plan, usage_count, last_reset_date FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, usage: result.rows[0] });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
