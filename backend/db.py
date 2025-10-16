from __future__ import annotations

from datetime import datetime, timedelta
import secrets
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, Index

db = SQLAlchemy()


def init_db(app: Flask, settings) -> None:
    app.config['SQLALCHEMY_DATABASE_URI'] = settings.database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(120))
    role = db.Column(db.String(20), default='user')
    trust_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Session(db.Model):
    __tablename__ = 'sessions'
    id = db.Column(db.String(64), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)


class Business(db.Model):
    __tablename__ = 'businesses'
    id = db.Column(db.String(64), primary_key=True)
    slug = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(255), nullable=False)


class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    business_id = db.Column(db.String(64), db.ForeignKey('businesses.id'), index=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    overall_rating = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100))
    review_text = db.Column(db.Text)
    product_quality_rating = db.Column(db.Integer)
    selection_rating = db.Column(db.Integer)
    staff_rating = db.Column(db.Integer)
    price_rating = db.Column(db.Integer)
    atmosphere_rating = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending', index=True)
    helpful_count = db.Column(db.Integer, default=0)
    decision_reason = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('ix_reviews_business_user_recent', 'business_id', 'user_id'),
    )


class ReviewVote(db.Model):
    __tablename__ = 'review_votes'
    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id'), index=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ReviewFlag(db.Model):
    __tablename__ = 'review_flags'
    id = db.Column(db.Integer, primary_key=True)
    review_id = db.Column(db.Integer, db.ForeignKey('reviews.id'), index=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reason = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_by = db.Column(db.Integer)
    resolved_at = db.Column(db.DateTime)


class LoginToken(db.Model):
    __tablename__ = 'login_tokens'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    token_hash = db.Column(db.String(128), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime)
    ip = db.Column(db.String(64))


def new_session_id() -> str:
    return secrets.token_urlsafe(32)


