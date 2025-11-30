// src/routes/auth.js - Login con tokenJWT

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const { generateAccessToken } = require('../../config/jwt');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validaciones básicas
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  try {
    // 1. Buscar usuario en BD
    const result = await db.query(
      `SELECT id_usuario, email, password, id_rol
        FROM Usuarios 
        WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // 2. Verificar contraseña (asumiendo que está hasheada)
    //const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = (password === user.password)

    if (!validPassword) {
      return res.status(401).json({
        error: 'Contraseña inválidas'
      });
    }

    // 3. Generar token
    const tokenPayload = {
      sub: user.id_usuario,
      email: user.email,
      role: user.id_rol,
      role_name: user.rol_nombre
    };

    const token = generateAccessToken(tokenPayload);

    // 4. Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id_usuario,
        email: user.email,
        role: user.id_rol,
        role_name: user.rol_nombre
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }


});

router.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});

router.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:3000;"
  );
  next();
});

module.exports = router;