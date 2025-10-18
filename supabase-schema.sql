-- Supabase Database Schema for Reviews System
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extended from Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    trust_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    title TEXT CHECK (LENGTH(title) <= 100),
    review_text TEXT CHECK (LENGTH(review_text) <= 2000),
    product_quality_rating INTEGER CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
    selection_rating INTEGER CHECK (selection_rating >= 1 AND selection_rating <= 5),
    staff_rating INTEGER CHECK (staff_rating >= 1 AND staff_rating <= 5),
    price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
    atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    helpful_count INTEGER DEFAULT 0,
    decision_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review votes table
CREATE TABLE IF NOT EXISTS public.review_votes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id, type)
);

-- Review flags table
CREATE TABLE IF NOT EXISTS public.review_flags (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (LENGTH(reason) <= 120),
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON public.reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_business_status ON public.reviews(business_id, status);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON public.review_flags(review_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Businesses policies
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
CREATE POLICY "Anyone can view businesses" ON public.businesses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert businesses" ON public.businesses;
CREATE POLICY "Admins can insert businesses" ON public.businesses FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT 
    USING (status = 'approved' OR user_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own pending reviews" ON public.reviews;
CREATE POLICY "Users can update own pending reviews" ON public.reviews FOR UPDATE 
    USING (user_id = auth.uid() AND status = 'pending')
    WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Moderators can update any review" ON public.reviews;
CREATE POLICY "Moderators can update any review" ON public.reviews FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Review votes policies
DROP POLICY IF EXISTS "Authenticated users can view votes" ON public.review_votes;
CREATE POLICY "Authenticated users can view votes" ON public.review_votes FOR SELECT 
    USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.review_votes;
CREATE POLICY "Authenticated users can insert votes" ON public.review_votes FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Review flags policies
DROP POLICY IF EXISTS "Moderators can view flags" ON public.review_flags;
CREATE POLICY "Moderators can view flags" ON public.review_flags FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
DROP POLICY IF EXISTS "Authenticated users can insert flags" ON public.review_flags;
CREATE POLICY "Authenticated users can insert flags" ON public.review_flags FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, role, trust_score)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)), 'user', 0.0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to calculate user trust score
CREATE OR REPLACE FUNCTION public.calculate_user_trust_score(user_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    base_score DECIMAL := 0.0;
    age_bonus DECIMAL := 0.0;
    approval_bonus DECIMAL := 0.0;
    helpful_bonus DECIMAL := 0.0;
    days_old INTEGER;
    total_reviews INTEGER;
    approved_reviews INTEGER;
    helpful_votes INTEGER;
BEGIN
    -- Account age bonus (max 0.3)
    SELECT EXTRACT(DAY FROM NOW() - created_at) INTO days_old FROM public.users WHERE id = user_uuid;
    age_bonus := LEAST(0.3, (days_old / 365.0) * 0.3);
    
    -- Review approval ratio (max 0.4)
    SELECT COUNT(*) INTO total_reviews FROM public.reviews WHERE user_id = user_uuid;
    SELECT COUNT(*) INTO approved_reviews FROM public.reviews WHERE user_id = user_uuid AND status = 'approved';
    IF total_reviews > 0 THEN
        approval_bonus := (approved_reviews::DECIMAL / total_reviews) * 0.4;
    END IF;
    
    -- Helpful votes received (max 0.3)
    SELECT COALESCE(SUM(helpful_count), 0) INTO helpful_votes FROM public.reviews WHERE user_id = user_uuid;
    helpful_bonus := LEAST(0.3, (helpful_votes / 10.0) * 0.3);
    
    RETURN base_score + age_bonus + approval_bonus + helpful_bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-moderate review on insert
CREATE OR REPLACE FUNCTION public.auto_moderate_review()
RETURNS TRIGGER AS $$
DECLARE
    trust_score DECIMAL;
    has_bad_content BOOLEAN := FALSE;
    link_count INTEGER;
BEGIN
    -- Calculate user trust score
    trust_score := public.calculate_user_trust_score(NEW.user_id);
    
    -- Check for too many links
    SELECT (LENGTH(NEW.review_text) - LENGTH(REPLACE(LOWER(NEW.review_text), 'http', ''))) / 4 INTO link_count;
    IF link_count > 2 THEN
        has_bad_content := TRUE;
        NEW.decision_reason := 'too_many_links';
    END IF;
    
    -- Check for profanity (basic check)
    IF NOT has_bad_content AND NEW.review_text IS NOT NULL THEN
        IF LOWER(NEW.review_text) ~ '(idiot|stupid|racist|spam)' THEN
            has_bad_content := TRUE;
            NEW.decision_reason := 'profanity';
        END IF;
    END IF;
    
    -- Auto-approve based on trust score
    IF has_bad_content THEN
        NEW.status := 'rejected';
    ELSIF trust_score >= 0.7 THEN
        NEW.status := 'approved';
        NEW.decision_reason := NULL;
    ELSIF trust_score >= 0.4 AND NOT has_bad_content THEN
        NEW.status := 'approved';
        NEW.decision_reason := NULL;
    ELSE
        NEW.status := 'pending';
    END IF;
    
    -- Update user trust score
    UPDATE public.users SET trust_score = trust_score WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-moderate review on insert
DROP TRIGGER IF EXISTS auto_moderate_on_insert ON public.reviews;
CREATE TRIGGER auto_moderate_on_insert
    BEFORE INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.auto_moderate_review();

-- Function to update helpful count when vote is added
CREATE OR REPLACE FUNCTION public.update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'helpful' THEN
        UPDATE public.reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update helpful count
DROP TRIGGER IF EXISTS update_helpful_on_vote ON public.review_votes;
CREATE TRIGGER update_helpful_on_vote
    AFTER INSERT ON public.review_votes
    FOR EACH ROW EXECUTE FUNCTION public.update_helpful_count();

-- Function to check review submission rate limit (90 days per business)
CREATE OR REPLACE FUNCTION public.check_review_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
    last_review_date TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO last_review_date 
    FROM public.reviews 
    WHERE business_id = NEW.business_id AND user_id = NEW.user_id 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF last_review_date IS NOT NULL AND (NOW() - last_review_date) < INTERVAL '90 days' THEN
        RAISE EXCEPTION 'You can only review this business once every 90 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check rate limit before insert
DROP TRIGGER IF EXISTS check_rate_limit_before_insert ON public.reviews;
CREATE TRIGGER check_rate_limit_before_insert
    BEFORE INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.check_review_rate_limit();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
