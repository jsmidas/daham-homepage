/* =============================================
   W2O SALADA - Animation Engine
   ============================================= */

const AnimationEngine = {

    // 스크롤 트리거 애니메이션 (Intersection Observer)
    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.anim-reveal, .anim-fade-up, .anim-slide-left, .anim-slide-right, .anim-scale')
            .forEach(el => observer.observe(el));
    },

    // 히어로 페이드인 (페이지 로드 시)
    initHeroAnimations() {
        setTimeout(() => {
            document.querySelectorAll('.hero .anim-fade-up').forEach(el => {
                el.classList.add('visible');
            });
        }, 500);
    },

    // 타이핑 애니메이션
    initTypingEffect() {
        const el = document.getElementById('typingText');
        if (!el) return;

        const phrases = [
            '맵시를 다함 !',
            '건강관리 Let\'s Start',
            '새벽의 신선함을 깨웁니다.',
        ];

        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function type() {
            const current = phrases[phraseIndex];

            if (isDeleting) {
                el.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                el.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === current.length) {
                typingSpeed = 2000; // 완성 후 대기
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingSpeed = 500; // 다음 문구 전 대기
            }

            setTimeout(type, typingSpeed);
        }

        setTimeout(type, 1200);
    },

    // 카운트업 애니메이션
    initCountUp() {
        const counters = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const current = Math.floor(easedProgress * target);

            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(update);
    },

    // 패럴랙스 효과
    initParallax() {
        const heroBg = document.querySelector('.hero-bg');
        if (!heroBg) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    if (scrolled < window.innerHeight) {
                        heroBg.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    // 타임라인 프로그레스
    initTimelineProgress() {
        const progressBar = document.getElementById('timelineProgress');
        const timeline = document.querySelector('.delivery-timeline');
        const dots = document.querySelectorAll('.timeline-dot');
        if (!progressBar || !timeline) return;

        const scrollHandler = () => {
            this.updateTimeline(progressBar, timeline, dots);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrollHandler();
                    window.addEventListener('scroll', scrollHandler);
                } else {
                    window.removeEventListener('scroll', scrollHandler);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(timeline);
    },

    updateTimeline(progressBar, timeline, dots) {
        const rect = timeline.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const timelineTop = rect.top;
        const timelineHeight = rect.height;

        let progress = (viewportHeight - timelineTop) / (timelineHeight + viewportHeight * 0.5);
        progress = Math.max(0, Math.min(1, progress));

        progressBar.style.height = `${progress * 100}%`;

        dots.forEach((dot, index) => {
            const dotProgress = (index + 1) / dots.length;
            if (progress >= dotProgress * 0.8) {
                dot.classList.add('reached');
            }
        });
    },

    // 스플래시 화면
    initSplash() {
        const splash = document.getElementById('splash');
        if (!splash) return;

        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => {
                splash.style.display = 'none';
            }, 600);
        }, 1500);
    },

    // 전체 초기화
    init() {
        this.initSplash();
        this.initScrollReveal();
        this.initHeroAnimations();
        this.initTypingEffect();
        this.initCountUp();
        this.initParallax();
        this.initTimelineProgress();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AnimationEngine.init();
});
