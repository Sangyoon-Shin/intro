/**
 * ==========================================================================
 * [JAVASCRIPT] CORE INTERACTION LOGIC
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. 스크롤 인터랙션: 요소가 화면에 나타날 때 순차적으로 투명도가 제어되는 로직
    // ----------------------------------------------------------------------
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    const handleScrollFade = () => {
        // 브라우저 뷰포트 하단에서 약 80% 지점을 트리거 포인트로 지정
        const triggerBottom = (window.innerHeight / 5) * 4; 
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            // 요소 상단이 트리거 라인보다 위로 올라오면 클래스를 주입합니다
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    };
    
    // 첫 로드 시 화면 안에 있는 요소 검사를 위해 초기 실행 수행
    handleScrollFade();
    window.addEventListener('scroll', handleScrollFade);


    // ----------------------------------------------------------------------
    // 2. 활성화 섹션 추적 로직: 현재 스크롤 위치에 맞추어 네비게이션 메뉴 상태 변경
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    const handleNavigationHighlight = () => {
        let currentSectionId = 'home'; // 기본 섹션 아이디 지정
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            
            // 상단 고정 헤더 영역의 마진 오프셋 계산(120px)하여 도달 판단
            if (window.scrollY >= sectionTop - 120) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // 각 메뉴 아이템을 돌며 data-section 값과 매칭되는 엘리먼트에 active 주입
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === currentSectionId) {
                item.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleNavigationHighlight);
});