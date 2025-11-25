const express = require('express');
const router = express.Router();
const { generateAccessToken } = require('../../config/jwt');

// Ruta para iniciar flujo OAuth
router.get('/', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/auth/github/callback';
    const scope = 'user:email';

    const githubAuthUrl = `https://github.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

    res.redirect(githubAuthUrl);
});

// Callback de GitHub
router.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ error: 'Código de autorización no recibido' });
        }

        // 1. Intercambiar código por access token
        const tokenResponse = await fetch('https://github.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: 'http://localhost:3000/auth/github/callback'
            })
        });

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            throw new Error('No se pudo obtener access token');
        }

        // 2. Obtener datos del usuario de GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Erasmus-App'
            }
        });

        const githubUser = await userResponse.json();

        // 3. Buscar o crear usuario en TU BD
        let user = await findOrCreateUserFromGitHub(githubUser);

        // 4. Generar JWT (mismo formato que tu login normal)
        const tokenPayload = {
            sub: user.id_usuario,
            email: user.email,
            role: user.id_rol,
            provider: 'github'
        };

        const jwtToken = generateAccessToken(tokenPayload);

        // 5. Redirigir con el token (puedes enviarlo como lo prefieras)
        res.redirect(`http://localhost:3000/auth/success?token=${jwtToken}`);

    } catch (error) {
        console.error('Error en OAuth callback:', error);
        res.status(500).json({ error: 'Error en autenticación con GitHub' });
    }
});

// Función para buscar/crear usuario en tu BD
const db = require('../../config/database'); // Tu conexión PostgreSQL a Supabase

async function findOrCreateUserFromGitHub(githubUser) {
    const email = githubUser.email || `${githubUser.login}@github.com`;
    const nombre = githubUser.name || githubUser.login;

    try {
        // 1. Buscar si el usuario ya existe en TU tabla usuarios
        const result = await db.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            console.log('Usuario encontrado en BD:', email);
            return result.rows[0];
        }

        // 2. Crear nuevo usuario en TU BD
        console.log('Creando nuevo usuario desde GitHub:', email);

        const newUser = await db.query(
            `INSERT INTO usuarios (email, password, id_rol) 
       VALUES ($1, $2, $3) RETURNING *`,
            [email, 'oauth_github_user', 4] // password dummy, rol 4 = Alumno
        );

        // 3. Crear perfil en TU tabla perfiles
        await db.query(
            `INSERT INTO perfiles (id_usuario, nombre, apellido1) 
       VALUES ($1, $2, $3)`,
            [newUser.rows[0].id_usuario, nombre, 'GitHub'] // apellido1 como placeholder
        );

        console.log('Usuario y perfil creados exitosamente');
        return newUser.rows[0];

    } catch (error) {
        console.error('Error en funcion findOrCreateUserFromGitHub:', error);
        throw error;
    }
}

module.exports = router;