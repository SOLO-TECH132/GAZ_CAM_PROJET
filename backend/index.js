/**
 * ==========================================================
 *  SERVEUR EXPRESS PRINCIPAL
 * ==========================================================
 * Backend Node.js / Express
 * Fonctionnalités :
 * - Sessions utilisateur (login / logout)
 * - Gestion du thème (dark / light)
 * - Connexion / Inscription
 * - Vérification PostgreSQL
 * - API simples
 * - Chargement des routes externes (produits, upload, admin)
 */

const express = require('express');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require('path');

// Connexion PostgreSQL
const pool = require("../backend/DB/connenxionDB");

// Import des routes PRO (tu les ajouteras ici)
const produitsRoute = require("../backend/routes/produit");   // CRUD produits
const uploadRoute = require("../backend/routes/upload");       // Upload image         // Login / Register

const app = express();
const port = process.env.PORT || 3000;


/* ==========================================================
   MIDDLEWARES GLOBAUX
========================================================== */

/**
 * Parse les données envoyées par les formulaires HTML
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Parse les données JSON envoyées par le frontend
 */
app.use(express.json());

/**
 * Gestion des cookies (thème, session, etc.)
 */
app.use(cookieParser());

/**
 * Gestion des sessions utilisateur
 */
app.use(session({
    secret: "misterz-secret-key", // clé de chiffrement
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24h
    }
}));



/**
 * Dossier statique (HTML, CSS, JS, images)
 * Permet d'accéder à /src/main.html, /src/style.css, etc.
 */
app.use(express.static(path.join(__dirname, '..', 'src')));

/**
 * Rendre le dossier uploads accessible publiquement
 * (pour afficher les images des produits)
 */
app.use("/uploads", express.static(path.join(__dirname,"./uploads")));





/* ==========================================================
   ROUTES PRINCIPALES
========================================================== */

/**
 * @route GET /
 * @description Renvoie la page principale du site
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'main.html'));
});

/**
 * @route GET /api/message
 * @description Test simple pour vérifier que l'API fonctionne
 */
app.get('/api/message', (req, res) => {
    res.json({ msg: "salut express !" });
});



/* ==========================================================
   ROUTES : THÈME (dark / light)
========================================================== */

/**
 * @route POST /theme
 * @description Sauvegarde le thème dans un cookie
 */
app.post("/theme", (req, res) => {
    const { theme } = req.body;

    res.cookie("theme", theme, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
        httpOnly: false
    });

    res.json({ ok: true });
});

/**
 * @route GET /theme
 * @description Renvoie le thème actuel
 */
app.get("/theme", (req, res) => {
    res.json({ theme: req.cookies.theme || "light" });
});



/* ==========================================================
   ROUTE : TEST CONNEXION DB
========================================================== */

/**
 * @route GET /test-db
 * @description Vérifie la connexion à PostgreSQL
 */
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.send("Connexion PostgreSQL OK : " + result.rows[0].now);
    } catch (err) {
        console.error("Erreur DB :", err);
        res.status(500).send("Connexion PostgreSQL échouée");
    }
});



/* ==========================================================
   ROUTES AUTH : INSCRIPTION + CONNEXION + DÉCONNEXION
========================================================== */

/**
 * @route POST /register
 * @description Crée un nouvel utilisateur dans la base de données
 */
app.post("/register", async (req, res) => {
    const { nom, prenom, email, password } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO users (nom, prenom, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
            [nom, prenom, email, password]
        );

        const newUser = result.rows[0];

        req.session.user = {
            nom: newUser.nom,
            prenom: newUser.prenom,
            email: newUser.email,
            role: newUser.role || "client"
        };

        res.json({ success: true, user: req.session.user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

/**
 * @route POST /login
 * @description Connecte un utilisateur existant (client ou admin)
 */
app.post("/login", async (req, res) => {
    const { email, password, remember } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.json({ success: false, message: "Email introuvable" });
        }

        const user = result.rows[0];

        if (user.password_hash !== password) {
            return res.json({ success: false, message: "Mot de passe incorrect" });
        }

        req.session.user = {
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role // 🔥 admin ou client
        };

        if (remember) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 jours
        } else {
            req.session.cookie.expires = false;
        }

        res.json({ success: true, user: req.session.user, role: user.role });

    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

/**
 * @route GET /logout
 * @description Déconnecte l'utilisateur et détruit la session
 */
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

/**
 * @route GET /me
 * @description Renvoie les infos de l'utilisateur connecté
 */
app.get("/me", (req, res) => {
    res.json(req.session.user || null);
});



/* ==========================================================
   ROUTES EXTERNES (PRODUITS / UPLOAD / AUTH)
========================================================== */

/**
 * Routes produits (CRUD)
 */
app.use("/api", produitsRoute);

/**
 * Route upload image
 */
app.use("/api", uploadRoute);



/* ==========================================================
   LANCEMENT DU SERVEUR
========================================================== */

/**
 * Démarre le serveur Express
 */
app.listen(port, () => {
    console.log(`Backend lancé sur http://localhost:${port}`);
});
