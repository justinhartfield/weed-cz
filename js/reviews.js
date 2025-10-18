// Reviews System with Supabase Integration
// Supabase configuration
const SUPABASE_URL = 'https://jafpjwwowylamzdqqiss.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZnBqd3dvd3lsYW16ZHFxaXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NzczNjIsImV4cCI6MjA3NjI1MzM2Mn0.Td02K3J1uFKM5r96UxA45Guy4H2MtNNIXaBVm1Ueoqc';

// Initialize Supabase client
let supabase;
let supabaseInitialized = false;

function initSupabase() {
    try {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            supabaseInitialized = true;
            console.log('✅ Supabase client initialized');
            return true;
        } else {
            console.error('❌ Supabase library not loaded');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Try to initialize immediately
initSupabase();

// Current user state
let currentUser = null;
let currentBusinessId = null;

// Initialize reviews system
async function initializeReviews(businessId) {
    console.log('🔧 Initializing reviews for:', businessId);
    currentBusinessId = businessId;
    
    // Ensure Supabase is initialized
    if (!supabaseInitialized) {
        const initialized = initSupabase();
        if (!initialized) {
            console.error('❌ Supabase not initialized');
            document.getElementById('reviews-list').innerHTML = '<p class="error">Systém recenzí není k dispozici. Zkuste prosím obnovit stránku.</p>';
            return;
        }
    }
    
    // Ensure business exists in database
    await ensureBusinessExists(businessId);
    
    // Check auth status
    await checkAuth();
    
    // Load rating summary
    await loadRatingSummary(businessId);
    
    // Load reviews
    await loadReviews(businessId);
}

// Ensure business exists in database
async function ensureBusinessExists(businessId) {
    try {
        const { data: existing, error: selectError } = await supabase
            .from('businesses')
            .select('id')
            .eq('id', businessId)
            .single();
        
        if (selectError && selectError.code === 'PGRST116') {
            // Business doesn't exist, create it
            const businessName = document.querySelector('h1')?.textContent || businessId;
            const { error: insertError } = await supabase
                .from('businesses')
                .insert([{ id: businessId, name: businessName }]);
            
            if (insertError) {
                console.error('❌ Failed to create business:', insertError);
            } else {
                console.log('✅ Business created:', businessId);
            }
        }
    } catch (error) {
        console.error('❌ Error ensuring business exists:', error);
    }
}

// Check authentication status
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            currentUser = session.user;
            console.log('✅ User logged in:', currentUser.email);
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            console.log('ℹ️ User not logged in');
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('❌ Auth check failed:', error);
        currentUser = null;
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const writeReviewBtn = document.getElementById('write-review-btn');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) {
        logoutBtn.style.display = 'inline-block';
        logoutBtn.textContent = `Odhlásit se (${currentUser.email})`;
    }
    if (writeReviewBtn) writeReviewBtn.style.display = 'inline-block';
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const writeReviewBtn = document.getElementById('write-review-btn');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (writeReviewBtn) writeReviewBtn.style.display = 'none';
}

// Show login dialog
async function showLoginDialog() {
    const email = prompt('Zadejte svůj email pro přihlášení:');
    if (!email) return;
    
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: window.location.href
            }
        });
        
        if (error) throw error;
        
        alert('✅ Přihlašovací odkaz byl odeslán na váš email. Zkontrolujte prosím svou schránku.');
    } catch (error) {
        console.error('❌ Login failed:', error);
        alert('❌ Přihlášení se nezdařilo: ' + error.message);
    }
}

// Sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        currentUser = null;
        updateUIForLoggedOutUser();
        alert('✅ Byli jste odhlášeni');
    } catch (error) {
        console.error('❌ Logout failed:', error);
        alert('❌ Odhlášení se nezdařilo: ' + error.message);
    }
}

// Load rating summary
async function loadRatingSummary(businessId) {
    try {
        console.log('📊 Loading rating summary for:', businessId);
        
        // Query approved reviews for this business
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('overall_rating, product_quality_rating, selection_rating, staff_rating, price_rating, atmosphere_rating')
            .eq('business_id', businessId)
            .eq('status', 'approved');
        
        if (error) {
            console.error('❌ Error loading reviews:', error);
            throw error;
        }
        
        console.log('✅ Loaded reviews:', reviews ? reviews.length : 0);
        
        if (reviews && reviews.length > 0) {
            // Calculate summary statistics
            const summary = {
                review_count: reviews.length,
                average_rating: reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length,
                product_quality_avg: calculateAverage(reviews, 'product_quality_rating'),
                selection_avg: calculateAverage(reviews, 'selection_rating'),
                staff_avg: calculateAverage(reviews, 'staff_rating'),
                price_avg: calculateAverage(reviews, 'price_rating'),
                atmosphere_avg: calculateAverage(reviews, 'atmosphere_rating')
            };
            
            console.log('📊 Summary calculated:', summary);
            displayRatingSummary(summary);
        } else {
            const summaryEl = document.getElementById('rating-summary');
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <div class="rating-summary">
                        <p>Zatím žádné recenze. Buďte první, kdo napíše recenzi!</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('❌ Failed to load rating summary:', error);
        const summaryEl = document.getElementById('rating-summary');
        if (summaryEl) {
            summaryEl.innerHTML = '<p class="error">Nepodařilo se načíst hodnocení.</p>';
        }
    }
}

// Helper function to calculate average for a rating field
function calculateAverage(reviews, field) {
    const validRatings = reviews.filter(r => r[field] !== null && r[field] !== undefined);
    if (validRatings.length === 0) return null;
    return validRatings.reduce((sum, r) => sum + r[field], 0) / validRatings.length;
}

// Display rating summary
function displayRatingSummary(summary) {
    const avgRating = parseFloat(summary.average_rating) || 0;
    const reviewCount = parseInt(summary.review_count) || 0;
    
    const html = `
        <div class="rating-summary">
            <div class="rating-overview">
                <div class="rating-score">
                    <span class="rating-number">${avgRating.toFixed(1)}</span>
                    <div class="rating-stars">${renderStars(avgRating)}</div>
                    <div class="rating-count">${reviewCount} ${reviewCount === 1 ? 'recenze' : reviewCount < 5 ? 'recenze' : 'recenzí'}</div>
                </div>
            </div>
            
            ${summary.product_quality_avg ? `
            <div class="category-ratings">
                <div class="category-rating">
                    <span class="category-label">🌿 Kvalita produktů</span>
                    <span class="category-stars">${renderStars(summary.product_quality_avg)}</span>
                    <span class="category-value">${parseFloat(summary.product_quality_avg).toFixed(1)}</span>
                </div>
                ${summary.selection_avg ? `
                <div class="category-rating">
                    <span class="category-label">📦 Výběr</span>
                    <span class="category-stars">${renderStars(summary.selection_avg)}</span>
                    <span class="category-value">${parseFloat(summary.selection_avg).toFixed(1)}</span>
                </div>
                ` : ''}
                ${summary.staff_avg ? `
                <div class="category-rating">
                    <span class="category-label">👥 Personál</span>
                    <span class="category-stars">${renderStars(summary.staff_avg)}</span>
                    <span class="category-value">${parseFloat(summary.staff_avg).toFixed(1)}</span>
                </div>
                ` : ''}
                ${summary.price_avg ? `
                <div class="category-rating">
                    <span class="category-label">💰 Cena</span>
                    <span class="category-stars">${renderStars(summary.price_avg)}</span>
                    <span class="category-value">${parseFloat(summary.price_avg).toFixed(1)}</span>
                </div>
                ` : ''}
                ${summary.atmosphere_avg ? `
                <div class="category-rating">
                    <span class="category-label">✨ Atmosféra</span>
                    <span class="category-stars">${renderStars(summary.atmosphere_avg)}</span>
                    <span class="category-value">${parseFloat(summary.atmosphere_avg).toFixed(1)}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('rating-summary').innerHTML = html;
}

// Render stars
function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return '⭐'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
}

// Load reviews
async function loadReviews(businessId) {
    try {
        console.log('📝 Loading reviews for:', businessId);
        
        const { data: reviews, error } = await supabase
            .from('reviews')
            .select('id, overall_rating, title, review_text, product_quality_rating, selection_rating, staff_rating, price_rating, atmosphere_rating, helpful_count, created_at, user_id')
            .eq('business_id', businessId)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error loading reviews:', error);
            throw error;
        }
        
        console.log('✅ Loaded reviews:', reviews ? reviews.length : 0);
        
        if (reviews && reviews.length > 0) {
            // Get user display names
            const userIds = [...new Set(reviews.map(r => r.user_id))];
            const { data: users } = await supabase
                .from('users')
                .select('id, display_name, email')
                .in('id', userIds);
            
            const userMap = {};
            if (users) {
                users.forEach(u => {
                    userMap[u.id] = u.display_name || u.email?.split('@')[0] || 'User';
                });
            }
            
            displayReviews(reviews, userMap);
        } else {
            const listEl = document.getElementById('reviews-list');
            if (listEl) {
                listEl.innerHTML = '<p class="no-reviews">Zatím žádné recenze.</p>';
            }
        }
    } catch (error) {
        console.error('❌ Failed to load reviews:', error);
        const listEl = document.getElementById('reviews-list');
        if (listEl) {
            listEl.innerHTML = '<p class="error">Nepodařilo se načíst recenze.</p>';
        }
    }
}

// Display reviews
function displayReviews(reviews, userMap = {}) {
    console.log('🖼️ Displaying reviews:', reviews.length);
    
    const html = reviews.map(review => {
        const authorName = userMap[review.user_id] || 'User';
        return `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <strong>${escapeHTML(authorName)}</strong>
                </div>
                <div class="review-rating">
                    <span class="stars">${renderStars(review.overall_rating)}</span>
                    <span class="rating-number">${review.overall_rating}/5</span>
                </div>
                <div class="review-date">${new Date(review.created_at).toLocaleDateString('cs-CZ')}</div>
            </div>
            
            ${review.title ? `<h4 class="review-title">${escapeHTML(review.title)}</h4>` : ''}
            
            ${review.review_text ? `<p class="review-text">${escapeHTML(review.review_text)}</p>` : ''}
            
            ${review.product_quality_rating || review.selection_rating || review.staff_rating || review.price_rating || review.atmosphere_rating ? `
            <div class="review-categories">
                ${review.product_quality_rating ? `<span class="category-badge">🌿 Kvalita: ${renderStars(review.product_quality_rating)}</span>` : ''}
                ${review.selection_rating ? `<span class="category-badge">📦 Výběr: ${renderStars(review.selection_rating)}</span>` : ''}
                ${review.staff_rating ? `<span class="category-badge">👥 Personál: ${renderStars(review.staff_rating)}</span>` : ''}
                ${review.price_rating ? `<span class="category-badge">💰 Cena: ${renderStars(review.price_rating)}</span>` : ''}
                ${review.atmosphere_rating ? `<span class="category-badge">✨ Atmosféra: ${renderStars(review.atmosphere_rating)}</span>` : ''}
            </div>
            ` : ''}
            
            <div class="review-actions">
                <button onclick="voteHelpful('${review.id}')" class="btn-helpful">
                    👍 Užitečné (${review.helpful_count || 0})
                </button>
            </div>
        </div>
    `;
    }).join('');
    
    const listEl = document.getElementById('reviews-list');
    if (listEl) {
        listEl.innerHTML = html;
    }
}

// Escape HTML
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Show review form
function showReviewForm() {
    if (!currentUser) {
        alert('Prosím přihlaste se pro napsání recenze.');
        showLoginDialog();
        return;
    }
    
    document.getElementById('review-form').style.display = 'block';
    document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' });
}

// Close review form
function closeReviewForm() {
    const formEl = document.getElementById('review-form');
    if (formEl) {
        formEl.style.display = 'none';
    }
}

// Handle review form submission
function handleReviewSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const reviewData = {
        overallRating: formData.get('overall_rating'),
        title: formData.get('title') || document.getElementById('review_title')?.value,
        reviewText: formData.get('review_text') || document.getElementById('review_text')?.value,
        productQuality: formData.get('product_quality'),
        selection: formData.get('selection'),
        staff: formData.get('staff'),
        price: formData.get('price'),
        atmosphere: formData.get('atmosphere')
    };
    
    submitReview(reviewData);
}

// Submit review
async function submitReview(reviewData) {
    if (!currentUser) {
        alert('Prosím přihlaste se pro napsání recenze.');
        showLoginDialog();
        return;
    }
    
    if (!reviewData.overallRating) {
        alert('Prosím vyberte celkové hodnocení.');
        return;
    }
    
    console.log('📤 Submitting review:', reviewData);
    
    try {
        const reviewPayload = {
            business_id: currentBusinessId,
            user_id: currentUser.id,
            overall_rating: parseInt(reviewData.overallRating),
            title: reviewData.title || null,
            review_text: reviewData.reviewText || null,
            product_quality_rating: reviewData.productQuality ? parseInt(reviewData.productQuality) : null,
            selection_rating: reviewData.selection ? parseInt(reviewData.selection) : null,
            staff_rating: reviewData.staff ? parseInt(reviewData.staff) : null,
            price_rating: reviewData.price ? parseInt(reviewData.price) : null,
            atmosphere_rating: reviewData.atmosphere ? parseInt(reviewData.atmosphere) : null
        };
        
        console.log('📦 Review payload:', reviewPayload);
        
        const { data, error } = await supabase
            .from('reviews')
            .insert([reviewPayload])
            .select();
        
        if (error) {
            console.error('❌ Supabase error:', error);
            
            // Check for rate limit error
            if (error.message && error.message.includes('90 days')) {
                alert('❌ Tuto firmu můžete recenzovat pouze jednou za 90 dní.');
                return;
            }
            
            throw error;
        }
        
        console.log('✅ Review submitted:', data);
        
        // Check status of submitted review
        const status = data && data[0] ? data[0].status : 'pending';
        
        if (status === 'approved') {
            alert('✅ Děkujeme za vaši recenzi! Byla automaticky schválena a je nyní viditelná.');
        } else if (status === 'rejected') {
            alert('❌ Vaše recenze byla zamítnuta automatickým systémem moderace.');
        } else {
            alert('✅ Děkujeme za vaši recenzi! Bude zveřejněna po schválení moderátorem.');
        }
        
        closeReviewForm();
        
        // Reset form
        const form = document.querySelector('#review-form form');
        if (form) {
            form.reset();
        }
        
        // Reload reviews if approved
        if (status === 'approved') {
            await loadRatingSummary(currentBusinessId);
            await loadReviews(currentBusinessId);
        }
        
    } catch (error) {
        console.error('❌ Failed to submit review:', error);
        alert('❌ Nepodařilo se odeslat recenzi: ' + error.message);
    }
}

// Vote helpful
async function voteHelpful(reviewId) {
    if (!currentUser) {
        alert('Prosím přihlaste se pro hodnocení recenzí.');
        showLoginDialog();
        return;
    }
    
    try {
        const { error } = await supabase
            .from('review_votes')
            .insert([{
                review_id: reviewId,
                user_id: currentUser.id,
                type: 'helpful'
            }]);
        
        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                alert('Tuto recenzi jste již ohodnotili.');
            } else {
                throw error;
            }
        } else {
            alert('✅ Děkujeme za vaše hodnocení!');
            // Reload reviews to show updated count
            await loadReviews(currentBusinessId);
        }
    } catch (error) {
        console.error('❌ Failed to vote:', error);
        alert('❌ Nepodařilo se odeslat hodnocení: ' + error.message);
    }
}

// Listen for auth state changes
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            updateUIForLoggedInUser();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    });
}

console.log('✅ Reviews system loaded');

