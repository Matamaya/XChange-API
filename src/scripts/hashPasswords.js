// scripts/hashPasswords.js - Para hashear contraseñas
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function hashExistingPasswords() {
  try {
    console.log('Hasheando contraseñas existentes...');
    
    // Obtener todos los usuarios
    const result = await db.query('SELECT id_usuario, password FROM usuarios');
    
    for (const user of result.rows) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await db.query(
        'UPDATE usuarios SET password = $1 WHERE id_usuario = $2',
        [hashedPassword, user.id_usuario]
      );
      
      console.log(`La password de Usuario ${user.id_usuario} actualizado`);
    }
    
    console.log('Todas las contraseñas hasheadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashExistingPasswords();