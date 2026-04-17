function initParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof THREE === "undefined") return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.BufferGeometry();
    const particleCount = 900;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 18;
        positions[i + 1] = (Math.random() - 0.5) * 18;
        positions[i + 2] = (Math.random() - 0.5) * 18;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 0.03 });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    window.addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0008;
        particles.rotation.x = mouse.y * 0.08;
        particles.rotation.z = mouse.x * 0.05;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
    }
    animate();
}

function initTiltCards() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 10;
            const rotateX = (0.5 - y) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
        });
    });
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const start = Number(el.textContent) || 0;
    const steps = 24;
    const delta = (target - start) / steps;
    let count = 0;
    const timer = setInterval(() => {
        count += 1;
        const value = count >= steps ? target : Math.round(start + delta * count);
        el.textContent = value;
        if (count >= steps) clearInterval(timer);
    }, 22);
}