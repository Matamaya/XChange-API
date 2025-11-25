// src/routes/auth.js - Login con tokenJWT

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const { generateAccessToken } = require('../../config/jwt');

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
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
      `SELECT u.id_usuario, u.email, u.password, u.id_rol, r.tipo as rol_nombre
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id_rol 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // 2. Verificar contraseña (asumiendo que está hasheada)
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
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

  // Mantén tus rutas de prueba existentes
  router.get('/test-generate', (req, res) => {
    // ... tu código actual
  });

  router.post('/test-verify', (req, res) => {
    // ... tu código actual
  });

  router.get('/test-protected', authenticateToken, (req, res) => {
    // ... tu código actual
  });
  
});

module.exports = router;