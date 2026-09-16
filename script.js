document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Mobile Navigation
    // -------------------------------------------------------------
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('open');
            }
        });
    }

    // -------------------------------------------------------------
    // 2. Gallery Filtering & Counts
    // -------------------------------------------------------------
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

    function updateCategoryCounts() {
        if (galleryItems.length === 0) return;

        const counts = {
            all: galleryItems.length,
            transit: galleryItems.filter(item => item.dataset.category === 'transit').length,
            urban: galleryItems.filter(item => item.dataset.category === 'urban').length,
            aviation: galleryItems.filter(item => item.dataset.category === 'aviation').length
        };

        Object.keys(counts).forEach(cat => {
            const badge = document.getElementById(`count-${cat}`);
            if (badge) {
                badge.textContent = `(${counts[cat]})`;
            }
        });
    }

    function applyFilter(filterName, updateUrl = false) {
        if (!filterBtns.length || !galleryItems.length) return;

        filterBtns.forEach(b => {
            if (b.dataset.filter === filterName) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        galleryItems.forEach(item => {
            if (filterName === 'all' || item.dataset.category === filterName) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        if (updateUrl && window.history.replaceState) {
            const currentUrl = new URL(window.location);
            if (filterName === 'all') {
                currentUrl.searchParams.delete('filter');
            } else {
                currentUrl.searchParams.set('filter', filterName);
            }
            window.history.replaceState({}, '', currentUrl);
        }
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        updateCategoryCounts();

        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        if (filterParam && ['transit', 'urban', 'aviation'].includes(filterParam)) {
            applyFilter(filterParam);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                applyFilter(btn.dataset.filter, true);
            });
        });
    }

    function getVisibleItems() {
        return galleryItems.filter(item => !item.classList.contains('hidden'));
    }

    // -------------------------------------------------------------
    // 3. Accessible, Deep-Linked Photo Lightbox
    // -------------------------------------------------------------
    if (galleryItems.length > 0) {
        let viewer = document.getElementById('photoViewer');
        let viewerImg, closeBtn, prevBtn, nextBtn, viewerCaption, viewerCounter, viewerExif, fullscreenBtn, zoomBtn;
        let lastFocusedElement = null;
        let isZoomed = false;

        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'photoViewer';
            viewer.className = 'photo-viewer';
            viewer.setAttribute('role', 'dialog');
            viewer.setAttribute('aria-modal', 'true');
            viewer.setAttribute('aria-label', 'Full size photo viewer');
            viewer.innerHTML = `
                <div class="viewer-header">
                    <div class="viewer-header-left">
                        <span class="viewer-counter" id="viewerCounter">1 of 1</span>
                    </div>
                    <div class="viewer-header-actions">
                        <button type="button" class="viewer-tool-btn" id="viewerZoom" aria-label="Toggle 1:1 Detail Zoom" title="Zoom (Z)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <button type="button" class="viewer-tool-btn" id="viewerFullscreen" aria-label="Toggle Fullscreen" title="Fullscreen (F)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                        <button type="button" class="viewer-close" id="viewerClose" aria-label="Close Lightbox" title="Close (Esc)">&times;</button>
                    </div>
                </div>
                <button type="button" class="viewer-prev" id="viewerPrev" aria-label="Previous Photo" title="Previous (&larr;)">&lsaquo;</button>
                <div class="viewer-container" id="viewerContainer">
                    <img class="viewer-image" id="viewerImg" src="" alt="Photo Full View">
                    <div class="viewer-caption" id="viewerCaption"></div>
                    <div class="viewer-exif" id="viewerExif"></div>
                </div>
                <button type="button" class="viewer-next" id="viewerNext" aria-label="Next Photo" title="Next (&rarr;)">&rsaquo;</button>
            `;
            document.body.appendChild(viewer);
        }

        viewerImg = document.getElementById('viewerImg');
        closeBtn = document.getElementById('viewerClose');
        prevBtn = document.getElementById('viewerPrev');
        nextBtn = document.getElementById('viewerNext');
        viewerCaption = document.getElementById('viewerCaption');
        viewerCounter = document.getElementById('viewerCounter');
        viewerExif = document.getElementById('viewerExif');
        fullscreenBtn = document.getElementById('viewerFullscreen');
        zoomBtn = document.getElementById('viewerZoom');

        let currentIndex = 0;

        function resetZoom() {
            isZoomed = false;
            if (viewerImg) {
                viewerImg.classList.remove('is-zoomed');
            }
            if (zoomBtn) {
                zoomBtn.classList.remove('active');
            }
        }

        function toggleZoom() {
            isZoomed = !isZoomed;
            if (viewerImg) {
                viewerImg.classList.toggle('is-zoomed', isZoomed);
            }
            if (zoomBtn) {
                zoomBtn.classList.toggle('active', isZoomed);
            }
        }

        function openViewer(index, updateHash = true) {
            const visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;

            resetZoom();
            currentIndex = (index + visibleItems.length) % visibleItems.length;
            const targetItem = visibleItems[currentIndex];
            const targetImg = targetItem.querySelector('img');
            if (!targetImg) return;

            // Prioritize high-res full WebP / fallback
            const fullSrc = targetItem.dataset.full || targetImg.src;
            viewerImg.src = fullSrc;
            viewerImg.alt = targetImg.alt || 'Photo Full View';

            if (viewerCaption) {
                const captionText = targetImg.alt || '';
                viewerCaption.textContent = captionText;
                viewerCaption.style.display = captionText ? 'block' : 'none';
            }

            if (viewerExif) {
                const camera = targetItem.dataset.camera || 'Nikon D7000';
                const lens = targetItem.dataset.lens || '18-55mm';
                const focal = targetItem.dataset.focal ? `${targetItem.dataset.focal}` : '';
                const aperture = targetItem.dataset.aperture ? `${targetItem.dataset.aperture}` : '';
                const shutter = targetItem.dataset.shutter ? `${targetItem.dataset.shutter}` : '';
                const iso = targetItem.dataset.iso ? `ISO ${targetItem.dataset.iso}` : '';
                const location = targetItem.dataset.location || 'Bucharest, Romania';
                const category = (targetItem.dataset.category || 'Transit').toUpperCase();

                const metaPills = [focal, aperture, shutter, iso].filter(Boolean).join(' &bull; ');

                viewerExif.innerHTML = `
                    <span class="exif-tag">${category}</span>
                    <span class="exif-meta camera-name"><strong>${camera}</strong></span>
                    ${metaPills ? `<span class="exif-meta camera-settings">${metaPills}</span>` : ''}
                    <span class="exif-meta camera-location">&bull; ${location}</span>
                `;
            }

            if (viewerCounter) {
                viewerCounter.textContent = `${currentIndex + 1} of ${visibleItems.length}`;
            }

            if (!viewer.classList.contains('active')) {
                lastFocusedElement = document.activeElement;
                viewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            if (closeBtn) closeBtn.focus();

            // Update URL hash for deep linking
            if (updateHash && targetItem.dataset.id) {
                if (window.history.replaceState) {
                    window.history.replaceState(null, '', `#photo-${targetItem.dataset.id}`);
                }
            }
        }

        function closeViewer(clearHash = true) {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
            resetZoom();

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }

            if (clearHash && window.location.hash.startsWith('#photo-')) {
                if (window.history.replaceState) {
                    window.history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }

            setTimeout(() => {
                if (!viewer.classList.contains('active')) {
                    viewerImg.src = '';
                }
            }, 250);
        }

        function showNext() {
            openViewer(currentIndex + 1);
        }

        function showPrev() {
            openViewer(currentIndex - 1);
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                viewer.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        // Open viewer on item click
        galleryItems.forEach(item => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View ${item.querySelector('img')?.alt || 'photo'} in full size`);

            const triggerOpen = () => {
                const visibleItems = getVisibleItems();
                const visibleIndex = visibleItems.indexOf(item);
                if (visibleIndex !== -1) {
                    openViewer(visibleIndex);
                }
            };

            item.addEventListener('click', triggerOpen);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerOpen();
                }
            });
        });

        closeBtn.addEventListener('click', () => closeViewer(true));
        nextBtn.addEventListener('click', showNext);
        prevBtn.addEventListener('click', showPrev);

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        if (zoomBtn) {
            zoomBtn.addEventListener('click', toggleZoom);
        }

        if (viewerImg) {
            viewerImg.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleZoom();
            });
        }

        viewer.addEventListener('click', (e) => {
            if (e.target === viewer || e.target.classList.contains('viewer-container')) {
                closeViewer(true);
            }
        });

        // Keyboard Controls & Focus Trap
        document.addEventListener('keydown', (e) => {
            if (!viewer.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeViewer(true);
            } else if (e.key === 'ArrowRight') {
                showNext();
            } else if (e.key === 'ArrowLeft') {
                showPrev();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            } else if (e.key === 'z' || e.key === 'Z') {
                toggleZoom();
            } else if (e.key === 'Tab') {
                // Focus trapping within viewer
                const focusable = viewer.querySelectorAll('button:not([disabled])');
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Mobile touch swipe gesture
        let touchStartX = 0;
        let touchEndX = 0;

        viewer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            if (isZoomed) return; // Don't slide while inspecting zoomed details
            const swipeThreshold = 45;
            if (touchEndX < touchStartX - swipeThreshold) {
                showNext();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                showPrev();
            }
        }

        // Deep-linking hash detection on page load & hashchange
        function checkUrlHash() {
            const hash = window.location.hash;
            if (hash && hash.startsWith('#photo-')) {
                const photoId = hash.replace('#photo-', '');
                const targetIndex = galleryItems.findIndex(item => item.dataset.id === photoId || item.id === `photo-${photoId}`);
                if (targetIndex !== -1) {
                    const item = galleryItems[targetIndex];
                    if (item.classList.contains('hidden')) {
                        applyFilter('all');
                    }
                    const visibleItems = getVisibleItems();
                    const visibleIndex = visibleItems.indexOf(item);
                    if (visibleIndex !== -1) {
                        openViewer(visibleIndex, false);
                    }
                }
            }
        }

        checkUrlHash();
        window.addEventListener('hashchange', checkUrlHash);
    }

    // -------------------------------------------------------------
    // 4. Contact Form - Seamless In-Page AJAX Submission
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Sending Message...</span>`;

            const formData = new FormData(contactForm);

            try {
                // Submit to FormSubmit AJAX endpoint
                const response = await fetch('https://formsubmit.co/ajax/razvanperjeru@icloud.com', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactForm.reset();
                    if (formStatus) {
                        formStatus.innerHTML = `
                            <div class="form-feedback success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <div>
                                    <strong>Message Sent Successfully!</strong>
                                    <p>Thank you for reaching out. I'll get back to you as soon as possible.</p>
                                </div>
                            </div>
                        `;
                        formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                    submitBtn.innerHTML = `<span>Sent! &check;</span>`;
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }, 4000);
                } else {
                    throw new Error('Server returned ' + response.status);
                }
            } catch (err) {
                console.warn('FormSubmit AJAX fallback triggered:', err);
                if (formStatus) {
                    formStatus.innerHTML = `
                        <div class="form-feedback error">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <div>
                                <strong>Message Delivery Note</strong>
                                <p>Could not send automatically. Please reach out directly to <a href="mailto:razvanperjeru@icloud.com">razvanperjeru@icloud.com</a>.</p>
                            </div>
                        </div>
                    `;
                }
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // -------------------------------------------------------------
    // 5. Copy Email to Clipboard
    // -------------------------------------------------------------
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const toast = document.getElementById('toast');

    if (copyEmailBtn && toast) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'razvanperjeru@icloud.com';
            navigator.clipboard.writeText(email).then(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2800);
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2800);
            });
        });
    }

    // -------------------------------------------------------------
    // 6. Smooth Back-to-Top
    // -------------------------------------------------------------
    const backToTopLink = document.querySelector('.back-to-top');
    if (backToTopLink) {
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------------
    // 7. Interactive Bucharest Photo Map
    // -------------------------------------------------------------
    const mapEl = document.getElementById('bucharestMap');
    if (mapEl && typeof L !== 'undefined') {
        const map = L.map('bucharestMap', {
            scrollWheelZoom: false
        }).setView([44.455, 26.082], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        const locations = [
            {
                name: "Pasajul Basarab & Podul Grant",
                category: "Transit Corridor",
                coords: [44.4503, 26.0682],
                img: "images/thumbs/1.webp",
                desc: "Modern light rail overpass, tram lines 1 & 10 movement.",
                link: "photography.html#photo-1"
            },
            {
                name: "Calea Victoriei & Universitate",
                category: "Urban Geometry",
                coords: [44.4357, 26.0998],
                img: "images/thumbs/2.webp",
                desc: "Historic Bucharest street perspective and architectural framing.",
                link: "photography.html#photo-2"
            },
            {
                name: "Băneasa Airport (BIAS Airshow)",
                category: "Aviation Dynamics",
                coords: [44.5032, 26.0841],
                img: "images/thumbs/bias-2.webp",
                desc: "Bucharest International Airshow, jet flypasts and aerobatics.",
                link: "photography.html#photo-bias-2"
            },
            {
                name: "Linia 41 Light Rail",
                category: "Modern Transit",
                coords: [44.4715, 26.0722],
                img: "images/thumbs/astra.webp",
                desc: "Astra Imperio trams operating along Bucharest's primary transit spine.",
                link: "photography.html#photo-astra"
            },
            {
                name: "Piața Unirii Central Hub",
                category: "Transit & City",
                coords: [44.4278, 26.1030],
                img: "images/thumbs/8.webp",
                desc: "Central Bucharest nexus, public transit convergence.",
                link: "photography.html#photo-8"
            }
        ];

        const redIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="background:#e5383b;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 10px #e5383b;cursor:pointer;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        locations.forEach(loc => {
            const marker = L.marker(loc.coords, { icon: redIcon }).addTo(map);
            const popupContent = `
                <div class="map-popup-card">
                    <img src="${loc.img}" alt="${loc.name}" loading="lazy">
                    <span style="font-size:0.7rem;font-weight:700;color:#e5383b;text-transform:uppercase;letter-spacing:0.5px;">${loc.category}</span>
                    <h4>${loc.name}</h4>
                    <p>${loc.desc}</p>
                    <a href="${loc.link}">View Photograph &rarr;</a>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    }
});
