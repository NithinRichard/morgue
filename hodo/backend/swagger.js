// At the top:
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mortuary Management System API',
            version: '1.0.0',
            description: 'API documentation for the Mortuary Management System',
        },
        servers: [
            {
                url: 'http://192.168.50.126:3001/api',
                description: 'Local server',
            },
        ],
    },
    apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };