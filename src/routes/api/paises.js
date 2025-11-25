const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Países
 *   description: Gestión de países
 */

// Ruta para obtener todos los países
/**
 * @swagger
 * /paises:
 *   get:
 *     summary: Obtener todos los países
 *     tags: [Países]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de países
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paises:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pais'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM paises ORDER BY nombre', (err, results) => {
    if (err) {
      console.error('Error al obtener países:', err);
      res.status(500).json({ error: 'Error al obtener países' });
    } else {
      res.json({ paises: results.rows });
    }
  });
});

// Ruta para obtener un país por ID
/**
 * @swagger
 * /paises/{id}:
 *   get:
 *     summary: Obtener un país por ID
 *     tags: [Países]
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
 *         description: País encontrado
 *       404:
 *         description: País no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateToken, (req, res) => {
  const paisId = req.params.id;
  db.query('SELECT * FROM paises WHERE id_pais = $1', [paisId], (err, results) => {
    if (err) {
      console.error('Error al obtener el país:', err);
      res.status(500).json({ error: 'Error al obtener el país' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'País no encontrado' });
      } else {
        res.json({ pais: results.rows[0] });
      }
    }
  });
});

// Ruta para crear un país
/**
 * @swagger
 * /paises:
 *   post:
 *     summary: Crear un país
 *     tags: [Países]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: País creado
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { nombre } = req.body;
  db.query(
    'INSERT INTO paises (nombre) VALUES ($1)',
    [nombre],
    (err, results) => {
      if (err) {
        console.error('Error al crear el país:', err);
        res.status(500).json({ error: 'Error al crear el país' });
      } else {
        res.json({ message: 'País creado con éxito', pais: req.body });
      }
    }
  );
});

// Ruta para actualizar un país
/**
 * @swagger
 * /paises/{id}:
 *   put:
 *     summary: Actualizar un país
 *     tags: [Países]
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
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: País actualizado con éxito
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', authenticateToken, (req, res) => {
  const paisId = req.params.id;
  const { nombre } = req.body;
  db.query(
    'UPDATE paises SET nombre = $1 WHERE id_pais = $2',
    [nombre, paisId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el país:', err);
        res.status(500).json({ error: 'Error al actualizar el país' });
      } else {
        res.json({ message: 'País actualizado con éxito', pais: req.body });
      }
    }
  );
});

// Ruta para eliminar un país
/**
 * @swagger
 * /paises/{id}:
 *   delete:
 *     summary: Eliminar un país
 *     tags: [Países]
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
 *         description: País eliminado con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const paisId = req.params.id;
  db.query('DELETE FROM paises WHERE id_pais = $1', [paisId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el país:', err);
      res.status(500).json({ error: 'Error al eliminar el país' });
    } else {
      res.json({ message: 'País eliminado con éxito' });
    }
  });
});

module.exports = router;