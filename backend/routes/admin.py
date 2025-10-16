from __future__ import annotations

from flask import Blueprint, render_template_string, request, jsonify, redirect, url_for
from ..db import db, Review, User
from ..auth import require_role

admin_bp = Blueprint('admin', __name__)

# Simple HTML template for moderation panel
MODERATION_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Moderation - Weed.cz</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { border-bottom: 2px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
        .review-card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .review-actions { margin-top: 10px; }
        .btn { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-approve { background: #28a745; color: white; }
        .btn-reject { background: #dc3545; color: white; }
        .btn-hide { background: #6c757d; color: white; }
        .stars { color: #ffc107; font-size: 18px; }
        .status-pending { border-left: 4px solid #ffc107; }
        .status-approved { border-left: 4px solid #28a745; }
        .status-rejected { border-left: 4px solid #dc3545; }
        .filters { margin-bottom: 20px; }
        .filter-btn { padding: 5px 10px; margin: 5px; border: 1px solid #ddd; background: white; cursor: pointer; }
        .filter-btn.active { background: #007bff; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Review Moderation Panel</h1>
            <p>Welcome, {{ current_user.display_name }} ({{ current_user.role }})</p>
            <a href="/api/auth/logout">Logout</a>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" onclick="filterReviews('pending')">Pending ({{ pending_count }})</button>
            <button class="filter-btn" onclick="filterReviews('approved')">Approved ({{ approved_count }})</button>
            <button class="filter-btn" onclick="filterReviews('rejected')">Rejected ({{ rejected_count }})</button>
            <button class="filter-btn" onclick="filterReviews('all')">All Reviews</button>
        </div>
        
        <div id="reviews-container">
            {% for review in reviews %}
            <div class="review-card status-{{ review.status }}" data-review-id="{{ review.id }}">
                <div class="review-header">
                    <div>
                        <strong>{{ review.business_id }}</strong>
                        <span class="stars">{{ '★' * review.overall_rating }}{{ '☆' * (5 - review.overall_rating) }}</span>
                        <span style="color: #666;">by {{ review.user_id }} on {{ review.created_at.strftime('%Y-%m-%d %H:%M') }}</span>
                    </div>
                    <span class="status-badge">{{ review.status.upper() }}</span>
                </div>
                
                {% if review.title %}
                <h4>{{ review.title }}</h4>
                {% endif %}
                
                {% if review.review_text %}
                <p>{{ review.review_text }}</p>
                {% endif %}
                
                <div class="review-actions">
                    {% if review.status == 'pending' %}
                    <button class="btn btn-approve" onclick="moderateReview({{ review.id }}, 'approve')">Approve</button>
                    <button class="btn btn-reject" onclick="moderateReview({{ review.id }}, 'reject')">Reject</button>
                    <button class="btn btn-hide" onclick="moderateReview({{ review.id }}, 'hide')">Hide</button>
                    {% endif %}
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
    
    <script>
        async function moderateReview(reviewId, action) {
            const reason = action === 'reject' ? prompt('Rejection reason:') : '';
            
            try {
                const response = await fetch(`/api/moderation/reviews/${reviewId}/${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                });
                
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Error: ' + (await response.text()));
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        function filterReviews(status) {
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Reload page with filter
            const url = new URL(window.location);
            url.searchParams.set('status', status);
            window.location.href = url.toString();
        }
    </script>
</body>
</html>
"""

@admin_bp.route('/admin')
def moderation_panel():
    user = require_role('moderator', 'admin')
    
    status_filter = request.args.get('status', 'pending')
    
    # Get review counts
    pending_count = Review.query.filter_by(status='pending').count()
    approved_count = Review.query.filter_by(status='approved').count()
    rejected_count = Review.query.filter_by(status='rejected').count()
    
    # Get reviews based on filter
    if status_filter == 'all':
        reviews = Review.query.order_by(Review.created_at.desc()).limit(100).all()
    else:
        reviews = Review.query.filter_by(status=status_filter).order_by(Review.created_at.desc()).limit(100).all()
    
    return render_template_string(MODERATION_TEMPLATE, 
                                current_user=user,
                                reviews=reviews,
                                pending_count=pending_count,
                                approved_count=approved_count,
                                rejected_count=rejected_count)

@admin_bp.route('/admin/stats')
def admin_stats():
    user = require_role('admin')
    
    stats = {
        'total_reviews': Review.query.count(),
        'pending_reviews': Review.query.filter_by(status='pending').count(),
        'approved_reviews': Review.query.filter_by(status='approved').count(),
        'rejected_reviews': Review.query.filter_by(status='rejected').count(),
        'total_users': User.query.count(),
        'moderators': User.query.filter_by(role='moderator').count(),
        'admins': User.query.filter_by(role='admin').count(),
    }
    
    return jsonify(stats)
