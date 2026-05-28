document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. Theme Toggle Management
    // ============================================
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference in local storage
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
    const introGroup = intro.querySelector('.intro-logo-group');

    // The scroll distance over which the intro animates out (in pixels).
    // Using window.innerHeight means the full transition completes
    // when the user has scrolled exactly one viewport height.
    const TRANSITION_DISTANCE = window.innerHeight * 0.6;

    // Cache the navbar logo's target position for the PULIATTI text.
    // We compute this once the navbar becomes visible to get accurate coords.
    let navLogoBounds = null;

    function getNavLogoBounds() {
        const navLogo = document.getElementById('nav-logo');
        // Temporarily make navbar visible to measure
        navbar.style.transition = 'none';
        navbar.classList.add('visible');
        navbar.classList.remove('hiding');
        const rect = navLogo.getBoundingClientRect();
        const style = window.getComputedStyle(navLogo);
        navLogoBounds = {
            x: rect.left,
            y: rect.top,
            fontSize: parseFloat(style.fontSize)
        };
        navbar.classList.remove('visible');
        navbar.style.transition = '';
    }

    // Measure on load
    getNavLogoBounds();

    // Re-measure on resize
    window.addEventListener('resize', () => {
        getNavLogoBounds();
    });

    // Click arrow to scroll down
    introArrow.addEventListener('click', () => {
        window.scrollTo({
            top: TRANSITION_DISTANCE + 100,
            behavior: 'smooth'
        });
    });

    let lastScrollY = 0;
    let ticking = false;

    function onScroll() {
        const scrollY = window.scrollY;
        // Progress: 0 = top (intro fully visible), 1 = fully scrolled past
        const progress = Math.min(Math.max(scrollY / TRANSITION_DISTANCE, 0), 1);

        // --- Intro overlay ---
        if (progress >= 1) {
            // Fully scrolled past: hide intro, show navbar
            intro.style.opacity = '0';
            intro.style.pointerEvents = 'none';
            intro.classList.add('scrolled-past');

            navbar.classList.add('visible');
            navbar.classList.remove('hiding');
        } else if (progress > 0) {
            // Mid-transition: interpolate intro elements
            intro.style.opacity = '1';
            intro.style.pointerEvents = 'none'; // Don't block scrolling mid-transition
            intro.classList.remove('scrolled-past');

            navbar.classList.remove('visible');
            navbar.classList.add('hiding');

            // Animate the "STUDIO LEGALE" subtitle: fade out and slide down
            // Happens in the first 40% of scroll for a snappy exit
            const subtitleProgress = Math.min(progress / 0.4, 1);
            introSubtitle.style.opacity = `${1 - subtitleProgress}`;
            introSubtitle.style.transform = `translateY(${subtitleProgress * 15}px)`;

            // Animate the scroll arrow: fade out immediately
            const arrowProgress = Math.min(progress / 0.2, 1);
            introArrow.style.opacity = `${1 - arrowProgress}`;

            // Animate PULIATTI text: scale down and move toward top-left
            if (navLogoBounds) {
                const introBounds = introPuliatti.getBoundingClientRect();
                const startFontSize = parseFloat(window.getComputedStyle(introPuliatti).fontSize);

                // Scale ratio between intro and nav logo sizes
                const targetScale = navLogoBounds.fontSize / startFontSize;
                const currentScale = 1 - (1 - targetScale) * progress;

                // Background fades out to reveal content underneath
                const bgOpacity = 1 - progress * 0.9;
                intro.style.backgroundColor = `rgba(${body.classList.contains('light-theme') ? '230,233,229' : '16,24,32'}, ${bgOpacity})`;

                // Move the logo group toward the nav logo position
                // We compute the delta from center to the nav logo position
                const currentCenterX = window.innerWidth / 2;
                const currentCenterY = window.innerHeight / 2;
                const targetX = navLogoBounds.x + (navLogoBounds.fontSize * 3) / 2; // Rough center of nav logo
                const targetY = navLogoBounds.y + navLogoBounds.fontSize / 2;

                const deltaX = (targetX - currentCenterX) * progress;
                const deltaY = (targetY - currentCenterY) * progress;

                introGroup.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${currentScale})`;
                introGroup.style.opacity = `${1 - progress * 0.6}`; // Slight fade as it merges into navbar
            }
        } else {
            // At top: full intro state
            intro.style.opacity = '1';
            intro.style.pointerEvents = 'auto';
            intro.classList.remove('scrolled-past');
            intro.style.backgroundColor = '';

            introSubtitle.style.opacity = '1';
            introSubtitle.style.transform = 'translateY(0)';
            introArrow.style.opacity = '1';
            introGroup.style.transform = 'translate(0, 0) scale(1)';
            introGroup.style.opacity = '1';

            navbar.classList.remove('visible');
            navbar.classList.remove('hiding');
        }

        lastScrollY = scrollY;
    }

    // Use requestAnimationFrame to keep scroll handler performant
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once on load (in case page is loaded mid-scroll)
    onScroll();

    // ============================================
    // 3. Scroll Reveal Animations (Intersection Observer)
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
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
        center: [15.085, 37.514], // Via G. D'Annunzio 111, Catania
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
