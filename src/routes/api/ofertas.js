const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Ofertas
 *   description: Gestión de ofertas de intercambio
 */

// Ruta para obtener todas las ofertas
/**
 * @swagger
 * /ofertas:
 *   get:
 *     summary: Obtener todas las ofertas
 *     tags: [Ofertas]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ofertas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ofertas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Oferta'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM ofertas', (err, results) => {
    if (err) {
      console.error('Error al obtener ofertas:', err);
      res.status(500).json({ error: 'Error al obtener ofertas' });
    } else {
      res.json({ ofertas: results.rows });
    }
  });
});

// Ruta para obtener una oferta por ID
/**
 * @swagger
 * /ofertas/{id}:
 *   get:
 *     summary: Obtener una oferta por ID
 *     tags: [Ofertas]
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
 *         description: Oferta encontrada
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateToken, (req, res) => {
  const ofertaId = req.params.id;
  db.query('SELECT * FROM ofertas WHERE id_oferta = $1', [ofertaId], (err, results) => {
    if (err) {
      console.error('Error al obtener la oferta:', err);
      res.status(500).json({ error: 'Error al obtener la oferta' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Oferta no encontrada' });
      } else {
        res.json({ oferta: results.rows[0] });
      }
    }
  });
});

// Ruta para crear una oferta
/**
 * @swagger
 * /ofertas:
 *   post:
 *     summary: Crear una oferta
 *     tags: [Ofertas]
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
 *               - description
 *               - id_pais
 *               - empresa
 *               - duracion_meses
 *             properties:
 *               nombre:
 *                 type: string
 *               description:
 *                 type: string
 *               id_pais:
 *                 type: integer
 *               empresa:
 *                 type: string
 *               duracion_meses:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Oferta creada
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { nombre, description, id_pais, empresa, duracion_meses } = req.body;
  db.query(
    'INSERT INTO ofertas (nombre, description, id_pais, empresa, duracion_meses) VALUES ($1, $2, $3, $4, $5)',
    [nombre, description, id_pais, empresa, duracion_meses],
    (err, results) => {
      if (err) {
        console.error('Error al crear la oferta:', err);
        res.status(500).json({ error: 'Error al crear la oferta' });
      } else {
        res.json({ message: 'Oferta creada con éxito', oferta: req.body });
      }
    }
  );
});

// Ruta para actualizar una oferta
/**
 * @swagger
 * /ofertas/{id}:
 *   put:
 *     summary: Actualizar una oferta
 *     tags: [Ofertas]
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
 *               nombre:
 *                 type: string
 *               description:
 *                 type: string
 *               id_pais:
 *                 type: integer
 *               empresa:
 *                 type: string
 *               duracion_meses:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Oferta actualizada con éxito
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', authenticateToken, (req, res) => {
  const ofertaId = req.params.id;
  const { nombre, description, id_pais, empresa, duracion_meses } = req.body;
  db.query(
    'UPDATE ofertas SET nombre = $1, description = $2, id_pais = $3, empresa = $4, duracion_meses = $5 WHERE id_oferta = $6',
    [nombre, description, id_pais, empresa, duracion_meses, ofertaId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar la oferta:', err);
        res.status(500).json({ error: 'Error al actualizar la oferta' });
      } else {
        res.json({ message: 'Oferta actualizada con éxito', oferta: req.body });
      }
    }
  );
});

// Ruta para eliminar una oferta
/**
 * @swagger
 * /ofertas/{id}:
 *   delete:
 *     summary: Eliminar una oferta
 *     tags: [Ofertas]
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
 *         description: Oferta eliminada con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const ofertaId = req.params.id;
  db.query('DELETE FROM ofertas WHERE id_oferta = $1', [ofertaId], (err, results) => {
    if (err) {
      console.error('Error al eliminar la oferta:', err);
      res.status(500).json({ error: 'Error al eliminar la oferta' });
    } else {
      res.json({ message: 'Oferta eliminada con éxito' });
    }
  });
});

module.exports = router;