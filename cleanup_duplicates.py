#!/usr/bin/env python3
"""
Cleanup script to remove duplicate "Reviews Section (Moved for better SEO)" comments.
"""

import os
import re

def cleanup_file(filepath):
    """Remove duplicate comments."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove standalone duplicate comment lines
        pattern = r'\n\s*<!-- Reviews Section \(Moved for better SEO\) -->\s*\n\s*\n'
        new_content = re.sub(pattern, '\n', content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        return False
        
    except Exception as e:
        print(f"Error in {filepath}: {e}")
        return False

def main():
    root_dir = '/home/ubuntu/weed-cz'
    count = 0
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        if any(skip in dirpath for skip in ['.git', 'node_modules', 'backend', '.emergent']):
            continue
        
        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                if cleanup_file(filepath):
                    count += 1
    
    print(f"✅ Cleaned up {count} files")

if __name__ == "__main__":
    main()

