// product-main.js
let currentProduct = null;
let useDZD = false;

// Fonction pour récupérer l'ID du produit
function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Détection du pays
async function detectUserCountry() {
  try {
    const response = await fetch('https://api.ipdata.co/?api-key=916c6b6e4d160441313fb81c071aa9aadd988baa6e8e4361cfa6ad38');
    const data = await response.json();
    useDZD = (data.country_code === 'DZ');
    console.log('Pays détecté:', data.country_code, 'useDZD:', useDZD);
    return useDZD;
  } catch (error) {
    console.error('Erreur détection pays:', error);
    useDZD = false;
    return false;
  }
}

// Fonction pour créer le formulaire virtuel
function createVirtualForm(product) {
  const price = useDZD ? (product.price_dzd || product.price * 160) : product.price;
  const currency = useDZD ? ' DZD' : ' €';
  const priceFormatted = useDZD ? price.toFixed(0) : price.toFixed(2);
  
  return `
    <section class="product-form-section virtual-form">
      <form id="orderForm" class="order-form-card">
        <h3 class="form-title">Passez votre commande</h3>
        <p class="product-price-main" id="popupPrice">${priceFormatted}${currency}</p>

        <div class="form-group">
          <i class="fas fa-server icon"></i>
          <select id="serverType" onchange="toggleServerFields(); updateTotalPrice();">
            ${(product.serverTypes || []).map(type => 
              `<option value="${type}">${type}</option>`
            ).join('')}
          </select>
        </div>
        <div id="serverFields" class="server-fields"></div>
        
        <div class="form-group">
          <i class="fas fa-cubes icon"></i>
          <input type="number" id="quantity" value="1" min="1" onchange="updateTotalPrice()" placeholder="Quantité" />
        </div>
        
        <div class="form-group">
          <i class="fas fa-user icon"></i>
          <input type="text" id="name" placeholder="Votre Nom *" />
        </div>
        <p class="error-message" id="nameError"></p>

        <div class="form-group">
          <div class="whatsapp-input-group">
            <select id="selectedCountryCode" class="country-code-select-standalone"></select>
            <input type="tel" id="phone" placeholder="Numéro WhatsApp" />
          </div>
        </div>
        <p class="error-message" id="phoneError"></p>

        <div class="form-group">
          <i class="fas fa-envelope icon"></i>
          <input type="email" id="email" placeholder="Adresse Email (Optionnel)" />
        </div>
        <p class="error-message" id="emailError"></p>

        <div class="button-group">
          <button type="button" class="btn btn-whatsapp" onclick="sendVirtualOrder('whatsapp')">
            <i class="fab fa-whatsapp"></i> Commander via WhatsApp
          </button>
          <button type="button" class="btn btn-email" onclick="sendVirtualOrder('email')">
            <i class="fas fa-envelope"></i> Commander par Email
          </button>
        </div>
      </form>
    </section>
  `;
}

// Setup de la galerie
function setupCombinedGallery(product) {
  const mainImageContainer = document.querySelector('.main-image-container-fade');
  const thumbnailContainer = document.getElementById('thumbnail-container');
  
  if (!mainImageContainer || !thumbnailContainer || !product.images || product.images.length === 0) {
    console.error('Galerie: éléments manquants ou pas d\'images');
    return;
  }

  // Vider les conteneurs
  mainImageContainer.innerHTML = '';
  thumbnailContainer.innerHTML = '';

  // Ajouter les images principales
  product.images.forEach((imageUrl, index) => {
    const mainImg = document.createElement('img');
    mainImg.src = imageUrl;
    mainImg.alt = `Image de ${product.name}`;
    mainImg.style.opacity = index === 0 ? '1' : '0';
    mainImg.style.transition = 'opacity 0.3s ease';
    mainImg.style.width = '100%';
    mainImg.style.height = '100%';
    mainImg.style.objectFit = 'contain';
    mainImg.style.position = 'absolute';
    mainImg.style.top = '0';
    mainImg.style.left = '0';
    mainImageContainer.appendChild(mainImg);
  });

  // Ajouter les miniatures
  product.images.forEach((imageUrl, index) => {
    const thumb = document.createElement('img');
    thumb.src = imageUrl;
    thumb.alt = `Miniature de ${product.name}`;
    thumb.style.cursor = 'pointer';
    thumb.style.width = '80px';
    thumb.style.height = '80px';
    thumb.style.objectFit = 'cover';
    thumb.style.border = index === 0 ? '2px solid var(--primary-color)' : '2px solid transparent';
    thumb.style.borderRadius = '8px';
    thumb.style.margin = '5px';
    
    thumb.addEventListener('click', () => {
      // Mettre à jour l'image principale
      mainImageContainer.querySelectorAll('img').forEach((img, imgIndex) => {
        img.style.opacity = imgIndex === index ? '1' : '0';
      });
      
      // Mettre à jour les bordures des miniatures
      thumbnailContainer.querySelectorAll('img').forEach((thumbImg, thumbIndex) => {
        thumbImg.style.border = thumbIndex === index ? '2px solid var(--primary-color)' : '2px solid transparent';
      });
    });
    
    thumbnailContainer.appendChild(thumb);
  });
}

// Setup lightbox
function setupLightbox(product) {
  const mainImageContainer = document.querySelector('.main-image-container-fade');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  
  if (!mainImageContainer || !lightbox || !lightboxImage || !lightboxClose) return;

  mainImageContainer.style.cursor = 'zoom-in';
  mainImageContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const visibleImg = mainImageContainer.querySelector('img[style*="opacity: 1"]');
      if (visibleImg) {
        lightboxImage.src = visibleImg.src;
        lightbox.style.display = 'flex';
      }
    }
  });
  
  lightboxClose.addEventListener('click', () => { 
    lightbox.style.display = 'none';
  });
  
  lightbox.addEventListener('click', (e) => { 
    if (e.target === lightbox) lightbox.style.display = 'none'; 
  });
}

// Setup des boutons de partage
function setupShareButtons(product) {
  const shareUrl = window.location.href;
  const shareText = `Découvrez ${product.name} sur IPTV Store !`;

  const facebookBtn = document.getElementById('share-facebook');
  if(facebookBtn) { 
    facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; 
  }
  
  const twitterBtn = document.getElementById('share-twitter');
  if(twitterBtn) { 
    twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; 
  }
  
  const whatsappBtn = document.getElementById('share-whatsapp');
  if(whatsappBtn) { 
    whatsappBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`; 
  }
  
  const telegramBtn = document.getElementById('share-telegram');
  if(telegramBtn) { 
    telegramBtn.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; 
  }
  
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

// Fonction principale d'initialisation
async function initializeProductPage() {
  const productId = getProductIdFromURL();
  
  // Vérifier si products est chargé
  if (typeof products === 'undefined') {
    document.getElementById('form-container').innerHTML = '<div class="error-message">Erreur: Produits non chargés</div>';
    return;
  }
  
  currentProduct = products.find(p => p.id === productId);
  
  if (!currentProduct) {
    window.location.href = '404.html';
    return;
  }

  console.log('Produit trouvé:', currentProduct);

  // Détecter le pays
  await detectUserCountry();

  // Mettre à jour les informations du produit
  document.getElementById('product-name').textContent = currentProduct.name;
  
  // Description
  const fullDescription = currentProduct.description || '';
  document.getElementById('product-description').textContent = fullDescription;
  
  // Extrait
  const excerptElement = document.getElementById('product-excerpt');
  if (excerptElement) {
    let firstLine = fullDescription.split('\n')[0];
    let excerpt = firstLine.substring(0, 120);
    if (fullDescription.length > excerpt.length) {
      excerpt += '...';
    }
    excerptElement.textContent = excerpt;
  }

  // Initialiser la galerie
  setupCombinedGallery(currentProduct);

  // Initialiser le lightbox
  setupLightbox(currentProduct);

  // Initialiser les boutons de partage
  setupShareButtons(currentProduct);

  // Charger le bon formulaire
  const formContainer = document.getElementById('form-container');
  
  if (currentProduct.product_type === 'physical') {
    // Utiliser le formulaire de livraison
    if (typeof createPhysicalForm === 'function') {
      formContainer.innerHTML = createPhysicalForm(currentProduct, useDZD);
      // Initialiser le formulaire de livraison
      setTimeout(() => {
        if (typeof initializeDeliveryForm === 'function') {
          initializeDeliveryForm();
        }
      }, 100);
    } else {
      formContainer.innerHTML = '<div class="error-message">Formulaire livraison non disponible</div>';
    }
  } else {
    // Utiliser le formulaire virtuel
    formContainer.innerHTML = createVirtualForm(currentProduct);
    // Initialiser les codes pays
    if (typeof countryCodes !== 'undefined') {
      populateCountryCodes('selectedCountryCode');
    }
    // Initialiser les champs serveur
    setTimeout(() => toggleServerFields(), 100);
  }
}

// Fonctions utilitaires pour le formulaire virtuel
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

function updateTotalPrice() {
  const quantity = parseInt(document.getElementById("quantity")?.value || 1);
  const priceDisplay = document.getElementById('popupPrice');
  if (!priceDisplay || !currentProduct) return;
  
  const price = useDZD ? (currentProduct.price_dzd || currentProduct.price * 160) : currentProduct.price;
  let total = price * (quantity || 1);
  
  if (quantity > 20) total *= 0.9;
  else if (quantity > 10) total *= 0.95;
  
  const currency = useDZD ? ' DZD' : ' €';
  const decimals = useDZD ? 0 : 2;
  priceDisplay.innerText = total.toFixed(decimals) + currency;
}

function toggleServerFields() {
  const serverType = document.getElementById("serverType")?.value;
  const serverFields = document.getElementById('serverFields');
  if (!serverFields) return;

  serverFields.innerHTML = '';

  if (serverType === "mag") {
    serverFields.innerHTML = `
      <div class="form-group">
        <i class="fas fa-envelope icon"></i>
        <input type="text" id="macAddress" placeholder="Adresse MAC (ex: 00:1A:2B:3C:4D:5E)" maxlength="17" />
      </div>
    `;
    
    const macAddressInput = document.getElementById('macAddress');
    if (macAddressInput) {
      macAddressInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
        if (e.target.value.length > 0) {
          let formattedValue = (value.match(/.{1,2}/g) || []).join(':');
          e.target.value = formattedValue;
        }
      });
    }
  }
}

function sendVirtualOrder(method) {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  // Commande rapide WhatsApp sans formulaire
  if (method === 'whatsapp' && !name && !phone) {
    const productUrl = window.location.href;
    const price = useDZD ? (currentProduct.price_dzd || currentProduct.price * 160) : currentProduct.price;
    const currency = useDZD ? 'DZD' : 'EUR';
    const priceFormatted = useDZD ? price.toFixed(0) : price.toFixed(2);
    
    const simpleMessage = `Bonjour, je souhaite commander ce produit :\n\n` +
                          `*Produit :* ${currentProduct.name}\n` +
                          `*Prix :* ${priceFormatted} ${currency}\n` +
                          `*Lien :* ${productUrl}`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(simpleMessage)}`;
    window.open(whatsappUrl, '_blank');
    displayAlert('Redirection vers WhatsApp...');
    return; 
  }

  // Validation du formulaire
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

  // Préparation du message
  displayWaitingMessage();
  const quantity = parseInt(document.getElementById("quantity").value);
  const price = useDZD ? (currentProduct.price_dzd || currentProduct.price * 160) : currentProduct.price;
  const totalPrice = price * quantity;
  const orderNumber = generateOrderNumber();
  const fullPhoneNumber = phone ? `${document.getElementById("selectedCountryCode").value}${phone}` : 'N/A';
  const serverType = document.getElementById("serverType").value;
  const finalEmail = email || 'N/A';
  const currency = useDZD ? 'DZD' : 'EUR';
  
  const detailedMessage = `*Nouvelle commande!*\n*Numéro: ${orderNumber}\n*Produit: ${currentProduct.name}\n*Serveur: ${serverType}\n*Nom: ${name}\n*WhatsApp: ${fullPhoneNumber}\n*Email: ${finalEmail}\n*Prix unitaire: ${price.toFixed(useDZD ? 0 : 2)} ${currency}\n*Quantité: ${quantity}\n*Total: ${totalPrice.toFixed(useDZD ? 0 : 2)} ${currency}`;

  if (method === 'whatsapp') {
    window.open(`https://api.whatsapp.com/send?phone=213770759886&text=${encodeURIComponent(detailedMessage)}`, '_blank');
    hideWaitingMessage();
    displayAlert(`Redirection vers WhatsApp...`);
    document.getElementById('orderForm').reset();
  } else if (method === 'email') {
    const templateParams = { 
      orderNumber, 
      product: currentProduct.name, 
      serverType: serverType, 
      name: name, 
      phone: fullPhoneNumber, 
      email: finalEmail, 
      productPrice: price.toFixed(useDZD ? 0 : 2), 
      quantity: quantity, 
      totalPrice: totalPrice.toFixed(useDZD ? 0 : 2), 
      productDescription: currentProduct.description,
      currency: currency
    };
    emailjs.send("service_geh79gu", "template_vny80g3", templateParams)
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

function populateCountryCodes(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement || typeof countryCodes === 'undefined') return;
  
  selectElement.innerHTML = '';
  countryCodes.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = `${country.name} (${country.code})`;
    selectElement.appendChild(option);
  });
  selectElement.value = "+213";
}

// Charger les composants
function loadComponent(url, elementId) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      const element = document.getElementById(elementId);
      if(element) element.innerHTML = data;
    })
    .catch(error => console.error(`Error loading component ${url}:`, error));
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser EmailJS
  emailjs.init("WNOIpj1FX2dDPSQMS");
  
  // Charger header et footer
  loadComponent('header.html', 'header-placeholder');
  loadComponent('footer.html', 'footer-placeholder');
  
  // Initialiser la page produit
  initializeProductPage();
});

// Exposer les fonctions globalement
window.sendVirtualOrder = sendVirtualOrder;
window.updateTotalPrice = updateTotalPrice;
window.toggleServerFields = toggleServerFields;
window.closeAlert = closeAlert;
