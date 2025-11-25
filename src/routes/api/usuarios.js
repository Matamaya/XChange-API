const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

// Ruta para obtener todos los usuarios
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios:', err);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    } else {
      res.json({ usuarios: results.rows });
    }
  });
});

// Ruta para obtener usuarios con información de perfil y rol
/**
 * @swagger
 * /usuarios/completo:
 *   get:
 *     summary: Obtener usuarios con información completa
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios completos
 *       500:
 *         description: Error del servidor
 */
router.get('/completo', authenticateToken, (req, res) => {
  db.query(`
    SELECT u.*, p.nombre, p.apellido1, p.apellido2, p.telefono, 
           p.identificacion, p.email_tutor, p.curso, r.tipo as rol
    FROM usuarios u 
    LEFT JOIN perfiles p ON u.id_usuario = p.id_usuario
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.id_usuario
  `, (err, results) => {
    if (err) {
      console.error('Error al obtener usuarios completos:', err);
      res.status(500).json({ error: 'Error al obtener usuarios completos' });
    } else {
      res.json({ usuarios: results.rows });
    }
  });
});

// Ruta para obtener un usuario por ID
/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM usuarios WHERE id_usuario = $1', [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el usuario:', err);
      res.status(500).json({ error: 'Error al obtener el usuario' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
      } else {
        res.json({ usuario: results.rows[0] });
      }
    }
  });
});

// Ruta para obtener usuario completo con perfil y rol
/**
 * @swagger
 * /usuarios/{id}/completo:
 *   get:
 *     summary: Obtener usuario completo con perfil y rol
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario completo
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/completo', authenticateToken, (req, res) => {
  const userId = req.params.id;
  db.query(`
    SELECT u.*, p.nombre, p.apellido1, p.apellido2, p.telefono, 
           p.identificacion, p.email_tutor, p.curso, r.tipo as rol
    FROM usuarios u 
    LEFT JOIN perfiles p ON u.id_usuario = p.id_usuario
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.id_usuario = $1
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el usuario completo:', err);
      res.status(500).json({ error: 'Error al obtener el usuario completo' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Usuario no encontrado' });
      } else {
        res.json({ usuario: results.rows[0] });
      }
    }
  });
});

// Ruta para crear un usuario
/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - id_rol
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               id_rol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario creado
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { email, password, id_rol } = req.body;
  db.query(
    'INSERT INTO usuarios (email, password, id_rol) VALUES ($1, $2, $3)',
    [email, password, id_rol],
    (err, results) => {
      if (err) {
        console.error('Error al crear el usuario:', err);
        res.status(500).json({ error: 'Error al crear el usuario' });
      } else {
        res.json({ message: 'Usuario creado con éxito', usuario: req.body });
      }
    }
  );
});

// Ruta para actualizar un usuario
/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               id_rol:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  const { email, password, id_rol } = req.body;
  db.query(
    'UPDATE usuarios SET email = $1, password = $2, id_rol = $3 WHERE id_usuario = $4',
    [email, password, id_rol, userId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el usuario:', err);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
      } else {
        res.json({ message: 'Usuario actualizado con éxito', usuario: req.body });
      }
    }
  );
});

// Ruta para eliminar un usuario
/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM usuarios WHERE id_usuario = $1', [userId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el usuario:', err);
      res.status(500).json({ error: 'Error al eliminar el usuario' });
    } else {
      res.json({ message: 'Usuario eliminado con éxito' });
    }
  });
});

module.exports = router;