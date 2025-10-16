// Schema.org LocalBusiness structured data generator
// This script adds LocalBusiness schema to business detail pages

function generateLocalBusinessSchema(business) {
    if (!business) return null;
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": business.name,
        "description": business.products || business.services || `${business.category} in ${business.city}`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": business.address || "",
            "addressLocality": business.city || "",
            "addressRegion": business.region_name || "",
            "addressCountry": "CZ"
        }
    };
    
    // Add optional fields if available
    if (business.phone) {
        schema.telephone = business.phone;
    }
    
    if (business.email) {
        schema.email = business.email;
    }
    
    if (business.website) {
        schema.url = business.website.startsWith('http') ? business.website : `https://${business.website}`;
    }
    
    if (business.opening_hours) {
        schema.openingHours = business.opening_hours;
    }
    
    // Add category-specific type
    if (business.category === 'Medical Cannabis') {
        schema["@type"] = "MedicalBusiness";
    } else if (business.category === 'CBD Retail Shop' || business.category === 'Seeds & Grow Shop') {
        schema["@type"] = "Store";
    }
    
    // Add service area for delivery services
    if (business.delivery_available === 'Yes') {
        schema.areaServed = {
            "@type": "Country",
            "name": "Czech Republic"
        };
    }
    
    return schema;
}

// Auto-inject schema on business detail pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a business detail page
    const businessName = document.querySelector('h1')?.textContent;
    
    if (businessName && typeof SITE_DATA !== 'undefined' && SITE_DATA.businesses) {
        // Find the business in the data
        const business = SITE_DATA.businesses.find(b => b.name === businessName);
        
        if (business) {
            const schema = generateLocalBusinessSchema(business);
            
            if (schema) {
                // Create and inject the schema script tag
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(schema, null, 2);
                document.head.appendChild(script);
                
                console.log('LocalBusiness schema added for:', businessName);
            }
        }
    }
});

