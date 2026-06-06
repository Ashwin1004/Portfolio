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
    initHeroCube();

    // 5. GITHUB REPOSITORIES API Showcase
    initGithubRepos();

    // 6. PROFILE AVATAR FALLBACK
    const avatarImg = document.querySelector('.profile-avatar');
    if (avatarImg) {
        avatarImg.addEventListener('error', function() {
            this.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%230a0a0c" stroke="%2300E5FF" stroke-width="2"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%2300E5FF" font-family="sans-serif" font-weight="bold" font-size="28">AMS</text></svg>`;
        });
    }
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

    // Background floating wireframe cubes (reflections)
    const bgCubes = [];
    const bgCubeCount = 4;
    for (let i = 0; i < bgCubeCount; i++) {
        bgCubes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 40 + 20,
            vx: (Math.random() - 0.5) * 0.15,
            vy: (Math.random() - 0.5) * 0.15,
            rotX: Math.random() * Math.PI,
            rotY: Math.random() * Math.PI,
            rotZ: Math.random() * Math.PI,
            rotSpeedX: (Math.random() - 0.5) * 0.005,
            rotSpeedY: (Math.random() - 0.5) * 0.005,
            opacity: Math.random() * 0.08 + 0.03
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
        ctx.lineWidth = 1;
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
   INTERACTIVE 3D HERO CUBE IMPLEMENTATION
   ========================================================================== */
function initHeroCube() {
    const canvas = document.getElementById('heroCubeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let angleX = 0.5;
    let angleY = 0.5;
    let angleZ = 0;
    
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const heroSection = document.getElementById('home');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - rect.width / 2;
            const mouseY = e.clientY - rect.top - rect.height / 2;
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;
        });
    }

    const baseSize = 130;
    const outerVertices = [
        {x: -1, y: -1, z: -1}, {x: 1, y: -1, z: -1}, {x: 1, y: 1, z: -1}, {x: -1, y: 1, z: -1},
        {x: -1, y: -1, z: 1}, {x: 1, y: -1, z: 1}, {x: 1, y: 1, z: 1}, {x: -1, y: 1, z: 1}
    ];

    const innerVertices = outerVertices.map(v => ({ x: v.x * 0.45, y: v.y * 0.45, z: v.z * 0.45 }));

    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    function rotate3D(v, ax, ay, az) {
        let cosX = Math.cos(ax), sinX = Math.sin(ax);
        let y1 = v.y * cosX - v.z * sinX;
        let z1 = v.y * sinX + v.z * cosX;

        let cosY = Math.cos(ay), sinY = Math.sin(ay);
        let x2 = v.x * cosY + z1 * sinY;
        let z2 = -v.x * sinY + z1 * cosY;

        let cosZ = Math.cos(az), sinZ = Math.sin(az);
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        return { x: x3, y: y3, z: z2 };
    }

    function animate() {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        ctx.clearRect(0, 0, rect.width, rect.height);

        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        angleX += 0.0025;
        angleY += 0.004;
        angleZ += 0.001;

        const rotX = angleX + currentY;
        const rotY = angleY + currentX;
        const rotZ = angleZ;

        const depth = 400;

        const innerRotated = innerVertices.map(v => {
            const rot = rotate3D(v, -rotX * 1.3, -rotY * 1.3, -rotZ);
            const scale = depth / (depth + rot.z * baseSize);
            return {
                x: centerX + rot.x * baseSize * scale,
                y: centerY + rot.y * baseSize * scale,
                z: rot.z
            };
        });

        const outerRotated = outerVertices.map(v => {
            const rot = rotate3D(v, rotX, rotY, rotZ);
            const scale = depth / (depth + rot.z * baseSize);
            return {
                x: centerX + rot.x * baseSize * scale,
                y: centerY + rot.y * baseSize * scale,
                z: rot.z
            };
        });

        // 1. Core energy glow
        const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 55);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
        grad.addColorStop(0.3, 'rgba(0, 229, 255, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 55, 0, Math.PI * 2);
        ctx.fill();

        // 2. Inner core cube
        edges.forEach(edge => {
            const zAvg = (innerRotated[edge[0]].z + innerRotated[edge[1]].z) / 2;
            const opacity = 0.35 - zAvg * 0.2;
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(innerRotated[edge[0]].x, innerRotated[edge[0]].y);
            ctx.lineTo(innerRotated[edge[1]].x, innerRotated[edge[1]].y);
            ctx.stroke();
        });

        // 3. Outer wireframe cube
        edges.forEach(edge => {
            const zAvg = (outerRotated[edge[0]].z + outerRotated[edge[1]].z) / 2;
            const opacity = 0.55 - zAvg * 0.3;
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
            ctx.lineWidth = 1.8 - zAvg * 0.8;
            
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(0, 229, 255, 0.4)';
            
            ctx.beginPath();
            ctx.moveTo(outerRotated[edge[0]].x, outerRotated[edge[0]].y);
            ctx.lineTo(outerRotated[edge[1]].x, outerRotated[edge[1]].y);
            ctx.stroke();
        });
        
        ctx.shadowBlur = 0;

        // 4. Outer vertices glass beads
        outerRotated.forEach(v => {
            const size = 3.5 - v.z * 1.2;
            const opacity = 0.85 - v.z * 0.25;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(v.x, v.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(v.x, v.y, size + 3, 0, Math.PI * 2);
            ctx.stroke();
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
