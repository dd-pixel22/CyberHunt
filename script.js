/* =========================================
   CYBERHUNT GAME ENGINE
========================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

canvas.width = W;
canvas.height = H;


/* =========================================
   GAME STATE
========================================= */

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

    currentInteraction: null

};


/* =========================================
   LEVEL DATA
========================================= */

const levels = [

    {
        name: "INFILTRATION",
        objective: "Locate the suspicious USB device",
        evidence: 1,
        threats: 2,
        enemies: 2,
        xp: 250,
        coins: 100
    },

    {
        name: "DIGITAL BREACH",
        objective: "Neutralize hostile digital nodes",
        evidence: 2,
        threats: 3,
        enemies: 3,
        xp: 350,
        coins: 150
    },

    {
        name: "ENCRYPTED SECTOR",
        objective: "Decode the security terminal",
        evidence: 2,
        threats: 4,
        enemies: 3,
        xp: 450,
        coins: 200
    },

    {
        name: "BLACK SITE",
        objective: "Secure the classified evidence",
        evidence: 3,
        threats: 5,
        enemies: 4,
        xp: 550,
        coins: 250
    },

    {
        name: "FINAL PROTOCOL",
        objective: "Eliminate the cyber threat commander",
        evidence: 3,
        threats: 6,
        enemies: 5,
        xp: 750,
        coins: 400
    }

];


/* =========================================
   GAME OBJECTS
========================================= */

let player;

let evidence = [];

let enemies = [];

let digitalThreats = [];

let bullets = [];

let particles = [];

let door;

let terminal;

let lastTime = 0;

let messageTimeout;


/* =========================================
   SCREEN MANAGEMENT
========================================= */

function showScreen(id) {

    document.querySelectorAll(".screen").forEach(screen => {

        screen.classList.remove("active");

        screen.classList.add("hidden");

    });

    const target = document.getElementById(id);

    target.classList.remove("hidden");

    target.classList.add("active");
}


/* =========================================
   LOADING
========================================= */

let loadProgress = 0;

const loadingInterval = setInterval(() => {

    loadProgress += 2;

    document.getElementById("loadingProgress").style.width =
        loadProgress + "%";

    if (loadProgress >= 100) {

        clearInterval(loadingInterval);

        setTimeout(() => {

            showScreen("loginScreen");

        }, 400);

    }

}, 35);


/* =========================================
   LOGIN
========================================= */

document.getElementById("loginButton").addEventListener("click", login);

document.getElementById("accessCode").addEventListener("keydown", e => {

    if (e.key === "Enter") login();

});


function login() {

    const nameInput = document.getElementById("playerName");

    const codeInput = document.getElementById("accessCode");

    const error = document.getElementById("loginError");

    const name = nameInput.value.trim();

    const code = codeInput.value.trim();

    if (!name) {

        error.textContent = "ENTER OPERATIVE ID";

        return;

    }

    if (!code) {

        error.textContent = "ENTER ACCESS CODE";

        return;

    }

    game.playerName = name;

    document.getElementById("hudPlayerName").textContent =
        name.toUpperCase();

    error.textContent = "";

    showScreen("characterScreen");

}


/* =========================================
   CHARACTER SELECTION
========================================= */

document.querySelectorAll(".character-card").forEach(card => {

    card.addEventListener("click", () => {

        document.querySelectorAll(".character-card")
            .forEach(c => c.classList.remove("selected"));

        card.classList.add("selected");

        game.character = card.dataset.character;

        setTimeout(() => {

            showScreen("briefingScreen");

        }, 400);

    });

});


/* =========================================
   START MISSION
========================================= */

document
    .getElementById("startMissionButton")
    .addEventListener("click", () => {

        showScreen("gameScreen");

        startLevel(1);

    });


/* =========================================
   RESIZE
========================================= */

window.addEventListener("resize", () => {

    W = window.innerWidth;

    H = window.innerHeight;

    canvas.width = W;

    canvas.height = H;

});


/* =========================================
   PLAYER
========================================= */

function createPlayer() {

    return {

        x: W / 2,

        y: H / 2,

        radius: 18,

        speed: 4,

        angle: 0,

        color: "#ff1744"

    };

}


/* =========================================
   START LEVEL
========================================= */

function startLevel(levelNumber) {

    game.level = levelNumber;

    game.health = 100;

    game.evidenceCollected = 0;

    game.threatsDestroyed = 0;

    game.enemiesDefeated = 0;

    game.decoded = false;

    game.doorUnlocked = false;

    game.running = true;

    player = createPlayer();

    evidence = [];

    enemies = [];

    digitalThreats = [];

    bullets = [];

    particles = [];

    const data = levels[levelNumber - 1];

    updateHUD();

    createLevelObjects(data);

    showMessage(
        "LEVEL " + String(levelNumber).padStart(2, "0"),
        data.name
    );

    requestAnimationFrame(gameLoop);

}


/* =========================================
   CREATE LEVEL OBJECTS
========================================= */

function createLevelObjects(data) {

    /* Evidence */

    for (let i = 0; i < data.evidence; i++) {

        evidence.push({

            x: random(100, W - 100),

            y: random(150, H - 150),

            size: 14,

            collected: false,

            pulse: Math.random() * 10

        });

    }


    /* Digital threats */

    for (let i = 0; i < data.threats; i++) {

        digitalThreats.push({

            x: random(100, W - 100),

            y: random(150, H - 150),

            radius: 13,

            alive: true,

            pulse: Math.random() * 10

        });

    }


    /* Enemies */

    for (let i = 0; i < data.enemies; i++) {

        enemies.push({

            x: random(100, W - 100),

            y: random(150, H - 150),

            radius: 18,

            health: 2,

            maxHealth: 2,

            alive: true,

            speed: 0.7 + Math.random() * .5,

            angle: Math.random() * Math.PI * 2

        });

    }


    door = {

        x: W - 80,

        y: H / 2,

        width: 45,

        height: 110

    };


    terminal = {

        x: 80,

        y: H / 2,

        width: 50,

        height: 65,

        active: true

    };

}


/* =========================================
   INPUT
========================================= */

window.addEventListener("keydown", e => {

    game.keys[e.key.toLowerCase()] = true;

    if (e.code === "Space") {

        e.preventDefault();

        game.shooting = true;

    }

    if (e.key.toLowerCase() === "e") {

        interact();

    }

});


window.addEventListener("keyup", e => {

    game.keys[e.key.toLowerCase()] = false;

    if (e.code === "Space") {

        game.shooting = false;

    }

});


/* =========================================
   MOUSE
========================================= */

canvas.addEventListener("mousemove", e => {

    if (!player) return;

    player.angle = Math.atan2(
        e.clientY - player.y,
        e.clientX - player.x
    );

});


canvas.addEventListener("mousedown", () => {

    game.shooting = true;

});


canvas.addEventListener("mouseup", () => {

    game.shooting = false;

});


/* =========================================
   SHOOTING
========================================= */

let lastShot = 0;

function shoot() {

    const now = Date.now();

    if (now - lastShot < 180) return;

    lastShot = now;

    const speed = 10;

    bullets.push({

        x: player.x + Math.cos(player.angle) * 20,

        y: player.y + Math.sin(player.angle) * 20,

        vx: Math.cos(player.angle) * speed,

        vy: Math.sin(player.angle) * speed,

        life: 70

    });

    createParticles(
        player.x + Math.cos(player.angle) * 20,
        player.y + Math.sin(player.angle) * 20,
        "#ff1744",
        4
    );

}


/* =========================================
   UPDATE
========================================= */

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

}


/* =========================================
   PLAYER MOVEMENT
========================================= */

function movePlayer() {

    let dx = 0;

    let dy = 0;

    if (game.keys["w"] || game.keys["arrowup"]) dy--;

    if (game.keys["s"] || game.keys["arrowdown"]) dy++;

    if (game.keys["a"] || game.keys["arrowleft"]) dx--;

    if (game.keys["d"] || game.keys["arrowright"]) dx++;

    if (dx !== 0 || dy !== 0) {

        const length = Math.sqrt(dx * dx + dy * dy);

        dx /= length;

        dy /= length;

        player.x += dx * player.speed;

        player.y += dy * player.speed;

    }

    player.x = clamp(player.x, 30, W - 30);

    player.y = clamp(player.y, 100, H - 30);

}


/* =========================================
   BULLETS
========================================= */

function updateBullets() {

    bullets.forEach(bullet => {

        bullet.x += bullet.vx;

        bullet.y += bullet.vy;

        bullet.life--;

    });

    bullets = bullets.filter(b =>

        b.life > 0 &&
        b.x > 0 &&
        b.x < W &&
        b.y > 0 &&
        b.y < H

    );


    bullets.forEach(bullet => {

        enemies.forEach(enemy => {

            if (!enemy.alive) return;

            const distance = Math.hypot(
                bullet.x - enemy.x,
                bullet.y - enemy.y
            );

            if (distance < enemy.radius + 5) {

                enemy.health--;

                bullet.life = 0;

                createParticles(
                    enemy.x,
                    enemy.y,
                    "#ff1744",
                    10
                );

                if (enemy.health <= 0) {

                    enemy.alive = false;

                    game.enemiesDefeated++;

                    game.xp += 50;

                    game.coins += 20;

                    showMessage(
                        "TARGET ELIMINATED",
                        "+50 XP"
                    );

                    updateHUD();

                }

            }

        });


        digitalThreats.forEach(threat => {

            if (!threat.alive) return;

            const distance = Math.hypot(
                bullet.x - threat.x,
                bullet.y - threat.y
            );

            if (distance < threat.radius + 6) {

                threat.alive = false;

                game.threatsDestroyed++;

                game.xp += 35;

                game.coins += 10;

                createParticles(
                    threat.x,
                    threat.y,
                    "#00eaff",
                    18
                );

                showMessage(
                    "DIGITAL THREAT NEUTRALIZED",
                    "+35 XP"
                );

                updateHUD();

            }

        });

    });

}


/* =========================================
   ENEMIES
========================================= */

function updateEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        const dx = player.x - enemy.x;

        const dy = player.y - enemy.y;

        const distance = Math.hypot(dx, dy);

        if (distance < 450) {

            enemy.x += (dx / distance) * enemy.speed;

            enemy.y += (dy / distance) * enemy.speed;

        }

        if (distance < player.radius + enemy.radius) {

            damagePlayer(.25);

        }

    });

}


/* =========================================
   PLAYER DAMAGE
========================================= */

function damagePlayer(amount) {

    game.health -= amount;

    game.health = Math.max(0, game.health);

    updateHUD();

    if (game.health <= 0) {

        gameOver();

    }

}


/* =========================================
   EVIDENCE
========================================= */

function checkEvidence() {

    evidence.forEach(item => {

        if (item.collected) return;

        const distance = Math.hypot(
            player.x - item.x,
            player.y - item.y
        );

        if (distance < 45) {

            game.currentInteraction = {
                type: "evidence",
                object: item
            };

        }

    });

}


/* =========================================
   INTERACTION
========================================= */

function interact() {

    if (!game.running) return;

    if (game.currentInteraction) {

        const interaction = game.currentInteraction;

        if (interaction.type === "evidence") {

            const item = interaction.object;

            if (!item.collected) {

                item.collected = true;

                game.evidenceCollected++;

                game.xp += 75;

                game.coins += 25;

                createParticles(
                    item.x,
                    item.y,
                    "#00ff9d",
                    20
                );

                showMessage(
                    "EVIDENCE SECURED",
                    "Physical device recovered"
                );

                game.currentInteraction = null;

                updateHUD();

            }

        }

        else if (interaction.type === "terminal") {

            openDecoder();

        }

        else if (interaction.type === "door") {

            if (game.doorUnlocked) {

                completeLevel();

            }
            else {

                showMessage(
                    "ACCESS DENIED",
                    "Complete all objectives first"
                );

            }

        }

    }

}


/* =========================================
   INTERACTION CHECK
========================================= */

function updateInteraction() {

    game.currentInteraction = null;

    evidence.forEach(item => {

        if (item.collected) return;

        const distance = Math.hypot(
            player.x - item.x,
            player.y - item.y
        );

        if (distance < 50) {

            game.currentInteraction = {
                type: "evidence",
                object: item
            };

        }

    });


    const terminalDistance = Math.hypot(
        player.x - terminal.x,
        player.y - terminal.y
    );

    if (
        terminalDistance < 70 &&
        !game.decoded &&
        game.evidenceCollected >= evidence.length
    ) {

        game.currentInteraction = {
            type: "terminal"
        };

    }


    const doorDistance = Math.hypot(
        player.x - door.x,
        player.y - door.y
    );

    if (doorDistance < 90) {

        game.currentInteraction = {
            type: "door"
        };

    }


    const box = document.getElementById("interactionBox");

    if (game.currentInteraction) {

        box.classList.remove("hidden");

        const title =
            document.getElementById("interactionTitle");

        const text =
            document.getElementById("interactionText");

        if (game.currentInteraction.type === "evidence") {

            title.textContent = "COLLECT EVIDENCE";

            text.textContent =
                "Press E to secure the suspicious device";

        }

        else if (game.currentInteraction.type === "terminal") {

            title.textContent = "DECODE TERMINAL";

            text.textContent =
                "Press E to access encrypted system";

        }

        else if (game.currentInteraction.type === "door") {

            title.textContent = "SECURITY DOOR";

            text.textContent =
                game.doorUnlocked
                    ? "Press E to enter"
                    : "Complete mission objectives";

        }

    }
    else {

        box.classList.add("hidden");

    }

}


/* =========================================
   DECODER
========================================= */

function openDecoder() {

    game.running = false;

    const answer = prompt(
        "ENCRYPTED SECURITY TERMINAL\n\n" +
        "Decode the access sequence:\n\n" +
        "2 + 3 × 2 = ?"
    );

    if (answer === "8") {

        game.decoded = true;

        game.xp += 100;

        game.coins += 50;

        showMessage(
            "SYSTEM DECODED",
            "Security protocol bypassed"
        );

        game.running = true;

        updateHUD();

    }
    else {

        game.health -= 15;

        showMessage(
            "DECODE FAILED",
            "-15 HP"
        );

        game.running = true;

        updateHUD();

    }

}


/* =========================================
   LEVEL PROGRESS
========================================= */

function checkLevelProgress() {

    const data = levels[game.level - 1];

    const evidenceDone =
        game.evidenceCollected >= data.evidence;

    const threatsDone =
        game.threatsDestroyed >= data.threats;

    const enemiesDone =
        game.enemiesDefeated >= data.enemies;

    let objective = data.objective;


    if (!evidenceDone) {

        objective =
            `Collect evidence (${game.evidenceCollected}/${data.evidence})`;

    }

    else if (!threatsDone) {

        objective =
            `Neutralize digital threats (${game.threatsDestroyed}/${data.threats})`;

    }

    else if (!enemiesDone) {

        objective =
            `Eliminate enemies (${game.enemiesDefeated}/${data.enemies})`;

    }

    else if (!game.decoded) {

        objective = "Decode the security terminal";

    }

    else {

        game.doorUnlocked = true;

        objective = "Reach the extraction door";

    }

    document.getElementById("objectiveText").textContent =
        objective.toUpperCase();

}


/* =========================================
   DRAW
========================================= */

function draw() {

    ctx.clearRect(0, 0, W, H);

    drawBackground();

    drawWalls();

    drawTerminal();

    drawDoor();

    drawEvidence();

    drawDigitalThreats();

    drawEnemies();

    drawBullets();

    drawPlayer();

    drawParticles();

}


/* =========================================
   BACKGROUND
========================================= */

function drawBackground() {

    const gradient = ctx.createRadialGradient(
        W / 2,
        H / 2,
        50,
        W / 2,
        H / 2,
        Math.max(W, H)
    );

    gradient.addColorStop(0, "#15151d");

    gradient.addColorStop(1, "#030305");

    ctx.fillStyle = gradient;

    ctx.fillRect(0, 0, W, H);


    /* floor grid */

    ctx.strokeStyle = "rgba(255,23,68,.06)";

    ctx.lineWidth = 1;

    const grid = 50;

    for (let x = 0; x < W; x += grid) {

        ctx.beginPath();

        ctx.moveTo(x, 80);

        ctx.lineTo(x, H);

        ctx.stroke();

    }

    for (let y = 80; y < H; y += grid) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(W, y);

        ctx.stroke();

    }


    /* red atmosphere */

    const glow = ctx.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        W * .7
    );

    glow.addColorStop(
        0,
        "rgba(255,0,40,.08)"
    );

    glow.addColorStop(
        1,
        "rgba(255,0,40,0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(0, 0, W, H);

}


/* =========================================
   WALLS
========================================= */

function drawWalls() {

    ctx.strokeStyle = "rgba(255,23,68,.25)";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        25,
        90,
        W - 50,
        H - 115
    );

}


/* =========================================
   TERMINAL
========================================= */

function drawTerminal() {

    ctx.save();

    ctx.translate(
        terminal.x,
        terminal.y
    );

    ctx.fillStyle = "#101017";

    ctx.strokeStyle =
        game.decoded
            ? "#00ff9d"
            : "#00eaff";

    ctx.lineWidth = 2;

    ctx.fillRect(
        -25,
        -32,
        50,
        64
    );

    ctx.strokeRect(
        -25,
        -32,
        50,
        64
    );

    ctx.fillStyle =
        game.decoded
            ? "#00ff9d"
            : "#00eaff";

    ctx.fillRect(
        -17,
        -18,
        34,
        3
    );

    ctx.fillRect(
        -17,
        -8,
        25,
        3
    );

    ctx.fillRect(
        -17,
        2,
        30,
        3
    );

    ctx.restore();

}


/* =========================================
   DOOR
========================================= */

function drawDoor() {

    ctx.save();

    ctx.translate(
        door.x,
        door.y
    );

    ctx.fillStyle = "#101017";

    ctx.strokeStyle =
        game.doorUnlocked
            ? "#00ff9d"
            : "#ff1744";

    ctx.lineWidth = 3;

    ctx.fillRect(
        -door.width / 2,
        -door.height / 2,
        door.width,
        door.height
    );

    ctx.strokeRect(
        -door.width / 2,
        -door.height / 2,
        door.width,
        door.height
    );

    ctx.fillStyle =
        game.doorUnlocked
            ? "#00ff9d"
            : "#ff1744";

    ctx.fillRect(
        -5,
        -5,
        10,
        10
    );

    ctx.restore();

}


/* =========================================
   EVIDENCE
========================================= */

function drawEvidence() {

    evidence.forEach(item => {

        if (item.collected) return;

        item.pulse += .05;

        const glow =
            15 + Math.sin(item.pulse) * 5;

        ctx.save();

        ctx.shadowBlur = glow;

        ctx.shadowColor = "#00ff9d";

        ctx.fillStyle = "#00ff9d";

        ctx.fillRect(
            item.x - 10,
            item.y - 5,
            20,
            10
        );

        ctx.fillRect(
            item.x + 10,
            item.y - 2,
            5,
            4
        );

        ctx.restore();

    });

}


/* =========================================
   DIGITAL THREATS
========================================= */

function drawDigitalThreats() {

    digitalThreats.forEach(threat => {

        if (!threat.alive) return;

        threat.pulse += .08;

        const size =
            threat.radius +
            Math.sin(threat.pulse) * 2;

        ctx.save();

        ctx.translate(
            threat.x,
            threat.y
        );

        ctx.rotate(threat.pulse);

        ctx.strokeStyle = "#00eaff";

        ctx.shadowBlur = 20;

        ctx.shadowColor = "#00eaff";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            -size,
            -size,
            size * 2,
            size * 2
        );

        ctx.restore();

    });

}


/* =========================================
   ENEMIES
========================================= */

function drawEnemies() {

    enemies.forEach(enemy => {

        if (!enemy.alive) return;

        ctx.save();

        ctx.translate(
            enemy.x,
            enemy.y
        );

        /* glow */

        ctx.shadowBlur = 25;

        ctx.shadowColor = "#ff1744";

        /* body */

        ctx.fillStyle = "#16070c";

        ctx.strokeStyle = "#ff1744";

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.arc(
            0,
            -9,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(-11, 3);

        ctx.lineTo(11, 3);

        ctx.lineTo(15, 18);

        ctx.lineTo(-15, 18);

        ctx.closePath();

        ctx.fill();

        ctx.stroke();


        /* health */

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#222";

        ctx.fillRect(
            -15,
            -27,
            30,
            4
        );

        ctx.fillStyle = "#ff1744";

        ctx.fillRect(
            -15,
            -27,
            30 * (enemy.health / enemy.maxHealth),
            4
        );

        ctx.restore();

    });

}


/* =========================================
   PLAYER
========================================= */

function drawPlayer() {

    if (!player) return;

    ctx.save();

    ctx.translate(
        player.x,
        player.y
    );

    ctx.rotate(player.angle);

    /* weapon */

    ctx.fillStyle = "#aaa";

    ctx.fillRect(
        8,
        -3,
        25,
        6
    );

    ctx.fillStyle = "#555";

    ctx.fillRect(
        14,
        3,
        7,
        8
    );


    /* body */

    ctx.shadowBlur = 25;

    ctx.shadowColor = "#ff1744";

    ctx.fillStyle = "#111116";

    ctx.strokeStyle = "#ff1744";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.stroke();


    /* visor */

    ctx.fillStyle = "#ff1744";

    ctx.fillRect(
        5,
        -7,
        8,
        3
    );

    ctx.restore();

}


/* =========================================
   BULLETS DRAW
========================================= */

function drawBullets() {

    bullets.forEach(bullet => {

        ctx.save();

        ctx.fillStyle = "#ff1744";

        ctx.shadowBlur = 15;

        ctx.shadowColor = "#ff1744";

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


/* =========================================
   PARTICLES
========================================= */

function createParticles(
    x,
    y,
    color,
    amount
) {

    for (let i = 0; i < amount; i++) {

        particles.push({

            x,

            y,

            vx: (Math.random() - .5) * 5,

            vy: (Math.random() - .5) * 5,

            life: 30 + Math.random() * 30,

            color

        });

    }

}


function updateParticles() {

    particles.forEach(p => {

        p.x += p.vx;

        p.y += p.vy;

        p.life--;

    });

    particles =
        particles.filter(p => p.life > 0);

}


function drawParticles() {

    particles.forEach(p => {

        ctx.save();

        ctx.globalAlpha =
            Math.max(0, p.life / 50);

        ctx.fillStyle = p.color;

        ctx.fillRect(
            p.x,
            p.y,
            3,
            3
        );

        ctx.restore();

    });

}


/* =========================================
   MESSAGE
========================================= */

function showMessage(title, text) {

    const box =
        document.getElementById("gameMessage");

    document.getElementById("messageTitle")
        .textContent = title;

    document.getElementById("messageText")
        .textContent = text;

    box.classList.remove("hidden");

    clearTimeout(messageTimeout);

    messageTimeout = setTimeout(() => {

        box.classList.add("hidden");

    }, 2200);

}


/* =========================================
   HUD
========================================= */

function updateHUD() {

    const data =
        levels[game.level - 1];

    document.getElementById("levelNumber")
        .textContent =
        String(game.level).padStart(2, "0");

    document.getElementById("levelName")
        .textContent =
        data.name;

    document.getElementById("xpText")
        .textContent =
        game.xp;

    document.getElementById("coinText")
        .textContent =
        game.coins;

    document.getElementById("healthText")
        .textContent =
        Math.ceil(game.health);

    document.getElementById("healthBar")
        .style.width =
        game.health + "%";

    document.getElementById("hudPlayerName")
        .textContent =
        game.playerName.toUpperCase();

}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop(timestamp) {

    if (!game.running) return;

    const delta =
        timestamp - lastTime;

    lastTime = timestamp;

    update();

    draw();

    requestAnimationFrame(gameLoop);

}


/* =========================================
   COMPLETE LEVEL
========================================= */

function completeLevel() {

    if (!game.running) return;

    game.running = false;

    const data =
        levels[game.level - 1];

    game.xp += data.xp;

    game.coins += data.coins;

    document.getElementById("levelXPReward")
        .textContent =
        "+" + data.xp;

    document.getElementById("levelCoinReward")
        .textContent =
        "+" + data.coins;

    document.getElementById("levelCompleteDescription")
        .textContent =
        data.name + " SECURED";

    document
        .getElementById("levelCompleteOverlay")
        .classList.remove("hidden");

    updateHUD();

}


/* =========================================
   NEXT LEVEL
========================================= */

document
    .getElementById("nextLevelButton")
    .addEventListener("click", () => {

        document
            .getElementById("levelCompleteOverlay")
            .classList.add("hidden");

        if (game.level >= 5) {

            victory();

        }
        else {

            startLevel(game.level + 1);

        }

    });


/* =========================================
   GAME OVER
========================================= */

function gameOver() {

    game.running = false;

    document.getElementById("gameOverLevel")
        .textContent =
        String(game.level).padStart(2, "0");

    document.getElementById("gameOverXP")
        .textContent =
        game.xp;

    document
        .getElementById("gameOverOverlay")
        .classList.remove("hidden");

}


/* =========================================
   RETRY
========================================= */

document
    .getElementById("retryButton")
    .addEventListener("click", () => {

        document
            .getElementById("gameOverOverlay")
            .classList.add("hidden");

        startLevel(game.level);

    });


/* =========================================
   VICTORY
========================================= */

function victory() {

    game.running = false;

    document.getElementById("finalXP")
        .textContent =
        game.xp;

    document.getElementById("finalCoins")
        .textContent =
        game.coins;

    showScreen("victoryScreen");

}


/* =========================================
   PLAY AGAIN
========================================= */

document
    .getElementById("restartGameButton")
    .addEventListener("click", () => {

        game.xp = 0;

        game.coins = 0;

        game.health = 100;

        showScreen("characterScreen");

    });


/* =========================================
   UTILITY
========================================= */

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
