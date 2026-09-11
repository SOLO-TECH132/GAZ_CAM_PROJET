/**
 * @file adminRoutes.js
 * @description Routes admin pour gérer les commandes (valider / refuser).
 */

const express = require("express");

/**
 * @param {import("pg").Pool} pool - Pool PostgreSQL
 * @returns {express.Router} Router Express configuré
 */
module.exports = function createAdminRoutes(pool) {

    const router = express.Router();

    // ============================
    // 🔥 Récupérer toutes les commandes
    // ============================
    router.get("/api/admin/commandes", async (req, res) => {
        try {
            const result = await pool.query("SELECT * FROM commandes ORDER BY id DESC");
            res.json(result.rows);
        } catch (err) {
            console.error("Erreur chargement commandes admin:", err);
            res.status(500).json({ success: false });
        }
    });

    // ============================
    // 🔥 Valider une commande
    // ============================
    router.post("/api/admin/commandes/valider/:id", async (req, res) => {
        try {
            const id = req.params.id;

            const commande = await pool.query("SELECT * FROM commandes WHERE id = $1", [id]);
            if (commande.rows.length === 0) {
                return res.json({ success: false });
            }

            const { produit_id, quantite } = commande.rows[0];

            // diminuer le stock
            await pool.query(
                "UPDATE produits SET stock = stock - $1 WHERE id = $2",
                [quantite, produit_id]
            );

            // changer l'état
            await pool.query(
                "UPDATE commandes SET etat = 'valide' WHERE id = $1",
                [id]
            );

            res.json({ success: true });

        } catch (err) {
            console.error("Erreur validation commande:", err);
            res.status(500).json({ success: false });
        }
    });

    // ============================
    // 🔥 Refuser une commande
    // ============================
    router.post("/api/admin/commandes/refuser/:id", async (req, res) => {
        try {
            const id = req.params.id;

            await pool.query(
                "UPDATE commandes SET etat = 'refuse' WHERE id = $1",
                [id]
            );

            res.json({ success: true });

        } catch (err) {
            console.error("Erreur refus commande:", err);
            res.status(500).json({ success: false });
        }
    });

    return router; // 🔥 OBLIGATOIRE
};
