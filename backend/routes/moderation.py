from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..db import db, Review
from ..auth import require_role

moderation_bp = Blueprint('moderation', __name__)


@moderation_bp.get('/reviews')
def list_reviews():
    require_role('moderator', 'admin')
    status = request.args.get('status', 'pending')
    q = Review.query
    if status:
        q = q.filter_by(status=status)
    items = q.order_by(Review.created_at.desc()).limit(200).all()
    return jsonify([
        {
            'id': r.id,
            'business_id': r.business_id,
            'user_id': r.user_id,
            'overall_rating': r.overall_rating,
            'title': r.title,
            'review_text': r.review_text,
            'status': r.status,
            'created_at': r.created_at.isoformat() + 'Z'
        } for r in items
    ])


@moderation_bp.post('/reviews/<int:review_id>/approve')
def approve_review(review_id: int):
    require_role('moderator', 'admin')
    r = Review.query.get(review_id)
    if not r:
        return jsonify({'error': 'Not found'}), 404
    r.status = 'approved'
    r.decision_reason = None
    db.session.commit()
    return jsonify({'ok': True})


@moderation_bp.post('/reviews/<int:review_id>/reject')
def reject_review(review_id: int):
    require_role('moderator', 'admin')
    r = Review.query.get(review_id)
    if not r:
        return jsonify({'error': 'Not found'}), 404
    reason = (request.get_json(silent=True) or {}).get('reason') or 'policy_violation'
    r.status = 'rejected'
    r.decision_reason = str(reason)[:255]
    db.session.commit()
    return jsonify({'ok': True})


@moderation_bp.post('/reviews/<int:review_id>/shadow-hide')
def shadow_hide_review(review_id: int):
    require_role('moderator', 'admin')
    r = Review.query.get(review_id)
    if not r:
        return jsonify({'error': 'Not found'}), 404
    r.status = 'hidden'
    r.decision_reason = 'shadow_hidden'
    db.session.commit()
    return jsonify({'ok': True})


