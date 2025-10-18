// Schema.org LocalBusiness structured data generator
// Enhanced version with comprehensive SEO optimization

function generateLocalBusinessSchema(business, aggregate) {
    if (!business) return null;
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": business.name,
        "description": business.description || business.products || business.services || `${business.category} in ${business.city}`,
        "address": {
            "@type": "PostalAddress",
            "streetAddress": business.address || "",
            "addressLocality": business.city || "",
            "addressRegion": business.region_name || "",
            "postalCode": business.postal_code || "",
            "addressCountry": "CZ"
        }
    };
    
    // Add image if available
    if (business.image || business.images) {
        const images = business.images || [business.image];
        schema.image = images.filter(img => img); // Remove empty values
    }
    
    // Add contact information
    if (business.phone) {
        schema.telephone = business.phone;
    }
    
    if (business.email) {
        schema.email = business.email;
    }
    
    if (business.website) {
        schema.url = business.website.startsWith('http') ? business.website : `https://${business.website}`;
    }
    
    // Add geo coordinates if available
    if (business.latitude && business.longitude) {
        schema.geo = {
            "@type": "GeoCoordinates",
            "latitude": business.latitude,
            "longitude": business.longitude
        };
    }
    
    // Add opening hours
    if (business.opening_hours) {
        schema.openingHours = business.opening_hours;
    } else if (business.opening_hours_specification) {
        schema.openingHoursSpecification = business.opening_hours_specification;
    }
    
    // Add price range
    if (business.price_range) {
        schema.priceRange = business.price_range;
    }
    
    // Add payment methods
    if (business.payment_accepted) {
        schema.paymentAccepted = business.payment_accepted;
    }
    
    // Add currencies
    if (business.currencies_accepted) {
        schema.currenciesAccepted = business.currencies_accepted;
    } else {
        schema.currenciesAccepted = "CZK, EUR";
    }
    
    // Add category-specific type
    if (business.category === 'Medical Cannabis' || business.category === 'Pharmacy') {
        schema["@type"] = "MedicalBusiness";
    } else if (business.category === 'CBD Retail Shop' || business.category === 'Seeds & Grow Shop') {
        schema["@type"] = "Store";
    }
    
    // Add service area for delivery services
    if (business.delivery_available === 'Yes') {
        if (business.delivery_area) {
            schema.areaServed = {
                "@type": "GeoCircle",
                "geoMidpoint": {
                    "@type": "GeoCoordinates",
                    "latitude": business.latitude,
                    "longitude": business.longitude
                },
                "geoRadius": business.delivery_radius || "50000" // Default 50km
            };
        } else {
            schema.areaServed = {
                "@type": "Country",
                "name": "Czech Republic"
            };
        }
    }
    
    // Add aggregate rating
    if (aggregate && aggregate.review_count > 0) {
        schema.aggregateRating = {
            "@type": "AggregateRating",
            "ratingValue": aggregate.average_rating,
            "reviewCount": aggregate.review_count,
            "bestRating": "5",
            "worstRating": "1"
        };
    }
    
    // Add amenity features
    const amenityFeatures = [];
    if (business.parking) amenityFeatures.push("Parking");
    if (business.wheelchair_accessible) amenityFeatures.push("Wheelchair Accessible");
    if (business.pet_friendly) amenityFeatures.push("Pet Friendly");
    if (business.atm) amenityFeatures.push("ATM");
    if (business.curbside_pickup) amenityFeatures.push("Curbside Pickup");
    
    if (amenityFeatures.length > 0) {
        schema.amenityFeature = amenityFeatures.map(feature => ({
            "@type": "LocationFeatureSpecification",
            "name": feature,
            "value": true
        }));
    }
    
    // Add social media links
    if (business.social_media) {
        schema.sameAs = [];
        if (business.social_media.facebook) schema.sameAs.push(business.social_media.facebook);
        if (business.social_media.instagram) schema.sameAs.push(business.social_media.instagram);
        if (business.social_media.twitter) schema.sameAs.push(business.social_media.twitter);
    }
    
    return schema;
}

// Generate BreadcrumbList schema for navigation
function generateBreadcrumbSchema(breadcrumbs) {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.url ? `https://weed.cz${crumb.url}` : undefined
        }))
    };
}

// Auto-inject schema on business detail pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a business detail page
    const businessName = document.querySelector('h1')?.textContent;
    
    if (businessName && typeof SITE_DATA !== 'undefined' && SITE_DATA.businesses) {
        // Find the business in the data
        const business = SITE_DATA.businesses.find(b => b.name === businessName);
        
        if (business) {
            const aggregate = window.__LATEST_REVIEWS_AGGREGATE__;
            const schema = generateLocalBusinessSchema(business, aggregate);
            
            if (schema) {
                // Create and inject the schema script tag
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(schema, null, 2);
                document.head.appendChild(script);
                
                console.log('Enhanced LocalBusiness schema added for:', businessName);
            }
            
            // Add breadcrumb schema if available
            const breadcrumbs = window.__BREADCRUMBS__;
            if (breadcrumbs) {
                const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
                if (breadcrumbSchema) {
                    const breadcrumbScript = document.createElement('script');
                    breadcrumbScript.type = 'application/ld+json';
                    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema, null, 2);
                    document.head.appendChild(breadcrumbScript);
                    console.log('Breadcrumb schema added');
                }
            }
        }
    }
});

