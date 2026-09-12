document.addEventListener('DOMContentLoaded', () => {
    // 1. Gallery Filtering Setup
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));

    function getVisibleImages() {
        return galleryItems
            .filter(item => !item.classList.contains('hidden'))
            .map(item => item.querySelector('img'))
            .filter(Boolean);
    }

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                galleryItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // 2. Lightbox Setup with Captions
    const allGalleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
    if (allGalleryImages.length > 0) {
        let viewer = document.getElementById('photoViewer');
        let viewerImg, closeBtn, prevBtn, nextBtn, viewerCaption;

        if (!viewer) {
            viewer = document.createElement('div');
            viewer.id = 'photoViewer';
            viewer.className = 'photo-viewer';
            viewer.innerHTML = `
                <button type="button" class="viewer-close" id="viewerClose" aria-label="Close">&times;</button>
                <button type="button" class="viewer-prev" id="viewerPrev" aria-label="Previous">&lsaquo;</button>
                <img class="viewer-image" id="viewerImg" src="" alt="Photo Full View">
                <div class="viewer-caption" id="viewerCaption"></div>
                <button type="button" class="viewer-next" id="viewerNext" aria-label="Next">&rsaquo;</button>
            `;
            document.body.appendChild(viewer);
        }

        viewerImg = document.getElementById('viewerImg');
        closeBtn = document.getElementById('viewerClose');
        prevBtn = document.getElementById('viewerPrev');
        nextBtn = document.getElementById('viewerNext');
        viewerCaption = document.getElementById('viewerCaption');

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

        // Attach click handlers to gallery images
        allGalleryImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                const visibleImages = getVisibleImages();
                const visibleIndex = visibleImages.indexOf(img);
                if (visibleIndex !== -1) {
                    openViewer(visibleIndex);
                }
            });
        });

        // Control event listeners
        closeBtn.addEventListener('click', closeViewer);
        nextBtn.addEventListener('click', showNext);
        prevBtn.addEventListener('click', showPrev);

        // Close when clicking overlay outside the image and control buttons
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                closeViewer();
            }
        });

        // Keyboard navigation
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
    }

    // 3. Smooth Back To Top behavior
    const backToTopLink = document.querySelector('.back-to-top');
    if (backToTopLink) {
        backToTopLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
