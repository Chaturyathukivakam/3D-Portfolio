/**
 * Three.js 3D Interactive Scene - Neural Network Data Globe
 * High-performance, WebGL-accelerated 3D object for Thukivakam Chaturya's Portfolio
 */

(function () {
    'use strict';

    const container = document.getElementById('three-hero-container');
    if (!container) return;

    // Check WebGL availability
    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    if (!isWebGLAvailable()) {
        container.classList.add('no-webgl');
        return;
    }

    // Scene variables
    let scene, camera, renderer;
    let globeGroup, coreMesh, outerHaloMesh;
    let nodesMesh, linesMesh;
    let ambientParticles;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let isDragging = false, prevMouseX = 0, prevMouseY = 0;
    let isVisible = true;
    let animationFrameId;

    // Configuration
    const NODE_COUNT = 90;
    const RADIUS = 3.2;
    const MAX_DISTANCE = 1.6;

    function init() {
        const width = container.clientWidth || window.innerWidth;
        const height = container.clientHeight || window.innerHeight;

        // 1. Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x070a13, 0.05);

        // 2. Camera
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.z = 7.5;

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // 4. Lighting
        const ambientLight = new THREE.AmbientLight(0x818cf8, 0.8);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x6366f1, 3, 20);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x38bdf8, 2.5, 20);
        pointLight2.position.set(-5, -3, 3);
        scene.add(pointLight2);

        // 5. Main Globe Group
        globeGroup = new THREE.Group();
        scene.add(globeGroup);

        buildNeuralGlobe();
        buildCoreGeometry();
        buildAmbientDust();

        // 6. Event Listeners
        window.addEventListener('resize', onWindowResize, false);
        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mousedown', onMouseDown, false);
        window.addEventListener('mouseup', onMouseUp, false);
        window.addEventListener('mousemove', onMouseDrag, false);

        // Touch support
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, false);

        // Page visibility optimization
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
            if (isVisible) animate();
        });

        // Start animation loop
        animate();
    }

    function buildNeuralGlobe() {
        const nodePositions = [];
        const nodeColors = [];
        const nodesData = [];

        // Color palette: Indigo (#6366f1), Cyan (#38bdf8), Violet (#a855f7)
        const palette = [
            new THREE.Color(0x6366f1),
            new THREE.Color(0x38bdf8),
            new THREE.Color(0xa855f7),
            new THREE.Color(0x818cf8)
        ];

        // Generate Fibonacci sphere points for uniform distribution
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < NODE_COUNT; i++) {
            const theta = 2 * Math.PI * i / goldenRatio;
            const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
            const r = RADIUS + (Math.random() - 0.5) * 0.4;

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            nodePositions.push(x, y, z);

            const col = palette[i % palette.length];
            nodeColors.push(col.r, col.g, col.b);

            nodesData.push({
                origX: x, origY: y, origZ: z,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.5
            });
        }

        // Point cloud for nodes
        const nodesGeometry = new THREE.BufferGeometry();
        nodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
        nodesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nodeColors, 3));

        // Create glowing node texture via canvas
        const nodeCanvas = document.createElement('canvas');
        nodeCanvas.width = 64;
        nodeCanvas.height = 64;
        const ctx = nodeCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(99, 102, 241, 0.9)');
        gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const nodeTexture = new THREE.CanvasTexture(nodeCanvas);

        const nodesMaterial = new THREE.PointsMaterial({
            size: 0.22,
            vertexColors: true,
            map: nodeTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
        globeGroup.add(nodesMesh);

        // Build Synaptic Connection Lines
        updateConnections(nodePositions);
    }

    function updateConnections(positions) {
        const linePositions = [];
        const lineColors = [];
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
            const x1 = positions[i * 3];
            const y1 = positions[i * 3 + 1];
            const z1 = positions[i * 3 + 2];

            for (let j = i + 1; j < count; j++) {
                const x2 = positions[j * 3];
                const y2 = positions[j * 3 + 1];
                const z2 = positions[j * 3 + 2];

                const dx = x1 - x2;
                const dy = y1 - y2;
                const dz = z1 - z2;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < MAX_DISTANCE) {
                    linePositions.push(x1, y1, z1);
                    linePositions.push(x2, y2, z2);

                    const alpha = Math.max(0.1, 1 - dist / MAX_DISTANCE);
                    lineColors.push(0.39, 0.40, 0.95 * alpha);
                    lineColors.push(0.22, 0.74 * alpha, 0.97 * alpha);
                }
            }
        }

        const linesGeometry = new THREE.BufferGeometry();
        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        linesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        const linesMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending
        });

        if (linesMesh) globeGroup.remove(linesMesh);
        linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
        globeGroup.add(linesMesh);
    }

    function buildCoreGeometry() {
        // Holographic wireframe icosahedron inside
        const coreGeo = new THREE.IcosahedronGeometry(2.0, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x6366f1,
            wireframe: true,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        coreMesh = new THREE.Mesh(coreGeo, coreMat);
        globeGroup.add(coreMesh);

        // Outer atmospheric energy ring
        const ringGeo = new THREE.TorusGeometry(3.6, 0.02, 16, 100);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        outerHaloMesh = new THREE.Mesh(ringGeo, ringMat);
        outerHaloMesh.rotation.x = Math.PI / 3;
        globeGroup.add(outerHaloMesh);
    }

    function buildAmbientDust() {
        const dustCount = 200;
        const dustGeo = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < dustCount; i++) {
            const radius = 4.0 + Math.random() * 5.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }

        dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const dustMat = new THREE.PointsMaterial({
            size: 0.06,
            color: 0xa5b4fc,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });

        ambientParticles = new THREE.Points(dustGeo, dustMat);
        scene.add(ambientParticles);
    }

    // Mouse & Touch Interactivity
    function onMouseMove(e) {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY = mouseX * 0.45;
        targetRotationX = -mouseY * 0.35;
    }

    function onMouseDown(e) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onMouseDrag(e) {
        if (!isDragging) return;
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;
    }

    function onTouchStart(e) {
        if (e.touches.length === 1) {
            isDragging = true;
            prevMouseX = e.touches[0].clientX;
            prevMouseY = e.touches[0].clientY;
        }
    }

    function onTouchMove(e) {
        if (isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - prevMouseX;
            const deltaY = e.touches[0].clientY - prevMouseY;
            prevMouseX = e.touches[0].clientX;
            prevMouseY = e.touches[0].clientY;

            globeGroup.rotation.y += deltaX * 0.008;
            globeGroup.rotation.x += deltaY * 0.008;
        }
    }

    function onTouchEnd() {
        isDragging = false;
    }

    function onWindowResize() {
        if (!container || !renderer || !camera) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        if (!isVisible) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Autonomous smooth rotation
        if (!isDragging) {
            globeGroup.rotation.y += 0.003;
            globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.04;
            globeGroup.rotation.y += (targetRotationY - (globeGroup.rotation.y % (Math.PI * 2))) * 0.02;
        }

        // Counter-rotation of core and halo
        if (coreMesh) {
            coreMesh.rotation.x = -elapsedTime * 0.08;
            coreMesh.rotation.y = elapsedTime * 0.12;
        }

        if (outerHaloMesh) {
            outerHaloMesh.rotation.z = elapsedTime * 0.15;
            outerHaloMesh.rotation.y = Math.sin(elapsedTime * 0.3) * 0.2;
        }

        if (ambientParticles) {
            ambientParticles.rotation.y = -elapsedTime * 0.02;
            ambientParticles.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
        }

        renderer.render(scene, camera);
    }

    // Initializer when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
