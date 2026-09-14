```javascript
/* =========================================================
   CYBERHUNT
   Main Game Controller
   ========================================================= */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/* =========================================================
   MODEL PATHS
   ========================================================= */

const MODEL_PATHS = {
    vexa: "./assets/models/girl-agent.glb",
    kai: "./assets/models/boy-agent.glb",
    enemy: "./assets/models/enemy.glb"
};

/* =========================================================
   GAME STATE
   ========================================================= */

const gameState = {
    currentPage: "dashboard",
    currentLevel: 1,

    selectedOperative: "vexa",

    xp: 950,
    level: 1,

    missionsCompleted: 0,
    badges: [],

    health: 100,
    missionProgress: 0,

    evidenceFound: false,
    terminalInvestigated: false,
    puzzleSolved: false,
    doorUnlocked: false,
    enemyDefeated: false,

    missionComplete: false,
    gameRunning: false,
    paused: false,

    unlockedLevels: [1]
};

/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

function show(element) {
    if (element) {
        element.style.display = "";
    }
}

function hide(element) {
    if (element) {
        element.style.display = "none";
    }
}

function setText(id, value) {
    const element = $(id);
    if (element) {
        element.textContent = value;
    }
}

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const cinematicIntro = $("cinematicIntro");
const enterGameBtn = $("enterGameBtn");
const app = $("app");

const gameScreen = $("gameScreen");
const gameContainer = $("gameContainer");

const loadingOverlay = $("loadingOverlay");

const puzzleModal = $("puzzleModal");
const interactionModal = $("interactionModal");
const missionCompleteModal = $("missionCompleteModal");
const pauseMenu = $("pauseMenu");

/* =========================================================
   CINEMATIC INTRO
   ========================================================= */

function enterCyberHunt() {

    console.log("CYBERHUNT: ENTER ACTIVATED");

    if (cinematicIntro) {

        cinematicIntro.classList.add("intro-exit");

        setTimeout(() => {
            cinematicIntro.style.display = "none";
        }, 750);
    }

    if (app) {

        app.style.display = "block";
        app.classList.add("dashboard-enter");

        setTimeout(() => {
            app.classList.remove("dashboard-enter");
        }, 900);
    }

    navigateTo("dashboard");

    updateDashboard();
}

/* Mouse / Touch */

if (enterGameBtn) {

    enterGameBtn.addEventListener(
        "click",
        enterCyberHunt
    );

    enterGameBtn.addEventListener(
        "touchend",
        (event) => {
            event.preventDefault();
            enterCyberHunt();
        }
    );

    enterGameBtn.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();
                enterCyberHunt();
            }
        }
    );
}

/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function navigateTo(pageName) {

    gameState.currentPage = pageName;

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

            page.style.display = "none";
        });

    const target =
        document.getElementById(
            `${pageName}Page`
        );

    if (target) {

        target.style.display = "block";

        requestAnimationFrame(() => {
            target.classList.add("active");
        });
    }

    document
        .querySelectorAll("[data-page]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );
        });
}

/* Navigation buttons */

document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                navigateTo(page);

                updateDashboard();
            }
        );
    });

/* =========================================================
   OPERATIVE SELECTION
   ========================================================= */

document
    .querySelectorAll(".operative-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const operative =
                    card.dataset.operative;

                if (
                    operative !== "vexa" &&
                    operative !== "kai"
                ) {
                    return;
                }

                gameState.selectedOperative =
                    operative;

                document
                    .querySelectorAll(".operative-card")
                    .forEach(item => {
                        item.classList.remove("selected");
                    });

                card.classList.add("selected");

                updateProfile();

                notify(
                    operative === "vexa"
                        ? "VEXA selected"
                        : "KAI selected"
                );
            }
        );
    });

/* =========================================================
   LEVEL SELECTION
   ========================================================= */

document
    .querySelectorAll("[data-start-level]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const level =
                    Number(
                        button.dataset.startLevel
                    );

                if (
                    !gameState.unlockedLevels.includes(
                        level
                    )
                ) {

                    notify(
                        "Level locked — complete the previous mission."
                    );

                    return;
                }

                startLevel(level);
            }
        );
    });

/* =========================================================
   START LEVEL
   ========================================================= */

function startLevel(level) {

    gameState.currentLevel = level;

    resetMissionState();

    hide(app);
    show(gameScreen);

    if (loadingOverlay) {
        loadingOverlay.style.display = "flex";
    }

    setTimeout(() => {

        initializeGame();

        if (loadingOverlay) {
            loadingOverlay.style.display = "none";
        }

        gameState.gameRunning = true;

    }, 500);
}

/* =========================================================
   RESET MISSION
   ========================================================= */

function resetMissionState() {

    gameState.health = 100;

    gameState.missionProgress = 0;

    gameState.evidenceFound = false;
    gameState.terminalInvestigated = false;
    gameState.puzzleSolved = false;
    gameState.doorUnlocked = false;
    gameState.enemyDefeated = false;

    gameState.missionComplete = false;
    gameState.paused = false;

    updateHUD();
}

/* =========================================================
   THREE.JS VARIABLES
   ========================================================= */

let scene;
let camera;
let renderer;
let composer;

let player;
let enemy;

let playerModel;
let enemyModel;

let mixerPlayer;
let mixerEnemy;

let clock;

let loader;

let interactables = [];

let terminalObject;
let evidenceObject;
let doorObject;

let playerPosition =
    new THREE.Vector3(
        0,
        1,
        35
    );

let keys = {};

let mouse = {
    x: 0,
    y: 0,
    down: false
};

let shootCooldown = 0;

let enemyHealth = 100;

let gameInitialized = false;

/* =========================================================
   INITIALIZE THREE.JS
   ========================================================= */

function initializeGame() {

    if (!gameContainer) {

        console.error(
            "CyberHunt: gameContainer missing."
        );

        return;
    }

    gameInitialized = false;

    interactables = [];

    /* Scene */

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x020204);

    scene.fog =
        new THREE.FogExp2(
            0x030305,
            0.012
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
        42
    );

    /* Renderer */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
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

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.15;

    gameContainer.innerHTML = "";

    gameContainer.appendChild(
        renderer.domElement
    );

    /* Clock */

    clock = new THREE.Clock();

    /* Loader */

    loader = new GLTFLoader();

    /* Lights */

    createLighting();

    /* Environment */

    createGameEnvironment();

    /* Player */

    loadPlayer();

    /* Enemy */

    loadEnemy();

    /* Post processing */

    createPostProcessing();

    /* Controls */

    setupControls();

    /* Resize */

    window.addEventListener(
        "resize",
        handleResize
    );

    gameInitialized = true;

    animate();
}

/* =========================================================
   LIGHTING
   ========================================================= */

function createLighting() {

    const ambient =
        new THREE.AmbientLight(
            0x555566,
            1.3
        );

    scene.add(ambient);

    const redLight =
        new THREE.PointLight(
            0xff1744,
            7,
            70
        );

    redLight.position.set(
        0,
        12,
        5
    );

    scene.add(redLight);

    const redLight2 =
        new THREE.PointLight(
            0x9e1033,
            5,
            50
        );

    redLight2.position.set(
        -25,
        8,
        -20
    );

    scene.add(redLight2);

    const whiteLight =
        new THREE.DirectionalLight(
            0xdfe7ff,
            1.5
        );

    whiteLight.position.set(
        20,
        35,
        25
    );

    whiteLight.castShadow = true;

    whiteLight.shadow.mapSize.width =
        2048;

    whiteLight.shadow.mapSize.height =
        2048;

    scene.add(whiteLight);
}

/* =========================================================
   ENVIRONMENT
   ========================================================= */

function createGameEnvironment() {

    /* Ground */

    const groundGeometry =
        new THREE.PlaneGeometry(
            180,
            180
        );

    const groundMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x050508,
            roughness: 0.85,
            metalness: 0.35
        });

    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);

    /* Grid */

    const grid =
        new THREE.GridHelper(
            180,
            45,
            0x8d1230,
            0x17131a
        );

    grid.position.y = 0.02;

    grid.material.transparent = true;

    grid.material.opacity = 0.28;

    scene.add(grid);

    /* Road */

    const roadMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x07070b,
            roughness: 0.65,
            metalness: 0.55
        });

    const roadGeometry =
        new THREE.PlaneGeometry(
            24,
            180
        );

    const road =
        new THREE.Mesh(
            roadGeometry,
            roadMaterial
        );

    road.rotation.x =
        -Math.PI / 2;

    road.position.y = 0.04;

    scene.add(road);

    /* Neon road lines */

    for (
        let z = -85;
        z <= 85;
        z += 5
    ) {

        const lineGeometry =
            new THREE.PlaneGeometry(
                0.08,
                2.5
            );

        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xff1744
            });

        const line =
            new THREE.Mesh(
                lineGeometry,
                lineMaterial
            );

        line.rotation.x =
            -Math.PI / 2;

        line.position.set(
            0,
            0.08,
            z
        );

        scene.add(line);
    }

    createBuildings();
    createStreetDetails();
}

/* =========================================================
   BUILDINGS
   ========================================================= */

function createBuildings() {

    const buildings = [

        {
            x: -45,
            z: -35,
            w: 25,
            d: 25,
            h: 30,
            name: "DATA VAULT"
        },

        {
            x: 45,
            z: -35,
            w: 28,
            d: 25,
            h: 38,
            name: "CYBER BANK"
        },

        {
            x: -45,
            z: 40,
            w: 25,
            d: 25,
            h: 34,
            name: "NEXUS LAB"
        },

        {
            x: 45,
            z: 40,
            w: 28,
            d: 25,
            h: 42,
            name: "BLACKSITE"
        },

        {
            x: 0,
            z: -60,
            w: 30,
            d: 20,
            h: 46,
            name: "CYBER CORE"
        }
    ];

    buildings.forEach(
        data => {

            const group =
                new THREE.Group();

            const geometry =
                new THREE.BoxGeometry(
                    data.w,
                    data.h,
                    data.d
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color: 0x090a10,
                    roughness: 0.58,
                    metalness: 0.72
                });

            const building =
                new THREE.Mesh(
                    geometry,
                    material
                );

            building.position.y =
                data.h / 2;

            building.castShadow = true;

            building.receiveShadow = true;

            group.add(building);

            /* Red edges */

            const edgeMaterial =
                new THREE.MeshBasicMaterial({
                    color: 0xff1744
                });

            const edgeGeometry =
                new THREE.BoxGeometry(
                    0.18,
                    data.h,
                    0.18
                );

            const positions = [
                [-data.w / 2, data.d / 2],
                [data.w / 2, data.d / 2],
                [-data.w / 2, -data.d / 2],
                [data.w / 2, -data.d / 2]
            ];

            positions.forEach(
                ([x, z]) => {

                    const edge =
                        new THREE.Mesh(
                            edgeGeometry,
                            edgeMaterial
                        );

                    edge.position.set(
                        x,
                        data.h / 2,
                        z
                    );

                    group.add(edge);
                }
            );

            /* Windows */

            for (
                let y = 5;
                y < data.h - 2;
                y += 5
            ) {

                for (
                    let x = -data.w / 2 + 3;
                    x < data.w / 2 - 1;
                    x += 4
                ) {

                    const windowGeometry =
                        new THREE.BoxGeometry(
                            1.4,
                            1.6,
                            0.06
                        );

                    const windowMaterial =
                        new THREE.MeshBasicMaterial({
                            color:
                                0x9e1033
                        });

                    const window =
                        new THREE.Mesh(
                            windowGeometry,
                            windowMaterial
                        );

                    window.position.set(
                        x,
                        y,
                        data.d / 2 + 0.05
                    );

                    group.add(window);
                }
            }

            group.position.set(
                data.x,
                0,
                data.z
            );

            scene.add(group);
        }
    );
}

/* =========================================================
   STREET DETAILS
   ========================================================= */

function createStreetDetails() {

    for (
        let x = -70;
        x <= 70;
        x += 14
    ) {

        createStreetLamp(
            x,
            -12
        );

        createStreetLamp(
            x,
            12
        );
    }

    /* Crates */

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        const crateGeometry =
            new THREE.BoxGeometry(
                2.5,
                2.5,
                2.5
            );

        const crateMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x12131a,
                metalness: 0.65,
                roughness: 0.55
            });

        const crate =
            new THREE.Mesh(
                crateGeometry,
                crateMaterial
            );

        crate.position.set(
            -12 +
            Math.random() * 24,
            1.25,
            -25 +
            Math.random() * 30
        );

        crate.rotation.y =
            Math.random() * Math.PI;

        crate.castShadow = true;

        scene.add(crate);
    }
}

/* =========================================================
   STREET LAMP
   ========================================================= */

function createStreetLamp(
    x,
    z
) {

    const group =
        new THREE.Group();

    const poleGeometry =
        new THREE.CylinderGeometry(
            0.12,
            0.18,
            6,
            8
        );

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x1a1b21,
            metalness: 0.85,
            roughness: 0.3
        });

    const pole =
        new THREE.Mesh(
            poleGeometry,
            poleMaterial
        );

    pole.position.y = 3;

    group.add(pole);

    const lamp =
        new THREE.PointLight(
            0xff1744,
            1.8,
            14
        );

    lamp.position.y = 6;

    group.add(lamp);

    const glowGeometry =
        new THREE.SphereGeometry(
            0.24,
            12,
            12
        );

    const glowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff1744
        });

    const glow =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );

    glow.position.y = 6;

    group.add(glow);

    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}

/* =========================================================
   POST PROCESSING
   ========================================================= */

function createPostProcessing() {

    composer =
        new EffectComposer(
            renderer
        );

    const renderPass =
        new RenderPass(
            scene,
            camera
        );

    composer.addPass(
        renderPass
    );

    const bloom =
        new UnrealBloomPass(
            new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            ),
            0.75,
            0.65,
            0.88
        );

    composer.addPass(
        bloom
    );
}

/* =========================================================
   LOAD PLAYER
   ========================================================= */

function loadPlayer() {

    const path =
        gameState.selectedOperative === "kai"
            ? MODEL_PATHS.kai
            : MODEL_PATHS.vexa;

    loader.load(
        path,

        gltf => {

            playerModel =
                gltf.scene;

            playerModel.scale.set(
                1.7,
                1.7,
                1.7
            );

            playerModel.position.copy(
                playerPosition
            );

            playerModel.traverse(
                object => {

                    if (
                        object.isMesh
                    ) {

                        object.castShadow = true;
                        object.receiveShadow = true;
                    }
                }
            );

            scene.add(
                playerModel
            );

            player =
                playerModel;

            if (
                gltf.animations &&
                gltf.animations.length
            ) {

                mixerPlayer =
                    new THREE.AnimationMixer(
                        playerModel
                    );

                mixerPlayer
                    .clipAction(
                        gltf.animations[0]
                    )
                    .play();
            }

            notify(
                gameState.selectedOperative === "kai"
                    ? "KAI deployed"
                    : "VEXA deployed"
            );
        },

        undefined,

        error => {

            console.error(
                "Player model failed:",
                error
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

            enemyModel =
                gltf.scene;

            enemyModel.scale.set(
                1.8,
                1.8,
                1.8
            );

            enemyModel.position.set(
                0,
                0,
                -15
            );

            enemyModel.traverse(
                object => {

                    if (
                        object.isMesh
                    ) {

                        object.castShadow = true;
                        object.receiveShadow = true;
                    }
                }
            );

            scene.add(
                enemyModel
            );

            enemy =
                enemyModel;

            enemyHealth = 100;

            if (
                gltf.animations &&
                gltf.animations.length
            ) {

                mixerEnemy =
                    new THREE.AnimationMixer(
                        enemyModel
                    );

                mixerEnemy
                    .clipAction(
                        gltf.animations[0]
                    )
                    .play();
            }
        },

        undefined,

        error => {

            console.error(
                "Enemy model failed:",
                error
            );
        }
    );
}

/* =========================================================
   LEVEL 1 OBJECTS
   ========================================================= */

function createLevelObjects() {

    if (terminalObject) {
        scene.remove(
            terminalObject
        );
    }

    if (evidenceObject) {
        scene.remove(
            evidenceObject
        );
    }

    if (doorObject) {
        scene.remove(
            doorObject
        );
    }

    /* Terminal */

    terminalObject =
        createTerminal();

    terminalObject.position.set(
        -7,
        1.5,
        -5
    );

    scene.add(
        terminalObject
    );

    interactables.push(
        terminalObject
    );

    /* Evidence */

    evidenceObject =
        createEvidence();

    evidenceObject.position.set(
        8,
        0.7,
        4
    );

    scene.add(
        evidenceObject
    );

    interactables.push(
        evidenceObject
    );

    /* Door */

    doorObject =
        createDoor();

    doorObject.position.set(
        0,
        0,
        -27
    );

    scene.add(
        doorObject
    );

    interactables.push(
        doorObject
    );
}

/* =========================================================
   TERMINAL
   ========================================================= */

function createTerminal() {

    const group =
        new THREE.Group();

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.8,
                2.2,
                1.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x101219,
                metalness: 0.75,
                roughness: 0.35
            })
        );

    body.castShadow = true;

    group.add(body);

    const screen =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.2,
                1.2,
                0.08
            ),
            new THREE.MeshBasicMaterial({
                color: 0x8d1230
            })
        );

    screen.position.set(
        0,
        0.2,
        0.68
    );

    group.add(screen);

    group.userData = {
        type: "terminal",
        label: "SECURITY TERMINAL"
    };

    return group;
}

/* =========================================================
   EVIDENCE
   ========================================================= */

function createEvidence() {

    const group =
        new THREE.Group();

    const usb =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.5,
                0.35,
                0.65
            ),
            new THREE.MeshStandardMaterial({
                color: 0x17191f,
                metalness: 0.85,
                roughness: 0.25,
                emissive: 0x6e0d25,
                emissiveIntensity: 0.5
            })
        );

    usb.castShadow = true;

    group.add(usb);

    group.userData = {
        type: "evidence",
        label: "ENCRYPTED USB"
    };

    return group;
}

/* =========================================================
   DOOR
   ========================================================= */

function createDoor() {

    const group =
        new THREE.Group();

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                6,
                8,
                0.5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x07080c,
                metalness: 0.8,
                roughness: 0.25
            })
        );

    door.position.y = 4;

    group.add(door);

    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                6.5,
                8.5,
                0.25
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1744,
                wireframe: true
            })
        );

    frame.position.y = 4;

    group.add(frame);

    group.userData = {
        type: "door",
        label: "RESTRICTED ACCESS"
    };

    return group;
}

/* =========================================================
   CONTROLS
   ========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            keys[event.key.toLowerCase()] =
                true;

            if (
                event.key.toLowerCase() === "e"
            ) {
                interact();
            }

            if (
                event.key.toLowerCase() === "r"
            ) {
                reloadWeapon();
            }

            if (
                event.key === "Escape"
            ) {
                togglePause();
            }
        }
    );

    window.addEventListener(
        "keyup",
        event => {

            keys[event.key.toLowerCase()] =
                false;
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

                mouse.down = true;

                shoot();
            }
        }
    );

    window.addEventListener(
        "mouseup",
        () => {

            mouse.down = false;
        }
    );
}

/* =========================================================
   MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        !player ||
        gameState.paused ||
        !gameState.gameRunning
    ) {
        return;
    }

    const speed = 9 * delta;

    let direction =
        new THREE.Vector3();

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        direction.z -= 1;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        direction.z += 1;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        direction.x -= 1;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        direction.x += 1;
    }

    if (
        direction.lengthSq() > 0
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

    /* Keep player inside arena */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -80,
            80
        );

    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -80,
            80
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

    const desired =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 5.5,
            player.position.z + 10
        );

    camera.position.lerp(
        desired,
        0.08
    );

    const lookAt =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 1.5,
            player.position.z
        );

    camera.lookAt(
        lookAt
    );
}

/* =========================================================
   INTERACTION
   ========================================================= */

function interact() {

    if (
        !player ||
        !gameState.gameRunning
    ) {
        return;
    }

    let closest = null;
    let closestDistance = 4.5;

    interactables.forEach(
        object => {

            if (!object) return;

            const distance =
                player.position.distanceTo(
                    object.position
                );

            if (
                distance < closestDistance
            ) {

                closestDistance =
                    distance;

                closest = object;
            }
        }
    );

    if (!closest) {

        notify(
            "Nothing to interact with."
        );

        return;
    }

    const type =
        closest.userData.type;

    if (
        type === "evidence"
    ) {

        collectEvidence();
    }

    else if (
        type === "terminal"
    ) {

        investigateTerminal();
    }

    else if (
        type === "door"
    ) {

        useDoor();
    }
}

/* =========================================================
   EVIDENCE
   ========================================================= */

function collectEvidence() {

    if (
        gameState.evidenceFound
    ) {

        notify(
            "Evidence already collected."
        );

        return;
    }

    gameState.evidenceFound =
        true;

    gameState.missionProgress =
        Math.max(
            gameState.missionProgress,
            25
        );

    if (evidenceObject) {

        evidenceObject.visible =
            false;
    }

    gainXP(100);

    updateHUD();

    notify(
        "Encrypted USB recovered +100 XP"
    );
}

/* =========================================================
   TERMINAL
   ========================================================= */

function investigateTerminal() {

    gameState.terminalInvestigated =
        true;

    gameState.missionProgress =
        Math.max(
            gameState.missionProgress,
            50
        );

    updateHUD();

    if (puzzleModal) {

        puzzleModal.style.display =
            "flex";
    }

    setText(
        "puzzleQuestion",
        "Decrypt the access key from the clue."
    );

    setText(
        "puzzleClue",
        "USB CLUE: 2 + 0 + 2 + 6"
    );
}

/* =========================================================
   PUZZLE
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

        if (
            answer === "10"
        ) {

            gameState.puzzleSolved =
                true;

            gameState.missionProgress =
                75;

            if (puzzleModal) {
                puzzleModal.style.display =
                    "none";
            }

            gainXP(150);

            updateHUD();

            notify(
                "ACCESS KEY ACCEPTED +150 XP"
            );

        } else {

            damagePlayer(5);

            notify(
                "Incorrect code. Security system detected you."
            );
        }
    };

/* =========================================================
   DOOR
   ========================================================= */

function useDoor() {

    if (
        !gameState.puzzleSolved
    ) {

        notify(
            "Door locked. Solve the terminal puzzle first."
        );

        return;
    }

    if (
        gameState.doorUnlocked
    ) {

        notify(
            "Restricted door already unlocked."
        );

        return;
    }

    gameState.doorUnlocked =
        true;

    gameState.missionProgress =
        90;

    if (doorObject) {

        doorObject.position.y =
            -9;
    }

    gainXP(100);

    updateHUD();

    notify(
        "RESTRICTED ACCESS UNLOCKED"
    );
}

/* =========================================================
   SHOOTING
   ========================================================= */

function shoot() {

    if (
        !gameState.gameRunning ||
        gameState.paused ||
        !enemy
    ) {
        return;
    }

    if (
        shootCooldown > 0
    ) {
        return;
    }

    shootCooldown = 0.35;

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
        hits.length > 0
    ) {

        enemyHealth -= 25;

        createHitEffect(
            hits[0].point
        );

        notify(
            `TARGET HIT — ${Math.max(
                enemyHealth,
                0
            )}%`
        );

        if (
            enemyHealth <= 0
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

    const geometry =
        new THREE.SphereGeometry(
            0.15,
            8,
            8
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0xff1744
        });

    const effect =
        new THREE.Mesh(
            geometry,
            material
        );

    effect.position.copy(
        position
    );

    scene.add(effect);

    setTimeout(() => {

        scene.remove(effect);

    }, 180);
}

/* =========================================================
   ENEMY AI
   ========================================================= */

function updateEnemy(delta) {

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
                delta * 2.2
            )
        );

        enemy.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );

    } else {

        damagePlayer(
            delta * 4
        );
    }
}

/* =========================================================
   ENEMY DEFEATED
   ========================================================= */

function defeatEnemy() {

    if (
        gameState.enemyDefeated
    ) {
        return;
    }

    gameState.enemyDefeated =
        true;

    gameState.missionProgress =
        100;

    if (enemy) {

        enemy.visible =
            false;
    }

    gainXP(250);

    completeMission();
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
        gameState.health <= 0
    ) {

        gameOver();
    }
}

/* =========================================================
   GAME OVER
   ========================================================= */

function gameOver() {

    gameState.gameRunning =
        false;

    notify(
        "MISSION FAILED"
    );

    setTimeout(() => {

        restartGame();

    }, 1200);
}

/* =========================================================
   COMPLETE MISSION
========================================================= */

function completeMission() {

    if (
        gameState.missionComplete
    ) {
        return;
    }

    gameState.missionComplete =
        true;

    gameState.gameRunning =
        false;

    gameState.missionsCompleted++;

    if (
        !gameState.badges.includes(
            "DATA BREAKER"
        )
    ) {

        gameState.badges.push(
            "DATA BREAKER"
        );
    }

    const nextLevel =
        gameState.currentLevel + 1;

    if (
        nextLevel <= 5 &&
        !gameState.unlockedLevels.includes(
            nextLevel
        )
    ) {

        gameState.unlockedLevels.push(
            nextLevel
        );
    }

    updateDashboard();
    updateProfile();
    updateLevels();

    if (
        missionCompleteModal
    ) {

        missionCompleteModal.style.display =
            "flex";
    }

    setText(
        "missionReward",
        "+250 XP"
    );

    setText(
        "missionTitle",
        "MISSION COMPLETE"
    );

    notify(
        "MISSION COMPLETE — DATA VAULT SECURED"
    );
}

/* =========================================================
   XP
   ========================================================= */

function gainXP(amount) {

    gameState.xp +=
        amount;

    updateDashboard();
    updateProfile();
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    setText(
        "xpValue",
        gameState.xp
    );

    setText(
        "levelValue",
        `LEVEL ${gameState.level}`
    );

    setText(
        "missionsValue",
        gameState.missionsCompleted
    );

    setText(
        "badgeValue",
        gameState.badges.length
    );

    const xpElements =
        document.querySelectorAll(
            "[data-xp]"
        );

    xpElements.forEach(
        element => {

            element.textContent =
                gameState.xp;
        }
    );
}

/* =========================================================
   PROFILE
   ========================================================= */

function updateProfile() {

    setText(
        "profileXP",
        gameState.xp
    );

    setText(
        "profileLevel",
        `LEVEL ${gameState.level}`
    );

    setText(
        "profileMissions",
        gameState.missionsCompleted
    );

    setText(
        "profileBadges",
        gameState.badges.length
    );
}

/* =========================================================
   LEVELS
   ========================================================= */

function updateLevels() {

    document
        .querySelectorAll(
            "[data-start-level]"
        )
        .forEach(button => {

            const level =
                Number(
                    button.dataset.startLevel
                );

            const unlocked =
                gameState.unlockedLevels.includes(
                    level
                );

            button.disabled =
                !unlocked;

            button.classList.toggle(
                "locked",
                !unlocked
            );
        });
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
            gameState.missionProgress
        )}%`
    );

    const progress =
        $("missionProgressBar");

    if (progress) {

        progress.style.width =
            `${gameState.missionProgress}%`;
    }

    const objective =
        $("objectiveText");

    if (objective) {

        if (
            !gameState.evidenceFound
        ) {

            objective.textContent =
                "Locate the encrypted evidence.";

        } else if (
            !gameState.puzzleSolved
        ) {

            objective.textContent =
                "Investigate the security terminal.";

        } else if (
            !gameState.doorUnlocked
        ) {

            objective.textContent =
                "Unlock the restricted door.";

        } else if (
            !gameState.enemyDefeated
        ) {

            objective.textContent =
                "Neutralize the hostile target.";

        } else {

            objective.textContent =
                "Escape the facility.";
        }
    }
}

/* =========================================================
   RELOAD
   ========================================================= */

function reloadWeapon() {

    notify(
        "WEAPON SYSTEM READY"
    );
}

/* =========================================================
   PAUSE
   ========================================================= */

function togglePause() {

    if (
        !gameState.gameRunning
    ) {
        return;
    }

    gameState.paused =
        !gameState.paused;

    if (
        pauseMenu
    ) {

        pauseMenu.style.display =
            gameState.paused
                ? "flex"
                : "none";
    }
}

/* =========================================================
   RESTART
   ========================================================= */

function restartGame() {

    gameState.gameRunning =
        false;

    if (gameScreen) {
        gameScreen.style.display =
            "none";
    }

    if (app) {
        app.style.display =
            "block";
    }

    navigateTo(
        "dashboard"
    );

    updateDashboard();
}

/* =========================================================
   RETURN TO DASHBOARD
   ========================================================= */

window.returnToDashboard =
    function () {

        gameState.gameRunning =
            false;

        if (missionCompleteModal) {
            missionCompleteModal.style.display =
                "none";
        }

        if (pauseMenu) {
            pauseMenu.style.display =
                "none";
        }

        hide(gameScreen);
        show(app);

        navigateTo(
            "dashboard"
        );

        updateDashboard();
    };

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function notify(message) {

    console.log(
        "CYBERHUNT:",
        message
    );

    let notification =
        document.getElementById(
            "cyberNotification"
        );

    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "cyberNotification";

        document.body.appendChild(
            notification
        );
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
        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

        }, 2500);
}

/* =========================================================
   RESIZE
   ========================================================= */

function handleResize() {

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

    if (!gameInitialized) {
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
        gameState.gameRunning &&
        !gameState.paused
    ) {

        updatePlayer(delta);
        updateEnemy(delta);

        shootCooldown =
            Math.max(
                0,
                shootCooldown - delta
            );
    }

    if (mixerPlayer) {
        mixerPlayer.update(delta);
    }

    if (mixerEnemy) {
        mixerEnemy.update(delta);
    }

    /* Subtle cyber lighting pulse */

    scene.traverse(
        object => {

            if (
                object.isPointLight &&
                object.color
            ) {

                if (
                    object.color.r > 0.5 &&
                    object.color.g < 0.2
                ) {

                    object.intensity =
                        1.5 +
                        Math.sin(
                            elapsed * 2
                        ) * 0.3;
                }
            }
        }
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
   INITIAL STATE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (cinematicIntro) {

            cinematicIntro.style.display =
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

        updateDashboard();
        updateProfile();
        updateLevels();
        updateHUD();

        console.log(
            "CYBERHUNT SYSTEM ONLINE"
        );
    }
);
```
