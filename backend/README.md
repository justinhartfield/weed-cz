# Reviews API Backend

Flask-based API for ratings, reviews, and moderation system for Weed.cz.

## Features

- **Email Magic Link Authentication**: Secure passwordless login
- **5-Star Rating System**: Overall rating plus category ratings (product quality, selection, staff, price, atmosphere)
- **Multi-Tier Moderation**: Auto-triage based on user trust score and content analysis
- **Role-Based Access Control**: User, moderator, and admin roles
- **Rate Limiting**: Protection against abuse
- **CORS Support**: Configured for static site integration

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run migrations and seed data**:
   ```bash
   python migrate.py
   ```

4. **Start the development server**:
   ```bash
   python -m backend.app
   ```

The API will be available at `http://localhost:5000`

### Production Deployment

1. **Set production environment variables**:
   ```bash
   export APP_ENV=production
   export SECRET_KEY=your-secure-secret-key
   export DATABASE_URL=postgresql://user:pass@host:port/db
   export SITE_ORIGIN=https://weed.cz
   export EMAIL_FROM=noreply@weed.cz
   export SMTP_URL=smtps://user:pass@smtp.example.com:587
   ```

2. **Deploy with Gunicorn**:
   ```bash
   gunicorn backend.app:create_app() -b 0.0.0.0:5000 --workers 4
   ```

## API Endpoints

### Authentication
- `POST /api/auth/request-login` - Request magic link login
- `GET /api/auth/callback?token=...` - Complete login with token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout

### Reviews
- `GET /api/reviews/business/<business_id>` - Get reviews for a business
- `POST /api/reviews/submit` - Submit a new review (auth required)
- `POST /api/reviews/<id>/helpful` - Mark review as helpful (auth required)
- `POST /api/reviews/<id>/flag` - Flag a review (auth required)

### Moderation (Admin/Moderator only)
- `GET /api/moderation/reviews?status=pending` - Get pending reviews
- `POST /api/moderation/reviews/<id>/approve` - Approve review
- `POST /api/moderation/reviews/<id>/reject` - Reject review
- `POST /api/moderation/reviews/<id>/shadow-hide` - Hide review

## Database Schema

### Users
- `id`, `email`, `display_name`, `role`, `trust_score`, `created_at`

### Sessions
- `id`, `user_id`, `created_at`, `expires_at`

### Businesses
- `id`, `slug`, `name`

### Reviews
- `id`, `business_id`, `user_id`, `overall_rating`, `title`, `review_text`
- `product_quality_rating`, `selection_rating`, `staff_rating`, `price_rating`, `atmosphere_rating`
- `status` (pending/approved/rejected/hidden), `helpful_count`, `decision_reason`
- `created_at`, `updated_at`

### Review Votes
- `id`, `review_id`, `user_id`, `type`, `created_at`

### Review Flags
- `id`, `review_id`, `user_id`, `reason`, `created_at`, `resolved_by`, `resolved_at`

### Login Tokens
- `id`, `email`, `token_hash`, `expires_at`, `used_at`, `ip`

## Moderation Logic

### Auto-Triage Rules

1. **Reject**: Content fails policy checks (profanity, >2 links, slurs)
2. **Auto-Approve**: High trust users (score ≥ 0.7) with clean content
3. **Pending**: Default for manual review

### Trust Score Calculation

- **Account Age**: Up to 0.3 points (based on days since registration)
- **Approval Ratio**: Up to 0.4 points (approved reviews / total reviews)
- **Helpful Votes**: Up to 0.3 points (based on helpful votes received)

## Rate Limiting

- **Login Requests**: 5 per 5 minutes per IP
- **Review Submission**: 3 per hour per user
- **Helpful Votes**: 20 per hour per user
- **Flag Reviews**: 5 per hour per user

**Note**: Rate limiting uses Redis for multi-process deployments. Set `REDIS_URL` environment variable for production. Falls back to in-memory storage for single-process deployments.

## Security Features

- **Magic Link Authentication**: No passwords stored
- **Session Cookies**: HttpOnly, Secure, SameSite
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Prevents abuse
- **Content Sanitization**: XSS protection
- **SQL Injection Protection**: SQLAlchemy ORM

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production) | development |
| `DATABASE_URL` | Database connection string | sqlite:///reviews.db |
| `SECRET_KEY` | Flask secret key (required in production) | dev-only-secret-change-me |
| `SITE_ORIGIN` | Frontend site origin for CORS | http://localhost:8888 |
| `COOKIE_DOMAIN` | Cookie domain | None |
| `COOKIE_SECURE` | Secure cookies flag | true |
| `COOKIE_SAMESITE` | SameSite cookie setting | None |
| `EMAIL_FROM` | From email address | noreply@example.com |
| `SMTP_URL` | SMTP connection string | None (console fallback) |
| `REDIS_URL` | Redis connection string | None (in-memory fallback) |

## Frontend Integration

Add to your HTML pages:

```html
<script>window.REVIEWS_API_BASE = 'https://api.weed.cz/api';</script>
<script src="/js/reviews.js"></script>
```

Business page markup:
```html
<body data-business-id="business-slug">
  <button class="write-review-btn" style="display:none" onclick="showReviewForm('business-slug')">Write a review</button>
  <div id="reviews-container"></div>
</body>
```

## Docker Support

```bash
# Build image
docker build -t reviews-api .

# Run container
docker run -p 5000:5000 --env-file .env reviews-api
```

## License

© 2025 Weed.cz - Cannabis Directory České Republiky
