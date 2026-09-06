/**
 * Upload une image vers Express et renvoie son nom de fichier.
 */
async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data.filename;
}



/**
 * Ajoute un produit dans la base PostgreSQL via Express.
 */
document.getElementById("addProductForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Upload image
    const imageFile = document.getElementById("fichier_image").files[0];
    const filename = await uploadImage(imageFile);

    // 2. Créer l'objet produit
    const produit = {
        nom: document.getElementById("nom").value,
        marque: document.getElementById("marque").value,
        poids: Number(document.getElementById("poids").value),
        prix: Number(document.getElementById("prix").value),
        stock: Number(document.getElementById("stock").value),
        fichier_image: filename
    };

    // 3. Envoyer le produit
    const res = await fetch("http://localhost:3000/api/produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produit)
    });

    if (res.ok) {
        alert("Produit ajouté !");
        e.target.reset();
        document.getElementById("previewImage").classList.add("hidden");
    } else {
        alert("Erreur lors de l'ajout du produit");
    }
});


async function chargerProduits() {
    const res = await fetch("http://localhost:3000/api/produits");
    const produits = await res.json();

    const container = document.getElementById("listeProduits");
    container.innerHTML = "";

    produits.forEach(p => {
        const card = document.createElement("div");
        card.className = "p-4 rounded-lg shadow-md flex";

        card.innerHTML = `
            <div
                    class="bg-[#1C1A16] dark:bg-[#FFFFFF] p-6 rounded-lg w-full md:w-80 hover:-translate-y-1 transition-all shadow shadow-2xl">
                    <img src="http://localhost:3000/uploads/${p.fichier_image}" class="w-full h-64 object-contain bg-amber-50 rounded-lg">
                    <p class="text-xl text-blue-600">Marque : ${p.marque}</p>
                    <h2 class="text-xl">Bouteille de ${p.poids} kg</h2>
                    <p class="text-[#cf5407] font-bold text-xl">${p.prix} Fcfa</p>
                    <p class="text-[#cf5407] font-bold text-xl">Stock : ${p.stock}</p>
                    
                    <div class="">
                    <button onclick="supprimerProduit(${p.id})"
                        class="bg-red-600 px-3 py-1 rounded">Supprimer</button>

                    <button onclick="ouvrirModification(${p.id})"
                        class="bg-blue-600 px-3 py-1 rounded">Modifier</button>
                </div>
        </div>
        `;

        container.appendChild(card);
    });
}

chargerProduits();

//SUPPRESSION DANS LA BD

async function supprimerProduit(id) {
    if (!confirm("Supprimer ce produit ?")) return;

    const res = await fetch(`http://localhost:3000/api/produits/${id}`, {
        method: "DELETE"
    });

    if (res.ok) {
        chargerProduits();
    } else {
        alert("Erreur suppression");
    }
}


//MODIFICATION DANS LA BD


/**
 * @file modal-edit.js
 * @description Gère l'ouverture, le remplissage, la fermeture et la validation du modal de modification.
 */

/**
 * @let produitEnEdition
 * @description Stocke l'ID du produit actuellement en modification.
 * @type {number|null}
 */
let produitEnEdition = null;

/**
 * Ouvre le modal de modification et charge les données du produit.
 * @function ouvrirModification
 * @param {number} id - ID du produit à modifier.
 */
function ouvrirModification(id) {
    produitEnEdition = id;

    fetch(`http://localhost:3000/api/produits/${id}`)
        .then(res => res.json())
        .then(p => {
            // Remplir les champs du modal
            document.getElementById("edit_nom").value = p.nom;
            document.getElementById("edit_prix").value = p.prix;
            document.getElementById("edit_stock").value = p.stock;

            // Afficher le modal
            const modal = document.getElementById("modalEdit");
            modal.classList.remove("hidden");
            modal.classList.add("flex");
        })
        .catch(err => {
            console.error("Erreur chargement produit :", err);
            alert("Impossible de charger le produit");
        });
}

/**
 * Ferme le modal de modification.
 * @function fermerModal
 */
function fermerModal() {
    const modal = document.getElementById("modalEdit");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

/**
 * Valide la modification et envoie les nouvelles données au backend.
 * @async
 * @function validerModification
 */
async function validerModification() {
    const nom = document.getElementById("edit_nom").value;
    const prix = Number(document.getElementById("edit_prix").value);
    const stock = Number(document.getElementById("edit_stock").value);

    const res = await fetch(`http://localhost:3000/api/produits/${produitEnEdition}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prix, stock })
    });

    if (res.ok) {
        fermerModal();
        chargerProduits();
        alert("Produit modifié !");
    } else {
        alert("Erreur lors de la modification");
    }
}



// mode sombre clair

 /* ============================================================
       MODE SOMBRE
       ============================================================ */

    /**
     * @constant toggleD
     * @description Checkbox du switch dark mode
     */
    const toggleD = document.getElementById("toogleDark");

    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        if (toggleD) toggleD.checked = true;
    }

    /**
     * @event change
     * @description Active/désactive le mode sombre + sauvegarde
     */
    if (toggleD) {
        toggleD.addEventListener("change", () => {
            const isDark = toggleD.checked;
            document.documentElement.classList.toggle("dark", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }


    /* ============================================================
       DECONNECXION DU MODE ADMIN ET REDIRECTION VERS LA PAGE D'ACCEUIL
       ============================================================ */

    document.getElementById("logoutAdminBtn").addEventListener("click",()=>{
        window.location.href = "main.html";
    });


      /* ============================================================
       DECONNECXION DU MODE ADMIN ET REDIRECTION VERS LA PAGE D'ACCEUIL
       ============================================================ */

       /**
 * @file main.js
 * @description Gère l'ajout de produits depuis la page admin.
 * Envoie les données du formulaire vers l'API Express pour insertion dans PostgreSQL.
 */

/**
 * Envoie un produit vers l'API backend pour l'ajouter dans la base de données.
 * @async
 * @function sendProductToAPI
 * @param {Object} product - Les données du produit à envoyer.
 * @param {string} product.name - Nom du produit.
 * @param {string} product.marque - Marque du produit.
 * @param {string} product.poids - Poids du produit.
 * @param {number} product.price - Prix du produit.
 * @param {number} product.stock - Stock disponible.
 * @param {string} product.image_url - URL de l'image du produit.
 * @returns {Promise<Response>} Réponse du serveur Express.
 */
async function sendProductToAPI(product) {
    try {
        const response = await fetch("http://localhost:3000/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(product)
        });

        return response;
    } catch (error) {
        console.error("Erreur lors de l'envoi du produit :", error);
    }
}




/**
 * Affiche un aperçu de l'image uploadée dans la page admin.
 */
document.getElementById("fichier_image").addEventListener("change", (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById("affichage");

    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("hidden");
    }
});


