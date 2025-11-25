const swaggerJsdoc = require('swagger-jsdoc');

// Config Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Erasmus - XChange',
      version: '1.0.0',
      description: 'API con autenticación JWT'
    },
    tags: [
      { name: 'Usuarios', description: 'Gestión de usuarios' },
      { name: 'Perfiles', description: 'Gestión de perfiles de usuario' },
      { name: 'Roles', description: 'Gestión de roles de usuario' },
      { name: 'Países', description: 'Gestión de países' },
      { name: 'Ofertas', description: 'Gestión de ofertas de intercambio' },
      { name: 'Documentos', description: 'Gestión de documentos de usuarios' },
      { name: 'Solicitudes', description: 'Gestión de solicitudes de intercambio' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id_usuario: { type: 'integer' },
            email: { type: 'string' },
            password: { type: 'string' },
            id_rol: { type: 'integer' }
          }
        },
        Perfil: {
          type: 'object',
          properties: {
            id_perfil: { type: 'integer' },
            id_usuario: { type: 'integer' },
            nombre: { type: 'string' },
            apellido1: { type: 'string' },
            apellido2: { type: 'string' },
            telefono: { type: 'string' },
            identificacion: { type: 'string' },
            email_tutor: { type: 'string' },
            curso: { type: 'string' }
          }
        },
        Rol: {
          type: 'object',
          properties: {
            id_rol: { type: 'integer' },
            tipo: { type: 'string' }
          }
        },
        Pais: {
          type: 'object',
          properties: {
            id_pais: { type: 'integer' },
            nombre: { type: 'string' }
          }
        },
        Oferta: {
          type: 'object',
          properties: {
            id_oferta: { type: 'integer' },
            nombre: { type: 'string' },
            description: { type: 'string' },
            id_pais: { type: 'integer' },
            empresa: { type: 'string' },
            duracion_meses: { type: 'integer' }
          }
        },
        Documento: {
          type: 'object',
          properties: {
            id_doc: { type: 'integer' },
            id_usuario: { type: 'integer' },
            tipo: { type: 'string' },
            url_archivo: { type: 'string' }
          }
        },
        Solicitud: {
          type: 'object',
          properties: {
            id_solicitud: { type: 'integer' },
            id_usuario: { type: 'integer' },
            id_oferta: { type: 'integer' },
            estado: { type: 'string' },
            fecha_solicitud: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/services/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = swaggerSpec;