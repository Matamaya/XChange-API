const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
/**
 * @swagger
 * tags:
 *   name: Perfiles
 *   description: Gestión de perfiles de usuario
 */


// Ruta para obtener todos los perfiles
/**
 * @swagger
 * /perfiles:
 *   get:
 *     summary: Obtener todos los perfiles
 *     tags: [Perfiles]
 *     responses:
 *       200:
 *         description: Lista de perfiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfiles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Perfil'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM perfiles', (err, results) => {
    if (err) {
      console.error('Error al obtener perfiles:', err);
      res.status(500).json({ error: 'Error al obtener perfiles' });
    } else {
      res.json({ perfiles: results.rows });
    }
  });
});

// Ruta para obtener perfil de un usuario
/**
 * @swagger
 * /perfiles/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener perfil de un usuario
 *     tags: [Perfiles]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 perfil:
 *                   $ref: '#/components/schemas/Perfil'
 *       404:
 *         description: Perfil no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  db.query('SELECT * FROM perfiles WHERE id_usuario = $1', [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el perfil:', err);
      res.status(500).json({ error: 'Error al obtener el perfil' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Perfil no encontrado' });
      } else {
        res.json({ perfil: results.rows[0] });
      }
    }
  });
});

// Ruta para obtener perfil completo con información de usuario
/**
 * @swagger
 * /perfiles/completo/{id_usuario}:
 *   get:
 *     summary: Obtener perfil completo con información de usuario
 *     tags: [Perfiles]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil completo encontrado
 *       404:
 *         description: Perfil no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/completo/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  db.query(`
    SELECT p.*, u.email, u.id_rol, r.tipo as rol
    FROM perfiles p 
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN roles r ON u.id_rol = r.id_rol
    WHERE p.id_usuario = $1
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el perfil completo:', err);
      res.status(500).json({ error: 'Error al obtener el perfil completo' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Perfil no encontrado' });
      } else {
        res.json({ perfil: results.rows[0] });
      }
    }
  });
});

// Ruta para crear un perfil
/**
 * @swagger
 * /perfiles:
 *   post:
 *     summary: Crear un perfil
 *     tags: [Perfiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - nombre
 *               - apellido1
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               apellido1:
 *                 type: string
 *               apellido2:
 *                 type: string
 *               telefono:
 *                 type: string
 *               identificacion:
 *                 type: string
 *               email_tutor:
 *                 type: string
 *               curso:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil creado con éxito
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { id_usuario, nombre, apellido1, apellido2, telefono, identificacion, email_tutor, curso } = req.body;
  db.query(
    `INSERT INTO perfiles (id_usuario, nombre, apellido1, apellido2, telefono, identificacion, email_tutor, curso) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id_usuario, nombre, apellido1, apellido2, telefono, identificacion, email_tutor, curso],
    (err, results) => {
      if (err) {
        console.error('Error al crear el perfil:', err);
        res.status(500).json({ error: 'Error al crear el perfil' });
      } else {
        res.json({ message: 'Perfil creado con éxito', perfil: req.body });
      }
    }
  );
});

// Ruta para actualizar un perfil
/**
 * @swagger
 * /perfiles/usuario/{id_usuario}:
 *   put:
 *     summary: Actualizar un perfil
 *     tags: [Perfiles]
 *     parameters:
 *       - in: path
 *         name: id_usuario
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
 *               nombre:
 *                 type: string
 *               apellido1:
 *                 type: string
 *               apellido2:
 *                 type: string
 *               telefono:
 *                 type: string
 *               identificacion:
 *                 type: string
 *               email_tutor:
 *                 type: string
 *               curso:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado con éxito
 *       500:
 *         description: Error del servidor
 */
router.put('/usuario/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  const { nombre, apellido1, apellido2, telefono, identificacion, email_tutor, curso } = req.body;
  db.query(
    `UPDATE perfiles 
     SET nombre = $1, apellido1 = $2, apellido2 = $3, telefono = $4, 
         identificacion = $5, email_tutor = $6, curso = $7 
     WHERE id_usuario = $8`,
    [nombre, apellido1, apellido2, telefono, identificacion, email_tutor, curso, userId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el perfil:', err);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
      } else {
        res.json({ message: 'Perfil actualizado con éxito', perfil: req.body });
      }
    }
  );
});

// Ruta para eliminar un perfil
/**
 * @swagger
 * /perfiles/usuario/{id_usuario}:
 *   delete:
 *     summary: Eliminar un perfil
 *     tags: [Perfiles]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Perfil eliminado con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/usuario/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  db.query('DELETE FROM perfiles WHERE id_usuario = $1', [userId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el perfil:', err);
      res.status(500).json({ error: 'Error al eliminar el perfil' });
    } else {
      res.json({ message: 'Perfil eliminado con éxito' });
    }
  });
});

module.exports = router;