import express from 'express';
import { Pool } from 'pg';
import redis from 'redis';

const router = express.Router();
const pool = new Pool();
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

// 生成单元测试
router.post('/unit', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Code is required' });
    }

    // Cache check
    const cacheKey = `tests:unit:${language}:${code.slice(0, 100)}:${Date.now()}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, tests: JSON.parse(cached) });
    }

    const prompt = `Generate comprehensive unit tests for this ${language} code:

\`\`\`${language}
${code}
\`\`\`

Generate tests using appropriate testing framework:
- For JavaScript/TypeScript: Jest
- For Python: pytest
- For Java: JUnit

Include:
- Test cases for normal operations
- Test cases for error handling
- Edge case tests
- Mock external dependencies

Format as a complete test file with proper imports.`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert software test engineer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Failed to generate tests');
    }

    const tests = data.choices[0].message.content;

    // Cache for 1 hour
    await redisClient.setex(cacheKey, 3600, tests);

    res.json({
      success: true,
      tests,
      framework: language === 'javascript' || language === 'typescript' ? 'Jest' : language
    });
  } catch (error) {
    console.error('Unit test generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate unit tests' });
  }
});

// 生成集成测试
router.post('/integration', async (req, res) => {
  try {
    const { apiEndpoints, data } = req.body;

    if (!apiEndpoints || !apiEndpoints.length) {
      return res.status(400).json({ success: false, error: 'API endpoints are required' });
    }

    const prompt = `Generate integration tests for the following API endpoints:

**Endpoints:**
${apiEndpoints.map(ep => `
- ${ep.method || 'GET'} ${ep.path || '/'}
  - Description: ${ep.description || 'No description'}
  - Test scenarios needed:
${(ep.testScenarios || []).map(scenario => `    * ${scenario}`).join('\n')}
`).join('\n')}

**Test Data:**
${JSON.stringify(data, null, 2)}

Generate tests that:
1. Test endpoint coordination
2. Test data validation
3. Test error handling
4. Test API responses
5. Use appropriate testing framework (Jest for JS, pytest for Python, etc.)

Include test setup, test execution, and test teardown.`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert integration test engineer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Failed to generate integration tests');
    }

    res.json({
      success: true,
      tests: data.choices[0].message.content,
      framework: 'Jest'
    });
  } catch (error) {
    console.error('Integration test generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate integration tests' });
  }
});

// 生成端到端测试（E2E）
router.post('/e2e', async (req, res) => {
  try {
    const { userFlow, features } = req.body;

    if (!userFlow || !features || !features.length) {
      return res.status(400).json({ success: false, error: 'User flow and features are required' });
    }

    const prompt = `Generate end-to-end tests (E2E) for this user flow:

**User Flow:**
${userFlow}

**Features to Test:**
${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Generate E2E tests using:
- Cypress
- Playwright
- or Selenium (depending on framework preference)

Include:
1. Test setup and configuration
2. Login/authentication tests
3. Core feature tests
4. Error handling tests
5. Edge cases
6. Test cleanup

Format as a complete E2E test suite with proper test descriptions and assertions.`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert E2E test engineer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Failed to generate E2E tests');
    }

    res.json({
      success: true,
      tests: data.choices[0].message.content,
      framework: 'Cypress/Playwright'
    });
  } catch (error) {
    console.error('E2E test generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate E2E tests' });
  }
});

// 生成测试覆盖率报告
router.post('/coverage', async (req, res) => {
  try {
    const { testResults } = req.body;

    if (!testResults || !testResults.length) {
      return res.status(400).json({ success: false, error: 'Test results are required' });
    }

    const prompt = `Generate a test coverage report based on these test results:

${JSON.stringify(testResults, null, 2)}

Generate a comprehensive report including:
1. Overall coverage percentage
2. Per-module coverage breakdown
3. Line coverage details
4. Branch coverage details
5. Function coverage details
6. Suggested areas for improvement

Format as a professional report with visual indicators for coverage levels (high/medium/low).`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a test analysis expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Failed to generate coverage report');
    }

    res.json({
      success: true,
      report: data.choices[0].message.content
    });
  } catch (error) {
    console.error('Coverage report generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate coverage report' });
  }
});

// 测试最佳实践生成
router.get('/best-practices', async (req, res) => {
  try {
    const { language } = req.query;
    const bestPractices = {
      javascript: [
        '1. Use descriptive test names that explain what is being tested',
        '2. Follow AAA pattern: Arrange, Act, Assert',
        '3. Test one behavior per test',
        '4. Use mocks for external dependencies',
        '5. Write tests before code (TDD)',
        '6. Keep tests independent and deterministic',
        '7. Aim for 100% line coverage for critical paths',
        '8. Use descriptive variable names in test setup',
        '9. Test both success and failure cases',
        '10. Keep tests fast and isolated'
      ],
      python: [
        '1. Use pytest for readability and flexibility',
        '2. Follow Arrange-Act-Assert pattern',
        '3. Use fixtures for reusable test setup',
        '4. Write tests that are self-documenting',
        '5. Use parametrize for test variations',
        '6. Mock external services and APIs',
        '7. Test edge cases and boundary conditions',
        '8. Keep tests independent',
        '9. Aim for high test coverage (>80%)',
        '10. Use descriptive test names and docstrings'
      ],
      java: [
        '1. Use JUnit 5 for modern testing',
        '2. Follow AAA pattern (Arrange, Act, Assert)',
        '3. Use parameterized tests for variations',
        '4. Apply testing best practices',
        '5. Use mocking frameworks (Mockito)',
        '6. Write tests for business logic only',
        '7. Keep tests independent and fast',
        '8. Use descriptive test names',
        '9. Aim for high test coverage',
        '10. Regularly review and refactor tests'
      ]
    };

    res.json({
      success: true,
      bestPractices: bestPractices[language] || bestPractices.javascript
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch best practices' });
  }
});

export default router;
