// =================================================================================
// NOTE: CE SCRIPT S'ATTEND À CE QUE 'products' (de products-db.js) SOIT DÉJÀ CHARGÉ
// =================================================================================

// --- Variables globales ---
let currentProductPrice = 0, currentProductName = "", currentProductDescription = "";
const EMAILJS_SERVICE_ID = "service_geh79gu", EMAILJS_TEMPLATE_ID = "template_vny80g3", EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS";
let currentPage = 1, productsPerPage = 8, currentCategory = 'All';
let currentImageIndex = 0; // Garde une trace de l'image de la galerie actuelle
let galleryInterval = null; // Variable pour le minuteur de la galerie

// --- Initialisation au chargement de la page ---
document.addEventListener('DOMContentLoaded', () => {
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
    } else if (pagePath.includes('product.html')) {
        populateProductPage();
    }

    // Initialisation des autres services
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);
    if (typeof countryCodes !== 'undefined') {
        if (document.getElementById('selectedCountryCode')) populateCountryCodes('selectedCountryCode');
        if (document.getElementById('contactCountryCode')) populateCountryCodes('contactCountryCode');
    }
});


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
        grid.innerHTML += `<a href="product.html?id=${product.id}" class="product-card-link"><div class="product-card"><div class="product-image-wrapper"><img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy"></div><div class="product-footer"><h2 class="product-name">${product.name}</h2></div></div></a>`;
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


// --- Fonctions de la page produit ---
function populateProductPage() {
    const product = products.find(p => p.id === new URLSearchParams(window.location.search).get('id'));

    if (product) {
        document.title = `${product.name} - IPTV Store`;
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-description').innerText = product.description;
        
        setupCombinedGallery(product);
        initializeProductForm(product);
        setupLightbox();
    } else {
        window.location.href = '404.html';
    }
}

function setupCombinedGallery(product) {
    const mainImageContainer = document.querySelector('.main-image-container-fade');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    
    if (!mainImageContainer || !thumbnailContainer || !product.images || product.images.length === 0) return;

    mainImageContainer.innerHTML = '';
    thumbnailContainer.innerHTML = '';

    product.images.forEach(imageUrl => {
        const mainImg = document.createElement('img');
        mainImg.src = imageUrl;
        mainImg.alt = `Image de ${product.name}`;
        mainImageContainer.appendChild(mainImg);

        const thumb = document.createElement('img');
        thumb.src = imageUrl;
        thumb.alt = `Miniature de ${product.name}`;
        thumbnailContainer.appendChild(thumb);
    });

    const allMainImages = mainImageContainer.querySelectorAll('img');
    const allThumbs = thumbnailContainer.querySelectorAll('img');
    const totalImages = allMainImages.length;

    const updateGallery = (newIndex) => {
        currentImageIndex = newIndex;
        allMainImages.forEach((img, idx) => img.classList.toggle('active', idx === newIndex));
        allThumbs.forEach((thumb, idx) => thumb.classList.toggle('active', idx === newIndex));
    };
    
    // --- NOUVELLE FONCTION POUR LE DÉFILEMENT AUTOMATIQUE ---
    const startAutoChange = () => {
        clearInterval(galleryInterval); // Annule le minuteur précédent
        galleryInterval = setInterval(() => {
            const newIndex = (currentImageIndex + 1) % totalImages;
            updateGallery(newIndex);
        }, 3000); // Change toutes les 3 secondes
    };

    allThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            updateGallery(index);
            startAutoChange(); // Réinitialise le minuteur lors du clic
        });
    });

    if (totalImages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '&#10094;';
        prevBtn.className = 'carousel-button prev';
        prevBtn.style.display = 'block';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
            updateGallery(newIndex);
            startAutoChange(); // Réinitialise le minuteur lors du clic
        });

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.className = 'carousel-button next';
        nextBtn.style.display = 'block';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentImageIndex + 1) % totalImages;
            updateGallery(newIndex);
            startAutoChange(); // Réinitialise le minuteur lors du clic
        });

        mainImageContainer.appendChild(prevBtn);
        mainImageContainer.appendChild(nextBtn);
        
        startAutoChange(); // Démarre le défilement automatique
    }
    
    updateGallery(0);
}

function setupLightbox() {
    const mainImageContainer = document.querySelector('.main-image-container-fade');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (!mainImageContainer || !lightbox || !lightboxImage || !lightboxClose) return;

    mainImageContainer.style.cursor = 'zoom-in';
    mainImageContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('carousel-button')) return;

        const activeImg = mainImageContainer.querySelector('img.active');
        if (activeImg) {
            clearInterval(galleryInterval); // Met en pause le défilement quand la lightbox est ouverte
            lightboxImage.src = activeImg.src;
            lightbox.style.display = 'flex';
        }
    });
    
    const closeLightbox = () => { 
        lightbox.style.display = 'none';
        // Redémarre le défilement quand on ferme la lightbox
        if(product.images.length > 1) startAutoChange(); 
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { 
        if (e.target === lightbox) closeLightbox(); 
    });
}

function initializeProductForm(product) {
    currentProductName = product.name;
    currentProductPrice = product.price;
    currentProductDescription = product.description;
    
    const serverTypeSelect = document.getElementById('serverType');
    if (serverTypeSelect) {
        serverTypeSelect.innerHTML = '';
        (product.serverTypes || []).forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.innerText = type.charAt(0).toUpperCase() + type.slice(1).replace(" active", " Active");
            serverTypeSelect.appendChild(option);
        });
    }

    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.value = 1;

    updateTotalPrice();
    toggleServerFields();
}


// --- Fonctions du formulaire et utilitaires ---

function countryCodeToEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

function populateCountryCodes(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    if (typeof countryCodes === 'undefined') return;
    selectElement.innerHTML = '';
    countryCodes.forEach(country => {
        const option = document.createElement("option");
        option.value = country.code;
        option.innerText = `${countryCodeToEmoji(country['code-in'])} ${country.name} (${country.code})`;
        selectElement.appendChild(option);
    });
    selectElement.value = "+33";
}

function toggleServerFields() {
    const serverType = document.getElementById("serverType")?.value;
    const serverFields = document.getElementById('serverFields');
    if (!serverFields) return;
    serverFields.innerHTML = '';
    if (serverType === "mag") {
        serverFields.innerHTML = `<div class="form-group"><label for="macAddress">Adresse MAC:</label><input type="text" id="macAddress" placeholder="e.g., 00:1A:2B:3C:4D:5E"><p class="error-message" id="macAddressError"></p></div>`;
    }
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById("quantity")?.value || 1);
    const priceDisplay = document.getElementById('popupPrice');
    if (!priceDisplay) return;
    let total = currentProductPrice * (quantity || 1);
    if (quantity > 20) total *= 0.9;
    else if (quantity > 10) total *= 0.95;
    priceDisplay.innerText = total.toFixed(2) + " €";
}

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
    document.getElementById('alertMessage').innerHTML = message;
    document.getElementById('customAlert').style.display = 'flex';
}

function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

function generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function sendOrder(method) {
    clearErrors();
    let valid = true;
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    if (!name) {
        valid = false;
        document.getElementById("nameError").innerText = "Veuillez entrer votre nom.";
    }
    if (!phone) {
        valid = false;
        document.getElementById("phoneError").innerText = "Veuillez entrer un numéro.";
    }
    if (!valid) return;

    displayWaitingMessage();
    const quantity = parseInt(document.getElementById("quantity").value);
    const totalPrice = parseFloat(document.getElementById('popupPrice').innerText);
    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = `${document.getElementById("selectedCountryCode").value}${phone}`;
    const macAddress = document.getElementById('macAddress')?.value.trim() || 'N/A';
    const serverType = document.getElementById("serverType").value;
    const email = document.getElementById("email").value.trim() || 'N/A';
    const discount = (currentProductPrice * quantity) - totalPrice;
    
    const formattedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Serveur: ${serverType}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${email}\n*Prix unitaire: ${currentProductPrice.toFixed(2)} €\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(2)} €\n*Total: ${totalPrice.toFixed(2)} €`;

    if (method === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`, '_blank');
        hideWaitingMessage();
        displayAlert(`Redirection vers WhatsApp...`);
    } else if (method === 'email') {
        const templateParams = { orderNumber, product: currentProductName, serverType, macAddress, name, phone: fullPhoneNumber, email, productPrice: currentProductPrice.toFixed(2), quantity, discount: discount.toFixed(2), totalPrice: totalPrice.toFixed(2), productDescription: currentProductDescription };
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => {
                hideWaitingMessage();
                displayAlert(`Commande envoyée!<br>Numéro: ${orderNumber}`);
            }, () => {
                hideWaitingMessage();
                displayAlert("Échec de l'envoi. Veuillez réessayer.");
            });
    }
}

function sendContactViaWhatsApp() {
    clearErrors();
    let valid = true;
    const phone = document.getElementById("contactPhone").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    if (!phone) {
        valid = false;
        document.getElementById("contactPhoneError").innerText = "Veuillez entrer un numéro.";
    }
    if (!message) {
        valid = false;
        document.getElementById("contactMessageError").innerText = "Veuillez écrire votre message.";
    }
    if (!valid) return;
    
    const fullPhoneNumber = `${document.getElementById("contactCountryCode").value}${phone}`;
    const subject = document.getElementById("contactSubject").value;
    const formattedMessage = `*Nouveau Message du Formulaire de Contact*\n\n*Numéro WhatsApp du client:* ${fullPhoneNumber}\n*Sujet:* ${subject}\n\n*Message:*\n${message}`;
    window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`, '_blank');
    displayAlert(`Redirection vers WhatsApp...`);
    document.getElementById('contactForm')?.reset();
}