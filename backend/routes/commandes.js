const express = require("express");
const router = express.Router();
const pool = require("../DB/connenxionDB");

/**
 * 📌 Ajouter une commande
 */
router.post("/commandes", async (req, res) => {
    const { produit_id, quantite, adresse } = req.body;

    try {
        const produit = await pool.query(
            "SELECT nom, marque, prix FROM produits WHERE id = $1",
            [produit_id]
        );

        if (produit.rows.length === 0) {
            return res.status(400).json({ success: false, error: "Produit introuvable" });
        }

        // 🔥 Infos du client connecté
        const client_id = req.session.user.id;      // ID du client
        const client_nom = req.session.user.nom;    // Nom du client
        const client_tel = req.session.user.email;  // Email du client

        /**
         * 📌 IMPORTANT :
         * On respecte EXACTEMENT l’ordre des colonnes dans ta table :
         *
         * produit_id, nom_produit, prix, quantite, client_nom,
         * client_tel, adresse, client_id, status, etat, marque
         *
         * create_at est automatique → pas besoin de l’insérer
         */

        await pool.query(
            `INSERT INTO commandes 
            (produit_id, nom_produit, prix, quantite, client_nom, client_tel, adresse, client_id, status, etat, marque)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'en_attente','en_attente',$9)`,
            [
                produit_id,
                produit.rows[0].nom,
                produit.rows[0].prix,
                quantite,
                client_nom,
                client_tel,
                adresse,
                client_id,
                produit.rows[0].marque
            ]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("Erreur ajout commande :", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


/**
 * 📌 Récupérer les commandes du client connecté
 */
router.get("/mes-commandes", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Non connecté" });
        }

        const client_id = req.session.user.id;

        const result = await pool.query(
            `SELECT id, nom_produit, prix, quantite, adresse, etat, marque, created_at
             FROM commandes
             WHERE client_id = $1
             ORDER BY created_at DESC`,
            [client_id]
        );

        res.json({ success: true, commandes: result.rows });

    } catch (err) {
        console.error("Erreur récupération commandes :", err);
        res.status(500).json({ success: false, error: err.message });
    }
});


/**
 * 📌 ADMIN : valider / refuser
 */
router.put("/commandes/valider/:id", async (req, res) => {
    await pool.query(
        "UPDATE commandes SET etat = 'valide' WHERE id = $1",
        [req.params.id]
    );
    res.json({ success: true });
});

router.put("/commandes/refuser/:id", async (req, res) => {
    await pool.query(
        "UPDATE commandes SET etat = 'refuse' WHERE id = $1",
        [req.params.id]
    );
    res.json({ success: true });
});

module.exports = router;
