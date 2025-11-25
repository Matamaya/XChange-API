const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');

// Y modifica todas las rutas para usar el middleware: con authenticateToken

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario
 */

// Ruta para obtener todos los roles
/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM roles ORDER BY id_rol', (err, results) => {
    if (err) {
      console.error('Error al obtener roles:', err);
      res.status(500).json({ error: 'Error al obtener roles' });
    } else {
      res.json({ roles: results.rows });
    }
  });
});

// Ruta para obtener un rol por ID
/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Obtener un rol por ID
 *     tags: [Roles]
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
 *         description: Rol encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rol:
 *                   $ref: '#/components/schemas/Rol'
 *       404:
 *         description: Rol no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateToken, (req, res) => {
  const rolId = req.params.id;
  db.query('SELECT * FROM roles WHERE id_rol = $1', [rolId], (err, results) => {
    if (err) {
      console.error('Error al obtener el rol:', err);
      res.status(500).json({ error: 'Error al obtener el rol' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Rol no encontrado' });
      } else {
        res.json({ rol: results.rows[0] });
      }
    }
  });
});

// Ruta para crear un rol
/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crear un rol
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol creado con éxito
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { tipo } = req.body;
  db.query(
    'INSERT INTO roles (tipo) VALUES ($1)',
    [tipo],
    (err, results) => {
      if (err) {
        console.error('Error al crear el rol:', err);
        res.status(500).json({ error: 'Error al crear el rol' });
      } else {
        res.json({ message: 'Rol creado con éxito', rol: req.body });
      }
    }
  );
});

// Ruta para actualizar un rol
/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
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
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado con éxito
 *       500:
 *         description: Error del servidor
 */

router.put('/:id', authenticateToken, (req, res) => {
  const rolId = req.params.id;
  const { tipo } = req.body;
  db.query(
    'UPDATE roles SET tipo = $1 WHERE id_rol = $2',
    [tipo, rolId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el rol:', err);
        res.status(500).json({ error: 'Error al actualizar el rol' });
      } else {
        res.json({ message: 'Rol actualizado con éxito', rol: req.body });
      }
    }
  );
});

// Ruta para eliminar un rol
/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
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
 *         description: Rol eliminado con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const rolId = req.params.id;
  db.query('DELETE FROM roles WHERE id_rol = $1', [rolId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el rol:', err);
      res.status(500).json({ error: 'Error al eliminar el rol' });
    } else {
      res.json({ message: 'Rol eliminado con éxito' });
    }
  });
});

module.exports = router;