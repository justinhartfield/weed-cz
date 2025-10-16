// Reviews System for Weed.cz
// Connects to Flask API for ratings and reviews

const API_BASE = 'http://localhost:5000/api';  // Change to production URL when deployed

// Current user state
let currentUser = null;

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        currentUser = null;
    }
}

// Request magic link login
async function requestLogin(email) {
    try {
        const response = await fetch(`${API_BASE}/auth/request-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Magic link sent to your email! Check your inbox.');
            // In production, the magic_link won't be returned
            if (data.magic_link) {
                console.log('Dev mode - Magic link:', data.magic_link);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Login request failed:', error);
        alert('Failed to send login link. Please try again.');
    }
}

// Submit review
async function submitReview(businessId, reviewData) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/reviews/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business_id: businessId,
                ...reviewData
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Review submitted! It will appear after moderation.');
            closeReviewForm();
            return true;
        } else {
            alert('Error: ' + data.error);
            return false;
        }
    } catch (error) {
        console.error('Submit review failed:', error);
        alert('Failed to submit review. Please try again.');
        return false;
    }
}

// Load reviews for a business
async function loadBusinessReviews(businessId) {
    try {
        const response = await fetch(`${API_BASE}/reviews/business/${businessId}`);
        const data = await response.json();
        
        if (response.ok) {
            displayReviews(data);
        }
    } catch (error) {
        console.error('Load reviews failed:', error);
    }
}

// Mark review as helpful
async function markHelpful(reviewId) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update helpful count in UI
            const helpfulBtn = document.querySelector(`[data-review-id="${reviewId}"] .helpful-count`);
            if (helpfulBtn) {
                helpfulBtn.textContent = data.helpful_count;
            }
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Mark helpful failed:', error);
    }
}

// Flag review
async function flagReview(reviewId, reason) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/flag`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Review flagged. Thank you for helping maintain quality.');
        }
    } catch (error) {
        console.error('Flag review failed:', error);
    }
}

// UI Functions

function updateUIForLoggedInUser() {
    // Show "Write Review" button
    const writeReviewBtns = document.querySelectorAll('.write-review-btn');
    writeReviewBtns.forEach(btn => {
        btn.style.display = 'inline-block';
        btn.disabled = false;
    });
    
    // Show user menu
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
        userMenu.innerHTML = `
            <span>Welcome, ${currentUser.display_name}</span>
            <button onclick="logout()">Logout</button>
        `;
    }
}

function updateUIForLoggedOutUser() {
    // Hide "Write Review" button or show login prompt
    const writeReviewBtns = document.querySelectorAll('.write-review-btn');
    writeReviewBtns.forEach(btn => {
        btn.onclick = showLoginPrompt;
    });
}

function showLoginPrompt() {
    const email = prompt('Enter your email to login:');
    if (email) {
        requestLogin(email);
    }
}

function showReviewForm(businessId) {
    if (!currentUser) {
        showLoginPrompt();
        return;
    }
    
    const formHTML = `
        <div class="review-form-overlay" id="review-form-overlay">
            <div class="review-form-modal">
                <h2>Write a Review</h2>
                <form id="review-form" onsubmit="handleReviewSubmit(event, '${businessId}')">
                    <div class="form-group">
                        <label>Overall Rating *</label>
                        <div class="star-rating" data-rating="0">
                            <span class="star" data-value="1">☆</span>
                            <span class="star" data-value="2">☆</span>
                            <span class="star" data-value="3">☆</span>
                            <span class="star" data-value="4">☆</span>
                            <span class="star" data-value="5">☆</span>
                        </div>
                        <input type="hidden" name="overall_rating" id="overall_rating" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Review Title</label>
                        <input type="text" name="title" maxlength="100" placeholder="Great CBD shop!">
                    </div>
                    
                    <div class="form-group">
                        <label>Your Review</label>
                        <textarea name="review_text" rows="5" maxlength="1000" placeholder="Share your experience..."></textarea>
                    </div>
                    
                    <div class="category-ratings">
                        <h3>Category Ratings (Optional)</h3>
                        <div class="form-group">
                            <label>Product Quality</label>
                            <select name="product_quality_rating">
                                <option value="">Not rated</option>
                                <option value="1">1 star</option>
                                <option value="2">2 stars</option>
                                <option value="3">3 stars</option>
                                <option value="4">4 stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Selection</label>
                            <select name="selection_rating">
                                <option value="">Not rated</option>
                                <option value="1">1 star</option>
                                <option value="2">2 stars</option>
                                <option value="3">3 stars</option>
                                <option value="4">4 stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Staff Knowledge</label>
                            <select name="staff_rating">
                                <option value="">Not rated</option>
                                <option value="1">1 star</option>
                                <option value="2">2 stars</option>
                                <option value="3">3 stars</option>
                                <option value="4">4 stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Price</label>
                            <select name="price_rating">
                                <option value="">Not rated</option>
                                <option value="1">1 star</option>
                                <option value="2">2 stars</option>
                                <option value="3">3 stars</option>
                                <option value="4">4 stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Atmosphere</label>
                            <select name="atmosphere_rating">
                                <option value="">Not rated</option>
                                <option value="1">1 star</option>
                                <option value="2">2 stars</option>
                                <option value="3">3 stars</option>
                                <option value="4">4 stars</option>
                                <option value="5">5 stars</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Submit Review</button>
                        <button type="button" class="btn-secondary" onclick="closeReviewForm()">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // Initialize star rating
    initStarRating();
}

function initStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.value);
            const container = this.parentElement;
            container.dataset.rating = rating;
            document.getElementById('overall_rating').value = rating;
            
            // Update star display
            stars.forEach((s, i) => {
                s.textContent = i < rating ? '★' : '☆';
            });
        });
    });
}

function handleReviewSubmit(event, businessId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const reviewData = {};
    
    formData.forEach((value, key) => {
        if (value) {
            reviewData[key] = key.includes('rating') ? parseInt(value) : value;
        }
    });
    
    submitReview(businessId, reviewData);
}

function closeReviewForm() {
    const overlay = document.getElementById('review-form-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function displayReviews(data) {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    let html = `
        <div class="reviews-summary">
            <h2>Customer Reviews (${data.review_count})</h2>
            <div class="rating-overview">
                <span class="rating-score">${data.average_rating}</span>
                <div class="stars">${'★'.repeat(Math.round(data.average_rating))}${'☆'.repeat(5 - Math.round(data.average_rating))}</div>
                <span class="review-count">Based on ${data.review_count} reviews</span>
            </div>
        </div>
        
        <div class="reviews-list">
    `;
    
    data.reviews.forEach(review => {
        html += `
            <article class="review" data-review-id="${review.id}">
                <div class="review-header">
                    <span class="reviewer-name">${review.author}</span>
                    <div class="review-rating">${'★'.repeat(review.overall_rating)}${'☆'.repeat(5 - review.overall_rating)}</div>
                    <time>${new Date(review.created_at).toLocaleDateString('cs-CZ')}</time>
                </div>
                
                ${review.title ? `<h3 class="review-title">${review.title}</h3>` : ''}
                
                <div class="review-body">
                    <p>${review.review_text || ''}</p>
                </div>
                
                <div class="review-actions">
                    <button class="helpful-btn" onclick="markHelpful(${review.id})">
                        👍 Helpful (<span class="helpful-count">${review.helpful_count}</span>)
                    </button>
                    <button class="flag-btn" onclick="flagReview(${review.id}, 'spam')">
                        🚩 Report
                    </button>
                </div>
            </article>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        currentUser = null;
        updateUIForLoggedOutUser();
        alert('Logged out successfully');
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Load reviews if on business page
    const businessId = document.body.dataset.businessId;
    if (businessId) {
        loadBusinessReviews(businessId);
    }
});

