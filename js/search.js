// Global search functionality for Weed.cz

/**
 * Initialize search functionality
 */
function initializeSearch() {
  const searchInput = document.getElementById('global-search');
  const searchButton = document.getElementById('search-button');
  
  if (!searchInput) return;
  
  // Search on Enter key
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  // Search on button click
  if (searchButton) {
    searchButton.addEventListener('click', performSearch);
  }
  
  // Auto-suggest as user types (debounced)
  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      showSearchSuggestions(searchInput.value);
    }, 300);
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
      hideSearchSuggestions();
    }
  });
}

/**
 * Perform search and redirect to results
 */
function performSearch() {
  const searchInput = document.getElementById('global-search');
  const query = searchInput.value.trim();
  
  if (!query) return;
  
  // Redirect to search results page with query parameter
  window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
}

/**
 * Show search suggestions dropdown
 */
function showSearchSuggestions(query) {
  if (!query || query.length < 2) {
    hideSearchSuggestions();
    return;
  }
  
  // Wait for SITE_DATA to load
  if (typeof window.SITE_DATA === 'undefined' || !window.SITE_DATA.businesses) {
    return;
  }
  
  const businesses = window.SITE_DATA.businesses;
  const lowerQuery = query.toLowerCase();
  
  // Find matching businesses
  const matches = businesses.filter(b => {
    return (b.name && b.name.toLowerCase().includes(lowerQuery)) ||
           (b.city && b.city.toLowerCase().includes(lowerQuery)) ||
           (b.address && b.address.toLowerCase().includes(lowerQuery)) ||
           (b.products && b.products.toLowerCase().includes(lowerQuery)) ||
           (b.category && b.category.toLowerCase().includes(lowerQuery));
  }).slice(0, 5); // Limit to 5 suggestions
  
  if (matches.length === 0) {
    hideSearchSuggestions();
    return;
  }
  
  // Create or update suggestions dropdown
  let dropdown = document.getElementById('search-suggestions');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'search-suggestions';
    dropdown.className = 'search-suggestions';
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
      searchContainer.appendChild(dropdown);
    }
  }
  
  // Build suggestions HTML
  dropdown.innerHTML = matches.map(b => `
    <a href="${b.url || '#'}" class="search-suggestion-item">
      <div class="suggestion-name">${highlightMatch(b.name, query)}</div>
      <div class="suggestion-details">
        ${b.city ? `📍 ${b.city}` : ''} 
        ${b.category ? `• ${b.category}` : ''}
      </div>
    </a>
  `).join('');
  
  dropdown.style.display = 'block';
}

/**
 * Hide search suggestions
 */
function hideSearchSuggestions() {
  const dropdown = document.getElementById('search-suggestions');
  if (dropdown) {
    dropdown.style.display = 'none';
  }
}

/**
 * Highlight matching text in search results
 */
function highlightMatch(text, query) {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

/**
 * Perform search on search results page
 */
function performSearchOnResultsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  
  if (!query) {
    document.getElementById('search-results').innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2>Zadejte vyhledávací dotaz</h2>
        <p style="color: #666;">Použijte vyhledávací pole výše</p>
      </div>
    `;
    return;
  }
  
  // Update search input
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    searchInput.value = query;
  }
  
  // Wait for SITE_DATA
  if (typeof window.SITE_DATA === 'undefined' || !window.SITE_DATA.businesses) {
    setTimeout(performSearchOnResultsPage, 100);
    return;
  }
  
  const businesses = window.SITE_DATA.businesses;
  const lowerQuery = query.toLowerCase();
  
  // Search across all fields
  const results = businesses.filter(b => {
    return (b.name && b.name.toLowerCase().includes(lowerQuery)) ||
           (b.city && b.city.toLowerCase().includes(lowerQuery)) ||
           (b.address && b.address.toLowerCase().includes(lowerQuery)) ||
           (b.products && b.products.toLowerCase().includes(lowerQuery)) ||
           (b.category && b.category.toLowerCase().includes(lowerQuery)) ||
           (b.type && b.type.toLowerCase().includes(lowerQuery));
  });
  
  // Display results
  displaySearchResults(results, query);
}

/**
 * Display search results
 */
function displaySearchResults(results, query) {
  const container = document.getElementById('search-results');
  if (!container) return;
  
  // Update results count
  const countElement = document.getElementById('results-count');
  if (countElement) {
    countElement.textContent = `Nalezeno ${results.length} výsledků pro "${query}"`;
  }
  
  if (results.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h2 style="color: #666; margin-bottom: 16px;">Nenalezeny žádné výsledky</h2>
        <p style="color: #999; margin-bottom: 24px;">
          Pro dotaz "${query}" nebyly nalezeny žádné výsledky.
        </p>
        <p style="color: #999;">
          Zkuste jiná klíčová slova nebo <a href="/" style="color: var(--primary-color);">procházejte všechny kategorie</a>
        </p>
      </div>
    `;
    return;
  }
  
  // Render business cards
  container.innerHTML = '';
  const colors = ['pink', 'orange', 'purple', 'green'];
  
  results.forEach((business, index) => {
    const card = createSearchResultCard(business, index, colors[index % colors.length], query);
    container.appendChild(card);
  });
}

/**
 * Create a search result card
 */
function createSearchResultCard(business, index, borderColor, query) {
  const card = document.createElement('div');
  card.className = `business-card border-${borderColor}`;
  
  // Get business image
  const imageUrl = typeof getBusinessImage === 'function' 
    ? getBusinessImage(business.name, business.category) 
    : '/images/businesses/cannabis-shop-prague-generic.jpg';
  
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
    <div class="business-card-image" style="background-image: url('${imageUrl}')"></div>
    <div class="business-card-header">
      <h3 class="business-card-title">
        <a href="${business.url || '#'}">${highlightMatch(business.name, query)}</a>
      </h3>
      <div class="business-badges">
        ${badges.join('')}
      </div>
    </div>
    <div class="business-card-body">
      ${business.city ? `<div class="business-info-item">📍 <strong>${highlightMatch(business.city, query)}</strong></div>` : ''}
      ${business.address ? `<div class="business-info-item">🏠 ${highlightMatch(business.address, query)}</div>` : ''}
      ${business.phone ? `<div class="business-info-item">📞 <a href="tel:${business.phone}">${business.phone}</a></div>` : ''}
      ${business.email ? `<div class="business-info-item">✉️ <a href="mailto:${business.email}">${business.email}</a></div>` : ''}
      ${business.website ? `<div class="business-info-item">🌐 <a href="${business.website}" target="_blank">${business.website.replace('https://', '').replace('http://', '').substring(0, 30)}...</a></div>` : ''}
      ${business.products ? `<div class="business-info-item">🌿 ${highlightMatch(business.products, query)}</div>` : ''}
    </div>
    <div class="business-card-footer">
      ${business.url ? `<a href="${business.url}" class="btn btn-primary">Zobrazit detail</a>` : ''}
      ${business.website ? `<a href="${business.website}" target="_blank" class="btn btn-outline">Navštívit web</a>` : ''}
    </div>
  `;
  
  return card;
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
  initializeSearch();
  
  // If on search results page, perform search
  if (window.location.pathname.includes('search.html')) {
    performSearchOnResultsPage();
  }
});

// Keyboard shortcut: Press "/" to focus search
document.addEventListener('keydown', function(e) {
  if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const searchInput = document.getElementById('global-search');
    if (searchInput && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  }
});

