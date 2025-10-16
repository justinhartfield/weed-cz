// Business image mapping
const BUSINESS_IMAGES = {
  "Mr.Budz Cannabis Shop": ["mr-budz-exterior.webp", "mr-budz-interior-1.jpg", "mr-budz-interior-2.jpg"],
  "Hempo Cannabis Shop": ["hempo-exterior.jpg", "hempo-interior.jpg", "hempo-street.jpg"],
  "Konopny Koutek CBD": ["konopny-koutek-interior-1.jpg", "konopny-koutek-interior-2.jpg", "konopny-koutek-interior-3.jpg"],
  "Medical Seeds": ["medical-seeds-exterior.jpeg", "medical-seeds-exterior-2.jpeg"],
  "My-Garden growshop": ["my-garden-interior-1.jpeg", "my-garden-interior-2.jpeg"],
  "GrowShop Olomouc": ["growshop-olomouc-interior-1.jpeg", "growshop-olomouc-interior-2.jpeg", "growshop-olomouc-interior-3.jpg"]
};

// Generic fallback images by category
const FALLBACK_IMAGES = {
  "CBD Retail Shop": "cbd-shop-prague-generic.webp",
  "Seeds & Grow Shop": "cannabis-store-interior-generic.jpg",
  "Seed Bank": "cannabis-store-interior-generic.jpg",
  "Grow Shop": "cannabis-store-interior-generic.jpg",
  "Medical Cannabis": "cannabis-shop-prague-generic.jpg"
};

/**
 * Get the primary image for a business
 */
function getBusinessImage(businessName, category) {
  // Check if business has specific images
  if (BUSINESS_IMAGES[businessName] && BUSINESS_IMAGES[businessName].length > 0) {
    return `/images/businesses/${BUSINESS_IMAGES[businessName][0]}`;
  }
  
  // Use fallback image based on category
  if (FALLBACK_IMAGES[category]) {
    return `/images/businesses/${FALLBACK_IMAGES[category]}`;
  }
  
  // Default fallback
  return `/images/businesses/cannabis-shop-prague-generic.jpg`;
}

/**
 * Get all images for a business (for gallery)
 */
function getBusinessGallery(businessName) {
  if (BUSINESS_IMAGES[businessName]) {
    return BUSINESS_IMAGES[businessName].map(img => `/images/businesses/${img}`);
  }
  return [];
}

/**
 * Add image to business card
 */
function addImageToBusinessCard(card, businessName, category) {
  const imageUrl = getBusinessImage(businessName, category);
  
  // Create image element
  const imageDiv = document.createElement('div');
  imageDiv.className = 'business-card-image';
  imageDiv.style.backgroundImage = `url('${imageUrl}')`;
  imageDiv.style.backgroundSize = 'cover';
  imageDiv.style.backgroundPosition = 'center';
  imageDiv.style.height = '200px';
  imageDiv.style.borderRadius = '8px 8px 0 0';
  
  // Insert at the beginning of the card
  card.insertBefore(imageDiv, card.firstChild);
}

/**
 * Create photo gallery for business detail page
 */
function createBusinessGallery(businessName, containerId) {
  const gallery = getBusinessGallery(businessName);
  const container = document.getElementById(containerId);
  
  if (!container || gallery.length === 0) {
    return;
  }
  
  // Create gallery HTML
  const galleryHTML = `
    <div class="business-gallery">
      <h3>📸 Fotografie</h3>
      <div class="gallery-grid">
        ${gallery.map((img, index) => `
          <div class="gallery-item" onclick="openLightbox(${index}, ${JSON.stringify(gallery).replace(/"/g, '&quot;')})">
            <img src="${img}" alt="Photo ${index + 1}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  container.innerHTML = galleryHTML;
}

/**
 * Open lightbox for image viewing
 */
function openLightbox(index, images) {
  // Create lightbox if it doesn't exist
  let lightbox = document.getElementById('image-lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
      <img class="lightbox-content" id="lightbox-img">
      <div class="lightbox-nav">
        <button class="lightbox-prev" onclick="changeLightboxImage(-1)">&#10094;</button>
        <button class="lightbox-next" onclick="changeLightboxImage(1)">&#10095;</button>
      </div>
    `;
    document.body.appendChild(lightbox);
  }
  
  // Store images in lightbox data
  window.lightboxImages = images;
  window.lightboxIndex = index;
  
  // Show lightbox
  document.getElementById('lightbox-img').src = images[index];
  lightbox.style.display = 'flex';
}

/**
 * Close lightbox
 */
function closeLightbox() {
  document.getElementById('image-lightbox').style.display = 'none';
}

/**
 * Change lightbox image
 */
function changeLightboxImage(direction) {
  window.lightboxIndex += direction;
  
  if (window.lightboxIndex >= window.lightboxImages.length) {
    window.lightboxIndex = 0;
  }
  if (window.lightboxIndex < 0) {
    window.lightboxIndex = window.lightboxImages.length - 1;
  }
  
  document.getElementById('lightbox-img').src = window.lightboxImages[window.lightboxIndex];
}

// Close lightbox on ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
  }
});

