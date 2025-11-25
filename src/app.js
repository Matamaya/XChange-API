const express = require('express');
const app = express();
const port = 3000;
const db = require('./db/connection');

const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const githubAuthRoutes = require('./routes/auth/github');

const swaggerSpec = require('./routes/docs/swagger');
const swaggerUi = require('swagger-ui-express');


// Middleware
app.use(express.json());

// TUS RUTAS EXISTENTES
app.use('/usuarios', require('./users/user.routes'));
app.use('/documentos', require('./services/documentos'));
app.use('/ofertas', require('./services/ofertas'));
app.use('/paises', require('./services/paises'));
app.use('/perfiles', require('./services/perfiles'));
app.use('/solicitudes', require('./services/solicitudes')); 
app.use('/roles', require('./services/roles'));

// NUEVAS RUTAS DE AUTH
// Después de app.use(express.json());
app.use('/auth', authRoutes);
app.use('/auth/github', githubAuthRoutes);


// NUEVA RUTA DOCS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// Ruta de éxito para redirección Oauth
app.get('/auth/success', (req, res) => {
  const token = req.query.token;
  res.json({
    success: true,
    message: 'Autenticación con GitHub exitosa',
    token: token
  });
});

// Conexión BD y servidor (mantén tu código actual)
db.connect()
  .then((client) => {
    console.log('✅ Conectado a PostgreSQL en Supabase');
    client.release();
    app.listen(port, () => {
      console.log(`🚀 Servidor en http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    process.exit(1);
  });