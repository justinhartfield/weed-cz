// Enhanced filtering system for Weed.cz with additional filter options
// Extends the existing filters.js with new capabilities

// Add new filter options
function setupEnhancedFilters() {
    // Add "Open Now" filter
    const openNowFilter = document.getElementById('open-now-filter');
    if (openNowFilter) {
        openNowFilter.addEventListener('change', applyFilters);
    }
    
    // Add payment method filter
    const paymentFilter = document.getElementById('payment-filter');
    if (paymentFilter) {
        paymentFilter.addEventListener('change', applyFilters);
    }
    
    // Add accessibility filter
    const accessibilityFilter = document.getElementById('accessibility-filter');
    if (accessibilityFilter) {
        accessibilityFilter.addEventListener('change', applyFilters);
    }
    
    // Add price range filter
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    // Add rating filter
    const ratingFilter = document.getElementById('rating-filter');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
}

// Enhanced apply filters function
function applyEnhancedFilters() {
    // Call the original applyFilters first
    if (typeof applyFilters === 'function') {
        applyFilters();
    }
    
    let results = [...filteredBusinesses];
    
    // Open now filter
    const openNowValue = document.getElementById('open-now-filter')?.checked || false;
    if (openNowValue) {
        results = results.filter(b => isBusinessOpenNow(b));
    }
    
    // Payment method filter
    const paymentValue = document.getElementById('payment-filter')?.value || '';
    if (paymentValue) {
        results = results.filter(b => {
            const payments = b.payment_accepted || '';
            return payments.toLowerCase().includes(paymentValue.toLowerCase());
        });
    }
    
    // Accessibility filter
    const accessibilityValue = document.getElementById('accessibility-filter')?.checked || false;
    if (accessibilityValue) {
        results = results.filter(b => b.wheelchair_accessible === true || b.wheelchair_accessible === 'Yes');
    }
    
    // Price range filter
    const priceValue = document.getElementById('price-filter')?.value || '';
    if (priceValue) {
        results = results.filter(b => b.price_range === priceValue);
    }
    
    // Rating filter
    const ratingValue = document.getElementById('rating-filter')?.value || '';
    if (ratingValue) {
        const minRating = parseFloat(ratingValue);
        results = results.filter(b => {
            const rating = b.rating || 0;
            return rating >= minRating;
        });
    }
    
    filteredBusinesses = results;
    renderBusinessCards();
    updateResultsCount();
}

// Check if business is open now
function isBusinessOpenNow(business) {
    if (!business.opening_hours && !business.opening_hours_specification) {
        return false; // Unknown, exclude from "open now" filter
    }
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
    
    // Parse opening_hours_specification if available
    if (business.opening_hours_specification && Array.isArray(business.opening_hours_specification)) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDayName = dayNames[currentDay];
        
        for (const spec of business.opening_hours_specification) {
            const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek];
            
            if (days.includes(currentDayName)) {
                const opens = parseTime(spec.opens);
                const closes = parseTime(spec.closes);
                
                if (currentTime >= opens && currentTime <= closes) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // Fallback: parse simple opening_hours string (e.g., "Mo-Fr 09:00-18:00")
    // This is a simplified parser and may need enhancement
    return false;
}

// Parse time string (HH:MM) to minutes since midnight
function parseTime(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0);
}

// Add distance-based filtering (requires geolocation)
function addDistanceFilter() {
    if ('geolocation' in navigator) {
        const distanceFilterContainer = document.getElementById('distance-filter-container');
        if (distanceFilterContainer) {
            distanceFilterContainer.style.display = 'block';
            
            const distanceFilter = document.getElementById('distance-filter');
            if (distanceFilter) {
                distanceFilter.addEventListener('change', applyDistanceFilter);
            }
        }
    }
}

function applyDistanceFilter() {
    navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const maxDistance = parseFloat(document.getElementById('distance-filter')?.value || 999999);
        
        let results = [...filteredBusinesses];
        results = results.filter(b => {
            if (!b.latitude || !b.longitude) return true; // Include if no coordinates
            const distance = calculateDistance(userLat, userLon, b.latitude, b.longitude);
            return distance <= maxDistance;
        });
        
        // Sort by distance
        results.sort((a, b) => {
            if (!a.latitude || !a.longitude) return 1;
            if (!b.latitude || !b.longitude) return -1;
            const distA = calculateDistance(userLat, userLon, a.latitude, a.longitude);
            const distB = calculateDistance(userLat, userLon, b.latitude, b.longitude);
            return distA - distB;
        });
        
        filteredBusinesses = results;
        renderBusinessCards();
        updateResultsCount();
    });
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Initialize enhanced filters when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for original filters to be set up
    setTimeout(() => {
        setupEnhancedFilters();
        addDistanceFilter();
    }, 500);
});

