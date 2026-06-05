/* ==========================================================================
   CURSOR.JS - Custom Interactive Cursor & Magnetic Hover Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT CURSOR ELEMENTS
    const cursor = document.getElementById('customCursor');
    const dot = cursor.querySelector('.cursor-dot');
    const circle = cursor.querySelector('.cursor-circle');
    const cursorText = cursor.querySelector('.cursor-text');
    const mouseGlow = document.getElementById('mouseGlow');
    
    // Hide custom cursor on actual touch interaction to prevent double cursors, without breaking mouse input on hybrid laptops
    window.addEventListener('touchstart', () => {
        document.body.classList.remove('mouse-active');
        gsap.set([dot, circle, mouseGlow], { opacity: 0 });
    }, { passive: true });

    // Coordinate variables
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Actual cursor position (interpolated)
    let dotX = mouseX;
    let dotY = mouseY;
    let circleX = mouseX;
    let circleY = mouseY;

    // Glow positions
    let glowX = mouseX;
    let glowY = mouseY;

    // 2. COORDINATE TRACKER
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Activate glow and custom cursor on initial movement
        if (!document.body.classList.contains('mouse-active')) {
            document.body.classList.add('mouse-active');
            gsap.set([dot, circle, mouseGlow], { opacity: 1 });
        }
    });

    // Hide cursor when leaving viewport
    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('mouse-active');
        gsap.to([dot, circle, mouseGlow], { opacity: 0, duration: 0.3 });
    });

    // Show cursor when entering viewport
    document.addEventListener('mouseenter', () => {
        document.body.classList.add('mouse-active');
        gsap.to([dot, circle, mouseGlow], { opacity: 1, duration: 0.3 });
    });

    // 3. SMOOTH INTERPOLATION LOOP (GSAP Ticker)
    gsap.ticker.add(() => {
        // Linear interpolation formula: current + (target - current) * speed
        // Speed parameters: dot is fast (0.2), circle has lag (0.08)
        dotX += (mouseX - dotX) * 0.25;
        dotY += (mouseY - dotY) * 0.25;
        circleX += (mouseX - circleX) * 0.12;
        circleY += (mouseY - circleY) * 0.12;
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;

        // Apply transforms using fast GSAP setters
        gsap.set(dot, { x: dotX, y: dotY });
        gsap.set(circle, { x: circleX, y: circleY });
        gsap.set(mouseGlow, { x: glowX, y: glowY });
    });

    // 4. INTERACTION DETECTORS & STATES
    
    // Helper to bind hover listeners
    const setupHoverSelectors = (selector, bodyClass, customText = '') => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                document.body.classList.add(bodyClass);
                if (customText) {
                    cursorText.textContent = customText;
                }
            });
            element.addEventListener('mouseleave', () => {
                document.body.classList.remove(bodyClass);
                if (customText) {
                    cursorText.textContent = '';
                }
            });
        });
    };

    // Standard Nav links, secondary buttons
    setupHoverSelectors('a:not(.nav-link), button, .clickable:not(.nav-link)', 'hovering-link');
    
    // Main Nav links (Cuberto 'GO' style)
    setupHoverSelectors('.main-nav .nav-link', 'hovering-nav', 'GO');
    
    // Primary / Accent buttons
    setupHoverSelectors('.btn-primary, .btn-outline-glow, .skills-center', 'hovering-accent');
    
    // Projects (standard)
    setupHoverSelectors('.project-item:not(.flagship)', 'hovering-project', 'VIEW CASE');
    
    // Flagship Project
    setupHoverSelectors('.project-item.flagship', 'hovering-flagship', 'EXPLORE');

    // 5. MAGNETIC BUTTONS LOGIC
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(element => {
        const strength = parseFloat(element.getAttribute('data-strength')) || 20;
        
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            // Calculate mouse position relative to the center of the element
            const elementCenterX = rect.left + rect.width / 2;
            const elementCenterY = rect.top + rect.height / 2;
            
            // Mouse distance from center
            const deltaX = e.clientX - elementCenterX;
            const deltaY = e.clientY - elementCenterY;
            
            // Pull coordinates
            const pullX = (deltaX / (rect.width / 2)) * strength;
            const pullY = (deltaY / (rect.height / 2)) * strength;
            
            // Animate element towards cursor
            gsap.to(element, {
                x: pullX,
                y: pullY,
                duration: 0.3,
                ease: 'power2.out'
            });
            
            // Slightly pull the inner span text for double depth (layering)
            const innerSpan = element.querySelector('span');
            if (innerSpan) {
                gsap.to(innerSpan, {
                    x: pullX * 0.4,
                    y: pullY * 0.4,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        });
        
        element.addEventListener('mouseleave', () => {
            // Reset position with an elastic bounce
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.4)'
            });
            
            const innerSpan = element.querySelector('span');
            if (innerSpan) {
                gsap.to(innerSpan, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.4)'
                });
            }
        });
    });
});
