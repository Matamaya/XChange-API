const express = require('express');
const router = express.Router();
const { generateAccessToken } = require('../../config/jwt');
const db = require('../../config/database');

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/auth/github/callback';

// 1. Redirigir a GitHub para autorización
router.get('/', (req, res) => {
    if (!GITHUB_CLIENT_ID) {
        return res.status(500).json({ error: 'GITHUB_CLIENT_ID no configurado' });
    }

    const scope = 'user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scope}`;
    res.redirect(githubAuthUrl);
});

// 2. Callback de GitHub
router.get('/callback', async (req, res) => {
    const { code, error, error_description } = req.query;

    // Validar errores de GitHub
    if (error) {
        return res.status(400).json({ 
            error: error,
            description: error_description || 'Error en autenticación con GitHub'
        });
    }

    if (!code) {
        return res.status(400).json({ error: 'Código de autorización no recibido' });
    }

    try {
        // 1. Intercambiar código por access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Erasmus-App'
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            throw new Error(`GitHub error: ${tokenData.error_description || tokenData.error}`);
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            throw new Error('No se pudo obtener access token de GitHub');
        }

        // 2. Obtener datos del usuario de GitHub
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'Erasmus-App'
            }
        });

        const githubUser = await userResponse.json();

        if (!githubUser.id) {
            throw new Error('No se pudieron obtener datos del usuario de GitHub');
        }

        // 3. Buscar o crear usuario en tu BD
        const user = await findOrCreateUserFromGitHub(githubUser);

        // 4. Generar JWT
        const jwtToken = generateAccessToken({
            sub: user.id_usuario,
            email: user.email,
            role: user.id_rol,
            provider: 'github'
        });

        // Guardamos el token en una cookie temporal para que viaja al navegador
        res.cookie('access_token', jwtToken, {
            maxAge: 60000,   // Dura 1 minuto (suficiente para llegar y guardarlo)
            httpOnly: false,  // IMPORTANTE: false para que tu JS del frontend pueda leerla
            path: '/',
        });

        // 5. Redirigir al dashboard con el token (mediante localStorage en cliente)
        const dashboardUrl = `http://localhost:3000/dashboard`;
        res.redirect(dashboardUrl);

    } catch (error) {
        console.error('❌ Error en OAuth callback:', error);
        res.redirect(`http://localhost:3000/?error=${encodeURIComponent(error.message)}`);
    }
});

// 3. Función para buscar/crear usuario
async function findOrCreateUserFromGitHub(githubUser) {
    const email = githubUser.email || `${githubUser.login}@github.com`;
    const nombre = githubUser.name || githubUser.login;

    try {
        // Buscar usuario existente
        const result = await db.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            console.log('✅ Usuario encontrado en BD:', email);
            return result.rows[0];
        }

        // Crear nuevo usuario
        console.log('🆕 Creando nuevo usuario desde GitHub:', email);

        const newUser = await db.query(
            `INSERT INTO usuarios (email, password, id_rol) 
             VALUES ($1, $2, $3) RETURNING *`,
            [email, 'oauth_github_user', 4] // rol 4 = Alumno
        );

        // Crear perfil
        await db.query(
            `INSERT INTO perfiles (id_usuario, nombre, apellido1) 
             VALUES ($1, $2, $3)`,
            [newUser.rows[0].id_usuario, nombre, 'GitHub']
        );

        console.log('✅ Usuario y perfil creados');
        return newUser.rows[0];

    } catch (error) {
        console.error('❌ Error en findOrCreateUserFromGitHub:', error);
        throw error;
    }
}




module.exports = router;