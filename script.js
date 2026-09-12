document.addEventListener('DOMContentLoaded', () => {
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

    function getVisibleItems() {
        return galleryItems.filter(item => !item.classList.contains('hidden'));
    }

    const allGalleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    if (allGalleryImages.length > 0) {
        let viewer = document.getElementById('photoViewer');
        let viewerImg, closeBtn, prevBtn, nextBtn, viewerCaption, viewerCounter, viewerExif, fullscreenBtn;

        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'photoViewer';
            viewer.className = 'photo-viewer';
            viewer.innerHTML = `
                <div class="viewer-header">
                    <span class="viewer-counter" id="viewerCounter">1 of 1</span>
                    <div class="viewer-header-actions">
                        <button type="button" class="viewer-tool-btn" id="viewerFullscreen" aria-label="Toggle Fullscreen">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                        <button type="button" class="viewer-close" id="viewerClose" aria-label="Close Lightbox">&times;</button>
                    </div>
                </div>
                <button type="button" class="viewer-prev" id="viewerPrev" aria-label="Previous Photo">&lsaquo;</button>
                <div class="viewer-container">
                    <img class="viewer-image" id="viewerImg" src="" alt="Photo Full View">
                    <div class="viewer-caption" id="viewerCaption"></div>
                    <div class="viewer-exif" id="viewerExif"></div>
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
        viewerExif = document.getElementById('viewerExif');
        fullscreenBtn = document.getElementById('viewerFullscreen');

        let currentIndex = 0;

        function openViewer(index) {
            const visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;

            currentIndex = (index + visibleItems.length) % visibleItems.length;
            const targetItem = visibleItems[currentIndex];
            const targetImg = targetItem.querySelector('img');
            if (!targetImg) return;

            viewerImg.src = targetImg.src;
            viewerImg.alt = targetImg.alt || 'Photo Full View';

            if (viewerCaption) {
                const captionText = targetImg.alt || '';
                viewerCaption.textContent = captionText;
                viewerCaption.style.display = captionText ? 'block' : 'none';
            }

            if (viewerExif) {
                const camera = targetItem.dataset.camera || 'Nikon D7000';
                const location = targetItem.dataset.location || 'Bucharest, Romania';
                const category = targetItem.dataset.category || 'Transit';
                const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
                viewerExif.innerHTML = `
                    <span class="exif-tag">${categoryFormatted}</span>
                    <span class="exif-meta">&bull; ${camera}</span>
                    <span class="exif-meta">&bull; ${location}</span>
                `;
            }

            if (viewerCounter) {
                viewerCounter.textContent = `${currentIndex + 1} of ${visibleItems.length}`;
            }

            viewer.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeViewer() {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
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

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const visibleItems = getVisibleItems();
                const visibleIndex = visibleItems.indexOf(item);
                if (visibleIndex !== -1) {
                    openViewer(visibleIndex);
                }
            });
        });

        closeBtn.addEventListener('click', closeViewer);
        nextBtn.addEventListener('click', showNext);
        prevBtn.addEventListener('click', showPrev);
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

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
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        });

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
                showNext();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                showPrev();
            }
        }
    }

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

    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(e) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending Message...</span>`;
        });
    }

    const backToTopLink = document.querySelector('.back-to-top');
    if (backToTopLink) {
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
