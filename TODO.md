# Weed.cz - TODO List

**Last Updated:** October 16, 2025  
**Priority Legend:** 🔴 Critical | 🟡 High | 🟢 Medium | 🔵 Low

---

## 📸 1. Finish Finding Images for All Businesses
**Priority:** 🟡 High  
**Status:** ⏳ In Progress (6/144 businesses have images)  
**Estimated Time:** 8-10 hours

### Tasks:
- [ ] Search for images of remaining CBD shops (73 businesses)
  - [ ] Prague CBD shops (15 remaining)
  - [ ] Brno CBD shops (10 remaining)
  - [ ] Other cities CBD shops (48 remaining)
- [ ] Search for images of remaining Seed Banks (15 businesses)
- [ ] Search for images of remaining Grow Shops (23 businesses)
- [ ] Search for images of Medical Cannabis locations (21 businesses)
- [ ] Search for images of Online shops (6 businesses)
- [ ] Update `business-images.js` with all new image mappings
- [ ] Test image display on all category pages
- [ ] Add photo galleries to all detail pages with images

### Current Progress:
✅ Mr.Budz Cannabis Shop (3 photos)  
✅ Hempo Cannabis Shop (3 photos)  
✅ Konopny Koutek CBD (3 photos)  
✅ Medical Seeds (2 photos)  
✅ My-Garden growshop (2 photos)  
✅ GrowShop Olomouc (3 photos)  
✅ Generic fallback images (3 photos)

**Total:** 21 images collected, ~123 businesses remaining

---

## 🔍 2. Make Search Bar Functional
**Priority:** 🔴 Critical  
**Status:** ❌ Not Started  
**Estimated Time:** 2-3 hours

### Issues to Fix:
- [ ] Remove duplicate search bar on homepage (currently 2 non-functioning)
- [ ] Implement search functionality that searches across:
  - [ ] Business names
  - [ ] Cities
  - [ ] Addresses
  - [ ] Products
  - [ ] Categories
- [ ] Add search results page
- [ ] Implement autocomplete/suggestions
- [ ] Add search history (optional)
- [ ] Make search work on all pages (header search)
- [ ] Add keyboard shortcuts (e.g., "/" to focus search)
- [ ] Mobile-optimize search interface

### Technical Requirements:
- JavaScript search function
- Filter SITE_DATA based on search query
- Display results in grid layout
- Highlight matching terms
- "No results" state
- Clear search button

---

## 🎨 3. Create Logo for Weed.cz
**Priority:** 🟡 High  
**Status:** ❌ Not Started  
**Estimated Time:** 3-4 hours

### Tasks:
- [ ] Design logo concept (cannabis leaf + Czech flag colors?)
- [ ] Create logo variations:
  - [ ] Full logo (with text)
  - [ ] Icon only (for favicon)
  - [ ] Horizontal version (for header)
  - [ ] Vertical version (for footer)
- [ ] Export in multiple formats:
  - [ ] SVG (scalable)
  - [ ] PNG (transparent background, multiple sizes)
  - [ ] ICO (favicon)
  - [ ] WebP (optimized for web)
- [ ] Replace text logo on all pages:
  - [ ] Homepage
  - [ ] Category pages (3)
  - [ ] Business detail pages (163)
  - [ ] Blog pages (6)
  - [ ] Sitemap page
- [ ] Update favicon
- [ ] Update CSS for logo display
- [ ] Test responsive logo sizing

### Design Considerations:
- Professional and trustworthy
- Cannabis/hemp themed
- Czech Republic connection
- Works in dark brown header
- Readable at small sizes
- Matches weed.de aesthetic

---

## 🎨 4. Fix Sitemap Page (Color Contrast & CSS)
**Priority:** 🟡 High  
**Status:** ❌ Not Started  
**Estimated Time:** 1-2 hours

### Issues to Fix:
- [ ] Update header to match weed.de design (dark brown)
- [ ] Fix footer styling
- [ ] Improve color contrast for accessibility
- [ ] Add proper navigation badges
- [ ] Style sitemap links properly
- [ ] Add breadcrumbs
- [ ] Organize sitemap by category
- [ ] Add last updated dates
- [ ] Mobile responsive layout
- [ ] Test WCAG AA compliance

**URL:** https://weed.cz/sitemap

---

## 🌐 5. Translate Website to English (SEO-Friendly)
**Priority:** 🔴 Critical  
**Status:** ❌ Not Started  
**Estimated Time:** 10-12 hours

### Implementation Strategy:
- [ ] Create English version of all pages:
  - [ ] Homepage (index-en.html or /en/)
  - [ ] Category pages (3)
  - [ ] Business detail pages (163)
  - [ ] Blog articles (5)
  - [ ] About page
  - [ ] Sitemap
- [ ] Translate all content:
  - [ ] Navigation
  - [ ] Business descriptions
  - [ ] Blog articles
  - [ ] Footer
  - [ ] Meta descriptions
  - [ ] Alt text
- [ ] Implement hreflang tags for SEO:
  ```html
  <link rel="alternate" hreflang="cs" href="https://weed.cz/" />
  <link rel="alternate" hreflang="en" href="https://weed.cz/en/" />
  ```
- [ ] Update language switcher to actually switch languages
- [ ] Create English sitemap (sitemap-en.xml)
- [ ] Update robots.txt for English pages
- [ ] Add structured data in English
- [ ] Test language detection and switching

### SEO Considerations:
- Separate URLs for each language (/en/ prefix)
- Proper hreflang implementation
- Translated meta titles and descriptions
- English keywords research
- Localized content (not just translation)
- English backlinks strategy

---

## 📝 6. Add 900+ Words SEO Content to Category Pages
**Priority:** 🟡 High  
**Status:** ❌ Not Started  
**Estimated Time:** 8-10 hours

### Pages to Optimize:
- [ ] **CBD Shops Page** (cbd-shops.html)
  - [ ] Write 900+ words about CBD shops in Czech Republic
  - [ ] Include keywords: CBD Prague, CBD Brno, best CBD shops
  - [ ] Add FAQ section
  - [ ] Include buying guide
- [ ] **Seed Banks Page** (seed-banks.html)
  - [ ] Write 900+ words about cannabis seeds in CZ
  - [ ] Include keywords: cannabis seeds Czech, seed banks Prague
  - [ ] Legal information
  - [ ] Strain recommendations
- [ ] **Medical Cannabis Page** (medical.html)
  - [ ] Write 900+ words about medical cannabis in CZ
  - [ ] Include keywords: medical marijuana Czech Republic
  - [ ] Prescription information
  - [ ] Approved conditions
- [ ] **Grow Shops Page** (grow-shops.html - if exists)
  - [ ] Write 900+ words about grow equipment
  - [ ] Include keywords: hydroponics Czech, grow equipment Prague

### Content Structure:
1. Introduction (150 words)
2. What is [Category]? (200 words)
3. Legal Status in Czech Republic (200 words)
4. How to Choose the Best [Category] (200 words)
5. Top Locations in Czech Republic (150 words)
6. FAQ Section (100 words)

### SEO Keywords to Target:
- CBD Prague, CBD Brno, CBD Czech Republic
- Cannabis seeds Czech Republic
- Medical marijuana Czech Republic
- Grow shop Prague, hydroponics Brno

---

## 📝 7. Add 600+ Words SEO Content to Homepage
**Priority:** 🟡 High  
**Status:** ❌ Not Started  
**Estimated Time:** 3-4 hours

### Content to Add:
- [ ] **Hero Section Enhancement** (100 words)
  - Compelling value proposition
  - Keywords: cannabis directory Czech Republic
- [ ] **About Weed.cz Section** (150 words)
  - What we offer
  - Why choose us
  - Coverage area
- [ ] **Cannabis in Czech Republic** (200 words)
  - Legal overview
  - Market overview
  - Popular products
- [ ] **How to Use Weed.cz** (100 words)
  - Search functionality
  - Filter options
  - Business listings
- [ ] **Featured Categories** (50 words)
  - CBD shops
  - Seed banks
  - Medical cannabis
  - Grow shops

### Placement Strategy:
- Above the fold: Hero + value proposition
- Below hero: About section
- Mid-page: Cannabis in CZ overview
- Before footer: How to use + featured categories
- Ensure content doesn't push business cards too far down

### SEO Keywords:
- Cannabis Czech Republic
- CBD shops Prague
- Marijuana dispensary Czech
- Hemp products Brno
- Cannabis directory

---

## 📄 8. Create SEO-Friendly About Page
**Priority:** 🟡 High  
**Status:** ❌ Not Started  
**Estimated Time:** 2-3 hours

### Content Requirements:
- [ ] **About Weed.cz** (200 words)
  - Mission and vision
  - What we do
  - How we help users
- [ ] **About Weed.de** (200 words)
  - Sister site information
  - Germany cannabis directory
  - International expansion
- [ ] **Our Story** (150 words)
  - How we started
  - Why we created this
  - Team background
- [ ] **Our Values** (100 words)
  - Transparency
  - Accuracy
  - User-first approach
- [ ] **Coverage** (100 words)
  - 144+ locations
  - All major cities
  - Categories covered
- [ ] **Contact Information** (50 words)
  - Email
  - Social media
  - Business inquiries

### Technical Requirements:
- [ ] Create about.html page
- [ ] Add to footer navigation
- [ ] Proper meta description
- [ ] Schema markup (Organization)
- [ ] Internal links to categories
- [ ] Link to weed.de
- [ ] Responsive design
- [ ] Images/team photos (optional)

### SEO Optimization:
- Keywords: cannabis directory, hemp products Czech Republic
- Internal linking to category pages
- External link to weed.de
- Structured data
- Social proof/testimonials

---

## 📊 Progress Tracking

### Completed Tasks: ✅
- [x] Weed.de-inspired redesign
- [x] Business images system (21 images)
- [x] Photo galleries and lightbox
- [x] Fixed headers and footers
- [x] Mobile responsive design
- [x] Filtering and sorting
- [x] LocalBusiness schema markup

### In Progress: ⏳
- [ ] Finding images for all businesses (6/144 complete)

### Not Started: ❌
- [ ] Functional search bar
- [ ] Logo creation
- [ ] Sitemap page fixes
- [ ] English translation
- [ ] SEO content (category pages)
- [ ] SEO content (homepage)
- [ ] About page

---

## 🎯 Recommended Priority Order

1. **Fix Search Bar** (Critical for usability)
2. **Add SEO Content to Homepage** (Quick win for SEO)
3. **Create Logo** (Professional branding)
4. **Add SEO Content to Category Pages** (Major SEO boost)
5. **Create About Page** (Credibility + weed.de link)
6. **Fix Sitemap Page** (Technical SEO)
7. **Translate to English** (Expand audience)
8. **Finish Finding Images** (Visual enhancement)

---

## 📈 Expected Impact

### After Completion:
- **SEO:** 5,000+ words of optimized content
- **Branding:** Professional logo across all pages
- **Usability:** Functional search across 144 businesses
- **International:** English version for tourists
- **Visual:** Images for all 144 businesses
- **Credibility:** Professional About page
- **Technical:** Fixed sitemap and accessibility

### Estimated Total Time: 40-50 hours

---

## 🔄 Next Steps

1. Start with search bar implementation (highest impact)
2. Add homepage SEO content (quick win)
3. Create logo (branding consistency)
4. Continue finding business images
5. Write category page content
6. Create About page
7. Implement English translation
8. Final testing and optimization

---

**Status:** Ready to Begin  
**Last Updated:** October 16, 2025  
**Assignee:** AI Assistant




---

## 🔐 9. User Login, Ratings & Reviews System
**Priority:** 🟢 Medium  
**Status:** ❌ Not Started  
**Estimated Time:** 15-20 hours

### Features to Implement:
- [ ] **User Authentication System**
  - [ ] User registration (email/password)
  - [ ] Login/logout functionality
  - [ ] Password reset
  - [ ] Email verification
  - [ ] OAuth integration (Google, Facebook - optional)
  - [ ] User profile pages
  - [ ] Session management

- [ ] **Rating System**
  - [ ] 5-star rating for businesses
  - [ ] Display average rating on business cards
  - [ ] Display rating count
  - [ ] Sort businesses by rating
  - [ ] Prevent duplicate ratings from same user
  - [ ] Rating analytics dashboard

- [ ] **Review System**
  - [ ] Write reviews for businesses
  - [ ] Edit/delete own reviews
  - [ ] Review moderation (admin approval)
  - [ ] Display reviews on business detail pages
  - [ ] Helpful/unhelpful voting on reviews
  - [ ] Report inappropriate reviews
  - [ ] Review photos (optional)
  - [ ] Verified purchase badge (optional)

- [ ] **User Dashboard**
  - [ ] View own ratings and reviews
  - [ ] Edit profile information
  - [ ] Favorite businesses list
  - [ ] Review history
  - [ ] Notification preferences

### Technical Requirements:
- Backend: Node.js/Express or Python/Flask
- Database: PostgreSQL or MongoDB
- Authentication: JWT tokens or sessions
- Frontend: JavaScript for interactive components
- Security: Input validation, XSS prevention, rate limiting
- Email service: SendGrid or AWS SES

### Database Schema:
```sql
Users: id, email, password_hash, name, created_at, verified
Ratings: id, user_id, business_id, rating (1-5), created_at
Reviews: id, user_id, business_id, rating, text, created_at, updated_at, approved
ReviewVotes: id, review_id, user_id, vote_type (helpful/unhelpful)
```

### UI Components:
- Login/register modal
- Rating stars (interactive)
- Review form
- Review display cards
- User profile page
- Admin moderation panel

---

**Updated Total Tasks:** 9 major items  
**Updated Estimated Time:** 55-70 hours total

