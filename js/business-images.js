// Complete business images mapping for Weed.cz
// Maps business names to their images

const BUSINESS_IMAGES = {
  // CBD Shops - Specific Images
  "Mr.Budz Cannabis Shop": [
    "/images/businesses/mr-budz-exterior.jpg",
    "/images/businesses/mr-budz-interior-1.jpg",
    "/images/businesses/mr-budz-interior-2.jpg"
  ],
  "Hempo Cannabis Shop": [
    "/images/businesses/hempo-exterior.jpg",
    "/images/businesses/hempo-interior.jpg",
    "/images/businesses/hempo-street.jpg"
  ],
  "Konopný Koutek CBD": [
    "/images/businesses/konopny-koutek-interior-1.jpg",
    "/images/businesses/konopny-koutek-interior-2.jpg",
    "/images/businesses/konopny-koutek-interior-3.jpg",
    "/images/businesses/konopny-koutek-tripadvisor.jpg"
  ],
  "Hempy CBD Shop": [
    "/images/businesses/cbd-shop-prague-wellness.webp"
  ],
  "Zelená Země": [
    "/images/businesses/zelena-zeme-brno.png"
  ],
  
  // Seed Banks & Grow Shops - Specific Images
  "Medical Seeds": [
    "/images/businesses/medical-seeds-storefront-1.jpg",
    "/images/businesses/medical-seeds-storefront-2.jpg"
  ],
  "My-Garden.cz": [
    "/images/businesses/my-garden-interior-1.jpeg",
    "/images/businesses/my-garden-interior-2.jpeg"
  ],
  "GrowShop Olomouc": [
    "/images/businesses/growshop-olomouc-interior-1.jpeg",
    "/images/businesses/growshop-olomouc-interior-2.jpeg",
    "/images/businesses/growshop-olomouc-interior-3.jpg"
  ],
  "Alchimia": [
    "/images/businesses/alchimia-logo.webp"
  ],
  "Cleopatra Seeds": [
    "/images/businesses/cleopatra-seeds.webp"
  ],
  "Nuka Seeds": [
    "/images/businesses/nuka-seeds-product.webp"
  ],
  "Tokamak Seeds": [
    "/images/businesses/tokamak-seeds.webp"
  ],
  "Tierra Verde": [
    "/images/businesses/tierra-verde-shop.jpg"
  ]
};

// Category fallback images
const CATEGORY_FALLBACKS = {
  "CBD Retail Shop": [
    "/images/businesses/cbd-shop-storefront-1.jpg",
    "/images/businesses/cbd-shop-display.jpg",
    "/images/businesses/weed-shop-prague-street.jpg",
    "/images/businesses/cbd-shop-prague-wellness.webp"
  ],
  "Seeds & Grow Shop": [
    "/images/businesses/grow-shop-generic.jpg",
    "/images/businesses/my-garden-interior-1.jpeg",
    "/images/businesses/growshop-olomouc-interior-1.jpeg"
  ],
  "Medical Cannabis": [
    "/images/businesses/medical-cannabis-pharmacy.jpg",
    "/images/businesses/medical-seeds-storefront-1.jpg"
  ],
  "E-commerce Platform": [
    "/images/businesses/cbd-shop-display.jpg",
    "/images/businesses/grow-shop-generic.jpg"
  ],
  "Delivery Service": [
    "/images/businesses/cbd-shop-display.jpg"
  ],
  "Social Club & Event": [
    "/images/businesses/cbd-shop-storefront-1.jpg"
  ],
  "Other": [
    "/images/businesses/cbd-shop-display.jpg"
  ]
};

// Function to get images for a business
function getBusinessImages(businessName, category) {
  // Check for exact match first
  if (BUSINESS_IMAGES[businessName]) {
    return BUSINESS_IMAGES[businessName];
  }
  
  // Check for partial match (case insensitive)
  const nameLower = businessName.toLowerCase();
  for (const [key, images] of Object.entries(BUSINESS_IMAGES)) {
    if (key.toLowerCase().includes(nameLower) || nameLower.includes(key.toLowerCase())) {
      return images;
    }
  }
  
  // Return category fallback
  if (CATEGORY_FALLBACKS[category]) {
    // Return random image from category
    const fallbacks = CATEGORY_FALLBACKS[category];
    const randomIndex = Math.floor(Math.random() * fallbacks.length);
    return [fallbacks[randomIndex]];
  }
  
  // Default fallback
  return ["/images/businesses/cbd-shop-display.jpg"];
}

// Function to get thumbnail (first image)
function getBusinessThumbnail(businessName, category) {
  const images = getBusinessImages(businessName, category);
  return images[0];
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.getBusinessImages = getBusinessImages;
  window.getBusinessThumbnail = getBusinessThumbnail;
}
