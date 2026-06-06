/* ==========================================================================
   MAIN.JS - Particle Canvas, GitHub Integration & UI Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. INITIALIZE LUCIDE ICONS
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. MOBILE NAVIGATION CONTROLLER
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            const isActive = mobileMenuBtn.classList.toggle('active');
            mobileNav.classList.toggle('active');
            
            if (isActive) {
                if (window.lenis) window.lenis.stop();
                document.body.classList.add('loading');
            } else {
                if (window.lenis) window.lenis.start();
                document.body.classList.remove('loading');
            }
        });

        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                if (window.lenis) window.lenis.start();
                document.body.classList.remove('loading');
            });
        });
    }



    // 4. INTERACTIVE HERO CANVAS (Neural Network)
    initHeroCanvas();

    // 5. GITHUB REPOSITORIES API Showcase
    initGithubRepos();

    // 6. PROFILE AVATAR FALLBACK
    const avatarImg = document.querySelector('.profile-avatar');
    if (avatarImg) {
        avatarImg.addEventListener('error', function() {
            this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%230a0a0c" stroke="%2300E5FF" stroke-width="2"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="28">AMS</text></svg>`;
        });
    }

    // 7. EMAIL CLICK-TO-COPY INTERACTION
    const emailBtn = document.getElementById('emailBtn');
    if (emailBtn) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'ashwinms1004@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const titleEl = emailBtn.querySelector('.channel-title');
                const originalText = titleEl.textContent;
                titleEl.textContent = 'Copied to clipboard!';
                emailBtn.style.borderColor = 'var(--accent)';
                
                setTimeout(() => {
                    titleEl.textContent = originalText;
                    emailBtn.style.borderColor = '';
                }, 2000);
            }).catch(err => {
                // Fail-safe fallback to mailto link
                window.location.href = emailBtn.getAttribute('href');
            });
        });
    }
});

/* ==========================================================================
   PARTICLE CANVAS IMPLEMENTATION
   ========================================================================== */
function initHeroCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle config
    const particles = [];
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
    const connectionDistance = 120;
    
    // Mouse coords
    let mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Create particles
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.baseRadius = this.radius;
        }

        update() {
            // Screen boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Mouse repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    
                    // Push particle away
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                    this.radius = this.baseRadius + force * 2;
                } else {
                    if (this.radius > this.baseRadius) this.radius -= 0.1;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Connect particles with gradients
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < connectionDistance) {
                    const alpha = (connectionDistance - dist) / connectionDistance * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Gradient connection line
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y, 
                        particles[j].x, particles[j].y
                    );
                    gradient.addColorStop(0, `rgba(0, 229, 255, ${alpha})`);
                    gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        drawConnections();
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   GITHUB API SHOWCASE INTEGRATION
   ========================================================================== */
function initGithubRepos() {
    const reposGrid = document.getElementById('githubReposGrid');
    if (!reposGrid) return;

    const username = 'Ashwin1004';
    // Filter conditions: exclude Ashwin1004 profile self-repo and MaddanPortfolio
    const excludedRepos = ['maddanportfolio', 'ashwin1004', 'ashwin2004'];

    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => {
            if (!response.ok) throw new Error('Network response not ok');
            return response.json();
        })
        .then(data => {
            // Update stats dynamically
            const totalReposVal = document.getElementById('github-total-repos');
            const totalStarsVal = document.getElementById('github-total-stars');
            const mostStarredVal = document.getElementById('github-most-starred');

            if (data && data.length > 0) {
                const totalRepos = data.length;
                const totalStars = data.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
                
                // Find the most starred repository
                let mostStarred = null;
                let maxStars = -1;
                data.forEach(repo => {
                    if ((repo.stargazers_count || 0) > maxStars) {
                        maxStars = repo.stargazers_count;
                        mostStarred = repo;
                    }
                });

                if (totalReposVal) totalReposVal.textContent = totalRepos;
                if (totalStarsVal) totalStarsVal.textContent = totalStars;
                if (mostStarredVal && mostStarred) {
                    mostStarredVal.textContent = mostStarred.name;
                    mostStarredVal.title = mostStarred.name;
                }
            }

            // Filter and sort by stars/updated for grid
            const filteredRepos = data
                .filter(repo => !excludedRepos.includes(repo.name.toLowerCase()))
                .slice(0, 6); // Take top 6

            if (filteredRepos.length === 0) return;

            // Clear static placeholders if we fetched successfully
            reposGrid.innerHTML = '';

            filteredRepos.forEach(repo => {
                const card = document.createElement('a');
                card.href = repo.html_url;
                card.target = '_blank';
                card.className = 'repo-card clickable';
                
                const lang = repo.language || 'Code';
                const langColorClass = getLangColorClass(lang);

                card.innerHTML = `
                    <div class="repo-header">
                        <i data-lucide="folder" class="repo-icon"></i>
                        <span class="repo-stars">
                            <i data-lucide="star" class="star-icon"></i> ${repo.stargazers_count}
                        </span>
                    </div>
                    <h3 class="repo-name">${repo.name}</h3>
                    <p class="repo-desc">${repo.description || 'No description provided. Click to inspect codebase on GitHub.'}</p>
                    <div class="repo-footer">
                        <span class="repo-lang">
                            <span class="lang-color ${langColorClass}"></span>
                            ${lang}
                        </span>
                        <span class="repo-forks">
                            <i data-lucide="git-fork" class="fork-icon"></i> ${repo.forks_count}
                        </span>
                    </div>
                `;
                reposGrid.appendChild(card);
            });

            // Re-trigger Lucide for the dynamically appended icons
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(error => {
            console.warn('GitHub API fetch failed. Showing static fallback cards.', error);
        });
}

function getLangColorClass(lang) {
    const l = lang.toLowerCase();
    if (l === 'java') return 'lang-java';
    if (l === 'javascript') return 'lang-js';
    if (l === 'python') return 'lang-python';
    if (l === 'css') return 'lang-css';
    if (l === 'html') return 'lang-html';
    return 'lang-default';
}
