#!/usr/bin/env python3
"""
Script to move reviews section above rating summary section in all business detail pages.
This improves SEO by placing user-generated content higher in the HTML structure.
"""

import os
import re
from pathlib import Path

def reorder_reviews_in_file(filepath):
    """
    Reorder the reviews section to appear before the rating summary section.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if this file has both sections
        if 'rating-summary-container' not in content or 'reviews-section' not in content:
            return False, "Missing required sections"
        
        # Find the rating summary div
        rating_start = content.find('<div id="rating-summary" class="rating-summary-container">')
        if rating_start == -1:
            return False, "Could not find rating-summary div"
        
        # Find the reviews section div
        reviews_start = content.find('<div class="reviews-section">')
        if reviews_start == -1:
            return False, "Could not find reviews-section div"
        
        # Check if reviews are already before rating
        if reviews_start < rating_start:
            return False, "Reviews already before rating"
        
        # Find the end of reviews section (closing </div> after reviews-list)
        reviews_list_end = content.find('</div>', content.find('<div id="reviews-list">'))
        if reviews_list_end == -1:
            return False, "Could not find reviews-list end"
        
        # Find the actual end of reviews-section (next </div> after reviews-list)
        reviews_section_end = content.find('</div>', reviews_list_end + 6)
        if reviews_section_end == -1:
            return False, "Could not find reviews-section end"
        
        # Extract the complete reviews section
        reviews_section = content[reviews_start:reviews_section_end + 6]
        
        # Remove the reviews section from its current position
        content_without_reviews = content[:reviews_start] + content[reviews_section_end + 6:]
        
        # Find where to insert reviews (right after rating-summary div opening)
        # We want to insert it right after the rating-summary div closes
        rating_div_end = content_without_reviews.find('</div>', 
                                                       content_without_reviews.find('<div id="rating-summary"'))
        if rating_div_end == -1:
            return False, "Could not find rating-summary end"
        
        # Insert reviews section after rating summary
        insert_position = rating_div_end + 6  # After </div>
        
        # Add newlines for readability
        new_content = (content_without_reviews[:insert_position] + 
                      '\n            \n            <!-- Reviews Section (Moved for better SEO) -->\n            ' +
                      reviews_section + 
                      '\n' +
                      content_without_reviews[insert_position:])
        
        # Write the updated content back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Successfully reordered"
        
    except Exception as e:
        return False, f"Error: {str(e)}"

def find_business_pages(root_dir):
    """
    Find all business detail HTML pages in the directory structure.
    """
    business_pages = []
    
    # Look for HTML files in specific directories
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip certain directories
        if any(skip in dirpath for skip in ['.git', 'node_modules', 'backend', '.emergent']):
            continue
        
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                
                # Check if it's a business detail page (has rating-summary-container)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if 'rating-summary-container' in content and 'reviews-section' in content:
                            business_pages.append(filepath)
                except:
                    pass
    
    return business_pages

def main():
    """
    Main function to process all business pages.
    """
    root_dir = '/home/ubuntu/weed-cz'
    
    print("🔍 Finding business detail pages...")
    business_pages = find_business_pages(root_dir)
    
    print(f"📄 Found {len(business_pages)} business detail pages")
    print()
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for filepath in business_pages:
        relative_path = os.path.relpath(filepath, root_dir)
        success, message = reorder_reviews_in_file(filepath)
        
        if success:
            print(f"✅ {relative_path}")
            success_count += 1
        elif "already before" in message:
            print(f"⏭️  {relative_path}: Already correct")
            skip_count += 1
        else:
            print(f"❌ {relative_path}: {message}")
            error_count += 1
    
    print()
    print("=" * 60)
    print(f"📊 Summary:")
    print(f"   ✅ Successfully updated: {success_count}")
    print(f"   ⏭️  Already correct: {skip_count}")
    print(f"   ❌ Errors: {error_count}")
    print(f"   📄 Total processed: {len(business_pages)}")
    print("=" * 60)
    
    if success_count > 0:
        print()
        print("✨ SEO Improvement: Reviews now appear before rating stars!")
        print("   This places user-generated content higher in the HTML structure,")
        print("   which is better for search engine crawlers and indexing.")

if __name__ == "__main__":
    main()

