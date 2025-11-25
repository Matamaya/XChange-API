const express = require('express');
const app = express();
const port = 3000;
const db = require('./config/database');
const path = require('path'); // ← AÑADE ESTA LÍNEA


const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth/authRoutes');
const githubAuthRoutes = require('./routes/auth/github');

const swaggerSpec = require('./routes/docs/swagger');
const swaggerUi = require('swagger-ui-express');


// Middleware
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos


// NUEVAS RUTAS DE AUTH
app.use('/auth', authRoutes);
app.use('/auth/github', githubAuthRoutes);


// NUEVA RUTA DOCS
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dashboard.html'));
});

// TUS RUTAS EXISTENTES
app.use('/usuarios', require('./routes/api/usuarios'));
app.use('/documentos', require('./routes/api/documentos'));
app.use('/ofertas', require('./routes/api/ofertas'));
app.use('/paises', require('./routes/api/paises'));
app.use('/perfiles', require('./routes/api/perfiles'));
app.use('/solicitudes', require('./routes/api/solicitudes')); 
app.use('/roles', require('./routes/api/roles'));



// Ruta de éxito para redirección Oauth
app.get('/auth/success', (req, res) => {
  const token = req.query.token;
  res.json({
    success: true,
    message: 'Autenticación con GitHub exitosa',
    token: token
  });
});


// Elimina o comenta esto:
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