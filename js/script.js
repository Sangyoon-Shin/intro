document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const progressBar = document.querySelector('.scroll-progress span');
    const menuButton = document.querySelector('.menu-button');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = [...document.querySelectorAll('.main-nav a')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const closeMenu = () => {
        menuButton?.setAttribute('aria-expanded', 'false');
        mainNav?.classList.remove('open');
        document.body.classList.remove('menu-open');
        const label = menuButton?.querySelector('.sr-only');
        if (label) label.textContent = '메뉴 열기';
    };

    menuButton?.addEventListener('click', () => {
        const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(willOpen));
        mainNav?.classList.toggle('open', willOpen);
        document.body.classList.toggle('menu-open', willOpen);
        const label = menuButton.querySelector('.sr-only');
        if (label) label.textContent = willOpen ? '메뉴 닫기' : '메뉴 열기';
    });

    navLinks.forEach((link) => link.addEventListener('click', closeMenu));

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    let scrollTicking = false;
    const updateScrollUI = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, progress)})`;
        header?.classList.toggle('scrolled', window.scrollY > 12);
        scrollTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(updateScrollUI);
            scrollTicking = true;
        }
    }, { passive: true });
    updateScrollUI();

    const revealElements = document.querySelectorAll('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('visible'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: '-35% 0px -55%', threshold: 0 });

        sections.forEach((section) => sectionObserver.observe(section));
    }

    const heroVisual = document.querySelector('.hero-visual');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (heroVisual && finePointer && !reduceMotion) {
        heroVisual.addEventListener('pointermove', (event) => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            heroVisual.style.setProperty('--tilt-x', `${y * -4}deg`);
            heroVisual.style.setProperty('--tilt-y', `${x * 4}deg`);
        });

        heroVisual.addEventListener('pointerleave', () => {
            heroVisual.style.setProperty('--tilt-x', '0deg');
            heroVisual.style.setProperty('--tilt-y', '0deg');
        });
    }

    const quizQuestions = [
        {
            kicker: '쉬는 날',
            question: '상윤이가 더 선호하는 하루는?',
            options: ['밖에서 약속 꽉 채우기', '집에서 유튜브 보며 쉬기'],
            answer: 1,
            note: '집에서 가만히 쉬어야 제대로 충전되는 편입니다.'
        },
        {
            kicker: '성향',
            question: '무언가를 정할 때 더 가까운 쪽은?',
            options: ['미리 계획대로 움직이기', '그날의 흐름에 맡기기'],
            answer: 1,
            note: '고민할 것도 없이 즉흥형에 가깝습니다.'
        },
        {
            kicker: '대화',
            question: '처음 만난 자리에서 상윤이는?',
            options: ['주로 이야기를 꺼내는 편', '주로 이야기를 듣는 편'],
            answer: 1,
            note: '처음에는 듣는 편. 친해지면 수다쟁이로 바뀝니다.'
        },
        {
            kicker: '계절',
            question: '상윤이가 더 좋아하는 계절은?',
            options: ['뜨거운 여름', '선선한 가을'],
            answer: 1,
            note: '정답은 가을! 반대로 여름은 가장 힘든 계절입니다.'
        },
        {
            kicker: '동물',
            question: '보기만 해도 기분이 좋아지는 동물은?',
            options: ['고양이', '리트리버'],
            answer: 1,
            note: '밝고 다정한 리트리버를 좋아합니다.'
        },
        {
            kicker: '스트레스 해소',
            question: '요즘 가장 확실한 기분 전환 방법은?',
            options: ['두 살 조카 영상 보기', '땀날 때까지 운동하기'],
            answer: 0,
            note: '두 살 조카 영상 한 편이면 복잡한 기분도 금방 풀립니다.'
        }
    ];

    const quizContent = document.querySelector('#quiz-content');
    const currentLabel = document.querySelector('#quiz-current');
    const scoreLabel = document.querySelector('#quiz-score');
    const quizProgress = document.querySelector('#quiz-progress-bar');
    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    const resultMessage = () => {
        if (score === quizQuestions.length) return ['완벽합니다!', '벌써 꽤 친해진 것 같은데요?'];
        if (score >= 4) return ['제법 잘 아시네요.', '조금만 더 이야기하면 금방 친해질 수 있겠어요.'];
        if (score >= 2) return ['이제 알아가는 중!', '틀린 만큼 새롭게 알게 된 것도 생겼습니다.'];
        return ['처음부터 다시 친해져요.', '괜찮습니다. 이 페이지를 본 것만으로 이미 첫걸음이에요.'];
    };

    const renderResult = () => {
        const [title, message] = resultMessage();
        if (currentLabel) currentLabel.textContent = '06';
        if (quizProgress) quizProgress.style.width = '100%';
        quizContent.innerHTML = `
            <div class="quiz-result">
                <p class="result-score">${score} / ${quizQuestions.length}</p>
                <h3>${title}</h3>
                <p>${message}</p>
                <button class="quiz-restart" type="button">다시 해보기 ↻</button>
            </div>
        `;

        quizContent.querySelector('.quiz-restart').addEventListener('click', () => {
            currentQuestion = 0;
            score = 0;
            if (scoreLabel) scoreLabel.textContent = '0';
            renderQuestion();
        });
    };

    const selectAnswer = (selectedIndex) => {
        if (answered) return;
        answered = true;

        const question = quizQuestions[currentQuestion];
        const buttons = [...quizContent.querySelectorAll('.quiz-option')];
        const isCorrect = selectedIndex === question.answer;
        if (isCorrect) score += 1;
        if (scoreLabel) scoreLabel.textContent = String(score);

        buttons.forEach((button, index) => {
            button.disabled = true;
            if (index === question.answer) button.classList.add('correct');
            if (index === selectedIndex && !isCorrect) button.classList.add('wrong');
        });

        const feedback = quizContent.querySelector('.quiz-feedback');
        if (feedback) feedback.textContent = `${isCorrect ? '정답!' : '아쉽지만 괜찮아요.'} ${question.note}`;
        const nextButton = quizContent.querySelector('.quiz-next');
        if (nextButton) {
            nextButton.hidden = false;
            nextButton.focus({ preventScroll: true });
        }
    };

    const renderQuestion = () => {
        if (!quizContent) return;
        if (currentQuestion >= quizQuestions.length) {
            renderResult();
            return;
        }

        answered = false;
        const question = quizQuestions[currentQuestion];
        const displayIndex = String(currentQuestion + 1).padStart(2, '0');
        if (currentLabel) currentLabel.textContent = displayIndex;
        if (quizProgress) quizProgress.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

        quizContent.innerHTML = `
            <p class="quiz-question-kicker">${question.kicker}</p>
            <h3 class="quiz-question">${question.question}</h3>
            <div class="quiz-options">
                ${question.options.map((option, index) => `
                    <button class="quiz-option" type="button" data-index="${index}">
                        <small>CHOICE ${String.fromCharCode(65 + index)}</small>
                        ${option}
                    </button>
                `).join('')}
            </div>
            <p class="quiz-feedback" aria-live="polite">둘 중 하나를 선택해주세요.</p>
            <button class="quiz-next" type="button" hidden>${currentQuestion === quizQuestions.length - 1 ? '결과 보기' : '다음 질문'} →</button>
        `;

        quizContent.querySelectorAll('.quiz-option').forEach((button) => {
            button.addEventListener('click', () => selectAnswer(Number(button.dataset.index)));
        });

        quizContent.querySelector('.quiz-next').addEventListener('click', () => {
            currentQuestion += 1;
            renderQuestion();
        });
    };

    renderQuestion();

    const year = document.querySelector('#current-year');
    if (year) year.textContent = String(new Date().getFullYear());
});
