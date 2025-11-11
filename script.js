// --- Variables globales ---
let currentProductPrice = 0, currentProductPriceDZD = 0, currentProductName = "", currentProductDescription = "";
let userCountry = 'FR'; // Par défaut
let useDZD = false;

// --- Au début de DOMContentLoaded, ajouter la détection de pays ---
document.addEventListener('DOMContentLoaded', () => {
    // Détection du pays
    detectUserCountry();
    
    // Le reste de votre code existant...
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

// --- Modifier displayProducts() pour afficher le bon prix ---
function generateProductCards(productsToDisplay) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    productsToDisplay.forEach(product => {
        const firstImage = product.images?.[0] || '';
        const price = useDZD ? (product.price_dzd || product.price * 160) : product.price;
        const currency = useDZD ? ' DZD' : ' €';
        
        grid.innerHTML += `
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-card">
                    <div class="product-image-wrapper">
                        <img src="${firstImage}" alt="${product.name}" class="product-image" loading="lazy">
                        <div class="price-badge">${price.toFixed(useDZD ? 0 : 2)}${currency}</div>
                    </div>
                    <div class="product-footer">
                        <h2 class="product-name">${product.name}</h2>
                    </div>
                </div>
            </a>`;
    });
}

// --- Modifier initializeProductForm() ---
function initializeProductForm(product) {
    currentProductName = product.name;
    currentProductPrice = product.price;
    currentProductPriceDZD = product.price_dzd || product.price * 160; // Fallback si price_dzd non défini
    currentProductDescription = product.description;
    
    // Le reste de votre code existant...
    updateTotalPrice(); // Cette fonction doit être mise à jour aussi
}

// --- Modifier updateTotalPrice() ---
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

// --- Modifier sendOrder() pour inclure la devise ---
function sendOrder(method) {
    // ... code existant ...
    
    const basePrice = useDZD ? currentProductPriceDZD : currentProductPrice;
    const currency = useDZD ? 'DZD' : 'EUR';
    const discount = (basePrice * quantity) - totalPrice;
    
    const formattedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProductName}\n*Devise: ${currency}\n*Serveur: ${serverType}\n*MAC: ${macAddress}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${email}\n*Prix unitaire: ${basePrice.toFixed(useDZD ? 0 : 2)} ${currency}\n*Quantité: ${quantity}\n*Réduction: ${discount.toFixed(useDZD ? 0 : 2)} ${currency}\n*Total: ${totalPrice.toFixed(useDZD ? 0 : 2)} ${currency}`;
    
    // ... reste du code ...
}
