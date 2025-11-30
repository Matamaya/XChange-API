TODO: verificar todos los require tengan bien las rutas

npm install
npm init -y
npm install express pg jsonwebtoken bcryptjs cors dotenv swagger-jsdoc swagger-ui-express


-------------------------------------------------------------------------------------
Logica de coneccion a la BD y creacion de endpoints basicos

es lo mismo mi viejo index.js que el nuevo app.js ?? Para iniciar la API y sus rutas

- En /config/database.js

Esta la conexión con la BD montada en Supabase con sus respectivas credenciales

- en /api 

estan las endpoints de las tablas con las opciones del CRUD

al final me he decido por implementar tanto las routes como el controller
en el mismo archivo de las endpoints y no por separado. Nos evita problemas de 
modulacion innecesaria.

se importa Router de js para que funcionen


-------------------------------------------------------------------------------------

Logica de la Token JWT para securizar los endpoints

Instala: npm install bcryptjs

- En JWT.js

estan las funciones que crean el token JWT y lo verifican

- Middleware/auth.js 

Proceso que Autentica la token

- en AuthRoutes.js
const { generateAccessToken } = require('../../config/jwt');

Creamos el login, verificamos la contraseña (deberia estar hasheada) y creamos el token

- hashPasswords.js
Archivo encargado de hashear todas las passwords de los usuarios

Ejecuta: node scripts/hashPasswords.js - TODO: no lo he hecho

-------------------------------------------------------------------------------------

Logica para implementar el swagger

añadimos la config del swagger en la app.js
añadimos la ruta api-docs
documentamos todos los endpoints (reales) con swagger

-------------------------------------------------------------------------------------

Logica para implementar OAuth

1. Primero necesitas registrar tu app en GitHub:
Ve a GitHub Settings > Developer settings > OAuth Apps
"New OAuth App"

2. Actualiza tu .env con las nuevas claves TODO: verificar que esten todas

3. Crea/actualiza routes/auth/github.js

4. Añade la ruta en app.js -> app.get('/auth/success')

-------------------------------------------------------------------------------------

#TODO: INICIAR EL FLUJO CON UN USER SIN HASEHAR, LUEGO PROBARLO HASHEADO Y DESPUES EL OAUTH CON GITHUB

Flujo completo:

Usuario hace login con GitHub

GitHub devuelve datos del usuario
Tu función busca/crea el usuario en tu BD de Supabase

Generas JWT con los datos de tu BD
El usuario accede a tu API con ese JWT


Sobre el acceso: Cualquier usuario que esté en tu tabla usuarios (de prueba o real) podrá acceder via login normal (email/password) O GitHub OAuth (se crea automáticamente en tu BD). Los usuarios de prueba ya funcionan, los de GitHub se crearán al hacer login por primera vez.

¡¡¡OJO!!! No ejecutes el hash todavía - primero prueba el login con las passwords en texto plano. 

Inicia la app (npm run dev) y prueba el endpoint /auth/login con los usuarios de prueba. 
El JWT se genera cuando haces POST a /auth/login con email/password correctos - la respuesta incluye el token que usas en el header

para iniciar la api: node app.js