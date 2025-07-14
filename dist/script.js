document.addEventListener('DOMContentLoaded', () => {
    const coinsContainer = document.getElementById('coins-container');
    const leftPan = document.getElementById('left-pan');
    const rightPan = document.getElementById('right-pan');
    const weighButton = document.getElementById('weigh-button');
    const resetButton = document.getElementById('reset-button');
    const hintButton = document.getElementById('hint-button');
    const attemptsLeftSpan = document.getElementById('attempts-left');
    const messageArea = document.getElementById('message-area');
    const scaleArea = document.querySelector('.scale-area');
    const historyLog = document.getElementById('history-log');

    // UI 요소 참조
    const languageSelect = document.getElementById('language-select');
    const coinCountSelect = document.getElementById('coin-count-select');
    const gameTitleText = document.getElementById('game-title-text');
    const mainHeadingText = document.getElementById('main-heading-text');
    const instructionText = document.getElementById('instruction-text');
    const attemptsLeftLabel = document.getElementById('attempts-left-label');
    const languageLabel = document.getElementById('language-label');
    const coinCountLabel = document.getElementById('coin-count-label');
    const leftPanLabel = document.getElementById('left-pan-label');
    const rightPanLabel = document.getElementById('right-pan-label');
    const historyHeadingText = document.getElementById('history-heading-text');

    let coins = [];
    let differentCoinIndex = -1;
    let isHeavy = true;
    let attempts = 3;
    let maxAttempts = 3;
    let selectedCoinForGuess = null;
    let weighCount = 0;
    let hasGuessed = false;
    let currentLanguage = 'ko';
    let currentCoinCount = 6;
    let hintsUsedPerWeighing = {}; // 각 계량 단계별 힌트 사용 여부 추적
    let currentHintMessage = ''; // 현재 표시된 힌트 메시지를 저장할 변수

    // --- 다국어 텍스트 정의 ---
    const translations = {
        ko: {
            gameTitle: "양팔 저울 게임",
            mainHeading: "양팔 저울 게임",
            instruction: "무게가 다른 동전 하나를 {attempts}번의 저울 사용으로 찾아내세요!",
            attemptsLeftLabel: "남은 시도 횟수:",
            weighButton: "무게 재기",
            hintButton: "힌트 보기",
            resetButton: "다시 시작",
            historyHeading: "계량 기록",
            leftPanLabel: "왼쪽",
            rightPanLabel: "오른쪽",
            languageLabel: "언어:",
            coinCountLabel: "동전 개수:",
            coinCountOption6: "6개 동전 ({attempts}회)",
            coinCountOption8: "8개 동전 ({attempts}회)",
            coinCountOption12: "12개 동전 ({attempts}회)",
            weighPrompt: "저울에 동전을 올려주세요!",
            unevenCoins: "양쪽 저울에 같은 개수의 동전을 올려야 합니다!",
            rightHeavy: "오른쪽이 더 무겁습니다!",
            leftHeavy: "왼쪽이 더 무겁습니다!",
            balanced: "양쪽의 무게가 같습니다!",
            noMoreAttempts: "더 이상 저울을 사용할 수 없습니다. 다시 시작하세요!",
            guessPrompt: " 이제 무게가 다른 동전을 찾아보세요!",
            coinSelected: "Coin {coinNum}을(를) 선택하셨습니다. 정답인지 확인하려면 해당 동전을 다시 클릭하세요.",
            historyLogEntry: "<strong>{count}번째 계량:</strong><br>왼쪽: [{leftCoins}] vs 오른쪽: [{rightCoins}]<br>결과: {result}",
            noCoinsOnPan: "없음",
            winMessages: [
                "축하합니다! 무게가 다른 동전을 맞히셨습니다!",
                "탐정의 소질이 확실히 보이네요! 정확히 무게가 다른 동전을 맞히셨습니다.",
                "양팔 저울 만으로 진실을 밝혀낸 당신! 천재가 확실하네요!"
            ],
            loseMessages: [
                "아쉽게도 틀렸네요. 다시 도전해보셔서 꼭 성공해보세요!",
                "탐정이 되기 위해 다시 한 번 도전해볼까요? ",
                "흠... 저울의 생각이 당신의 생각과 달랐나보네요... "
            ],
            correctAnswerIs: " 정답은 Coin {correctCoinNum}였습니다.",
            // --- 단계별 힌트 메시지 ---
            hints: {
                6: [
                    "첫 번째 계량: 동전을 3개씩 양쪽에 올려 무게를 측정해 보세요. 나머지 3개는 밖에 둡니다.",
                    "두 번째 계량: 첫 번째 계량 결과에 따라, 의심되는 동전들을 다시 2개씩 저울에 올리거나, 1개를 밖에 둔 채 1개와 정상 동전을 비교해 보세요.",
                    "마지막 계량: 남은 동전 중 하나가 정답입니다. 정상 동전과 비교하여 정답을 찾으세요!"
                ],
                8: [
                    "첫 번째 계량: 동전을 3개씩 양쪽에 올리고, 나머지 2개는 밖에 두어 무게를 측정해 보세요.",
                    "두 번째 계량: 첫 번째 계량 결과에 따라, 의심되는 동전들을 3개 그룹으로 나누어 1개씩 저울에 올리거나, 2개 그룹으로 나누어 1개와 정상 동전을 비교해 보세요.",
                    "마지막 계량: 남은 동전 중 하나가 정답입니다. 정상 동전과 비교하여 정답을 찾으세요!"
                ],
                12: [
                    "첫 번째 계량: 동전을 4개씩 양쪽에 올리고, 나머지 4개는 밖에 두어 무게를 측정해 보세요.",
                    "두 번째 계량: 첫 번째 계량 결과에 따라, 의심되는 동전들을 3개씩 양쪽에 올리거나, 2개씩 양쪽에 올린 후 밖에 둔 동전과 비교해 보세요.",
                    "마지막 계량: 남은 동전 중 하나가 정답입니다. 정상 동전과 비교하여 정답을 찾으세요!"
                ]
            },
            hintAlreadyUsedForStep: "이번 계량 단계에서는 이미 힌트를 사용하셨습니다.",
            noMoreHints: "더 이상 제공할 힌트가 없습니다."
        },
        en: {
            gameTitle: "Balance Scale Game",
            mainHeading: "Balance Scale Game",
            instruction: "Find the coin with a different weight using the scale {attempts} times!",
            attemptsLeftLabel: "Attempts left:",
            weighButton: "Weigh",
            hintButton: "Show Hint",
            resetButton: "Restart",
            historyHeading: "Weighing History",
            leftPanLabel: "Left",
            rightPanLabel: "Right",
            languageLabel: "Language:",
            coinCountLabel: "Coin Count:",
            coinCountOption6: "6 Coins ({attempts} attempts)",
            coinCountOption8: "8 Coins ({attempts} attempts)",
            coinCountOption12: "12 Coins ({attempts} attempts)",
            weighPrompt: "Please place coins on the scale!",
            unevenCoins: "You must place an equal number of coins on both sides!",
            rightHeavy: "Right side is heavier!",
            leftHeavy: "Left side is heavier!",
            balanced: "Both sides are balanced!",
            noMoreAttempts: "No more attempts left. Please restart the game!",
            guessPrompt: " Now, find the coin with the different weight!",
            coinSelected: "You selected Coin {coinNum}. Click it again to confirm your guess.",
            historyLogEntry: "<strong>Attempt {count}:</strong><br>Left: [{leftCoins}] vs Right: [{rightCoins}]<br>Result: {result}",
            noCoinsOnPan: "None",
            winMessages: [
                "Congratulations! You've found the coin with a different weight!",
                "You definitely have a detective's talent! You correctly identified the odd coin.",
                "You've revealed the truth using only a balance scale! You must be a genius!"
            ],
            loseMessages: [
                "Unfortunately, that's incorrect. Try again to get it right next time! ",
                "Shall we try again to become a detective? ",
                "Hmm... it seems the scale's opinion differed from yours... "
            ],
            correctAnswerIs: " The correct answer was Coin {correctCoinNum}."
            ,
            // --- Step-by-step hint messages ---
            hints: {
                6: [
                    "First Weighing: Try placing 3 coins on each side to measure their weight. Keep the remaining 3 coins aside.",
                    "Second Weighing: Depending on the first weighing result, either place 2 suspicious coins on the scale, or compare 1 suspicious coin with a known normal coin while leaving 1 aside.",
                    "Last Weighing: One of the remaining coins is the answer. Compare it with a normal coin to find the correct one!"
                ],
                8: [
                    "First Weighing: Place 3 coins on each side, leaving 2 coins outside, and measure their weight.",
                    "Second Weighing: Based on the first weighing result, divide the suspicious coins into groups of 3 and place 1 on the scale, or divide into groups of 2 and compare 1 with a normal coin.",
                    "Last Weighing: One of the remaining coins is the answer. Compare it with a normal coin to find the correct one!"
                ],
                12: [
                    "First Weighing: Place 4 coins on each side, leaving 4 coins outside, and measure their weight.",
                    "Second Weighing: Based on the first weighing result, place 3 coins on each side, or place 2 coins on each side and compare with the coins left outside.",
                    "Last Weighing: One of the remaining coins is the answer. Compare it with a normal coin to find the correct one!"
                ]
            },
            hintAlreadyUsedForStep: "You have already used the hint for this weighing step.",
            noMoreHints: "No more hints available."
        }
    };

    // --- UI 텍스트 업데이트 함수 ---
    function updateUIText() {
        const lang = translations[currentLanguage];
        gameTitleText.textContent = lang.gameTitle;
        mainHeadingText.textContent = lang.mainHeading;
        instructionText.textContent = lang.instruction.replace('{attempts}', maxAttempts);
        attemptsLeftLabel.textContent = lang.attemptsLeftLabel;
        weighButton.textContent = lang.weighButton;
        hintButton.textContent = lang.hintButton;
        resetButton.textContent = lang.resetButton;
        historyHeadingText.textContent = lang.historyHeading;
        leftPanLabel.textContent = lang.leftPanLabel;
        rightPanLabel.textContent = lang.rightPanLabel;
        languageLabel.textContent = lang.languageLabel;
        coinCountLabel.textContent = lang.coinCountLabel;

        const coinCountOptions = coinCountSelect.options;
        coinCountOptions[0].textContent = lang.coinCountOption6.replace('{attempts}', 3);
        coinCountOptions[1].textContent = lang.coinCountOption8.replace('{attempts}', 3);
        coinCountOptions[2].textContent = lang.coinCountOption12.replace('{attempts}', 3);
    }

    function getOptimalAttempts(numCoins) {
        return 3;
    }

    /**
     * 게임을 초기화하고 새 게임을 시작합니다.
     */
    function initializeGame() {
        coins = [];
        differentCoinIndex = -1;
        isHeavy = true;
        weighCount = 0;
        hasGuessed = false;
        hintsUsedPerWeighing = {}; // 힌트 사용 기록 초기화
        currentHintMessage = ''; // 현재 힌트 메시지 초기화

        currentCoinCount = parseInt(coinCountSelect.value);
        maxAttempts = getOptimalAttempts(currentCoinCount);
        attempts = maxAttempts;

        coinsContainer.innerHTML = '';
        leftPan.innerHTML = `<span class="pan-label" id="left-pan-label">${translations[currentLanguage].leftPanLabel}</span>`;
        rightPan.innerHTML = `<span class="pan-label" id="right-pan-label">${translations[currentLanguage].rightPanLabel}</span>`;
        messageArea.textContent = ''; // 메시지 영역 초기화
        messageArea.className = 'message-area';
        attemptsLeftSpan.textContent = attempts;
        historyLog.innerHTML = '';
        scaleArea.classList.remove('left-heavy', 'right-heavy');

        weighButton.disabled = false;
        resetButton.disabled = false;
        // 힌트 버튼은 항상 활성화 상태를 유지합니다. (혹은 필요에 따라 비활성화)
        hintButton.disabled = false; 

        for (let i = 0; i < currentCoinCount; i++) {
            const coin = { id: i, weight: 10 };
            coins.push(coin);
            createCoinElement(coin);
        }

        differentCoinIndex = Math.floor(Math.random() * currentCoinCount);
        isHeavy = Math.random() < 0.5;
        coins[differentCoinIndex].weight = isHeavy ? 11 : 9;

        console.log(`정답 동전: Coin ${differentCoinIndex + 1}, ${isHeavy ? '무거움' : '가벼움'}`);

        updateUIText();

        setupDragAndDrop();
        setupCoinGuessing();
    }

    /**
     * 동전 DOM 요소를 생성하고 동전 컨테이너에 추가합니다.
     * @param {object} coin - 동전 객체 ({ id: number, weight: number })
     */
    function createCoinElement(coin) {
        const coinElement = document.createElement('div');
        coinElement.classList.add('coin');
        coinElement.dataset.id = coin.id;
        coinElement.textContent = coin.id + 1;
        coinsContainer.appendChild(coinElement);
    }

    /**
     * 동전의 드래그 앤 드롭 기능을 설정합니다.
     */
    function setupDragAndDrop() {
        const allCoins = document.querySelectorAll('.coin');
        let draggedCoin = null;

        allCoins.forEach(coin => {
            coin.draggable = true;

            coin.addEventListener('dragstart', (e) => {
                draggedCoin = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
            });

            coin.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                draggedCoin = null;
            });

            coin.addEventListener('click', (e) => {
                if (!e.target.closest('.scale-pan')) {
                    selectCoinForGuess(e.target);
                }
            });
        });

        [leftPan, rightPan, coinsContainer].forEach(dropArea => {
            dropArea.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            dropArea.addEventListener('drop', (e) => {
                e.preventDefault();
                const coinId = e.dataTransfer.getData('text/plain');
                const coinElement = document.querySelector(`.coin[data-id="${coinId}"]`);

                if (coinElement) {
                    dropArea.appendChild(coinElement);
                    // 동전을 저울에 올릴 때만 메시지를 초기화합니다.
                    // 기존 힌트 메시지를 지우지 않기 위해 조건 추가
                    if (messageArea.textContent.startsWith("힌트: ")) {
                        // 힌트 메시지가 있다면 그대로 유지하거나 업데이트하지 않습니다.
                    } else {
                        messageArea.textContent = ''; // 다른 메시지가 있다면 지웁니다.
                        messageArea.style.color = '#333';
                    }
                }
            });
        });
    }

    /**
     * 저울에 올려진 동전들의 무게를 비교하고 결과를 표시합니다.
     */
    function weighCoins() {
        if (attempts <= 0) {
            messageArea.textContent = translations[currentLanguage].noMoreAttempts;
            messageArea.classList.add('lose');
            weighButton.disabled = true;
            hintButton.disabled = true; // 게임 종료 시 힌트 버튼 비활성화
            return;
        }

        const leftCoins = Array.from(leftPan.querySelectorAll('.coin')).map(c => parseInt(c.dataset.id));
        const rightCoins = Array.from(rightPan.querySelectorAll('.coin')).map(c => parseInt(c.dataset.id));

        // 유효성 검사
        if (leftCoins.length === 0 && rightCoins.length === 0) {
            messageArea.textContent = translations[currentLanguage].weighPrompt;
            messageArea.style.color = 'orange';
            return;
        }

        if (leftCoins.length !== rightCoins.length) {
            messageArea.textContent = translations[currentLanguage].unevenCoins;
            messageArea.style.color = 'orange';
            return;
        }

        attempts--;
        attemptsLeftSpan.textContent = attempts;
        // 계량 결과 메시지로 덮어쓰기 전에 기존 힌트 메시지를 지웁니다.
        messageArea.textContent = ''; 
        messageArea.style.color = '#333';

        let leftWeight = 0;
        leftCoins.forEach(id => leftWeight += coins[id].weight);

        let rightWeight = 0;
        rightCoins.forEach(id => rightWeight += coins[id].weight);

        scaleArea.classList.remove('left-heavy', 'right-heavy');

        let resultText = '';
        if (leftWeight < rightWeight) {
            resultText = translations[currentLanguage].rightHeavy;
            scaleArea.classList.add('right-heavy');
        } else if (leftWeight > rightWeight) {
            resultText = translations[currentLanguage].leftHeavy;
            scaleArea.classList.add('left-heavy');
        } else {
            resultText = translations[currentLanguage].balanced;
        }
        
        // 계량 결과 메시지를 먼저 보여주고,
        messageArea.textContent = resultText;
        messageArea.style.color = '#333'; // 기본 색상으로 변경

        weighCount++;
        addHistoryLog(weighCount, leftCoins, rightCoins, resultText);

        setTimeout(() => {
            [...leftCoins, ...rightCoins].forEach(id => {
                const coinElement = document.querySelector(`.coin[data-id="${id}"]`);
                if (coinElement) {
                    coinsContainer.appendChild(coinElement);
                }
            });
            leftPan.innerHTML = `<span class="pan-label">${translations[currentLanguage].leftPanLabel}</span>`;
            rightPan.innerHTML = `<span class="pan-label">${translations[currentLanguage].rightPanLabel}</span>`;
            
            // 저울 사용 후, 이전에 저장된 힌트 메시지가 있다면 다시 표시합니다.
            if (currentHintMessage) {
                messageArea.textContent = currentHintMessage;
                messageArea.style.color = 'purple';
            }

        }, 600);

        if (attempts === 0) {
            weighButton.disabled = true;
            // 마지막 시도 후에도 힌트 메시지가 있다면, 그 뒤에 추측 메시지를 추가합니다.
            if (messageArea.textContent.startsWith("힌트: ")) {
                 messageArea.textContent += " " + translations[currentLanguage].guessPrompt;
            } else {
                messageArea.textContent = translations[currentLanguage].guessPrompt;
            }
            messageArea.classList.add('info');
            // 계량 횟수가 모두 소진되면 힌트 버튼 비활성화 (더 이상 계량 단계 힌트가 없음)
            hintButton.disabled = true; 
        }
    }

    /**
     * 계량 기록을 하단 로그 영역에 추가합니다.
     * @param {number} count - 현재 계량 횟수
     * @param {number[]} leftCoins - 왼쪽 저울에 올려진 동전 ID 배열
     * @param {number[]} rightCoins - 오른쪽 저울에 올려진 동전 ID 배열
     * @param {string} result - 계량 결과 텍스트
     */
    function addHistoryLog(count, leftCoins, rightCoins, result) {
        const lang = translations[currentLanguage];
        const logEntry = document.createElement('p');
        const leftCoinNumbers = leftCoins.map(id => id + 1).join(', ') || lang.noCoinsOnPan;
        const rightCoinNumbers = rightCoins.map(id => id + 1).join(', ') || lang.noCoinsOnPan;
        
        logEntry.innerHTML = lang.historyLogEntry
            .replace('{count}', count)
            .replace('{leftCoins}', leftCoinNumbers)
            .replace('{rightCoins}', rightCoinNumbers)
            .replace('{result}', result);
        
        historyLog.appendChild(logEntry);
        historyLog.scrollTop = historyLog.scrollHeight;
    }

    /**
     * 사용자가 최종적으로 추측할 동전을 선택했을 때 스타일을 적용합니다.
     * @param {HTMLElement} coinElement - 선택된 동전의 DOM 요소
     */
    function selectCoinForGuess(coinElement) {
        if (hasGuessed) {
            return;
        }

        if (selectedCoinForGuess) {
            selectedCoinForGuess.classList.remove('selected');
        }
        selectedCoinForGuess = coinElement;
        selectedCoinForGuess.classList.add('selected');
        const lang = translations[currentLanguage];
        messageArea.textContent = lang.coinSelected.replace('{coinNum}', parseInt(selectedCoinForGuess.dataset.id) + 1);
        messageArea.style.color = '#007bff';
        currentHintMessage = ''; // 추측 모드 진입 시 힌트 메시지 초기화 (선택 사항)
    }

    /**
     * 동전 클릭 시 정답을 추측하는 기능을 설정합니다.
     */
    function setupCoinGuessing() {
        const allCoins = document.querySelectorAll('.coin');
        allCoins.forEach(coin => {
            coin.addEventListener('click', (e) => {
                if (e.target.closest('.scale-pan')) {
                    return;
                }
                
                if (hasGuessed) {
                    return;
                }

                if (attempts === 0) { // 남은 시도 횟수가 0일 때만 추측 모드 활성화
                    hasGuessed = true;
                    const guessedCoinId = parseInt(e.target.dataset.id);
                    
                    if (selectedCoinForGuess !== e.target) {
                        if (selectedCoinForGuess) {
                            selectedCoinForGuess.classList.remove('selected');
                        }
                        selectedCoinForGuess = e.target;
                        selectedCoinForGuess.classList.add('selected');
                    }

                    const lang = translations[currentLanguage];
                    if (guessedCoinId === differentCoinIndex) {
                        const randomWinMessage = lang.winMessages[Math.floor(Math.random() * lang.winMessages.length)];
                        messageArea.textContent = randomWinMessage;
                        messageArea.classList.remove('lose');
                        messageArea.classList.add('win');
                    } else {
                        const randomLoseMessage = lang.loseMessages[Math.floor(Math.random() * lang.loseMessages.length)];
                        messageArea.textContent = randomLoseMessage + lang.correctAnswerIs.replace('{correctCoinNum}', differentCoinIndex + 1);
                        messageArea.classList.remove('win');
                        messageArea.classList.add('lose');
                    }
                    weighButton.disabled = true;
                    hintButton.disabled = true; // 게임 종료 시 힌트 버튼 비활성화
                    allCoins.forEach(c => c.removeEventListener('click', (event) => { /* 빈 핸들러 */ }));
                    currentHintMessage = ''; // 게임 종료 시 힌트 메시지 초기화
                } else {
                    selectCoinForGuess(e.target);
                }
            });
        });
    }

    /**
     * 현재 동전 개수와 계량 횟수에 맞는 힌트 메시지를 표시합니다.
     */
    function showHint() {
        const lang = translations[currentLanguage];

        // 현재 보여줄 힌트의 인덱스를 결정
        // weighCount가 0이면 첫 번째 힌트 (인덱스 0), 1이면 두 번째 힌트 (인덱스 1) 등
        const hintIndex = weighCount; 

        // 이미 해당 계량 단계의 힌트를 사용했는지 확인 (다시 누를 때마다 메시지 뜨지 않도록)
        if (hintsUsedPerWeighing[hintIndex]) {
            // 이미 힌트를 본 상태라면, 저장된 힌트 메시지를 다시 보여줍니다.
            if (currentHintMessage) {
                messageArea.textContent = currentHintMessage;
                messageArea.style.color = 'purple';
            } else { // 혹시나 currentHintMessage가 비어있다면 다시 불러옴
                if (currentCoinCount in lang.hints && lang.hints[currentCoinCount].length > hintIndex) {
                    currentHintMessage = "힌트: " + lang.hints[currentCoinCount][hintIndex];
                    messageArea.textContent = currentHintMessage;
                    messageArea.style.color = 'purple';
                } else {
                    messageArea.textContent = lang.noMoreHints;
                    messageArea.style.color = 'red';
                }
            }
            return;
        }

        // 현재 동전 개수에 해당하는 힌트 배열이 있고, 해당 인덱스의 힌트가 존재하는지 확인
        if (currentCoinCount in lang.hints && lang.hints[currentCoinCount].length > hintIndex) {
            const hintMessage = "힌트: " + lang.hints[currentCoinCount][hintIndex];
            messageArea.textContent = hintMessage;
            messageArea.style.color = 'purple';
            hintsUsedPerWeighing[hintIndex] = true; // 현재 단계 힌트 사용 기록
            currentHintMessage = hintMessage; // 힌트 메시지를 저장

            // 힌트 버튼을 비활성화하지 않습니다. 사용자가 여러 번 눌러도 같은 힌트를 유지합니다.
            // hintButton.disabled = true; // 이 줄을 제거하거나 주석 처리
        } else {
            messageArea.textContent = lang.noMoreHints;
            messageArea.style.color = 'red';
            hintButton.disabled = true; // 힌트가 없으면 버튼 비활성화
            currentHintMessage = ''; // 힌트가 없으면 저장된 힌트 메시지 초기화
        }
    }


    // --- 이벤트 리스너 등록 ---
    weighButton.addEventListener('click', weighCoins);
    resetButton.addEventListener('click', initializeGame);
    hintButton.addEventListener('click', showHint);

    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        updateUIText();
        initializeGame();
    });

    coinCountSelect.addEventListener('change', (e) => {
        currentCoinCount = parseInt(e.target.value);
        maxAttempts = getOptimalAttempts(currentCoinCount);
        instructionText.textContent = translations[currentLanguage].instruction.replace('{attempts}', maxAttempts);
        
        initializeGame();
    });

    initializeGame();
});