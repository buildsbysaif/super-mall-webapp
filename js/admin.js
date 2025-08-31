// --- Admin Panel Logic ---

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardContainer = document.getElementById('admin-dashboard-container');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const offerModal = document.getElementById('offer-modal');
let currentShopIdForOffers = null; // To store which shop we are editing

// Helper function for status messages
function showStatus(message, isSuccess) {
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = message;
    statusMessage.className = isSuccess ? 'status-success' : 'status-error';
    statusMessage.style.display = 'block';
    setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
}

// --- Authentication ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password).catch(error => showStatus("Login failed: " + error.message, false));
});

logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// --- Auth state listener to toggle between login and dashboard views ---
auth.onAuthStateChanged(user => {
    const body = document.querySelector('body');
    
    if (user) {
        console.log("Admin is authenticated. Showing dashboard.");
        body.classList.remove('login-page'); // Remove class to un-center content
        loginSection.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        
        // Load initial data for the dashboard once the user is logged in.
        initializeDashboard();
    } else {
        body.classList.add('login-page'); // Add class to center the login card
        loginSection.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
    }
});

// --- Main Initializer for Dashboard ---
function initializeDashboard() {
    populateDropdowns();
    setupEventListeners();
    updateDashboardStats(); // For the new stat cards
    loadShopsIntoTable(); // For the new data table
}

// --- Real-time Statistics ---
function updateDashboardStats() {
    db.collection('shops').onSnapshot(snap => document.getElementById('total-shops').textContent = snap.size);
    db.collection('categories').onSnapshot(snap => document.getElementById('total-categories').textContent = snap.size);
    db.collection('floors').onSnapshot(snap => document.getElementById('total-floors').textContent = snap.size);
}

// --- Data Population ---
async function populateDropdowns() {
    const categorySelect = document.getElementById('shop-category');
    const floorSelect = document.getElementById('shop-floor');
    
    db.collection('categories').onSnapshot(snapshot => {
        let options = '<option>Select Category</option>';
        snapshot.forEach(doc => { options += `<option value="${doc.data().name}">${doc.data().name}</option>`; });
        categorySelect.innerHTML = options;
    });

    db.collection('floors').onSnapshot(snapshot => {
        let options = '<option>Select Floor</option>';
        snapshot.forEach(doc => { options += `<option value="${doc.data().name}">${doc.data().name}</option>`; });
        floorSelect.innerHTML = options;
    });
}

// Loads shops into the new table structure
function loadShopsIntoTable() {
    db.collection('shops').onSnapshot(snapshot => {
        const tableBody = document.getElementById('shops-table-body');
        tableBody.innerHTML = '';
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4">No shops created yet.</td></tr>';
            return;
        }
        snapshot.forEach(doc => {
            const shop = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shop.name}</td>
                <td>${shop.category}</td>
                <td>${shop.floor}</td>
                <td>
                    <button class="manage-offers-btn" data-id="${doc.id}" data-name="${shop.name}">Manage Offers</button>
                    <button class="delete-shop-btn" data-id="${doc.id}">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    document.getElementById('category-form').addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('category-name').value; if(name) { db.collection('categories').add({ name }).then(() => showStatus("Category added!", true)); e.target.reset(); } });
    document.getElementById('floor-form').addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('floor-name').value; if(name) { db.collection('floors').add({ name }).then(() => showStatus("Floor added!", true)); e.target.reset(); } });
    document.getElementById('create-shop-form').addEventListener('submit', e => { e.preventDefault(); const shopData = { name: document.getElementById('shop-name').value, category: document.getElementById('shop-category').value, floor: document.getElementById('shop-floor').value }; if(shopData.name && shopData.category !== 'Select Category' && shopData.floor !== 'Select Floor') { db.collection('shops').add(shopData).then(() => showStatus("Shop created!", true)); e.target.reset(); } else { showStatus("Please fill out all shop fields.", false); } });

    // Event Delegation for shop actions
    document.getElementById('shops-table-body').addEventListener('click', e => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('delete-shop-btn')) {
            if (confirm("Are you sure?")) { db.collection('shops').doc(id).delete().then(() => showStatus("Shop deleted.", true)); }
        }
        if (e.target.classList.contains('manage-offers-btn')) {
            const name = e.target.dataset.name;
            openOfferModal(id, name);
        }
    });

    // Event Listeners for the Offer Modal
    offerModal.querySelector('.modal-close-btn').addEventListener('click', closeOfferModal);
    document.getElementById('add-offer-form').addEventListener('submit', e => {
        e.preventDefault();
        const offerText = document.getElementById('offer-text').value;
        if (currentShopIdForOffers && offerText) {
            db.collection('shops').doc(currentShopIdForOffers).collection('offers').add({ text: offerText });
            showStatus("New offer added!", true);
            e.target.reset();
        }
    });
    
    document.getElementById('existing-offers-list').addEventListener('click', e => {
        if (e.target.classList.contains('delete-offer-btn')) {
            const offerId = e.target.dataset.id;
            if (currentShopIdForOffers && offerId) {
                db.collection('shops').doc(currentShopIdForOffers).collection('offers').doc(offerId).delete();
                showStatus("Offer deleted.", true);
            }
        }
    });
}

// --- Functions to control the Offer Modal ---
function openOfferModal(shopId, shopName) {
    currentShopIdForOffers = shopId;
    document.getElementById('offer-modal-title').textContent = `Manage Offers for ${shopName}`;
    
    const offersList = document.getElementById('existing-offers-list');
    db.collection('shops').doc(shopId).collection('offers').onSnapshot(snapshot => {
        offersList.innerHTML = '';
        if (snapshot.empty) {
            offersList.innerHTML = '<p>No offers exist for this shop yet.</p>';
            return;
        }
        snapshot.forEach(doc => {
            const offer = doc.data();
            const offerEl = document.createElement('div');
            offerEl.className = 'offer-item';
            offerEl.innerHTML = `<span>${offer.text}</span><button class="delete-offer-btn" data-id="${doc.id}">&times;</button>`;
            offersList.appendChild(offerEl);
        });
    });
    
    offerModal.classList.remove('hidden');
}

function closeOfferModal() {
    currentShopIdForOffers = null;
    offerModal.classList.add('hidden');
}