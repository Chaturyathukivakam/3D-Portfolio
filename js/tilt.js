/**
 * 3D Tilt Effect & Dynamic Specular Sheen Engine
 * Provides authentic hardware-accelerated 3D perspective to skill, project, and certification cards
 */

(function () {
    'use strict';

    // Global cursor glow tracker
    function initCursorGlow() {
        if (window.matchMedia('(hover: none)').matches) return; // Skip on touch devices

        const glowEl = document.createElement('div');
        glowEl.className = 'cursor-ambient-glow';
        document.body.appendChild(glowEl);

        let mouseX = -500, mouseY = -500;
        let currentX = -500, currentY = -500;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateGlow() {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
            glowEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            requestAnimationFrame(updateGlow);
        }
        updateGlow();
    }

    // 3D Card Tilt Engine
    function initTiltCards() {
        const tiltElements = document.querySelectorAll('[data-tilt]');

        tiltElements.forEach((card) => {
            // Create sheen layer if not exists
            let sheen = card.querySelector('.card-sheen');
            if (!sheen) {
                sheen = document.createElement('div');
                sheen.className = 'card-sheen';
                card.appendChild(sheen);
            }

            const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || 10);
            const scale = parseFloat(card.getAttribute('data-tilt-scale') || 1.02);

            let isHovered = false;

            card.addEventListener('mouseenter', () => {
                isHovered = true;
                card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease';
            });

            card.addEventListener('mousemove', (e) => {
                if (!isHovered) return;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left; // 0 to width
                const y = e.clientY - rect.top;  // 0 to height

                const xPercent = (x / rect.width) * 2 - 1; // -1 to 1
                const yPercent = (y / rect.height) * 2 - 1; // -1 to 1

                const rotateX = -yPercent * maxTilt;
                const rotateY = xPercent * maxTilt;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;

                // Move dynamic sheen highlight
                const sheenX = (x / rect.width) * 100;
                const sheenY = (y / rect.height) * 100;
                sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.12) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)`;
                sheen.style.opacity = '1';
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease';
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                if (sheen) {
                    sheen.style.opacity = '0';
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initCursorGlow();
            initTiltCards();
        });
    } else {
        initCursorGlow();
        initTiltCards();
    }

    window.refreshTiltCards = initTiltCards;
})();
