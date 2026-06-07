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



    // 4. INTERACTIVE HERO CANVAS (Neural Grid & Reflections)
    initHeroCanvas();

    // 5. GITHUB REPOSITORIES API Showcase
    initGithubRepos();

    // 6. PROFILE AVATAR FALLBACK
    const avatars = document.querySelectorAll('.profile-avatar, .hero-photo');
    avatars.forEach(avatarImg => {
        avatarImg.addEventListener('error', function() {
            this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%230a0a0c" stroke="%2300E5FF" stroke-width="2"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="28">AMS</text></svg>`;
        });
    });
});

/* ==========================================================================
   PARTICLE CANVAS IMPLEMENTATION (Modern Neural Grid & Reflections)
   ========================================================================== */
function initHeroCanvas() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resizeCanvas() {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse coordinates for parallax
    let mouse = { x: canvas.width / 2, y: canvas.height / 2, targetX: canvas.width / 2, targetY: canvas.height / 2 };
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
    });

    // Background floating particles
    const particles = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.3 + 0.1
        });
    }

    // Background floating wireframe cubes (reflections)
    const bgCubes = [];
    const bgCubeCount = 3;
    for (let i = 0; i < bgCubeCount; i++) {
        bgCubes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 30 + 20,
            vx: (Math.random() - 0.5) * 0.08,
            vy: (Math.random() - 0.5) * 0.08,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            rotSpeedX: (Math.random() - 0.5) * 0.002,
            rotSpeedY: (Math.random() - 0.5) * 0.002,
            opacity: Math.random() * 0.02 + 0.01
        });
    }

    function rotate3D(x, y, z, ax, ay, az) {
        // Rotate X
        let cosX = Math.cos(ax), sinX = Math.sin(ax);
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotate Y
        let cosY = Math.cos(ay), sinY = Math.sin(ay);
        let x2 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;

        // Rotate Z
        let cosZ = Math.cos(az), sinZ = Math.sin(az);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        return { x: x3, y: y3, z: z2 };
    }

    function drawBGCube(c) {
        const vertices = [
            {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1}, {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
            {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1}, {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
        ];
        const projected = [];
        const edges = [
            [0, 1], [1, 2], [2, 3], [3, 0],
            [4, 5], [5, 6], [6, 7], [7, 4],
            [0, 4], [1, 5], [2, 6], [3, 7]
        ];

        vertices.forEach(v => {
            const rot = rotate3D(v.x * c.size, v.y * c.size, v.z * c.size, c.rotX, c.rotY, c.rotZ);
            const depth = 300;
            const scale = depth / (depth + rot.z);
            projected.push({
                x: c.x + rot.x * scale,
                y: c.y + rot.y * scale
            });
        });

        ctx.strokeStyle = `rgba(0, 229, 255, ${c.opacity})`;
        ctx.lineWidth = 0.5;
        edges.forEach(edge => {
            ctx.beginPath();
            ctx.moveTo(projected[edge[0]].x, projected[edge[0]].y);
            ctx.lineTo(projected[edge[1]].x, projected[edge[1]].y);
            ctx.stroke();
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Radial backdrop glow
        const grad = ctx.createRadialGradient(
            mouse.x, mouse.y, 10,
            mouse.x, mouse.y, Math.max(canvas.width, canvas.height) * 0.6
        );
        grad.addColorStop(0, 'rgba(0, 40, 80, 0.15)');
        grad.addColorStop(0.5, 'rgba(0, 10, 25, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Tech layout grid
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
        ctx.lineWidth = 0.5;
        const spacing = 70;
        const offsetX = (mouse.x - canvas.width / 2) * 0.04;
        const offsetY = (mouse.y - canvas.height / 2) * 0.04;

        for (let x = offsetX % spacing; x < canvas.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = offsetY % spacing; y < canvas.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Drifting particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Drifting cubes
        bgCubes.forEach(c => {
            c.x += c.vx;
            c.y += c.vy;
            c.rotX += c.rotSpeedX;
            c.rotY += c.rotSpeedY;

            if (c.x < -c.size * 2) c.x = canvas.width + c.size * 2;
            if (c.x > canvas.width + c.size * 2) c.x = -c.size * 2;
            if (c.y < -c.size * 2) c.y = canvas.height + c.size * 2;
            if (c.y > canvas.height + c.size * 2) c.y = -c.size * 2;

            drawBGCube(c);
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
    });
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
