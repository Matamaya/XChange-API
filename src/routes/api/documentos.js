const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Documentos
 *   description: Archivos subidos por los usuarios
 */



/**
 * @swagger
 * /documentos:
 *   get:
 *     summary: Obtener todos los documentos
 *     tags: [Documentos]
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_doc:
 *                     type: integer
 *                   id_usuario:
 *                     type: integer
 *                   tipo:
 *                     type: string
 *                   url_archivo:
 *                     type: string
 *                   fecha_upload:
 *                     type: string
 *                     format: date-time
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

// // Ruta para obtener documentos de un usuario
// /**
//  * @swagger
//  * /documentos/usuario/{id_usuario}:
//  *   get:
//  *     summary: Obtener documentos de un usuario
//  *     tags: [Documentos]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id_usuario
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Documentos del usuario
//  *       404:
//  *         description: Usuario no encontrado
//  *       500:
//  *         description: Error del servidor
//  */
// router.get('/usuario/:id_usuario', authenticateToken, (req, res) => {
//   const userId = req.params.id_usuario;
//   db.query('SELECT * FROM documentos WHERE id_usuario = $1', [userId], (err, results) => {
//     if (err) {
//       console.error('Error al obtener documentos del usuario:', err);
//       res.status(500).json({ error: 'Error al obtener documentos del usuario' });
//     } else {
//       res.json({ documentos: results.rows });
//     }
//   });
// });


/**
 * @swagger
 * /documentos/{id_doc}:
 *   get:
 *     summary: Obtener un documento por ID
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id_doc
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Documento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example:
 *               id_doc: 1
 *               id_usuario: 6
 *               tipo: "CV"
 *               url_archivo: "cv_alumno6.pdf"
 *               fecha_upload: "2025-10-26T20:35:39.384Z"
 *       404:
 *         description: Documento no encontrado
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


/**
 * @swagger
 * /documentos:
 *   post:
 *     summary: Subir un nuevo documento
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               tipo:
 *                 type: string
 *               url_archivo:
 *                 type: string
 *             example:
 *               id_usuario: 21
 *               tipo: "CV"
 *               url_archivo: "cv21.pdf"
 *     responses:
 *       201:
 *         description: Documento creado
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
 * /documentos/{id_doc}:
 *   put:
 *     summary: Actualizar un documento existente
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id_doc
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
 *             example:
 *               tipo: "CV"
 *               url_archivo: "cv_actualizado.pdf"
 *     responses:
 *       200:
 *         description: Documento actualizado
 *       400:
 *         description: ID inválido o campos faltantes
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
 * /documentos/{id_doc}:
 *   delete:
 *     summary: Eliminar un documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id_doc
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento eliminado
 *       404:
 *         description: Documento no encontrado
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