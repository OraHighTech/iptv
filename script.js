// =================================================================================
// NOTE: CE SCRIPT S'ATTEND À CE QUE 'products' (de products-db.js) SOIT DÉJÀ CHARGÉ
// =================================================================================

// --- Variables globales ---
let currentProductPrice = 0, currentProductPriceDZD = 0, currentProductName = "", currentProductDescription = "";
let userCountry = 'FR'; // Par défaut
let useDZD = false;
const EMAILJS_SERVICE_ID = "service_geh79gu", EMAILJS_TEMPLATE_ID = "template_vny80g3", EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS";
let currentPage = 1, productsPerPage = 8, currentCategory = 'All';
let currentImageIndex = 0; // Garde une trace de l'image de la galerie actuelle
let galleryInterval = null; // Variable pour le minuteur de la galerie

// --- Initialisation au chargement de la page ---
document.addEventListener('DOMContentLoaded', async () => {
    // Détection du pays en premier
    await detectUserCountry();
    
    // Fonctions utilitaires
    const loadComponent = (url, elementId) => {
        fetch(url).then(response => response.ok ? response.text() : Promise.reject('File not found'))
            .then(data => { 
                const element = document.getElementById(elementId);
                if(element) element.innerHTML = data;
            })
            .catch(error => console.error(`Error loading component ${url}:`, error));
    };

    // Chargement des composants header/footer
    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    // Vérification critique des données avant d'exécuter la logique de la page
    if (typeof products === 'undefined') {
        // Si les produits ne sont pas chargés, on arrête tout et on alerte l'utilisateur.
        console.error("ERREUR CRITIQUE: La variable 'products' n'est pas définie. Assurez-vous que le fichier 'products-db.js' est correctement chargé AVANT 'script.js'.");
        const body = document.querySelector('body');
        if(body) {
            body.innerHTML = '<div style="padding: 40px; text-align: center; font-family: sans-serif;"><h1>Erreur de chargement</h1><p>Impossible de charger la base de données des produits. Veuillez vérifier la console du navigateur (touche F12) pour des erreurs de type 404 (fichier non trouvé) concernant <strong>products-db.js</strong>.</p></div>';
        }
        return; // Arrête l'exécution du reste du script
    }

    // Routage de la page
    const pagePath = window.location.pathname;
    if (pagePath.includes('index.html') || pagePath.endsWith('/') ) {
        setupCategoryFilters();
        displayProducts();
    } else if (pagePath.includes('contact.html')) {
        if (typeof countryCodes !== 'undefined') {
            populateCountryCodes('contactCountryCode');
        }
    }

    // Initialisation des autres services
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);
});

// --- Fonction de détection de pays ---
async function detectUserCountry() {
    try {
        const response = await fetch('https://api.ipdata.co/?api-key=916c6b6e4d160441313fb81c071aa9aadd988baa6e8e4361cfa6ad38');
        const data = await response.json();
        userCountry = data.country_code;
        useDZD = (userCountry === 'DZ'); // Algérie
        console.log(`Pays détecté: ${userCountry}, utilisation DZD: ${useDZD}`);
    } catch (error) {
        console.error('Erreur détection pays:', error);
        // Fallback: utiliser EUR par défaut
        useDZD = false;
    }
}

// --- Fonction pour ajouter un indicateur de devise ---
function addCurrencyIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'currency-indicator';
    indicator.textContent = useDZD ? '🇩🇿 DZD' : '🇪🇺 EUR';
    indicator.style.cssText = `
        position: fixed;
        top: 80px;
        right: 10px;
        background: var(--primary-color, #5a47fb);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.8em;
        z-index: 1000;
        font-family: var(--font-primary, Poppins, sans-serif);
    `;
    document.body.appendChild(indicator);
}

// --- Fonctions de la page d'accueil ---
function displayProducts() {
    const filteredProducts = products.filter(product => currentCategory === 'All' || product.category === currentCategory);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
    generateProductCards(paginatedProducts);
    setupPagination(filteredProducts);
}

function setupCategoryFilters() {
    const filterContainer = document.getElementById('category-filter-container');
    if (!filterContainer) return;
    const categories = ['All', ...new Set(products.map(p => p.category))];
    filterContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.innerText = category;
        button.className = (category === currentCategory) ? 'active' : '';
        button.addEventListener('click', () => {
            currentCategory = category;
            currentPage = 1;
            displayProducts();
            filterContainer.querySelector('button.active')?.classList.remove('active');
            button.classList.add('active');
        });
        filterContainer.appendChild(button);
    });
}

function generateProductCards(productsToDisplay) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    productsToDisplay.forEach(product => {
        const firstImage = product.images?.[0] || '';
        const price = useDZD ? (product.price_dzd || product.price * 160) : product.price;
        const currency = useDZD ? ' DZD' : ' €';
        const priceFormatted = useDZD ? price.toFixed(0) : price.toFixed(2);
        
        grid.innerHTML += `
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                        <div class="price-badge">${priceFormatted}${currency}</div>
                    </div>
                    <div class="product-footer">
                        <h2 class="product-name">${product.name}</h2>
                    </div>
                </div>
            </a>`;
    });
}

function setupPagination(filteredProducts) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.className = (i === currentPage) ? 'active' : '';
        button.addEventListener('click', () => {
            currentPage = i;
            displayProducts();
        });
        paginationContainer.appendChild(button);
    }
}

// --- Fonctions de la page contact ---
function sendContactViaWhatsApp() { 
    clearErrors();
    let valid = true;
    const phone = document.getElementById("contactPhone")?.value.trim();
    const message = document.getElementById("contactMessage")?.value.trim();
    const contactPhoneError = document.getElementById("contactPhoneError");
    const contactMessageError = document.getElementById("contactMessageError");

    if (!phone && contactPhoneError) {
        valid = false;
        contactPhoneError.innerText = "Veuillez entrer un numéro.";
    }
    if (!message && contactMessageError) {
        valid = false;
        contactMessageError.innerText = "Veuillez écrire votre message.";
    }
    if (!valid) return;
    
    const fullPhoneNumber = `${document.getElementById("contactCountryCode").value}${phone}`;
    const subject = document.getElementById("contactSubject").value;
    const formattedMessage = `*Nouveau Message du Formulaire de Contact*\n\n*Numéro WhatsApp du client:* ${fullPhoneNumber}\n*Sujet:* ${subject}\n\n*Message:*\n${message}`;
    window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`, '_blank');
    displayAlert(`Redirection vers WhatsApp...`);
    document.getElementById('contactForm')?.reset();
}

// --- Fonctions utilitaires ---
function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.innerText = '');
}

function displayWaitingMessage() {
    const el = document.getElementById('waitingMessage');
    if(el) el.style.display = 'flex';
}

function hideWaitingMessage() {
    const el = document.getElementById('waitingMessage');
    if(el) el.style.display = 'none';
}

function displayAlert(message) {
    const alertMessage = document.getElementById('alertMessage');
    const customAlert = document.getElementById('customAlert');
    if (alertMessage) alertMessage.innerHTML = message;
    if (customAlert) customAlert.style.display = 'flex';
}

function closeAlert() {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) customAlert.style.display = 'none';
}

function countryCodeToEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function populateCountryCodes(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement || typeof countryCodes === 'undefined') return;
    selectElement.innerHTML = '';
    countryCodes.forEach(country => {
        const option = document.createElement("option");
        option.value = country.code;
        option.innerText = `${countryCodeToEmoji(country['code-in'])} ${country.name} (${country.code})`;
        selectElement.appendChild(option);
    });
    selectElement.value = "+213";
}

// Exposer les fonctions globalement
window.sendContactViaWhatsApp = sendContactViaWhatsApp;
window.closeAlert = closeAlert;
window.displayAlert = displayAlert;
