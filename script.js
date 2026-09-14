/* =========================================================
   CYBERHUNT - COMPLETE GAME SCRIPT
   5 LEVEL CYBERSECURITY ACTION GAME
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let animationFrame;

/* =========================================================
   GAME STATE
========================================================= */

const game = {
    playerName: "OPERATIVE",
    character: "nova",

    level: 1,
    xp: 0,
    coins: 0,

    health: 100,
    maxHealth: 100,

    running: false,
    shooting: false,

    keys: {},

    evidenceCollected: 0,
    threatsDestroyed: 0,
    enemiesDefeated: 0,

    decoded: false,
    doorUnlocked: false,

    currentInteraction: null,

    lastShot: 0,
    damageCooldown: 0
};

/* =========================================================
   LEVEL DATA
========================================================= */

const levels = [
    {
        level: 1,
        name: "INFILTRATION",
        objective: "SEARCH THE AREA",
        evidence: 1,
        threats: 2,
        enemies: 2,
        xp: 250,
        coins: 100,

        question:
            "A company loses customer data because an unauthorized person accessed its database. Which part of the CIA Triad was violated?",

        answers: [
            "Confidentiality",
            "Integrity",
            "Availability",
            "Authentication"
        ],

        correct: 0
    },

    {
        level: 2,
        name: "DIGITAL BREACH",
        objective: "STOP THE PHISHING ATTACK",
        evidence: 2,
        threats: 3,
        enemies: 3,
        xp: 350,
        coins: 150,

        question:
            "You receive an email asking you to urgently click a suspicious link and enter your password. What type of attack is this?",

        answers: [
            "Phishing",
            "DDoS",
            "Firewall attack",
            "Backup"
        ],

        correct: 0
    },

    {
        level: 3,
        name: "ENCRYPTED SECTOR",
        objective: "DECODE THE ENCRYPTED SECTOR",
        evidence: 2,
        threats: 4,
        enemies: 3,
        xp: 450,
        coins: 200,

        question:
            "Which technique converts readable information into an unreadable form so that unauthorized users cannot understand it?",

        answers: [
            "Encryption",
            "Compression",
            "Defragmentation",
            "Formatting"
        ],

        correct: 0
    },

    {
        level: 4,
        name: "BLACK SITE",
        objective: "SECURE THE BLACK SITE",
        evidence: 3,
        threats: 5,
        enemies: 4,
        xp: 550,
        coins: 250,

        question:
            "An organization gives employees only the permissions they need to perform their jobs. Which security principle is being used?",

        answers: [
            "Least Privilege",
            "Open Access",
            "Data Duplication",
            "Social Engineering"
        ],

        correct: 0
    },

    {
        level: 5,
        name: "FINAL PROTOCOL",
        objective: "STOP THE FINAL CYBER THREAT",
        evidence: 3,
        threats: 6,
        enemies: 5,
        xp: 750,
        coins: 400,

        question:
            "A hacker secretly monitors network traffic to steal information without changing the data. What type of attack is this?",

        answers: [
            "Passive attack",
            "Active attack",
            "Physical attack",
            "Backup attack"
        ],

        correct: 0
    }
];

/* =========================================================
   GAME OBJECTS
========================================================= */

let player = {
    x: 0,
    y: 0,
    radius: 18,
    speed: 4,
    angle: 0
};

let evidence = [];
let enemies = [];
let threats = [];
let bullets = [];
let particles = [];

let door = {
    x: 0,
    y: 0,
    width: 70,
    height: 100
};

let terminal = {
    x: 0,
    y: 0,
    radius: 28
};

let mouse = {
    x: 0,
    y: 0
};

/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

const screens = {
    loading: document.getElementById("loadingScreen"),
    login: document.getElementById("loginScreen"),
    character: document.getElementById("characterScreen"),
    briefing: document.getElementById("briefingScreen"),
    game: document.getElementById("gameScreen"),
    victory: document.getElementById("victoryScreen")
};

function showScreen(screen) {
    Object.values(screens).forEach(element => {
        if (element) {
            element.classList.remove("active");
            element.style.display = "none";
        }
    });

    if (screen) {
        screen.classList.add("active");
        screen.style.display = "flex";
    }
}

/* =========================================================
   LOADING
========================================================= */

let loadingProgress = 0;

const loadingTimer = setInterval(() => {
    loadingProgress += 5;

    const bar = document.getElementById("loadingProgress");

    if (bar) {
        bar.style.width = loadingProgress + "%";
    }

    if (loadingProgress >= 100) {
        clearInterval(loadingTimer);

        setTimeout(() => {
            showScreen(screens.login);
        }, 400);
    }
}, 60);

/* =========================================================
   LOGIN
========================================================= */

const loginButton = document.getElementById("loginButton");

if (loginButton) {
    loginButton.addEventListener("click", () => {

        const nameInput = document.getElementById("playerName");
        const codeInput = document.getElementById("accessCode");
        const error = document.getElementById("loginError");

        const name = nameInput.value.trim();
        const code = codeInput.value.trim();

        if (!name || !code) {

            if (error) {
                error.textContent =
                    "ENTER OPERATIVE ID AND ACCESS CODE";
                error.style.display = "block";
            }

            return;
        }

        game.playerName = name;

        if (error) {
            error.style.display = "none";
        }

        showScreen(screens.character);
    });
}

/* =========================================================
   CHARACTER SELECTION
========================================================= */

const characterCards =
    document.querySelectorAll("[data-character]");

characterCards.forEach(card => {

    card.addEventListener("click", () => {

        characterCards.forEach(c => {
            c.classList.remove("selected");
        });

        card.classList.add("selected");

        game.character =
            card.dataset.character;

        setTimeout(() => {

            showScreen(screens.briefing);

            const briefingTitle =
                document.querySelector("#briefingScreen h1");

            if (briefingTitle) {
                briefingTitle.textContent =
                    `WELCOME, ${game.playerName.toUpperCase()}`;
            }

        }, 300);
    });
});

/* =========================================================
   START MISSION
========================================================= */

const startMissionButton =
    document.getElementById("startMissionButton");

if (startMissionButton) {
    startMissionButton.addEventListener("click", () => {

        showScreen(screens.game);

        game.level = 1;
        game.xp = 0;
        game.coins = 0;
        game.health = 100;

        startLevel();

    });
}

/* =========================================================
   CANVAS RESIZE
========================================================= */

function resizeCanvas() {

    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (game.running) {
        keepPlayerInside();
    }
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* =========================================================
   START LEVEL
========================================================= */

function startLevel() {

    const level =
        levels[game.level - 1];

    game.running = true;

    game.evidenceCollected = 0;
    game.threatsDestroyed = 0;
    game.enemiesDefeated = 0;

    game.decoded = false;
    game.doorUnlocked = false;

    game.health = 100;

    bullets = [];
    particles = [];

    evidence = [];
    enemies = [];
    threats = [];

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;

    player.angle = 0;

    door.x = canvas.width - 130;
    door.y = canvas.height / 2;

    terminal.x = canvas.width / 2;
    terminal.y = 150;

    createEvidence(level.evidence);
    createThreats(level.threats);
    createEnemies(level.enemies);

    updateHUD();

    showMessage(
        `LEVEL ${game.level}: ${level.name}`,
        2500
    );

    cancelAnimationFrame(animationFrame);
    gameLoop();
}

/* =========================================================
   CREATE EVIDENCE
========================================================= */

function createEvidence(count) {

    for (let i = 0; i < count; i++) {

        evidence.push({
            x: random(100, canvas.width - 100),
            y: random(180, canvas.height - 130),
            collected: false,
            pulse: random(0, Math.PI * 2)
        });
    }
}

/* =========================================================
   CREATE DIGITAL THREATS
========================================================= */

function createThreats(count) {

    for (let i = 0; i < count; i++) {

        threats.push({
            x: random(100, canvas.width - 100),
            y: random(180, canvas.height - 130),
            radius: 16,
            health: 1,
            destroyed: false,
            pulse: random(0, Math.PI * 2)
        });
    }
}

/* =========================================================
   CREATE ENEMIES
========================================================= */

function createEnemies(count) {

    for (let i = 0; i < count; i++) {

        let enemy;

        do {

            enemy = {
                x: random(120, canvas.width - 120),
                y: random(200, canvas.height - 150),
                radius: 20,
                health: 3,
                speed: random(0.5, 1.2),
                angle: 0,
                alive: true,
                shootTimer: random(500, 1500)
            };

        } while (
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            ) < 200
        );

        enemies.push(enemy);
    }
}

/* =========================================================
   INPUT
========================================================= */

window.addEventListener("keydown", event => {

    game.keys[event.key.toLowerCase()] = true;

    if (event.code === "Space") {
        event.preventDefault();
        game.shooting = true;
    }

    if (event.key.toLowerCase() === "e") {
        interact();
    }
});

window.addEventListener("keyup", event => {

    game.keys[event.key.toLowerCase()] = false;

    if (event.code === "Space") {
        game.shooting = false;
    }
});

canvas.addEventListener("mousemove", event => {

    const rect =
        canvas.getBoundingClientRect();

    mouse.x =
        event.clientX - rect.left;

    mouse.y =
        event.clientY - rect.top;

    player.angle =
        Math.atan2(
            mouse.y - player.y,
            mouse.x - player.x
        );
});

canvas.addEventListener("mousedown", () => {
    game.shooting = true;
});

canvas.addEventListener("mouseup", () => {
    game.shooting = false;
});

canvas.addEventListener("mouseleave", () => {
    game.shooting = false;
});

/* =========================================================
   UPDATE PLAYER
========================================================= */

function movePlayer() {

    let dx = 0;
    let dy = 0;

    if (
        game.keys["w"] ||
        game.keys["arrowup"]
    ) {
        dy -= 1;
    }

    if (
        game.keys["s"] ||
        game.keys["arrowdown"]
    ) {
        dy += 1;
    }

    if (
        game.keys["a"] ||
        game.keys["arrowleft"]
    ) {
        dx -= 1;
    }

    if (
        game.keys["d"] ||
        game.keys["arrowright"]
    ) {
        dx += 1;
    }

    if (dx !== 0 || dy !== 0) {

        const magnitude =
            Math.sqrt(dx * dx + dy * dy);

        dx /= magnitude;
        dy /= magnitude;

        player.x +=
            dx * player.speed;

        player.y +=
            dy * player.speed;
    }

    keepPlayerInside();
}

function keepPlayerInside() {

    player.x =
        clamp(
            player.x,
            30,
            canvas.width - 30
        );

    player.y =
        clamp(
            player.y,
            100,
            canvas.height - 40
        );
}

/* =========================================================
   SHOOTING
========================================================= */

function shoot() {

    const now = Date.now();

    if (now - game.lastShot < 180) {
        return;
    }

    game.lastShot = now;

    const speed = 12;

    bullets.push({
        x: player.x +
            Math.cos(player.angle) * 24,

        y: player.y +
            Math.sin(player.angle) * 24,

        vx:
            Math.cos(player.angle) * speed,

        vy:
            Math.sin(player.angle) * speed,

        life: 70
    });

    createParticles(
        player.x +
            Math.cos(player.angle) * 25,

        player.y +
            Math.sin(player.angle) * 25,

        3
    );
}

/* =========================================================
   UPDATE BULLETS
========================================================= */

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        bullet.life--;

        /* Enemy collision */

        enemies.forEach(enemy => {

            if (!enemy.alive) return;

            if (
                distance(
                    bullet.x,
                    bullet.y,
                    enemy.x,
                    enemy.y
                ) <
                enemy.radius + 5
            ) {

                enemy.health--;

                bullet.life = 0;

                createParticles(
                    enemy.x,
                    enemy.y,
                    8
                );

                if (enemy.health <= 0) {

                    enemy.alive = false;

                    game.enemiesDefeated++;

                    game.xp += 50;

                    showMessage(
                        "ENEMY ELIMINATED",
                        800
                    );
                }
            }
        });

        /* Digital threat collision */

        threats.forEach(threat => {

            if (threat.destroyed) return;

            if (
                distance(
                    bullet.x,
                    bullet.y,
                    threat.x,
                    threat.y
                ) <
                threat.radius + 6
            ) {

                threat.destroyed = true;

                bullet.life = 0;

                game.threatsDestroyed++;

                game.xp += 35;

                createParticles(
                    threat.x,
                    threat.y,
                    15
                );

                showMessage(
                    "DIGITAL THREAT DESTROYED",
                    900
                );
            }
        });
    });

    bullets =
        bullets.filter(
            bullet =>
                bullet.life > 0 &&
                bullet.x > 0 &&
                bullet.x < canvas.width &&
                bullet.y > 0 &&
                bullet.y < canvas.height
        );
}

/* =========================================================
   UPDATE ENEMIES
========================================================= */

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;

        const dist =
            Math.sqrt(dx * dx + dy * dy);

        enemy.angle =
            Math.atan2(dy, dx);

        if (dist > 150) {

            enemy.x +=
                Math.cos(enemy.angle) *
                enemy.speed;

            enemy.y +=
                Math.sin(enemy.angle) *
                enemy.speed;
        }

        if (dist < 80) {

            damagePlayer(0.08);
        }
    });
}

/* =========================================================
   DAMAGE PLAYER
========================================================= */

function damagePlayer(amount) {

    if (game.damageCooldown > 0) {
        return;
    }

    game.damageCooldown = 30;

    game.health -= amount;

    if (game.health <= 0) {

        game.health = 0;

        game.running = false;

        showGameOver();
    }

    updateHUD();
}

/* =========================================================
   CHECK EVIDENCE
========================================================= */

function checkEvidence() {

    evidence.forEach(item => {

        if (item.collected) return;

        if (
            distance(
                player.x,
                player.y,
                item.x,
                item.y
            ) < 45
        ) {

            game.currentInteraction = {
                type: "evidence",
                item: item
            };

            return;
        }
    });
}

/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    /* Evidence */

    for (const item of evidence) {

        if (item.collected) continue;

        if (
            distance(
                player.x,
                player.y,
                item.x,
                item.y
            ) < 55
        ) {

            item.collected = true;

            game.evidenceCollected++;

            game.xp += 75;

            createParticles(
                item.x,
                item.y,
                15
            );

            showMessage(
                "PHYSICAL EVIDENCE SECURED",
                1200
            );

            updateHUD();

            return;
        }
    }

    /* Terminal */

    if (
        distance(
            player.x,
            player.y,
            terminal.x,
            terminal.y
        ) < 80
    ) {

        openDecoder();

        return;
    }

    /* Door */

    if (
        distance(
            player.x,
            player.y,
            door.x,
            door.y
        ) < 100
    ) {

        if (game.doorUnlocked) {

            completeLevel();

        } else {

            showMessage(
                "ACCESS DENIED — COMPLETE ALL OBJECTIVES",
                1600
            );
        }
    }
}

/* =========================================================
   UPDATE INTERACTION
========================================================= */

function updateInteraction() {

    let nearby = null;

    for (const item of evidence) {

        if (item.collected) continue;

        if (
            distance(
                player.x,
                player.y,
                item.x,
                item.y
            ) < 55
        ) {

            nearby = "PRESS E — COLLECT EVIDENCE";
            break;
        }
    }

    if (
        distance(
            player.x,
            player.y,
            terminal.x,
            terminal.y
        ) < 80
    ) {

        nearby =
            "PRESS E — ACCESS SECURITY TERMINAL";
    }

    if (
        distance(
            player.x,
            player.y,
            door.x,
            door.y
        ) < 100
    ) {

        nearby = game.doorUnlocked
            ? "PRESS E — EXIT LEVEL"
            : "DOOR LOCKED";
    }

    const box =
        document.getElementById("interactionBox");

    if (box) {

        if (nearby) {

            box.textContent = nearby;
            box.style.display = "block";

        } else {

            box.style.display = "none";
        }
    }
}

/* =========================================================
   LEVEL PROGRESS
========================================================= */

function checkLevelProgress() {

    const level =
        levels[game.level - 1];

    const evidenceDone =
        game.evidenceCollected >=
        level.evidence;

    const threatsDone =
        game.threatsDestroyed >=
        level.threats;

    const enemiesDone =
        game.enemiesDefeated >=
        level.enemies;

    if (
        evidenceDone &&
        threatsDone &&
        enemiesDone &&
        game.decoded
    ) {

        if (!game.doorUnlocked) {

            game.doorUnlocked = true;

            showMessage(
                "ALL OBJECTIVES COMPLETE — EXIT UNLOCKED",
                2200
            );
        }
    }
}

/* =========================================================
   DECODER SYSTEM
========================================================= */

function openDecoder() {

    if (game.decoded) {

        showMessage(
            "SECURITY TERMINAL ALREADY DECODED",
            1200
        );

        return;
    }

    const level =
        levels[game.level - 1];

    createDecoderModal(level);
}

/* =========================================================
   DECODER MODAL
========================================================= */

function createDecoderModal(level) {

    const old =
        document.getElementById("cyberDecoder");

    if (old) {
        old.remove();
    }

    const modal =
        document.createElement("div");

    modal.id = "cyberDecoder";

    modal.innerHTML = `
        <div class="decoder-backdrop">
            <div class="decoder-panel">

                <div class="decoder-top">
                    <span>CYBERHUNT SECURITY TERMINAL</span>
                    <span>LEVEL ${level.level}</span>
                </div>

                <div class="decoder-line"></div>

                <div class="decoder-icon">⌁</div>

                <div class="decoder-title">
                    ENCRYPTED ACCESS PROTOCOL
                </div>

                <div class="decoder-subtitle">
                    SECURITY QUESTION
                </div>

                <div class="decoder-question">
                    ${level.question}
                </div>

                <div class="decoder-options">

                    ${level.answers.map((answer, index) => `
                        <button
                            class="decoder-option"
                            data-answer="${index}">
                            <span>${String.fromCharCode(65 + index)}</span>
                            ${answer}
                        </button>
                    `).join("")}

                </div>

                <div class="decoder-status">
                    SELECT THE CORRECT SECURITY RESPONSE
                </div>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    addDecoderStyles();

    const options =
        modal.querySelectorAll(".decoder-option");

    options.forEach(button => {

        button.addEventListener("click", () => {

            const selected =
                Number(button.dataset.answer);

            if (selected === level.correct) {

                button.classList.add("correct");

                const status =
                    modal.querySelector(".decoder-status");

                status.textContent =
                    "✓ ACCESS GRANTED — SYSTEM DECRYPTED";

                status.classList.add("success");

                game.decoded = true;

                game.xp += 100;

                setTimeout(() => {

                    modal.remove();

                    showMessage(
                        "SECURITY PROTOCOL DECRYPTED",
                        1800
                    );

                    updateHUD();

                }, 1100);

            } else {

                button.classList.add("wrong");

                const status =
                    modal.querySelector(".decoder-status");

                status.textContent =
                    "✕ ACCESS DENIED — INCORRECT RESPONSE";

                status.classList.add("error");

                game.health -= 5;

                if (game.health < 0) {
                    game.health = 0;
                }

                updateHUD();

                setTimeout(() => {

                    button.classList.remove("wrong");

                    status.textContent =
                        "TRY AGAIN — SECURITY BREACH DETECTED";

                    status.classList.remove("error");

                }, 900);
            }
        });
    });
}

/* =========================================================
   DECODER STYLES
========================================================= */

function addDecoderStyles() {

    if (document.getElementById("decoderStyles")) {
        return;
    }

    const style =
        document.createElement("style");

    style.id = "decoderStyles";

    style.textContent = `
        #cyberDecoder {
            position: fixed;
            inset: 0;
            z-index: 99999;
            font-family: Arial, sans-serif;
        }

        .decoder-backdrop {
            position: absolute;
            inset: 0;
            background:
                radial-gradient(
                    circle at center,
                    rgba(100,0,20,.30),
                    rgba(0,0,0,.94) 65%
                );

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;
        }

        .decoder-panel {
            width: min(720px, 95vw);
            background:
                linear-gradient(
                    145deg,
                    #10070b,
                    #050507
                );

            border: 1px solid #ff1744;

            box-shadow:
                0 0 15px rgba(255,23,68,.35),
                0 0 80px rgba(255,23,68,.12);

            padding: 28px;

            position: relative;

            animation:
                decoderAppear .25s ease;
        }

        @keyframes decoderAppear {

            from {
                opacity: 0;
                transform: scale(.95);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        .decoder-top {
            display: flex;
            justify-content: space-between;

            color: #ff3158;

            font-size: 12px;
            font-weight: bold;

            letter-spacing: 2px;
        }

        .decoder-line {
            height: 1px;
            background: #ff1744;

            margin:
                15px 0 25px;
        }

        .decoder-icon {
            width: 55px;
            height: 55px;

            border: 1px solid #ff1744;

            color: #ff1744;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 30px;

            margin-bottom: 18px;

            box-shadow:
                0 0 20px rgba(255,23,68,.2);
        }

        .decoder-title {
            color: #fff;

            font-size: 22px;
            font-weight: bold;

            letter-spacing: 2px;
        }

        .decoder-subtitle {
            color: #ff1744;

            font-size: 11px;

            letter-spacing: 2px;

            margin-top: 10px;
        }

        .decoder-question {
            color: #ddd;

            font-size: 16px;
            line-height: 1.6;

            margin:
                20px 0;
        }

        .decoder-options {
            display: grid;
            grid-template-columns:
                1fr 1fr;

            gap: 12px;
        }

        .decoder-option {
            background: #09090d;

            color: #eee;

            border: 1px solid #333;

            padding: 16px;

            text-align: left;

            cursor: pointer;

            font-size: 14px;

            transition:
                .2s ease;
        }

        .decoder-option span {
            display: inline-flex;

            width: 28px;
            height: 28px;

            align-items: center;
            justify-content: center;

            margin-right: 10px;

            border: 1px solid #ff1744;

            color: #ff1744;
        }

        .decoder-option:hover {
            border-color: #ff1744;

            background: #18070c;

            transform:
                translateY(-2px);
        }

        .decoder-option.correct {
            border-color: #00ff9d;

            background:
                rgba(0,255,157,.12);

            color: #00ff9d;
        }

        .decoder-option.wrong {
            border-color: #ff1744;

            background:
                rgba(255,23,68,.15);

            animation:
                shake .25s;
        }

        @keyframes shake {

            0%,100% {
                transform: translateX(0);
            }

            25% {
                transform: translateX(-6px);
            }

            75% {
                transform: translateX(6px);
            }
        }

        .decoder-status {
            color: #888;

            font-size: 11px;

            letter-spacing: 1px;

            margin-top: 20px;
        }

        .decoder-status.success {
            color: #00ff9d;
        }

        .decoder-status.error {
            color: #ff1744;
        }

        @media(max-width: 600px) {

            .decoder-panel {
                padding: 20px;
            }

            .decoder-title {
                font-size: 17px;
            }

            .decoder-question {
                font-size: 14px;
            }

            .decoder-options {
                grid-template-columns: 1fr;
            }
        }
    `;

    document.head.appendChild(style);
}

/* =========================================================
   COMPLETE LEVEL
========================================================= */

function completeLevel() {

    if (!game.running) return;

    game.running = false;

    const level =
        levels[game.level - 1];

    game.xp += level.xp;
    game.coins += level.coins;

    updateHUD();

    const overlay =
        document.getElementById(
            "levelCompleteOverlay"
        );

    if (overlay) {

        overlay.style.display = "flex";

        const title =
            overlay.querySelector("h1");

        if (title) {
            title.textContent =
                `LEVEL ${game.level} COMPLETE`;
        }

        const text =
            overlay.querySelector("p");

        if (text) {

            text.textContent =
                `+${level.xp} XP  •  +${level.coins} COINS`;
        }
    }
}

/* =========================================================
   NEXT LEVEL
========================================================= */

const nextLevelButton =
    document.getElementById("nextLevelButton");

if (nextLevelButton) {

    nextLevelButton.addEventListener(
        "click",
        () => {

            const overlay =
                document.getElementById(
                    "levelCompleteOverlay"
                );

            if (overlay) {
                overlay.style.display = "none";
            }

            if (game.level >= 5) {

                showVictory();

                return;
            }

            game.level++;

            startLevel();
        }
    );
}

/* =========================================================
   GAME OVER
========================================================= */

function showGameOver() {

    game.running = false;

    const overlay =
        document.getElementById(
            "gameOverOverlay"
        );

    if (overlay) {
        overlay.style.display = "flex";
    }
}

/* =========================================================
   RETRY LEVEL
========================================================= */

const retryButton =
    document.getElementById("retryButton");

if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            const overlay =
                document.getElementById(
                    "gameOverOverlay"
                );

            if (overlay) {
                overlay.style.display = "none";
            }

            startLevel();
        }
    );
}

/* =========================================================
   VICTORY
========================================================= */

function showVictory() {

    game.running = false;

    showScreen(screens.victory);

    const victoryXP =
        document.getElementById("victoryXP");

    const victoryCoins =
        document.getElementById("victoryCoins");

    if (victoryXP) {
        victoryXP.textContent =
            game.xp;
    }

    if (victoryCoins) {
        victoryCoins.textContent =
            game.coins;
    }
}

/* =========================================================
   PLAY AGAIN
========================================================= */

const playAgainButton =
    document.getElementById("playAgainButton");

if (playAgainButton) {

    playAgainButton.addEventListener(
        "click",
        () => {

            game.level = 1;
            game.xp = 0;
            game.coins = 0;
            game.health = 100;

            showScreen(screens.character);
        }
    );
}

/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const level =
        levels[game.level - 1];

    const levelNumber =
        document.getElementById("levelNumber");

    const levelName =
        document.getElementById("levelName");

    const operative =
        document.getElementById("operativeName");

    const xp =
        document.getElementById("xpValue");

    const coins =
        document.getElementById("coinsValue");

    const objective =
        document.getElementById("objectiveText");

    const health =
        document.getElementById("healthFill");

    const healthText =
        document.getElementById("healthValue");

    if (levelNumber) {
        levelNumber.textContent =
            String(game.level).padStart(2, "0");
    }

    if (levelName) {
        levelName.textContent =
            level.name;
    }

    if (operative) {
        operative.textContent =
            game.playerName.toUpperCase();
    }

    if (xp) {
        xp.textContent =
            game.xp;
    }

    if (coins) {
        coins.textContent =
            game.coins;
    }

    if (objective) {
        objective.textContent =
            level.objective;
    }

    if (health) {
        health.style.width =
            game.health + "%";
    }

    if (healthText) {
        healthText.textContent =
            Math.ceil(game.health);
    }
}

/* =========================================================
   GAME MESSAGE
========================================================= */

let messageTimer;

function showMessage(text, duration = 1200) {

    const message =
        document.getElementById(
            "gameMessage"
        );

    if (!message) return;

    message.textContent = text;

    message.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            message.classList.remove("show");

        }, duration);
}

/* =========================================================
   PARTICLES
========================================================= */

function createParticles(x, y, amount) {

    for (let i = 0; i < amount; i++) {

        particles.push({
            x: x,
            y: y,

            vx: random(-3, 3),
            vy: random(-3, 3),

            life: random(20, 45),

            size: random(1, 4)
        });
    }
}

function updateParticles() {

    particles.forEach(particle => {

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.life--;

        particle.vx *= 0.98;
        particle.vy *= 0.98;
    });

    particles =
        particles.filter(
            p => p.life > 0
        );
}

/* =========================================================
   DRAW ARENA
========================================================= */

function drawArena() {

    ctx.fillStyle = "#030305";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    /* Grid */

    ctx.strokeStyle =
        "rgba(255,23,68,.08)";

    ctx.lineWidth = 1;

    const gridSize = 50;

    for (
        let x = 0;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 80);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }

    for (
        let y = 80;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }

    /* Arena border */

    ctx.strokeStyle =
        "rgba(255,23,68,.3)";

    ctx.strokeRect(
        25,
        95,
        canvas.width - 50,
        canvas.height - 125
    );

    /* Neon corners */

    drawCorner(25, 95, 1, 1);
    drawCorner(
        canvas.width - 25,
        95,
        -1,
        1
    );

    drawCorner(
        25,
        canvas.height - 30,
        1,
        -1
    );

    drawCorner(
        canvas.width - 25,
        canvas.height - 30,
        -1,
        -1
    );
}

function drawCorner(x, y, sx, sy) {

    ctx.strokeStyle = "#ff1744";
    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(x, y);
    ctx.lineTo(x + sx * 35, y);

    ctx.moveTo(x, y);
    ctx.lineTo(x, y + sy * 35);

    ctx.stroke();
}

/* =========================================================
   DRAW EVIDENCE
========================================================= */

function drawEvidence() {

    evidence.forEach(item => {

        if (item.collected) return;

        item.pulse += 0.05;

        const glow =
            10 +
            Math.sin(item.pulse) * 5;

        ctx.save();

        ctx.shadowBlur = glow;
        ctx.shadowColor = "#ff1744";

        ctx.fillStyle = "#ff1744";

        ctx.fillRect(
            item.x - 10,
            item.y - 7,
            20,
            14
        );

        ctx.fillStyle = "#111";

        ctx.fillRect(
            item.x - 6,
            item.y - 4,
            12,
            3
        );

        ctx.restore();

        drawLabel(
            "EVIDENCE",
            item.x,
            item.y - 18
        );
    });
}

/* =========================================================
   DRAW DIGITAL THREATS
========================================================= */

function drawThreats() {

    threats.forEach(threat => {

        if (threat.destroyed) return;

        threat.pulse += 0.08;

        ctx.save();

        ctx.translate(
            threat.x,
            threat.y
        );

        ctx.rotate(threat.pulse);

        ctx.shadowBlur = 18;
        ctx.shadowColor = "#ff1744";

        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(0, -18);
        ctx.lineTo(18, 0);
        ctx.lineTo(0, 18);
        ctx.lineTo(-18, 0);
        ctx.closePath();

        ctx.stroke();

        ctx.fillStyle =
            "rgba(255,23,68,.15)";

        ctx.fill();

        ctx.restore();

        drawLabel(
            "THREAT",
            threat.x,
            threat.y - 25
        );
    });
}

/* =========================================================
   DRAW ENEMIES
========================================================= */

function drawEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        ctx.save();

        ctx.translate(
            enemy.x,
            enemy.y
        );

        ctx.rotate(enemy.angle);

        /* Body */

        ctx.fillStyle = "#090909";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            enemy.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 2;

        ctx.stroke();

        /* Head */

        ctx.fillStyle = "#222";

        ctx.beginPath();

        ctx.arc(
            0,
            -15,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        /* Weapon */

        ctx.fillStyle = "#ff1744";

        ctx.fillRect(
            8,
            -3,
            22,
            5
        );

        ctx.restore();

        /* Health */

        ctx.fillStyle = "#222";

        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 32,
            40,
            4
        );

        ctx.fillStyle = "#ff1744";

        ctx.fillRect(
            enemy.x - 20,
            enemy.y - 32,
            (enemy.health / 3) * 40,
            4
        );
    });
}

/* =========================================================
   DRAW TERMINAL
========================================================= */

function drawTerminal() {

    const pulse =
        Math.sin(Date.now() / 300) * 3;

    ctx.save();

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ff1744";

    ctx.strokeStyle = "#ff1744";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        terminal.x,
        terminal.y,
        terminal.radius + pulse,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.fillStyle = "#09090c";

    ctx.beginPath();

    ctx.arc(
        terminal.x,
        terminal.y,
        terminal.radius - 5,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "#ff1744";

    ctx.font =
        "bold 20px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
        game.decoded ? "✓" : "⌁",
        terminal.x,
        terminal.y + 7
    );

    ctx.restore();

    drawLabel(
        game.decoded
            ? "DECRYPTED"
            : "SECURITY TERMINAL",
        terminal.x,
        terminal.y - 40
    );
}

/* =========================================================
   DRAW DOOR
========================================================= */

function drawDoor() {

    ctx.save();

    ctx.shadowBlur =
        game.doorUnlocked
            ? 25
            : 10;

    ctx.shadowColor =
        game.doorUnlocked
            ? "#00ff9d"
            : "#ff1744";

    ctx.strokeStyle =
        game.doorUnlocked
            ? "#00ff9d"
            : "#ff1744";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        door.x - door.width / 2,
        door.y - door.height / 2,
        door.width,
        door.height
    );

    ctx.fillStyle =
        "rgba(255,23,68,.08)";

    if (game.doorUnlocked) {

        ctx.fillStyle =
            "rgba(0,255,157,.08)";
    }

    ctx.fillRect(
        door.x - door.width / 2,
        door.y - door.height / 2,
        door.width,
        door.height
    );

    ctx.restore();

    drawLabel(
        game.doorUnlocked
            ? "EXIT UNLOCKED"
            : "LOCKED",
        door.x,
        door.y - 60
    );
}

/* =========================================================
   DRAW PLAYER
========================================================= */

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(player.angle);

    /* Glow */

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff1744";

    /* Body */

    ctx.fillStyle = "#0b0b0d";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle = "#ff1744";
    ctx.lineWidth = 2;

    ctx.stroke();

    /* Head */

    ctx.fillStyle = "#d7b09a";

    ctx.beginPath();

    ctx.arc(
        0,
        -15,
        8,
        0,
        Math.PI * 2
    );

    ctx.fill();

    /* Weapon */

    ctx.fillStyle = "#ff1744";

    if (game.character === "nova") {

        ctx.fillRect(
            7,
            -9,
            22,
            4
        );

        ctx.fillRect(
            7,
            5,
            22,
            4
        );

    } else {

        ctx.fillRect(
            8,
            -3,
            38,
            6
        );
    }

    ctx.restore();
}

/* =========================================================
   DRAW BULLETS
========================================================= */

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.save();

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff3158";

        ctx.fillStyle = "#ff3158";

        ctx.beginPath();

        ctx.arc(
            bullet.x,
            bullet.y,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    });
}

/* =========================================================
   DRAW PARTICLES
========================================================= */

function drawParticles() {

    particles.forEach(particle => {

        ctx.globalAlpha =
            particle.life / 45;

        ctx.fillStyle = "#ff1744";

        ctx.fillRect(
            particle.x,
            particle.y,
            particle.size,
            particle.size
        );
    });

    ctx.globalAlpha = 1;
}

/* =========================================================
   LABELS
========================================================= */

function drawLabel(text, x, y) {

    ctx.save();

    ctx.font =
        "9px Arial";

    ctx.textAlign = "center";

    ctx.fillStyle =
        "rgba(255,255,255,.65)";

    ctx.fillText(
        text,
        x,
        y
    );

    ctx.restore();
}

/* =========================================================
   GAME LOOP
========================================================= */

function update() {

    if (!game.running) return;

    movePlayer();

    if (game.shooting) {
        shoot();
    }

    updateBullets();

    updateEnemies();

    updateParticles();

    checkEvidence();

    checkLevelProgress();

    updateInteraction();

    if (game.damageCooldown > 0) {
        game.damageCooldown--;
    }

    updateHUD();
}

function draw() {

    drawArena();

    drawDoor();

    drawTerminal();

    drawEvidence();

    drawThreats();

    drawEnemies();

    drawBullets();

    drawParticles();

    drawPlayer();
}

function gameLoop() {

    update();

    draw();

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}

/* =========================================================
   UTILITIES
========================================================= */

function random(min, max) {

    return Math.random() *
        (max - min) +
        min;
}

function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}

function distance(x1, y1, x2, y2) {

    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}

/* =========================================================
   INITIAL SETUP
========================================================= */

updateHUD();

console.log(
    "CYBERHUNT SYSTEM ONLINE"
);
