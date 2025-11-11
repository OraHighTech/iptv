const products = [
    {
        "id": "KING_365",
        "name": "KING 365",
        "price": 55,
        "price_dzd": 8000, // Nouveau prix en DZD 
		"description": "Abonnement IPTV Premium de haute qualité...\nKING 365 l'Abonnement N°1 En Europe\nelle Vous offre une satisfaction en terme de qualité d’image\ndes chaînes En HD - FHD même en 4K sans coupures,\nking365 abonnement comporte un large choix\ndes films et de séries sorties cette année",
        "serverTypes": [
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Premium",
        "images": [
            "https://www.iptv-store.shop/img/KING365.png",
            "http://bit.ly/3VGWWLD",
            "http://bit.ly/4nZQLOP",
            "http://bit.ly/48FoOHy",
            "http://bit.ly/4npB9Eg"
        ]
    },
    {
        "id": "IRON_TV_MAX",
        "name": "IRON TV MAX",
        "price": 40,
        "price_dzd": 3000, // Nouveau prix en DZD
		"description": "Le choix idéal pour les amateurs de sport...\n\nPlus de 13500 Chaînes HD,FHD,UHD,4k\n\nPlus de 18000 VOD \n\nServeur 100% Stable\n\nService client 24/7\n\nCompatible Avec Tous les Appareils..",
        "serverTypes": [
            "code active",
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Premium",
        "images": [
            "https://www.iptv-store.shop/img/IRON.png",
            "https://bit.ly/3KhqEUV",
            "https://bit.ly/47ZNavj",
            "http://bit.ly/3VMojnv",
            "http://bit.ly/3WgtCLY"
        ]
    },
    {
        "id": "NEO4K",
        "name": "NEO4K",
        "price": 45,
        "price_dzd": 4500, // Nouveau prix en DZD
		"description": "Profitez d'une qualité d'image époustouflante en 4K.",
        "serverTypes": [
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Haute Qualité",
        "images": [
            "https://www.iptv-store.shop/img/NEO4K.png"
        ]
    },
    {
        "id": "ATLAS_PRO",
        "name": "ATLAS PRO",
        "price": 29,
        "images": [
            "https://www.iptv-store.shop/img/ATLAS.png"
        ],
        "price_dzd": 2600, // Nouveau prix en DZD
		"description": "Atlas Pro IPTV est votre porte d’entrée vers un divertissement illimité, profitez de milliers de chaînes de France, d’Espagne, d’Allemagne, de Belgique, de chaînes arabes et du monde entier. Ainsi que les derniers films et séries.",
        "serverTypes": [
            "code active",
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Standard"
    },
    {
        "id": "FOSTO",
        "name": "FOSTO",
        "price": 25,
        "images": [
            "https://www.iptv-store.shop/img/FOSTO.png",
            "http://bit.ly/42kz1Fx",
            "http://bit.ly/4pO4M3K",
            "http://bit.ly/4pKQUap",
            "http://bit.ly/4pMdqjr"
        ],
        "price_dzd": 2500, // Nouveau prix en DZD
		"description": "Solution IPTV stable et riche en contenu...",
        "serverTypes": [
            "code active",
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Standard"
    },
    {
        "id": "LYNX",
        "name": "LYNX",
        "price": 25,
        "images": [
            "https://www.iptv-store.shop/img/LYNX.png"
        ],
        "price_dzd": 2400, // Nouveau prix en DZD
		"description": "Abonnement IPTV polyvalent et abordable...",
        "serverTypes": [
            "code active",
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Standard"
    },
    {
        "id": "QHDTV",
        "name": "QHDTV",
        "price": 30,
        "images": [
            "https://www.iptv-store.shop/img/QHDTV.png",
            "https://bit.ly/4gUBtbN"
        ],
        "price_dzd": 3500, // Nouveau prix en DZD
		"description": "Qualité HD supérieure pour un visionnage clair...",
        "serverTypes": [
            "code active",
            "User - Pass",
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "Haute Qualité"
    },
    {
        "id": "IBO",
        "name": "IBO",
        "price": 35,
        "price_dzd": 5500, // Nouveau prix en DZD
		"description": "IBO Player est une application populaire...",
        "serverTypes": [
            "xtream",
            "m3u",
            "mag"
        ],
        "category": "WebOs",
        "images": [
            "https://www.iptv-store.shop/img/IBO.png"
        ]
    },
    {
        "id": "SMARTERS_PLAYER",
        "name": "SMARTERS PLAYER",
        "price": 30,
        "price_dzd": 5000, // Nouveau prix en DZD
		"description": "Smarters Player est une application IPTV robuste...",
        "serverTypes": [
            "xtream"
        ],
        "category": "WebOs",
        "images": [
            "https://www.iptv-store.shop/img/SMARTERS-PLAYER.png",
            "https://bit.ly/4nycU72"
        ]
    },
    {
        "id": "GOGO",
        "name": "GOGO",
        "price": 30,
        "price_dzd": 2500, // Nouveau prix en DZD
		"description": "à travers son application officielle ET les appareils icone vous offre l’accès à la TV et à la VOD (séries et films) ainsi qu’au replay (rediffusion)",
        "serverTypes": [
            "code active"
        ],
        "category": "Haute Qualité",
        "images": [
            "https://www.iptv-store.shop/img/GOGO.png"
        ]
    }
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
];
