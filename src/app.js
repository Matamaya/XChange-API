const express = require('express');
const app = express();
const port = 3000;
const db = require('./config/database');

const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth/authRoutes');
const githubAuthRoutes = require('./routes/auth/github');

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./routes/docs/swagger');

// Middleware
app.use(express.json());
app.use(express.static('public')); 

// RUTAS DE AUTH - No son funcionales?
app.use('/auth', authRoutes);
app.use('/auth/github', githubAuthRoutes);

// RUTA DOCS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta principal mejorada
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'login.html'));
});

// Ruta de verificación de token
app.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Token válido',
    user: req.user 
  });
});

// Ruta para servir el dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dashboard.html'));
});

// RUTAS de la bd
app.use('/usuarios', require('./routes/api/usuarios'));
app.use('/documentos', require('./routes/api/documentos'));
app.use('/ofertas', require('./routes/api/ofertas'));
app.use('/paises', require('./routes/api/paises'));
app.use('/perfiles', require('./routes/api/perfiles'));
app.use('/solicitudes', require('./routes/api/solicitudes')); 
app.use('/roles', require('./routes/api/roles'));


app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
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