/**
 * ============================================================
 *  MAIN.JS — VERSION FINALE PRO + JSDoc
 * ============================================================
 * Contient :
 * - Mode sombre
 * - Session utilisateur
 * - Login / Register / Logout
 * - Toggle mot de passe (SVG)
 * - Indicateur de force (zxcvbn)
 * - Blocage inscription si mot de passe faible
 * - Dropdown avatar
 * - Menu mobile
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {

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
       SESSION UTILISATEUR + AVATAR
       ============================================================ */

    let user = null;

    /**
     * @function updateUI
     * @description Met à jour l'interface selon la session utilisateur
     */
    function updateUI() {
        if (user) {
            document.getElementById("guest-menu").classList.add("hidden");
            document.getElementById("user-menu").classList.remove("hidden");

            const initials =
                user.prenom.charAt(0).toUpperCase() +
                user.nom.charAt(0).toUpperCase();

            document.getElementById("userInitials").textContent = initials;
            document.getElementById("dropdownName").textContent =
                user.prenom + " " + user.nom;
            document.getElementById("dropdownEmail").textContent = user.email;

        } else {
            document.getElementById("guest-menu").classList.remove("hidden");
            document.getElementById("user-menu").classList.add("hidden");
        }
    }

    fetch("/me")
        .then(res => res.json())
        .then(data => {
            user = data;
            updateUI();
        });



    /* ============================================================
       POPUP NOTIFICATION
       ============================================================ */

    /**
     * @function showPopup
     * @description Affiche un popup temporaire en haut à droite
     * @param {string} message - Message à afficher
     */
    function showPopup(message) {
        const popup = document.createElement("div");
        popup.className =
            "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300";
        popup.textContent = message;

        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = "0";
            setTimeout(() => popup.remove(), 300);
        }, 2500);
    }



    /* ============================================================
       LOGIN (CONNEXION)
       ============================================================ */

    /**
     * @function login
     * @description Envoie les infos de connexion au backend
     * @param {string} email
     * @param {string} password
     */
    function login(email, password) {

        // Sécurisation du Remember Me
        const rememberCheckbox = document.getElementById("checkbox-login-remember");
        const remember = rememberCheckbox ? rememberCheckbox.checked : false;

        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, remember })
        })
            .then(res => res.json())
            .then(data => {

                if (data.success) {

                    const modal = new Modal(document.getElementById("connexion-modal"));
                    modal.hide();

                    setTimeout(() => window.location.reload(), 200);

                } else {
                    const errorBox = document.getElementById("loginError");

                    if (data.message === "Mot de passe incorrect") {
                        errorBox.textContent = "Mot de passe incorrect";
                        errorBox.classList.remove("hidden");
                    } else if (data.message === "Email introuvable") {
                        errorBox.textContent = "Email introuvable";
                        errorBox.classList.remove("hidden");
                    } else {
                        showPopup(data.message || "Erreur de connexion");
                    }
                }

                   if (data.role === "admin") {
                     window.location.href = "/admin.html"; // ta page admin
                } else {
                    window.location.href = "./main.html"; // page client
                }
            });
    }

    /**
     * @event submit
     * @description Empêche le rechargement du formulaire login
     */
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            login(email, password);
        });
    }



    /* ============================================================
       REGISTER (INSCRIPTION)
       ============================================================ */

    /**
     * @function register
     * @description Envoie les infos d'inscription au backend
     */
    function register(nom, prenom, email, password) {
        fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nom, prenom, email, password })
        })
            .then(res => res.json())
            .then(data => {

                if (data.success) {

                    const modal = new Modal(document.getElementById("sign-in-mogal"));
                    modal.hide();

                    setTimeout(() => window.location.reload(), 200);

                } else {
                    showPopup(data.message || "Erreur d'inscription");
                }
            });
    }



    /* ============================================================
       TOGGLE PASSWORD — CONNEXION
       ============================================================ */

    /**
     * @constant loginPasswordInput
     * @description Champ mot de passe du login
     */
    const loginPasswordInput = document.getElementById("loginPassword");

    /**
     * @constant toggleLoginPassword
     * @description Bouton SVG afficher/cacher mot de passe
     */
    const toggleLoginPassword = document.getElementById("toggleLoginPassword");

    const iconEyeLogin = document.getElementById("icon-eye-login");
    const iconEyeSlashLogin = document.getElementById("icon-eye-slash-login");

    /**
     * @event click
     * @description Affiche ou cache le mot de passe (connexion)
     */
    if (toggleLoginPassword) {
        toggleLoginPassword.addEventListener("click", () => {
            const isHidden = loginPasswordInput.type === "password";
            loginPasswordInput.type = isHidden ? "text" : "password";
            iconEyeLogin.classList.toggle("hidden", !isHidden);
            iconEyeSlashLogin.classList.toggle("hidden", isHidden);
        });
    }



    /* ============================================================
       TOGGLE PASSWORD — INSCRIPTION
       ============================================================ */

    const registerPasswordInput = document.getElementById("registerPassword");
    const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");
    const iconEyeRegister = document.getElementById("icon-eye-register");
    const iconEyeSlashRegister = document.getElementById("icon-eye-slash-register");

    /**
     * @event click
     * @description Affiche ou cache le mot de passe (inscription)
     */
    if (toggleRegisterPassword) {
        toggleRegisterPassword.addEventListener("click", () => {
            const isHidden = registerPasswordInput.type === "password";
            registerPasswordInput.type = isHidden ? "text" : "password";
            iconEyeRegister.classList.toggle("hidden", !isHidden);
            iconEyeSlashRegister.classList.toggle("hidden", isHidden);
        });
    }



    /* ============================================================
       FORCE DU MOT DE PASSE — INSCRIPTION
       ============================================================ */

    /**
     * @constant strengthText
     * @description Indicateur de force du mot de passe
     */
    const strengthText = document.getElementById("passwordStrength");

    /**
     * @constant passwordScore
     * @description Score zxcvbn (0 à 4)
     */
    let passwordScore = 0;

    /**
     * @event input
     * @description Analyse la force du mot de passe en temps réel
     */
    if (registerPasswordInput && strengthText) {
        registerPasswordInput.addEventListener("input", () => {

            const value = registerPasswordInput.value;

            if (!value) {
                strengthText.textContent = "";
                passwordScore = 0;
                return;
            }

            if (typeof zxcvbn !== "function") {
                console.error("❌ zxcvbn n'est pas chargé !");
                return;
            }

            const result = zxcvbn(value);
            passwordScore = result.score;

            switch (result.score) {
                case 0:
                case 1:
                    strengthText.textContent = "Faible";
                    strengthText.className = "text-red-500 text-sm mt-1 font-medium";
                    break;

                case 2:
                    strengthText.textContent = "Moyen";
                    strengthText.className = "text-orange-500 text-sm mt-1 font-medium";
                    break;

                case 3:
                case 4:
                    strengthText.textContent = "Fort";
                    strengthText.className = "text-green-600 text-sm mt-1 font-medium";
                    break;
            }
        });
    }



    /* ============================================================
       BLOQUER INSCRIPTION SI MOT DE PASSE FAIBLE
       ============================================================ */

    const registerForm = document.getElementById("registerForm");

    /**
     * @event submit
     * @description Bloque l'inscription si mot de passe faible
     */
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (passwordScore < 2) {
                const errorBox = document.getElementById("registerError");
                errorBox.textContent = "Mot de passe faible";
                errorBox.classList.remove("hidden");
                return;
            }

            const nom = document.getElementById("registerNom").value;
            const prenom = document.getElementById("registerPrenom").value;
            const email = document.getElementById("registerEmail").value;
            const password = registerPasswordInput.value;

            register(nom, prenom, email, password);
        });
    }



    /* ============================================================
       LOGOUT
       ============================================================ */

    const logoutBtn = document.getElementById("logoutBtn");

    /**
     * @event click
     * @description Déconnecte l'utilisateur
     */
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            fetch("/logout")
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        window.location.reload();
                    } else {
                        showPopup("Impossible de se déconnecter");
                    }
                });
        });
    }



    /* ============================================================
       DROPDOWN AVATAR
       ============================================================ */

    const avatarButton = document.getElementById("avatarButton");

    /**
     * @event click
     * @description Ouvre/ferme le menu utilisateur
     */
    if (avatarButton) {
        avatarButton.addEventListener("click", () => {
            document.getElementById("userDropdown").classList.toggle("hidden");
        });
    }



    /* ============================================================
       MENU MOBILE
       ============================================================ */

    const btn = document.getElementById("hamburgerBtn");
    const nav = document.getElementById("mainNav");

    if (btn && nav) {
        const iconOpen = btn.querySelector(".icon-open");
        const iconClose = btn.querySelector(".icon-close");
        const darkOpen = btn.querySelector(".menu-ligth");
        const darkClose = btn.querySelector(".close-ligth");

        /**
         * @event click
         * @description Ouvre/ferme le menu mobile
         */
        btn.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("open");
            nav.style.left = isOpen ? "0" : "-300px";

            const isDark = document.documentElement.classList.contains("dark");

            if (isDark) {
                darkOpen.classList.toggle("!hidden");
                darkClose.classList.toggle("hidden");
            } else {
                iconOpen.classList.toggle("hidden");
                iconClose.classList.toggle("hidden");
            }
        });
    }

});


/* ============================================================
       REDIRECTION VERS LA PAGE PRODUIT PRODUIT
       ============================================================ */

       async function requireAuth(redirectUrl) {
    const rest = await fetch("/me");
    const users = await rest.json();

    if(!users) {
        const modal = document.getElementById("connexion-modal")
        modal.classList.remove("hidden")
        return
    }

    window.location.href= redirectUrl
}




    /* ============================================================
       CARD MESSAGE PRODUIT
       ============================================================ */

/**
 * @fileoverview Gestion dynamique de l'affichage des produits (bouteilles de gaz)
 * en fonction de la marque sélectionnée. Lorsqu'une card de marque est cliquée :
 *  - La section des produits descend avec une animation.
 *  - Les bouteilles correspondantes sont affichées sous forme de cards.
 *  - Chaque card contient : image, taille, prix, bouton Commander.
 *
 * @version 1.0.0
 */


/**
 * @fileoverview Affichage dynamique des produits depuis la base PostgreSQL
 * en fonction de la marque cliquée.
 * @version 2.0.0
 */

const cards = document.querySelectorAll(".card-top");
const panel = document.getElementById("productPanel");
const brandTitle = document.getElementById("brandTitle");
const brandProducts = document.getElementById("brandProducts");

async function displayProductsFromDB(brand) {
    try {
        console.log("Marque cliquée :", brand);

        const res = await fetch(`http://localhost:3000/api/produits?marque=${brand}`);
        const produits = await res.json();

        console.log("Produits reçus :", produits);

        brandTitle.textContent = brand.toUpperCase();

        if (produits.length === 0) {
            brandProducts.innerHTML = `
                <div class="text-center text-red-500 font-bold text-xl ">
                    Stock épuisé pour ${brand.toUpperCase()}
                </div>
            `;
            return;
        }

        brandProducts.innerHTML = produits.map(p => `
            <div class="bg-[#1C1A16] dark:bg-[#FFFFFF] p-6 rounded-lg w-full md:w-80 hover:-translate-y-1 transition-all">
                <img src="http://localhost:3000/uploads/${p.fichier_image}" class="w-full h-64 object-contain bg-amber-50 rounded-lg">
                <h2 class="text-2xl mt-4">bouteille de ${p.poids} kg</h2>
                <p class="text-[#cf5407] font-bold text-xl">${p.prix} Fcfa</p>
                <p class="text-gray-500 mt-2">La référence pour les familles nombreuses et petits commerces.</p>
                <ul class="mt-4 text-sm text-gray-400 space-y-1">
                    <li>Échange bouteille vide inclus</li>
                    <li>Livraison prioritaire</li>
                    <li>Kit détecteur de fuite offert</li>
                    <li>Abonnement mensuel disponible</li>
                </ul>
                <button class="mt-4 items-center w-full text-white dark:text-black bg-brand border border-orange-600 hover:bg-orange-600 rounded-base text-sm px-4 py-2.5">
                    Commander
                </button>
            </div>
        `).join("");

        panel.classList.remove("hidden");
        setTimeout(() => {
            panel.classList.remove("opacity-0", "translate-y-5");
        }, 10);

    } catch (err) {
        console.error("Erreur chargement produits :", err);
    }
}

cards.forEach(card => {
    card.addEventListener("click", () => {
        const brand = card.getAttribute("data-brand");
        displayProductsFromDB(brand);
    });
});



