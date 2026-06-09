document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. Theme Toggle Management
    // ============================================
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // ============================================
    // 2. Intro → Navbar Scroll Transition (Interpolation Logic)
    // ============================================
    const intro = document.getElementById('intro');
    const navbar = document.getElementById('navbar');
    const navLogo = document.getElementById('nav-logo');
    const introLogoGroup = document.getElementById('intro-logo');
    const introPuliatti = introLogoGroup.querySelector('.intro-puliatti');
    const introSubtitle = introLogoGroup.querySelector('.intro-subtitle');
    const introArrow = introLogoGroup.querySelector('.intro-scroll-arrow');

    // How many pixels of scroll to complete the full transition
    const TRANSITION_DISTANCE = window.innerHeight;

    // Pre-calculate positions for pixel-perfect interpolation
    let startX, startY, endX, endY;

    function calibratePositions() {
        // Reset transform to get natural positions
        const originalTransform = introPuliatti.style.transform;
        introPuliatti.style.transform = 'none';
        
        // Intro center (The "Start")
        const introRect = introPuliatti.getBoundingClientRect();
        startX = introRect.left + introRect.width / 2;
        startY = introRect.top + introRect.height / 2;

        // Navbar position (The "Target")
        // We temporarily show the navbar at its final position to measure it
        const wasVisible = navbar.classList.contains('visible');
        navbar.style.visibility = 'hidden';
        navbar.classList.add('visible');
        
        const navRect = navLogo.getBoundingClientRect();
        endX = navRect.left + navRect.width / 2;
        endY = navRect.top + navRect.height / 2;

        // Restore state
        if (!wasVisible) navbar.classList.remove('visible');
        navbar.style.visibility = 'visible';
        introPuliatti.style.transform = originalTransform;
    }

    calibratePositions();
    window.addEventListener('resize', calibratePositions);

    // Click arrow → scroll down
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

        // --- INTRO & LOGO HANDOFF ---
        if (progress <= 0) {
            intro.style.opacity = '1';
            introLogoGroup.style.pointerEvents = 'auto';
            introPuliatti.style.transform = 'none';
            introPuliatti.style.opacity = '1';
            introSubtitle.style.opacity = '1';
            introArrow.style.opacity = '1';
            navbar.classList.remove('visible');
            return;
        }

        // Disable intro background as it leaves
        intro.style.opacity = String(1 - Math.min(progress * 1.5, 1));
        
        // Hide arrow and subtitle quickly
        const quickProg = Math.min(progress / 0.2, 1);
        introArrow.style.opacity = String(1 - quickProg);
        
        const subProg = Math.min(progress / 0.35, 1);
        introSubtitle.style.opacity = String(1 - subProg);
        introSubtitle.style.transform = `translateY(${subProg * 20}px)`;

        // --- INTERPOLATED LOGO TRANSITION ---
        const currentX = (endX - startX) * progress;
        const currentY = (endY - startY) * progress;
        const scale = 1 - progress * 0.8; // Landing at 0.2 scale

        introPuliatti.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
        
        // Final handoff: fade intro logo at the very end (98% → 100%)
        const handoff = Math.max((progress - 0.98) / 0.02, 0);
        introPuliatti.style.opacity = String(1 - handoff);

        // --- NAVBAR REVEAL ---
        if (progress >= 0.98) {
            navbar.classList.add('visible');
            introLogoGroup.style.pointerEvents = 'none';
        } else {
            navbar.classList.remove('visible');
            introLogoGroup.style.pointerEvents = 'auto';
        }
    }

    // Combined Scroll Management (Intro Transition + Dynamic Blur)
    let blurTimeout;
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                
                // Only update blur style if we've just started scrolling
                if (!isScrolling) {
                    navbar.style.backdropFilter = "blur(8px)";
                    navbar.style.webkitBackdropFilter = "blur(8px)";
                    isScrolling = true;
                }

                ticking = false;
            });
            ticking = true;
        }

        clearTimeout(blurTimeout);
        blurTimeout = setTimeout(() => {
            navbar.style.backdropFilter = "blur(24px)";
            navbar.style.webkitBackdropFilter = "blur(24px)";
            isScrolling = false;
        }, 150); // Slightly longer delay for smoother landing
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
        center: [12.5, 41.9], // Central Italy initial view
        zoom: 5,
        scrollZoom: false
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    const markers = [
        { name: 'Catania', address: 'Via G. D\'Annunzio n. 111', coords: [15.085, 37.514] },
        { name: 'Roma', address: 'Via di Ripetta n. 22', coords: [12.496, 41.902] },
        { name: 'Firenze', address: 'Lungarno Vespucci n. 20', coords: [11.255, 43.769] }
    ];

    const bounds = new maplibregl.LngLatBounds();

    markers.forEach(loc => {
        const popup = new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h3>${loc.name}</h3><p>${loc.address}</p>`);

        new maplibregl.Marker({ color: '#A73C2A' })
            .setLngLat(loc.coords)
            .setPopup(popup)
            .addTo(map);
        
        bounds.extend(loc.coords);
    });

    // Fit map to markers with padding
    map.on('load', () => {
        map.fitBounds(bounds, { padding: 100, maxZoom: 14 });
    });

    themeToggleBtn.addEventListener('click', () => {
        const isNowDark = body.classList.contains('dark-theme');
        map.setStyle(isNowDark ? mapStyleDark : mapStyleLight);
    });
});
