# Weed.cz Data Structure Documentation

## Enhanced Business Data Fields

This document outlines the complete data structure for business listings on weed.cz, including new fields added for improved SEO and usability.

### Core Fields (Existing)

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | number | Yes | Unique identifier | `0` |
| `name` | string | Yes | Business name | `"KONOPEX Market"` |
| `type` | string | Yes | Business type | `"E-shop & Retail"` |
| `category` | string | Yes | Business category | `"CBD Retail Shop"` |
| `city` | string | Yes | City name | `"Prague"` |
| `city_slug` | string | Yes | URL-friendly city name | `"prague"` |
| `region` | string | Yes | Region slug | `"praha"` |
| `region_name` | string | Yes | Region display name | `"Prague"` |
| `address` | string | No | Street address | `"Václavské náměstí 123"` |
| `website` | string | No | Website URL | `"www.example.cz"` |
| `phone` | string | No | Phone number | `"+420 123 456 789"` |
| `email` | string | No | Email address | `"info@example.cz"` |
| `products` | string | No | Products description | `"CBD oils, flowers, seeds"` |
| `services` | string | No | Services description | `"E-commerce, Retail"` |
| `opening_hours` | string | No | Simple opening hours | `"Mo-Fr 09:00-18:00"` |
| `delivery_available` | string | No | Delivery availability | `"Yes"` or `"No"` |
| `online_shop` | string | No | Online shop availability | `"Yes"` or `"No"` |
| `notes` | string | No | Additional notes | `"Premium products"` |
| `url` | string | Yes | Business page URL | `"/online/prague/example.html"` |

### New Fields for Enhanced SEO and Usability

#### Contact & Location

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `postal_code` | string | No | Postal/ZIP code | `"11000"` |
| `latitude` | number | No | GPS latitude | `50.0755` |
| `longitude` | number | No | GPS longitude | `14.4378` |
| `social_media` | object | No | Social media links | See below |

**Social Media Object Structure:**
```json
{
  "facebook": "https://facebook.com/example",
  "instagram": "https://instagram.com/example",
  "twitter": "https://twitter.com/example"
}
```

#### Business Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `description` | string | No | Detailed business description (200+ words) | `"Full description..."` |
| `year_established` | number | No | Year business was founded | `2020` |
| `owner` | string | No | Owner/operator name | `"Jan Novák"` |
| `certifications` | array | No | Certifications and licenses | `["Bio Certified", "EU GMP"]` |
| `brands_carried` | array | No | Product brands available | `["Brand A", "Brand B"]` |
| `price_range` | string | No | Price indicator | `"$$"` ($ = budget, $$ = moderate, $$$ = premium) |
| `image` | string | No | Main business image URL | `"/images/businesses/example.jpg"` |
| `images` | array | No | Multiple business images | `["/images/1.jpg", "/images/2.jpg"]` |

#### Services & Amenities

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `payment_accepted` | string | No | Accepted payment methods | `"Cash, Credit Card, Debit Card, Cryptocurrency"` |
| `currencies_accepted` | string | No | Accepted currencies | `"CZK, EUR"` |
| `delivery_fee` | number | No | Delivery fee in CZK | `50` |
| `delivery_minimum` | number | No | Minimum order for delivery | `500` |
| `delivery_area` | string | No | Delivery coverage area | `"Prague and surrounding areas"` |
| `delivery_radius` | number | No | Delivery radius in meters | `50000` |
| `curbside_pickup` | boolean | No | Curbside pickup available | `true` |
| `wheelchair_accessible` | boolean | No | ADA/wheelchair accessible | `true` |
| `parking` | boolean | No | Parking available | `true` |
| `pet_friendly` | boolean | No | Pets allowed | `false` |
| `atm` | boolean | No | ATM on premises | `true` |
| `security` | boolean | No | Security features | `true` |

#### Operational Details

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `opening_hours_specification` | array | No | Structured opening hours | See below |
| `return_policy` | string | No | Return policy description | `"30-day return policy"` |
| `loyalty_program` | string | No | Loyalty program details | `"Earn 5% back on all purchases"` |
| `current_promotions` | array | No | Active promotions | `["First-time customer 10% off"]` |
| `special_events` | array | No | Upcoming events | See below |

**Opening Hours Specification Structure:**
```json
[
  {
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  {
    "dayOfWeek": ["Saturday"],
    "opens": "10:00",
    "closes": "16:00"
  }
]
```

**Special Events Structure:**
```json
[
  {
    "name": "Grand Opening",
    "date": "2025-11-01",
    "description": "Join us for our grand opening celebration"
  }
]
```

### Business Categories

#### Current Categories
- **CBD Retail Shop** - CBD products, oils, cosmetics
- **Seeds & Grow Shop** - Cannabis seeds and growing equipment
- **Pharmacy** - Medical cannabis pharmacies
- **Online** - E-commerce only businesses

#### New Categories to Add

| Category | Description | Count |
|----------|-------------|-------|
| `Cannabis Doctor` | Medical cannabis prescribers and clinics | TBD |
| `Testing Laboratory` | Cannabis testing facilities | TBD |
| `Delivery Service` | Standalone delivery businesses | TBD |
| `Cannabis Lounge` | Consumption spaces and cafes | TBD |
| `Cannabis Event` | Trade shows, festivals, educational events | TBD |
| `Cannabis Tour` | Tourism experiences | TBD |
| `Cultivation Consultant` | Growing advisors and consultants | TBD |
| `Legal Service` | Cannabis-specific legal help | TBD |
| `Technology Provider` | Software, POS systems | TBD |
| `Packaging Supplier` | Cannabis packaging companies | TBD |
| `Extraction Service` | CBD/THC extraction facilities | TBD |
| `Education` | Courses and certifications | TBD |
| `Media` | News, magazines, blogs | TBD |
| `Accommodation` | 420-friendly hotels and rentals | TBD |
| `Brand` | Product brands (separate from retailers) | TBD |

## Implementation Priority

### Phase 1: Essential Fields (Immediate)
1. `phone` - Critical for local SEO
2. `email` - User contact
3. `opening_hours_specification` - For "open now" searches
4. `postal_code` - Complete address
5. `latitude`, `longitude` - Map integration
6. `description` - SEO content

### Phase 2: Enhanced SEO (Week 2)
1. `social_media` - Social signals
2. `payment_accepted` - User filtering
3. `price_range` - User filtering
4. `images` - Visual content
5. `certifications` - Trust signals
6. `brands_carried` - Product search

### Phase 3: Advanced Features (Week 3-4)
1. `delivery_fee`, `delivery_minimum`, `delivery_radius` - Delivery filtering
2. `wheelchair_accessible`, `parking`, `pet_friendly` - Accessibility
3. `loyalty_program`, `current_promotions` - User engagement
4. `return_policy` - Trust building
5. `special_events` - Content freshness

## Data Collection Methods

### For Existing Businesses
1. **Automated Web Scraping** - Extract data from business websites
2. **Manual Research** - Research each business individually
3. **Business Owner Submission** - Create form for owners to update info
4. **API Integration** - Connect to Google Places, social media APIs

### For New Businesses
1. **Submission Form** - Comprehensive form with all fields
2. **Verification Process** - Email/phone verification
3. **Owner Dashboard** - Allow owners to manage their listings

## Schema Markup Implementation

All new fields are automatically included in the enhanced schema.js file, which generates:
- **LocalBusiness** schema with all available fields
- **BreadcrumbList** schema for navigation
- **AggregateRating** schema for reviews
- **OpeningHoursSpecification** for structured hours

## Validation Rules

### Required Fields
- `name`, `category`, `city`, `region`, `url` must always be present

### Optional but Recommended
- `phone`, `email`, `website` - At least one contact method
- `address` - For physical locations
- `opening_hours_specification` - For retail locations
- `description` - Minimum 200 characters

### Format Validation
- `phone` - Must include country code: `+420 XXX XXX XXX`
- `email` - Valid email format
- `website` - Valid URL (http/https optional)
- `latitude`, `longitude` - Valid GPS coordinates
- `postal_code` - Valid Czech postal code format

## Migration Plan

1. **Backup Current Data** - Export current data.js
2. **Add New Fields** - Update data structure
3. **Populate Essential Fields** - Start with phone, email, hours
4. **Test Schema Output** - Verify schema.org markup
5. **Deploy Gradually** - Roll out category by category
6. **Monitor Performance** - Track SEO improvements

## Example Complete Business Entry

```json
{
  "id": 0,
  "name": "KONOPEX Market",
  "type": "E-shop & Retail",
  "category": "CBD Retail Shop",
  "city": "Prague",
  "city_slug": "prague",
  "region": "praha",
  "region_name": "Prague",
  "address": "Václavské náměstí 123",
  "postal_code": "11000",
  "latitude": 50.0755,
  "longitude": 14.4378,
  "website": "www.konopex-market.cz",
  "phone": "+420 123 456 789",
  "email": "info@konopex-market.cz",
  "description": "KONOPEX Market is your premier destination for high-quality CBD products in Prague. We offer a wide selection of CBD oils, flowers, seeds, cosmetics, and hemp-based products for both humans and pets. Our knowledgeable staff is dedicated to helping you find the right products for your needs. Visit our store or shop online for convenient delivery throughout the Czech Republic.",
  "products": "Food, snacks, CBD oils, flowers, seeds, cosmetics, hemp ointment, animal products",
  "services": "E-commerce, Retail, Consultation",
  "opening_hours": "Mo-Fr 09:00-18:00, Sa 10:00-16:00",
  "opening_hours_specification": [
    {
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "dayOfWeek": ["Saturday"],
      "opens": "10:00",
      "closes": "16:00"
    }
  ],
  "delivery_available": "Yes",
  "delivery_fee": 50,
  "delivery_minimum": 500,
  "delivery_area": "Prague and Central Bohemia",
  "delivery_radius": 50000,
  "online_shop": "Yes",
  "payment_accepted": "Cash, Credit Card, Debit Card",
  "currencies_accepted": "CZK, EUR",
  "price_range": "$$",
  "year_established": 2020,
  "certifications": ["Bio Certified", "EU GMP"],
  "brands_carried": ["Canatura", "Euphoria", "Hemnia"],
  "wheelchair_accessible": true,
  "parking": true,
  "pet_friendly": false,
  "atm": true,
  "curbside_pickup": true,
  "loyalty_program": "Earn 5% back on all purchases",
  "current_promotions": ["First-time customer 10% off", "Free delivery over 1000 CZK"],
  "return_policy": "30-day return policy on unopened products",
  "social_media": {
    "facebook": "https://facebook.com/konopexmarket",
    "instagram": "https://instagram.com/konopexmarket"
  },
  "image": "/images/businesses/konopex-market.jpg",
  "images": [
    "/images/businesses/konopex-market-1.jpg",
    "/images/businesses/konopex-market-2.jpg",
    "/images/businesses/konopex-market-3.jpg"
  ],
  "notes": "Clearly described contents and ratings",
  "url": "/online/prague/konopex-market.html"
}
```

