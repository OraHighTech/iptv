// formulaire-livraison.js
let currentDeliveryProduct = null;
let useDZD = false;

// Données pour la livraison
const deliveryZones = [
    null, // index 0 non utilisé
    { bureau: 300, domicile: 500 },
    { bureau: 350, domicile: 650 },
    { bureau: 400, domicile: 850 },
    { bureau: 600, domicile: 1000 },
    { bureau: 1150, domicile: 1450 },
    { bureau: 1200, domicile: 1650 },
];

const horsZoneCharges = {
    1: 100,
    2: 200,
    3: 300,
};

// Initialisation du formulaire de livraison
function initializeDeliveryForm(product) {
    currentDeliveryProduct = product;
    
    // Vérifier si l'utilisateur est en Algérie
    checkAlgeriaDelivery();
    
    // Mettre à jour le nom du produit
    document.getElementById('delivery-product-name').textContent = product.name;
    
    // Initialiser les prix
    updateDeliveryPrices();
    
    // Initialiser les wilayas
    initializeWilayas();
}

// Vérifier si la livraison est disponible (Algérie seulement)
async function checkAlgeriaDelivery() {
    try {
        const response = await fetch('https://api.ipdata.co/?api-key=916c6b6e4d160441313fb81c071aa9aadd988baa6e8e4361cfa6ad38');
        const data = await response.json();
        useDZD = (data.country_code === 'DZ');
        
        if (!useDZD) {
            showDeliveryNotAvailable();
        }
    } catch (error) {
        console.error('Erreur détection pays:', error);
        useDZD = false;
        showDeliveryNotAvailable();
    }
}

function showDeliveryNotAvailable() {
    const deliveryForm = document.querySelector('.delivery-form');
    if (deliveryForm) {
        deliveryForm.innerHTML = `
            <div class="delivery-not-available">
                <h3>🚚 Livraison non disponible</h3>
                <p>La livraison physique est disponible uniquement en Algérie.</p>
                <p>Pour les autres pays, veuillez nous contacter directement.</p>
                <button class="btn btn-whatsapp" onclick="contactUs()">
                    <i class="fab fa-whatsapp"></i> Nous contacter
                </button>
            </div>
        `;
    }
}

function contactUs() {
    window.open('https://api.whatsapp.com/send?phone=213770759886&text=Bonjour, je souhaite commander un produit physique', '_blank');
}

// Mise à jour des prix
function updateDeliveryPrices() {
    if (!currentDeliveryProduct) return;
    
    const price = useDZD ? (currentDeliveryProduct.price_dzd || currentDeliveryProduct.price * 160) : currentDeliveryProduct.price;
    const currency = useDZD ? ' DZD' : ' €';
    const priceFormatted = useDZD ? price.toFixed(0) : price.toFixed(2);
    
    document.getElementById('productPrice').textContent = priceFormatted + currency;
    document.getElementById('delivery-productPrice-display').textContent = priceFormatted + currency;
    
    updateDeliveryTotalPrice();
}

// Initialisation des wilayas
function initializeWilayas() {
    const wilayaSelect = document.getElementById('delivery-wilaya');
    wilayaSelect.innerHTML = '<option value="">الولاية</option>';
    
    if (typeof wilayasCommunes !== 'undefined') {
        for (const wilaya in wilayasCommunes) {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            wilayaSelect.appendChild(option);
        }
        
        wilayaSelect.addEventListener('change', updateDeliveryCommunes);
    }
}

// Mise à jour des communes
function updateDeliveryCommunes() {
    const selectedWilaya = document.getElementById('delivery-wilaya').value;
    const communeSelect = document.getElementById('delivery-commune');
    
    communeSelect.innerHTML = '<option value="">البلدية</option>';
    communeSelect.disabled = true;
    
    if (selectedWilaya && wilayasCommunes && wilayasCommunes[selectedWilaya]) {
        const communes = wilayasCommunes[selectedWilaya].communes;
        
        for (const commune in communes) {
            const option = document.createElement('option');
            option.value = commune;
            option.textContent = commune;
            communeSelect.appendChild(option);
        }
        
        communeSelect.disabled = false;
        communeSelect.addEventListener('change', updateDeliveryFee);
    }
    
    updateDeliveryFee();
}

// Calcul des frais de livraison
function updateDeliveryFee() {
    const selectedWilaya = document.getElementById('delivery-wilaya').value;
    const selectedCommune = document.getElementById('delivery-commune').value;
    let deliveryFee = 0;
    
    if (selectedWilaya && selectedCommune && wilayasCommunes && wilayasCommunes[selectedWilaya]) {
        const zone = wilayasCommunes[selectedWilaya].zone;
        const baseFee = deliveryZones[zone] ? deliveryZones[zone].domicile : 500;
        const horsZoneFee = wilayasCommunes[selectedWilaya].communes[selectedCommune].horsZone ? 
                           horsZoneCharges[wilayasCommunes[selectedWilaya].communes[selectedCommune].horsZone] || 0 : 0;
        deliveryFee = baseFee + horsZoneFee;
    }
    
    document.getElementById('delivery-fee').textContent = deliveryFee + ' دج';
    updateDeliveryTotalPrice();
}

// Gestion de la quantité
function increaseDeliveryQuantity() {
    const quantityInput = document.getElementById('delivery-quantity');
    let quantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = quantity + 1;
    document.getElementById('delivery-quantity-display').textContent = quantity + 1;
    updateDeliveryTotalPrice();
}

function decreaseDeliveryQuantity() {
    const quantityInput = document.getElementById('delivery-quantity');
    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
        document.getElementById('delivery-quantity-display').textContent = quantity - 1;
        updateDeliveryTotalPrice();
    }
}

// Mise à jour du prix total
function updateDeliveryTotalPrice() {
    if (!currentDeliveryProduct) return;
    
    const quantity = parseInt(document.getElementById('delivery-quantity').value) || 1;
    const productPrice = useDZD ? (currentDeliveryProduct.price_dzd || currentDeliveryProduct.price * 160) : currentDeliveryProduct.price;
    const deliveryFee = parseInt(document.getElementById('delivery-fee').textContent.replace(/[^\d]/g, '')) || 0;
    
    const totalPrice = (productPrice * quantity) + deliveryFee;
    const currency = useDZD ? ' دج' : ' €';
    const decimals = useDZD ? 0 : 2;
    
    document.getElementById('delivery-totalPrice').textContent = totalPrice.toFixed(decimals) + currency;
}

// Validation du formulaire
function validateDeliveryForm() {
    const name = document.getElementById('delivery-name').value.trim();
    const phone = document.getElementById('delivery-phone').value.trim();
    const wilaya = document.getElementById('delivery-wilaya').value;
    const commune = document.getElementById('delivery-commune').value;
    const address = document.getElementById('delivery-address').value.trim();
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message-f, .error-message').forEach(el => el.textContent = '');
    
    if (!name) {
        document.getElementById('deliveryNameError').textContent = 'الرجاء إدخال الاسم';
        isValid = false;
    }
    
    if (!phone) {
        document.getElementById('deliveryPhoneError').textContent = 'الرجاء إدخال رقم الهاتف';
        isValid = false;
    }
    
    if (!wilaya) {
        document.getElementById('wilayaError').textContent = 'الرجاء اختيار الولاية';
        isValid = false;
    }
    
    if (!commune) {
        document.getElementById('communeError').textContent = 'الرجاء اختيار البلدية';
        isValid = false;
    }
    
    if (!address) {
        document.getElementById('deliveryAddressError').textContent = 'الرجاء إدخال العنوان';
        isValid = false;
    }
    
    return isValid;
}

// Envoi de commande WhatsApp
function sendDeliveryOrder() {
    if (!validateDeliveryForm()) return;
    
    const name = document.getElementById('delivery-name').value.trim();
    const phone = document.getElementById('delivery-phone').value.trim();
    const wilaya = document.getElementById('delivery-wilaya').value;
    const commune = document.getElementById('delivery-commune').value;
    const address = document.getElementById('delivery-address').value.trim();
    const quantity = document.getElementById('delivery-quantity').value;
    
    const productPrice = document.getElementById('delivery-productPrice-display').textContent;
    const deliveryFee = document.getElementById('delivery-fee').textContent;
    const totalPrice = document.getElementById('delivery-totalPrice').textContent;
    
    const message = `🎯 **طلب جديد للشحن** 🎯

📦 المنتج: ${currentDeliveryProduct.name}
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📍 الولاية: ${wilaya}
🏘️ البلدية: ${commune}
📮 العنوان: ${address}
🔢 الكمية: ${quantity}
💰 سعر المنتج: ${productPrice}
🚚 مصاريف التوصيل: ${deliveryFee}
💵 السعر الإجمالي: ${totalPrice}

شكرا لثقتكم! 🚀`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
