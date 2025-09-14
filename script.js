// Prices for each product
const prices = {
    "KING 365": 55.00,
    "IRON TV MAX": 40.00,
    "NEO4K": 45.00,
	"ATLAS PRO": 29.00,
    "FOSTO": 25.00,
    "LYNX": 25.00,
    "QHDTV": 30.00,
    "IBO": 35.00,
    "SMARTERS PLAYER": 30.00
    // Keep only IPTV prices as per reverting to previous version
};

let currentProductPrice = 0;
let currentProductName = "";
let currentProductImage = "";
let currentProductDescription = "";

// --- EmailJS Configuration ---
const EMAILJS_SERVICE_ID = "service_geh79gu"; 
const EMAILJS_TEMPLATE_ID = "template_vny80g3"; 
const EMAILJS_PUBLIC_KEY = "WNOIpj1FX2dDPSQMS"; 

document.addEventListener('DOMContentLoaded', () => {
    // Check if EmailJS is loaded and initialized
    if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error("EmailJS not initialized. Please ensure the EmailJS script is loaded and PUBLIC_KEY is set correctly.");
    }
    populateCountryCodes();
    toggleServerFields(); // This will initialize server fields visibility
    updateAllProductPrices(); // Update prices on all product cards
});

// Function to update prices on all product cards
function updateAllProductPrices() {
    const priceBadges = document.querySelectorAll('.price-badge');
    priceBadges.forEach(badge => {
        const productName = badge.dataset.priceId;
        if (prices[productName] !== undefined) { // Check if price exists
            badge.innerText = `${prices[productName].toFixed(2)} €`;
        } else {
            badge.innerText = 'N/A'; // Or hide the badge if price is not found
            console.warn(`Price not found for product: ${productName}`);
        }
    });
}

function openBuyPopup(productName, price, imagePath, description) {
    currentProductName = productName;
    currentProductPrice = price; 
    currentProductImage = imagePath;
    currentProductDescription = description;

    document.getElementById('popupImage').src = imagePath;
    document.getElementById('popupTitle').innerText = productName;
    
    // Reset quantity and update total price for the popup
    document.getElementById('quantity').value = 1;
    updateTotalPrice(); 
    
    document.getElementById('popupDescription').innerText = description;
    
    document.getElementById('orderForm').reset();
    toggleServerFields(); // Call to adjust server fields based on product
    
    document.getElementById('buyPopup').style.display = 'flex';
}

function closeBuyPopup() {
    document.getElementById('buyPopup').style.display = 'none';
    clearErrors();
}

function toggleServerFields() {
    const serverType = document.getElementById("serverType").value;
    const serverFields = document.getElementById('serverFields');
    serverFields.innerHTML = '';
    
    // This logic assumes all products are IPTV, as per reverting
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
    
    // Apply discounts based on quantity (assuming it applies to all IPTV products here)
    if (quantity > 20) {
        totalCalculatedPrice *= 0.90;
    } else if (quantity > 10) {
        totalCalculatedPrice *= 0.95;
    }

    document.getElementById('popupPrice').innerText = totalCalculatedPrice.toFixed(2) + " €";
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.innerText = '');
}

function displayWaitingMessage() {
    document.getElementById('waitingMessage').style.display = 'flex';
}

function hideWaitingMessage() {
    document.getElementById('waitingMessage').style.display = 'none';
}

function displayAlert(message, type) {
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.innerHTML = message;
    
    customAlert.classList.remove('success', 'error');
    if (type) {
        customAlert.classList.add(type);
    }
    customAlert.style.display = 'flex';
}

function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
    location.reload();
}

function generateOrderNumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
}

function populateCountryCodes() {
    const selectElement = document.getElementById("selectedCountryCode");
    const countryCodes = [
        { name: "France", code: "+33" },
        { name: "Spain", code: "+34" },
        { name: "Germany", code: "+49" },
        { name: "UK", code: "+44" },
        { name: "USA", code: "+1" },
        { name: "Canada", code: "+1" },
        { name: "Algeria", code: "+213" },
		{ name: "Morocco", code: "+212" },
        { name: "Tunisia", code: "+216" },
        { name: "Egypt", code: "+20" },
    ];
    countryCodes.forEach(country => {
        const option = document.createElement("option");
        option.value = country.code;
        option.innerText = `${country.name} (${country.code})`;
        selectElement.appendChild(option);
    });
    selectElement.value = "+213";
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

    let valid = true;
    let firstErrorElement = null;

    if (!name) { valid = false; document.getElementById("nameError").innerText = "Veuillez entrer votre nom."; if (!firstErrorElement) firstErrorElement = document.getElementById("nameError"); }
    if (!phone) { valid = false; document.getElementById("phoneError").innerText = "Veuillez entrer un numéro de téléphone."; if (!firstErrorElement) firstErrorElement = document.getElementById("phoneError"); }
    if (phone && !/^\d{8,14}$/.test(phone)) {
        valid = false; document.getElementById("phoneError").innerText = "Numéro de téléphone incorrect. Doit être entre 8 et 14 chiffres."; if (!firstErrorElement) firstErrorElement = document.getElementById("phoneError");
    }
    if (email && !/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)) { valid = false; document.getElementById("emailError").innerText = "Email incorrect."; if (!firstErrorElement) firstErrorElement = document.getElementById("emailError"); }

    // MAC address validation for MAG server type
    if (serverType === "mag") {
        if (!macAddress) {
            valid = false; document.getElementById('macAddressError').innerText = 'Veuillez entrer une adresse MAC.';
            if (!firstErrorElement) firstErrorElement = document.getElementById('macAddressError');
        }
        if (macAddress && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress)) {
            valid = false; document.getElementById('macAddressError').innerText = 'Veuillez entrer une adresse MAC valide.';
            if (!firstErrorElement) firstErrorElement = document.getElementById('macAddressError');
        }
    }

    if (!valid) {
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    displayWaitingMessage();

    let totalPrice = currentProductPrice * quantity;
    let discount = 0;
    let discountPercent = 0;

    if (quantity > 20) {
        discountPercent = 10;
        discount = totalPrice * 0.10;
        totalPrice *= 0.90;
    } else if (quantity > 10) {
        discountPercent = 5;
        discount = totalPrice * 0.05;
        totalPrice *= 0.95;
    }

    const orderNumber = generateOrderNumber();
    const fullPhoneNumber = `${countryCode}${phone}`;

    const formattedMessage =
        `*Nouvelle commande!\n` +
        `*Numéro de commande: ${orderNumber}\n` +
        `*Produit: ${currentProductName}\n` +
        `*Type de serveur: ${serverType}\n` + 
        `*Adresse MAC: ${macAddress || 'N/A'}\n` + 
        `*Nom: ${name}\n` +
        `*Numéro WhatsApp: ${fullPhoneNumber}\n` +
        `*Email: ${email || 'N/A'}\n` +
        `*Prix unitaire: ${currentProductPrice.toFixed(2)} €\n` +
        `*Quantité: ${quantity}\n` +
        `*Réduction: ${discount.toFixed(2)} € (${discountPercent}%)\n` +
        `*Total: ${totalPrice.toFixed(2)} €`;

    if (method === 'whatsapp') {
        const whatsappNumber = "213770759886";
        const whatsappURL = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(formattedMessage)}`;
        window.open(whatsappURL, '_blank');
        hideWaitingMessage();
        displayAlert(`<i class="fa fa-solid fa-circle-check" style="font-size: 4em;"></i><br>Commande envoyée avec succès!<br>Numéro de commande: ${orderNumber}`, "success");
    } else if (method === 'email') {
        const templateParams = {
            orderNumber: orderNumber,
            product: currentProductName,
            serverType: serverType,
            macAddress: macAddress || 'N/A',
            name: name,
            phone: fullPhoneNumber,
            email: email || 'N/A',
            productPrice: currentProductPrice.toFixed(2),
            quantity: quantity,
            discount: discount.toFixed(2),
            discountPercent: discountPercent,
            totalPrice: totalPrice.toFixed(2),
            productDescription: currentProductDescription 
        };
        
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
            .then(() => {
                hideWaitingMessage();
                displayAlert(`<i class="fa fa-solid fa-circle-check" style="font-size: 4em;"></i><br>Commande envoyée avec succès!<br>Numéro de commande: ${orderNumber}`, "success");
            })
            .catch((error) => {
                hideWaitingMessage();
                console.error("Failed to send email. Error: ", error);
                displayAlert("فشل إرسال الطلب عبر البريد الإلكتروني. يرجى المحاولة مرة أخرى لاحقًا أو التواصل عبر WhatsApp.", "error");
            });
    }
}