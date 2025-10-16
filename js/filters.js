// Simple and effective filtering for Weed.cz business listings

let allBusinesses = [];
let filteredBusinesses = [];
let currentCategory = '';

// Initialize filters for a specific category
function initializeFilters(category) {
    currentCategory = category;
    
    // Get businesses from SITE_DATA
    if (typeof window.SITE_DATA === 'undefined' || !window.SITE_DATA.businesses) {
        console.log('Waiting for SITE_DATA to load...');
        // Wait a bit and try again
        setTimeout(() => initializeFilters(category), 100);
        return;
    }
    
    console.log('SITE_DATA loaded with', window.SITE_DATA.businesses.length, 'businesses');
    console.log('Filtering for category:', category);
    
    // Filter by category if specified
    if (category && category !== 'all') {
        allBusinesses = window.SITE_DATA.businesses.filter(b => b.category === category);
    } else {
        allBusinesses = window.SITE_DATA.businesses;
    }
    
    filteredBusinesses = [...allBusinesses];
    
    // Populate city dropdown
    populateCityFilter();
    
    // Setup event listeners
    setupFilterListeners();
    
    // Initial render
    renderBusinessCards();
    updateResultsCount();
}

// Populate city filter dropdown
function populateCityFilter() {
    const cityFilter = document.getElementById('city-filter');
    if (!cityFilter) return;
    
    // Get unique cities
    const cities = [...new Set(allBusinesses.map(b => b.city))].filter(c => c).sort();
    
    // Clear existing options except first one
    cityFilter.innerHTML = '<option value="">Všechna města</option>';
    
    // Add city options
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

// Setup filter event listeners
function setupFilterListeners() {
    // Search filter
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) {
        searchFilter.addEventListener('input', applyFilters);
    }
    
    // City filter
    const cityFilter = document.getElementById('city-filter');
    if (cityFilter) {
        cityFilter.addEventListener('change', applyFilters);
    }
    
    // Delivery filter
    const deliveryFilter = document.getElementById('delivery-filter');
    if (deliveryFilter) {
        deliveryFilter.addEventListener('change', applyFilters);
    }
    
    // Online shop filter
    const onlineFilter = document.getElementById('online-filter');
    if (onlineFilter) {
        onlineFilter.addEventListener('change', applyFilters);
    }
    
    // Sort by
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', applyFilters);
    }
    
    // Sort order
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) {
        sortOrder.addEventListener('change', applyFilters);
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
}

// Apply all filters
function applyFilters() {
    let results = [...allBusinesses];
    
    // Search filter
    const searchValue = document.getElementById('search-filter')?.value.toLowerCase() || '';
    if (searchValue) {
        results = results.filter(b => {
            const searchText = `${b.name} ${b.city} ${b.products || ''} ${b.services || ''}`.toLowerCase();
            return searchText.includes(searchValue);
        });
    }
    
    // City filter
    const cityValue = document.getElementById('city-filter')?.value || '';
    if (cityValue) {
        results = results.filter(b => b.city === cityValue);
    }
    
    // Delivery filter
    const deliveryValue = document.getElementById('delivery-filter')?.value || '';
    if (deliveryValue) {
        results = results.filter(b => b.delivery_available === deliveryValue);
    }
    
    // Online shop filter
    const onlineValue = document.getElementById('online-filter')?.value || '';
    if (onlineValue) {
        results = results.filter(b => b.online_shop === onlineValue);
    }
    
    // Sorting
    const sortBy = document.getElementById('sort-by')?.value || 'name';
    const sortOrder = document.getElementById('sort-order')?.value || 'asc';
    
    results.sort((a, b) => {
        let aVal = sortBy === 'city' ? (a.city || '') : (a.name || '');
        let bVal = sortBy === 'city' ? (b.city || '') : (b.name || '');
        
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
        
        if (sortOrder === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
    
    filteredBusinesses = results;
    renderBusinessCards();
    updateResultsCount();
}

// Render business cards
function renderBusinessCards() {
    const container = document.getElementById('business-list');
    if (!container) return;

    // Debug: Check if image function is available
    if (typeof window.getBusinessThumbnail !== 'function') {
        console.error('getBusinessThumbnail function not available!');
    } else {
        console.log('getBusinessThumbnail is available');
    }

    
    if (filteredBusinesses.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <h3 style="color: #666; font-size: 24px; margin-bottom: 16px;">
                    Nenalezeny žádné výsledky
                </h3>
                <p style="color: #999; margin-bottom: 24px;">
                    Zkuste upravit filtry nebo vyhledávání
                </p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    filteredBusinesses.forEach((business, index) => {
        const card = createBusinessCard(business, index);
        container.appendChild(card);
    });
}

// Create a business card element
function createBusinessCard(business, index) {
    const card = document.createElement('div');
    card.className = 'business-card';
    
    // Get business image
    const imageUrl = (typeof window.getBusinessThumbnail === 'function') ? window.getBusinessThumbnail(business.name, business.category) : '/images/businesses/cbd-shop-display.jpg';
    
    // Add colored border
    const colors = ['pink', 'orange', 'purple', 'green'];
    card.classList.add(`border-${colors[index % colors.length]}`)
    
    // Create badges
    const badges = [];
    if (business.category) {
        badges.push(`<span class="badge badge-primary">${business.category}</span>`);
    }
    if (business.type) {
        badges.push(`<span class="badge badge-info">${business.type}</span>`);
    }
    if (business.online_shop === 'Yes') {
        badges.push(`<span class="badge badge-success">E-shop</span>`);
    }
    if (business.delivery_available === 'Yes') {
        badges.push(`<span class="badge badge-warning">Rozvoz</span>`);
    }
    
    // Build card HTML
    card.innerHTML = `
        <div class="business-card-image" style="background-image: url(\'${imageUrl}\')"></div>
        <div class="business-card-header">
            <h3 class="business-card-title">
                <a href="${business.url || '#'}">${business.name}</a>
            </h3>
            <div class="business-badges">
                ${badges.join('')}
            </div>
        </div>
        <div class="business-card-body">
            ${business.city ? `<div class="business-info-item">📍 <strong>${business.city}</strong></div>` : ''}
            ${business.address ? `<div class="business-info-item">🏠 ${business.address}</div>` : ''}
            ${business.phone ? `<div class="business-info-item">📞 <a href="tel:${business.phone}">${business.phone}</a></div>` : ''}
            ${business.email ? `<div class="business-info-item">✉️ <a href="mailto:${business.email}">${business.email}</a></div>` : ''}
            ${business.website ? `<div class="business-info-item">🌐 <a href="${business.website}" target="_blank">${business.website.replace('https://', '').replace('http://', '').substring(0, 30)}...</a></div>` : ''}
            ${business.products ? `<div class="business-info-item">🌿 ${business.products}</div>` : ''}
        </div>
        <div class="business-card-footer">
            ${business.url ? `<a href="${business.url}" class="btn btn-primary">Zobrazit detail</a>` : ''}
            ${business.website ? `<a href="${business.website}" target="_blank" class="btn btn-outline">Navštívit web</a>` : ''}
        </div>
    `;
    
    return card;
}

// Update results count
function updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        const total = allBusinesses.length;
        const filtered = filteredBusinesses.length;
        countElement.textContent = `Zobrazeno ${filtered} z ${total} lokací`;
    }
}

// Reset all filters
function resetFilters() {
    // Reset all filter inputs
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) searchFilter.value = '';
    
    const cityFilter = document.getElementById('city-filter');
    if (cityFilter) cityFilter.value = '';
    
    const deliveryFilter = document.getElementById('delivery-filter');
    if (deliveryFilter) deliveryFilter.value = '';
    
    const onlineFilter = document.getElementById('online-filter');
    if (onlineFilter) onlineFilter.value = '';
    
    const sortBy = document.getElementById('sort-by');
    if (sortBy) sortBy.value = 'name';
    
    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) sortOrder.value = 'asc';
    
    // Reapply filters (which will show all)
    applyFilters();
}

