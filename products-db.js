const products = [
    {
        "id": "KING_365",
        "name": "KING 365",
        "price": {
            eur: 55.00, // صحيح
            dzd: 8000
        },
        "description": "Abonnement IPTV Premium de haute qualité...\nKING 365 l'Abonnement N°1 En Europe\nelle Vous offre une satisfaction en terme de qualité d’image\ndes chaînes En HD - FHD même en 4K sans coupures,\nking365 abonnement comporte un large choix\ndes films et de séries sorties cette année",
        "serverTypes": ["User - Pass", "xtream", "m3u", "mag"],
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
        "price": { // <-- تم التعديل
            eur: 40.00,
            dzd: 6000
        },
        "description": "Le choix idéal pour les amateurs de sport...\n\nPlus de 13500 Chaînes HD,FHD,UHD,4k\n\nPlus de 18000 VOD \n\nServeur 100% Stable\n\nService client 24/7\n\nCompatible Avec Tous les Appareils..",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
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
        "price": { // <-- تم التعديل
            eur: 45.00,
            dzd: 6500
        },
        "description": "Profitez d'une qualité d'image époustouflante en 4K.",
        "serverTypes": ["User - Pass", "xtream", "m3u", "mag"],
        "category": "Haute Qualité",
        "images": ["https://www.iptv-store.shop/img/NEO4K.png"]
    },
    {
        "id": "ATLAS_PRO",
        "name": "ATLAS PRO",
        "price": { // <-- تم التعديل
            eur: 29.00,
            dzd: 4500
        },
        "images": ["https://www.iptv-store.shop/img/ATLAS.png"],
        "description": "Atlas Pro IPTV est votre porte d’entrée vers un divertissement illimité, profitez de milliers de chaînes de France, d’Espagne, d’Allemagne, de Belgique, de chaînes arabes et du monde entier. Ainsi que les derniers films et séries.",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
        "category": "Standard"
    },
    {
        "id": "FOSTO",
        "name": "FOSTO",
        "price": { // <-- تم التعديل
            eur: 25.00,
            dzd: 3500
        },
        "images": [
            "https://www.iptv-store.shop/img/FOSTO.png",
            "http://bit.ly/42kz1Fx",
            "http://bit.ly/4pO4M3K",
            "http://bit.ly/4pKQUap",
            "http://bit.ly/4pMdqjr"
        ],
        "description": "Solution IPTV stable et riche en contenu...",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
        "category": "Standard"
    },
    {
        "id": "LYNX",
        "name": "LYNX",
        "price": { // <-- تم التعديل
            eur: 25.00,
            dzd: 3500
        },
        "images": ["https://www.iptv-store.shop/img/LYNX.png"],
        "description": "Abonnement IPTV polyvalent et abordable...",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
        "category": "Standard"
    },
    {
        "id": "QHDTV",
        "name": "QHDTV",
        "price": { // <-- تم التعديل
            eur: 30.00,
            dzd: 4500
        },
        "images": [
            "https://www.iptv-store.shop/img/QHDTV.png",
            "https://bit.ly/4gUBtbN"
        ],
        "description": "Qualité HD supérieure pour un visionnage clair...",
        "serverTypes": ["code active", "User - Pass", "xtream", "m3u", "mag"],
        "category": "Haute Qualité"
    },
    {
        "id": "IBO",
        "name": "IBO",
        "price": { // <-- تم التعديل
            eur: 35.00,
            dzd: 5000
        },
        "description": "IBO Player est une application populaire...",
        "serverTypes": ["xtream", "m3u", "mag"],
        "category": "WebOs",
        "images": ["https://www.iptv-store.shop/img/IBO.png"]
    },
    {
        "id": "SMARTERS_PLAYER",
        "name": "SMARTERS PLAYER",
        "price": { // <-- تم التعديل
            eur: 30.00,
            dzd: 4500
        },
        "description": "Smarters Player est une application IPTV robuste...",
        "serverTypes": ["xtream"],
        "category": "WebOs",
        "images": [
            "https://www.iptv-store.shop/img/SMARTERS-PLAYER.png",
            "https://bit.ly/4nycU72"
        ]
    },
    {
        "id": "GOGO",
        "name": "GOGO",
        "price": { // <-- تم التعديل
            eur: 30.00,
        	dzd: 4500
        },
        "description": "à travers son application officielle ET les appareils icone vous offre l’accès à la TV et à la VOD (séries et films) ainsi qu’au replay (rediffusion)",
        "serverTypes": ["code active"],
        "category": "Haute Qualité",
        "images": ["https://www.iptv-store.shop/img/GOGO.png"]
    }
];
