// Pool configura la conexión a PostgreSQL a diferencia de createConnection
const { Pool } = require('pg');

const db = new Pool({
  host: 'aws-1-eu-north-1.pooler.supabase.com', // session pooler
  user: 'postgres.jleeuizmswmchhrsvrbs',
  password: 'mlmi1234', // ← LA CONTRASEÑA DE BD
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false },

});

module.exports = db;