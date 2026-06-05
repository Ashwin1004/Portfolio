/* ==========================================================================
   ANIMATIONS.JS - Cinematic Loader, Scroll Highlights & SVG Skill Connections
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Initial state: freeze body scroll (released after loader exit)
    document.body.classList.add('loading');
    if (window.lenis) {
        window.lenis.stop();
    }

    // Run loaders & page animations
    initLoader();
    initAboutHighlight();
    initProjectsTimeline();
    initSkillsConnections();
    initAchievementsTimeline();
    initActiveNavHighlighting();
    initSectionTitlesReveal();
});

/* ==========================================================================
   1. CINEMATIC HORIZONTAL PROGRESS LOADER
   ========================================================================== */
function initLoader() {
    const loader = document.getElementById('loader');
    const loaderLine = document.getElementById('loaderLine');
    const loaderTitle = document.getElementById('loaderTitle');
    const loaderStatus = document.getElementById('loaderStatus');

    if (!loader || !loaderLine || !loaderTitle || !loaderStatus) return;

    // List of status messages to cycle through
    const statusMessages = [
        'Loading Backend Architecture...',
        'Loading AI Models...',
        'Loading Distributed Systems...',
        'Loading Computer Vision Engine...',
        'Loading Portfolio Experience...'
    ];

    const progressObj = { value: 0 };
    const loaderTimeline = gsap.timeline();

    // Reset initial styles
    gsap.set(loaderTitle, { opacity: 0, y: 15 });
    gsap.set(loaderStatus, { opacity: 0, y: 5 });

    // Fade in text titles
    loaderTimeline.to([loaderTitle, loaderStatus], {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out'
    });

    // Animate line loading progress & cycle messages
    loaderTimeline.to(progressObj, {
        value: 100,
        duration: 2.8,
        ease: 'power2.out',
        onUpdate: () => {
            const val = Math.round(progressObj.value);
            loaderLine.style.width = `${val}%`;

            // Calculate which message to show based on progress percentage
            const msgIndex = Math.min(
                Math.floor((val / 100) * statusMessages.length),
                statusMessages.length - 1
            );
            
            if (loaderStatus.textContent !== statusMessages[msgIndex]) {
                gsap.to(loaderStatus, {
                    opacity: 0,
                    y: -5,
                    duration: 0.15,
                    onComplete: () => {
                        loaderStatus.textContent = statusMessages[msgIndex];
                        gsap.to(loaderStatus, { opacity: 1, y: 0, duration: 0.15 });
                    }
                });
            }
        },
        onComplete: () => {
            exitLoaderSequence();
        }
    }, '+=0.2');
}

function exitLoaderSequence() {
    const loader = document.getElementById('loader');
    const loaderLineContainer = document.querySelector('.loader-line-container');
    const loaderStatus = document.getElementById('loaderStatus');
    const loaderTitle = document.getElementById('loaderTitle');

    if (!loader || !loaderTitle) return;

    const exitTimeline = gsap.timeline({
        onComplete: () => {
            loader.style.display = 'none';
            document.body.classList.remove('loading');
            if (window.lenis) window.lenis.start();
            ScrollTrigger.refresh();
        }
    });

    // 1. Hide progress bar and status subtitle quickly
    exitTimeline.to([loaderLineContainer, loaderStatus], {
        opacity: 0,
        y: 10,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.in'
    });

    // 2. Change text to "SYSTEM READY"
    exitTimeline.to(loaderTitle, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
        onComplete: () => {
            loaderTitle.textContent = 'SYSTEM READY';
            loaderTitle.style.color = 'var(--accent)';
            gsap.to(loaderTitle, { opacity: 1, scale: 1, duration: 0.3 });
        }
    });

    // 3. Hold "SYSTEM READY", then morph into "ASHWIN M S" (No dot!)
    exitTimeline.to(loaderTitle, {
        opacity: 0,
        scale: 0.9,
        delay: 0.6,
        duration: 0.3,
        onComplete: () => {
            loaderTitle.textContent = 'ASHWIN M S';
            loaderTitle.style.color = '#ffffff';
            loaderTitle.classList.add('ready-scale');
            gsap.to(loaderTitle, { opacity: 1, scale: 1, duration: 0.3 });
        }
    });

    // 4. Animate typography scaling up dramatically and fading out (Portal Zoom)
    exitTimeline.to(loaderTitle, {
        scale: 4.5,
        opacity: 0,
        delay: 0.5,
        duration: 1.0,
        ease: 'power3.inOut'
    });

    // 5. Dissolve the loading screen background
    exitTimeline.to(loader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut'
    }, '-=0.8');

    // 6. Reveal Hero section elements staggeringly
    exitTimeline.from('.hero-title span', {
        opacity: 0,
        y: 80,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out'
    }, '-=0.4');

    exitTimeline.from('.hero-tagline, .hero-actions, .hero-scroll-prompt', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
    }, '-=0.5');

    // 7. Fade in navigation header
    exitTimeline.from('.main-header', {
        opacity: 0,
        y: -20,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.6');

    // 8. Fade in particles/background canvas effects
    exitTimeline.to('.hero-bg-canvas-wrapper', {
        opacity: 0.8,
        duration: 1.5,
        ease: 'power2.out'
    }, '-=0.8');
}

/* ==========================================================================
   2. BIO / ABOUT SCROLL HIGHLIGHTING
   ========================================================================== */
function initAboutHighlight() {
    const largeText = document.querySelector('.about-large-text');
    if (!largeText) return;

    // Split text into words dynamically
    const words = largeText.innerText.split(' ');
    largeText.innerHTML = words
        .map(word => `<span class="word-highlight">${word}</span>`)
        .join(' ');

    const spans = largeText.querySelectorAll('.word-highlight');

    // Animate opacity based on scroll progress
    gsap.fromTo(spans, 
        { opacity: 0.15 },
        {
            opacity: 1,
            stagger: 0.05,
            duration: 1.0,
            scrollTrigger: {
                trigger: largeText,
                start: 'top 75%',
                end: 'bottom 50%',
                scrub: 0.5,
            }
        }
    );
}

/* ==========================================================================
   3. PROJECTS TIMELINE PROGRESS
   ========================================================================== */
function initProjectsTimeline() {
    const progressLine = document.getElementById('projectTimelineProgress');
    const events = document.querySelectorAll('.project-timeline-event');

    if (!progressLine || events.length === 0) return;

    // Animate height of progressLine
    gsap.fromTo(progressLine, 
        { height: '0%' }, 
        {
            height: '100%',
            scrollTrigger: {
                trigger: '.project-timeline-events',
                start: 'top 40%',
                end: 'bottom 70%',
                scrub: 0.8
            }
        }
    );

    // Stagger fade-in of project cards and light up dots
    events.forEach(evt => {
        const card = evt.querySelector('.project-card');
        const dot = evt.querySelector('.project-timeline-node-dot');

        gsap.from(card, {
            opacity: 0,
            x: evt.classList.contains('left') ? -50 : 50,
            duration: 0.8,
            scrollTrigger: {
                trigger: evt,
                start: 'top 75%'
            }
        });

        gsap.from(dot, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            scrollTrigger: {
                trigger: evt,
                start: 'top 75%'
            }
        });

        // Trigger active-node class when scroll reaches node
        ScrollTrigger.create({
            trigger: evt,
            start: 'top 40%',
            end: 'bottom 40%',
            onEnter: () => evt.classList.add('active-node'),
            onLeaveBack: () => evt.classList.remove('active-node'),
            onEnterBack: () => evt.classList.add('active-node'),
            onLeave: () => evt.classList.remove('active-node')
        });
    });
}

/* ==========================================================================
   4. DYNAMIC SKILLS WEB SVG CONNECTORS
   ========================================================================== */
function initSkillsConnections() {
    const universe = document.querySelector('.skills-universe');
    const svgContainer = document.getElementById('skillsConnectorSvg');
    const centerNode = document.querySelector('.skills-center');
    const skillNodes = document.querySelectorAll('.skill-node');

    if (!universe || !svgContainer || !centerNode) return;

    // Layout the nodes dynamically in a circle
    function layoutNodes() {
        if (window.innerWidth < 768) {
            // Remove absolute positioning styling on mobile to fallback to responsive CSS grid
            skillNodes.forEach(node => {
                node.style.position = '';
                node.style.left = '';
                node.style.top = '';
            });
            return;
        }

        const radius = 250; // Radius of the circle in pixels
        const angleStep = (2 * Math.PI) / skillNodes.length;

        skillNodes.forEach((node, index) => {
            const angle = index * angleStep - Math.PI / 2; // start from top center
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            
            node.style.position = 'absolute';
            node.style.left = `calc(50% + ${x}px)`;
            node.style.top = `calc(50% + ${y}px)`;
        });
    }

    function drawLines() {
        svgContainer.innerHTML = '';
        
        // Ensure nodes are positioned first
        layoutNodes();

        // Skip connection lines on mobile since they flow in grid
        if (window.innerWidth < 768) return;

        const rectUniverse = universe.getBoundingClientRect();
        const rectCenter = centerNode.getBoundingClientRect();
        
        const centerX = (rectCenter.left + rectCenter.width / 2) - rectUniverse.left;
        const centerY = (rectCenter.top + rectCenter.height / 2) - rectUniverse.top;

        skillNodes.forEach(node => {
            const rectNode = node.getBoundingClientRect();
            const nodeX = (rectNode.left + rectNode.width / 2) - rectUniverse.left;
            const nodeY = (rectNode.top + rectNode.height / 2) - rectUniverse.top;

            // Create SVG line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX);
            line.setAttribute('y1', centerY);
            line.setAttribute('x2', nodeX);
            line.setAttribute('y2', nodeY);
            line.setAttribute('class', 'skills-web-line');
            
            svgContainer.appendChild(line);

            // Synchronize line opacity/color with node hover
            node.addEventListener('mouseenter', () => {
                line.classList.add('active');
            });
            node.addEventListener('mouseleave', () => {
                line.classList.remove('active');
            });
        });
    }

    // Run initially & bind resize
    setTimeout(drawLines, 500);
    window.addEventListener('resize', drawLines);

    // Skills Section Reveal
    gsap.from(skillNodes, {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: 'back.out(1.5)',
        scrollTrigger: {
            trigger: '.skills-universe',
            start: 'top 70%'
        }
    });

    gsap.from(centerNode, {
        scale: 0,
        opacity: 0,
        duration: 1.0,
        ease: 'elastic.out(1, 0.5)',
        scrollTrigger: {
            trigger: '.skills-universe',
            start: 'top 70%'
        }
    });
}

/* ==========================================================================
   5. ACHIEVEMENTS TIMELINE PROGRESS
   ========================================================================== */
function initAchievementsTimeline() {
    const progressLine = document.getElementById('timelineProgress');
    const events = document.querySelectorAll('.timeline-event');

    if (!progressLine || events.length === 0) return;

    // Scroll path trace
    gsap.fromTo(progressLine, 
        { height: '0%' }, 
        {
            height: '100%',
            scrollTrigger: {
                trigger: '.timeline-events',
                start: 'top 40%',
                end: 'bottom 70%',
                scrub: 0.8
            }
        }
    );

    // Fade and slide events
    events.forEach(evt => {
        const content = evt.querySelector('.timeline-event-content');
        const dot = evt.querySelector('.timeline-node-dot');

        gsap.from(content, {
            opacity: 0,
            x: evt.classList.contains('left') ? -40 : 40,
            duration: 0.8,
            scrollTrigger: {
                trigger: evt,
                start: 'top 80%'
            }
        });

        gsap.from(dot, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            scrollTrigger: {
                trigger: evt,
                start: 'top 80%'
            }
        });

        // Trigger active-node class when scroll reaches node
        ScrollTrigger.create({
            trigger: evt,
            start: 'top 40%',
            end: 'bottom 40%',
            onEnter: () => evt.classList.add('active-node'),
            onLeaveBack: () => evt.classList.remove('active-node'),
            onEnterBack: () => evt.classList.add('active-node'),
            onLeave: () => evt.classList.remove('active-node')
        });
    });
}

/* ==========================================================================
   6. ACTIVE SECTION NAV HIGHLIGHTING (ScrollTrigger)
   ========================================================================== */
function initActiveNavHighlighting() {
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const id = section.getAttribute('id');
        
        ScrollTrigger.create({
            trigger: section,
            start: "top 40%",
            end: "bottom 45%",
            onToggle: self => {
                if (self.isActive) {
                    navLinks.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href === `#${id}`) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            }
        });
    });
}

/* ==========================================================================
   7. STAGGERED SECTION TITLE REVEAL (Cuberto Style)
   ========================================================================== */
function initSectionTitlesReveal() {
    const titleElements = document.querySelectorAll('.section-title, .ending-reveal-title');
    
    titleElements.forEach(title => {
        const text = title.textContent.trim();
        title.innerHTML = '';
        
        const words = text.split(' ');
        words.forEach((word, wIdx) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'title-word';
            wordSpan.style.display = 'inline-block';
            wordSpan.style.overflow = 'hidden';
            wordSpan.style.verticalAlign = 'bottom';
            
            for (let char of word) {
                const charSpan = document.createElement('span');
                charSpan.className = 'title-char';
                charSpan.style.display = 'inline-block';
                charSpan.style.transform = 'translateY(115%)';
                charSpan.style.willChange = 'transform';
                charSpan.textContent = char;
                wordSpan.appendChild(charSpan);
            }
            
            title.appendChild(wordSpan);
            
            // Add space between words
            if (wIdx < words.length - 1) {
                const space = document.createElement('span');
                space.style.display = 'inline-block';
                space.innerHTML = '&nbsp;';
                title.appendChild(space);
            }
        });
        
        // Staggered scroll trigger
        const chars = title.querySelectorAll('.title-char');
        gsap.fromTo(chars, 
            { translateY: "115%" },
            {
                translateY: "0%",
                duration: 0.95,
                ease: "power3.out",
                stagger: 0.025,
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });
}

