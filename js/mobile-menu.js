// Mobile hamburger menu functionality

document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button if it doesn't exist
    const nav = document.querySelector('nav .nav-container');
    if (!nav) return;
    
    const navLinks = nav.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Check if mobile toggle already exists
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    // Create mobile menu toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'mobile-menu-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.innerHTML = `
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
    `;
    
    // Insert toggle button before nav links
    nav.insertBefore(toggleButton, navLinks);
    
    // Toggle menu on button click
    toggleButton.addEventListener('click', function() {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        
        toggleButton.setAttribute('aria-expanded', !isExpanded);
        toggleButton.classList.toggle('active');
        navLinks.classList.toggle('mobile-active');
        
        // Prevent body scroll when menu is open
        if (!isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && navLinks.classList.contains('mobile-active')) {
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.classList.remove('active');
            navLinks.classList.remove('mobile-active');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('mobile-active')) {
            toggleButton.setAttribute('aria-expanded', 'false');
            toggleButton.classList.remove('active');
            navLinks.classList.remove('mobile-active');
            document.body.style.overflow = '';
        }
    });
});

