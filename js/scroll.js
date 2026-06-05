/* ==========================================================================
   SCROLL.JS - Lenis Smooth Scroll & GSAP ScrollTrigger Integration
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE LENIS SMOOTH SCROLL
    const lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing curve
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Make instance globally accessible
    window.lenis = lenisInstance;

    // 2. INTEGRATE LENIS WITH GSAP SCROLLTRIGGER
    lenisInstance.on('scroll', () => {
        ScrollTrigger.update();
    });

    // Use GSAP's ticker to drive Lenis updates
    gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
    });

    // Disable lag smoothing to prevent syncing hiccups
    gsap.ticker.lagSmoothing(0);

    // 3. ANCHOR LINK INTERPOLATION
    // Overriding standard jump scrolling to use Lenis smooth scrollTo API
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // If mobile menu was open, close it
                const mobileMenuBtn = document.getElementById('mobileMenuBtn');
                const mobileNav = document.getElementById('mobileNav');
                if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                    mobileMenuBtn.classList.remove('active');
                    mobileNav.classList.remove('active');
                    window.lenis.start();
                }
                
                // Smooth scroll to target
                window.lenis.scrollTo(targetElement, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });
});
