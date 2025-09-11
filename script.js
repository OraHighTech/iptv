
     // carousel image
        let currentIndex = 0;
        const thumbnails = document.querySelectorAll(".product-thumbnails img");
        const mainImage = document.getElementById("mainImage");

        function changeImage(thumbnail) {
            mainImage.classList.add("fade-out");
            setTimeout(() => {
                mainImage.src = thumbnail.src;
                thumbnails.forEach((img) => img.classList.remove("active-thumbnail"));
                thumbnail.classList.add("active-thumbnail");
                currentIndex = Array.from(thumbnails).indexOf(thumbnail);
                mainImage.classList.remove("fade-out");
            }, 500); // Correspond à la durée de la transition CSS
        }

        function autoChangeImage() {
            currentIndex = (currentIndex + 1) % thumbnails.length;
            changeImage(thumbnails[currentIndex]);
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % thumbnails.length;
            changeImage(thumbnails[currentIndex]);
        }

        function prevImage() {
            currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
            changeImage(thumbnails[currentIndex]);
        }

        function startAutoChange() {
            interval = setInterval(autoChangeImage, 3000); // Change image every 3 seconds
        }

        function stopAutoChange() {
            clearInterval(interval);
        }

        mainImage.addEventListener("mouseover", stopAutoChange);
        mainImage.addEventListener("mouseout", startAutoChange);

        startAutoChange(); // Start the interval when the page loads

        // Fin carousel image
       document.getElementById("orderTitle").innerText = document.title;

const prices = {
    "KING 365 IPTV 12 Mois": 55.00,
	"IRON TV MAX IPTV 12 Mois": 40.00,
	"ATLAS PRO IPTV 12 Mois": 25.00,
	"FOSTO IPTV 12 Mois": 25.00,
	"NEO4K IPTV 12 Mois": 30.00,
};

const apkPricer = {
    "Code Active": 0.00,
    "Xtream Code": 0.00,
    "M3U": 0.00,
    "MAG": 0.00,
    "Ibo Player": 5.00,
    "BOB Player": 5.00,
    "Duplex Player": 5.00,
    "Set IPTV": 0.00,
    "Bay IPTV": 0.00,
    "Flix IPTV": 0.00,
    "Smart IPTV": 0.00,
    "Smartone IPTV": 0.00,
    "Smarter Player lg & Samsung - TV WebOS": 2.00,
    "Smarterspro Android": 0.00,
    "Autre Application": 10.00,
};
const apkCategories = {
    category0: ['Code Active'],  
    category1: ['Ibo Player', 'BOB Player', 'Duplex Player'],
    category2: ['Set IPTV', 'Bay IPTV', 'Flix IPTV', 'Smartone IPTV', 'Smart IPTV', 'MAG'],
    category3: ['MAG'],
    category4: ['Smarter Player lg & Samsung - TV WebOS', 'Smarterspro Android', 'Xtream Code'],
    category5: ['M3U'],
    category6: ['Autre Application'],
};

// Generate Plug options dynamically
const plugSelect = document.getElementById("Plug");
const placeholderOption = document.createElement("option");
placeholderOption.value = "";
placeholderOption.textContent = "Choisir un Server";
placeholderOption.disabled = true;
placeholderOption.selected = true;
plugSelect.appendChild(placeholderOption);

for (const plugType in prices) {
    const option = document.createElement("option");
    option.value = plugType;
    option.textContent = plugType;
    plugSelect.appendChild(option);
}

// Generate ApkDyn options dynamically
const ApkSelect = document.getElementById("ApkDyn");
const placeholderOption2 = document.createElement("option");
placeholderOption2.value = "";
placeholderOption2.textContent = "Choisir une application TV";
placeholderOption2.disabled = true;
placeholderOption2.selected = true;
ApkSelect.appendChild(placeholderOption2);

for (const ApkType in apkPricer) {
    const option = document.createElement("option");
    option.value = ApkType;
    option.textContent = ApkType;
    ApkSelect.appendChild(option);
}

// countryCode

const customSelect = document.getElementById('customSelect');
const customSelectTrigger = customSelect.querySelector('.custom-select-trigger');
const customOptions = customSelect.querySelector('.custom-options');
const selectedCountryCodeInput = document.getElementById('selectedCountryCode');     

// Populate custom options
countryCodes.forEach(country => {
    const option = document.createElement('div');
    option.classList.add('custom-option');
    option.setAttribute('data-value', country.code);
    option.innerHTML = `<img src="${country.flag}" alt="${country.name} flag"> ${country.name} (${country.code})`;
    customOptions.appendChild(option);

    option.addEventListener('click', () => {
        customSelectTrigger.innerHTML = `<img src="${country.flag}" alt="${country.name} flag"><span class"indicatif"> ${country.code}</span>`;
        selectedCountryCodeInput.value = country.code;  
        customOptions.style.display = 'none';
        customSelectTrigger.classList.remove('active');
    });
});

// Toggle options display
customSelectTrigger.addEventListener('click', () => {
    customOptions.style.display = customOptions.style.display === 'none' ? 'block' : 'none';
    customSelectTrigger.classList.toggle('active');
});

// Close options if clicked outside
document.addEventListener('click', (event) => {
    if (!customSelect.contains(event.target)) {
        customSelectTrigger.classList.remove('active');
    }
});


// Set initial price
const initialPrice = 55.00;
document.getElementById("productPrice").innerText = initialPrice.toFixed(2) + " EURO";
document.getElementById("totalPrice").innerText = initialPrice.toFixed(2) + " EURO";
document.getElementById("Oderprice").innerText = initialPrice.toFixed(2) + " EURO";

document.getElementById("Plug").addEventListener("change", () => {
    updatePrice();
});
document.getElementById("ApkDyn").addEventListener("change", () => {
    updatePrice();
    updateDeviceDetails();
});

// Listen for input changes to clear error messages
document.addEventListener("input", (event) => {
    if (document.getElementById("macAddressError")) {
        document.getElementById("macAddressError").innerText = "";
    }
    if (document.getElementById("deviceKeyError")) {
        document.getElementById("deviceKeyError").innerText = "";
    }
});

function updateDeviceDetails() {
    const ApkDyn = document.getElementById("ApkDyn").value;
    const deviceDetails = document.getElementById("deviceDetails");
    deviceDetails.innerHTML = "";

    if (apkCategories.category1.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
            <div class="form-ligne"><label class="form-ligne"><div class="form-ligne-fa"><i class="fa fa-regular fa-router"></i></div><input type="text" id="macAddress" placeholder="Adresse MAC : 00:aa:11:bb:22" required /></label><div id="macAddressError" class="error-message-f"></div></div>
            <div class="form-ligne"><label class="form-ligne"><div class="form-ligne-fa"><i class="fa fa-regular fa-key"></i></div><input type="text" id="deviceKey" pattern="^\\d+$" placeholder="Exemple : 123456" required /></label><div id="deviceKeyError" class="error-message-f"></div></div>
        `;
    } else if (apkCategories.category2.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
            <div class="form-ligne"><label class="form-ligne"><div class="form-ligne-fa"><i class="fa fa-regular fa-router"></i></div><input type="text" id="macAddress" placeholder="Adresse MAC : 00:aa:11:bb:22" required /></label><div id="macAddressError" class="error-message-f"></div></div>
        `;
        if (apkCategories.category3.includes(ApkDyn)) {
            deviceDetails.innerHTML += `
                <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-solid fa-circle-info"></i>
                        </div>
                        <div class="button-Tuto">
                            <a class="Tuto-btn" href="https://www.iptv-store.shop/p/tuto-activer-votre-abonnement-iptv-mag.html" target="_blank">Comment Installer votre abonnement IPTV MAG</a>
                        </div>
                    </label>
                </div>
            `;
        }
    } else if (apkCategories.category4.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
            <div class="form-ligne">
                <label class="form-ligne">
                    <div class="form-ligne-fa">
                        <i class="fa fa-brands fa-instalod"></i>
                    </div>
                    <div class="button-Tuto">
                        <div class="Tuto-btn"> Username / Password / URL:Port</div>
                    </div>
                </label>
            </div>
        `;
    } else if (apkCategories.category5.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
            <div class="form-ligne">
                <label class="form-ligne">
                    <div class="form-ligne-fa">
                        <i class="fa fa-solid fa-circle-info"></i>
                    </div>
                    <div class="button-Tuto">
                        <a class="Tuto-btn" href="#" target="_blank">TUTO</a>
                    </div>
                </label>
            </div>
        `;
    } else if (apkCategories.category6.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
            <div class="form-ligne">
                <label class="form-ligne">
                    <div class="form-ligne-fa">
                        <i class="fa fa-brands fa-codepen"></i>
                    </div>
                    <input type="text" id="otherApk" placeholder="Enter Votre Application ici" required />
                </label>
            </div>
        `;
    }
     else if (apkCategories.category0.includes(ApkDyn)) {
        deviceDetails.innerHTML += `
           <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-solid fa-download"></i>
                        </div>
                        <div class="button-Tuto">
                            <a class="Tuto-btn" href="https://ironiptv.net/iron-max.apk
" target="_blank">Telechargé l'application iron max</a>
                        </div>
                    </label>
                </div>
                 <div class="form-ligne">
                    <label class="form-ligne">
                        <div class="form-ligne-fa">
                            <i class="fa fa-solid fa-desktop-arrow-down"></i>
                        </div>
                        <div class="button-Tuto">
                            <a class="Tuto-btn" href="https://play.google.com/store/apps/details?id=com.esaba.downloader&hl=fr" target="_blank">Code downloader iron TV max  = 347824</a>
                        </div>
                    </label>
                </div>
        `;
    }
    updateTotalPrice();
}

// Quantity
function increaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    let quantity = parseInt(quantityInput.value);
    quantity = isNaN(quantity) ? 0 : quantity;
    quantityInput.value = quantity + 1;
    updateTotalPrice();
}

function decreaseQuantity() {
    const quantityInput = document.getElementById("quantity");
    let quantity = parseInt(quantityInput.value);
    quantity = isNaN(quantity) ? 0 : quantity;
    if (quantity > 1) {
        quantityInput.value = quantity - 1;
    }
    updateTotalPrice();
}

function updatePrice() {
    const Plug = document.getElementById("Plug").value;
    const ApkDyn = document.getElementById("ApkDyn").value;
    const priceElement = document.getElementById("productPrice");
    const price = prices[Plug] ? prices[Plug] : initialPrice;
    document.getElementById("OderPlug").innerText = Plug;
    document.getElementById("OderApk").innerText = ApkDyn;
    document.getElementById("Oderprice").innerText = price.toFixed(2) + " EURO";
    priceElement.innerText = price.toFixed(2) + " EURO";
    updateTotalPrice();
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById("quantity").value);
    const Plug = document.getElementById("Plug").value;
    const ApkDyn = document.getElementById("ApkDyn").value;
    const apkPrice = apkPricer[ApkDyn] ? apkPricer[ApkDyn] : 0;
    const productPrice = prices[Plug] ? prices[Plug] : initialPrice;
    let totalPrice = (productPrice + apkPrice) * quantity;
    let discount = 0;
    let discountPercent = 0;

    // Apply discount based on quantity
    if (quantity > 20) {
        discountPercent = 10; // 10% discount
        discount = totalPrice * 0.10;
        totalPrice *= 0.90;
    } else if (quantity > 10) {
        discountPercent = 5; // 5% discount
        discount = totalPrice * 0.05;
        totalPrice *= 0.95;
    }

    document.getElementById("productPrice").innerText = productPrice.toFixed(2) + " EURO";
    document.getElementById("apkPrice").innerText = apkPrice.toFixed(2) + " EURO";
    document.getElementById("discount").innerText = "Eco :" + discount.toFixed(2) + " EURO";
    document.getElementById("discountPercent").innerText ="-" + discountPercent + "%";
    document.getElementById("totalPrice").innerText = totalPrice.toFixed(2) + " EURO";
    document.getElementById("orderquantity").innerText = quantity;
}

        function generateOrderNumber() {
            const date = new Date();
            const components = [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2),
                ("0" + date.getHours()).slice(-2),
                ("0" + date.getMinutes()).slice(-2),
                ("0" + date.getSeconds()).slice(-2),
                Math.floor(Math.random() * 1000), // Random 3-digit number
            ];
            return components.join("");
        }
        
        // sendOrderByEmail

      function sendOrderByEmail() {
    clearErrors();

    const quantity = parseInt(document.getElementById("quantity").value);
    const Plug = document.getElementById("Plug").value;
    const ApkDyn = document.getElementById("ApkDyn").value;
    const macAddress = document.getElementById('macAddress') ? document.getElementById('macAddress').value : '';
    const deviceKey = (apkCategories.category1.includes(ApkDyn)) ? document.getElementById('deviceKey').value : '';
    const otherApk = (apkCategories.category6.includes(ApkDyn)) ? document.getElementById("otherApk").value : '';
    const name = document.getElementById("name").value;
    const countryCode = document.getElementById("selectedCountryCode").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    let valid = true;
    let firstErrorElement = null;

    if (!name) {
        const errorElement = document.getElementById("nameError");
        errorElement.innerText = "Veuillez entrer votre nom.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (!countryCode) {
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Veuillez choisir un indicatif de pays.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!phone) {
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Veuillez entrer un numéro de téléphone.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!/^[1-9]\d{8,13}$/.test(phone)) { // 9 to 14 digits for the phone number without the leading 0
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Numéro de téléphone incorrect. Le numéro doit être sans le 0 initial.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (!email) {
        const errorElement = document.getElementById("emailError");
        errorElement.innerText = "Veuillez entrer votre email.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)) {
        const errorElement = document.getElementById("emailError");
        errorElement.innerText = "Email incorrect.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (macAddress && !/^([0-9A-Za-z]{2}[:-]){5}([0-9A-Za-z]{2})$/.test(macAddress)) {
        document.getElementById('macAddressError').innerText = 'Veuillez entrer une adresse MAC valide.';
        valid = false;
    }

    if (deviceKey && !/^\d+$/.test(deviceKey)) {
        document.getElementById('deviceKeyError').innerText = 'Veuillez entrer un Device Key valide.';
        valid = false;
    }

    if (!valid) {
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView();
        }
        return;
    }

    displayWaitingMessage(); // Afficher le message d'attente

    // Utiliser setTimeout pour permettre l'affichage du message d'attente avant de continuer
    setTimeout(() => {
        const apkPrice = apkPricer[ApkDyn] ? apkPricer[ApkDyn] : 0;
        const productPrice = prices[Plug] ? prices[Plug] : initialPrice;
        let totalPrice = (productPrice + apkPrice) * quantity;
        let discount = 0;
        let discountPercent = 0;

        // Apply discount based on quantity
        if (quantity > 20) {
            discountPercent = 10; // 10% discount
            discount = totalPrice * 0.10;
            totalPrice *= 0.90;
        } else if (quantity > 10) {
            discountPercent = 5; // 5% discount
            discount = totalPrice * 0.05;
            totalPrice *= 0.95;
        }

        const orderNumber = generateOrderNumber();
        const message =
            `Numéro de commande: ${orderNumber}<br>` +
            `Produit: ${document.title}<br>` +
            `Type de Server: ${Plug}<br>` +  
            `Type de Application: ${ApkDyn}<br>` +
            `Mac Adresse: ${macAddress}<br>` +
            `Device Key: ${deviceKey}<br>` +
            `otherApk: ${otherApk}<br>` +        
            `Nom: ${name}<br>` +
            `Numéro de WhatsApp: ${countryCode}${phone}<br>` +
            `Email: ${email}<br>` +
            `Prix Server: ${productPrice.toFixed(2)} EURO<br>` +
            `Prix APK: ${apkPrice.toFixed(2)} EURO<br>` + 
            `Quantité: ${quantity}<br>` +
            `Réduction: ${discount.toFixed(2)} EURO (${discountPercent}%)<br>` +
            `Total: ${totalPrice.toFixed(2)} EURO`;

        const templateParams = {
            orderNumber: orderNumber,
            product: document.title,
            Server: Plug,
            ApkType: ApkDyn,
            "Mac Adresse": macAddress,
            "Device Key": deviceKey,
            name: name,
            phone: countryCode+phone,
            email: email,
            otherApk: otherApk,
            price: productPrice.toFixed(2),
            PrixAPK: apkPrice.toFixed(2),
            quantity: quantity,
            discount: discount.toFixed(2),
            discountPercent: discountPercent,
            totalPrice: totalPrice.toFixed(2),
        };

        emailjs.send("service_geh79gu", "template_vny80g3", templateParams).then(
            function (response) {
                hideWaitingMessage(); // Cacher le message d'attente
                displayAlert(`<i class="fa fa-solid fa-circle-check" style=" font-size: 6em; "></i><br>Commande envoyée avec succès!<br>Numéro de commande: ${orderNumber}`, "success");
            },
            function (error) {
                hideWaitingMessage(); // Cacher le message d'attente
                displayAlert("Échec de l'envoi de la commande.", "error");
            }
        );
    }, 100); // Attendre 100ms pour permettre l'affichage du message d'attente
}


function displayAlert(message, type) {
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertContainer.innerHTML = "";
        location.reload(); // Recharger la page après que le message soit effacé
    }, 10000); // Effacer le message après 10 secondes
}

function displayWaitingMessage() {
    const waitingMessageContainer = document.getElementById("waitingMessageContainer");
    waitingMessageContainer.innerHTML = `<div class="alert alert-info">Veuillez patienter, votre commande est en cours de traitement ... <i class="fa fa-solid fa-spinner"></i></div>`;
}

function hideWaitingMessage() {
    const waitingMessageContainer = document.getElementById("waitingMessageContainer");
    waitingMessageContainer.innerHTML = "";
}
      // fin sendOrderByEmail

        // sendOrder By Whatsapp

        function sendOrder() {
    clearErrors();

    const quantity = parseInt(document.getElementById("quantity").value);
    const Plug = document.getElementById("Plug").value;
    const ApkDyn = document.getElementById("ApkDyn").value;
    const macAddress = document.getElementById('macAddress') ? document.getElementById('macAddress').value : '';
    const deviceKey = (apkCategories.category1.includes(ApkDyn)) ? document.getElementById('deviceKey').value : '';
    const otherApk = (apkCategories.category6.includes(ApkDyn)) ? document.getElementById("otherApk").value : '';
    const name = document.getElementById("name").value;
    const countryCode = document.getElementById("selectedCountryCode").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;

    let valid = true;
    let firstErrorElement = null;

    if (!name) {
        const errorElement = document.getElementById("nameError");
        errorElement.innerText = "Veuillez entrer votre nom.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (!countryCode) {
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Veuillez choisir un indicatif de pays.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!phone) {
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Veuillez entrer un numéro de téléphone.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!/^[1-9]\d{8,13}$/.test(phone)) { // 9 to 14 digits for the phone number without the leading 0
        const errorElement = document.getElementById("phoneError");
        errorElement.innerText = "Numéro de téléphone incorrect. Le numéro doit être sans le 0 initial.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (!email) {
        const errorElement = document.getElementById("emailError");
        errorElement.innerText = "Veuillez entrer votre email.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    } else if (!/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email)) {
        const errorElement = document.getElementById("emailError");
        errorElement.innerText = "Email incorrect.";
        valid = false;
        if (!firstErrorElement) firstErrorElement = errorElement;
    }

    if (macAddress && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(macAddress)) {
        document.getElementById('macAddressError').innerText = 'Veuillez entrer une adresse MAC valide.';
        valid = false;
    }

    if (deviceKey && !/^\d+$/.test(deviceKey)) {
        document.getElementById('deviceKeyError').innerText = 'Veuillez entrer un Device Key valide.';
        valid = false;
    }

    if (!valid) {
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView();
        }
        return;
    }

    const apkPrice = apkPricer[ApkDyn] ? apkPricer[ApkDyn] : 0;
    const productPrice = prices[Plug] ? prices[Plug] : initialPrice;
    let totalPrice = (productPrice + apkPrice) * quantity;
    let discount = 0;
    let discountPercent = 0;

    // Apply discount based on quantity
    if (quantity > 20) {
        discountPercent = 10; // 10% discount
        discount = totalPrice * 0.10;
        totalPrice *= 0.90;
    } else if (quantity > 10) {
        discountPercent = 5; // 5% discount
        discount = totalPrice * 0.05;
        totalPrice *= 0.95;
    }

    const orderNumber = generateOrderNumber();
    const message =
        `Numéro de commande: ${orderNumber}\n` +
        `Produit: ${document.title}\n` +
        `Type de Server: ${Plug}\n` +
        `Type de Application: ${ApkDyn}\n` +
        `Mac Adresse: ${macAddress}\n` +
        `device Key: ${deviceKey}\n` +
        `otherApk: ${otherApk}\n` +
        `Nom: ${name}\n` +
        `Numéro de WhatsApp: ${countryCode}${phone}\n` +
        `Email: ${email}\n` +
        `Prix Server: ${productPrice.toFixed(2)} EURO\n` +
        `Prix APK: ${apkPrice.toFixed(2)} EURO\n` +
        `Quantité: ${quantity}\n` +
        `Réduction: ${discount.toFixed(2)} EURO (${discountPercent}%)\n` +
        `Total: ${totalPrice.toFixed(2)} EURO`;

    const whatsappUrl = `https://wa.me/213770759886?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
}

        // Fin sendOrder By Whatsapp

     document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("orderTitle").innerText = document.title;
    updatePrice();
    updateDeviceDetails();
    
    // Initialize price and other functionalities
    const contactInfoElements = document.querySelectorAll(".form-all input, .device-details input");
    contactInfoElements.forEach((element) => {
        element.addEventListener("input", function () {
            if (this.id === "name" && this.value) {
                document.getElementById("nameError").innerText = "";
            }
            if (this.id === "phone" && /^[1-9]\d{8,13}$/.test(this.value)) {
                document.getElementById("phoneError").innerText = "";
            }
            if (this.id === "email" && /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(this.value)) {
                document.getElementById("emailError").innerText = "";
            }
        });
    });
});

function clearErrors() {
    document.getElementById("nameError").innerText = "";
    document.getElementById("phoneError").innerText = "";
    document.getElementById("emailError").innerText = ""; 
}

