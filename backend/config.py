import os
from dataclasses import dataclass


@dataclass
class Settings:
    database_url: str = os.getenv('DATABASE_URL', 'sqlite:///reviews.db')
    secret_key: str | None = os.getenv('SECRET_KEY')
    cors_origins: list = None
    cookie_domain: str | None = os.getenv('COOKIE_DOMAIN')
    cookie_secure: bool = os.getenv('COOKIE_SECURE', 'true').lower() == 'true'
    cookie_samesite: str = os.getenv('COOKIE_SAMESITE', 'None')
    app_env: str = os.getenv('APP_ENV', 'development')
    site_origin: str = os.getenv('SITE_ORIGIN', 'http://localhost:8888')
    email_from: str = os.getenv('EMAIL_FROM', 'noreply@weed.cz')
    smtp_url: str | None = os.getenv('SMTP_URL')

    def __post_init__(self):
        if self.cors_origins is None:
            self.cors_origins = [self.site_origin]
        # Enforce secret in production
        if not self.secret_key:
            if self.app_env == 'production':
                raise RuntimeError('SECRET_KEY must be set in production')
            # Dev fallback (do not use in production)
            self.secret_key = 'dev-only-secret-change-me'


