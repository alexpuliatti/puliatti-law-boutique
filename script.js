document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. Theme Toggle Management
    // ============================================
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });

    // ============================================
    // 2. Intro → Navbar Scroll Transition
    // ============================================
    const intro = document.getElementById('intro');
    const navbar = document.getElementById('navbar');
    const introPuliatti = intro.querySelector('.intro-puliatti');
    const introSubtitle = intro.querySelector('.intro-subtitle');
    const introArrow = intro.querySelector('.intro-scroll-arrow');

    // How many pixels of scroll to complete the full transition
    const TRANSITION_DISTANCE = window.innerHeight * 0.5;

    // Click arrow → scroll down to trigger the transition
    introArrow.addEventListener('click', () => {
        window.scrollTo({
            top: TRANSITION_DISTANCE + 100,
            behavior: 'smooth'
        });
    });

    let ticking = false;

    function handleScroll() {
        const scrollY = window.scrollY;
        const progress = Math.min(scrollY / TRANSITION_DISTANCE, 1);

        // --- INTRO OVERLAY ---
        if (progress <= 0) {
            // Full intro: everything at default
            intro.style.opacity = '1';
            intro.style.pointerEvents = 'auto';
            introPuliatti.style.transform = '';
            introPuliatti.style.opacity = '1';
            introSubtitle.style.opacity = '1';
            introSubtitle.style.transform = '';
            introArrow.style.opacity = '1';
            navbar.classList.remove('visible');
            return;
        }

        // During and after transition: disable intro click-blocking
        intro.style.pointerEvents = 'none';

        // Fade the whole intro background out
        intro.style.opacity = String(1 - progress);

        // "STUDIO LEGALE" fades out quickly in the first 35% of scroll
        const subProg = Math.min(progress / 0.35, 1);
        introSubtitle.style.opacity = String(1 - subProg);
        introSubtitle.style.transform = `translateY(${subProg * 12}px)`;

        // Scroll arrow disappears very fast (first 20%)
        const arrowProg = Math.min(progress / 0.2, 1);
        introArrow.style.opacity = String(1 - arrowProg);

        // PULIATTI logo: scale down toward top-left
        const scale = 1 - progress * 0.7;          // 1 → 0.3
        const moveX = progress * -38;               // % of viewport width leftward
        const moveY = progress * -42;               // % of viewport height upward
        introPuliatti.style.transform =
            `translate(${moveX}vw, ${moveY}vh) scale(${scale})`;
        introPuliatti.style.opacity = String(1 - progress * 0.5);

        // --- NAVBAR ---
        if (progress >= 0.85) {
            navbar.classList.add('visible');
        } else {
            navbar.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load in case the page loads mid-scroll (e.g. browser restore)
    handleScroll();

    // ============================================
    // 3. Scroll Reveal Animations
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // 4. Map Initialization
    // ============================================
    const mapStyleDark = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    const mapStyleLight = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
    
    const isDark = body.classList.contains('dark-theme');

    const map = new maplibregl.Map({
        container: 'map',
        style: isDark ? mapStyleDark : mapStyleLight,
        center: [15.085, 37.514],
        zoom: 14,
        scrollZoom: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    const popup = new maplibregl.Popup({ offset: 25 })
        .setHTML('<h3>Studio Legale Puliatti</h3><p>Via G. D\'Annunzio n. 111</p>');

    new maplibregl.Marker({ color: '#A73C2A' })
        .setLngLat([15.085, 37.514])
        .setPopup(popup)
        .addTo(map);

    themeToggleBtn.addEventListener('click', () => {
        const isNowDark = body.classList.contains('dark-theme');
        map.setStyle(isNowDark ? mapStyleDark : mapStyleLight);
    });
});
