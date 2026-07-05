import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PhoneShim Backend API',
      version: '0.1.0',
      description: 'Backend API documentation for PhoneShim.'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      }
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'NOT_FOUND'
                },
                message: {
                  type: 'string',
                  example: 'Requested resource was not found'
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['src/app.ts', 'src/domains/**/*.ts']
});
