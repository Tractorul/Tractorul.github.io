/**
 * andreuptm - Urban & Transport Photography Portfolio
 * Core Client-side Scripts & Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Toast Notification Utility
    // -------------------------------------------------------------
    let toast = document.getElementById('toast');
    let toastTimer = null;

    function showToast(message = 'Copied to clipboard!') {
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    // -------------------------------------------------------------
    // 2. Mobile Navigation Toggle
    // -------------------------------------------------------------
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('open', isOpen);
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // -------------------------------------------------------------
    // 3. Scroll Reveal Observer
    // -------------------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('visible'));
    }

    // -------------------------------------------------------------
    // 4. Gallery Filtering & Real-time Search
    // -------------------------------------------------------------
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const searchInput = document.getElementById('gallerySearch');
    const searchClearBtn = document.getElementById('searchClearBtn');
    const emptyState = document.getElementById('galleryEmptyState');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    let currentCategory = 'all';
    let searchQuery = '';

    function updateCategoryCounts() {
        if (galleryItems.length === 0) return;

        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = (item) => {
            if (!q) return true;
            const searchIndex = (item.dataset.searchIndex || '').toLowerCase();
            const alt = (item.querySelector('img')?.alt || '').toLowerCase();
            const title = (item.dataset.title || '').toLowerCase();
            const camera = (item.dataset.camera || '').toLowerCase();
            const location = (item.dataset.location || '').toLowerCase();
            return searchIndex.includes(q) || alt.includes(q) || title.includes(q) || camera.includes(q) || location.includes(q);
        };

        const counts = {
            all: galleryItems.filter(matchesQuery).length,
            transit: galleryItems.filter(item => item.dataset.category === 'transit' && matchesQuery(item)).length,
            urban: galleryItems.filter(item => item.dataset.category === 'urban' && matchesQuery(item)).length,
            aviation: galleryItems.filter(item => item.dataset.category === 'aviation' && matchesQuery(item)).length
        };

        Object.keys(counts).forEach(cat => {
            const badge = document.getElementById(`count-${cat}`);
            if (badge) {
                badge.textContent = `(${counts[cat]})`;
            }
        });
    }

    function filterGallery() {
        if (!galleryItems.length) return;

        const q = searchQuery.toLowerCase().trim();
        let visibleCount = 0;

        galleryItems.forEach(item => {
            const categoryMatch = currentCategory === 'all' || item.dataset.category === currentCategory;
            
            let queryMatch = true;
            if (q) {
                const searchIndex = (item.dataset.searchIndex || '').toLowerCase();
                const alt = (item.querySelector('img')?.alt || '').toLowerCase();
                const title = (item.dataset.title || '').toLowerCase();
                const camera = (item.dataset.camera || '').toLowerCase();
                const location = (item.dataset.location || '').toLowerCase();
                queryMatch = searchIndex.includes(q) || alt.includes(q) || title.includes(q) || camera.includes(q) || location.includes(q);
            }

            if (categoryMatch && queryMatch) {
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        if (emptyState) {
            if (visibleCount === 0) {
                emptyState.classList.add('show');
            } else {
                emptyState.classList.remove('show');
            }
        }

        updateCategoryCounts();
    }

    function setCategory(filterName, updateUrl = true) {
        currentCategory = filterName;
        filterBtns.forEach(b => {
            if (b.dataset.filter === filterName) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });

        if (updateUrl && window.history.replaceState) {
            const url = new URL(window.location);
            if (filterName === 'all') {
                url.searchParams.delete('filter');
            } else {
                url.searchParams.set('filter', filterName);
            }
            window.history.replaceState({}, '', url);
        }

        filterGallery();
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        // Build searchIndex attribute for fast searching
        galleryItems.forEach(item => {
            const id = item.id || item.dataset.id || '';
            const title = item.dataset.title || '';
            const category = item.dataset.category || '';
            const camera = item.dataset.camera || '';
            const lens = item.dataset.lens || '';
            const location = item.dataset.location || '';
            const tags = item.dataset.tags || '';
            const imgAlt = item.querySelector('img')?.alt || '';
            item.dataset.searchIndex = `${id} ${title} ${category} ${camera} ${lens} ${location} ${tags} ${imgAlt}`;
        });

        // Initialize from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const filterParam = urlParams.get('filter');
        if (filterParam && ['transit', 'urban', 'aviation'].includes(filterParam)) {
            setCategory(filterParam, false);
        } else {
            setCategory('all', false);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setCategory(btn.dataset.filter);
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                if (searchClearBtn) {
                    searchClearBtn.classList.toggle('visible', searchQuery.length > 0);
                }
                filterGallery();
            });

            if (searchClearBtn) {
                searchClearBtn.addEventListener('click', () => {
                    searchInput.value = '';
                    searchQuery = '';
                    searchClearBtn.classList.remove('visible');
                    filterGallery();
                    searchInput.focus();
                });
            }
        }

        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    searchQuery = '';
                    if (searchClearBtn) searchClearBtn.classList.remove('visible');
                }
                setCategory('all');
            });
        }
    }

    function getVisibleItems() {
        return galleryItems.filter(item => !item.classList.contains('hidden'));
    }

    // -------------------------------------------------------------
    // 5. Enhanced Lightbox Viewer with Deep-Linking & Zoom
    // -------------------------------------------------------------
    if (galleryItems.length > 0) {
        let viewer = document.getElementById('photoViewer');
        let viewerImg, closeBtn, prevBtn, nextBtn, viewerCaption, viewerCounter, viewerExif, fullscreenBtn, zoomBtn, shareBtn;
        let lastFocusedElement = null;
        let currentIndex = 0;
        let isZoomed = false;

        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'photoViewer';
            viewer.className = 'photo-viewer';
            viewer.setAttribute('role', 'dialog');
            viewer.setAttribute('aria-modal', 'true');
            viewer.setAttribute('aria-label', 'Photo Fullscreen Viewer');
            viewer.innerHTML = `
                <div class="viewer-header">
                    <span class="viewer-counter" id="viewerCounter">1 of 1</span>
                    <div class="viewer-header-actions">
                        <button type="button" class="viewer-tool-btn" id="viewerZoom" aria-label="Toggle 2x Zoom">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <button type="button" class="viewer-tool-btn" id="viewerShare" aria-label="Copy Direct Link to Photo">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                        </button>
                        <button type="button" class="viewer-tool-btn" id="viewerFullscreen" aria-label="Toggle Fullscreen">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                        </button>
                        <button type="button" class="viewer-close" id="viewerClose" aria-label="Close Lightbox">&times;</button>
                    </div>
                </div>
                <button type="button" class="viewer-prev" id="viewerPrev" aria-label="Previous Photo">&lsaquo;</button>
                <div class="viewer-container">
                    <div class="viewer-img-stage" id="viewerStage">
                        <img class="viewer-image" id="viewerImg" src="" alt="Photo Full View">
                    </div>
                    <div class="viewer-details">
                        <div class="viewer-caption" id="viewerCaption"></div>
                        <div class="viewer-exif" id="viewerExif"></div>
                    </div>
                </div>
                <button type="button" class="viewer-next" id="viewerNext" aria-label="Next Photo">&rsaquo;</button>
                <div class="viewer-shortcuts-bar">
                    <span><kbd>&larr;</kbd> <kbd>&rarr;</kbd> Navigate</span>
                    <span><kbd>Z</kbd> Zoom</span>
                    <span><kbd>F</kbd> Fullscreen</span>
                    <span><kbd>S</kbd> Share</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
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
        shareBtn = document.getElementById('viewerShare');

        function setZoom(zoomed) {
            isZoomed = zoomed;
            if (viewerImg) {
                viewerImg.classList.toggle('zoomed', isZoomed);
            }
            if (zoomBtn) {
                zoomBtn.classList.toggle('active', isZoomed);
                zoomBtn.setAttribute('aria-pressed', isZoomed);
            }
        }

        function toggleZoom() {
            setZoom(!isZoomed);
        }

        function openViewer(index, updateHash = true) {
            const visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;

            lastFocusedElement = document.activeElement;
            setZoom(false);

            currentIndex = (index + visibleItems.length) % visibleItems.length;
            const targetItem = visibleItems[currentIndex];
            const targetImg = targetItem.querySelector('img');
            if (!targetImg) return;

            viewerImg.src = targetImg.src;
            viewerImg.alt = targetImg.alt || 'Photo Full View';

            const photoTitle = targetItem.dataset.title || targetImg.alt || 'Urban & Transport Photography';
            if (viewerCaption) {
                viewerCaption.textContent = photoTitle;
            }

            if (viewerExif) {
                const camera = targetItem.dataset.camera || 'Nikon D7000';
                const lens = targetItem.dataset.lens || '';
                const location = targetItem.dataset.location || 'Bucharest, Romania';
                const category = targetItem.dataset.category || 'Transit';
                const categoryFormatted = category.charAt(0).toUpperCase() + category.slice(1);
                
                let exifHTML = `<span class="exif-tag">${categoryFormatted}</span>`;
                exifHTML += `<span class="exif-meta">&bull; ${camera}</span>`;
                if (lens) exifHTML += `<span class="exif-meta">&bull; ${lens}</span>`;
                exifHTML += `<span class="exif-meta">&bull; ${location}</span>`;
                viewerExif.innerHTML = exifHTML;
            }

            if (viewerCounter) {
                viewerCounter.textContent = `${currentIndex + 1} of ${visibleItems.length}`;
            }

            // Update URL hash for deep-linking
            const photoId = targetItem.id || targetItem.dataset.id;
            if (updateHash && photoId && window.history.replaceState) {
                const url = new URL(window.location);
                url.hash = photoId;
                window.history.replaceState({}, '', url);
            }

            viewer.classList.add('active');
            document.body.style.overflow = 'hidden';
            closeBtn.focus();
        }

        function closeViewer() {
            viewer.classList.remove('active');
            document.body.style.overflow = '';
            setZoom(false);

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }

            if (window.history.replaceState) {
                const url = new URL(window.location);
                url.hash = '';
                window.history.replaceState({}, '', url);
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

        function copyCurrentPhotoLink() {
            const visibleItems = getVisibleItems();
            const currentItem = visibleItems[currentIndex];
            if (!currentItem) return;

            const photoId = currentItem.id || currentItem.dataset.id || '';
            const shareUrl = `${window.location.origin}${window.location.pathname}#${photoId}`;

            navigator.clipboard.writeText(shareUrl).then(() => {
                showToast('Photo direct link copied to clipboard!');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Photo direct link copied to clipboard!');
            });
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
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
        if (zoomBtn) zoomBtn.addEventListener('click', toggleZoom);
        if (viewerImg) viewerImg.addEventListener('click', toggleZoom);
        if (shareBtn) shareBtn.addEventListener('click', copyCurrentPhotoLink);

        viewer.addEventListener('click', (e) => {
            if (e.target === viewer || e.target.classList.contains('viewer-container') || e.target.id === 'viewerStage') {
                closeViewer();
            }
        });

        // Keyboard navigation and accessibility focus trap
        document.addEventListener('keydown', (e) => {
            if (!viewer.classList.contains('active')) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                closeViewer();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                showNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                showPrev();
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            } else if (e.key === 'z' || e.key === 'Z') {
                toggleZoom();
            } else if (e.key === 's' || e.key === 'S') {
                copyCurrentPhotoLink();
            } else if (e.key === 'Tab') {
                // Focus trap
                const focusable = viewer.querySelectorAll('button:not([disabled])');
                if (focusable.length > 0) {
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
            }
        });

        // Touch swipe handling
        let touchStartX = 0;
        let touchEndX = 0;
        viewer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (!isZoomed) {
                const swipeThreshold = 45;
                if (touchEndX < touchStartX - swipeThreshold) {
                    showNext();
                } else if (touchEndX > touchStartX + swipeThreshold) {
                    showPrev();
                }
            }
        }, { passive: true });

        // Deep linking check on initial page load
        if (window.location.hash) {
            const hashId = window.location.hash.replace('#', '');
            const matchingItem = galleryItems.find(item => item.id === hashId || item.dataset.id === hashId);
            if (matchingItem) {
                const category = matchingItem.dataset.category;
                if (category && currentCategory !== 'all' && currentCategory !== category) {
                    setCategory('all');
                }
                setTimeout(() => {
                    const visibleItems = getVisibleItems();
                    const index = visibleItems.indexOf(matchingItem);
                    if (index !== -1) {
                        openViewer(index, false);
                    }
                }, 100);
            }
        }
    }

    // -------------------------------------------------------------
    // 6. Copy Email Button
    // -------------------------------------------------------------
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'razvanperjeru@icloud.com';
            navigator.clipboard.writeText(email).then(() => {
                showToast('Email copied to clipboard!');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast('Email copied to clipboard!');
            });
        });
    }

    // -------------------------------------------------------------
    // 7. Contact Form Handling
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function() {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending Message...</span>`;
        });
    }

    // -------------------------------------------------------------
    // 8. Back to Top Button
    // -------------------------------------------------------------
    const backToTopLink = document.querySelector('.back-to-top');
    if (backToTopLink) {
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
