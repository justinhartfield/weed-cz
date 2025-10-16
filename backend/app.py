import os
from datetime import timedelta
from flask import Flask, request
from flask_cors import CORS
from functools import wraps
import time

from .config import Settings
from .db import init_db
from .routes.reviews import reviews_bp
from .routes.moderation import moderation_bp
from .auth import auth_bp


# Rate limiting with Redis support for multi-process deployments
import os
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

# Fallback in-memory storage for single-process deployments
rate_limit_storage = {}

def get_rate_limit_storage():
    """Get rate limiting storage backend"""
    redis_url = os.getenv('REDIS_URL')
    if redis_url and REDIS_AVAILABLE:
        try:
            return redis.from_url(redis_url, decode_responses=True)
        except Exception:
            pass
    
    # Fallback to in-memory storage (single process only)
    return None

def rate_limit(max_requests=10, window_seconds=60):
    """Rate limiting decorator with Redis support"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client identifier (IP + user ID if authenticated)
            client_id = request.remote_addr
            if hasattr(request, 'user') and request.user:
                client_id = f"{request.remote_addr}:{request.user.id}"
            
            storage = get_rate_limit_storage()
            now = time.time()
            window_start = now - window_seconds
            
            if storage:
                # Redis-based rate limiting
                key = f"rate_limit:{client_id}"
                pipe = storage.pipeline()
                pipe.zremrangebyscore(key, 0, window_start)
                pipe.zcard(key)
                pipe.zadd(key, {str(now): now})
                pipe.expire(key, window_seconds)
                results = pipe.execute()
                
                if results[1] >= max_requests:
                    from flask import jsonify
                    return jsonify({'error': 'Rate limit exceeded'}), 429
            else:
                # In-memory rate limiting (single process only)
                if client_id in rate_limit_storage:
                    rate_limit_storage[client_id] = [
                        timestamp for timestamp in rate_limit_storage[client_id]
                        if timestamp > window_start
                    ]
                else:
                    rate_limit_storage[client_id] = []
                
                if len(rate_limit_storage[client_id]) >= max_requests:
                    from flask import jsonify
                    return jsonify({'error': 'Rate limit exceeded'}), 429
                
                rate_limit_storage[client_id].append(now)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def create_app() -> Flask:
    settings = Settings()

    app = Flask(__name__)
    app.config['SECRET_KEY'] = settings.secret_key
    app.config['JSON_SORT_KEYS'] = False
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=60)

    # Database
    init_db(app, settings)

    # CORS for static site origin
    CORS(
        app,
        resources={r"/api/*": {"origins": settings.cors_origins}},
        supports_credentials=True,
        expose_headers=['Set-Cookie']
    )

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(moderation_bp, url_prefix='/api/moderation')

    @app.get('/api/health')
    def health():  # simple health check
        return {"status": "ok"}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')))


