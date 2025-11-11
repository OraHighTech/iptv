const products = [
    {
        "id": "KING_365",
        "name": "KING 365", 
        "price": 55,
        "price_dzd": 8800,
        "product_type": "virtual", // ← NOUVEAU CHAMP
        "description": "Abonnement IPTV Premium de haute qualité...",
        "serverTypes": ["User - Pass", "xtream", "m3u", "mag"],
        "category": "Premium",
        "images": ["https://www.iptv-store.shop/img/KING365.png"]
    },
    {
        "id": "IRON_TV_MAX", 
        "name": "IRON TV MAX",
        "price": 40,
        "price_dzd": 6400,
        "product_type": "virtual", // ← NOUVEAU CHAMP
        "description": "Le choix idéal pour les amateurs de sport...",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
        "category": "Premium",
        "images": ["https://www.iptv-store.shop/img/IRON.png"]
    },
    {
        "id": "DECODEUR_TV", 
        "name": "Décodeur TV",
        "price": 120,
        "price_dzd": 19200,
        "product_type": "physical", // ← NOUVEAU CHAMP
        "description": "Décodeur TV physique avec installation...",
        "serverTypes": ["Livraison physique"],
        "category": "Matériel",
        "images": ["https://www.iptv-store.shop/img/decodeur.png"]
    }
    // ... autres produits
];
