// Weed.cz - Main JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeFilters();
    highlightActiveNav();
});

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value.toLowerCase().trim();
        filterBusinesses(query);
    }, 300));
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Filter businesses
function filterBusinesses(query) {
    const cards = document.querySelectorAll('.business-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (query === '' || text.includes(query)) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show/hide empty state
    const emptyState = document.getElementById('empty-state');
    const resultsContainer = document.getElementById('results-container');
    
    if (emptyState && resultsContainer) {
        if (visibleCount === 0) {
            resultsContainer.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            resultsContainer.style.display = '';
            emptyState.style.display = 'none';
        }
    }
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const cityFilter = document.getElementById('city-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (cityFilter) {
        cityFilter.addEventListener('change', applyFilters);
    }
}

// Apply filters
function applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const cityFilter = document.getElementById('city-filter');
    
    const selectedCategory = categoryFilter ? categoryFilter.value : '';
    const selectedCity = cityFilter ? cityFilter.value : '';
    
    const cards = document.querySelectorAll('.business-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const category = card.dataset.category || '';
        const city = card.dataset.city || '';
        
        const categoryMatch = !selectedCategory || category === selectedCategory;
        const cityMatch = !selectedCity || city === selectedCity;
        
        if (categoryMatch && cityMatch) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = visibleCount;
    }
}

// Highlight active navigation
function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || 
            (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
            link.classList.add('active');
        }
    });
}

// Get category color class
function getCategoryClass(category) {
    const categoryMap = {
        'CBD Retail Shop': 'category-cbd',
        'Seeds & Grow Shop': 'category-seeds',
        'E-commerce Platform': 'category-ecommerce',
        'Medical Cannabis': 'category-medical',
        'Delivery Service': 'category-delivery',
        'Social Club & Event': 'category-social'
    };
    return categoryMap[category] || 'category-default';
}

// Format phone number
function formatPhone(phone) {
    if (!phone) return '';
    return phone.replace(/(\+420)?(\d{3})(\d{3})(\d{3})/, '+420 $2 $3 $4');
}

// Truncate text
function truncate(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.nav-links');
    if (nav) {
        nav.classList.toggle('mobile-open');
    }
}
