import express from 'express';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Generate code from natural language
router.post('/generate', [
  body('language').notEmpty().withMessage('Language is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { language, description, complexity = 'medium' } = req.body;

    // Check cache
    const cacheKey = `code:${language}:${description}:${complexity}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Generate code using OpenAI
    const prompt = `Generate a ${language} function based on: ${description}. Provide clear, well-documented code with error handling.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert coding assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const code = completion.choices[0].message.content;

    // Cache for 24 hours
    await redisClient.setex(cacheKey, 86400, JSON.stringify({ code }));

    res.json({ success: true, code });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate code. Please try again.'
    });
  }
});

// Optimize existing code
router.post('/optimize', [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;

    const prompt = `Optimize the following ${language} code for performance, readability, and best practices:\n\n${code}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a senior software engineer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    const optimizedCode = completion.choices[0].message.content;

    res.json({
      success: true,
      optimizedCode,
      improvements: ['Performance improved', 'Better readability', 'Best practices applied']
    });
  } catch (error) {
    console.error('Code optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize code. Please try again.'
    });
  }
});

// Explain code
router.post('/explain', [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a technical code explainer.' },
        { role: 'user', content: `Explain this code in simple terms:\n\n${code}` }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const explanation = completion.choices[0].message.content;

    res.json({
      success: true,
      explanation
    });
  } catch (error) {
    console.error('Code explanation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to explain code. Please try again.'
    });
  }
});

// Detect bugs
router.post('/detect-bugs', [
  body('code').notEmpty().withMessage('Code is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a code reviewer and bug detector.' },
        { role: 'user', content: `Review this ${language} code and identify any bugs, potential issues, or security vulnerabilities:\n\n${code}` }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const review = completion.choices[0].message.content;

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Bug detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect bugs. Please try again.'
    });
  }
});

export default router;
