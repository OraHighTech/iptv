let productsData = [];
let masterServerTypes = [];
let masterCategories = [];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof products !== 'undefined') {
        productsData = JSON.parse(JSON.stringify(products));
        loadConfig();
        renderAll();
        attachAllEventListeners();
    } else {
        alert("Erreur: Le fichier products-db.js est introuvable ou vide. Assurez-vous qu'il est dans le même dossier que generateur.html.");
    }
});

function attachAllEventListeners() {
    document.getElementById('product-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-edit-btn').addEventListener('click', resetForm);
    document.getElementById('add-image-btn').addEventListener('click', () => { document.getElementById('image-inputs').appendChild(createImageInput()); });
    document.getElementById('saveDbBtn').addEventListener('click', saveDbFile);
    document.getElementById('server-type-form').addEventListener('submit', addServerType);
    document.getElementById('category-form').addEventListener('submit', addCategory);
    resetForm();
}

function renderAll() {
    renderProductList();
    renderConfigUI();
    populateFormControls();
    initializeShareGenerator();
}

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

// --- CONFIGURATION LOGIC ---
function loadConfig() {
    const storedTypes = localStorage.getItem('masterServerTypes');
    const storedCategories = localStorage.getItem('masterCategories');
    if (storedTypes && JSON.parse(storedTypes).length > 0) {
        masterServerTypes = JSON.parse(storedTypes);
    } else {
        const types = new Set(productsData.flatMap(p => p.serverTypes));
        masterServerTypes = [...types].sort();
    }
    if (storedCategories && JSON.parse(storedCategories).length > 0) {
        masterCategories = JSON.parse(storedCategories);
    } else {
        const categories = new Set(productsData.map(p => p.category));
        masterCategories = [...categories].sort();
    }
    saveConfig();
}

function saveConfig() {
    localStorage.setItem('masterServerTypes', JSON.stringify(masterServerTypes));
    localStorage.setItem('masterCategories', JSON.stringify(masterCategories));
}

function renderConfigUI() {
    const renderList = (key, containerId, deleteFn) => {
        const data = key === 'serverTypes' ? masterServerTypes : masterCategories;
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        data.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item}</span>
                <div class="item-actions">
                    <button class="icon-btn" onclick="editConfigItem('${key}', ${index}, this)"><i class="fas fa-edit"></i></button>
                    <button class="icon-btn" onclick="${deleteFn.name}('${key}', ${index})"><i class="fas fa-trash"></i></button>
                </div>`;
            container.appendChild(li);
        });
    };
    renderList('serverTypes', 'server-types-list', deleteConfigItem, editConfigItem);
    renderList('categories', 'categories-list', deleteConfigItem, editConfigItem);
}

function editConfigItem(key, index, button) {
    const li = button.closest('li');
    const span = li.querySelector('span');
    const currentText = span.textContent;
    
    li.innerHTML = `
        <input type="text" class="config-edit-input" value="${currentText}" style="flex-grow:1;">
        <div class="item-actions">
            <button class="icon-btn" onclick="saveConfigItem('${key}', ${index}, this)"><i class="fas fa-save"></i></button>
        </div>
    `;
    li.querySelector('input').focus();
}

// =========================================================================
// MODIFIÉ : La fonction de sauvegarde met maintenant à jour les produits
// =========================================================================
function saveConfigItem(key, index, button) {
    const li = button.closest('li');
    const input = li.querySelector('input');
    const newValue = input.value.trim();
    
    if (newValue) {
        if (key === 'serverTypes') {
            const oldValue = masterServerTypes[index];
            masterServerTypes[index] = newValue;
            // Met à jour les produits qui utilisaient l'ancien type
            productsData.forEach(product => {
                const typeIndex = product.serverTypes.indexOf(oldValue);
                if (typeIndex > -1) {
                    product.serverTypes[typeIndex] = newValue;
                }
            });
        } else {
            const oldValue = masterCategories[index];
            masterCategories[index] = newValue;
            // Met à jour les produits qui utilisaient l'ancienne catégorie
            productsData.forEach(product => {
                if (product.category === oldValue) {
                    product.category = newValue;
                }
            });
        }
        saveConfig();
        renderAll(); // Met à jour toute l'interface, y compris la liste des produits
    }
}

function addServerType(e) {
    e.preventDefault();
    const input = document.getElementById('new-server-type');
    if (input.value && !masterServerTypes.includes(input.value)) {
        masterServerTypes.push(input.value);
        masterServerTypes.sort();
        saveConfig();
        renderAll();
    }
    input.value = '';
}

function deleteConfigItem(key, index) {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer cet élément ? Il sera aussi retiré de tous les produits qui l'utilisent.`;
    if (confirm(confirmMessage)) {
        if (key === 'serverTypes') {
            const valueToRemove = masterServerTypes[index];
            masterServerTypes.splice(index, 1);
            productsData.forEach(product => {
                product.serverTypes = product.serverTypes.filter(type => type !== valueToRemove);
            });
        } else {
            const valueToRemove = masterCategories[index];
            masterCategories.splice(index, 1);
            // Note : un produit doit toujours avoir une catégorie. 
            // On pourrait assigner une catégorie par défaut ici si besoin.
            // Pour l'instant, on prévient juste que la catégorie sera vide.
            productsData.forEach(product => {
                if (product.category === valueToRemove) {
                    product.category = ''; // Ou une catégorie par défaut
                }
            });
            alert(`La catégorie "${valueToRemove}" a été supprimée. Les produits affectés n'ont plus de catégorie.`);
        }
        saveConfig();
        renderAll();
    }
}

function addCategory(e) {
    e.preventDefault();
    const input = document.getElementById('new-category');
    if (input.value && !masterCategories.includes(input.value)) {
        masterCategories.push(input.value);
        masterCategories.sort();
        saveConfig();
        renderAll();
    }
    input.value = '';
}

// --- PRODUCT MANAGEMENT LOGIC ---
const productListContainer = document.getElementById('product-list');
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-edit-btn');
const addImageBtn = document.getElementById('add-image-btn');
function populateFormControls() { const serverContainer = document.getElementById('product-server-types'); serverContainer.innerHTML = ''; masterServerTypes.forEach(type => { serverContainer.innerHTML += `<label><input type="checkbox" name="serverType" value="${type}"> ${type}</label>`; }); const categorySelect = document.getElementById('product-category'); categorySelect.innerHTML = ''; masterCategories.forEach(cat => { categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`; }); }
function renderProductList() { productListContainer.innerHTML = ''; productsData.forEach((product, index) => { const card = document.createElement('div'); card.className = 'product-card'; card.innerHTML = `<h3>${product.name} (<code>${product.id}</code>)</h3><p><strong>Prix:</strong> ${product.price} €</p><p><strong>Catégorie:</strong> ${product.category || '<i>Aucune</i>'}</p><div class="actions"><button class="btn btn-primary" onclick="editProduct(${index})">Modifier</button><button class="btn btn-danger" onclick="deleteConfigItem('products', ${index})">Supprimer</button></div>`; productListContainer.appendChild(card); }); }
function handleFormSubmit(e) { e.preventDefault(); const index = document.getElementById('product-index').value; const images = Array.from(document.querySelectorAll('.image-url-input')).map(input => input.value.trim()).filter(Boolean); const selectedServerTypes = Array.from(document.querySelectorAll('input[name="serverType"]:checked')).map(cb => cb.value); const product = { id: document.getElementById('product-id').value.trim(), name: document.getElementById('product-name').value.trim(), price: parseFloat(document.getElementById('product-price').value), description: document.getElementById('product-description').value.trim(), serverTypes: selectedServerTypes, category: document.getElementById('product-category').value, images: images }; if (index !== '') { productsData[parseInt(index)] = product; } else { productsData.push(product); } renderProductList(); resetForm(); }
function editProduct(index) { const product = productsData[index]; formTitle.textContent = 'Modifier un Produit'; document.getElementById('product-index').value = index; document.getElementById('product-id').value = product.id; document.getElementById('product-id').readOnly = true; document.getElementById('product-name').value = product.name; document.getElementById('product-price').value = product.price; document.getElementById('product-description').value = product.description; document.getElementById('product-category').value = product.category; document.querySelectorAll('input[name="serverType"]').forEach(cb => { cb.checked = (product.serverTypes || []).includes(cb.value); }); const imageContainer = document.getElementById('image-inputs'); imageContainer.innerHTML = ''; (product.images || []).forEach(url => imageContainer.appendChild(createImageInput(url))); if ((product.images || []).length === 0) { imageContainer.appendChild(createImageInput()); } previewAllImages(); cancelBtn.style.display = 'inline-block'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
function deleteConfigItem(key, index) { 
    if(key === 'products'){
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${productsData[index].name}" ?`)) { 
            productsData.splice(index, 1); 
            renderProductList(); 
        }
        return;
    }
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer cet élément ? Il sera aussi retiré de tous les produits qui l'utilisent.`; if (confirm(confirmMessage)) { if (key === 'serverTypes') { const valueToRemove = masterServerTypes[index]; masterServerTypes.splice(index, 1); productsData.forEach(product => { product.serverTypes = (product.serverTypes || []).filter(type => type !== valueToRemove); }); } else { const valueToRemove = masterCategories[index]; masterCategories.splice(index, 1); productsData.forEach(product => { if (product.category === valueToRemove) { product.category = ''; } }); alert(`La catégorie "${valueToRemove}" a été supprimée. Les produits affectés n'ont plus de catégorie.`); } saveConfig(); renderAll(); } 
}
function resetForm() { form.reset(); formTitle.textContent = 'Ajouter un Produit'; document.getElementById('product-index').value = ''; document.getElementById('product-id').readOnly = false; cancelBtn.style.display = 'none'; document.getElementById('image-inputs').innerHTML = ''; document.getElementById('image-inputs').appendChild(createImageInput()); previewAllImages(); document.querySelectorAll('input[name="serverType"]').forEach(cb => cb.checked = false); }
function createImageInput(value = '') { const group = document.createElement('div'); group.className = 'image-input-group'; group.innerHTML = `<input type="url" class="image-url-input" value="${value}" placeholder="https://..." oninput="previewImage(this)"><img src="${value}" alt="preview" class="image-preview">`; return group; }
function previewImage(inputElement) { inputElement.nextElementSibling.src = inputElement.value; }
function previewAllImages() { document.querySelectorAll('.image-url-input').forEach(input => previewImage(input)); }
function saveDbFile() { const fileContent = `const products = ${JSON.stringify(productsData, null, 4)};`; const blob = new Blob([fileContent], { type: 'application/javascript' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'products-db.js'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }

// --- SHARE GENERATOR LOGIC ---
function initializeShareGenerator() { 
    const outputContainer = document.getElementById('output'); 
    const downloadAllBtn = document.getElementById('downloadAllBtn'); 
    outputContainer.innerHTML = ''; 
    if (!productsData || productsData.length === 0) { 
        downloadAllBtn.disabled = true; return; 
    } 
    const generateFileContent = (product) => { 
        const productNameSafe = product.name.replace(/"/g, '&quot;'); 
        const productDescriptionSafe = (product.description || '').substring(0, 155).replace(/"/g, '&quot;'); 
        const formattedFileName = `${product.id}.html`; 
        const imageUrl = product.images?.[0] || '';
        return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${productNameSafe} - www.iptv-store.shop</title><meta property="og:title" content="${productNameSafe}"><meta property="og:site_name" content="www.iptv-store.shop"><meta property="og:description" content="${productDescriptionSafe}"><meta property="og:image" content="${imageUrl}"><meta property="og:type" content="product"><meta property="og:url" content="https://www.iptv-store.shop/produits/${formattedFileName}"><style>body{font-family:sans-serif;margin:0;background-color:#f0f2f5;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center}.card{background-color:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.1);padding:40px;max-width:400px}img{max-width:100%;height:auto;border-radius:8px;margin-bottom:20px}h1{font-size:1.5em;color:#1c1e21;margin:0 0 20px 0}.button{display:inline-block;background-color:#0d6efd;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold}</style></head><body><div class="card"><img src="${imageUrl}" alt="Image de ${productNameSafe}"><h1>${productNameSafe}</h1><a href="../product.html?id=${product.id}" class="button">Voir le produit sur IPTV Store</a></div></body></html>`; 
    }; 
    productsData.forEach(product => { 
        const linkContainer = document.createElement('div'); 
        linkContainer.className = 'file-link'; 
        const fileName = document.createElement('span'); 
        const formattedFileName = `${product.id}.html`; 
        fileName.textContent = formattedFileName; 
        const downloadLink = document.createElement('a'); 
        downloadLink.href = URL.createObjectURL(new Blob([generateFileContent(product)], { type: 'text/html' })); 
        downloadLink.textContent = 'Télécharger'; 
        downloadLink.className = 'btn btn-primary'; 
        downloadLink.download = formattedFileName; 
        linkContainer.appendChild(fileName); 
        linkContainer.appendChild(downloadLink); 
        outputContainer.appendChild(linkContainer); 
    }); 
    downloadAllBtn.addEventListener('click', () => { 
        const zip = new JSZip(); 
        productsData.forEach(product => { 
            const content = generateFileContent(product); 
            const fileName = `${product.id}.html`; 
            zip.file(fileName, content); 
        }); 
        zip.generateAsync({ type: "blob" }).then(function(content) { 
            const link = document.createElement('a'); 
            link.href = URL.createObjectURL(content); 
            link.download = "fichiers-partage-produits.zip"; 
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link); 
        }); 
    }); 
}