// formulaire-livraison.js
let currentDeliveryProduct = null;
let currentDeliveryUseDZD = false;
let currentDeliveryType = 'domicile';

const deliveryZones = [
    null, // index 0 non utilisé
    { bureau: 300, domicile: 500 },
    { bureau: 350, domicile: 650 },
    { bureau: 400, domicile: 850 },
    { bureau: 600, domicile: 1000 },
    { bureau: 1150, domicile: 1450 },
    { bureau: 1200, domicile: 1650 },
];

const horsZoneCharges = { 1: 100, 2: 200, 3: 300 };

// Créer le formulaire physique
function createPhysicalForm(product, useDZD) {
    currentDeliveryProduct = product;
    currentDeliveryUseDZD = useDZD;
    
    const price = useDZD ? (product.price_dzd || product.price * 160) : product.price;
    const currency = useDZD ? ' DZD' : ' €';
    const priceFormatted = useDZD ? price.toFixed(0) : price.toFixed(2);
    
    return `
        <div class="product-details delivery-form">
            <p class="price" id="productPriceDelivery">${priceFormatted}${currency}</p>
            <div class="form-all">
                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-user"></i>
                        </div>
                        <input id="delivery-name" placeholder="الإسم و اللقب" required type="text" />
                    </label>
                    <div class="error-message-f" id="deliveryNameError"></div>
                </div>

                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-phone"></i>
                        </div>
                        <input id="delivery-phone" placeholder="رقم الهاتف" required type="tel" />
                    </label>
                    <div class="error-message-f" id="deliveryPhoneError"></div>
                </div>

                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-light fa-truck-fast"></i>
                        </div>
                        <div class="button-shipping">
                            <button class="delivery-btn" id="bureauBtn" type="button"><i class="fa fa-building"></i> توصيل الى المكتب</button>
                            <button class="delivery-btn" id="domicileBtn" type="button"><i class="fa fa-solid fa-people-carry-box"></i> توصيل الى باب الدار</button>
                        </div>
                    </label>
                </div>

                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-road"></i>
                        </div>
                        <div class="select-city">
                            <div class="wilaya">
                                <select id="delivery-wilaya">
                                    <option value="">الولاية</option>
                                </select>
                                <div class="error-message" id="wilayaError"></div>
                            </div>
                            <div class="commune">
                                <select id="delivery-commune" disabled>
                                    <option value="">البلدية</option>
                                </select>
                                <div class="error-message" id="communeError"></div>
                            </div>
                        </div>
                    </label>
                </div>

                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-map"></i>
                        </div>
                        <input id="delivery-address" placeholder="العنوان" required type="text" />
                    </label>
                </div>

                <div class="Order-Summary">
                    <div class="Order-Summary-t"><i class="fa fa-shopping-basket"></i> ملخص الطلب</div>
                    <div class="order-prod">
                        <div class="order-prod-t-p-q">
                            <p class="orderTitle">${product.name}</p>
                            <div class="OderPrice">
                                <p id="orderquantity">1</p>
                                <p>x</p>
                                <p id="Oderprice">${priceFormatted}${currency}</p>
                            </div>
                        </div>
                        <div class="order-prod-d">
                            <p>سعر التوصيل :</p>
                            <p id="delivery-fee">0${useDZD ? ' دج' : ' €'}</p>
                        </div>
                        <div class="order-prod-P-t">
                            <p>السعر الإجمالي :</p>
                            <p class="total-price0" id="totalPrice">${priceFormatted}${currency}</p>
                        </div>
                    </div>
                </div>

                <div class="b-order">
                    <div class="quantity">
                        <span class="button-Q" onclick="decreasePhysicalQuantity()">-</span>
                        <input class="quantity-input" id="physical-quantity-input" type="text" value="1" readonly />
                        <span class="button-Q" onclick="increasePhysicalQuantity()">+</span>
                    </div>
                    <button class="buy-button-w" onclick="sendPhysicalOrder()"><i class="fa fa-brands fa-whatsapp"></i></button>
                    <button class="buy-button-emailjs" onclick="sendPhysicalOrder()">اضغط هنا لإتمام طلبك <i class="fa fa-shopping-cart"></i></button>
                </div>
            </div>
        </div>
    `;
}

// Initialiser le formulaire de livraison
function initializeDeliveryForm() {
    console.log('Initialisation du formulaire de livraison...');
    
    // Vérifier si wilayasCommunes est disponible
    if (typeof wilayasCommunes === 'undefined') {
        console.error('wilayasCommunes non chargé');
        return;
    }
    
    const wilayaSelect = document.getElementById('delivery-wilaya');
    if (!wilayaSelect) {
        console.error('Element delivery-wilaya non trouvé');
        return;
    }
    
    // Initialiser les wilayas
    wilayaSelect.innerHTML = '<option value="">الولاية</option>';
    
    for (const wilaya in wilayasCommunes) {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        wilayaSelect.appendChild(option);
    }
    
    wilayaSelect.addEventListener('change', updateCommunes);
    
    // Initialiser les boutons de livraison
    const bureauBtn = document.getElementById('bureauBtn');
    const domicileBtn = document.getElementById('domicileBtn');
    
    if (bureauBtn && domicileBtn) {
        bureauBtn.addEventListener('click', () => selectDeliveryType('bureau'));
        domicileBtn.addEventListener('click', () => selectDeliveryType('domicile'));
        selectDeliveryType('domicile'); // Défaut
    }
    
    console.log('Formulaire de livraison initialisé');
}

// Sélectionner le type de livraison
function selectDeliveryType(type) {
    currentDeliveryType = type;
    document.querySelectorAll(".delivery-btn").forEach((btn) => btn.classList.remove("selected"));
    
    if (type === "bureau") {
        document.getElementById("bureauBtn").classList.add("selected");
    } else if (type === "domicile") {
        document.getElementById("domicileBtn").classList.add("selected");
    }
    
    updateDeliveryFee();
}

// Mettre à jour les communes
function updateCommunes() {
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

// Mettre à jour les frais de livraison
function updateDeliveryFee() {
    const selectedWilaya = document.getElementById('delivery-wilaya').value;
    const selectedCommune = document.getElementById('delivery-commune').value;
    let deliveryFee = 0;
    
    if (selectedWilaya && selectedCommune && wilayasCommunes && wilayasCommunes[selectedWilaya]) {
        const zone = wilayasCommunes[selectedWilaya].zone;
        const baseFee = deliveryZones[zone] ? deliveryZones[zone][currentDeliveryType] : 500;
        const horsZoneFee = wilayasCommunes[selectedWilaya].communes[selectedCommune].horsZone ? 
                           horsZoneCharges[wilayasCommunes[selectedWilaya].communes[selectedCommune].horsZone] || 0 : 0;
        deliveryFee = baseFee + horsZoneFee;
    }
    
    document.getElementById('delivery-fee').textContent = deliveryFee + (currentDeliveryUseDZD ? ' دج' : ' €');
    updatePhysicalTotalPrice();
}

// Fonctions pour la quantité
function increasePhysicalQuantity() {
    const quantityInput = document.getElementById('physical-quantity-input');
    const quantityDisplay = document.getElementById('orderquantity');
    let quantity = parseInt(quantityInput.value) || 1;
    quantityInput.value = quantity + 1;
    quantityDisplay.textContent = quantity + 1;
    updatePhysicalTotalPrice();
}

function decreasePhysicalQuantity() {
    const quantityInput = document.getElementById('physical-quantity-input');
    const quantityDisplay = document.getElementById('orderquantity');
    let quantity = parseInt(quantityInput.value) || 1;
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
        quantityDisplay.textContent = quantity - 1;
        updatePhysicalTotalPrice();
    }
}

function updatePhysicalTotalPrice() {
    if (!currentDeliveryProduct) return;
    
    const quantity = parseInt(document.getElementById('physical-quantity-input').value) || 1;
    const price = currentDeliveryUseDZD ? (currentDeliveryProduct.price_dzd || currentDeliveryProduct.price * 160) : currentDeliveryProduct.price;
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const deliveryFee = deliveryFeeElement ? parseInt(deliveryFeeElement.textContent) || 0 : 0;
    
    const totalPrice = (price * quantity) + deliveryFee;
    const currency = currentDeliveryUseDZD ? ' دج' : ' €';
    const decimals = currentDeliveryUseDZD ? 0 : 2;
    
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(decimals) + currency;
}

// Envoyer commande physique
function sendPhysicalOrder() {
    const name = document.getElementById('delivery-name').value.trim();
    const phone = document.getElementById('delivery-phone').value.trim();
    const wilaya = document.getElementById('delivery-wilaya').value;
    const commune = document.getElementById('delivery-commune').value;
    const address = document.getElementById('delivery-address').value.trim();
    const quantity = document.getElementById('physical-quantity-input').value;

    // Validation
    let valid = true;
    document.querySelectorAll('.error-message, .error-message-f').forEach(el => el.textContent = '');

    if (!name) {
        document.getElementById('deliveryNameError').textContent = 'الرجاء إدخال الاسم';
        valid = false;
    }
    if (!phone) {
        document.getElementById('deliveryPhoneError').textContent = 'الرجاء إدخال رقم الهاتف';
        valid = false;
    }
    if (!wilaya) {
        document.getElementById('wilayaError').textContent = 'الرجاء اختيار الولاية';
        valid = false;
    }
    if (!commune) {
        document.getElementById('communeError').textContent = 'الرجاء اختيار البلدية';
        valid = false;
    }
    if (!address) {
        alert('الرجاء إدخال العنوان');
        valid = false;
    }

    if (!valid) return;

    const price = currentDeliveryUseDZD ? (currentDeliveryProduct.price_dzd || currentDeliveryProduct.price * 160) : currentDeliveryProduct.price;
    const deliveryFee = parseInt(document.getElementById('delivery-fee').textContent) || 0;
    const totalPrice = (price * quantity) + deliveryFee;
    const currency = currentDeliveryUseDZD ? 'DZD' : 'EUR';

    const message = `🎯 **طلب جديد للشحن** 🎯

📦 المنتج: ${currentDeliveryProduct.name}
👤 الاسم: ${name}
📞 الهاتف: ${phone}
📍 الولاية: ${wilaya}
🏘️ البلدية: ${commune}
📮 العنوان: ${address}
🚚 نوع التوصيل: ${currentDeliveryType === 'bureau' ? 'إلى المكتب' : 'إلى المنزل'}
🔢 الكمية: ${quantity}
💰 سعر المنتج: ${currentDeliveryUseDZD ? price.toFixed(0) : price.toFixed(2)} ${currency}
🚚 مصاريف التوصيل: ${deliveryFee} ${currentDeliveryUseDZD ? 'دج' : '€'}
💵 السعر الإجمالي: ${currentDeliveryUseDZD ? totalPrice.toFixed(0) : totalPrice.toFixed(2)} ${currency}

شكرا لثقتكم! 🚀`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Exposer les fonctions globalement
window.createPhysicalForm = createPhysicalForm;
window.initializeDeliveryForm = initializeDeliveryForm;
window.increasePhysicalQuantity = increasePhysicalQuantity;
window.decreasePhysicalQuantity = decreasePhysicalQuantity;
window.sendPhysicalOrder = sendPhysicalOrder;
window.selectDeliveryType = selectDeliveryType;
window.updateCommunes = updateCommunes;
window.updateDeliveryFee = updateDeliveryFee;
window.updatePhysicalTotalPrice = updatePhysicalTotalPrice;
