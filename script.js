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
    } else if (pagePath.includes('product.html')) {
        populateProductPage();
    }

    // Initialisation des autres services
    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);
    if (typeof countryCodes !== 'undefined') {
        if (document.getElementById('selectedCountryCode')) populateCountryCodes('selectedCountryCode');
        if (document.getElementById('contactCountryCode')) populateCountryCodes('contactCountryCode');
    }

    // Ajouter un indicateur visuel de devise
    addCurrencyIndicator();
});

// --- Fonction de détection de pays ---
async function detectUserCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
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

// --- Fonctions de la page produit ---
function populateProductPage() {
    const product = products.find(p => p.id === new URLSearchParams(window.location.search).get('id'));

    if (product) {
        // --- SEO (ne change pas) ---
        document.title = `${product.name} - Abonnement IPTV | www.iptv-store.shop`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', (product.description || '').substring(0, 155));
        }
        const schema = {
            "@context": "https://schema.org/", "@type": "Product", "name": product.name,
            "image": product.images[0], "description": product.description, "sku": product.id,
            "brand": { "@type": "Brand", "name": "IPTV Store" },
            "offers": { 
                "@type": "Offer", 
                "url": window.location.href, 
                "priceCurrency": useDZD ? "DZD" : "EUR", 
                "price": useDZD ? (product.price_dzd || product.price * 160).toFixed(0) : product.price.toFixed(2), 
                "availability": "https://schema.org/InStock", 
                "itemCondition": "https://schema.org/NewCondition" 
            }
        };
        const schemaScript = document.getElementById('product-schema');
        if(schemaScript){
            schemaScript.textContent = JSON.stringify(schema);
        }
        
        // --- AFFICHAGE DES INFORMATIONS (CORRIGÉ) ---
        document.getElementById('product-name').innerText = product.name;
        
        // 1. Remplit la description COMPLÈTE dans la section du bas
        document.getElementById('product-description').innerText = product.description;

        // 2. Crée et remplit l'EXTRAIT en se basant sur la PREMIÈRE LIGNE
        const excerptElement = document.getElementById('product-excerpt');
        if (excerptElement) {
            const fullDescription = product.description || '';
            
            // On prend la première ligne en séparant le texte au premier retour à la ligne
            let firstLine = fullDescription.split('\n')[0];
            
            // On s'assure que cette première ligne n'est pas trop longue (max 120 caractères)
            let excerpt = firstLine.substring(0, 120);

            // On ajoute "..." s'il y a plus de contenu que l'extrait affiché
            if (fullDescription.length > excerpt.length) {
                excerpt += '...';
            }
            excerptElement.innerText = excerpt;
        }
        
        // --- Logique pour les boutons de partage (ne change pas) ---
        const shareFileName = `${product.id}.html`;
        const shareUrl = `https://www.iptv-store.shop/produits/${shareFileName}`;
        const shareText = `Découvrez ${product.name} sur IPTV Store !`;

        const facebookBtn = document.getElementById('share-facebook');
        if(facebookBtn) { facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; }
        const twitterBtn = document.getElementById('share-twitter');
        if(twitterBtn) { twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; }
        const whatsappBtn = document.getElementById('share-whatsapp');
        if(whatsappBtn) { whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`; }
        const telegramBtn = document.getElementById('share-telegram');
        if(telegramBtn) { telegramBtn.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; }
        const copyBtn = document.getElementById('copy-link');
        if(copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i>'; }, 2000);
                }).catch(err => { console.error('Erreur de copie: ', err); });
            });
        }

        // --- Initialisation de la galerie et du formulaire ---
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
        const product = products.find(p => p.id === new URLSearchParams(window.location.search).get('id'));
        if(product && product.images.length > 1) startAutoChange(); 
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { 
        if (e.target === lightbox) closeLightbox(); 
    });
}

function initializeProductForm(product) {
    currentProductName = product.name;
    currentProductPrice = product.price;
    currentProductPriceDZD = product.price_dzd || product.price * 160; // Fallback si price_dzd non défini
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
        option.innerText = `${countryCodeToEmoji(country['code-in'])} (${country.code}) ${country.name} `;
        selectElement.appendChild(option);
    });
    selectElement.value = "+33";
}

function toggleServerFields() {
    const serverType = document.getElementById("serverType")?.value;
    const serverFields = document.getElementById('serverFields');
    if (!serverFields) return;

    serverFields.innerHTML = ''; // Vide le conteneur

    if (serverType === "mag") {
        // Crée le champ pour l'adresse MAC
        serverFields.innerHTML = `<br><div class="form-group">
                                      <i class="fas fa-envelope icon"></i>
                                      <input type="text" id="macAddress" placeholder="Ex: 00:1A:2B:3C:4D:5E" maxlength="17">
                                  </div>`;
        
        // Ajoute l'écouteur d'événement pour le formatage automatique
        const macAddressInput = document.getElementById('macAddress');
        if (macAddressInput) {
            macAddressInput.addEventListener('input', (e) => {
                // Récupère la valeur actuelle et la nettoie
                let value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                
                // Si la valeur change, on la reformate
                if (e.target.value.length > 0) {
                    // Ajoute les ":" tous les 2 caractères
                    let formattedValue = (value.match(/.{1,2}/g) || []).join(':');
                    
                    // Met à jour la valeur du champ
                    e.target.value = formattedValue;
                }
            });
        }
    }
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById("quantity")?.value || 1);
    const priceDisplay = document.getElementById('popupPrice');
    if (!priceDisplay) return;
    
    const basePrice = useDZD ? currentProductPriceDZD : currentProductPrice;
    let total = basePrice * (quantity || 1);
    
    if (quantity > 20) total *= 0.9;
    else if (quantity > 10) total *= 0.95;
    
    const currency = useDZD ? ' DZD' : ' €';
    const decimals = useDZD ? 0 : 2;
    priceDisplay.innerText = total.toFixed(decimals) + currency;
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
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // CAS SPÉCIAL : Commande rapide par WhatsApp avec un formulaire vide
    if (method === 'whatsapp' && !name && !phone) {
        const productUrl = window.location.href;
        const basePrice = useDZD ? currentProductPriceDZD : currentProductPrice;
        const currency = useDZD ? 'DZD' : 'EUR';
        const priceFormatted = useDZD ? basePrice.toFixed(0) : basePrice.toFixed(2);
        
        const simpleMessage = `Bonjour, je souhaite commander ce produit :\n\n` +
                              `*Produit :* ${currentProductName}\n` +
                              `*Prix :* ${priceFormatted} ${currency}\n` +
                              `*Lien :* ${productUrl}`;
        
        const whatsappUrl = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(simpleMessage)}`;
        window.open(whatsappUrl, '_blank');
        displayAlert('Redirection vers WhatsApp...');
        return; 
    }

    // FLUX NORMAL : Commande par Email ou par WhatsApp avec le formulaire (partiellement) rempli
    clearErrors();
    let valid = true;
    const email = document.getElementById("email").value.trim();
    const phoneRegex = /^\d{7,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Vérification du Nom
    if (!name) {
        valid = false;
        document.getElementById("nameError").innerText = "Veuillez entrer votre nom.";
    }

    // 2. Vérification du Numéro de Téléphone (obligatoire SEULEMENT pour l'email)
    if (method === 'email' && !phone) {
        valid = false;
        document.getElementById("phoneError").innerText = "Veuillez entrer un numéro de téléphone.";
    } else if (phone && !phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
        // Valide le format seulement si un numéro est entré
        valid = false;
        document.getElementById("phoneError").innerText = "Le format du numéro est invalide.";
    }

    // 3. Vérification de l'Email
    if (email && !emailRegex.test(email)) {
        valid = false;
        document.getElementById("emailError").innerText = "Veuillez entrer une adresse email valide.";
    }
    
    // Si la validation échoue, on remonte la page
    if (!valid) {
        const firstError = document.querySelector('.error-message:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Le reste de la fonction...
    displayWaitingMessage();
    const quantity = parseInt(document.getElementById("quantity").value);
    const totalPriceText = document.getElementById('popupPrice').innerText;
    const totalPrice = parseFloat(totalPriceText.replace(/[^\d.,]/g, '').replace(',', '.'));
    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = phone ? `${document.getElementById("selectedCountryCode").value}${phone}` : 'N/A';
    const macAddress = document.getElementById('macAddress')?.value.trim() || 'N/A';
    const serverType = document.getElementById("serverType").value;
    const finalEmail = email || 'N/A';
    
    const basePrice = useDZD ? currentProductPriceDZD : currentProductPrice;
    const currency = useDZD ? 'DZD' : 'EUR';
    const discount = (basePrice * quantity) - totalPrice;
    
    const detailedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Devise: ${currency}\n*Serveur: ${serverType}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${finalEmail}\n*Prix unitaire: ${basePrice.toFixed(useDZD ? 0 : 2)} ${currency}\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(useDZD ? 0 : 2)} ${currency}\n*Total: ${totalPrice.toFixed(useDZD ? 0 : 2)} ${currency}`;

    if (method === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(detailedMessage)}`, '_blank');
        hideWaitingMessage();
        displayAlert(`Redirection vers WhatsApp...`);
        document.getElementById('orderForm').reset();
    } else if (method === 'email') {
        const templateParams = { 
            orderNumber, 
            product: currentProductName, 
            currency,
            serverType, 
            macAddress, 
            name, 
            phone: fullPhoneNumber, 
            email: finalEmail, 
            productPrice: basePrice.toFixed(useDZD ? 0 : 2), 
            quantity, 
            discount: discount.toFixed(useDZD ? 0 : 2), 
            totalPrice: totalPrice.toFixed(useDZD ? 0 : 2), 
            productDescription: currentProductDescription 
        };
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => {
                hideWaitingMessage();
                displayAlert(`Commande envoyée!<br>Numéro: ${orderNumber}`);
                document.getElementById('orderForm').reset();
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
