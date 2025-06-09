// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    const header = document.querySelector('.header');
    
    // 헤더 스크롤 효과
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
        
        lastScrollY = currentScrollY;
    });
    
    // 슬라이딩 배너 기능
    function initSlider() {
        const sliderElement = document.querySelector('.banner-slider');
        if (!sliderElement) return;

        const slides = sliderElement.querySelectorAll('.banner-slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = sliderElement.parentElement.querySelector('.banner-prev');
        const nextBtn = sliderElement.parentElement.querySelector('.banner-next');
        const bannerSection = document.querySelector('.sliding-banner-section');
        let currentSlide = 0;
        let activeBanners = [];
        
        if (!slides.length) return;
        
        // 배너 상태 확인 및 동적 표시 설정
        async function updateBannerVisibility() {
            try {
                const response = await fetch('/api/banners');
                const result = await response.json();
                
                if (result.banners) {
                    activeBanners = [];
                    
                    // 모든 슬라이드와 도트를 일단 숨김
                    slides.forEach((slide, index) => {
                        slide.classList.add('hidden');
                        slide.classList.remove('active');
                    });
                    
                    dots.forEach((dot, index) => {
                        dot.classList.add('hidden');
                        dot.classList.remove('active');
                    });
                    
                    // 활성 배너만 표시
                    result.banners.forEach((banner, index) => {
                        if (banner.hasAny) {
                            activeBanners.push(index);
                            slides[index].classList.remove('hidden');
                            dots[index].classList.remove('hidden');
                        }
                    });
                    
                    // 활성 배너가 없으면 전체 섹션 숨김
                    if (activeBanners.length === 0) {
                        bannerSection.classList.add('no-banners');
                        return;
                    } else {
                        bannerSection.classList.remove('no-banners');
                    }
                    
                    // 첫 번째 활성 배너를 현재 슬라이드로 설정
                    currentSlide = 0;
                    showSlide(0);
                    
                    console.log(`✅ 활성 배너: ${activeBanners.length}개`);
                }
            } catch (error) {
                console.error('배너 상태 확인 오류:', error);
                // 에러 시 모든 배너 표시
                activeBanners = [0, 1, 2, 3, 4];
                bannerSection.classList.remove('no-banners');
            }
        }
        
        function showSlide(index) {
            if (activeBanners.length === 0) return;
            
            // 모든 활성 슬라이드 숨기기
            activeBanners.forEach(bannerIndex => {
                slides[bannerIndex].classList.remove('active');
                dots[bannerIndex].classList.remove('active');
            });
            
            // 현재 슬라이드 표시
            const activeIndex = activeBanners[index];
            slides[activeIndex].classList.add('active');
            dots[activeIndex].classList.add('active');
        }
        
        function nextSlide() {
            if (activeBanners.length === 0) return;
            currentSlide = (currentSlide + 1) % activeBanners.length;
            showSlide(currentSlide);
        }
        
        function prevSlide() {
            if (activeBanners.length === 0) return;
            currentSlide = (currentSlide - 1 + activeBanners.length) % activeBanners.length;
            showSlide(currentSlide);
        }
        
        // 버튼 이벤트
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        // 도트 이벤트 (활성 배너 인덱스 기준으로)
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const activeIndex = activeBanners.indexOf(index);
                if (activeIndex !== -1) {
                    currentSlide = activeIndex;
                    showSlide(currentSlide);
                }
            });
        });
        
        // 자동 슬라이드 (5초마다, 활성 배너가 2개 이상일 때만)
        setInterval(() => {
            if (activeBanners.length > 1) {
                nextSlide();
            }
        }, 5000);
        
        // 초기 배너 상태 확인
        updateBannerVisibility();
        
        // 주기적으로 배너 상태 확인 (30초마다)
        setInterval(updateBannerVisibility, 30000);
    }
    
    // 슬라이더 초기화
    initSlider();
    
    // 치료 프로그램 슬라이더 초기화
    function initTreatmentSlider() {
        const swiperElement = document.querySelector('.treatment-programs-slider');
        if (swiperElement) {
            // 기존 Swiper 인스턴스가 있다면 제거
            if (swiperElement.swiper) {
                swiperElement.swiper.destroy(true, true);
            }
            
            const swiper = new Swiper('.treatment-programs-slider', {
                // 기본 설정
                slidesPerView: 'auto',
                spaceBetween: 15,
                freeMode: true,
                grabCursor: true,
                
                // 페이지네이션
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
                
                // 네비게이션
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                
                // 모바일 전용 설정
                breakpoints: {
                    // 모바일
                    320: {
                        slidesPerView: 1.2,
                        spaceBetween: 15,
                        centeredSlides: false,
                        freeMode: false,
                        loop: false
                    },
                    // 큰 모바일
                    480: {
                        slidesPerView: 1.3,
                        spaceBetween: 20,
                        centeredSlides: false,
                        freeMode: false,
                        loop: false
                    },
                    // 태블릿
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                        centeredSlides: false,
                        freeMode: false,
                        loop: true
                    },
                    // 데스크톱
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                        centeredSlides: false,
                        freeMode: false,
                        loop: true
                    }
                },
                
                // 터치 설정
                touchRatio: 1,
                threshold: 5,
                touchStartPreventDefault: false,
                
                // 추가 설정
                watchSlidesProgress: true,
                watchOverflow: true,
                
                // 이벤트
                on: {
                    init: function () {
                        console.log('✅ 치료프로그램 슬라이더 초기화 완료');
                        
                        // 모바일에서 강제로 터치 활성화
                        if (window.innerWidth <= 768) {
                            this.allowTouchMove = true;
                            this.touchEventsTarget = 'container';
                        }
                    },
                    resize: function () {
                        this.update();
                    }
                }
            });
            
            // 전역 변수로 저장하여 디버깅 가능
            window.treatmentSwiper = swiper;
            
            return swiper;
        } else {
            console.error('❌ 치료프로그램 슬라이더 요소를 찾을 수 없습니다');
        }
    }
    initTreatmentSlider();
    
    // 모바일 메뉴 토글
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // 배경 스크롤 방지
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                // 모든 드롭다운 닫기
                const dropdowns = document.querySelectorAll('.dropdown-menu');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
        
        // 메뉴 항목 클릭 시 메뉴 닫기 (드롭다운이 아닌 경우)
        const menuItems = navMenu.querySelectorAll('a:not(.dropdown .nav-link)');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
                // 모든 드롭다운 닫기
                const dropdowns = document.querySelectorAll('.dropdown-menu');
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            });
        });
        
        // 모바일에서 드롭다운 토글 기능
        const dropdownLinks = document.querySelectorAll('.dropdown .nav-link');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const dropdown = this.nextElementSibling;
                const isActive = dropdown.classList.contains('active');
                
                // 다른 드롭다운 모두 닫기
                const allDropdowns = document.querySelectorAll('.dropdown-menu');
                allDropdowns.forEach(menu => {
                    if (menu !== dropdown) {
                        menu.classList.remove('active');
                    }
                });
                
                // 현재 드롭다운 토글
                dropdown.classList.toggle('active');
                
                // 아이콘 회전 효과
                const icon = this.querySelector('i');
                if (icon) {
                    if (dropdown.classList.contains('active')) {
                        icon.style.transform = 'rotate(180deg)';
                    } else {
                        icon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        });
    }
    
    // 부드러운 스크롤 효과
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들
    const animatedElements = document.querySelectorAll('.subject-card, .program-card, .info-card, .review-card, .facility-card, .service-item');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // 플로팅 버튼 이벤트 - 위치 버튼을 네이버 지도로 직접 연결
    const locationFloatingBtn = document.querySelector('.floating-btn.location-btn');
    const topBtn = document.querySelector('.top-btn');
    
    if (locationFloatingBtn) {
        locationFloatingBtn.addEventListener('click', function() {
            // 네이버 지도로 직접 이동 (네이버 지도에서 보기 버튼과 동일)
            const hospitalName = '송파바른정형외과의원';
            const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(hospitalName)}/place/1470136115?c=127.1049005,37.5001258,15,0,0,0,dh`;
            window.open(mapUrl, '_blank');
        });
    }
    
    // 상단으로 스크롤 버튼 표시/숨김
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            topBtn.style.display = 'flex';
            topBtn.style.opacity = '1';
            topBtn.style.transform = 'scale(1)';
        } else {
            topBtn.style.opacity = '0';
            topBtn.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (window.scrollY <= 300) {
                    topBtn.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // 모든 예약 버튼에 이벤트 추가
    const allReservationBtns = document.querySelectorAll('.reservation-btn, .btn-primary');
    
    allReservationBtns.forEach(btn => {
        if (btn.textContent.includes('진료 예약') || btn.textContent.includes('전화')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const phoneNumber = '02-423-5501';
                
                if (window.innerWidth <= 768) {
                    // 모바일에서는 바로 전화
                    window.open(`tel:${phoneNumber}`);
                } else {
                    // 데스크톱에서는 확인 후 전화
                    const modal = createModal(
                        '전화 예약',
                        `
                        <div class="call-content">
                            <i class="fas fa-phone" style="color: #475569; font-size: 48px; margin-bottom: 20px;"></i>
                            <h3>전화로 예약하시겠습니까?</h3>
                            <p class="phone-number">${phoneNumber}</p>
                            <p class="call-notice">통화 연결 후 예약 상담을 받으실 수 있습니다.</p>
                        </div>
                        `,
                        [
                            {
                                text: '취소',
                                class: 'btn btn-outline',
                                action: () => closeModal()
                            },
                            {
                                text: '전화걸기',
                                class: 'btn btn-primary',
                                action: () => {
                                    window.open(`tel:${phoneNumber}`);
                                    closeModal();
                                }
                            }
                        ]
                    );
                }
            });
        }
    });
    
    // 지도 보기 버튼
    const locationBtn = document.querySelector('.location-btn');
    
    if (locationBtn) {
        locationBtn.addEventListener('click', function() {
            const address = '서울 송파구 가락로 78, 3층 302~304호';
            const mapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(address)}`;
            window.open(mapUrl, '_blank');
        });
    }
    
    // 카드 자세히 보기 버튼 이벤트
    const cardBtns = document.querySelectorAll('.card-btn');
    
    cardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const cardTitle = this.closest('.subject-card').querySelector('h3').textContent;
            const symptoms = this.closest('.subject-card').querySelector('.card-symptoms p').textContent;
            
            const modal = createModal(
                cardTitle + ' 상세정보',
                `
                <div class="detail-content">
                    <i class="fas fa-info-circle" style="color: #475569; font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>${cardTitle}</h3>
                    <div class="symptom-info">
                        <h4>주요 증상</h4>
                        <p>${symptoms}</p>
                    </div>
                    <p class="detail-description">해당 질환에 대한 자세한 정보와 치료방법에 대해<br>전문의와 직접 상담받으실 수 있습니다.</p>
                    <div class="contact-info-modal">
                        <p><i class="fas fa-phone"></i> 02-423-5501</p>
                        <p><i class="fas fa-clock"></i> 월~금 09:00-19:00</p>
                        <p><i class="fas fa-calendar-check"></i> 토요일 09:00-14:00</p>
                    </div>
                </div>
                `,
                [
                    {
                        text: '닫기',
                        class: 'btn btn-outline',
                        action: () => closeModal()
                    },
                    {
                        text: '전화 상담',
                        class: 'btn btn-primary',
                        action: () => {
                            window.open('tel:02-423-5501');
                            closeModal();
                        }
                    }
                ]
            );
        });
    });
    
    // 입력 필드 개선된 포커스 효과
    const formInputs = document.querySelectorAll('.form-input, .form-textarea');
    
    formInputs.forEach(input => {
        // 포커스 효과
        input.addEventListener('focus', function() {
            this.parentElement?.classList.add('input-focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement?.classList.remove('input-focused');
        });
        
        // 실시간 유효성 검사 피드백
        if (input.type === 'tel') {
            input.addEventListener('input', function() {
                let value = this.value.replace(/[^0-9]/g, '');
                if (value.length >= 3) {
                    if (value.length <= 7) {
                        value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
                    } else {
                        value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
                    }
                }
                this.value = value;
            });
        }
    });
    
    // 슬라이더 버튼 이벤트
    const slideButtons = document.querySelectorAll('.slide-buttons .btn');
    slideButtons.forEach(btn => {
        if (btn.textContent.includes('오시는길')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const locationSection = document.querySelector('#medical-info');
                if (locationSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = locationSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        } else if (btn.textContent.includes('자세히')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const treatmentSection = document.querySelector('#treatment-programs');
                if (treatmentSection) {
                    const headerHeight = header.offsetHeight;
                    const targetPosition = treatmentSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });
    
    // 페이지 로딩 애니메이션
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
        
        // 슬라이더 요소 순차 애니메이션
        setTimeout(() => {
            const firstSlide = document.querySelector('.swiper-slide-active .slide-text');
            if (firstSlide) {
                firstSlide.style.opacity = '1';
                firstSlide.style.transform = 'translateY(0)';
            }
        }, 500);
    });
    
    // 키보드 접근성 개선
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // ESC 키로 모달 및 메뉴 닫기
            const modal = document.querySelector('.custom-modal');
            if (modal) {
                closeModal();
            } else if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // 성능 최적화: 디바운스된 스크롤 이벤트
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            // 추가 스크롤 기반 애니메이션이 있다면 여기에
        }, 10);
    });
    
    // Hero 섹션 버튼 이벤트 핸들러
    const heroButtons = document.querySelector('.hero-buttons');
    if (heroButtons) {
        const callBtn = heroButtons.querySelector('.btn-primary');
        const facilitiesBtn = heroButtons.querySelector('.btn-outline');
        
        // 전화 문의 버튼
        if (callBtn && callBtn.textContent.includes('전화 문의')) {
            callBtn.addEventListener('click', function() {
                window.open('tel:02-423-5501');
            });
        }
        
        // 병원 둘러보기 버튼
        if (facilitiesBtn && facilitiesBtn.textContent.includes('병원 둘러보기')) {
            facilitiesBtn.addEventListener('click', function() {
                window.location.href = 'facilities.html';
            });
        }
    }
    
    // reservation-btn-main 버튼 이벤트 핸들러
    const reservationBtnMain = document.querySelector('.reservation-btn-main');
    if (reservationBtnMain && reservationBtnMain.textContent.includes('전화 문의하기')) {
        reservationBtnMain.addEventListener('click', function() {
            window.open('tel:02-423-5501');
        });
    }
    
    // 모든 btn-primary 클래스 버튼 중 "전화 문의" 텍스트가 포함된 버튼들 처리
    const allPrimaryBtns = document.querySelectorAll('.btn-primary');
    allPrimaryBtns.forEach(btn => {
        if (btn.textContent.includes('전화 문의') || btn.textContent.includes('전화걸기')) {
            btn.addEventListener('click', function() {
                window.open('tel:02-423-5501');
            });
        }
    });
});

// CSS 스타일 추가
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* 애니메이션 키프레임 */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* 페이지 로딩 애니메이션 */
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .slide-text {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease;
    }
    
    /* 커스텀 모달 스타일 */
    .custom-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: slideUp 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        padding: 24px 30px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 20px;
    }
    
    .modal-header h3 {
        margin: 0;
        font-size: 22px;
        font-weight: 600;
        color: #1a1a1a;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 4px;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: #f8f9fa;
        color: #1a1a1a;
    }
    
    .modal-body {
        padding: 30px;
        text-align: center;
    }
    
    .modal-footer {
        padding: 0 30px 30px;
        display: flex;
        gap: 12px;
        justify-content: center;
    }
    
    .success-content h3 {
        color: #1a1a1a;
        margin-bottom: 20px;
        font-size: 20px;
    }
    
    .booking-summary {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: left;
    }
    
    .booking-summary p {
        margin-bottom: 8px;
        color: #1a1a1a;
    }
    
    .booking-summary strong {
        color: #475569;
        font-weight: 600;
    }
    
    .notice {
        color: #666;
        font-size: 14px;
        margin-top: 16px;
        line-height: 1.5;
    }
    
    .phone-number {
        font-size: 24px;
        font-weight: 700;
        color: #475569;
        margin: 16px 0;
    }
    
    .call-notice {
        color: #666;
        font-size: 14px;
    }
    
    .contact-info-modal {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 12px;
        margin-top: 20px;
    }
    
    .contact-info-modal p {
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #1a1a1a;
    }
    
    .contact-info-modal i {
        color: #475569;
        width: 16px;
    }
    
    .symptom-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 12px;
        margin: 20px 0;
        text-align: left;
    }
    
    .symptom-info h4 {
        color: #475569;
        margin-bottom: 8px;
        font-size: 16px;
    }
    
    .symptom-info p {
        color: #666;
        margin: 0;
    }
    
    .detail-description {
        color: #666;
        line-height: 1.6;
        margin: 20px 0;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    /* 입력 필드 포커스 애니메이션 */
    .input-focused .form-input,
    .input-focused .form-textarea {
        transform: translateY(-1px);
        box-shadow: 0 8px 25px rgba(71, 85, 105, 0.15) !important;
    }
    
    /* 애니메이션 클래스 */
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    /* 모바일 최적화 */
    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
            margin: 20px;
        }
        
        .modal-header {
            padding: 20px 24px 0;
            padding-bottom: 16px;
        }
        
        .modal-body {
            padding: 24px;
        }
        
        .modal-footer {
            padding: 0 24px 24px;
            flex-direction: column;
        }
        
        .modal-footer .btn {
            width: 100%;
        }
        
        .phone-number {
            font-size: 20px;
        }
    }
`;

document.head.appendChild(additionalStyles); 