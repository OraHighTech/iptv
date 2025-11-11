// =================================================================================
// NOTE: CE SCRIPT S'ATTEND À CE QUE 'products' (de products-db.js) SOIT DÉJÀ CHARGÉ
// VERSION SÉCURISÉE (DÉFENSIVE) - V5 - (Code nettoyé des typos)
// =================================================================================

// --- Variables globales ---
let currentProductPrice = 0, currentProductName = "", currentProductDescription = "";
const EMAILJS_SERVICE_ID = "service_geh79gu", EMAILJS_TEMPLATE_ID = "template_vny80g3", EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS";
let currentPage = 1, productsPerPage = 8, currentCategory = 'All';
let currentImageIndex = 0; 
let galleryInterval = null; 

// --- Variables Géo-Prix ---
let userCountryCode = null; // "DZ", "FR", etc.
let userCurrency = 'EUR'; // 'EUR' ou 'DZD'
let userCurrencySymbol = '€'; // '€' ou 'دج'

/**
 * --- FONCTION: GÉOLOCALISATION DE L'UTILISATEUR ---
 */
async function getUserLocation() {
    try {
        // ▼▼▼ Utilisation de l'API "freegeoip.app" ▼▼▼
        const response = await fetch('https://freegeoip.app/json/'); 
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.statusText}`);
        }
        const data = await response.json();
        return data; // Cette API renvoie { "country_code": "DZ" }
    } catch (error) {
        console.warn("Impossible de récupérer la géolocalisation (API: freegeoip.app):", error);
        throw error; 
    }
}

// --- Initialisation au chargement de la page (MODIFIÉE en async) ---
document.addEventListener('DOMContentLoaded', async () => { 
  
    const loadComponent = (url, elementId) => {
        fetch(url).then(response => response.ok ? response.text() : Promise.reject('File not found'))
            .then(data => {  
                const element = document.getElementById(elementId);
                if(element) element.innerHTML = data;
            })
            .catch(error => console.error(`Error loading component ${url}:`, error));
    };

    // Chargement header/footer
    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    // --- Logique d'Init Géo ---
    try {
        const locationData = await getUserLocation(); // Attend la localisation
        
        // ▼▼▼ Le nom du champ est "country_code" (avec _) ▼▼▼
        userCountryCode = locationData.country_code; 
        
        if (userCountryCode === 'DZ') {
            userCurrency = 'DZD';
            userCurrencySymbol = 'دج';
            console.log("Pays détecté: Algérie (DZ). Utilisation du Dinar.");
        } else {
            console.log(`Pays détecté: ${userCountryCode || 'Inconnu'}. Utilisation de l'Euro.`);
        }
    } catch (error) {
        console.warn("Erreur de géolocalisation, utilisation de l'Euro (€) par défaut.");
    }

    // Vérification critique des données
    if (typeof products === 'undefined') {
        console.error("ERREUR CRITIQUE: La variable 'products' n'est pas définie.");
        const body = document.querySelector('body');
        if(body) {
            body.innerHTML = '<div style="padding: 40px; text-align: center; font-family: sans-serif;"><h1>Erreur de chargement</h1><p>Impossible de charger la base de données des produits (products-db.js).</p></div>';
        }
        return; 
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

// --- VERSION SÉCURISÉE (DÉFENSIVE) ---
function generateProductCards(productsToDisplay) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    productsToDisplay.forEach(product => {
        const firstImage = product.images?.[0] || '';

        // --- LOGIQUE DE PRIX SÉCURISÉE (DÉFENSIVE) ---
        let displayPrice, priceString;

        // 1. Vérifie si le prix est au NOUVEAU format (objet)
        if (typeof product.price === 'object' && product.price !== null && 'eur' in product.price && 'dzd' in product.price) {
            if (userCountryCode === 'DZ') {
                displayPrice = product.price.dzd;
                priceString = `${displayPrice.toFixed(0)} ${userCurrencySymbol}`; // DZD sans décimales
            } else {
                displayPrice = product.price.eur;
                priceString = `${displayPrice.toFixed(2)} ${userCurrencySymbol}`; // EUR avec 2 décimales
            }
        } 
        // 2. Sinon, utilise l'ANCIEN format (juste un nombre)
        else {
            displayPrice = product.price;
            priceString = `${displayPrice.toFixed(2)} €`; // Affiche en Euro par défaut pour ne pas casser
            console.warn(`Produit "${product.name}" (ID: ${product.id}) a un format de prix ancien.`);
        }
        // --- FIN LOGIQUE PRIX ---

        grid.innerHTML += `
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                        <div class="price-badge">${priceString}</div>
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
        
        // --- LOGIQUE DE PRIX SÉCURISÉE (DÉFENSIVE) ---
        let selectedPrice, selectedCurrency;
        if (typeof product.price === 'object' && product.price !== null && 'eur' in product.price && 'dzd' in product.price) {
            if (userCountryCode === 'DZ') {
                selectedPrice = product.price.dzd;
                selectedCurrency = 'DZD';
            } else {
                selectedPrice = product.price.eur;
                selectedCurrency = 'EUR';
            }
        } 
        else {
            selectedPrice = product.price; 
            selectedCurrency = 'EUR'; 
            console.warn(`Produit "${product.name}" (ID: ${product.id}) a un format de prix ancien.`);
        }
        // --- FIN LOGIQUE PRIX ---

        // --- SEO ---
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
                "priceCurrency": selectedCurrency, 
                "price": selectedPrice.toFixed(2), 
                "availability": "https://schema.org/InStock", 
                "itemCondition": "https://schema.org/NewCondition" 
            }
        };
        const schemaScript = document.getElementById('product-schema');
        if(schemaScript){
            schemaScript.textContent = JSON.stringify(schema);
        }
        
        // --- AFFICHAGE DES INFORMATIONS ---
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-description').innerText = product.description;

        const excerptElement = document.getElementById('product-excerpt');
        if (excerptElement) {
            const fullDescription = product.description || '';
            let firstLine = fullDescription.split('\n')[0];
            let excerpt = firstLine.substring(0, 120);
            if (fullDescription.length > excerpt.length) {
                excerpt += '...';
            }
            excerptElement.innerText = excerpt;
        }
        
        // --- Logique pour les boutons de partage ---
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
        initializeProductForm(product, selectedPrice); 
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
    
    const startAutoChange = () => {
        clearInterval(galleryInterval); 
        galleryInterval = setInterval(() => {
            const newIndex = (currentImageIndex + 1) % totalImages;
            updateGallery(newIndex);
        }, 3000); 
    };

    allThumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            updateGallery(index);
            startAutoChange(); 
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
            startAutoChange(); 
        });

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.className = 'carousel-button next';
        nextBtn.style.display = 'block';
      _nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentImageIndex + 1) % totalImages;
            updateGallery(newIndex);
            startAutoChange(); 
        });

        mainImageContainer.appendChild(prevBtn);
        mainImageContainer.appendChild(nextBtn);
        
        startAutoChange(); 
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
            clearInterval(galleryInterval); 
            lightboxImage.src = activeImg.src;
            lightbox.style.display = 'flex';
        }
    });
    
    const closeLightbox = () => {  
        lightbox.style.display = 'none';
        const product = products.find(p => p.id === new URLSearchParams(window.location.search).get('id'));
        if (product && product.images && product.images.length > 1) {
            startAutoChange();
        }
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {  
        if (e.target === lightbox) closeLightbox();  
    });
}

function initializeProductForm(product, geoPrice) { 
    currentProductName = product.name;
    currentProductPrice = geoPrice; 
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
    
    if (userCountryCode) {
        const matchingCountry = countryCodes.find(c => c['code-in'] === userCountryCode);
        if (matchingCountry) {
            selectElement.value = matchingCountry.code;
        } else {
            selectElement.value = "+33"; 
        }
    } else {
        selectElement.value = "+33"; 
    }
}

function toggleServerFields() {
    const serverType = document.getElementById("serverType")?.value;
    const serverFields = document.getElementById('serverFields');
    if (!serverFields) return;

    serverFields.innerHTML = ''; 

    if (serverType === "mag") {
        serverFields.innerHTML = `<br><div class="form-group">
                                      <i class="fas fa-network-wired icon"></i>
                                      <input type="text" id="macAddress" placeholder="Ex: 00:1A:2B:3C:4D:5E" maxlength="17">
                                  </div>`;
        
        const macAddressInput = document.getElementById('macAddress');
        if (macAddressInput) {
            macAddressInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
                let formattedValue = (value.match(/.{1,2}/g) || []).join(':');
                e.target.value = formattedValue;
            });
        }
    }
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById("quantity")?.value || 1);
    const priceDisplay = document.getElementById('popupPrice');
    if (!priceDisplay) return;

    let total = currentProductPrice * (quantity || 1);
    if (quantity > 20) total *= 0.9;
    else if (quantity > 10) total *= 0.95;
    
    const formattedTotal = total.toFixed(userCurrency === 'EUR' ? 2 : 0);
    priceDisplay.innerText = `${formattedTotal} ${userCurrencySymbol}`;
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
    const formatPrice = (price) => price.toFixed(userCurrency === 'EUR' ? 2 : 0);

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (method === 'whatsapp' && !name && !phone) {
        const productUrl = window.location.href;
        const simpleMessage = `Bonjour, je souhaite commander ce produit :\n\n` +
                              `*Produit :* ${currentProductName}\n` +
                              `*Prix :* ${formatPrice(currentProductPrice)} ${userCurrencySymbol}\n` + 
                              `*Lien :* ${productUrl}`;
        
        const whatsappUrl = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(simpleMessage)}`;
        window.open(whatsappUrl, '_blank');
        displayAlert('Redirection vers WhatsApp...');
        return;  
    }

    clearErrors();
    let valid = true;
    const email = document.getElementById("email").value.trim();
    const phoneRegex = /^\d{7,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
        valid = false;
        document.getElementById("nameError").innerText = "Veuillez entrer votre nom.";
    }

    if (method === 'email' && !phone) {
        valid = false;
        document.getElementById("phoneError").innerText = "Veuillez entrer un numéro de téléphone.";
    } else if (phone && !phoneRegex.test(phone.replace(/[\s-()]/g, ''))) {
        valid = false;
        document.getElementById("phoneError").innerText = "Le format du numéro est invalide.";
    }

    if (email && !emailRegex.test(email)) {
        valid = false;
        document.getElementById("emailError").innerText = "Veuillez entrer une adresse email valide.";
C    }
    
    if (!valid) {
        const firstError = document.querySelector('.error-message:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    displayWaitingMessage();
    const quantity = parseInt(document.getElementById("quantity").value);
    const totalPrice = parseFloat(document.getElementById('popupPrice').innerText.replace(/[^0-9.]/g, '')); 
    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = phone ? `${document.getElementById("selectedCountryCode").value}${phone}` : 'N/A';
    const macAddress = document.getElementById('macAddress')?.value.trim() || 'N/A';
    const serverType = document.getElementById("serverType").value;
    const finalEmail = email || 'N/A';
    const discount = (currentProductPrice * quantity) - totalPrice;
    
    const detailedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Serveur: ${serverType}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${finalEmail}\n*Prix unitaire: ${formatPrice(currentProductPrice)} ${userCurrencySymbol}\n*Quantité: ${quantity}\n*Réduction: ${formatPrice(discount)} ${userCurrencySymbol}\n*Total: ${formatPrice(totalPrice)} ${userCurrencySymbol}`;

    if (method === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(detailedMessage)}`, '_blank');
        hideWaitingMessage();
        displayAlert(`Redirection vers WhatsApp...`);
        document.getElementById('orderForm').reset();
    } else if (method === 'email') {
        const templateParams = { 
            orderNumber, 
            product: currentProductName, 
            serverType, 
            macAddress, 
            name, 
            phone: fullPhoneNumber, 
            email: finalEmail, 
            productPrice: `${formatPrice(currentProductPrice)} ${userCurrencySymbol}`,
            quantity, 
            discount: `${formatPrice(discount)} ${userCurrencySymbol}`, 
            totalPrice: `${formatPrice(totalPrice)} ${userCurrencySymbol}`, 
            productDescription: currentProductDescription 
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => {
                hideWaitingMessage();
                displayAlert(`Commande envoyée!<br>Numéro: ${orderNumber}`);
                document.getElementById('orderForm').reset();
            }, (err) => {
                hideWaitingMessage();
                displayAlert("Échec de l'envoi. Veuillez réessayer. Erreur: " + JSON.stringify(err));
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
  S   const formattedMessage = `*Nouveau Message du Formulaire de Contact*\n\n*Numéro WhatsApp du client:* ${fullPhoneNumber}\n*Sujet:* ${subject}\n\n*Message:*\n${message}`;
    window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`, '_blank');
    displayAlert(`Redirection vers WhatsApp...`);
    document.getElementById('contactForm')?.reset();
}
