/* ==========================================================================
   CUBENAVIGATION.JS - 3D Cube Navigation Controller (Three.js + GSAP)
   ========================================================================== */

let cubeScene, cubeCamera, cubeRenderer, cubeMesh, cubeEdges;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0.5, y: 0.5 };
let currentRotation = { x: 0.5, y: 0.5 };
let velocity = { x: 0.005, y: 0.005 };
let activeSection = 'HOME';
let isZoomedIn = false;
let raycaster, mouseVector;

// Map of faces and their target rotations to face the camera
const cubeFaces = [
    { name: 'HOME', localNormal: new THREE.Vector3(0, 0, 1), rotX: 0, rotY: 0 },
    { name: 'ABOUT', localNormal: new THREE.Vector3(1, 0, 0), rotX: 0, rotY: -Math.PI / 2 },
    { name: 'PROJECTS', localNormal: new THREE.Vector3(-1, 0, 0), rotX: 0, rotY: Math.PI / 2 },
    { name: 'SKILLS', localNormal: new THREE.Vector3(0, 1, 0), rotX: -Math.PI / 2, rotY: 0 },
    { name: 'ACHIEVEMENTS', localNormal: new THREE.Vector3(0, -1, 0), rotX: Math.PI / 2, rotY: 0 },
    { name: 'CONTACT', localNormal: new THREE.Vector3(0, 0, -1), rotX: 0, rotY: Math.PI }
];

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded.');
        return;
    }
    
    initCubeNav();
    setupNavButtonBinds();
});

function initCubeNav() {
    const container = document.getElementById('cubeNavContainer');
    if (!container) return;

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'cubeNavCanvas';
    container.appendChild(canvas);

    // 1. SCENE & CAMERA SETUP
    cubeScene = new THREE.Scene();
    
    cubeCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    cubeCamera.position.z = 8; // Zoomed out by default

    // 2. RENDERER SETUP
    cubeRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    cubeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cubeRenderer.setSize(container.clientWidth, container.clientHeight);
    cubeRenderer.shadowMap.enabled = true;

    // 3. LIGHTS SETUP (Cyan & Blue tech lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    cubeScene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.2);
    dirLight1.position.set(5, 5, 5);
    cubeScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0088ff, 0.8);
    dirLight2.position.set(-5, -5, 5);
    cubeScene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00e5ff, 1, 15);
    pointLight.position.set(0, 0, 0);
    cubeScene.add(pointLight);

    // 4. CUBE GEOMETRY & MATERIALS
    const geometry = new THREE.BoxGeometry(2.4, 2.4, 2.4);

    // Create canvas-based textures for the 6 faces
    const materials = [
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('ABOUT'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 }), // Right
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('PROJECTS'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 }), // Left
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('SKILLS'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 }), // Top
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('ACHIEVEMENTS'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 }), // Bottom
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('HOME'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 }), // Front
        new THREE.MeshPhysicalMaterial({ map: createFaceTexture('CONTACT'), roughness: 0.1, metalness: 0.1, transmission: 0.6, transparent: true, opacity: 0.85 })  // Back
    ];

    cubeMesh = new THREE.Mesh(geometry, materials);
    cubeScene.add(cubeMesh);

    // 5. GLOWING CYAN EDGES
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    cubeEdges = new THREE.LineSegments(
        edgesGeometry,
        new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2.5 })
    );
    cubeMesh.add(cubeEdges);

    // Initial rotation
    cubeMesh.rotation.x = currentRotation.x;
    cubeMesh.rotation.y = currentRotation.y;

    // 6. RAYCASTER & INTERACTION SETUP
    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    // Event Listeners
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);

    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animateCube();
}

// Draw high-tech canvas textures for cube faces
function createFaceTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    // Glass backdrop highlight
    ctx.fillStyle = 'rgba(0, 15, 30, 0.4)';
    ctx.fillRect(16, 16, 480, 480);

    // Cyan border frame
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
    ctx.lineWidth = 6;
    ctx.strokeRect(32, 32, 448, 448);

    // Outer ticks
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 80); ctx.lineTo(80, 80); ctx.lineTo(80, 50);
    ctx.moveTo(462, 80); ctx.lineTo(432, 80); ctx.lineTo(432, 50);
    ctx.moveTo(50, 432); ctx.lineTo(80, 432); ctx.lineTo(80, 462);
    ctx.moveTo(462, 432); ctx.lineTo(432, 432); ctx.lineTo(432, 462);
    ctx.stroke();

    // Center text label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 50px Syne';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
    ctx.shadowBlur = 12;
    ctx.fillText(text, 256, 256);

    // Text decoration ticks
    ctx.font = '600 16px Plus Jakarta Sans';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.fillText('• CORE MODULE •', 256, 320);

    return new THREE.CanvasTexture(canvas);
}

// 7. DRAG, ROTATION & INTERACTION MATH
function onMouseDown(e) {
    if (isZoomedIn) return;
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    velocity = { x: 0, y: 0 };
}

function onTouchStart(e) {
    if (isZoomedIn) return;
    isDragging = true;
    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    velocity = { x: 0, y: 0 };
}

function onMouseMove(e) {
    updateMousePointer(e.clientX, e.clientY);

    if (!isDragging) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    targetRotation.y += deltaMove.x * 0.005;
    targetRotation.x += deltaMove.y * 0.005;

    velocity = {
        x: deltaMove.x * 0.005,
        y: deltaMove.y * 0.005
    };

    previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onTouchMove(e) {
    if (!isDragging) return;

    const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
    };

    targetRotation.y += deltaMove.x * 0.005;
    targetRotation.x += deltaMove.y * 0.005;

    velocity = {
        x: deltaMove.x * 0.005,
        y: deltaMove.y * 0.005
    };

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    
    // Snap to the closest face if drag velocity is low
    if (Math.hypot(velocity.x, velocity.y) < 0.008) {
        snapToClosestFace();
    }
}

function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    snapToClosestFace();
}

function updateMousePointer(clientX, clientY) {
    const container = document.getElementById('cubeNavContainer');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    mouseVector.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouseVector.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

    // Check intersection
    raycaster.setFromCamera(mouseVector, cubeCamera);
    const intersects = raycaster.intersectObject(cubeMesh);

    if (intersects.length > 0 && !isZoomedIn) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = '';
    }
}

// Find face pointing directly towards screen
function snapToClosestFace() {
    let closestFace = cubeFaces[0];
    let maxZ = -Infinity;

    cubeFaces.forEach(face => {
        // Transform face local normal to world space based on current cube rotation
        const worldNormal = face.localNormal.clone().applyQuaternion(cubeMesh.quaternion);
        if (worldNormal.z > maxZ) {
            maxZ = worldNormal.z;
            closestFace = face;
        }
    });

    rotateToFace(closestFace.name);
}

function rotateToFace(faceName) {
    const face = cubeFaces.find(f => f.name === faceName);
    if (!face) return;

    activeSection = faceName;

    // Disable dragging during transition
    isDragging = false;

    // Animate rotation using GSAP
    gsap.to(cubeMesh.rotation, {
        x: face.rotX,
        y: face.rotY,
        z: 0,
        duration: 1.0,
        ease: 'power2.out',
        onComplete: () => {
            currentRotation.x = face.rotX;
            currentRotation.y = face.rotY;
            targetRotation.x = face.rotX;
            targetRotation.y = face.rotY;
            
            // Trigger zoom and section reveal
            enterSection(faceName);
        }
    });
}

// Camera zoom and section reveal animation
function enterSection(sectionId) {
    isZoomedIn = true;

    // Hide drag indicator
    gsap.to('.cube-drag-indicator', { opacity: 0, duration: 0.3 });

    // Show back button
    const backBtn = document.getElementById('backToNavBtn');
    if (backBtn) {
        gsap.to(backBtn, { opacity: 1, pointerEvents: 'all', duration: 0.4, y: 0 });
    }

    // Zoom camera into face
    gsap.to(cubeCamera.position, {
        z: 2.8,
        duration: 1.2,
        ease: 'power3.inOut'
    });

    // Fade the cube slightly into background to keep overlay readable
    gsap.to(cubeMesh.material, {
        opacity: 0.25,
        stagger: 0.05,
        duration: 1.2
    });
    
    gsap.to(cubeEdges.material, {
        opacity: 0.3,
        duration: 1.2
    });

    // Reveal corresponding HTML section overlay
    const section = document.getElementById(sectionId.toLowerCase());
    if (section) {
        // Remove active class from all other sections
        document.querySelectorAll('section').forEach(s => {
            s.classList.remove('active');
            gsap.set(s, { pointerEvents: 'none', opacity: 0 });
        });

        section.classList.add('active');
        gsap.to(section, {
            opacity: 1,
            pointerEvents: 'all',
            duration: 0.8,
            delay: 0.3,
            ease: 'power2.out'
        });
        
        // Stagger reveal active content cards or inner title elements
        const card = section.querySelector('.project-card, .education-card, .skills-universe, .achievements-container, .contact-content');
        if (card) {
            gsap.fromTo(card, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' }
            );
        }
    }

    // Synchronize Header Nav links active state
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${sectionId.toLowerCase()}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Zoom out back to navigation mode
function exitToNavigation() {
    if (!isZoomedIn) return;

    // Hide back button
    const backBtn = document.getElementById('backToNavBtn');
    if (backBtn) {
        gsap.to(backBtn, { opacity: 0, pointerEvents: 'none', duration: 0.3, y: -20 });
    }

    // Fade out active section
    const activeSecElement = document.querySelector('section.active');
    if (activeSecElement) {
        gsap.to(activeSecElement, {
            opacity: 0,
            pointerEvents: 'none',
            duration: 0.5,
            onComplete: () => {
                activeSecElement.classList.remove('active');
            }
        });
    }

    // Zoom camera back out
    gsap.to(cubeCamera.position, {
        z: 8,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
            isZoomedIn = false;
        }
    });

    // Restore cube opacity/sheen
    gsap.to(cubeMesh.material, {
        opacity: 0.85,
        stagger: 0.05,
        duration: 1.2
    });
    
    gsap.to(cubeEdges.material, {
        opacity: 1,
        duration: 1.2
    });

    // Show drag indicator
    gsap.to('.cube-drag-indicator', { opacity: 0.8, duration: 0.5 });
}

// Binds click handlers to Header Nav and Floating Back button
function setupNavButtonBinds() {
    // Header links and mobile links navigation
    const navLinks = document.querySelectorAll('.main-nav .nav-link, .mobile-links .mobile-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close mobile menu if open
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const mobileNav = document.getElementById('mobileNav');
            if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                mobileNav.classList.remove('active');
            }

            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const faceName = href.substring(1).toUpperCase();
                
                if (isZoomedIn) {
                    // Quick fadeout of current active section
                    const activeSec = document.querySelector('section.active');
                    if (activeSec) {
                        gsap.to(activeSec, { opacity: 0, duration: 0.3 });
                    }
                    
                    // Rotate and enter new face
                    rotateToFace(faceName);
                } else {
                    rotateToFace(faceName);
                }
            }
        });
    });

    // Back to navigation button click listener
    const backBtn = document.getElementById('backToNavBtn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exitToNavigation();
        });
    }

    // Setup raycaster face clicking
    const container = document.getElementById('cubeNavContainer');
    if (container) {
        container.addEventListener('click', (e) => {
            if (isZoomedIn) return;
            
            raycaster.setFromCamera(mouseVector, cubeCamera);
            const intersects = raycaster.intersectObject(cubeMesh);

            if (intersects.length > 0) {
                const faceIndex = intersects[0].face.materialIndex;
                
                // Map material index to face name
                // materials array order: Right (0: ABOUT), Left (1: PROJECTS), Top (2: SKILLS), Bottom (3: ACHIEVEMENTS), Front (4: HOME), Back (5: CONTACT)
                const faceIndexMap = ['ABOUT', 'PROJECTS', 'SKILLS', 'ACHIEVEMENTS', 'HOME', 'CONTACT'];
                const clickedFace = faceIndexMap[faceIndex];
                
                if (clickedFace) {
                    rotateToFace(clickedFace);
                }
            }
        });
    }
}

// 8. RENDER LOOP
function animateCube() {
    if (!isZoomedIn && !isDragging) {
        // Slow auto rotation / momentum decay
        targetRotation.y += 0.002;
        targetRotation.x += 0.001;
    }

    // Interpolate current rotation towards target
    if (!isDragging) {
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
    } else {
        currentRotation.y = targetRotation.y;
        currentRotation.x = targetRotation.x;
    }

    if (cubeMesh) {
        cubeMesh.rotation.y = currentRotation.y;
        cubeMesh.rotation.x = currentRotation.x;
    }

    cubeRenderer.render(cubeScene, cubeCamera);
    requestAnimationFrame(animateCube);
}

function onWindowResize() {
    const container = document.getElementById('cubeNavContainer');
    if (!container) return;

    cubeCamera.aspect = container.clientWidth / container.clientHeight;
    cubeCamera.updateProjectionMatrix();

    cubeRenderer.setSize(container.clientWidth, container.clientHeight);
}
