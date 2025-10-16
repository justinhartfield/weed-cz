from __future__ import annotations

from datetime import datetime, timedelta
import hashlib
import os
from urllib.parse import urlencode

from flask import Blueprint, current_app, jsonify, request, make_response

from .config import Settings
from .db import db, User, Session, LoginToken, new_session_id
from .emailer import send_login_email
from threading import Thread

auth_bp = Blueprint('auth', __name__)


def get_settings() -> Settings:
    # type: ignore[attr-defined]
    return current_app.config.setdefault('APP_SETTINGS', Settings())


def _cookie_params(settings: Settings) -> dict:
    return {
        'httponly': True,
        'secure': settings.cookie_secure,
        'samesite': settings.cookie_samesite,
        'domain': settings.cookie_domain,
        'path': '/',
        'max_age': 60 * 60 * 24 * 60,
    }


@auth_bp.post('/request-login')
@rate_limit(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
def request_login():
    payload = request.get_json(silent=True) or {}
    email = (payload.get('email') or '').strip().lower()
    if not email:
        return jsonify({'error': 'Email required'}), 400

    settings = get_settings()

    token = os.urandom(24).hex()
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=30)

    lt = LoginToken(email=email, token_hash=token_hash, expires_at=expires_at, ip=request.remote_addr)
    db.session.add(lt)
    db.session.commit()

    callback_base = request.headers.get('Origin') or settings.site_origin
    callback_url = f"{request.host_url.rstrip('/')}/api/auth/callback?" + urlencode({'token': token})

    # Offload email sending to background thread to avoid blocking request
    Thread(target=send_login_email, args=(email, callback_url), daemon=True).start()

    return jsonify({'ok': True})


@auth_bp.get('/callback')
def callback():
    token = request.args.get('token', '')
    if not token:
        return jsonify({'error': 'Missing token'}), 400

    token_hash = hashlib.sha256(token.encode()).hexdigest()
    lt = LoginToken.query.filter_by(token_hash=token_hash).first()
    if not lt or lt.used_at or lt.expires_at < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired token'}), 400

    lt.used_at = datetime.utcnow()

    user = User.query.filter_by(email=lt.email).first()
    if not user:
        user = User(email=lt.email, display_name=lt.email.split('@')[0])
        db.session.add(user)
        db.session.flush()

    sess = Session(id=new_session_id(), user_id=user.id, expires_at=datetime.utcnow() + timedelta(days=60))
    db.session.add(sess)
    db.session.commit()

    settings = get_settings()
    resp = make_response("Logged in. You can close this tab.")
    resp.set_cookie('session_id', sess.id, **_cookie_params(settings))
    return resp


def _get_user_from_cookie() -> User | None:
    sess_id = request.cookies.get('session_id')
    if not sess_id:
        return None
    # Single joined query to fetch both user and session
    row = (
        db.session.query(User, Session)
        .join(Session, Session.user_id == User.id)
        .filter(Session.id == sess_id)
        .first()
    )
    if not row:
        return None
    user, sess = row
    if sess.expires_at < datetime.utcnow():
        return None
    return user


@auth_bp.get('/me')
def me():
    user = _get_user_from_cookie()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({'id': user.id, 'email': user.email, 'display_name': user.display_name, 'role': user.role})


@auth_bp.post('/logout')
def logout():
    sess_id = request.cookies.get('session_id')
    if sess_id:
        Session.query.filter_by(id=sess_id).delete()
        db.session.commit()
    settings = get_settings()
    resp = make_response(jsonify({'ok': True}))
    resp.set_cookie('session_id', '', expires=0, **_cookie_params(settings))
    return resp


def require_auth() -> User:
    user = _get_user_from_cookie()
    if not user:
        from flask import abort
        abort(401, description='Not authenticated')
    return user


def require_role(*roles: str) -> User:
    user = require_auth()
    if user.role not in roles:
        from flask import abort
        abort(403, description='Forbidden')
    return user


