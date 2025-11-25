const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes de intercambio
 */

// Ruta para obtener todas las solicitudes
/**
 * @swagger
 * /solicitudes:
 *   get:
 *     summary: Obtener todas las solicitudes
 *     tags: [Solicitudes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 solicitudes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Solicitud'
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM solicitudes ORDER BY fecha_solicitud DESC', (err, results) => {
    if (err) {
      console.error('Error al obtener solicitudes:', err);
      res.status(500).json({ error: 'Error al obtener solicitudes' });
    } else {
      res.json({ solicitudes: results.rows });
    }
  });
});

// Ruta para obtener solicitudes completas con información de usuario y oferta
/**
 * @swagger
 * /solicitudes/completo:
 *   get:
 *     summary: Obtener solicitudes con información completa
 *     tags: [Solicitudes]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Solicitudes completas
 *       500:
 *         description: Error del servidor
 */
router.get('/completo', authenticateToken, (req, res) => {
  db.query(`
    SELECT s.*, u.email, o.nombre as oferta_nombre, p.nombre as pais_nombre
    FROM solicitudes s
    JOIN usuarios u ON s.id_usuario = u.id_usuario
    JOIN ofertas o ON s.id_oferta = o.id_oferta
    JOIN paises p ON o.id_pais = p.id_pais
    ORDER BY s.fecha_solicitud DESC
  `, (err, results) => {
    if (err) {
      console.error('Error al obtener solicitudes completas:', err);
      res.status(500).json({ error: 'Error al obtener solicitudes completas' });
    } else {
      res.json({ solicitudes: results.rows });
    }
  });
});

// Ruta para obtener una solicitud por ID
/**
 * @swagger
 * /solicitudes/{id}:
 *   get:
 *     summary: Obtener una solicitud por ID
 *     tags: [Solicitudes]
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
 *         description: Solicitud encontrada
 *       404:
 *         description: Solicitud no encontrada
 *       500:
 *         description: Error del servidor
 */

router.get('/:id', authenticateToken, (req, res) => {
  const solicitudId = req.params.id;
  db.query('SELECT * FROM solicitudes WHERE id_solicitud = $1', [solicitudId], (err, results) => {
    if (err) {
      console.error('Error al obtener la solicitud:', err);
      res.status(500).json({ error: 'Error al obtener la solicitud' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Solicitud no encontrada' });
      } else {
        res.json({ solicitud: results.rows[0] });
      }
    }
  });
});

// Ruta para obtener solicitudes de un usuario
/**
 * @swagger
 * /solicitudes/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener solicitudes de un usuario
 *     tags: [Solicitudes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitudes del usuario
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  db.query(`
    SELECT s.*, o.nombre as oferta_nombre, p.nombre as pais_nombre
    FROM solicitudes s
    JOIN ofertas o ON s.id_oferta = o.id_oferta
    JOIN paises p ON o.id_pais = p.id_pais
    WHERE s.id_usuario = $1
    ORDER BY s.fecha_solicitud DESC
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener solicitudes del usuario:', err);
      res.status(500).json({ error: 'Error al obtener solicitudes del usuario' });
    } else {
      res.json({ solicitudes: results.rows });
    }
  });
});

// Ruta para crear una solicitud
/**
 * @swagger
 * /solicitudes:
 *   post:
 *     summary: Crear una solicitud
 *     tags: [Solicitudes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - id_oferta
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               id_oferta:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Solicitud creada
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { id_usuario, id_oferta } = req.body;
  db.query(
    'INSERT INTO solicitudes (id_usuario, id_oferta) VALUES ($1, $2)',
    [id_usuario, id_oferta],
    (err, results) => {
      if (err) {
        console.error('Error al crear la solicitud:', err);
        res.status(500).json({ error: 'Error al crear la solicitud' });
      } else {
        res.json({ message: 'Solicitud creada con éxito', solicitud: req.body });
      }
    }
  );
});


// Ruta para actualizar el estado de una solicitud
/**
 * @swagger
 * /solicitudes/{id}/estado:
 *   put:
 *     summary: Actualizar estado de una solicitud
 *     tags: [Solicitudes]
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
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/estado', authenticateToken, (req, res) => {
  const solicitudId = req.params.id;
  const { estado } = req.body;
  db.query(
    'UPDATE solicitudes SET estado = $1 WHERE id_solicitud = $2',
    [estado, solicitudId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el estado de la solicitud:', err);
        res.status(500).json({ error: 'Error al actualizar el estado de la solicitud' });
      } else {
        res.json({ message: 'Estado de solicitud actualizado con éxito', estado: estado });
      }
    }
  );
});

// Ruta para actualizar una solicitud
/**
 * @swagger
 * /solicitudes/{id}:
 *   put:
 *     summary: Actualizar una solicitud
 *     tags: [Solicitudes]
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
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aprobado, rechazado]
 *     responses:
 *       200:
 *         description: Solicitud actualizada
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const solicitudId = req.params.id;
  const { estado } = req.body;

  // Validar estado
  const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado'];
  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const result = await db.query(
      'UPDATE solicitudes SET estado = $1 WHERE id_solicitud = $2 RETURNING *',
      [estado, solicitudId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    res.json({ 
      message: 'Solicitud actualizada', 
      solicitud: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para eliminar una solicitud
/**
 * @swagger
 * /solicitudes/{id}:
 *   delete:
 *     summary: Eliminar una solicitud
 *     tags: [Solicitudes]
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
 *         description: Solicitud eliminada con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const solicitudId = req.params.id;
  db.query('DELETE FROM solicitudes WHERE id_solicitud = $1', [solicitudId], (err, results) => {
    if (err) {
      console.error('Error al eliminar la solicitud:', err);
      res.status(500).json({ error: 'Error al eliminar la solicitud' });
    } else {
      res.json({ message: 'Solicitud eliminada con éxito' });
    }
  });
});

module.exports = router;