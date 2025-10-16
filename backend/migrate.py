#!/usr/bin/env python3
"""
Database migration and seeding script for reviews system
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app import create_app
from db import db, Business, User
from config import Settings


def seed_businesses():
    """Seed the database with sample businesses"""
    businesses = [
        {'id': 'hempo-brno', 'slug': 'hempo-brno', 'name': 'Hempo Cannabis Shop Brno'},
        {'id': 'cbdsvet-praha', 'slug': 'cbdsvet-praha', 'name': 'CBD Svět Praha'},
        {'id': 'konotéka-online', 'slug': 'konotéka-online', 'name': 'Konotéka Online Shop'},
        {'id': 'medical-seeds-brno', 'slug': 'medical-seeds-brno', 'name': 'Medical Seeds Brno'},
        {'id': 'kratom-world-plzen', 'slug': 'kratom-world-plzen', 'name': 'Kratom World Plzeň'},
        {'id': 'legalni-konopicz-brno', 'slug': 'legalni-konopicz-brno', 'name': 'Legální Konopí.cz Brno'},
        {'id': 'bonghemia-praha', 'slug': 'bonghemia-praha', 'name': 'Bonghemia Cannabis Shop'},
        {'id': 'cbd-brno-express', 'slug': 'cbd-brno-express', 'name': 'CBD Brno Express'},
        {'id': 'cbdco-brno', 'slug': 'cbdco-brno', 'name': 'CBDco Brno'},
        {'id': 'clements-cbd-brno', 'slug': 'clements-cbd-brno', 'name': "Clements CBD Store Brno"},
    ]
    
    for biz_data in businesses:
        existing = Business.query.filter_by(id=biz_data['id']).first()
        if not existing:
            business = Business(**biz_data)
            db.session.add(business)
            print(f"Added business: {biz_data['name']}")
        else:
            print(f"Business already exists: {biz_data['name']}")
    
    db.session.commit()
    print(f"Seeded {len(businesses)} businesses")


def create_admin_user():
    """Create an admin user for moderation"""
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@weed.cz')
    admin_user = User.query.filter_by(email=admin_email).first()
    
    if not admin_user:
        admin_user = User(
            email=admin_email,
            display_name='Admin',
            role='admin',
            trust_score=1.0
        )
        db.session.add(admin_user)
        db.session.commit()
        print(f"Created admin user: {admin_email}")
    else:
        print(f"Admin user already exists: {admin_email}")


def main():
    """Run migrations and seeding"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("Database tables created.")
        
        print("Seeding businesses...")
        seed_businesses()
        
        print("Creating admin user...")
        create_admin_user()
        
        print("Migration completed successfully!")


if __name__ == '__main__':
    main()
