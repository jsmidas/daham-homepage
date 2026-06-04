/* =============================================
   W2O SALADA - Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // === 헤더 스크롤 효과 ===
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // === 모바일 메뉴 ===
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // === 스무스 스크롤 ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // === 메뉴 필터 ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            menuCards.forEach(card => {
                const category = card.dataset.category;

                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.classList.add('show');
                    card.style.display = '';
                } else {
                    card.classList.add('hidden');
                    card.classList.remove('show');
                    setTimeout(() => {
                        if (card.classList.contains('hidden')) {
                            card.style.display = 'none';
                        }
                    }, 400);
                }
            });
        });
    });

    // === 리뷰 슬라이더 ===
    const reviewTrack = document.getElementById('reviewTrack');
    const prevBtn = document.getElementById('reviewPrev');
    const nextBtn = document.getElementById('reviewNext');

    if (reviewTrack && prevBtn && nextBtn) {
        let currentSlide = 0;
        const cards = reviewTrack.querySelectorAll('.review-card');
        let cardsPerView = getCardsPerView();
        let totalSlides = Math.max(0, cards.length - cardsPerView);

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function updateSlider() {
            const gap = 24;
            const cardWidth = cards[0].offsetWidth + gap;
            reviewTrack.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
        }

        prevBtn.addEventListener('click', () => {
            currentSlide = Math.max(0, currentSlide - 1);
            updateSlider();
        });

        nextBtn.addEventListener('click', () => {
            currentSlide = Math.min(totalSlides, currentSlide + 1);
            updateSlider();
        });

        // 자동 슬라이드
        let autoSlide = setInterval(() => {
            currentSlide = currentSlide >= totalSlides ? 0 : currentSlide + 1;
            updateSlider();
        }, 4000);

        // 호버 시 자동 슬라이드 정지
        reviewTrack.addEventListener('mouseenter', () => clearInterval(autoSlide));
        reviewTrack.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => {
                currentSlide = currentSlide >= totalSlides ? 0 : currentSlide + 1;
                updateSlider();
            }, 4000);
        });

        // 리사이즈 대응
        window.addEventListener('resize', () => {
            cardsPerView = getCardsPerView();
            totalSlides = Math.max(0, cards.length - cardsPerView);
            currentSlide = 0;
            updateSlider();
        });

        // 터치 스와이프
        let startX = 0;
        let isDragging = false;

        reviewTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        reviewTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diff = startX - e.touches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentSlide < totalSlides) {
                    currentSlide++;
                } else if (diff < 0 && currentSlide > 0) {
                    currentSlide--;
                }
                updateSlider();
                isDragging = false;
            }
        });

        reviewTrack.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // === 스크롤 인디케이터 숨기기 ===
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 200) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });
    }

});
