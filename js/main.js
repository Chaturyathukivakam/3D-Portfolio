/**
 * Main Application Script for Thukivakam Chaturya Portfolio
 * Handles Navigation, Modals, Filters, Scroll Effects, Contact Form, and Resume Viewer
 */

(function () {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    const backToTopBtn = document.getElementById('backToTopBtn');
    const resumeModal = document.getElementById('resumeModal');
    const projectModal = document.getElementById('projectModal');
    const contactForm = document.getElementById('contactForm');
    const toastContainer = document.getElementById('toastContainer');

    // 1. Sticky Navigation & Scroll Spy
    function handleScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Navbar blur toggle
        if (scrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Back to top visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Active link spy
        let currentSectionId = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth Scroll for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                // Close mobile menu if open
                if (mobileNav && mobileNav.classList.contains('active')) {
                    toggleMobileNav(false);
                }

                const navHeight = navbar ? navbar.offsetHeight : 80;
                const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight + 5;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Mobile Menu Handling
    function toggleMobileNav(forceState) {
        const isOpen = forceState !== undefined ? forceState : !mobileNav.classList.contains('active');
        if (isOpen) {
            mobileNav.classList.add('active');
            mobileMenuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMobileNav());
    }

    // 3. Skill Category Filtering
    const skillFilterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    skillFilterBtns.forEach((btn) => {
        btn.addEventListener('click', function () {
            skillFilterBtns.forEach((b) => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-filter');

            skillCards.forEach((card) => {
                const cardCat = card.getAttribute('data-category');
                if (category === 'all' || cardCat.includes(category)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 20);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200);
                }
            });

            if (window.refreshTiltCards) {
                setTimeout(window.refreshTiltCards, 250);
            }
        });
    });

    // 4. Project Modal Data & Interactive Viewer
    const projectDetails = {
        'power-bi': {
            title: 'Power BI Sales Dashboard',
            badge: 'Academic Project',
            category: 'Data Analytics & Business Intelligence',
            tools: ['Power BI', 'Microsoft Excel', 'Data Modeling', 'DAX', 'Data Visualization'],
            description: 'Built an interactive, multi-view Power BI dashboard on the Sample Superstore dataset to analyze sales, profit, and regional performance trends.',
            highlights: [
                'Processed and transformed sales records to uncover actionable commercial insights.',
                'Created KPI cards and visual trend charts analyzing regional profit margins, product sub-category profitability, and customer segment growth.',
                'Designed interactive slicers for dynamic quarterly, regional, and category-level deep dives.'
            ],
            type: 'Academic Project'
        },
        'dl-comparison': {
            title: 'Deep Learning Architecture Comparison',
            badge: 'Deep Learning Coursework',
            category: 'Artificial Intelligence & Neural Networks',
            tools: ['Deep Learning', 'FNN', 'CNN', 'RNN', 'Python', 'Architecture Design'],
            description: 'Authored an in-depth academic report comparing Feedforward Neural Networks (FNN), Convolutional Neural Networks (CNN), and Recurrent Neural Networks (RNN).',
            highlights: [
                'Evaluated mathematical foundations, layer mechanisms, and parameter sharing across architectures.',
                'Created custom architectural diagrams illustrating structural differences between grid-like data (CNN) vs sequential data (RNN).',
                'Synthesized comparative benchmarks on computational complexity, memory footprints, and practical use cases.'
            ],
            type: 'Coursework Report'
        },
        'ai-ethics': {
            title: 'Ethical Considerations in AI',
            badge: 'Deep Learning Coursework',
            category: 'AI Ethics, Governance & Transparency',
            tools: ['AI Ethics', 'Algorithmic Fairness', 'Data Privacy', 'Explainable AI (XAI)'],
            description: 'Researched and wrote a comprehensive report on algorithmic bias, data privacy, and transparency challenges in modern AI systems.',
            highlights: [
                'Explored historical case studies of algorithmic bias across decision-making models.',
                'Analyzed mitigation strategies including diverse training sampling, fairness metrics, and explainability frameworks.',
                'Formulated actionable governance recommendations for responsible AI development.'
            ],
            type: 'Research & Coursework'
        },
        'garbage-system': {
            title: 'Garbage Management System',
            badge: 'Academic Concept • Not Deployed',
            category: 'Sustainability & Technology Modeling',
            tools: ['Waste Management', 'Sustainability', 'Process Modeling', 'Technology Integration'],
            description: 'Worked on a project focused on improving waste management through better garbage collection, segregation and monitoring. The project was developed strictly as an academic/project concept and was not deployed.',
            highlights: [
                'Designed conceptual architectural blueprints for intelligent waste categorization and segregation.',
                'Outlined sensor and telemetry workflows for optimal collection vehicle route planning.',
                'Created sustainability impact assessments and civic monitoring frameworks.'
            ],
            type: 'Academic Concept'
        }
    };

    window.openProjectModal = function (projectId) {
        const data = projectDetails[projectId];
        if (!data || !projectModal) return;

        document.getElementById('modalProjectTitle').textContent = data.title;
        document.getElementById('modalProjectBadge').textContent = data.badge;
        document.getElementById('modalProjectCategory').textContent = data.category;
        document.getElementById('modalProjectDesc').textContent = data.description;

        // Render tech tools
        const toolsContainer = document.getElementById('modalProjectTools');
        toolsContainer.innerHTML = '';
        data.tools.forEach((t) => {
            const span = document.createElement('span');
            span.className = 'tech-tag';
            span.textContent = t;
            toolsContainer.appendChild(span);
        });

        // Render highlights
        const highlightsContainer = document.getElementById('modalProjectHighlights');
        highlightsContainer.innerHTML = '';
        data.highlights.forEach((h) => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle text-accent"></i> <span>${h}</span>`;
            highlightsContainer.appendChild(li);
        });

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeProjectModal = function () {
        if (projectModal) {
            projectModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // 5. Resume Modal
    window.openResumeModal = function () {
        if (resumeModal) {
            resumeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeResumeModal = function () {
        if (resumeModal) {
            resumeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Close modals on Escape key or outside click
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeResumeModal();
            closeProjectModal();
            toggleMobileNav(false);
        }
    });

    [resumeModal, projectModal].forEach((modal) => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeResumeModal();
                    closeProjectModal();
                }
            });
        }
    });

    // 6. Toast Notification Engine
    window.showToast = function (message, type = 'info') {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';

        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    };

    // Copy to Clipboard Utility
    window.copyToClipboard = function (text, label) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(`Copied ${label} to clipboard!`, 'success');
            }).catch(() => {
                showToast(`Failed to copy, please select manually.`, 'info');
            });
        } else {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast(`Copied ${label} to clipboard!`, 'success');
        }
    };

    // 7. Contact Form Handler
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('formName').value.trim();
            const email = document.getElementById('formEmail').value.trim();
            const subject = document.getElementById('formSubject').value.trim();
            const message = document.getElementById('formMessage').value.trim();
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            if (!name || !email || !message) {
                showToast('Please fill in all required fields.', 'info');
                return;
            }

            // Button loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Message...`;

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                showToast('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();

                // Also generate mailto link option
                const mailtoUrl = `mailto:thukivakamchaturyareddyy@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Inquiry')}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
                console.log('Direct mail link prepared:', mailtoUrl);
            }, 1200);
        });
    }

    // 8. Back to Top Smooth Scroll
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 9. Intersection Observer for Scroll Reveals
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        if (!('IntersectionObserver' in window)) {
            revealElements.forEach((el) => el.classList.add('revealed'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach((el) => observer.observe(el));
    }

    // 10. Typewriter Effect in Hero
    function initTypewriter() {
        const target = document.getElementById('heroTypewriter');
        if (!target) return;

        const phrases = [
            'BCA AI & ML Student at Alliance University',
            'Data Analytics & Business Intelligence Enthusiast',
            'Interested in Non-Technical Roles (HR & Operations)',
            'Hands-on with Python, SQL, and Power BI',
            'Tech Operations & Operational Data Management'
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 70;

        function type() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                target.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 35;
            } else {
                target.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 70;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                typingSpeed = 2200; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 400; // Pause before typing next
            }

            setTimeout(type, typingSpeed);
        }

        type();
    }

    // Initialize all features on DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            handleScroll();
            initScrollReveals();
            initTypewriter();
        });
    } else {
        handleScroll();
        initScrollReveals();
        initTypewriter();
    }
})();
