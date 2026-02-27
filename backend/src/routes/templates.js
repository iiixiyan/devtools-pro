import express from 'express';
import { Pool } from 'pg';
import redis from 'redis';

const router = express.Router();
const pool = new Pool();
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

// 模板库
const TEMPLATES = {
  react_component: {
    name: 'React Component',
    language: 'javascript',
    category: 'frontend',
    description: 'React functional component with hooks',
    template: (props) => `import React, { useState, useEffect } from 'react';

interface ${props.componentName}Props {
  title?: string;
  description?: string;
}

const ${props.componentName}: React.FC<${props.componentName}Props> = ({
  title = 'Default Title',
  description = 'Default Description'
}) => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize component
    console.log('${props.componentName} mounted');
  }, []);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="${props.componentName.toLowerCase()}">
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="counter">
        <span>Count: {count}</span>
        <button onClick={handleIncrement}>
          Increment
        </button>
      </div>
      {isLoading && <div>Loading...</div>}
    </div>
  );
};

export default ${props.componentName};`
  },
  api_endpoint: {
    name: 'API Endpoint',
    language: 'javascript',
    category: 'backend',
    description: 'Express REST API endpoint',
    template: (props) => `import { Router } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

/**
 * GET /api/${props.endpoint}
 * @summary Get all ${props.resource}
 * @returns {Array} - List of ${props.resource}
 */
router.get('/', async (req, res) => {
  try {
    // TODO: Implement get all ${props.resource}
    res.json({
      success: true,
      data: [],
      message: 'Get all ${props.resource} endpoint'
    });
  } catch (error) {
    console.error('Error fetching ${props.resource}:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ${props.resource}'
    });
  }
});

/**
 * GET /api/${props.endpoint}/:id
 * @summary Get ${props.resource} by ID
 * @param {string} id.path.required - The ID of the ${props.resource}
 * @returns {Object} - Single ${props.resource} object
 */
router.get('/:id', [
  body('id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    // TODO: Implement get by ID
    res.json({
      success: true,
      data: null,
      message: \`Get \${props.resource} by ID: \${id}\`
    });
  } catch (error) {
    console.error('Error fetching ${props.resource}:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ${props.resource}'
    });
  }
});

/**
 * POST /api/${props.endpoint}
 * @summary Create new ${props.resource}
 * @body {Object} req.body.required - The ${props.resource} data
 */
router.post('/', async (req, res) => {
  try {
    // TODO: Implement create
    res.status(201).json({
      success: true,
      data: null,
      message: 'Create ${props.resource} endpoint'
    });
  } catch (error) {
    console.error('Error creating ${props.resource}:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create ${props.resource}'
    });
  }
});

export default router;`
  },
  dockerfile: {
    name: 'Dockerfile',
    language: 'docker',
    category: 'devops',
    description: 'Production-ready Dockerfile',
    template: (props) => `# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["npm", "start"]
`
  },
  github_actions: {
    name: 'GitHub Actions',
    language: 'yaml',
    category: 'devops',
    description: 'CI/CD pipeline configuration',
    template: (props) => `name: ${props.workflowName}

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build

    - name: Deploy to production
      if: github.ref == 'refs/heads/main'
      run: |
        # TODO: Deploy to your production environment
        echo "Deploying to production..."
      env:
        NODE_ENV: production
        DATABASE_URL: \${{ secrets.DATABASE_URL }}
        OPENAI_API_KEY: \${{ secrets.OPENAI_API_KEY }}
`
  },
  typescript_interface: {
    name: 'TypeScript Interface',
    language: 'typescript',
    category: 'frontend',
    description: 'TypeScript interface with JSDoc',
    template: (props) => `/**
 * ${props.interfaceName}
 * @description Interface definition for ${props.entity}
 */
export interface ${props.interfaceName} {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Created timestamp
   */
  createdAt: Date;
  
  /**
   * Updated timestamp
   */
  updatedAt: Date;
  
  /**
   * Status of the entity
   */
  status: 'active' | 'inactive' | 'pending';
  
  /**
   * Metadata object
   */
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Create interface from object type
 * @template T - Object type to convert
 */
export type Create${props.interfaceName} = Omit<${props.interfaceName}, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Update interface with optional fields
 * @template T - ${props.interfaceName}
 */
export type Update${props.interfaceName} = Partial<${props.interfaceName}>;`
  }
};

// Get all templates
router.get('/templates', async (req, res) => {
  try {
    const templates = Object.values(TEMPLATES).map(template => ({
      id: Object.keys(TEMPLATES).find(key => TEMPLATES[key] === template),
      ...template
    }));

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
});

// Get templates by category
router.get('/templates/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const templates = Object.values(TEMPLATES)
      .filter(t => t.category === category)
      .map(template => ({
        id: Object.keys(TEMPLATES).find(key => TEMPLATES[key] === template),
        ...template
      }));

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
});

// Get templates by language
router.get('/templates/language/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const templates = Object.values(TEMPLATES)
      .filter(t => t.language === language)
      .map(template => ({
        id: Object.keys(TEMPLATES).find(key => TEMPLATES[key] === template),
        ...template
      }));

    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
});

// Generate code from template
router.post('/generate', async (req, res) => {
  try {
    const { templateId, parameters = {} } = req.body;

    const template = TEMPLATES[templateId];
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Cache the result
    const cacheKey = `template:${templateId}:${JSON.stringify(parameters)}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json({ success: true, code: cached });
    }

    // Generate code using template
    const code = template.template(parameters);

    // Cache for 24 hours
    await redisClient.setex(cacheKey, 86400, code);

    res.json({ success: true, code });
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate code' });
  }
});

// Get template details
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = TEMPLATES[id];

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch template' });
  }
});

export default router;
