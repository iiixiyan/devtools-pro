import express from 'express';
import { Pool } from 'pg';
import redis from 'redis';

const router = express.Router();
const pool = new Pool();
const redisClient = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

// AI API文档生成
router.post('/generate', async (req, res) => {
  try {
    const { apiDefinition, language = 'javascript' } = req.body;

    if (!apiDefinition || !apiDefinition.name || !apiDefinition.endpoints) {
      return res.status(400).json({ success: false, error: 'API definition is required' });
    }

    // Generate documentation using AI
    const prompt = `Generate comprehensive API documentation for this API:

**API Name:** ${apiDefinition.name}
**Description:** ${apiDefinition.description || 'No description provided'}
**Base URL:** ${apiDefinition.baseURL || '/api/v1'}
**Authentication:** ${apiDefinition.auth || 'None'}

**Endpoints:**
${apiDefinition.endpoints.map((endpoint, index) => `
${index + 1}. ${endpoint.method || 'GET'} ${endpoint.path || '/'}
   - Description: ${endpoint.description || 'No description'}
   - Parameters: ${JSON.stringify(endpoint.parameters || [])}
   - Response: ${JSON.stringify(endpoint.response || {})}
`).join('\n')}

Generate documentation in ${language} with:
- Clear introduction
- Endpoint descriptions
- Request/response examples
- Error handling
- Best practices

Format the output as a Markdown document.`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert API documentation writer.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await completion.json();

    if (!data.choices || !data.choices[0]) {
      throw new Error('Failed to generate documentation');
    }

    const documentation = data.choices[0].message.content;

    // Cache for 1 hour
    const cacheKey = `api-docs:${apiDefinition.name}:${Date.now()}`;
    await redisClient.setex(cacheKey, 3600, documentation);

    res.json({
      success: true,
      documentation,
      format: 'markdown'
    });
  } catch (error) {
    console.error('API docs generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate API documentation'
    });
  }
});

// OpenAPI/Swagger JSON generation
router.post('/swagger', async (req, res) => {
  try {
    const { apiDefinition } = req.body;

    if (!apiDefinition || !apiDefinition.name) {
      return res.status(400).json({ success: false, error: 'API definition is required' });
    }

    const swagger = {
      openapi: '3.0.0',
      info: {
        title: apiDefinition.name,
        version: '1.0.0',
        description: apiDefinition.description || 'API documentation'
      },
      servers: [
        {
          url: apiDefinition.baseURL || 'http://localhost:3000/api/v1',
          description: 'Development server'
        }
      ],
      paths: {},
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string' }
            }
          },
          Success: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    };

    // Add endpoints to swagger
    apiDefinition.endpoints.forEach(endpoint => {
      const path = endpoint.path || '/';
      const method = endpoint.method || 'GET';

      swagger.paths[path] = {
        [method.toLowerCase()]: {
          summary: endpoint.description,
          tags: [apiDefinition.name],
          parameters: endpoint.parameters || [],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      { type: 'object', properties: { data: endpoint.response || {} } }
                    ]
                  }
                }
              }
            },
            '400': {
              description: 'Bad Request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '500': {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      };
    });

    res.json({
      success: true,
      swagger,
      format: 'openapi'
    });
  } catch (error) {
    console.error('Swagger generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate Swagger definition' });
  }
});

// Generate postman collection
router.post('/postman', async (req, res) => {
  try {
    const { apiDefinition } = req.body;

    if (!apiDefinition || !apiDefinition.name) {
      return res.status(400).json({ success: false, error: 'API definition is required' });
    }

    const postmanCollection = {
      info: {
        name: apiDefinition.name,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      variable: [
        { key: 'baseUrl', value: apiDefinition.baseURL || 'http://localhost:3000/api/v1' }
      ],
      item: []
    };

    // Add endpoints to postman collection
    apiDefinition.endpoints.forEach(endpoint => {
      const path = endpoint.path || '/';
      const method = (endpoint.method || 'GET').toLowerCase();
      const item = {
        name: `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: [
            {
              key: 'Content-Type',
              value: 'application/json'
            },
            ...(endpoint.auth ? [{
              key: 'Authorization',
              value: endpoint.auth
            }] : [])
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({
              description: endpoint.description,
              parameters: endpoint.parameters || {}
            }, null, 2)
          },
          url: {
            raw: '{{baseUrl}}' + path,
            host: ['{{baseUrl}}'],
            path: path.split('/').filter(Boolean)
          },
          response: []
        }
      };

      postmanCollection.item.push(item);
    });

    res.json({
      success: true,
      postmanCollection,
      format: 'postman'
    });
  } catch (error) {
    console.error('Postman generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate Postman collection' });
  }
});

// HTML documentation generation
router.post('/html', async (req, res) => {
  try {
    const { apiDefinition } = req.body;

    if (!apiDefinition || !apiDefinition.name) {
      return res.status(400).json({ success: false, error: 'API definition is required' });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${apiDefinition.name} - API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        h3 { color: #666; margin-top: 20px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
        .method { display: inline-block; padding: 3px 8px; border-radius: 3px; font-weight: bold; margin-right: 10px; }
        .get { background: #28a745; color: white; }
        .post { background: #17a2b8; color: white; }
        .put { background: #ffc107; color: #333; }
        .delete { background: #dc3545; color: white; }
        .parameter { margin: 5px 0; }
        code { background: #e9ecef; padding: 2px 5px; border-radius: 3px; font-family: 'Courier New', monospace; }
    </style>
</head>
<body>
    <h1>${apiDefinition.name}</h1>
    <p>${apiDefinition.description || 'No description'}</p>
    <h2>Endpoints</h2>
    ${apiDefinition.endpoints.map(endpoint => `
        <div class="endpoint">
            <h3>
                <span class="method ${endpoint.method?.toLowerCase() || 'get'}">${(endpoint.method || 'GET').toUpperCase()}</span>
                <code>${apiDefinition.baseURL || '/api/v1'}${endpoint.path || '/'}</code>
            </h3>
            <p>${endpoint.description || 'No description'}</p>
            <h4>Parameters:</h4>
            ${endpoint.parameters?.map(param => `
                <div class="parameter">
                    <strong>${param.name}</strong> (${param.type}) - ${param.required ? 'Required' : 'Optional'}
                </div>
            `).join('') || '<p>No parameters</p>'}
        </div>
    `).join('')}
</body>
</html>`;

    res.json({
      success: true,
      html,
      format: 'html'
    });
  } catch (error) {
    console.error('HTML generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate HTML documentation' });
  }
});

export default router;
