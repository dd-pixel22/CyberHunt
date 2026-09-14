```javascript
/* =========================================================
   CYBERHUNT
   MAIN GAME CONTROLLER
   VEXA + KAI + ENEMY
   LEVEL 1 DATA VAULT
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

    vexa:
        "./assets/models/girl-agent.glb",

    kai:
        "./assets/models/boy-agent.glb",

    enemy:
        "./assets/models/enemy.glb"

};


/* =========================================================
   GAME STATE
========================================================= */

const gameState = {

    currentPage: "dashboardPage",

    currentLevel: 1,

    selectedOperative: "vexa",

    xp: 0,

    level: 1,

    missionsCompleted: 0,

    badges: 0,

    health: 100,

    missionProgress: 0,

    evidenceFound: false,

    terminalInvestigated: false,

    puzzleSolved: false,

    doorUnlocked: false,

    enemyDefeated: false,

    missionComplete: false,

    gameRunning: false,

    paused: false

};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const qs = (selector) =>
    document.querySelector(selector);

const qsa = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   DOM REFERENCES
========================================================= */

const cinematicIntro = $("cinematicIntro");
const app = $("app");
const gameScreen = $("gameScreen");

const enterGameBtn = $("enterGameBtn");

const continueMissionBtn =
    $("continueMissionBtn");

const startLevel1Btn =
    $("startLevel1Btn");

const returnDashboardBtn =
    $("returnDashboardBtn");

const exitGameBtn =
    $("exitGameBtn");

const pauseGameBtn =
    $("pauseGameBtn");

const resumeGameBtn =
    $("resumeGameBtn");

const pauseExitBtn =
    $("pauseExitBtn");

const pauseMenu =
    $("pauseMenu");

const interactionModal =
    $("interactionModal");

const closeInteractionBtn =
    $("closeInteractionBtn");

const puzzleModal =
    $("puzzleModal");

const puzzleSubmitBtn =
    $("puzzleSubmitBtn");

const puzzleCancelBtn =
    $("puzzleCancelBtn");

const puzzleInput =
    $("puzzleInput");

const missionComplete =
    $("missionComplete");

const loadingOverlay =
    $("loadingOverlay");

const loadingFill =
    $("loadingFill");

const loadingText =
    $("loadingText");


/* =========================================================
   THREE.JS VARIABLES
========================================================= */

let scene = null;

let camera = null;

let renderer = null;

let composer = null;

let clock = null;

let animationFrame = null;

let gltfLoader = null;

let player = null;

let enemy = null;

let currentWeapon = null;

let environmentGroup = null;

let interactables = [];

let bullets = [];

let enemyProjectiles = [];

let keys = {};

let mouse = {

    x: 0,

    y: 0,

    down: false

};

let playerVelocity = new THREE.Vector3();

let cameraTarget =
    new THREE.Vector3();

let raycaster =
    new THREE.Raycaster();

let centerScreen =
    new THREE.Vector2(0, 0);

let gameInitialized = false;


/* =========================================================
   INTRO
========================================================= */

function startIntro() {

    if (!cinematicIntro) return;

    cinematicIntro.classList.add("active");

    setTimeout(() => {

        const title =
            qs(".intro-title");

        if (title) {

            title.classList.add("glitch");

            setTimeout(() => {

                title.classList.remove("glitch");

            }, 300);

        }

    }, 1600);

}


function enterCyberHunt() {

    cinematicIntro.classList.add("hidden");

    app.classList.remove("hidden");

    showPage("dashboardPage");

    updateDashboard();

}


if (enterGameBtn) {

    enterGameBtn.addEventListener(
        "click",
        enterCyberHunt
    );

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {

    qsa(".page").forEach((page) => {

        page.classList.remove(
            "active-page"
        );

    });


    const page =
        $(pageId);

    if (page) {

        page.classList.add(
            "active-page"
        );

    }


    qsa(".nav-btn").forEach((button) => {

        button.classList.remove("active");

        if (
            button.dataset.page ===
            pageId
        ) {

            button.classList.add(
                "active"
            );

        }

    });


    gameState.currentPage =
        pageId;

}


/* Navigation buttons */

qsa(".nav-btn").forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            if (!page) return;

            showPage(page);

            updateDashboard();

        }
    );

});


/* Dashboard cards */

qsa(".dashboard-card").forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const target =
                    card.dataset.pageTarget;

                if (target) {

                    showPage(target);

                }

            }
        );

    }
);


/* =========================================================
   OPERATIVE SELECTION
========================================================= */

qsa(".operative-card").forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                const operative =
                    card.dataset.operative;

                if (!operative) return;

                selectOperative(
                    operative
                );

            }
        );

    }
);


function selectOperative(
    operative
) {

    if (
        operative !== "vexa" &&
        operative !== "kai"
    ) {

        return;

    }


    gameState.selectedOperative =
        operative;


    qsa(".operative-card")
        .forEach((card) => {

            card.classList.remove(
                "selected"
            );

            const label =
                card.querySelector(
                    ".operative-selected"
                );

            if (label) {

                label.textContent =
                    "SELECT";

            }

        });


    const selected =
        qs(
            `[data-operative="${operative}"]`
        );


    if (selected) {

        selected.classList.add(
            "selected"
        );

        const label =
            selected.querySelector(
                ".operative-selected"
            );

        if (label) {

            label.textContent =
                "SELECTED";

        }

    }


    const profileName =
        qs(".profile-card h3");

    if (profileName) {

        profileName.textContent =
            operative === "vexa"
                ? "VEXA"
                : "KAI";

    }

}


/* =========================================================
   LEVEL BUTTONS
========================================================= */

qsa("[data-start-level]").forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const level =
                    Number(
                        button.dataset.startLevel
                    );

                if (
                    level === 1
                ) {

                    startLevel(1);

                }

            }
        );

    }
);


/* =========================================================
   START LEVEL
========================================================= */

function startLevel(level) {

    if (level !== 1) {

        return;

    }


    gameState.currentLevel =
        level;

    resetMissionState();

    showLoading(
        "Loading Data Vault..."
    );


    setTimeout(() => {

        hideLoading();

        app.classList.add(
            "hidden"
        );

        gameScreen.classList.remove(
            "hidden"
        );

        initializeGame();

    }, 900);

}


if (continueMissionBtn) {

    continueMissionBtn.addEventListener(
        "click",
        () => {

            startLevel(1);

        }
    );

}


if (startLevel1Btn) {

    startLevel1Btn.addEventListener(
        "click",
        () => {

            startLevel(1);

        }
    );

}


/* =========================================================
   MISSION RESET
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

    gameState.gameRunning = false;

    gameState.paused = false;

    updateGameHUD();

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
    message = "Loading..."
) {

    if (!loadingOverlay) return;

    loadingOverlay.classList.remove(
        "hidden"
    );

    loadingText.textContent =
        message;

    loadingFill.style.width =
        "15%";


    setTimeout(() => {

        loadingFill.style.width =
            "45%";

    }, 150);


    setTimeout(() => {

        loadingFill.style.width =
            "75%";

    }, 350);


    setTimeout(() => {

        loadingFill.style.width =
            "100%";

    }, 600);

}


function hideLoading() {

    if (!loadingOverlay) return;

    setTimeout(() => {

        loadingOverlay.classList.add(
            "hidden"
        );

    }, 150);

}


/* =========================================================
   THREE.JS GAME INITIALIZATION
========================================================= */

function initializeGame() {

    if (gameInitialized) {

        restartGameScene();

        return;

    }


    gameInitialized = true;

    clock =
        new THREE.Clock();

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0x030303
        );


    scene.fog =
        new THREE.FogExp2(
            0x030303,
            0.018
        );


    /* Camera */

    camera =
        new THREE.PerspectiveCamera(
            65,
            window.innerWidth /
                window.innerHeight,
            0.1,
            1000
        );


    camera.position.set(
        0,
        4.5,
        13
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


    $("gameContainer")
        .appendChild(
            renderer.domElement
        );


    /* Lighting */

    createLighting();


    /* Environment */

    createDataVault();


    /* Post-processing */

    createPostProcessing();


    /* Player */

    loadSelectedPlayer();


    /* Enemy */

    loadEnemy();


    /* Controls */

    setupGameControls();


    /* Resize */

    window.addEventListener(
        "resize",
        onWindowResize
    );


    gameState.gameRunning =
        true;


    updateGameHUD();

    animateGame();

}


/* =========================================================
   LIGHTING
========================================================= */

function createLighting() {

    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            0.35
        );

    scene.add(
        ambient
    );


    const redLight =
        new THREE.PointLight(
            0xe5092f,
            15,
            35
        );

    redLight.position.set(
        0,
        8,
        0
    );

    scene.add(
        redLight
    );


    const redLightTwo =
        new THREE.PointLight(
            0x8f061e,
            10,
            25
        );

    redLightTwo.position.set(
        -15,
        4,
        -10
    );

    scene.add(
        redLightTwo
    );


    const whiteLight =
        new THREE.DirectionalLight(
            0xffffff,
            1.2
        );

    whiteLight.position.set(
        10,
        18,
        10
    );

    whiteLight.castShadow =
        true;


    whiteLight.shadow.mapSize.width =
        1024;

    whiteLight.shadow.mapSize.height =
        1024;

    scene.add(
        whiteLight
    );

}


/* =========================================================
   POST PROCESSING
========================================================= */

function createPostProcessing() {

    const renderPass =
        new RenderPass(
            scene,
            camera
        );


    const bloom =
        new UnrealBloomPass(
            new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            ),
            0.65,
            0.55,
            0.8
        );


    composer =
        new EffectComposer(
            renderer
        );


    composer.addPass(
        renderPass
    );

    composer.addPass(
        bloom
    );

}


/* =========================================================
   CYBERCITY / DATA VAULT
========================================================= */

function createDataVault() {

    environmentGroup =
        new THREE.Group();


    scene.add(
        environmentGroup
    );


    /* Floor */

    const floorGeometry =
        new THREE.PlaneGeometry(
            90,
            90
        );


    const floorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x070707,
            metalness: 0.75,
            roughness: 0.32
        });


    const floor =
        new THREE.Mesh(
            floorGeometry,
            floorMaterial
        );


    floor.rotation.x =
        -Math.PI / 2;


    floor.receiveShadow =
        true;


    environmentGroup.add(
        floor
    );


    /* Grid */

    const grid =
        new THREE.GridHelper(
            90,
            90,
            0x650719,
            0x26040a
        );


    grid.position.y =
        0.02;


    environmentGroup.add(
        grid
    );


    /* Main building */

    createBuilding(
        0,
        6,
        -12,
        26,
        13,
        2
    );


    /* Side structures */

    createBuilding(
        -22,
        4,
        -18,
        15,
        9,
        1
    );


    createBuilding(
        22,
        4,
        -18,
        15,
        9,
        1
    );


    /* Neon pillars */

    for (
        let i = -3;
        i <= 3;
        i++
    ) {

        createNeonPillar(
            i * 5,
            0,
            2
        );

    }


    /* Road */

    const roadGeometry =
        new THREE.PlaneGeometry(
            9,
            60
        );


    const roadMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x030303,
            roughness: 0.8,
            metalness: 0.2
        });


    const road =
        new THREE.Mesh(
            roadGeometry,
            roadMaterial
        );


    road.rotation.x =
        -Math.PI / 2;


    road.position.set(
        0,
        0.04,
        2
    );


    environmentGroup.add(
        road
    );


    /* Cyber lines */

    for (
        let z = -25;
        z <= 25;
        z += 5
    ) {

        const lineGeometry =
            new THREE.BoxGeometry(
                0.08,
                0.03,
                3
            );


        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xe5092f
            });


        const line =
            new THREE.Mesh(
                lineGeometry,
                lineMaterial
            );


        line.position.set(
            0,
            0.08,
            z
        );


        environmentGroup.add(
            line
        );

    }


    /* Terminal */

    createTerminal(
        0,
        1.6,
        -2
    );


    /* Evidence */

    createEvidence(
        -5,
        1,
        -7
    );


    /* Locked door */

    createLockedDoor(
        0,
        2.8,
        -22
    );


    /* Decorative crates */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createCrate(
            THREE.MathUtils.randFloat(
                -13,
                13
            ),
            THREE.MathUtils.randFloat(
                -17,
                -5
            )
        );

    }

}


/* =========================================================
   BUILDING
========================================================= */

function createBuilding(
    x,
    width,
    z,
    height,
    depth,
    floors
) {

    const buildingGeometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );


    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x0b0b0c,
            metalness: 0.75,
            roughness: 0.3
        });


    const building =
        new THREE.Mesh(
            buildingGeometry,
            buildingMaterial
        );


    building.position.set(
        x,
        height / 2,
        z
    );


    building.castShadow =
        true;

    building.receiveShadow =
        true;


    environmentGroup.add(
        building
    );


    /* Red windows */

    for (
        let floorIndex = 0;
        floorIndex < floors + 4;
        floorIndex++
    ) {

        const y =
            2 +
            floorIndex *
            Math.max(
                1.6,
                height / 7
            );


        if (
            y >= height - 0.5
        ) continue;


        for (
            let wx = -width / 2 + 1.5;
            wx < width / 2 - 0.5;
            wx += 2
        ) {

            const windowGeometry =
                new THREE.BoxGeometry(
                    0.7,
                    0.35,
                    0.06
                );


            const windowMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        Math.random() > 0.45
                            ? 0xe5092f
                            : 0x251014
                });


            const windowMesh =
                new THREE.Mesh(
                    windowGeometry,
                    windowMaterial
                );


            windowMesh.position.set(
                x + wx,
                y,
                z - depth / 2 - 0.04
            );


            environmentGroup.add(
                windowMesh
            );

        }

    }

}


/* =========================================================
   NEON PILLAR
========================================================= */

function createNeonPillar(
    x,
    y,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            0.3,
            5,
            0.3
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xe5092f
        });


    const pillar =
        new THREE.Mesh(
            geometry,
            material
        );


    pillar.position.set(
        x,
        2.5,
        z
    );


    environmentGroup.add(
        pillar
    );

}


/* =========================================================
   CRATE
========================================================= */

function createCrate(
    x,
    z
) {

    const geometry =
        new THREE.BoxGeometry(
            1.4,
            1.2,
            1.4
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: 0x101010,
            metalness: 0.45,
            roughness: 0.6
        });


    const crate =
        new THREE.Mesh(
            geometry,
            material
        );


    crate.position.set(
        x,
        0.6,
        z
    );


    crate.rotation.y =
        Math.random() *
        Math.PI;


    crate.castShadow =
        true;


    environmentGroup.add(
        crate
    );

}


/* =========================================================
   TERMINAL
========================================================= */

function createTerminal(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    group.position.set(
        x,
        0,
        z
    );


    const base =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                2,
                1.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x090909,
                metalness: 0.8,
                roughness: 0.3
            })
        );


    base.position.y =
        1;


    base.castShadow =
        true;


    group.add(
        base
    );


    const screen =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                1.1,
                0.08
            ),
            new THREE.MeshBasicMaterial({
                color: 0xe5092f
            })
        );


    screen.position.set(
        0,
        1.4,
        -0.68
    );


    group.add(
        screen
    );


    group.userData = {

        type:
            "terminal",

        label:
            "COMPROMISED TERMINAL"

    };


    environmentGroup.add(
        group
    );


    interactables.push(
        group
    );

}


/* =========================================================
   EVIDENCE
========================================================= */

function createEvidence(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    group.position.set(
        x,
        y,
        z
    );


    const device =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.9,
                0.18,
                0.35
            ),
            new THREE.MeshStandardMaterial({
                color: 0x151515,
                metalness: 0.85,
                roughness: 0.25
            })
        );


    group.add(
        device
    );


    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                0.04,
                0.04
            ),
            new THREE.MeshBasicMaterial({
                color: 0xe5092f
            })
        );


    light.position.x =
        0.2;


    light.position.y =
        0.11;


    group.add(
        light
    );


    group.userData = {

        type:
            "evidence",

        label:
            "UNKNOWN USB DEVICE"

    };


    environmentGroup.add(
        group
    );


    interactables.push(
        group
    );

}


/* =========================================================
   LOCKED DOOR
========================================================= */

function createLockedDoor(
    x,
    y,
    z
) {

    const group =
        new THREE.Group();


    group.position.set(
        x,
        0,
        z
    );


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                6,
                6,
                0.5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x090909,
                metalness: 0.8,
                roughness: 0.3
            })
        );


    frame.position.y =
        3;


    group.add(
        frame
    );


    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.5,
                5.2,
                0.25
            ),
            new THREE.MeshStandardMaterial({
                color: 0x16070a,
                metalness: 0.75,
                roughness: 0.25
            })
        );


    door.position.set(
        0,
        2.6,
        -0.3
    );


    group.add(
        door
    );


    const lockLight =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.25,
                0.25,
                0.1
            ),
            new THREE.MeshBasicMaterial({
                color: 0xe5092f
            })
        );


    lockLight.position.set(
        2,
        2.8,
        -0.5
    );


    group.add(
        lockLight
    );


    group.userData = {

        type:
            "door",

        label:
            "RESTRICTED ACCESS"

    };


    environmentGroup.add(
        group
    );


    interactables.push(
        group
    );

}


/* =========================================================
   LOAD PLAYER
========================================================= */

function loadSelectedPlayer() {

    if (player) {

        scene.remove(
            player
        );

        player = null;

    }


    const path =
        gameState.selectedOperative ===
        "kai"
            ? MODEL_PATHS.kai
            : MODEL_PATHS.vexa;


    gltfLoader =
        gltfLoader ||
        new GLTFLoader();


    gltfLoader.load(

        path,

        (gltf) => {

            player =
                gltf.scene;


            player.scale.set(
                2.2,
                2.2,
                2.2
            );


            player.position.set(
                0,
                0,
                8
            );


            player.rotation.y =
                Math.PI;


            player.traverse(
                (object) => {

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


            camera.position.set(
                0,
                5,
                15
            );


            cameraTarget.copy(
                player.position
            );


            updateLoadingMessage(
                "OPERATIVE READY"
            );

        },

        (progress) => {

            if (
                progress.total
            ) {

                const percent =
                    Math.round(
                        progress.loaded /
                        progress.total *
                        100
                    );

                updateLoadingMessage(
                    `Loading operative ${percent}%`
                );

            }

        },

        (error) => {

            console.error(
                "VEXA/KAI model loading error:",
                error
            );


            updateLoadingMessage(
                "Operative model unavailable"
            );

        }

    );

}


/* =========================================================
   LOAD ENEMY
========================================================= */

function loadEnemy() {

    if (enemy) {

        scene.remove(
            enemy
        );

        enemy = null;

    }


    gltfLoader =
        gltfLoader ||
        new GLTFLoader();


    gltfLoader.load(

        MODEL_PATHS.enemy,

        (gltf) => {

            enemy =
                gltf.scene;


            enemy.scale.set(
                2.1,
                2.1,
                2.1
            );


            enemy.position.set(
                5,
                0,
                -10
            );


            enemy.rotation.y =
                Math.PI;


            enemy.userData = {

                health: 100,

                active: true

            };


            enemy.traverse(
                (object) => {

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

        },

        undefined,

        (error) => {

            console.error(
                "Enemy model loading error:",
                error
            );

        }

    );

}


/* =========================================================
   LOADING TEXT
========================================================= */

function updateLoadingMessage(
    message
) {

    if (
        loadingText
    ) {

        loadingText.textContent =
            message;

    }

}


/* =========================================================
   GAME CONTROLS
========================================================= */

function setupGameControls() {

    window.addEventListener(
        "keydown",
        (event) => {

            keys[event.code] =
                true;


            if (
                event.code ===
                "Escape"
            ) {

                togglePause();

            }


            if (
                event.code ===
                "KeyE"
            ) {

                interact();

            }


            if (
                event.code ===
                "KeyR"
            ) {

                if (
                    gameState.gameRunning
                ) {

                    reloadWeapon();

                }

            }

        }
    );


    window.addEventListener(
        "keyup",
        (event) => {

            keys[event.code] =
                false;

        }
    );


    renderer.domElement.addEventListener(
        "mousemove",
        (event) => {

            mouse.x =
                (
                    event.clientX /
                    window.innerWidth
                ) * 2 - 1;


            mouse.y =
                -(
                    event.clientY /
                    window.innerHeight
                ) * 2 + 1;

        }
    );


    renderer.domElement.addEventListener(
        "mousedown",
        () => {

            mouse.down =
                true;

            shoot();

        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            mouse.down =
                false;

        }
    );


    renderer.domElement.addEventListener(
        "click",
        () => {

            if (
                gameState.gameRunning &&
                !gameState.paused
            ) {

                shoot();

            }

        }
    );


    /* Mobile buttons */

    const mobileInteract =
        $("mobileInteractBtn");

    const mobileShoot =
        $("mobileShootBtn");


    if (
        mobileInteract
    ) {

        mobileInteract.addEventListener(
            "click",
            interact
        );

    }


    if (
        mobileShoot
    ) {

        mobileShoot.addEventListener(
            "click",
            shoot
        );

    }

}


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

function updatePlayer(
    delta
) {

    if (
        !player ||
        gameState.paused
    ) {

        return;

    }


    const speed =
        6 * delta;


    const direction =
        new THREE.Vector3();


    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {

        direction.z -= 1;

    }


    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {

        direction.z += 1;

    }


    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {

        direction.x -= 1;

    }


    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {

        direction.x += 1;

    }


    if (
        direction.lengthSq() >
        0
    ) {

        direction.normalize();


        player.position.x +=
            direction.x *
            speed;


        player.position.z +=
            direction.z *
            speed;


        player.rotation.y =
            Math.atan2(
                direction.x,
                direction.z
            );

    }


    /* Boundary */

    player.position.x =
        THREE.MathUtils.clamp(
            player.position.x,
            -16,
            16
        );


    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -28,
            12
        );


    /* Camera */

    const desiredCamera =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 5.2,
            player.position.z + 10
        );


    camera.position.lerp(
        desiredCamera,
        0.08
    );


    cameraTarget.lerp(
        new THREE.Vector3(
            player.position.x,
            1.5,
            player.position.z
        ),
        0.12
    );


    camera.lookAt(
        cameraTarget
    );

}


/* =========================================================
   INTERACTION
========================================================= */

function interact() {

    if (
        !player ||
        gameState.paused
    ) {

        return;

    }


    let nearest =
        null;


    let nearestDistance =
        Infinity;


    interactables.forEach(
        (object) => {

            const distance =
                player.position.distanceTo(
                    object.position
                );


            if (
                distance <
                    nearestDistance &&
                distance < 5
            ) {

                nearest =
                    object;

                nearestDistance =
                    distance;

            }

        }
    );


    if (!nearest) {

        return;

    }


    const type =
        nearest.userData.type;


    if (
        type ===
        "evidence"
    ) {

        investigateEvidence(
            nearest
        );

        return;

    }


    if (
        type ===
        "terminal"
    ) {

        investigateTerminal(
            nearest
        );

        return;

    }


    if (
        type ===
        "door"
    ) {

        interactDoor(
            nearest
        );

    }

}


/* =========================================================
   EVIDENCE
========================================================= */

function investigateEvidence(
    object
) {

    if (
        gameState.evidenceFound
    ) {

        openInteraction(
            "EVIDENCE SECURED",
            "UNKNOWN USB DEVICE",
            "This device contains traces of an unauthorized data transfer. The evidence has been added to your investigation."
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


    updateGameHUD();


    openInteraction(

        "PHYSICAL EVIDENCE",

        "UNKNOWN USB DEVICE",

        "You discovered a suspicious USB device near the restricted area. It may contain information about the attack.",

        "ANALYZE EVIDENCE"

    );

}


/* =========================================================
   TERMINAL
========================================================= */

function investigateTerminal(
    object
) {

    if (
        gameState.terminalInvestigated
    ) {

        openPuzzle();

        return;

    }


    gameState.terminalInvestigated =
        true;


    gameState.missionProgress =
        Math.max(
            gameState.missionProgress,
            45
        );


    updateGameHUD();


    openInteraction(

        "DIGITAL EVIDENCE",

        "COMPROMISED TERMINAL",

        "The terminal shows signs of unauthorized access. A security lock is preventing access to the restricted area.",

        "DECRYPT SECURITY CODE"

    );

}


/* =========================================================
   DOOR
========================================================= */

function interactDoor(
    object
) {

    if (
        gameState.doorUnlocked
    ) {

        openInteraction(

            "ACCESS GRANTED",

            "RESTRICTED AREA",

            "The security door is unlocked. Proceed toward the final operation."

        );

        return;

    }


    if (
        !gameState.puzzleSolved
    ) {

        openInteraction(

            "ACCESS DENIED",

            "RESTRICTED AREA",

            "This door requires a valid security code. Investigate the compromised terminal first."

        );

        return;

    }


    unlockDoor(
        object
    );

}


/* =========================================================
   UNLOCK DOOR
========================================================= */

function unlockDoor(
    object
) {

    gameState.doorUnlocked =
        true;


    gameState.missionProgress =
        Math.max(
            gameState.missionProgress,
            75
        );


    updateGameHUD();


    object.position.z +=
        3;


    openInteraction(

        "ACCESS GRANTED",

        "RESTRICTED AREA UNLOCKED",

        "Security lock bypassed. The final hostile operative is inside the restricted zone."

    );

}


/* =========================================================
   PUZZLE
========================================================= */

function openPuzzle() {

    closeInteraction();

    puzzleModal.classList.remove(
        "hidden"
    );


    const clue =
        $("puzzleClue");


    if (clue) {

        clue.textContent =
            "USB CLUE: 2 + 0 + 2 + 6";

    }


    puzzleInput.value =
        "";


    puzzleInput.focus();

}


/* Correct code */

const CORRECT_CODE =
    "10";


if (puzzleSubmitBtn) {

    puzzleSubmitBtn.addEventListener(
        "click",
        solvePuzzle
    );

}


if (puzzleInput) {

    puzzleInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Enter"
            ) {

                solvePuzzle();

            }

        }
    );

}


function solvePuzzle() {

    const answer =
        puzzleInput.value
            .trim()
            .toLowerCase();


    const feedback =
        $("puzzleFeedback");


    if (
        answer ===
        CORRECT_CODE
    ) {

        gameState.puzzleSolved =
            true;


        gameState.missionProgress =
            Math.max(
                gameState.missionProgress,
                60
            );


        updateGameHUD();


        if (feedback) {

            feedback.textContent =
                "ACCESS CODE ACCEPTED.";

        }


        setTimeout(
            () => {

                puzzleModal.classList.add(
                    "hidden"
                );

                showNotification(
                    "SECURITY SYSTEM BYPASSED"
                );

            },
            600
        );


        return;

    }


    if (feedback) {

        feedback.textContent =
            "INVALID CODE — ANALYZE THE CLUE AGAIN.";

    }


    damagePlayer(
        5
    );

}


/* =========================================================
   INTERACTION MODAL
========================================================= */

function openInteraction(
    category,
    title,
    description,
    actionText = "CONTINUE"
) {

    $("modalCategory").textContent =
        category;

    $("modalTitle").textContent =
        title;

    $("modalDescription").textContent =
        description;


    const modalAction =
        $("modalActionBtn");


    modalAction.textContent =
        actionText;


    modalAction.onclick =
        () => {

            closeInteraction();


            if (
                category ===
                "DIGITAL EVIDENCE"
            ) {

                openPuzzle();

            }

        };


    interactionModal.classList.remove(
        "hidden"
    );

}


function closeInteraction() {

    interactionModal.classList.add(
        "hidden"
    );

}


if (closeInteractionBtn) {

    closeInteractionBtn.addEventListener(
        "click",
        closeInteraction
    );

}


/* =========================================================
   SHOOTING
========================================================= */

function shoot() {

    if (
        !gameState.gameRunning ||
        gameState.paused ||
        !player
    ) {

        return;

    }


    /* Prevent constant firing */

    const now =
        performance.now();


    if (
        shoot.lastShot &&
        now -
            shoot.lastShot <
            300
    ) {

        return;

    }


    shoot.lastShot =
        now;


    const bulletGeometry =
        new THREE.SphereGeometry(
            0.08,
            8,
            8
        );


    const bulletMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xe5092f
        });


    const bullet =
        new THREE.Mesh(
            bulletGeometry,
            bulletMaterial
        );


    bullet.position.copy(
        player.position
    );


    bullet.position.y +=
        1.4;


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    bullet.userData =
        {

            velocity:
                direction
                    .clone()
                    .multiplyScalar(32),

            life:
                2

        };


    scene.add(
        bullet
    );


    bullets.push(
        bullet
    );

}


/* =========================================================
   UPDATE BULLETS
========================================================= */

function updateBullets(
    delta
) {

    bullets =
        bullets.filter(
            (bullet) => {

                bullet.position.add(
                    bullet.userData.velocity
                        .clone()
                        .multiplyScalar(
                            delta
                        )
                );


                bullet.userData.life -=
                    delta;


                if (
                    enemy &&
                    enemy.userData.active
                ) {

                    const distance =
                        bullet.position.distanceTo(
                            enemy.position
                        );


                    if (
                        distance < 2.5
                    ) {

                        damageEnemy(
                            25
                        );


                        scene.remove(
                            bullet
                        );


                        return false;

                    }

                }


                if (
                    bullet.userData.life <=
                    0
                ) {

                    scene.remove(
                        bullet
                    );

                    return false;

                }


                return true;

            }
        );

}


/* =========================================================
   ENEMY DAMAGE
========================================================= */

function damageEnemy(
    amount
) {

    if (
        !enemy ||
        !enemy.userData.active
    ) {

        return;

    }


    enemy.userData.health -=
        amount;


    showNotification(
        `TARGET HIT — ${Math.max(
            0,
            enemy.userData.health
        )}%`
    );


    if (
        enemy.userData.health <=
        0
    ) {

        defeatEnemy();

    }

}


/* =========================================================
   ENEMY
========================================================= */

function updateEnemy(
    delta
) {

    if (
        !enemy ||
        !player ||
        !enemy.userData.active ||
        gameState.paused
    ) {

        return;

    }


    const distance =
        enemy.position.distanceTo(
            player.position
        );


    if (
        distance < 15
    ) {

        const direction =
            new THREE.Vector3()
                .subVectors(
                    player.position,
                    enemy.position
                )
                .normalize();


        enemy.position.x +=
            direction.x *
            delta *
            1.5;


        enemy.position.z +=
            direction.z *
            delta *
            1.5;


        enemy.lookAt(
            player.position
        );


        if (
            distance < 2.4
        ) {

            enemyAttack();

        }

    }

}


/* =========================================================
   ENEMY ATTACK
========================================================= */

function enemyAttack() {

    const now =
        performance.now();


    if (
        enemyAttack.lastAttack &&
        now -
            enemyAttack.lastAttack <
            1500
    ) {

        return;

    }


    enemyAttack.lastAttack =
        now;


    damagePlayer(
        8
    );

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    gameState.health =
        Math.max(
            0,
            gameState.health -
                amount
        );


    updateGameHUD();


    document.body.classList.add(
        "red-alert"
    );


    setTimeout(
        () => {

            document.body.classList.remove(
                "red-alert"
            );

        },
        350
    );


    if (
        gameState.health <=
        0
    ) {

        gameOver();

    }

}


/* =========================================================
   ENEMY DEFEATED
========================================================= */

function defeatEnemy() {

    if (
        !enemy
    ) {

        return;

    }


    enemy.userData.active =
        false;


    enemy.visible =
        false;


    gameState.enemyDefeated =
        true;


    gameState.missionProgress =
        100;


    updateGameHUD();


    setTimeout(
        completeMission,
        800
    );

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


    gameState.missionsCompleted +=
        1;


    gameState.badges +=
        1;


    addXP(
        250
    );


    $("completedXP").textContent =
        "+250";


    missionComplete.classList.remove(
        "hidden"
    );


    unlockLevel2();

    updateDashboard();

}


/* =========================================================
   UNLOCK LEVEL 2
========================================================= */

function unlockLevel2() {

    const levelTwo =
        qs(
            '.level-card[data-level="2"]'
        );


    if (!levelTwo) return;


    levelTwo.classList.remove(
        "locked"
    );


    levelTwo.classList.add(
        "available"
    );


    const status =
        levelTwo.querySelector(
            ".level-status"
        );


    if (status) {

        status.textContent =
            "AVAILABLE";

    }


    const button =
        levelTwo.querySelector(
            ".level-start-btn"
        );


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "ENTER BUILDING →";


        button.onclick =
            () => {

                showNotification(
                    "LEVEL 02 READY — CYBER BANK"
                );

            };

    }

}


/* =========================================================
   XP
========================================================= */

function addXP(
    amount
) {

    gameState.xp +=
        amount;


    gameState.level =
        Math.max(
            1,
            Math.floor(
                gameState.xp /
                    500
            ) + 1
        );


    updateDashboard();

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    if (
        $("dashboardXP")
    ) {

        $("dashboardXP").textContent =
            `${gameState.xp} XP`;

    }


    if (
        $("dashboardLevel")
    ) {

        $("dashboardLevel").textContent =
            String(
                gameState.level
            ).padStart(
                2,
                "0"
            );

    }


    if (
        $("dashboardMissions")
    ) {

        $("dashboardMissions").textContent =
            `${gameState.missionsCompleted} / 5`;

    }


    if (
        $("dashboardBadges")
    ) {

        $("dashboardBadges").textContent =
            gameState.badges;

    }


    if (
        $("profileXP")
    ) {

        $("profileXP").textContent =
            `${gameState.xp} XP`;

    }


    if (
        $("profileMissions")
    ) {

        $("profileMissions").textContent =
            gameState.missionsCompleted;

    }


    if (
        $("profileBadgeCount")
    ) {

        $("profileBadgeCount").textContent =
            gameState.badges;

    }


    if (
        $("profileLevel")
    ) {

        $("profileLevel").textContent =
            String(
                gameState.level
            ).padStart(
                2,
                "0"
            );

    }


    if (
        $("profileXPBar")
    ) {

        const percentage =
            Math.min(
                100,
                (
                    gameState.xp %
                    500
                ) /
                500 *
                100
            );


        $("profileXPBar").style.width =
            `${percentage}%`;

    }

}


/* =========================================================
   GAME HUD
========================================================= */

function updateGameHUD() {

    if (
        $("healthFill")
    ) {

        $("healthFill").style.width =
            `${gameState.health}%`;

    }


    if (
        $("healthValue")
    ) {

        $("healthValue").textContent =
            gameState.health;

    }


    if (
        $("gameXP")
    ) {

        $("gameXP").textContent =
            gameState.xp;

    }


    if (
        $("missionProgressFill")
    ) {

        $("missionProgressFill")
            .style.width =
            `${gameState.missionProgress}%`;

    }


    if (
        $("missionProgressText")
    ) {

        $("missionProgressText")
            .textContent =
            `${gameState.missionProgress}%`;

    }


    const objective =
        $("gameObjective");


    if (!objective) return;


    if (
        !gameState.evidenceFound
    ) {

        objective.textContent =
            "Find the compromised evidence.";

    }
    else if (
        !gameState.terminalInvestigated
    ) {

        objective.textContent =
            "Investigate the compromised terminal.";

    }
    else if (
        !gameState.puzzleSolved
    ) {

        objective.textContent =
            "Decrypt the security code.";

    }
    else if (
        !gameState.doorUnlocked
    ) {

        objective.textContent =
            "Unlock the restricted door.";

    }
    else if (
        !gameState.enemyDefeated
    ) {

        objective.textContent =
            "Neutralize the hostile operative.";

    }
    else {

        objective.textContent =
            "Escape the Data Vault.";

    }

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(
    message
) {

    let notification =
        $("cyberNotification");


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );


        notification.id =
            "cyberNotification";


        notification.style.position =
            "fixed";

        notification.style.left =
            "50%";

        notification.style.top =
            "80px";

        notification.style.transform =
            "translateX(-50%)";

        notification.style.zIndex =
            "20000";

        notification.style.padding =
            "12px 20px";

        notification.style.background =
            "rgba(5,5,5,0.92)";

        notification.style.border =
            "1px solid #e5092f";

        notification.style.color =
            "#fff";

        notification.style.fontSize =
            "11px";

        notification.style.letterSpacing =
            "1.5px";

        notification.style.boxShadow =
            "0 0 25px rgba(229,9,47,0.25)";


        document.body.appendChild(
            notification
        );

    }


    notification.textContent =
        message;


    notification.style.opacity =
        "1";


    clearTimeout(
        showNotification.timer
    );


    showNotification.timer =
        setTimeout(
            () => {

                notification.style.opacity =
                    "0";

            },
            2200
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
        gameState.paused
    ) {

        pauseMenu.classList.remove(
            "hidden"
        );

    }
    else {

        pauseMenu.classList.add(
            "hidden"
        );

    }

}


if (pauseGameBtn) {

    pauseGameBtn.addEventListener(
        "click",
        togglePause
    );

}


if (resumeGameBtn) {

    resumeGameBtn.addEventListener(
        "click",
        togglePause
    );

}


if (pauseExitBtn) {

    pauseExitBtn.addEventListener(
        "click",
        exitMission
    );

}


/* =========================================================
   EXIT GAME
========================================================= */

if (exitGameBtn) {

    exitGameBtn.addEventListener(
        "click",
        exitMission
    );

}


function exitMission() {

    gameState.gameRunning =
        false;


    gameState.paused =
        false;


    pauseMenu.classList.add(
        "hidden"
    );


    missionComplete.classList.add(
        "hidden"
    );


    gameScreen.classList.add(
        "hidden"
    );


    app.classList.remove(
        "hidden"
    );


    showPage(
        "dashboardPage"
    );


    if (
        renderer &&
        renderer.domElement
    ) {

        renderer.domElement.style.display =
            "block";

    }

}


/* =========================================================
   MISSION COMPLETE RETURN
========================================================= */

if (returnDashboardBtn) {

    returnDashboardBtn.addEventListener(
        "click",
        () => {

            missionComplete.classList.add(
                "hidden"
            );

            exitMission();

        }
    );

}


/* =========================================================
   CANCEL PUZZLE
========================================================= */

if (puzzleCancelBtn) {

    puzzleCancelBtn.addEventListener(
        "click",
        () => {

            puzzleModal.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================================
   RELOAD
========================================================= */

function reloadWeapon() {

    showNotification(
        "WEAPON SYSTEM READY"
    );

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    gameState.gameRunning =
        false;


    openInteraction(

        "MISSION FAILED",

        "OPERATIVE DOWN",

        "Your health reached zero. The operation has failed. Restart the mission to try again.",

        "RESTART"

    );


    $("modalActionBtn").onclick =
        () => {

            closeInteraction();

            resetMissionState();

            restartGameScene();

        };

}


/* =========================================================
   RESTART GAME
========================================================= */

function restartGameScene() {

    if (
        player
    ) {

        player.position.set(
            0,
            0,
            8
        );

    }


    if (
        enemy
    ) {

        enemy.visible =
            true;

        enemy.userData.active =
            true;

        enemy.userData.health =
            100;

        enemy.position.set(
            5,
            0,
            -10
        );

    }


    gameState.gameRunning =
        true;


    gameState.paused =
        false;


    missionComplete.classList.add(
        "hidden"
    );


    pauseMenu.classList.add(
        "hidden"
    );


    updateGameHUD();

}


/* =========================================================
   ANIMATION LOOP
========================================================= */

function animateGame() {

    animationFrame =
        requestAnimationFrame(
            animateGame
        );


    if (
        !clock
    ) {

        return;

    }


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    if (
        gameState.gameRunning &&
        !gameState.paused
    ) {

        updatePlayer(
            delta
        );


        updateBullets(
            delta
        );


        updateEnemy(
            delta
        );

    }


    /* Animate neon environment */

    if (
        environmentGroup
    ) {

        environmentGroup.children
            .forEach(
                (object) => {

                    if (
                        object.userData &&
                        object.userData.neon
                    ) {

                        object.material
                            .opacity =
                            0.5 +
                            Math.sin(
                                performance.now() *
                                0.004
                            ) *
                            0.5;

                    }

                }
            );

    }


    if (
        composer
    ) {

        composer.render();

    }
    else if (
        renderer &&
        scene &&
        camera
    ) {

        renderer.render(
            scene,
            camera
        );

    }

}


/* =========================================================
   RESIZE
========================================================= */

function onWindowResize() {

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


    if (
        composer
    ) {

        composer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

}


/* =========================================================
   SYSTEM CLOCK
========================================================= */

function updateSystemClock() {

    const timeElement =
        $("systemTime");


    if (!timeElement) return;


    const now =
        new Date();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    timeElement.textContent =
        `${hours}:${minutes}:${seconds}`;

}


setInterval(
    updateSystemClock,
    1000
);


updateSystemClock();


/* =========================================================
   MOBILE FIRE
========================================================= */

const mobileShootBtn =
    $("mobileShootBtn");


if (
    mobileShootBtn
) {

    mobileShootBtn.addEventListener(
        "touchstart",
        (event) => {

            event.preventDefault();

            shoot();

        },
        {
            passive: false
        }
    );

}


/* =========================================================
   INITIAL START
========================================================= */

startIntro();

updateDashboard();

updateGameHUD();


console.log(
    "%cCYBERHUNT ONLINE",
    "color:#e5092f;font-size:22px;font-weight:bold"
);

console.log(
    "%cVEXA: girl-agent.glb",
    "color:#aaa"
);

console.log(
    "%cKAI: boy-agent.glb",
    "color:#aaa"
);

console.log(
    "%cENEMY: enemy.glb",
    "color:#aaa"
);
```
