# Reviews System - Supabase Setup Instructions

## 🎯 Overview
This reviews system is now **100% Supabase-based** with no Flask backend needed. All logic runs on Supabase with database triggers and functions.

## 📋 Setup Steps

### 1. Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** 
3. Copy the entire content from `supabase-schema.sql`
4. Paste and execute the SQL script

This will create:
- All necessary tables (users, businesses, reviews, review_votes, review_flags)
- Row Level Security (RLS) policies
- Database functions for auto-moderation
- Database triggers for trust score calculation
- Indexes for performance

### 2. Verify Installation

After running the schema, check that these tables exist in **Table Editor**:
- ✅ users
- ✅ businesses  
- ✅ reviews
- ✅ review_votes
- ✅ review_flags

### 3. Create Your First Moderator

You need to manually promote a user to moderator role:

1. Sign up a user through the website (use email magic link)
2. In Supabase dashboard, go to **Table Editor** → **users**
3. Find your user row
4. Change the `role` column from `user` to `moderator` or `admin`
5. Save the change

### 4. Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional but recommended)
4. Test login with magic link

### 5. Test the System

#### Test User Flow:
1. Visit any business page
2. Click "Přihlásit se" (Sign in)
3. Enter your email
4. Check email and click magic link
5. Write a review
6. Review will be auto-approved if trusted, or pending if new user

#### Test Moderation:
1. Visit `/moderation.html`
2. Sign in with moderator account
3. View pending reviews
4. Approve/reject/hide reviews

## 🔐 User Trust Score System

The system automatically calculates trust scores (0.0 - 1.0):

- **New users (score < 0.4)**: Reviews go to pending moderation
- **Medium trust (0.4 - 0.7)**: Clean reviews auto-approved
- **High trust (≥ 0.7)**: All non-profane reviews auto-approved

Trust score is based on:
- Account age (max 0.3 points)
- Approval ratio (max 0.4 points)  
- Helpful votes received (max 0.3 points)

## 🛡️ Auto-Moderation Features

Database triggers automatically:
- ✅ Reject reviews with >2 links (spam protection)
- ✅ Reject reviews with profanity
- ✅ Enforce 90-day rate limit per business
- ✅ Calculate and update user trust scores
- ✅ Auto-approve trusted users' reviews

## 📊 Features

### For Users:
- ⭐ Star ratings (1-5)
- 📝 Optional title and text
- 🏷️ Category ratings (quality, selection, staff, price, atmosphere)
- 👍 Mark reviews as helpful
- 🔐 Email magic link authentication

### For Moderators:
- 📋 Review queue dashboard
- ✅ Approve/reject/hide reviews
- 🔍 Filter by status (pending/approved/rejected/hidden)
- 👤 See user information
- 📅 Sort by date

### Automatic Features:
- 🤖 Auto-moderation based on content
- 📈 Dynamic trust scoring
- 🚫 Spam protection
- ⏰ Rate limiting (90 days per business)
- 🔄 Real-time updates

## 🔧 Configuration

### Supabase Credentials
Update these in `/js/reviews.js` and `/moderation.html`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### Email Templates
Customize email templates in Supabase Dashboard:
- **Authentication** → **Email Templates**
- Edit the magic link email template

## 📁 Files Modified/Created

### New Files:
- ✅ `supabase-schema.sql` - Complete database schema
- ✅ `REVIEWS_SETUP.md` - This file
- ✅ `moderation.html` - Moderation dashboard

### Modified Files:
- ✅ `/js/reviews.js` - Enhanced with better error handling and logging
- ✅ All business HTML pages already include reviews.js

### Removed (can be deleted):
- ❌ `/backend/` folder - No longer needed!
- ❌ Flask dependencies
- ❌ Python backend code

## 🐛 Troubleshooting

### Reviews not showing up?
1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Check if reviews are marked as `approved` in database
4. Verify RLS policies are enabled

### Can't submit reviews?
1. Make sure user is authenticated (check console)
2. Verify business exists in `businesses` table
3. Check 90-day rate limit hasn't been hit
4. Look for error messages in browser console

### Moderation not working?
1. Verify user has `moderator` or `admin` role in users table
2. Check authentication status
3. Verify RLS policies allow moderators to update reviews

### Auto-moderation not working?
1. Check if triggers are enabled in Supabase
2. Run the SQL schema again to recreate triggers
3. Check database logs in Supabase dashboard

## 🚀 Performance Tips

1. **Indexes are already created** for common queries
2. **Limit reviews per page** (currently 200, but can reduce)
3. **Cache user data** to reduce queries
4. **Use RLS policies** for security without extra code

## 🎨 Customization

### Add more profanity words:
Edit the `auto_moderate_review()` function in SQL:
```sql
IF LOWER(NEW.review_text) ~ '(word1|word2|word3)' THEN
```

### Change rate limits:
Edit the `check_review_rate_limit()` function:
```sql
IF (NOW() - last_review_date) < INTERVAL '30 days' THEN
```

### Adjust trust thresholds:
Edit the `auto_moderate_review()` function:
```sql
IF trust_score >= 0.5 THEN  -- Changed from 0.7
```

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify all SQL was executed successfully
4. Test with a simple review first

## ✅ Checklist

- [ ] SQL schema executed in Supabase
- [ ] Tables created successfully  
- [ ] At least one moderator user created
- [ ] Email authentication configured
- [ ] Supabase credentials updated in JS files
- [ ] Test user can sign in
- [ ] Test review submission works
- [ ] Test moderation dashboard accessible
- [ ] Reviews display on business pages
- [ ] Ratings show up correctly

## 🎉 You're Done!

The reviews system is now fully functional with Supabase. No backend server needed!