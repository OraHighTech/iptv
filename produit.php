<?php
// --- PARTIE 1 : LOGIQUE PHP (côté serveur) ---

// 1. Récupérer l'ID du produit depuis l'URL (ex: produit.php?id=KING_365)
$productId = isset($_GET['id']) ? $_GET['id'] : '';
$product = null;

// 2. Lire et décoder le fichier JSON
if ($productId) {
    if (file_exists('products.json')) {
        $json_data = file_get_contents('products.json');
        $products = json_decode($json_data, true);

        if (is_array($products)) {
            foreach ($products as $p) {
                if (isset($p['id']) && $p['id'] === $productId) {
                    $product = $p;
                    break;
                }
            }
        }
    }
}

// 4. Si le produit n'est pas trouvé, afficher une erreur 404
if ($product === null) {
    header("HTTP/1.0 404 Not Found");
    include('404.html'); // Affiche votre page 404.html
    exit();
}

// 5. Préparer les variables pour l'affichage
$productName = isset($product['name']) ? htmlspecialchars($product['name']) : 'Nom indisponible';
$productDescription = isset($product['description']) ? htmlspecialchars($product['description']) : 'Description indisponible';
$productImage = isset($product['images'][0]) ? htmlspecialchars($product['images'][0]) : '';
$productPrice = isset($product['price']) ? $product['price'] : 0.0;
$shareUrl = "https://www.iptv-store.shop/produit.php?id=" . urlencode($product['id']);

?>
<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title><?php echo $productName; ?> - IPTV Store</title>
    <meta name="description" content="<?php echo substr(str_replace("\n", " ", $productDescription), 0, 155); ?>">
    <meta property="og:title" content="<?php echo $productName; ?>">
    <meta property="og:description" content="<?php echo substr(str_replace("\n", " ", $productDescription), 0, 155); ?>">
    <meta property="og:image" content="<?php echo $productImage; ?>">
    <meta property="og:url" content="<?php echo $shareUrl; ?>">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="IPTV Store">
    
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "<?php echo addslashes($productName); ?>",
        "image": "<?php echo $productImage; ?>",
        "description": "<?php echo addslashes($productDescription); ?>",
        "sku": "<?php echo addslashes($product['id']); ?>",
        "brand": { "@type": "Brand", "name": "IPTV Store" },
        "offers": {
            "@type": "Offer",
            "url": "<?php echo $shareUrl; ?>",
            "priceCurrency": "EUR",
            "price": "<?php echo $productPrice; ?>",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    }
    </script>
    
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" href="style.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <script src="https://raw.githack.com/OraHighTech/OrderTvCode/main/indicatif.js"></script>
</head>
<body>
    <div id="header-placeholder"></div>

    <main class="product-page-container-new">
        <section class="product-gallery-section">
            <div class="image-gallery-horizontal">
                <div class="main-image-container-fade"></div>
                <div id="thumbnail-container" class="thumbnail-container-horizontal"></div>
            </div>
        </section>

        <section class="product-intro">
            <p id="product-excerpt" class="product-excerpt-main"></p>
            <h1 id="product-name" class="product-title-main"><?php echo $productName; ?></h1>
        </section>

        <div class="share-buttons-container">
            <span>Partager :</span>
            <a id="share-facebook" class="share-btn facebook" href="#" target="_blank" aria-label="Partager sur Facebook"><i class="fab fa-facebook-f"></i></a>
            <a id="share-twitter" class="share-btn twitter" href="#" target="_blank" aria-label="Partager sur Twitter"><i class="fab fa-twitter"></i></a>
            <a id="share-whatsapp" class="share-btn whatsapp" href="#" target="_blank" aria-label="Partager sur WhatsApp"><i class="fab fa-whatsapp"></i></a>
            <a id="share-telegram" class="share-btn telegram" href="#" target="_blank" aria-label="Partager sur Telegram"><i class="fab fa-telegram-plane"></i></a>
            <button id="copy-link" class="share-btn copy-link" aria-label="Copier le lien"><i class="fas fa-copy"></i></button>
         </div>

        <section class="product-form-section">
            <form id="orderForm" class="order-form-card">
               <h3 class="form-title">Passez votre commande</h3>
               <p class="product-price-main" id="popupPrice"></p>
               <div class="form-group"><label for="serverType">Format du serveur :</label><select id="serverType" onchange="toggleServerFields(); updateTotalPrice()"></select></div>
               <div id="serverFields" class="server-fields"></div>
               <div class="form-group"><label for="quantity">Quantité :</label><input type="number" id="quantity" value="1" min="1" onchange="updateTotalPrice()" /></div>
               <div class="form-group"><label for="name">Votre Nom : <span class="required">*</span></label><input type="text" id="name" placeholder="John Doe" /><p class="error-message" id="nameError"></p></div>
               <div class="form-group"><label for="phone">Numéro WhatsApp :</label><div class="whatsapp-input-group"><select id="selectedCountryCode" class="country-code-select-standalone"></select><input type="tel" id="phone" placeholder="Votre numéro" /></div><p class="error-message" id="phoneError"></p></div>
               <div class="form-group"><label for="email">Adresse Email :</label><input type="email" id="email" placeholder="john.doe@example.com" /><p class="error-message" id="emailError"></p></div>
               <div class="button-group">
                  <button type="button" class="btn btn-whatsapp" onclick="sendOrder('whatsapp')"><i class="fab fa-whatsapp"></i> Commander via WhatsApp</button>
                  <button type="button" class="btn btn-email" onclick="sendOrder('email')"><i class="fas fa-envelope"></i> Commander par Email</button>
               </div>
            </form>
         </section>

         <section class="product-full-description">
            <h2 class="section-title-small">Description Détaillée</h2>
            <p id="product-description" class="product-description-main"></p>
         </section>

         <section class="payment-methods">
            <h2 class="section-title-small">Moyens de paiement acceptés</h2>
            <div class="payment-icons">
               <img src="https://www.iptv-store.shop/paypal-logo.png" alt="PayPal" />
               <img src="https://www.iptv-store.shop/binance-logo.png" alt="Binance Pay" />
               <img src="https://www.iptv-store.shop/iban-logo.png" alt="Virement bancaire IBAN" />
            </div>
         </section>
    </main>

    <div id="lightbox" class="lightbox-overlay"><span class="lightbox-close">&times;</span><img id="lightbox-image" class="lightbox-image" src="" /></div>
    <div id="waitingMessage" class="waiting-message" style="display: none">
     <i class="fas fa-spinner fa-spin"></i>
</div>
<div id="customAlert" class="custom-alert" style="display: none">
     <div class="alert-content">
        <span class="close-btn" onclick="closeAlert()">&times;</span>
        <p id="alertMessage"></p>
        <button class="ok-btn" onclick="closeAlert()">OK</button>
     </div>
</div>
<div id="lightbox" class="lightbox-overlay">
     <span class="lightbox-close">&times;</span><img id="lightbox-image" class="lightbox-image" src="" />
</div>
    <div id="footer-placeholder"></div>

    <script>
        const product = <?php echo json_encode($product); ?>;
    </script>
    
    <script src="script.js"></script>
</body>
</html>