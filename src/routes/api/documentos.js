const express = require('express');
const router = express.Router();
const db = require('../db/connection');

const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Documentos
 *   description: Gestión de documentos de usuarios
 */

// Ruta para obtener todos los documentos
/**
 * @swagger
 * /documentos:
 *   get:
 *     summary: Obtener todos los documentos
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Documento'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM documentos', (err, results) => {
    if (err) {
      console.error('Error al obtener documentos:', err);
      res.status(500).json({ error: 'Error al obtener documentos' });
    } else {
      res.json({ documentos: results.rows });
    }
  });
});

// Ruta para obtener documentos de un usuario
/**
 * @swagger
 * /documentos/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener documentos de un usuario
 *     tags: [Documentos]
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
 *         description: Documentos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:id_usuario', authenticateToken, (req, res) => {
  const userId = req.params.id_usuario;
  db.query('SELECT * FROM documentos WHERE id_usuario = $1', [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener documentos del usuario:', err);
      res.status(500).json({ error: 'Error al obtener documentos del usuario' });
    } else {
      res.json({ documentos: results.rows });
    }
  });
});

// Ruta para obtener un documento por ID
/**
 * @swagger
 * /documentos/usuario/{id_usuario}:
 *   get:
 *     summary: Obtener documentos de un usuario
 *     tags: [Documentos]
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
 *         description: Documentos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authenticateToken, (req, res) => {
  const docId = req.params.id;
  db.query('SELECT * FROM documentos WHERE id_doc = $1', [docId], (err, results) => {
    if (err) {
      console.error('Error al obtener el documento:', err);
      res.status(500).json({ error: 'Error al obtener el documento' });
    } else {
      if (results.rows.length === 0) {
        res.status(404).json({ message: 'Documento no encontrado' });
      } else {
        res.json({ documento: results.rows[0] });
      }
    }
  });
});

// Ruta para crear un documento
/**
 * @swagger
 * /documentos:
 *   post:
 *     summary: Crear un documento
 *     tags: [Documentos]
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
 *               - tipo
 *               - url_archivo
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               url_archivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento creado
 *       500:
 *         description: Error del servidor
 */
router.post('/', authenticateToken, (req, res) => {
  const { id_usuario, tipo, url_archivo } = req.body;
  db.query(
    'INSERT INTO documentos (id_usuario, tipo, url_archivo) VALUES ($1, $2, $3)',
    [id_usuario, tipo, url_archivo],
    (err, results) => {
      if (err) {
        console.error('Error al crear el documento:', err);
        res.status(500).json({ error: 'Error al crear el documento' });
      } else {
        res.json({ message: 'Documento creado con éxito', documento: req.body });
      }
    }
  );
});


// Ruta para actualizar un documento
/**
 * @swagger
 * /documentos/{id}:
 *   put:
 *     summary: Actualizar un documento
 *     tags: [Documentos]
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
 *               tipo:
 *                 type: string
 *               url_archivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento actualizado con éxito
 *       500:
 *         description: Error del servidor
 */

router.put('/:id', authenticateToken, (req, res) => {
  const docId = req.params.id;
  const { tipo, url_archivo } = req.body;
  db.query(
    'UPDATE documentos SET tipo = $1, url_archivo = $2 WHERE id_doc = $3',
    [tipo, url_archivo, docId],
    (err, results) => {
      if (err) {
        console.error('Error al actualizar el documento:', err);
        res.status(500).json({ error: 'Error al actualizar el documento' });
      } else {
        res.json({ message: 'Documento actualizado con éxito', documento: req.body });
      }
    }
  );
});

// Ruta para eliminar un documento
/**
 * @swagger
 * /documentos/{id}:
 *   delete:
 *     summary: Eliminar un documento
 *     tags: [Documentos]
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
 *         description: Documento eliminado con éxito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const docId = req.params.id;
  db.query('DELETE FROM documentos WHERE id_doc = $1', [docId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el documento:', err);
      res.status(500).json({ error: 'Error al eliminar el documento' });
    } else {
      res.json({ message: 'Documento eliminado con éxito' });
    }
  });
});

module.exports = router;