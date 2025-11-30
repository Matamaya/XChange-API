const swaggerJsDoc = require('swagger-jsdoc');
const path = require('path'); 

// Config Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Erasmus - XChange',
      version: '1.0.0',
      description: 'API con autenticación JWT y OAuth'
    }
  },
  apis: [path.join(process.cwd(), 'routes/api/*.js')],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;