#!/usr/bin/env python3
"""
Generate 200 fake reviews for weed.cz businesses with realistic Czech content.
"""

import random
import uuid
from datetime import datetime, timedelta

# Sample business IDs from weed.cz
business_ids = [
    "konopex-market", "cbdsvetcz-praha-3", "euphoria", "cannabis-store",
    "bella-hemp-praha", "greenhouse-prague", "hempa", "cbd-premium",
    "original-cbd-shop", "verasens", "canna-roomz", "breezh",
    "coffeeshop-hempo", "kratom-world-václavské-náměstí", "mrbudz-cannabis-shop",
    "bonghemia-cannabis-shop", "cbdco", "konopol-brno", "legalni-konopicz",
    "cbdsvetcz-liberec", "cbdsvetcz-ostrava", "cbdsvetcz-olomouc",
    "cbdsvetcz-chomutov", "canalogy", "kratom-world-kladno"
]

# Czech first names
first_names = [
    "Jan", "Petr", "Pavel", "Tomáš", "Martin", "Jiří", "Jakub", "Lukáš", "Michal", "David",
    "Anna", "Eva", "Marie", "Petra", "Jana", "Lenka", "Kateřina", "Lucie", "Veronika", "Hana",
    "Ondřej", "Filip", "Marek", "Vojtěch", "Adam", "Daniel", "Matěj", "Aleš", "Roman", "Radek",
    "Tereza", "Barbora", "Markéta", "Zuzana", "Monika", "Ivana", "Michaela", "Simona", "Andrea", "Kristýna"
]

# Czech last names
last_names = [
    "Novák", "Svoboda", "Novotný", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec",
    "Pokorný", "Marek", "Pospíšil", "Hájek", "Král", "Jelínek", "Růžička", "Beneš", "Fiala", "Sedláček",
    "Doležal", "Zeman", "Kolář", "Navrátil", "Čermák", "Urban", "Vaněk", "Blažek", "Kříž", "Kovář"
]

# Review titles (Czech)
review_titles = [
    "Skvělé produkty a obsluha",
    "Velmi spokojený zákazník",
    "Doporučuji všem",
    "Nejlepší CBD obchod v okolí",
    "Kvalitní sortiment",
    "Profesionální přístup",
    "Příjemné prostředí",
    "Rychlá a spolehlivá služba",
    "Výborná kvalita za dobrou cenu",
    "Perfektní zkušenost",
    "Solidní obchod",
    "Mohlo by být lepší",
    "Průměrná zkušenost",
    "Dobrý výběr produktů",
    "Milý personál",
    "Čisté a upravené",
    "Rychlé vyřízení",
    "Široký sortiment",
    "Férové ceny",
    "Příjemná atmosféra",
    "Odborné poradenství",
    "Kvalitní CBD produkty",
    "Vrátím se znovu",
    "Spokojenost",
    "Dobré zkušenosti"
]

# Review texts (Czech) - positive
positive_reviews = [
    "Navštívil jsem tento obchod poprvé a byl jsem mile překvapen. Personál je velmi vstřícný a ochotný poradit. Produkty jsou kvalitní a ceny přijatelné. Určitě se vrátím.",
    "Skvělý obchod s širokým výběrem CBD produktů. Obsluha je profesionální a dokáže poradit s výběrem. Prostředí je příjemné a čisté. Doporučuji!",
    "Už několikrát jsem zde nakupoval a vždy jsem byl spokojený. Kvalita produktů je výborná a ceny jsou férové. Personál je milý a ochotný.",
    "Tento obchod mohu jen doporučit. Mají velký výběr produktů a personál je velmi znalý. Vždy mi pomůžou vybrat to pravé.",
    "Perfektní místo pro nákup CBD produktů. Atmosféra je příjemná, personál profesionální a produkty kvalitní. Jsem velmi spokojený.",
    "Navštěvuji tento obchod pravidelně a nikdy jsem nebyl zklamán. Kvalita produktů je konzistentní a obsluha vždy příjemná.",
    "Skvělá zkušenost! Personál je velmi vstřícný a ochotný vysvětlit vše o produktech. Ceny jsou rozumné a kvalita výborná.",
    "Jeden z nejlepších CBD obchodů, které jsem navštívil. Široký sortiment, kvalitní produkty a profesionální přístup.",
    "Velmi doporučuji! Personál je znalý a ochotný poradit. Produkty jsou kvalitní a ceny přijatelné.",
    "Příjemné prostředí, milý personál a kvalitní produkty. Co víc si přát? Určitě se vrátím.",
    "Skvělý obchod s CBD produkty. Personál je velmi profesionální a vždy ochotný pomoci. Kvalita produktů je vynikající.",
    "Jsem pravidelný zákazník a mohu jen doporučit. Kvalita produktů je vždy vysoká a personál je příjemný.",
    "Perfektní místo pro nákup CBD. Široký výběr, dobré ceny a profesionální obsluha.",
    "Velmi spokojený s nákupem. Personál je znalý a ochotný poradit. Produkty jsou kvalitní.",
    "Skvělá zkušenost! Obchod je čistý, personál milý a produkty kvalitní. Doporučuji!",
]

# Review texts (Czech) - neutral/mixed
neutral_reviews = [
    "Obchod je v pořádku, ale nic extra. Personál je slušný, produkty standardní. Ceny jsou průměrné.",
    "Solidní obchod s CBD produkty. Nic špatného, ale ani nic výjimečného. Personál je v pohodě.",
    "Průměrná zkušenost. Produkty jsou v pořádku, ale výběr by mohl být širší. Personál je ochotný.",
    "Obchod je čistý a personál slušný. Ceny jsou trochu vyšší, než jsem čekal, ale kvalita je dobrá.",
    "Docela dobrý obchod. Personál je milý, ale někdy musíte chvíli čekat. Produkty jsou kvalitní.",
    "Solidní místo pro nákup CBD. Nic extra, ale splňuje účel. Personál je v pohodě.",
    "Průměrný obchod. Produkty jsou v pořádku, ale výběr by mohl být lepší. Ceny jsou standardní.",
    "Obchod je v pořádku. Personál je slušný, ale ne vždy dostupný. Produkty jsou kvalitní.",
]

# Review texts (Czech) - slightly negative
negative_reviews = [
    "Obchod je v pořádku, ale ceny jsou trochu vysoké. Personál je slušný, ale ne vždy ochotný poradit.",
    "Průměrná zkušenost. Výběr produktů by mohl být širší a ceny nižší. Personál je v pohodě.",
    "Obchod je čistý, ale personál není vždy příjemný. Produkty jsou v pořádku, ale nic extra.",
    "Očekával jsem víc. Ceny jsou vysoké a výběr není tak široký. Personál je slušný.",
]

def generate_user_data():
    """Generate fake user data."""
    user_id = str(uuid.uuid4())
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 999)}@email.cz"
    display_name = f"{first_name} {last_name[0]}."
    
    return {
        'id': user_id,
        'email': email,
        'display_name': display_name
    }

def generate_review(business_id, user_id, created_date):
    """Generate a fake review."""
    # Determine rating distribution (mostly positive)
    rating_choice = random.random()
    if rating_choice < 0.60:  # 60% 5-star
        overall_rating = 5
        review_text = random.choice(positive_reviews)
        product_quality = 5
        selection = random.choice([4, 5])
        staff = random.choice([4, 5])
        price = random.choice([4, 5])
        atmosphere = random.choice([4, 5])
    elif rating_choice < 0.85:  # 25% 4-star
        overall_rating = 4
        review_text = random.choice(positive_reviews + neutral_reviews)
        product_quality = random.choice([3, 4, 5])
        selection = random.choice([3, 4, 5])
        staff = random.choice([3, 4, 5])
        price = random.choice([3, 4])
        atmosphere = random.choice([3, 4, 5])
    elif rating_choice < 0.95:  # 10% 3-star
        overall_rating = 3
        review_text = random.choice(neutral_reviews)
        product_quality = random.choice([2, 3, 4])
        selection = random.choice([2, 3, 4])
        staff = random.choice([2, 3, 4])
        price = random.choice([2, 3])
        atmosphere = random.choice([2, 3, 4])
    else:  # 5% 2-star
        overall_rating = 2
        review_text = random.choice(negative_reviews)
        product_quality = random.choice([2, 3])
        selection = random.choice([2, 3])
        staff = random.choice([2, 3])
        price = 2
        atmosphere = random.choice([2, 3])
    
    title = random.choice(review_titles)
    helpful_count = random.randint(0, 15) if overall_rating >= 4 else random.randint(0, 3)
    
    return {
        'business_id': business_id,
        'user_id': user_id,
        'overall_rating': overall_rating,
        'title': title,
        'review_text': review_text,
        'product_quality_rating': product_quality,
        'selection_rating': selection,
        'staff_rating': staff,
        'price_rating': price,
        'atmosphere_rating': atmosphere,
        'status': 'approved',
        'helpful_count': helpful_count,
        'created_at': created_date.isoformat()
    }

def generate_sql():
    """Generate SQL INSERT statements for 200 fake reviews."""
    
    # Generate users
    users = []
    for i in range(200):
        users.append(generate_user_data())
    
    # Generate reviews with dates spread over last 12 months
    reviews = []
    start_date = datetime.now() - timedelta(days=365)
    
    for i in range(200):
        # Random date in the last 12 months
        days_ago = random.randint(0, 365)
        created_date = datetime.now() - timedelta(days=days_ago)
        
        # Random business
        business_id = random.choice(business_ids)
        
        # Use the corresponding user
        user_id = users[i]['id']
        
        review = generate_review(business_id, user_id, created_date)
        reviews.append(review)
    
    # Generate SQL
    sql = "-- Generated fake reviews for weed.cz\n"
    sql += "-- Run this in Supabase SQL Editor\n\n"
    
    # Insert users
    sql += "-- Insert fake users\n"
    for user in users:
        sql += f"INSERT INTO public.users (id, email, display_name, role, trust_score, created_at) VALUES\n"
        sql += f"('{user['id']}', '{user['email']}', '{user['display_name']}', 'user', 0.75, NOW() - INTERVAL '{random.randint(30, 365)} days')\n"
        sql += f"ON CONFLICT (id) DO NOTHING;\n\n"
    
    # Insert businesses (if they don't exist)
    sql += "\n-- Insert businesses (if they don't exist)\n"
    for business_id in set(business_ids):
        sql += f"INSERT INTO public.businesses (id, slug, name) VALUES\n"
        sql += f"('{business_id}', '{business_id}', '{business_id.replace('-', ' ').title()}')\n"
        sql += f"ON CONFLICT (id) DO NOTHING;\n\n"
    
    # Insert reviews
    sql += "\n-- Insert fake reviews\n"
    for review in reviews:
        sql += f"INSERT INTO public.reviews (business_id, user_id, overall_rating, title, review_text, "
        sql += f"product_quality_rating, selection_rating, staff_rating, price_rating, atmosphere_rating, "
        sql += f"status, helpful_count, created_at) VALUES\n"
        sql += f"('{review['business_id']}', '{review['user_id']}', {review['overall_rating']}, "
        sql += f"'{review['title']}', '{review['review_text']}', "
        sql += f"{review['product_quality_rating']}, {review['selection_rating']}, {review['staff_rating']}, "
        sql += f"{review['price_rating']}, {review['atmosphere_rating']}, "
        sql += f"'{review['status']}', {review['helpful_count']}, '{review['created_at']}');\n\n"
    
    return sql

def main():
    print("🔄 Generating 200 fake reviews...")
    sql = generate_sql()
    
    output_file = "/home/ubuntu/weed-cz/fake_reviews_200.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print(f"✅ Generated SQL file: {output_file}")
    print(f"📊 Statistics:")
    print(f"   - 200 fake users created")
    print(f"   - 200 fake reviews created")
    print(f"   - Reviews distributed across {len(business_ids)} businesses")
    print(f"   - Reviews dated from last 12 months")
    print(f"   - Rating distribution: ~60% 5-star, ~25% 4-star, ~10% 3-star, ~5% 2-star")

if __name__ == "__main__":
    main()

