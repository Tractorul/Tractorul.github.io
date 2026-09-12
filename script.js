document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Hamburger Navigation Toggle
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

    // 2. Category Filtering & Count Badges
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

    function applyFilter(filterName) {
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
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        updateCategoryCounts();

        // Check URL search params for pre-applied filter e.g. photography.html?filter=transit
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        if (filterParam) {
            applyFilter(filterParam);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                applyFilter(filter);
            });
        });
    }

    function getVisibleImages() {
        return galleryItems
            .filter(item => !item.classList.contains('hidden'))
            .map(item => item.querySelector('img'))
            .filter(Boolean);
    }

    // 3. Upgraded Lightbox Photo Viewer
    const allGalleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    if (allGalleryImages.length > 0) {
        let viewer = document.getElementById('photoViewer');
        let viewerImg, closeBtn, prevBtn, nextBtn, viewerCaption, viewerCounter;

        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'photoViewer';
            viewer.className = 'photo-viewer';
            viewer.innerHTML = `
                <div class="viewer-header">
                    <span class="viewer-counter" id="viewerCounter">1 of 1</span>
                    <button type="button" class="viewer-close" id="viewerClose" aria-label="Close Lightbox">&times;</button>
                </div>
                <button type="button" class="viewer-prev" id="viewerPrev" aria-label="Previous Photo">&lsaquo;</button>
                <div class="viewer-container">
                    <img class="viewer-image" id="viewerImg" src="" alt="Photo Full View">
                    <div class="viewer-caption" id="viewerCaption"></div>
                </div>
                <button type="button" class="viewer-next" id="viewerNext" aria-label="Next Photo">&rsaquo;</button>
            `;
            document.body.appendChild(viewer);
        }

        viewerImg = document.getElementById('viewerImg');
        closeBtn = document.getElementById('viewerClose');
        prevBtn = document.getElementById('viewerPrev');
        nextBtn = document.getElementById('viewerNext');
        viewerCaption = document.getElementById('viewerCaption');
        viewerCounter = document.getElementById('viewerCounter');

        let currentIndex = 0;

        function openViewer(index) {
            const visibleImages = getVisibleImages();
            if (visibleImages.length === 0) return;

            currentIndex = (index + visibleImages.length) % visibleImages.length;
            const targetImg = visibleImages[currentIndex];
            if (!targetImg) return;

            viewerImg.src = targetImg.src;
            viewerImg.alt = targetImg.alt || 'Photo Full View';

            if (viewerCaption) {
                const captionText = targetImg.alt || '';
                viewerCaption.textContent = captionText;
                viewerCaption.style.display = captionText ? 'block' : 'none';
            }

            if (viewerCounter) {
                viewerCounter.textContent = `${currentIndex + 1} of ${visibleImages.length}`;
            }

            viewer.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeViewer() {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
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

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (!img) return;
                const visibleImages = getVisibleImages();
                const visibleIndex = visibleImages.indexOf(img);
                if (visibleIndex !== -1) {
                    openViewer(visibleIndex);
                }
            });
        });

        closeBtn.addEventListener('click', closeViewer);
        nextBtn.addEventListener('click', showNext);
        prevBtn.addEventListener('click', showPrev);

        viewer.addEventListener('click', (e) => {
            if (e.target === viewer || e.target.classList.contains('viewer-container')) {
                closeViewer();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!viewer.classList.contains('active')) return;

            if (e.key === 'Escape') {
                closeViewer();
            } else if (e.key === 'ArrowRight') {
                showNext();
            } else if (e.key === 'ArrowLeft') {
                showPrev();
            }
        });

        // Touch Swipe Support for Mobile Lightbox
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
            const swipeThreshold = 40;
            if (touchEndX < touchStartX - swipeThreshold) {
                showNext(); // Swiped left -> Next photo
            } else if (touchEndX > touchStartX + swipeThreshold) {
                showPrev(); // Swiped right -> Prev photo
            }
        }
    }

    // 4. Back to Top Link Smooth Scroll
    const backToTopLink = document.querySelector('.back-to-top');
    if (backToTopLink) {
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
