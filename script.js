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
    // 2. Intro → Navbar Scroll Transition
    // ============================================
    const intro = document.getElementById('intro');
    const navbar = document.getElementById('navbar');
    const introLogoGroup = document.getElementById('intro-logo');
    const introPuliatti = introLogoGroup.querySelector('.intro-puliatti');
    const introSubtitle = introLogoGroup.querySelector('.intro-subtitle');
    const introArrow = introLogoGroup.querySelector('.intro-scroll-arrow');

    // How many pixels of scroll to complete the full transition
    const TRANSITION_DISTANCE = window.innerHeight;

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

        // --- SEAMLESS LOGO TRANSITION ---
        // Coordinates to land exactly on the Navbar Logo
        const scale = 1 - progress * 0.7; 
        const moveX = progress * -46.7; 
        const moveY = progress * -46.5; 
        
        // No more calc(-50%) - letting flexbox handle the centering
        introPuliatti.style.transform =
            `translate(${moveX}vw, ${moveY}vh) scale(${scale})`;
        
        // Final handoff: fade intro logo at the very end
        const handoff = Math.max((progress - 0.94) / 0.06, 0);
        introPuliatti.style.opacity = String(1 - handoff);

        // --- NAVBAR REVEAL ---
        if (progress >= 0.95) {
            navbar.classList.add('visible');
            introLogoGroup.style.pointerEvents = 'none';
        } else {
            navbar.classList.remove('visible');
            introLogoGroup.style.pointerEvents = 'auto';
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
