/**
 * @file produits.js
 * @description Routes CRUD pour les produits
 */

const express = require("express");
const router = express.Router();
const pool = require("../DB/connenxionDB");


// ===============================
// AJOUTER UN PRODUIT
// ===============================
router.post("/produits", async (req, res) => {
    const { nom, marque, poids, prix, stock, fichier_image } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO produits (nom, marque, poids, prix, stock, fichier_image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [nom, marque, poids, prix, stock, fichier_image]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur ajout produit :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ===============================
// LISTE DES PRODUITS
// ===============================
router.get("/produits", async (req, res) => {
    const { marque } = req.query;

    if (marque) {
        const result = await pool.query(
            "SELECT * FROM produits WHERE marque = $1 ORDER BY id DESC",
            [marque]
        );
        return res.json(result.rows);
    }

    const result = await pool.query("SELECT * FROM produits ORDER BY id DESC");
    res.json(result.rows);

});


// ===============================
// OBTENIR UN PRODUIT PAR ID
// (NÉCESSAIRE POUR LE MODAL)
// ===============================
router.get("/produits/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query("SELECT * FROM produits WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produit introuvable" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur GET produit :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ===============================
// MODIFIER UN PRODUIT
// (NÉCESSAIRE POUR LE MODAL)
// ===============================
router.put("/produits/:id", async (req, res) => {
    const id = req.params.id;
    const { nom, prix, stock } = req.body;

    try {
        const result = await pool.query(
            "UPDATE produits SET nom=$1, prix=$2, stock=$3 WHERE id=$4 RETURNING *",
            [nom, prix, stock, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produit introuvable" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Erreur PUT produit :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// ===============================
// SUPPRIMER UN PRODUIT
// ===============================
router.delete("/produits/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const result = await pool.query("DELETE FROM produits WHERE id=$1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Produit introuvable" });
        }

        res.json({ message: "Produit supprimé" });
    } catch (err) {
        console.error("Erreur DELETE produit :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});









module.exports = router;
