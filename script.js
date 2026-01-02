document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       1. NAVBAR SHADOW ON SCROLL
    ================================= */
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
        } else {
            navbar.style.boxShadow = "none";
        }
    });

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
       6. MOBILE NAV TOGGLE
    ================================= */
    const navToggle = document.querySelector('.nav-toggle');
    const navContainer = document.querySelector('.nav-container');
   

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navContainer.classList.toggle('nav-open');
        });
    }


    navLinks.forEach(link => link.addEventListener('click', () => {
        if (navContainer.classList.contains('nav-open')) navContainer.classList.remove('nav-open');
    }));

    const menuToggle = document.getElementById("mobile-menu");
    const nav = document.querySelector("nav");

    if (!menuToggle || !nav) return;

    menuToggle.addEventListener("click", () => {
        menuToggle.classList.toggle("active");
        nav.classList.toggle("active");
    });



});
