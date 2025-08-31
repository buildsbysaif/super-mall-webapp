// --- User Frontend Logic ---

let allShops = []; // Cache for all shops

// Fetches all shops and their sub-collection of offers from Firestore
async function fetchShops() {
    const shopsGrid = document.getElementById('shops-grid');
    shopsGrid.innerHTML = '<div class="loader"></div>';

    try {
        const snapshot = await db.collection('shops').get();
        allShops = await Promise.all(snapshot.docs.map(async doc => {
            const shop = { id: doc.id, ...doc.data() };
            const offersSnapshot = await db.collection('shops').doc(doc.id).collection('offers').get();
            shop.offers = offersSnapshot.docs.map(offerDoc => offerDoc.data().text);
            return shop;
        }));
        
        console.log("All shops and offers fetched:", allShops.length);
        displayShops(allShops);
        populateFilters();
    } catch (error) {
        console.error("Error fetching shops:", error);
        shopsGrid.innerHTML = '<p class="empty-state">Could not load shops. Please try again later.</p>';
    }
}

// Displays an array of shops on the page
function displayShops(shopsToDisplay) {
    const shopsGrid = document.getElementById('shops-grid');
    shopsGrid.innerHTML = '';

    if (shopsToDisplay.length === 0) {
        shopsGrid.innerHTML = '<p class="empty-state">No shops match your criteria.</p>';
        return;
    }

    shopsToDisplay.forEach(shop => {
        const shopCard = document.createElement('div');
        shopCard.className = 'shop-card';
        shopCard.innerHTML = `
            <div class="shop-card-content">
                <h3>${shop.name}</h3>
                <p><strong>Category:</strong> ${shop.category}</p>
                <p><strong>Floor:</strong> ${shop.floor}</p>
                <button class="details-btn" data-id="${shop.id}">View Details</button>
            </div>`;
        shopsGrid.appendChild(shopCard);
    });
}

// Populates filter dropdowns based on available shops
function populateFilters() {
    const categories = ['All Categories', ...new Set(allShops.map(s => s.category))];
    const floors = ['All Floors', ...new Set(allShops.map(s => s.floor))];
    const catFilter = document.getElementById('category-filter');
    const floorFilter = document.getElementById('floor-filter');
    catFilter.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    floorFilter.innerHTML = floors.map(f => `<option value="${f}">${f}</option>`).join('');
}

// Applies filters and search based on user input
function applyFilters() {
    const selectedCategory = document.getElementById('category-filter').value;
    const selectedFloor = document.getElementById('floor-filter').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    
    let filteredShops = allShops;

    if (selectedCategory !== 'All Categories') {
        filteredShops = filteredShops.filter(s => s.category === selectedCategory);
    }
    if (selectedFloor !== 'All Floors') {
        filteredShops = filteredShops.filter(s => s.floor === selectedFloor);
    }
    if (searchQuery) {
        filteredShops = filteredShops.filter(s => s.name.toLowerCase().includes(searchQuery));
    }
    
    displayShops(filteredShops);
}

// --- Modal Logic ---
const modal = document.getElementById('shop-modal');

function openModal(shopId) {
    const shop = allShops.find(s => s.id === shopId);
    const modalBody = document.getElementById('modal-body');
    
    let offersHTML = shop.offers.length > 0 ? shop.offers.map(o => `<li>${o}</li>`).join('') : '<li>No current offers</li>';
    
    modalBody.innerHTML = `
        <h2>${shop.name}</h2>
        <p><strong>Category:</strong> ${shop.category}</p>
        <p><strong>Floor:</strong> ${shop.floor}</p>
        <hr>
        <h4>Current Offers:</h4>
        <ul>${offersHTML}</ul>
    `;
    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
}

// --- Event Listeners ---
document.getElementById('category-filter').addEventListener('change', applyFilters);
document.getElementById('floor-filter').addEventListener('change', applyFilters);
document.getElementById('search-input').addEventListener('input', applyFilters);

document.getElementById('shops-grid').addEventListener('click', e => {
    if (e.target.classList.contains('details-btn')) {
        openModal(e.target.dataset.id);
    }
});

modal.addEventListener('click', e => {
    if (e.target.classList.contains('modal-container') || e.target.classList.contains('modal-close-btn')) {
        closeModal();
    }
});

// Initial fetch when the script loads
fetchShops();