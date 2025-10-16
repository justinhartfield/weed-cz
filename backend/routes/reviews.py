from __future__ import annotations

from datetime import datetime, timedelta
import re
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from ..db import db, User, Business, Review, ReviewVote, ReviewFlag
from ..auth import require_auth
from ..app import rate_limit

reviews_bp = Blueprint('reviews', __name__)


def _sanitize_and_triage(text: str) -> tuple[bool, str | None]:
    if not text:
        return True, None
    if len(re.findall(r"https?://", text, flags=re.I)) > 2:
        return False, 'too_many_links'
    bad_words = ['idiot', 'stupid', 'racist', 'spam']
    lower = text.lower()
    if any(w in lower for w in bad_words):
        return False, 'profanity'
    return True, None


def _calculate_user_trust_score(user: User) -> float:
    """Calculate trust score based on user history"""
    # Base score for new users
    base_score = 0.0
    
    # Account age bonus (max 0.3)
    days_old = (datetime.utcnow() - user.created_at).days
    age_bonus = min(0.3, days_old / 365.0 * 0.3)
    
    # Review approval ratio (max 0.4)
    total_reviews = Review.query.filter_by(user_id=user.id).count()
    approved_reviews = Review.query.filter_by(user_id=user.id, status='approved').count()
    approval_ratio = approved_reviews / max(total_reviews, 1)
    approval_bonus = approval_ratio * 0.4
    
    # Helpful votes received (max 0.3)
    helpful_votes = db.session.query(func.sum(Review.helpful_count)).join(
        ReviewVote, ReviewVote.review_id == Review.id
    ).filter(Review.user_id == user.id).scalar() or 0
    helpful_bonus = min(0.3, helpful_votes / 10.0 * 0.3)
    
    return base_score + age_bonus + approval_bonus + helpful_bonus


def _should_auto_approve(user: User, review_text: str) -> bool:
    """Determine if review should be auto-approved based on trust score and content"""
    trust_score = _calculate_user_trust_score(user)
    
    # High trust users (score >= 0.7) get auto-approval for clean content
    if trust_score >= 0.7:
        ok, _ = _sanitize_and_triage(review_text)
        return ok
    
    # Medium trust users (score >= 0.4) get auto-approval for very clean content
    if trust_score >= 0.4:
        ok, reason = _sanitize_and_triage(review_text)
        return ok and reason is None
    
    return False


@reviews_bp.get('/business/<business_id>')
def get_business_reviews(business_id: str):
    # Only approved and visible reviews; fetch aggregates in a single pass
    base = Review.query.filter_by(business_id=business_id, status='approved')
    reviews = base.order_by(Review.created_at.desc()).limit(200).all()

    # Single query for aggregates using SQLAlchemy subqueries
    agg = db.session.query(
        func.coalesce(func.avg(Review.overall_rating), 0.0),
        func.coalesce(func.count(Review.id), 0)
    ).filter_by(business_id=business_id, status='approved').one()
    avg, count = float(agg[0] or 0.0), int(agg[1] or 0)

    dist_rows = (
        db.session.query(Review.overall_rating, func.count(Review.id))
        .filter_by(business_id=business_id, status='approved')
        .group_by(Review.overall_rating)
        .all()
    )
    distribution = {str(i): 0 for i in range(1, 6)}
    for rating, c in dist_rows:
        distribution[str(int(rating))] = int(c)

    # Serialize
    user_map = {u.id: u for u in User.query.filter(User.id.in_({r.user_id for r in reviews})).all()}
    out = []
    for r in reviews:
        u = user_map.get(r.user_id)
        out.append({
            'id': r.id,
            'author': (u.display_name if u and u.display_name else 'User'),
            'overall_rating': r.overall_rating,
            'title': r.title,
            'review_text': r.review_text,
            'helpful_count': r.helpful_count,
            'created_at': r.created_at.isoformat() + 'Z',
        })

    return jsonify({
        'average_rating': round(float(avg), 1),
        'review_count': int(count),
        'distribution': distribution,
        'reviews': out,
    })


@reviews_bp.post('/submit')
@rate_limit(max_requests=3, window_seconds=3600)  # 3 reviews per hour
def submit_review():
    user = require_auth()
    data = request.get_json(silent=True) or {}

    business_id = (data.get('business_id') or '').strip()
    overall_rating = int(data.get('overall_rating') or 0)
    if not business_id or overall_rating not in (1, 2, 3, 4, 5):
        return jsonify({'error': 'Invalid data'}), 400

    # Ensure business exists (minimal upsert)
    biz = Business.query.filter_by(id=business_id).first()
    if not biz:
        biz = Business(id=business_id, name=business_id)
        db.session.add(biz)
        db.session.flush()

    # One review per 90 days per business
    last = (
        Review.query
        .filter_by(business_id=business_id, user_id=user.id)
        .order_by(Review.created_at.desc())
        .first()
    )
    if last and (datetime.utcnow() - last.created_at) < timedelta(days=90):
        return jsonify({'error': 'You can only review this business once every 90 days.'}), 429

    title = (data.get('title') or '').strip()[:100]
    review_text = (data.get('review_text') or '').strip()[:2000]
    ok, reason = _sanitize_and_triage(review_text)
    
    # Auto-triage based on content and user trust
    if not ok:
        status = 'rejected'
    elif _should_auto_approve(user, review_text):
        status = 'approved'
    else:
        status = 'pending'

    r = Review(
        business_id=business_id,
        user_id=user.id,
        overall_rating=overall_rating,
        title=title or None,
        review_text=review_text or None,
        product_quality_rating=data.get('product_quality_rating'),
        selection_rating=data.get('selection_rating'),
        staff_rating=data.get('staff_rating'),
        price_rating=data.get('price_rating'),
        atmosphere_rating=data.get('atmosphere_rating'),
        status=status,
        decision_reason=reason
    )
    db.session.add(r)
    db.session.commit()

    if status == 'rejected':
        return jsonify({'error': 'Content rejected by automated checks.'}), 400

    return jsonify({'ok': True, 'status': status})


@reviews_bp.post('/<int:review_id>/helpful')
@rate_limit(max_requests=20, window_seconds=3600)  # 20 helpful votes per hour
def mark_helpful(review_id: int):
    user = require_auth()
    review = Review.query.get(review_id)
    if not review or review.status != 'approved':
        return jsonify({'error': 'Review not found'}), 404
    if review.user_id == user.id:
        return jsonify({'error': 'Cannot vote on your own review'}), 400

    exists = ReviewVote.query.filter_by(review_id=review_id, user_id=user.id, type='helpful').first()
    if exists:
        return jsonify({'error': 'Already voted'}), 400

    v = ReviewVote(review_id=review_id, user_id=user.id, type='helpful')
    review.helpful_count = (review.helpful_count or 0) + 1
    db.session.add(v)
    db.session.commit()
    return jsonify({'helpful_count': review.helpful_count})


@reviews_bp.post('/<int:review_id>/flag')
@rate_limit(max_requests=5, window_seconds=3600)  # 5 flags per hour
def flag_review(review_id: int):
    user = require_auth()
    reason = (request.get_json(silent=True) or {}).get('reason') or 'unspecified'
    review = Review.query.get(review_id)
    if not review:
        return jsonify({'error': 'Review not found'}), 404

    f = ReviewFlag(review_id=review_id, user_id=user.id, reason=str(reason)[:120])
    db.session.add(f)
    db.session.commit()
    return jsonify({'ok': True})


