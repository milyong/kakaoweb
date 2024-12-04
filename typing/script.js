document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
        '동해 물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세',
        '무궁화 삼천리 화려 강산 대한 사람, 대한으로 길이 보전하세',
        '남산 위에 저 소나무, 철갑을 두른 듯 바람 서리 불변함은 우리 기상일세',
        '가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴 일편단심일세'
    ];

    let words = [];
    let wordIndex = 0;
    let startTime;
    let highScore = localStorage.getItem('highScore') || 'N/A';

    const quoteElement = document.getElementById('quote');
    const messageElement = document.getElementById('message');
    const typedValueElement = document.getElementById('typed-value');
    const startButton = document.getElementById('start');
    const resultModal = document.getElementById('result-modal');
    const modalMessage = document.getElementById('modal-message');
    const closeModalButton = document.getElementById('close-modal');

    function showModal(message, highScoreMessage) {
        modalMessage.innerHTML = `${message}<br>${highScoreMessage}`;
        resultModal.style.display = 'block';
    }

    function closeModal() {
        resultModal.style.display = 'none';
    }

    function createFireworkEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            firework.style.setProperty('--x', `${Math.random() * 100 - 50}px`);
            firework.style.setProperty('--y', `${Math.random() * 100 - 50}px`);
            document.body.appendChild(firework);

            setTimeout(() => {
                firework.remove();
            }, 800);
        }
    }

    startButton.addEventListener('click', () => {
        startButton.disabled = true;
        const quoteIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[quoteIndex];
        words = quote.split(' ');
        wordIndex = 0;
        const spanWords = words.map(word => `<span>${word}</span>`);
        quoteElement.innerHTML = spanWords.join(' ');
        quoteElement.children[0].classList.add('highlight'); 
        messageElement.innerText = '';
        typedValueElement.value = '';
        typedValueElement.focus();
        startTime = new Date().getTime();
    });

    typedValueElement.addEventListener('keydown', (e) => {
        if (e.key === ' ') {  // 스페이스바가 눌렸을 때
            e.preventDefault();  // 입력 필드에 공백 추가 방지

            const currentWord = words[wordIndex];
            const typedValue = typedValueElement.value.trim();  // 스페이스를 제외한 입력값

            // 폭죽 효과 생성
            const rect = typedValueElement.getBoundingClientRect();
            createFireworkEffect(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height);

            if (typedValue === currentWord) {
                // 마지막 단어인지 확인
                if (wordIndex === words.length - 1) {
                    const elapsedTime = new Date().getTime() - startTime;
                    const timeInSeconds = (elapsedTime / 1000).toFixed(2);
                    
                    let message = `축하합니다! ${timeInSeconds} 초 걸렸습니다.`;
                    let highScoreMessage = `최고 기록: ${highScore} 초`;

                    if (highScore === 'N/A' || parseFloat(timeInSeconds) < parseFloat(highScore)) {
                        localStorage.setItem('highScore', timeInSeconds);
                        highScore = timeInSeconds;
                        highScoreMessage = `새로운 최고 기록: ${timeInSeconds} 초!`;
                    }

                    showModal(message, highScoreMessage);
                    startButton.disabled = false;
                } else {
                    // 다음 단어로 이동
                    wordIndex++;
                    for (const wordElement of quoteElement.children) {
                        wordElement.classList.remove('highlight');
                    }
                    if (quoteElement.children[wordIndex]) {
                        quoteElement.children[wordIndex].classList.add('highlight');
                    }
                }
            } else {
                typedValueElement.classList.add('error');
                setTimeout(() => typedValueElement.classList.remove('error'), 300);
            }

            // 입력 필드 초기화하여 이전 입력 값이 남지 않도록 설정
            setTimeout(() => typedValueElement.value = '', 0); // 완전히 비우기
        }
    });

    closeModalButton.addEventListener('click', closeModal);
});
