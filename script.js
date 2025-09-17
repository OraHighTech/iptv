// Prices for each product
const prices = {
    "KING 365": 55.00, "IRON TV MAX": 40.00, "NEO4K": 45.00,
	"ATLAS PRO": 29.00, "FOSTO": 25.00, "LYNX": 25.00,
    "QHDTV": 30.00, "IBO": 35.00, "SMARTERS PLAYER": 30.00
};

// Product server types
const productServerTypes = {
    "KING 365": ["xtream", "m3u", "mag"], "IRON TV MAX": ["code active", "xtream", "m3u", "mag"],
    "NEO4K": ["code active", "xtream", "m3u", "mag"], "ATLAS PRO": ["code active", "xtream", "m3u", "mag"],
    "FOSTO": ["code active", "xtream", "m3u", "mag"], "LYNX": ["code active", "xtream", "m3u", "mag"],
    "QHDTV": ["code active", "xtream", "m3u", "mag"], "IBO": ["code active", "xtream", "m3u", "mag"],
    "SMARTERS PLAYER": ["code active", "xtream", "m3u", "mag"]
};

let currentProductPrice = 0, currentProductName = "", currentProductImage = "", currentProductDescription = "";

// EmailJS Configuration for orders
const EMAILJS_SERVICE_ID = "service_geh79gu"; 
const EMAILJS_TEMPLATE_ID = "template_vny80g3";
const EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS"; 

document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error("EmailJS not initialized.");
    }

    // Wait function to ensure indicatif.js is loaded
    function waitForCountryCodes() {
        if (typeof countryCodes !== 'undefined') {
            populateCountryCodes('selectedCountryCode');
            populateCountryCodes('contactCountryCode');
        } else {
            setTimeout(waitForCountryCodes, 100);
        }
    }
    waitForCountryCodes();
    
    toggleServerFields();
    updateAllProductPrices();
});

// Function to convert country code (e.g., "FR") to flag emoji (🇫🇷)
function countryCodeToEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) {
        return '🏳️';
    }
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

// Function to populate dropdowns with flag emojis
function populateCountryCodes(selectId) {
    if (typeof countryCodes === 'undefined') {
        console.error("Country code list (countryCodes) not loaded.");
        return;
    }
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    selectElement.innerHTML = ''; 

    countryCodes.forEach(country => {
        const option = document.createElement("option");
        option.value = country.code;
        const flagEmoji = countryCodeToEmoji(country['code-in']);
        option.innerText = `${flagEmoji} ${country.name} (${country.code})`;
        selectElement.appendChild(option);
    });
    
    selectElement.value = "+33"; // France as default
}

function updateAllProductPrices() {
    const priceBadges = document.querySelectorAll('.price-badge');
    priceBadges.forEach(badge => {
        const productName = badge.dataset.priceId;
        if (prices[productName] !== undefined) {
            badge.innerText = `${prices[productName].toFixed(2)} €`;
        } else {
            badge.innerText = 'N/A';
        }
    });
}

function openBuyPopup(productName, price, imagePath, description) {
    currentProductName = productName;
    currentProductPrice = price; 
    currentProductImage = imagePath;
    currentProductDescription = description;
    const serverTypeSelect = document.getElementById('serverType');
    serverTypeSelect.innerHTML = ''; 
    const defaultTypes = ["code active", "xtream", "m3u", "mag"];
    const availableTypes = productServerTypes[productName] || defaultTypes;
    availableTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.innerText = type.charAt(0).toUpperCase() + type.slice(1).replace(' active', ' Active');
        serverTypeSelect.appendChild(option);
    });
    document.getElementById('popupImage').src = imagePath;
    document.getElementById('popupTitle').innerText = productName;
    document.getElementById('quantity').value = 1;
    updateTotalPrice(); 
    document.getElementById('popupDescription').innerText = description;
    
    document.getElementById('orderForm').reset();
    document.getElementById('selectedCountryCode').value = "+33";
    
    toggleServerFields(); 
    document.getElementById('buyPopup').style.display = 'flex';
}

function closeBuyPopup() {
    document.getElementById('buyPopup').style.display = 'none';
    clearErrors();
}

function toggleServerFields() {
    const serverTypeSelect = document.getElementById("serverType");
    if (!serverTypeSelect || !serverTypeSelect.value) return;
    const serverType = serverTypeSelect.value;
    const serverFields = document.getElementById('serverFields');
    serverFields.innerHTML = '';
    
    if (serverType === "mag") {
        serverFields.innerHTML = `
            <div class="form-group">
                <label for="macAddress">Adresse MAC:</label>
                <input type="text" id="macAddress" placeholder="e.g., 00:1A:2B:3C:4D:5E">
                <p class="error-message" id="macAddressError"></p>
            </div>
        `;
    }
}

function updateTotalPrice() {
    const quantityInput = document.getElementById("quantity");
    let quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        quantityInput.value = 1; 
    }
    let totalCalculatedPrice = currentProductPrice * quantity;
    if (quantity > 20) { totalCalculatedPrice *= 0.90; } 
    else if (quantity > 10) { totalCalculatedPrice *= 0.95; }
    document.getElementById('popupPrice').innerText = totalCalculatedPrice.toFixed(2) + " €";
}

function clearErrors() { document.querySelectorAll('.error-message').forEach(el => el.innerText = ''); }
function displayWaitingMessage() { document.getElementById('waitingMessage').style.display = 'flex'; }
function hideWaitingMessage() { document.getElementById('waitingMessage').style.display = 'none'; }

function displayAlert(message, type) {
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerHTML = message;
    customAlert.classList.remove('success', 'error');
    if (type) { customAlert.classList.add(type); }
    customAlert.style.display = 'flex';
}

function closeAlert() { document.getElementById('customAlert').style.display = 'none'; }

function generateOrderNumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

function sendOrder(method) {
    clearErrors();
    const quantity = parseInt(document.getElementById("quantity").value);
    const serverType = document.getElementById("serverType").value;
    const macAddressInput = document.getElementById('macAddress');
    const macAddress = macAddressInput ? macAddressInput.value.trim() : '';
    const name = document.getElementById("name").value.trim();
    const countryCode = document.getElementById("selectedCountryCode").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    let valid = true, firstErrorElement = null;

    if (!name) { valid = false; document.getElementById("nameError").innerText = "Veuillez entrer votre nom."; if (!firstErrorElement) firstErrorElement = document.getElementById("name"); }
    if (!phone) { valid = false; document.getElementById("phoneError").innerText = "Veuillez entrer un numéro."; if (!firstErrorElement) firstErrorElement = document.getElementById("phone"); }
    if (phone && !/^\d{8,14}$/.test(phone)) { valid = false; document.getElementById("phoneError").innerText = "Numéro incorrect."; if (!firstErrorElement) firstErrorElement = document.getElementById("phone"); }
    if (email && !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)) { valid = false; document.getElementById("emailError").innerText = "Email incorrect."; if (!firstErrorElement) firstErrorElement = document.getElementById("email"); }
    if (serverType === "mag") {
        if (!macAddress) { valid = false; document.getElementById('macAddressError').innerText = 'Veuillez entrer une adresse MAC.'; if (!firstErrorElement) firstErrorElement = document.getElementById('macAddress'); }
        else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress)) { valid = false; document.getElementById('macAddressError').innerText = 'Adresse MAC invalide.'; if (!firstErrorElement) firstErrorElement = document.getElementById('macAddress'); }
    }
    if (!valid) { if (firstErrorElement) { firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }
    
    displayWaitingMessage();
    let totalPrice = currentProductPrice * quantity;
    let discount = 0, discountPercent = 0;
    if (quantity > 20) { discountPercent = 10; totalPrice *= 0.90; } 
    else if (quantity > 10) { discountPercent = 5; totalPrice *= 0.95; }
    discount = (currentProductPrice * quantity) - totalPrice;
    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = `${countryCode}${phone}`;
    const formattedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Serveur: ${serverType}\n*MAC: ${macAddress||'N/A'}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${email||'N/A'}\n*Prix unitaire: ${currentProductPrice.toFixed(2)} €\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(2)} € (${discountPercent}%)\n*Total: ${totalPrice.toFixed(2)} €`;

    if (method === 'whatsapp') {
        const whatsappNumber = "213770759886";
        const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(formattedMessage)}`;
        window.open(whatsappURL, '_blank');
        hideWaitingMessage();
        displayAlert(`<i class="fab fa-whatsapp" style="font-size: 4em;"></i><br>Redirection vers WhatsApp...`, "success");
    } else if (method === 'email') {
        const templateParams = {
            orderNumber, product: currentProductName, serverType, macAddress: macAddress || 'N/A', name, 
            phone: fullPhoneNumber, email: email || 'N/A', productPrice: currentProductPrice.toFixed(2), 
            quantity, discount: discount.toFixed(2), discountPercent, totalPrice: totalPrice.toFixed(2),
            productDescription: currentProductDescription 
        };
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(() => {
                hideWaitingMessage();
                displayAlert(`<i class="fa fa-solid fa-circle-check" style="font-size: 4em;"></i><br>Commande envoyée!<br>Numéro: ${orderNumber}`, "success");
            })
            .catch((error) => {
                hideWaitingMessage();
                console.error("Échec de l'envoi de l'email:", error);
                displayAlert("Échec de l'envoi. Veuillez réessayer.", "error");
            });
    }
}

function sendContactViaWhatsApp() {
    clearErrors();
    const countryCode = document.getElementById("contactCountryCode").value;
    const phone = document.getElementById("contactPhone").value.trim();
    const subject = document.getElementById("contactSubject").value;
    const message = document.getElementById("contactMessage").value.trim();
    let valid = true, firstErrorElement = null;

    if (!phone) {
        valid = false;
        document.getElementById("contactPhoneError").innerText = "Veuillez entrer un numéro.";
        if (!firstErrorElement) firstErrorElement = document.getElementById("contactPhone");
    } else if (!/^\d{8,14}$/.test(phone)) {
        valid = false;
        document.getElementById("contactPhoneError").innerText = "Numéro incorrect.";
        if (!firstErrorElement) firstErrorElement = document.getElementById("contactPhone");
    }
    if (!message) {
        valid = false;
        document.getElementById("contactMessageError").innerText = "Veuillez écrire votre message.";
        if (!firstErrorElement) firstErrorElement = document.getElementById("contactMessage");
    }
    if (!valid) { if (firstErrorElement) { firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); } return; }

    const fullPhoneNumber = `${countryCode}${phone}`;
    const formattedMessage = `*Nouveau Message du Formulaire de Contact*\n\n*Numéro WhatsApp du client:* ${fullPhoneNumber}\n*Sujet:* ${subject}\n\n*Message:*\n${message}`;
    const whatsappNumber = "213770759886";
    const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(formattedMessage)}`;
    window.open(whatsappURL, '_blank');
    displayAlert(`<i class="fab fa-whatsapp" style="font-size: 4em;"></i><br>Redirection vers WhatsApp...`, "success");
    document.getElementById('contactForm').reset();
}