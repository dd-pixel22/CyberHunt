```javascript
/* =========================================================
   CYBERHUNT
   MAIN GAME ENGINE
   ========================================================= */

import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    EffectComposer
} from "three/addons/postprocessing/EffectComposer.js";

import {
    RenderPass
} from "three/addons/postprocessing/RenderPass.js";

import {
    UnrealBloomPass
} from "three/addons/postprocessing/UnrealBloomPass.js";

import {
    createCyberCity,
    updateCyberCity
} from "./arena.js";


/* =========================================================
   EXACT PLAYER MODELS
========================================================= */

const MODEL_PATHS = {

    vexa:
        "./assets/models/girl-agent.glb",

    kai:
        "./assets/models/boy-agent.glb",

    enemy:
        "./assets/models/enemy.glb"
};


/* =========================================================
   GAME DATA
========================================================= */

const LEVEL_DATA = {

    1: {
        name: "DATA VAULT",

        evidence:
            "Encrypted USB",

        clue:
            "2 + 0 + 2 + 6",

        passcode:
            "10",

        reward:
            500
    },

    2: {
        name: "CYBER BANK",

        evidence:
            "Authentication Key",

        clue:
            "5 + 5",

        passcode:
            "10",

        reward:
            700
    },

    3: {
        name: "NEXUS LAB",

        evidence:
            "Research Drive",

        clue:
            "3 + 7",

        passcode:
            "10",

        reward:
            900
    },

    4: {
        name: "BLACKSITE",

        evidence:
            "Operation File",

        clue:
            "8 + 2",

        passcode:
            "10",

        reward:
            1200
    },

    5: {
        name: "CYBER CORE",

        evidence:
            "Core Access Key",

        clue:
            "4 + 6",

        passcode:
            "10",

        reward:
            2000
    }

};


/* =========================================================
   STATE
========================================================= */

const gameState = {

    page:
        "dashboard",

    level:
        1,

    operative:
        "vexa",

    xp:
        950,

    missions:
        0,

    badges:
        [],

    unlocked:
        [1],

    health:
        100,

    progress:
        0,

    evidence:
        false,

    decoded:
        false,

    doorUnlocked:
        false,

    enemyDefeated:
        false,

    escaped:
        false,

    paused:
        false,

    running:
        false
};


/* =========================================================
   DOM
========================================================= */

const $ =
    id =>
        document.getElementById(id);


/* =========================================================
   INTRO
========================================================= */

const intro =
    $("cinematicIntro");

const enterButton =
    $("enterGameBtn");

const app =
    $("app");

const gameScreen =
    $("gameScreen");

const gameContainer =
    $("gameContainer");

const loading =
    $("loadingOverlay");

const puzzleModal =
    $("puzzleModal");

const missionCompleteModal =
    $("missionCompleteModal");

const pauseMenu =
    $("pauseMenu");


/* =========================================================
   ENTER GAME
========================================================= */

function enterGame() {

    console.log(
        "CYBERHUNT // ENTER"
    );

    if (intro) {

        intro.classList.add(
            "intro-exit"
        );

        setTimeout(
            () => {

                intro.style.display =
                    "none";

            },
            800
        );
    }

    if (app) {

        app.style.display =
            "block";

        app.classList.add(
            "dashboard-enter"
        );
    }

    navigate(
        "dashboard"
    );

    updateUI();
}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (enterButton) {

    enterButton.addEventListener(
        "click",
        enterGame
    );

    enterButton.addEventListener(
        "touchend",
        event => {

            event.preventDefault();

            enterGame();
        }
    );

    enterButton.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                enterGame();
            }
        }
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(
    page
) {

    gameState.page =
        page;

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            element => {

                element.classList.remove(
                    "active"
                );

                element.style.display =
                    "none";
            }
        );

    const target =
        $(
            `${page}Page`
        );

    if (target) {

        target.style.display =
            "block";

        requestAnimationFrame(
            () => {

                target.classList.add(
                    "active"
                );
            }
        );
    }

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    page
                );
            }
        );
}


/* =========================================================
   NAV BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-page]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    navigate(
                        button.dataset.page
                    );

                    updateUI();
                }
            );
        }
    );


/* =========================================================
   OPERATIVE SELECTION
========================================================= */

document
    .querySelectorAll(
        ".operative-card"
    )
    .forEach(
        card => {

            card.addEventListener(
                "click",
                () => {

                    const selected =
                        card.dataset.operative;

                    if (
                        selected !== "vexa" &&
                        selected !== "kai"
                    ) {
                        return;
                    }

                    gameState.operative =
                        selected;

                    document
                        .querySelectorAll(
                            ".operative-card"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "selected"
                                );
                            }
                        );

                    card.classList.add(
                        "selected"
                    );

                    updateUI();

                    notify(
                        selected === "vexa"
                            ? "VEXA SELECTED"
                            : "KAI SELECTED"
                    );
                }
            );
        }
    );


/* =========================================================
   LEVEL BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-start-level]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const level =
                        Number(
                            button.dataset.startLevel
                        );

                    if (
                        !gameState.unlocked.includes(
                            level
                        )
                    ) {

                        notify(
                            "MISSION LOCKED"
                        );

                        return;
                    }

                    startMission(
                        level
                    );
                }
            );
        }
    );


/* =========================================================
   THREE VARIABLES
========================================================= */

let scene;
let camera;
let renderer;
let composer;

let loader;
let clock;

let player;
let enemy;

let playerMixer;
let enemyMixer;

let terminal;
let evidence;
let exitDoor;

let bullets = [];

let keys = {};

let mouse = {
    x: 0,
    y: 0,
    down: false
};

let enemyHealth =
    100;

let shootCooldown =
    0;

let initialized =
    false;


/* =========================================================
   START MISSION
========================================================= */

function startMission(
    level
) {

    gameState.level =
        level;

    resetMission();

    if (app) {
        app.style.display =
            "none";
    }

    if (gameScreen) {
        gameScreen.style.display =
            "block";
    }

    if (loading) {

        loading.style.display =
            "flex";
    }

    setTimeout(
        () => {

            initializeGame();

            if (loading) {

                loading.style.display =
                    "none";
            }

            gameState.running =
                true;

            updateHUD();

        },
        500
    );
}


/* =========================================================
   RESET MISSION
========================================================= */

function resetMission() {

    gameState.health =
        100;

    gameState.progress =
        0;

    gameState.evidence =
        false;

    gameState.decoded =
        false;

    gameState.doorUnlocked =
        false;

    gameState.enemyDefeated =
        false;

    gameState.escaped =
        false;

    gameState.paused =
        false;

    enemyHealth =
        100;
}


/* =========================================================
   INITIALIZE GAME
========================================================= */

function initializeGame() {

    if (!gameContainer) {

        console.error(
            "gameContainer missing"
        );

        return;
    }

    /* Clean old canvas */

    gameContainer.innerHTML =
        "";

    /* Scene */

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0x020204
        );

    scene.fog =
        new THREE.FogExp2(
            0x030305,
            0.013
        );


    /* Camera */

    camera =
        new THREE.PerspectiveCamera(
            70,
            window.innerWidth /
            window.innerHeight,
            0.1,
            1000
        );

    camera.position.set(
        0,
        5,
        30
    );


    /* Renderer */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference:
                "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled =
        true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.15;

    gameContainer.appendChild(
        renderer.domElement
    );


    /* Clock */

    clock =
        new THREE.Clock();


    /* Loader */

    loader =
        new GLTFLoader();


    /* Lighting */

    createLighting();


    /* City */

    createCyberCity(
        scene
    );


    /* Escape room */

    createEscapeRoom();


    /* Player */

    loadPlayer();


    /* Enemy */

    loadEnemy();


    /* Effects */

    createEffects();


    /* Controls */

    setupControls();


    initialized =
        true;

    updateHUD();

    animate();
}


/* =========================================================
   LIGHTING
========================================================= */

function createLighting() {

    const ambient =
        new THREE.AmbientLight(
            0x565665,
            1.35
        );

    scene.add(
        ambient
    );


    const red =
        new THREE.PointLight(
            0xff1744,
            8,
            65
        );

    red.position.set(
        0,
        14,
        0
    );

    scene.add(
        red
    );


    const red2 =
        new THREE.PointLight(
            0x8e102d,
            6,
            45
        );

    red2.position.set(
        -20,
        7,
        -20
    );

    scene.add(
        red2
    );


    const white =
        new THREE.DirectionalLight(
            0xdce5ff,
            1.6
        );

    white.position.set(
        20,
        35,
        25
    );

    white.castShadow =
        true;

    white.shadow.mapSize.width =
        2048;

    white.shadow.mapSize.height =
        2048;

    scene.add(
        white
    );
}


/* =========================================================
   ESCAPE ROOM
========================================================= */

function createEscapeRoom() {

    createTerminal();

    createEvidence();

    createExitDoor();
}


/* =========================================================
   TERMINAL
========================================================= */

function createTerminal() {

    terminal =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3,
                2.2,
                1.5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x101116,
                metalness: 0.78,
                roughness: 0.3
            })
        );

    body.castShadow =
        true;

    terminal.add(
        body
    );


    const screen =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.2,
                1.15,
                0.08
            ),
            new THREE.MeshBasicMaterial({
                color: 0x8e102d
            })
        );

    screen.position.set(
        0,
        0.25,
        0.78
    );

    terminal.add(
        screen
    );


    terminal.position.set(
        -7,
        1.5,
        -5
    );

    terminal.userData.type =
        "terminal";

    scene.add(
        terminal
    );
}


/* =========================================================
   EVIDENCE
========================================================= */

function createEvidence() {

    evidence =
        new THREE.Group();


    const usb =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.5,
                0.35,
                0.65
            ),
            new THREE.MeshStandardMaterial({
                color: 0x18191f,
                metalness: 0.85,
                roughness: 0.22,
                emissive: 0x6d0b25,
                emissiveIntensity: 0.55
            })
        );

    usb.castShadow =
        true;

    evidence.add(
        usb
    );


    const glow =
        new THREE.PointLight(
            0xff1744,
            1.2,
            5
        );

    evidence.add(
        glow
    );


    evidence.position.set(
        8,
        0.8,
        4
    );

    evidence.userData.type =
        "evidence";

    scene.add(
        evidence
    );
}


/* =========================================================
   EXIT DOOR
========================================================= */

function createExitDoor() {

    exitDoor =
        new THREE.Group();


    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                6,
                8,
                0.45
            ),
            new THREE.MeshStandardMaterial({
                color: 0x050508,
                metalness: 0.85,
                roughness: 0.22
            })
        );

    door.position.y =
        4;

    exitDoor.add(
        door
    );


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                6.6,
                8.6,
                0.18
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1744,
                wireframe: true
            })
        );

    frame.position.y =
        4;

    exitDoor.add(
        frame
    );


    exitDoor.position.set(
        0,
        0,
        -28
    );

    exitDoor.userData.type =
        "exit";

    scene.add(
        exitDoor
    );
}


/* =========================================================
   LOAD PLAYER
========================================================= */

function loadPlayer() {

    const path =
        gameState.operative ===
        "kai"
            ? MODEL_PATHS.kai
            : MODEL_PATHS.vexa;


    loader.load(
        path,

        gltf => {

            player =
                gltf.scene;

            player.scale.set(
                1.65,
                1.65,
                1.65
            );

            player.position.set(
                0,
                0,
                25
            );

            player.traverse(
                object => {

                    if (
                        object.isMesh
                    ) {

                        object.castShadow =
                            true;

                        object.receiveShadow =
                            true;
                    }
                }
            );

            scene.add(
                player
            );


            if (
                gltf.animations &&
                gltf.animations.length
            ) {

                playerMixer =
                    new THREE.AnimationMixer(
                        player
                    );

                playerMixer
                    .clipAction(
                        gltf.animations[0]
                    )
                    .play();
            }


            notify(
                `${gameState.operative.toUpperCase()} DEPLOYED`
            );
        },

        undefined,

        error => {

            console.error(
                "Player GLB error:",
                error
            );

            notify(
                "PLAYER MODEL FAILED TO LOAD"
            );
        }
    );
}


/* =========================================================
   LOAD ENEMY
========================================================= */

function loadEnemy() {

    loader.load(
        MODEL_PATHS.enemy,

        gltf => {

            enemy =
                gltf.scene;

            enemy.scale.set(
                1.7,
                1.7,
                1.7
            );

            enemy.position.set(
                0,
                0,
                -10
            );

            enemy.traverse(
                object => {

                    if (
                        object.isMesh
                    ) {

                        object.castShadow =
                            true;

                        object.receiveShadow =
                            true;
                    }
                }
            );

            scene.add(
                enemy
            );


            if (
                gltf.animations &&
                gltf.animations.length
            ) {

                enemyMixer =
                    new THREE.AnimationMixer(
                        enemy
                    );

                enemyMixer
                    .clipAction(
                        gltf.animations[0]
                    )
                    .play();
            }
        },

        undefined,

        error => {

            console.error(
                "Enemy GLB error:",
                error
            );
        }
    );
}


/* =========================================================
   POST PROCESSING
========================================================= */

function createEffects() {

    composer =
        new EffectComposer(
            renderer
        );


    composer.addPass(
        new RenderPass(
            scene,
            camera
        )
    );


    const bloom =
        new UnrealBloomPass(
            new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            ),
            0.65,
            0.55,
            0.86
        );

    composer.addPass(
        bloom
    );
}


/* =========================================================
   CONTROLS
========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            keys[
                event.key.toLowerCase()
            ] = true;


            if (
                event.key.toLowerCase() ===
                "e"
            ) {

                interact();
            }


            if (
                event.key ===
                "Escape"
            ) {

                togglePause();
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;
        }
    );


    window.addEventListener(
        "mousemove",
        event => {

            mouse.x =
                event.clientX /
                window.innerWidth *
                2 - 1;

            mouse.y =
                -(event.clientY /
                window.innerHeight) *
                2 + 1;
        }
    );


    window.addEventListener(
        "mousedown",
        event => {

            if (
                event.button === 0
            ) {

                mouse.down =
                    true;

                shoot();
            }
        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            mouse.down =
                false;
        }
    );


    window.addEventListener(
        "resize",
        resizeGame
    );
}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(
    delta
) {

    if (
        !player ||
        gameState.paused ||
        !gameState.running
    ) {
        return;
    }


    const speed =
        9 * delta;


    const direction =
        new THREE.Vector3();


    if (
        keys.w ||
        keys.arrowup
    ) {

        direction.z -= 1;
    }


    if (
        keys.s ||
        keys.arrowdown
    ) {

        direction.z += 1;
    }


    if (
        keys.a ||
        keys.arrowleft
    ) {

        direction.x -= 1;
    }


    if (
        keys.d ||
        keys.arrowright
    ) {

        direction.x += 1;
    }


    if (
        direction.lengthSq() >
        0
    ) {

        direction.normalize();

        player.position.add(
            direction.multiplyScalar(
                speed
            )
        );

        player.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );
    }


    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -75,
            75
        );


    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -75,
            75
        );


    updateCamera();
}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

    if (!player) {
        return;
    }


    const target =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 5.5,
            player.position.z + 10
        );


    camera.position.lerp(
        target,
        0.08
    );


    camera.lookAt(
        player.position.x,
        player.position.y + 1.4,
        player.position.z
    );
}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        !player ||
        !gameState.running
    ) {
        return;
    }


    let closest =
        null;

    let distance =
        5;


    const objects = [
        evidence,
        terminal,
        exitDoor
    ];


    objects.forEach(
        object => {

            if (!object) {
                return;
            }


            const d =
                player.position.distanceTo(
                    object.position
                );


            if (
                d < distance
            ) {

                distance =
                    d;

                closest =
                    object;
            }
        }
    );


    if (!closest) {

        notify(
            "NO INTERACTABLE OBJECT NEARBY"
        );

        return;
    }


    if (
        closest.userData.type ===
        "evidence"
    ) {

        collectEvidence();

    } else if (
        closest.userData.type ===
        "terminal"
    ) {

        openPuzzle();

    } else if (
        closest.userData.type ===
        "exit"
    ) {

        attemptEscape();
    }
}


/* =========================================================
   EVIDENCE
========================================================= */

function collectEvidence() {

    if (
        gameState.evidence
    ) {

        notify(
            "EVIDENCE ALREADY RECOVERED"
        );

        return;
    }


    gameState.evidence =
        true;

    gameState.progress =
        25;


    if (evidence) {

        evidence.visible =
            false;
    }


    gainXP(
        100
    );


    updateHUD();


    notify(
        "ENCRYPTED USB RECOVERED +100 XP"
    );
}


/* =========================================================
   PUZZLE
========================================================= */

function openPuzzle() {

    if (
        !gameState.evidence
    ) {

        notify(
            "RECOVER THE USB FIRST"
        );

        return;
    }


    if (
        gameState.decoded
    ) {

        notify(
            "TERMINAL ALREADY DECODED"
        );

        return;
    }


    const level =
        LEVEL_DATA[
            gameState.level
        ];


    const question =
        $("puzzleQuestion");

    const clue =
        $("puzzleClue");


    if (question) {

        question.textContent =
            `Decode the recovered clue to obtain the exit passcode for ${level.name}.`;
    }


    if (clue) {

        clue.textContent =
            level.clue;
    }


    const input =
        $("puzzleAnswer");

    if (input) {

        input.value =
            "";
    }


    if (puzzleModal) {

        puzzleModal.style.display =
            "flex";
    }
}


/* =========================================================
   CLOSE PUZZLE
========================================================= */

window.closePuzzle =
    function () {

        if (puzzleModal) {

            puzzleModal.style.display =
                "none";
        }
    };


/* =========================================================
   SUBMIT PUZZLE
========================================================= */

window.submitPuzzle =
    function () {

        const input =
            $("puzzleAnswer");

        if (!input) {
            return;
        }


        const answer =
            input.value
                .trim()
                .toLowerCase();


        const level =
            LEVEL_DATA[
                gameState.level
            ];


        if (
            answer ===
            level.passcode
        ) {

            gameState.decoded =
                true;

            gameState.progress =
                60;


            if (puzzleModal) {

                puzzleModal.style.display =
                    "none";
            }


            gainXP(
                150
            );


            updateHUD();


            notify(
                "ENCRYPTION BROKEN — ACCESS KEY ACCEPTED"
            );

        } else {

            damagePlayer(
                5
            );

            notify(
                "INCORRECT PASSCODE — SECURITY ALERT"
            );
        }
    };


/* =========================================================
   DOOR / ESCAPE
========================================================= */

function attemptEscape() {

    if (
        !gameState.decoded
    ) {

        notify(
            "EXIT LOCKED — DECODE THE TERMINAL"
        );

        return;
    }


    if (
        !gameState.enemyDefeated
    ) {

        notify(
            "THREAT STILL ACTIVE — ELIMINATE IT"
        );

        return;
    }


    if (
        gameState.escaped
    ) {

        return;
    }


    gameState.escaped =
        true;

    gameState.progress =
        100;


    if (exitDoor) {

        exitDoor.position.y =
            -9;
    }


    completeMission();
}


/* =========================================================
   SHOOT
========================================================= */

function shoot() {

    if (
        !gameState.running ||
        gameState.paused ||
        !enemy ||
        gameState.enemyDefeated
    ) {
        return;
    }


    if (
        shootCooldown >
        0
    ) {
        return;
    }


    shootCooldown =
        0.32;


    const origin =
        camera.position.clone();


    const direction =
        new THREE.Vector3(
            mouse.x,
            mouse.y,
            0.5
        );


    direction.unproject(
        camera
    );


    direction
        .sub(origin)
        .normalize();


    const raycaster =
        new THREE.Raycaster(
            origin,
            direction
        );


    const hits =
        raycaster.intersectObject(
            enemy,
            true
        );


    if (
        hits.length
    ) {

        enemyHealth -=
            25;


        createHitEffect(
            hits[0].point
        );


        notify(
            `THREAT HIT — ${Math.max(
                enemyHealth,
                0
            )}%`
        );


        if (
            enemyHealth <=
            0
        ) {

            defeatEnemy();
        }
    }
}


/* =========================================================
   HIT EFFECT
========================================================= */

function createHitEffect(
    position
) {

    const effect =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.18,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1744
            })
        );


    effect.position.copy(
        position
    );


    scene.add(
        effect
    );


    setTimeout(
        () => {

            scene.remove(
                effect
            );

        },
        180
    );
}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemy(
    delta
) {

    if (
        !enemy ||
        !player ||
        gameState.paused ||
        gameState.enemyDefeated
    ) {
        return;
    }


    const distance =
        enemy.position.distanceTo(
            player.position
        );


    if (
        distance > 4
    ) {

        const direction =
            new THREE.Vector3()
                .subVectors(
                    player.position,
                    enemy.position
                )
                .normalize();


        enemy.position.add(
            direction.multiplyScalar(
                delta * 2.0
            )
        );


        enemy.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );

    } else {

        damagePlayer(
            delta * 3
        );
    }
}


/* =========================================================
   DEFEAT ENEMY
========================================================= */

function defeatEnemy() {

    if (
        gameState.enemyDefeated
    ) {
        return;
    }


    gameState.enemyDefeated =
        true;

    gameState.progress =
        85;


    if (enemy) {

        enemy.visible =
            false;
    }


    gainXP(
        200
    );


    updateHUD();


    notify(
        "HOSTILE THREAT ELIMINATED +200 XP"
    );
}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    gameState.health -=
        amount;


    gameState.health =
        Math.max(
            0,
            gameState.health
        );


    updateHUD();


    if (
        gameState.health <=
        0
    ) {

        missionFailed();
    }
}


/* =========================================================
   MISSION FAILED
========================================================= */

function missionFailed() {

    gameState.running =
        false;


    notify(
        "MISSION FAILED"
    );


    setTimeout(
        () => {

            returnToDashboard();

        },
        1200
    );
}


/* =========================================================
   COMPLETE MISSION
========================================================= */

function completeMission() {

    gameState.running =
        false;


    gameState.missions++;


    const level =
        gameState.level;


    const reward =
        LEVEL_DATA[level].reward;


    gainXP(
        reward
    );


    const badgeNames = [
        "DATA BREAKER",
        "BANK BREAKER",
        "NEXUS SURVIVOR",
        "CYBER GHOST",
        "CORE BREAKER"
    ];


    const badge =
        badgeNames[level - 1];


    if (
        !gameState.badges.includes(
            badge
        )
    ) {

        gameState.badges.push(
            badge
        );
    }


    const nextLevel =
        level + 1;


    if (
        nextLevel <= 5 &&
        !gameState.unlocked.includes(
            nextLevel
        )
    ) {

        gameState.unlocked.push(
            nextLevel
        );
    }


    setText(
        "missionReward",
        `+${reward} XP`
    );


    setText(
        "missionTitle",
        "MISSION COMPLETE"
    );


    if (
        missionCompleteModal
    ) {

        missionCompleteModal.style.display =
            "flex";
    }


    updateUI();
}


/* =========================================================
   XP
========================================================= */

function gainXP(
    amount
) {

    gameState.xp +=
        amount;

    updateUI();
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    setText(
        "healthValue",
        `${Math.round(
            gameState.health
        )}%`
    );


    setText(
        "xpHud",
        gameState.xp
    );


    setText(
        "missionProgress",
        `${Math.round(
            gameState.progress
        )}%`
    );


    const progressBar =
        $("missionProgressBar");


    if (progressBar) {

        progressBar.style.width =
            `${gameState.progress}%`;
    }


    const objective =
        $("objectiveText");


    if (!objective) {
        return;
    }


    if (
        !gameState.evidence
    ) {

        objective.textContent =
            "Locate the encrypted evidence.";

    } else if (
        !gameState.decoded
    ) {

        objective.textContent =
            "Investigate the terminal and decode the passcode.";

    } else if (
        !gameState.enemyDefeated
    ) {

        objective.textContent =
            "Eliminate the hostile cyber threat.";

    } else {

        objective.textContent =
            "Reach the exit and escape the facility.";
    }
}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    setText(
        "xpValue",
        gameState.xp
    );


    setText(
        "missionsValue",
        gameState.missions
    );


    setText(
        "badgeValue",
        gameState.badges.length
    );


    setText(
        "dashboardOperative",
        gameState.operative.toUpperCase()
    );


    setText(
        "profileXP",
        gameState.xp
    );


    setText(
        "profileMissions",
        gameState.missions
    );


    setText(
        "profileBadges",
        gameState.badges.length
    );


    document
        .querySelectorAll(
            "[data-start-level]"
        )
        .forEach(
            button => {

                const level =
                    Number(
                        button.dataset.startLevel
                    );


                const unlocked =
                    gameState.unlocked.includes(
                        level
                    );


                button.disabled =
                    !unlocked;


                button.textContent =
                    unlocked
                        ? "ENTER ROOM"
                        : "LOCKED";


                button
                    .closest(
                        ".level-card"
                    )
                    ?.classList.toggle(
                        "locked-level",
                        !unlocked
                    );
            }
        );
}


/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (
        !gameState.running
    ) {
        return;
    }


    gameState.paused =
        !gameState.paused;


    if (pauseMenu) {

        pauseMenu.style.display =
            gameState.paused
                ? "flex"
                : "none";
    }
}


window.togglePause =
    togglePause;


/* =========================================================
   RETURN DASHBOARD
========================================================= */

window.returnToDashboard =
    function () {

        gameState.running =
            false;

        gameState.paused =
            false;


        if (
            missionCompleteModal
        ) {

            missionCompleteModal.style.display =
                "none";
        }


        if (
            pauseMenu
        ) {

            pauseMenu.style.display =
                "none";
        }


        if (gameScreen) {

            gameScreen.style.display =
                "none";
        }


        if (app) {

            app.style.display =
                "block";
        }


        navigate(
            "dashboard"
        );


        updateUI();
    };


/* =========================================================
   NOTIFICATION
========================================================= */

function notify(
    message
) {

    console.log(
        "CYBERHUNT:",
        message
    );


    let notification =
        $("cyberNotification");


    if (!notification) {
        return;
    }


    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    clearTimeout(
        notification._timer
    );


    notification._timer =
        setTimeout(
            () => {

                notification.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================================================
   TEXT HELPER
========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value;
    }
}


/* =========================================================
   RESIZE
========================================================= */

function resizeGame() {

    if (
        !camera ||
        !renderer
    ) {
        return;
    }


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    if (composer) {

        composer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
}


/* =========================================================
   ANIMATION
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        !initialized
    ) {
        return;
    }


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    const elapsed =
        clock.elapsedTime;


    if (
        gameState.running &&
        !gameState.paused
    ) {

        updatePlayer(
            delta
        );

        updateEnemy(
            delta
        );


        shootCooldown =
            Math.max(
                0,
                shootCooldown - delta
            );


        /* Continuous firing */

        if (
            mouse.down &&
            shootCooldown <= 0
        ) {

            shoot();
        }
    }


    if (playerMixer) {

        playerMixer.update(
            delta
        );
    }


    if (enemyMixer) {

        enemyMixer.update(
            delta
        );
    }


    updateCyberCity(
        elapsed
    );


    if (composer) {

        composer.render();

    } else {

        renderer.render(
            scene,
            camera
        );
    }
}


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (intro) {

            intro.style.display =
                "flex";
        }


        if (app) {

            app.style.display =
                "none";
        }


        if (gameScreen) {

            gameScreen.style.display =
                "none";
        }


        updateUI();

        updateHUD();


        console.log(
            "================================"
        );

        console.log(
            " CYBERHUNT SYSTEM ONLINE"
        );

        console.log(
            " ESCAPE PROTOCOL READY"
        );

        console.log(
            "================================"
        );
    }
);
```
