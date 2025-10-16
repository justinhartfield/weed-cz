import os
import smtplib
from email.message import EmailMessage
from flask import current_app


def send_login_email(to_email: str, login_link: str) -> None:
    settings = current_app.config.setdefault('APP_SETTINGS', None)
    if not settings:
        from .config import Settings
        settings = Settings()
        current_app.config['APP_SETTINGS'] = settings

    subject = 'Your Weed.cz login link'
    body = f"Click to sign in: {login_link}\nThis link expires in 30 minutes."

    if not settings.smtp_url:
        # Dev fallback: print to console
        print(f"[DEV EMAIL] To: {to_email}\nSubject: {subject}\n\n{body}")
        return

    # SMTP URL format: smtp://user:pass@host:port
    try:
        url = settings.smtp_url
        assert url.startswith('smtp://') or url.startswith('smtps://')
        secure = url.startswith('smtps://')
        without_scheme = url.split('://', 1)[1]
        creds, hostport = without_scheme.split('@', 1)
        if ':' in creds:
            user, password = creds.split(':', 1)
        else:
            user, password = creds, ''
        host, port = hostport.split(':', 1)
        port = int(port)

        msg = EmailMessage()
        msg['From'] = settings.email_from
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.set_content(body)

        if secure:
            with smtplib.SMTP_SSL(host, port) as s:
                if user:
                    s.login(user, password)
                s.send_message(msg)
        else:
            with smtplib.SMTP(host, port) as s:
                s.starttls()
                if user:
                    s.login(user, password)
                s.send_message(msg)
    except Exception as e:
        print('Email send failed:', e)


