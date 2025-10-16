// Advanced filtering and sorting for Weed.cz

class BusinessFilter {
    constructor() {
        this.businesses = [];
        this.filteredBusinesses = [];
        this.filters = {
            category: 'all',
            city: 'all',
            delivery: 'all',
            onlineShop: 'all',
            search: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
    }
    
    init(businesses) {
        this.businesses = businesses;
        this.filteredBusinesses = [...businesses];
        this.setupEventListeners();
        this.populateFilterOptions();
    }
    
    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }
        
        // City filter
        const cityFilter = document.getElementById('filter-city');
        if (cityFilter) {
            cityFilter.addEventListener('change', (e) => {
                this.filters.city = e.target.value;
                this.applyFilters();
            });
        }
        
        // Delivery filter
        const deliveryFilter = document.getElementById('filter-delivery');
        if (deliveryFilter) {
            deliveryFilter.addEventListener('change', (e) => {
                this.filters.delivery = e.target.value;
                this.applyFilters();
            });
        }
        
        // Online shop filter
        const onlineShopFilter = document.getElementById('filter-online-shop');
        if (onlineShopFilter) {
            onlineShopFilter.addEventListener('change', (e) => {
                this.filters.onlineShop = e.target.value;
                this.applyFilters();
            });
        }
        
        // Search filter
        const searchFilter = document.getElementById('filter-search');
        if (searchFilter) {
            searchFilter.addEventListener('input', debounce((e) => {
                this.filters.search = e.target.value.toLowerCase();
                this.applyFilters();
            }, 300));
        }
        
        // Sort by
        const sortBySelect = document.getElementById('sort-by');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFilters();
            });
        }
        
        // Sort order
        const sortOrderSelect = document.getElementById('sort-order');
        if (sortOrderSelect) {
            sortOrderSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.applyFilters();
            });
        }
        
        // Reset filters button
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    populateFilterOptions() {
        // Get unique categories
        const categories = [...new Set(this.businesses.map(b => b.category))].sort();
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categoryFilter.appendChild(option);
            });
        }
        
        // Get unique cities
        const cities = [...new Set(this.businesses.map(b => b.city))].filter(c => c).sort();
        const cityFilter = document.getElementById('filter-city');
        if (cityFilter) {
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        }
    }
    
    applyFilters() {
        let filtered = [...this.businesses];
        
        // Apply category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(b => b.category === this.filters.category);
        }
        
        // Apply city filter
        if (this.filters.city !== 'all') {
            filtered = filtered.filter(b => b.city === this.filters.city);
        }
        
        // Apply delivery filter
        if (this.filters.delivery !== 'all') {
            filtered = filtered.filter(b => b.delivery_available === this.filters.delivery);
        }
        
        // Apply online shop filter
        if (this.filters.onlineShop !== 'all') {
            filtered = filtered.filter(b => b.online_shop === this.filters.onlineShop);
        }
        
        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(b => {
                const searchText = `${b.name} ${b.city} ${b.products} ${b.services}`.toLowerCase();
                return searchText.includes(this.filters.search);
            });
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.sortBy) {
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'city':
                    aVal = a.city.toLowerCase();
                    bVal = b.city.toLowerCase();
                    break;
                case 'category':
                    aVal = a.category.toLowerCase();
                    bVal = b.category.toLowerCase();
                    break;
                default:
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
            }
            
            if (this.sortOrder === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
        
        this.filteredBusinesses = filtered;
        this.renderResults();
        this.updateResultsCount();
    }
    
    renderResults() {
        const container = document.getElementById('results-container');
        if (!container) return;
        
        if (this.filteredBusinesses.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <h3 style="color: var(--text-gray); font-size: 24px; margin-bottom: 16px;">
                        Nenalezeny žádné výsledky
                    </h3>
                    <p style="color: var(--text-gray); margin-bottom: 24px;">
                        Zkuste upravit filtry nebo vyhledávání
                    </p>
                    <button id="reset-filters-inline" class="btn btn-primary">
                        Resetovat filtry
                    </button>
                </div>
            `;
            
            const resetBtn = document.getElementById('reset-filters-inline');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => this.resetFilters());
            }
            return;
        }
        
        container.innerHTML = '';
        this.filteredBusinesses.forEach(business => {
            if (typeof createBusinessCardHTML === 'function') {
                container.innerHTML += createBusinessCardHTML(business);
            }
        });
    }
    
    updateResultsCount() {
        const countElement = document.getElementById('results-count');
        if (countElement) {
            const total = this.businesses.length;
            const filtered = this.filteredBusinesses.length;
            countElement.textContent = `Zobrazeno ${filtered} z ${total} lokací`;
        }
    }
    
    resetFilters() {
        this.filters = {
            category: 'all',
            city: 'all',
            delivery: 'all',
            onlineShop: 'all',
            search: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        
        // Reset form elements
        const categoryFilter = document.getElementById('filter-category');
        if (categoryFilter) categoryFilter.value = 'all';
        
        const cityFilter = document.getElementById('filter-city');
        if (cityFilter) cityFilter.value = 'all';
        
        const deliveryFilter = document.getElementById('filter-delivery');
        if (deliveryFilter) deliveryFilter.value = 'all';
        
        const onlineShopFilter = document.getElementById('filter-online-shop');
        if (onlineShopFilter) onlineShopFilter.value = 'all';
        
        const searchFilter = document.getElementById('filter-search');
        if (searchFilter) searchFilter.value = '';
        
        const sortBySelect = document.getElementById('sort-by');
        if (sortBySelect) sortBySelect.value = 'name';
        
        const sortOrderSelect = document.getElementById('sort-order');
        if (sortOrderSelect) sortOrderSelect.value = 'asc';
        
        this.applyFilters();
    }
}

// Initialize filter on pages that need it
document.addEventListener('DOMContentLoaded', function() {
    if (typeof SITE_DATA !== 'undefined' && SITE_DATA.businesses) {
        const filterContainer = document.getElementById('filters-container');
        if (filterContainer) {
            window.businessFilter = new BusinessFilter();
            window.businessFilter.init(SITE_DATA.businesses);
        }
    }
});

// Debounce helper (if not already defined in main.js)
if (typeof debounce === 'undefined') {
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
}

