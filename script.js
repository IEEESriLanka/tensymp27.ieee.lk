document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       1. NAVBAR SHADOW ON SCROLL
    ================================= */
    const navbar = document.querySelector(".navbar");

    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 20) {
                navbar.classList.add("scrolled");
            } else {
                navbar.classList.remove("scrolled");
            }
        });
    }

    /* =================================
       2. DROPDOWN ANIMATION (CSS + JS)
    ================================= */
  document.querySelectorAll(".dropdown").forEach(dropdown => {
    const menu = dropdown.querySelector(".dropdown-menu");

    menu.style.opacity = "0";
    menu.style.transform = "translateY(10px)";
    menu.style.transition = "all 0.3s ease";

    dropdown.addEventListener("mouseenter", () => {
        menu.style.display = "block";
        requestAnimationFrame(() => {
            menu.style.opacity = "1";
            menu.style.transform = "translateY(0)";
        });
    });

    dropdown.addEventListener("mouseleave", () => {
        menu.style.opacity = "0";
        menu.style.transform = "translateY(10px)";
        setTimeout(() => {
            menu.style.display = "none";
        }, 300);
    });
});


    /* =================================
       3. SCROLL REVEAL ANIMATION
    ================================= */
    const revealElements = document.querySelectorAll(
        ".section, .hero, .card, .timeline-item"
    );

    revealElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.8s ease";
    });

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach(el => observer.observe(el));

    /* =================================
       4. ACTIVE NAV LINK HIGHLIGHT
    ================================= */
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-menu a");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.style.color = "var(--dark)";
            if (link.getAttribute("href") === `#${current}`) {
                link.style.color = "var(--primary)";
            }
        });
    });

    /* =================================
       5. SMOOTH SCROLL
    ================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", e => {
            e.preventDefault();
            document.querySelector(anchor.getAttribute("href"))
                ?.scrollIntoView({ behavior: "smooth" });
        });
    });

    /* =================================
       6. MOBILE NAV TOGGLE - Fresh Code
    ================================= */
    (function() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const mainNav = document.getElementById('main-nav');
        const body = document.body;

        function toggleMenu() {
            if (!hamburgerBtn || !mainNav) return;
            hamburgerBtn.classList.toggle('active');
            mainNav.classList.toggle('open');
            body.style.overflow = mainNav.classList.contains('open') ? 'hidden' : '';
        }

        function closeMenu() {
            if (!hamburgerBtn || !mainNav) return;
            hamburgerBtn.classList.remove('active');
            mainNav.classList.remove('open');
            body.style.overflow = '';
        }

        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
        }

        // Mobile dropdown toggles - close others when one opens
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(function(dropdown) {
            const link = dropdown.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', function(e) {
                    if (window.innerWidth <= 992) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Close all other dropdowns first
                        dropdowns.forEach(function(otherDropdown) {
                            if (otherDropdown !== dropdown && otherDropdown.classList.contains('open')) {
                                otherDropdown.classList.remove('open');
                            }
                        });
                        
                        // Toggle current dropdown
                        dropdown.classList.toggle('open');
                    }
                });
            }
        });

        // Close menu on outside click
        document.addEventListener('click', function(e) {
            if (mainNav && mainNav.classList.contains('open')) {
                const isClickOnNav = mainNav.contains(e.target);
                const isClickOnButton = hamburgerBtn && hamburgerBtn.contains(e.target);
                
                if (!isClickOnNav && !isClickOnButton) {
                    closeMenu();
                }
            }
        });

        // Close menu on link click
        const navLinks = document.querySelectorAll('.nav-item:not(.dropdown) .nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) closeMenu();
            });
        });

        const submenuLinks = document.querySelectorAll('.submenu a');
        submenuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 992) closeMenu();
            });
        });

        // Close on resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 992 && mainNav && mainNav.classList.contains('open')) {
                closeMenu();
            }
        });
    })();
    // 4. Active Link Highlighting
    // Get current page URL filename
    const currentLocation = location.href;
    const allLinks = document.querySelectorAll('nav a');
    const menuLength = allLinks.length;

    for (let i = 0; i < menuLength; i++) {
        // Check if the link href is in the current URL
        // Used basic inclusion check, might need refinement for index/root
        if (allLinks[i].href === currentLocation || (currentLocation.endsWith('/') && allLinks[i].getAttribute('href').includes('index.html'))) {
            allLinks[i].classList.add('active');
            // If it's a dropdown item, also highlight the parent
            if (allLinks[i].classList.contains('dropdown-item')) {
                const parentNav = allLinks[i].closest('.nav-item');
                if (parentNav) {
                    parentNav.querySelector('.nav-link').classList.add('active');
                }
            }
        }
    }

    // 5. Submit Online Form Validation
    const submissionForm = document.getElementById('submissionForm');
    if (submissionForm) {
        submissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simple Validation
            let valid = true;
            const requiredFields = submissionForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = 'red';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });

            if (valid) {
                // Simulate success
                alert('Thank you for your submission! This is a demo.');
                submissionForm.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    }


});
