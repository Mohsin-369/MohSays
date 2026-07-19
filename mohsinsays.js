let gameSeq = [];
let userSeq = [];
let btns = ["yellow", "red", "purple", "green"];

let h2 = document.querySelector("#status-text");
let levelVal = document.querySelector("#level-val");
let highScoreVal = document.querySelector("#high-score-val");
let startBtn = document.querySelector("#start-btn");
let soundBtn = document.querySelector("#sound-btn");
let soundIcon = document.querySelector("#sound-icon");
let soundText = document.querySelector("#sound-text");
let gameContainer = document.querySelector("#game-container");

let started = false;
let level = 0;
let highScore = localStorage.getItem("mohsinHighScore") || 0;
highScoreVal.innerText = highScore;

let audioCtx = null;
let soundEnabled = true;

const frequencies = {
    yellow: 261.63,
    red: 329.63,
    purple: 440.00,
    green: 392.00
};

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(freq, type = "sine", duration = 0.35) {
    if (!soundEnabled) return;
    initAudio();
    
    let osc = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playGameOverSound() {
    if (!soundEnabled) return;
    initAudio();
    
    let osc = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(70, audioCtx.currentTime + 0.6);
    
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
}

document.addEventListener("keypress", function (event) {
    if (started == false) {
        startGame();
    }
});

startBtn.addEventListener("click", function () {
    if (started == false) {
        startGame();
    }
});

soundBtn.addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        soundIcon.innerText = "🔊";
        soundText.innerText = "Sound On";
        playTone(392.00, "sine", 0.15);
    } else {
        soundIcon.innerText = "🔇";
        soundText.innerText = "Sound Muted";
    }
});

function startGame() {
    console.log("game is started");
    started = true;
    startBtn.innerText = "Running...";
    startBtn.disabled = true;
    
    playTone(523.25, "sine", 0.2);
    setTimeout(levelUp, 600);
}

// Mohsin ki selection flash animation
function gameFlash(btn) {
    btn.classList.add("flash");
    setTimeout(function () {
        btn.classList.remove("flash");
    }, 250);
}

// User click selection action animation
function userFlash(btn) {
    btn.classList.add("userflash");
    setTimeout(function () {
        btn.classList.remove("userflash");
    }, 200);
}

function levelUp() {
    userSeq = [];
    level++;
    levelVal.innerText = level;
    
    h2.innerHTML = `Mohsin's Turn <span class="accent">...</span>`;
    document.querySelector(".btn-container").classList.add("mohsin-turn-active");

    let randIdx = Math.floor(Math.random() * 4); 
    let randColor = btns[randIdx];
    
    gameSeq.push(randColor);
    console.log("Game sequence:", gameSeq);

    playFullSequence();
}

function playFullSequence() {
    let delay = 0;
    
    gameSeq.forEach((color, index) => {
        setTimeout(() => {
            let currentBtn = document.querySelector(`#${color}`);
            gameFlash(currentBtn);
            playTone(frequencies[color]);
            
            if (index === gameSeq.length - 1) {
                setTimeout(() => {
                    h2.innerHTML = `Your Turn <span class="accent">!</span>`;
                    document.querySelector(".btn-container").classList.remove("mohsin-turn-active");
                }, 400);
            }
        }, delay);
        delay += 600;
    });
}

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {
        if (userSeq.length === gameSeq.length) {
            setTimeout(levelUp, 1000);
        }
    } else {
        h2.innerHTML = `Game Over! Score was <span class="accent">${level}</span>.<br>Press any key or Start to reset.`;
        
        if (level > highScore) {
            highScore = level;
            localStorage.setItem("mohsinHighScore", highScore);
            highScoreVal.innerText = highScore;
            highScoreVal.parentElement.classList.add("highlight");
        }

        playGameOverSound();
        
        document.querySelector("body").classList.add("red-flash-bg");
        gameContainer.classList.add("game-over-shake");
        
        setTimeout(function () {
            document.querySelector("body").classList.remove("red-flash-bg");
        }, 300);
        
        setTimeout(function () {
            gameContainer.classList.remove("game-over-shake");
        }, 500);

        reset();
    }
}

function btnPress() {
    let btn = this;
    
    userFlash(btn);
    let userColor = btn.getAttribute("id");
    
    playTone(frequencies[userColor]);
    userSeq.push(userColor);
    
    checkAns(userSeq.length - 1);
}

let allBtns = document.querySelectorAll(".btn");
for (let btn of allBtns) {
    btn.addEventListener("click", btnPress);
}

function reset() {
    started = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    
    startBtn.innerText = "Start Game";
    startBtn.disabled = false;
    document.querySelector(".btn-container").classList.remove("mohsin-turn-active");
}