// --- Variables globales ---
let currentProductPrice = 0, currentProductName = "", currentProductDescription = "";
const EMAILJS_SERVICE_ID = "service_geh79gu", EMAILJS_TEMPLATE_ID = "template_vny80g3", EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS";
let currentPage = 1, productsPerPage = 8, currentCategory = 'All';
let currentImageIndex = 0;
let galleryInterval = null;

// --- Initialisation au chargement de la page ---
document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (url, elementId) => {
        fetch(url).then(response => response.ok ? response.text() : Promise.reject('File not found'))
            .then(data => { 
                const element = document.getElementById(elementId);
                if(element) element.innerHTML = data;
            })
            .catch(error => console.error(`Error loading component ${url}:`, error));
    };

    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    const pagePath = window.location.pathname;
    
    if (pagePath.includes('index.php') || pagePath.endsWith('/') ) {
        if (typeof products !== 'undefined' && products.length > 0) {
            setupCategoryFilters();
            displayProducts();
        } else {
             console.error("ERREUR: La variable 'products' n'a pas été fournie par index.php.");
        }
    } 
    else if (pagePath.includes('produit.php')) {
        if (typeof product !== 'undefined') {
            initializeProductPage(product);
        } else {
             console.error("ERREUR: La variable 'product' n'a pas été fournie par produit.php.");
        }
    }
     else if (pagePath.includes('contact.html')) {
        if (typeof countryCodes !== 'undefined') {
            populateCountryCodes('contactCountryCode');
        }
    }


    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);
});

// --- Fonctions de la page d'accueil ---
function displayProducts() {
    const filteredProducts = products.filter(p => currentCategory === 'All' || p.category === currentCategory);
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
        grid.innerHTML += `
            <a href="produit.php?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                        <div class="price-badge">${parseFloat(product.price).toFixed(2)} €</div>
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
function initializeProductPage(productData) {
    const excerptElement = document.getElementById('product-excerpt');
    if (excerptElement) {
        const fullDescription = productData.description || '';
        let firstLine = fullDescription.split('\n')[0];
        let excerpt = firstLine.substring(0, 120);
        if (fullDescription.length > excerpt.length) {
            excerpt += '...';
        }
        excerptElement.innerText = excerpt;
    }

    const fullDescElement = document.getElementById('product-description');
    if (fullDescElement) {
        fullDescElement.innerText = productData.description || '';
    }
    
    setupCombinedGallery(productData);
    initializeProductForm(productData);
    setupLightbox(productData);
    setupShareButtons(productData);
    
    if (typeof countryCodes !== 'undefined') {
       populateCountryCodes('selectedCountryCode');
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
        if (totalImages > 1) {
            galleryInterval = setInterval(() => {
                const newIndex = (currentImageIndex + 1) % totalImages;
                updateGallery(newIndex);
            }, 3000);
        }
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
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); const newIndex = (currentImageIndex - 1 + totalImages) % totalImages; updateGallery(newIndex); startAutoChange(); });
        
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '&#10095;';
        nextBtn.className = 'carousel-button next';
        nextBtn.style.display = 'block';
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); const newIndex = (currentImageIndex + 1) % totalImages; updateGallery(newIndex); startAutoChange(); });
        
        mainImageContainer.appendChild(prevBtn);
        mainImageContainer.appendChild(nextBtn);
    }
    
    updateGallery(0);
    startAutoChange();
}

function setupLightbox(product) {
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
        if(product.images.length > 1) {
             setTimeout(() => startAutoChange(), 500);
        }
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
            option.innerText = type;
            serverTypeSelect.appendChild(option);
        });
    }

    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.value = 1;

    updateTotalPrice();
    toggleServerFields();
}

function setupShareButtons(product) {
    // MODIFIÉ : On utilise l'URL directe de la page actuelle, qui est maintenant correcte pour le partage
    const shareUrl = window.location.href;
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
}

// --- Fonctions du formulaire et utilitaires ---
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

function toggleServerFields() {
    const serverType = document.getElementById("serverType")?.value;
    const serverFields = document.getElementById('serverFields');
    if (!serverFields) return;

    serverFields.innerHTML = ''; 

    if (serverType === "mag") {
        serverFields.innerHTML = `<div class="form-group"><label for="macAddress">Adresse MAC:</label><input type="text" id="macAddress" placeholder="Ex: 00:1A:2B:3C:4D:5E" maxlength="17"><p class="error-message" id="macAddressError"></p></div>`;
        const macAddressInput = document.getElementById('macAddress');
        if (macAddressInput) {
            macAddressInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                e.target.value = (value.match(/.{1,2}/g) || []).join(':').substring(0, 17);
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
    const alertMessage = document.getElementById('alertMessage');
    const customAlert = document.getElementById('customAlert');
    if (alertMessage) alertMessage.innerHTML = message;
    if (customAlert) customAlert.style.display = 'flex';
}

function closeAlert() {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) customAlert.style.display = 'none';
}

function generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function sendOrder(method) {
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (method === 'whatsapp' && !name && !phone) {
        const productUrl = window.location.href;
        const simpleMessage = `Bonjour, je souhaite commander ce produit :\n\n` +
                              `*Produit :* ${currentProductName}\n` +
                              `*Prix :* ${currentProductPrice.toFixed(2)} €\n` +
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
    }
    
    if (!valid) {
        const firstError = document.querySelector('.error-message:not(:empty)');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    displayWaitingMessage();
    const quantity = parseInt(document.getElementById("quantity").value);
    const totalPrice = parseFloat(document.getElementById('popupPrice').innerText);
    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = phone ? `${document.getElementById("selectedCountryCode").value}${phone}` : 'N/A';
    const macAddress = document.getElementById('macAddress')?.value.trim() || 'N/A';
    const serverType = document.getElementById("serverType").value;
    const finalEmail = email || 'N/A';
    const discount = (currentProductPrice * quantity) - totalPrice;
    
    const detailedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Serveur: ${serverType}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${finalEmail}\n*Prix unitaire: ${currentProductPrice.toFixed(2)} €\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(2)} €\n*Total: ${totalPrice.toFixed(2)} €`;

    if (method === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(detailedMessage)}`, '_blank');
        hideWaitingMessage();
        displayAlert(`Redirection vers WhatsApp...`);
        document.getElementById('orderForm').reset();
    } else if (method === 'email') {
        const templateParams = { orderNumber, product: currentProductName, serverType: serverType, macAddress: macAddress, name: name, phone: fullPhoneNumber, email: finalEmail, productPrice: currentProductPrice.toFixed(2), quantity: quantity, discount: discount.toFixed(2), totalPrice: totalPrice.toFixed(2), productDescription: currentProductDescription };
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