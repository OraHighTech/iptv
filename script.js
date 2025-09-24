// PARTIE 2 : LOGIQUE DU SITE (Version finale)
const prices = Object.fromEntries(products.map(p => [p.name, p.price]));
// L'objet productServerTypes a été supprimé car il est maintenant intégré dans products-db.js

let currentProductPrice = 0, currentProductName = "", currentProductImage = "", currentProductDescription = "";
const EMAILJS_SERVICE_ID = "service_geh79gu", EMAILJS_TEMPLATE_ID = "template_vny80g3", EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS";

document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (url, elementId) => {
        fetch(url).then(response => response.ok ? response.text() : Promise.reject('File not found'))
            .then(data => { document.getElementById(elementId).innerHTML = data; })
            .catch(error => console.error(`Error loading component ${url}:`, error));
    };
    loadComponent('header.html', 'header-placeholder');
    loadComponent('footer.html', 'footer-placeholder');

    const pagePath = window.location.pathname;
    if (pagePath.includes('index.html') || pagePath === '/' || pagePath.endsWith('/')) {
        generateProductCards();
    } else if (pagePath.includes('product.html')) {
        populateProductPage();
    }

    if (typeof emailjs !== 'undefined') emailjs.init(EMAILJS_PUBLIC_KEY);
    function waitForCountryCodes() {
        if (typeof countryCodes !== 'undefined') {
            if (document.getElementById('selectedCountryCode')) populateCountryCodes('selectedCountryCode');
            if (document.getElementById('contactCountryCode')) populateCountryCodes('contactCountryCode');
        } else { setTimeout(waitForCountryCodes, 100); }
    }
    waitForCountryCodes();
});

function generateProductCards() {
    const grid = document.querySelector('.products-grid');
    if (!grid || typeof products === 'undefined') return;
    grid.innerHTML = '';
    products.forEach(product => {
        const cardHTML = `
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <span class="price-badge">${product.price.toFixed(2)} €</span>
                    </div>
                    <div class="product-footer">
                        <h2 class="product-name">${product.name}</h2>
                    </div>
                </div>
            </a>`;
        grid.innerHTML += cardHTML;
    });
}

function populateProductPage() {
    if (typeof products === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = products.find(p => p.id === productId);

    if (product) {
        document.title = `${product.name} - IPTV Store`;
        document.getElementById('product-name').innerText = product.name;
        document.getElementById('product-image').src = product.image;
        document.getElementById('product-image').alt = `Image de ${product.name}`;
        document.getElementById('product-description').innerText = product.description;
        initializeProductForm(product); // On passe l'objet produit entier
    } else {
        const container = document.querySelector('.product-page-container');
        if (container) container.innerHTML = '<h1>Produit non trouvé</h1><p>Ce produit n\'existe pas.</p>';
    }
}

// ✨ La fonction accepte maintenant l'objet produit entier
function initializeProductForm(product) {
    currentProductName = product.name;
    currentProductPrice = product.price;
    currentProductImage = product.image;
    currentProductDescription = product.description;

    const serverTypeSelect = document.getElementById('serverType');
    if (!serverTypeSelect) return;
    serverTypeSelect.innerHTML = '';

    // ✨ On utilise directement la propriété du produit
    const availableTypes = product.serverTypes || [];
    availableTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.innerText = type.charAt(0).toUpperCase() + type.slice(1).replace(' active', ' Active');
        serverTypeSelect.appendChild(option);
    });
    
    const quantityInput = document.getElementById('quantity');
    if (quantityInput) quantityInput.value = 1;
    updateTotalPrice();
    toggleServerFields();
}

// --- Le reste des fonctions ne change pas ---
function countryCodeToEmoji(countryCode) { if (!countryCode || countryCode.length !== 2) return '🏳️'; const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt()); return String.fromCodePoint(...codePoints); }
function populateCountryCodes(selectId) { if (typeof countryCodes === 'undefined') return; const selectElement = document.getElementById(selectId); if (!selectElement) return; selectElement.innerHTML = ''; countryCodes.forEach(country => { const option = document.createElement("option"); option.value = country.code; option.innerText = `${countryCodeToEmoji(country['code-in'])} ${country.name} (${country.code})`; selectElement.appendChild(option); }); selectElement.value = "+33"; }
function toggleServerFields() { const serverTypeSelect = document.getElementById("serverType"); if (!serverTypeSelect || !serverTypeSelect.value) return; const serverType = serverTypeSelect.value; const serverFields = document.getElementById('serverFields'); serverFields.innerHTML = ''; if (serverType === "mag") { serverFields.innerHTML = `<div class="form-group"><label for="macAddress">Adresse MAC:</label><input type="text" id="macAddress" placeholder="e.g., 00:1A:2B:3C:4D:5E"><p class="error-message" id="macAddressError"></p></div>`; } }
function updateTotalPrice() { const quantityInput = document.getElementById("quantity"); const priceDisplay = document.getElementById('popupPrice'); if (!quantityInput || !priceDisplay) return; let quantity = parseInt(quantityInput.value); if (isNaN(quantity) || quantity < 1) { quantity = 1; quantityInput.value = 1; } let total = currentProductPrice * quantity; if (quantity > 20) total *= 0.90; else if (quantity > 10) total *= 0.95; priceDisplay.innerText = total.toFixed(2) + " €"; }
function clearErrors() { document.querySelectorAll('.error-message').forEach(el => el.innerText = ''); }
function displayWaitingMessage() { document.getElementById('waitingMessage').style.display = 'flex'; }
function hideWaitingMessage() { document.getElementById('waitingMessage').style.display = 'none'; }
function displayAlert(message) { document.getElementById('alertMessage').innerHTML = message; document.getElementById('customAlert').style.display = 'flex'; }
function closeAlert() { document.getElementById('customAlert').style.display = 'none'; }
function generateOrderNumber() { return `ORD-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`; }
function sendOrder(method) { clearErrors(); let valid = true; const name = document.getElementById("name").value.trim(); const phone = document.getElementById("phone").value.trim(); if (!name) { valid = false; document.getElementById("nameError").innerText = "Veuillez entrer votre nom."; } if (!phone) { valid = false; document.getElementById("phoneError").innerText = "Veuillez entrer un numéro."; } if (!valid) return; displayWaitingMessage(); const quantity = parseInt(document.getElementById("quantity").value); const totalPrice = parseFloat(document.getElementById('popupPrice').innerText); const discount = (currentProductPrice * quantity) - totalPrice; const orderNumber = generateOrderNumber(); const fullPhoneNumber = `${document.getElementById("selectedCountryCode").value}${phone}`; const macAddress = document.getElementById('macAddress') ? document.getElementById('macAddress').value.trim() : 'N/A'; const formattedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Serveur: ${document.getElementById("serverType").value}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${document.getElementById("email").value.trim()||'N/A'}\n*Prix unitaire: ${currentProductPrice.toFixed(2)} €\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(2)} €\n*Total: ${totalPrice.toFixed(2)} €`; if (method === 'whatsapp') { const whatsappURL = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`; window.open(whatsappURL, '_blank'); hideWaitingMessage(); displayAlert(`Redirection vers WhatsApp...`); } else if (method === 'email') { const templateParams = { orderNumber, product: currentProductName, serverType: document.getElementById("serverType").value, macAddress, name, phone: fullPhoneNumber, email: document.getElementById("email").value.trim() || 'N/A', productPrice: currentProductPrice.toFixed(2), quantity, discount: discount.toFixed(2), totalPrice: totalPrice.toFixed(2), productDescription: currentProductDescription }; emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams).then(() => { hideWaitingMessage(); displayAlert(`Commande envoyée!<br>Numéro: ${orderNumber}`); }, (error) => { hideWaitingMessage(); displayAlert("Échec de l'envoi. Veuillez réessayer."); }); } }
function sendContactViaWhatsApp() { clearErrors(); let valid = true; const phone = document.getElementById("contactPhone").value.trim(); const message = document.getElementById("contactMessage").value.trim(); if (!phone) { valid = false; document.getElementById("contactPhoneError").innerText = "Veuillez entrer un numéro."; } if (!message) { valid = false; document.getElementById("contactMessageError").innerText = "Veuillez écrire votre message."; } if (!valid) return; const fullPhoneNumber = `${document.getElementById("contactCountryCode").value}${phone}`; const formattedMessage = `*Nouveau Message du Formulaire de Contact*\n\n*Numéro WhatsApp du client:* ${fullPhoneNumber}\n*Sujet:* ${document.getElementById("subject").value}\n\n*Message:*\n${message}`; const whatsappURL = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(formattedMessage)}`; window.open(whatsappURL, '_blank'); displayAlert(`Redirection vers WhatsApp...`); document.getElementById('contactForm').reset(); }