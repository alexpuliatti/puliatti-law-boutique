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
    // 1b. Smooth Scroll for Anchor Links (JS-only, avoids CSS scroll-behavior lag)
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // 2. Intro → Navbar Scroll Transition (Interpolation Logic)
    // ============================================
    const intro = document.getElementById('intro');
    const navbar = document.getElementById('navbar');
    const navLogo = document.getElementById('nav-logo');
    const introLogoGroup = document.getElementById('intro-logo');

    if (introLogoGroup && intro && navLogo) {
        const introPuliatti = introLogoGroup.querySelector('.intro-puliatti');
        const introSubtitle = introLogoGroup.querySelector('.intro-subtitle');
        const introArrow = introLogoGroup.querySelector('.intro-scroll-arrow');

        // How many pixels of scroll to complete the full transition
        const TRANSITION_DISTANCE = window.innerHeight;

        // Pre-calculate positions for pixel-perfect interpolation
        let startX, startY, endX, endY;
        let ticking = false;
        let lastAppliedProgress = null;
        let lastIsMobile = null;

        function calibratePositions() {
            // Reset transform to get natural positions
            const originalTransform = introPuliatti.style.transform;
            introPuliatti.style.transform = 'none';
            
            // Intro center (The "Start")
            const introRect = introPuliatti.getBoundingClientRect();
            startX = introRect.left + introRect.width / 2;
            startY = introRect.top + introRect.height / 2;

            // Navbar position (The "Target")
            const wasVisible = navbar.classList.contains('visible');
            navbar.style.visibility = 'hidden';
            navbar.classList.add('visible');
            
            const navRect = navLogo.getBoundingClientRect();
            endX = navRect.left + navRect.width / 2;
            endY = navRect.top + navRect.height / 2;

            // Restore state
            if (!wasVisible) navbar.classList.remove('visible');
            navbar.style.visibility = '';
            introPuliatti.style.transform = originalTransform;
            
            // Reset scroll state trackers to trigger fresh layout recalculation
            lastAppliedProgress = null;
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

        function handleScroll() {
            const scrollY = window.scrollY;
            const isMobile = window.innerWidth <= 768;

            // Reset tracked progress if screen type changes to ensure visual consistency
            if (isMobile !== lastIsMobile) {
                lastAppliedProgress = null;
                lastIsMobile = isMobile;
            }

            if (isMobile) {
                // Mobile layout - fast fadeout within 120px scroll
                const progress = Math.min(scrollY / 120, 1);

                // Early exit only when fully settled AND not on first run (lastAppliedProgress !== null)
                if (progress === 1 && lastAppliedProgress === 1) {
                    return;
                }
                if (progress <= 0 && lastAppliedProgress !== null && lastAppliedProgress <= 0) {
                    return;
                }
                lastAppliedProgress = progress;

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

                intro.style.opacity = String(1 - progress);
                introPuliatti.style.opacity = String(1 - progress);
                introSubtitle.style.opacity = String(1 - progress);
                introArrow.style.opacity = String(1 - progress);

                // Slide elements up slightly while fading out
                introLogoGroup.style.transform = `translateY(${-progress * 15}px)`;

                if (scrollY >= 80) {
                    navbar.classList.add('visible');
                    introLogoGroup.style.pointerEvents = 'none';
                } else {
                    navbar.classList.remove('visible');
                    introLogoGroup.style.pointerEvents = 'auto';
                }
                return;
            }

            // --- Desktop Layout (Interpolation Logic) ---
            const progress = Math.min(scrollY / TRANSITION_DISTANCE, 1);

            // Early exit only when fully settled AND not on first run (lastAppliedProgress !== null)
            if (progress === 1 && lastAppliedProgress === 1) {
                return;
            }
            if (progress <= 0 && lastAppliedProgress !== null && lastAppliedProgress <= 0) {
                return;
            }
            lastAppliedProgress = progress;

            // Ensure introLogoGroup transforms are reset if resized from mobile
            introLogoGroup.style.transform = 'none';

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

        // Combined Scroll Management (Intro Transition)
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Run once on load in case the page loads mid-scroll
        handleScroll();
    }

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
    const mapContainer = document.getElementById('map');
    if (mapContainer && typeof maplibregl !== 'undefined') {
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
            { name: 'Catania', address: 'Viale Vittorio Veneto n. 227', coords: [15.0959, 37.5236] },
            { name: 'Roma', address: 'Via Monte Acero n. 2/a (Studio Bazzani)', coords: [12.5356, 41.9388] },
            { name: 'Firenze', address: 'Via Ciro Menotti n. 6 (Studio Baldacci)', coords: [11.2748, 43.7656] }
        ];

        const bounds = new maplibregl.LngLatBounds();

        markers.forEach(loc => {
            const popup = new maplibregl.Popup({ offset: 25 })
                .setHTML(`<h3>${loc.name}</h3><p>${loc.address}</p>`);

            const marker = new maplibregl.Marker({ color: '#A73C2A' })
                .setLngLat(loc.coords)
                .setPopup(popup)
                .addTo(map);

            const markerEl = marker.getElement();
            if (markerEl) {
                markerEl.setAttribute('role', 'button');
                markerEl.setAttribute('aria-label', `Mappa di ${loc.name}`);
            }
            
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
    }

    // ============================================
    // 5. DEV Palette Switcher
    // ============================================
    const PALETTES = ['palette-a', 'palette-b', 'palette-c', 'palette-d', 'palette-e'];

    const devTrigger   = document.getElementById('dev-palette-trigger');
    const devPanel     = document.getElementById('dev-palette-panel');
    const devBtns      = document.querySelectorAll('.dev-palette-btn');

    if (devTrigger && devPanel) {
        // Restore saved palette (default to palette-a which is the current look)
        const savedPalette = localStorage.getItem('dev-palette') || 'palette-a';
        applyPalette(savedPalette);

        // Toggle panel
        devTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            devPanel.classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!devTrigger.contains(e.target) && !devPanel.contains(e.target)) {
                devPanel.classList.remove('open');
            }
        });

        // Palette button clicks
        devBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const palette = btn.dataset.palette;
                applyPalette(palette);
                localStorage.setItem('dev-palette', palette);
                devPanel.classList.remove('open');
            });
        });
    }

    function applyPalette(palette) {
        // Remove all palette classes
        PALETTES.forEach(p => body.classList.remove(p));
        // Add selected palette
        body.classList.add(palette);

        // Update active button state
        document.querySelectorAll('.dev-palette-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.palette === palette);
        });
    }

    // ============================================
    // 6. Mobile Menu Toggle & Drawer Management
    // ============================================
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggleBtn && navLinks) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close menu on link clicks (anchor navigation)
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close menu on clicking outside the drawer
        document.addEventListener('click', (e) => {
            const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
            if (isExpanded && !navLinks.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close menu on resize to desktop sizes
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
                if (isExpanded) {
                    closeMobileMenu();
                }
            }
        });
    }

    function openMobileMenu() {
        menuToggleBtn.setAttribute('aria-expanded', 'true');
        menuToggleBtn.setAttribute('aria-label', 'Chiudi menu');
        navLinks.classList.add('active');
        body.classList.add('menu-open');
    }

    function closeMobileMenu() {
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        menuToggleBtn.setAttribute('aria-label', 'Apri menu');
        navLinks.classList.remove('active');
        body.classList.remove('menu-open');
    }
});
