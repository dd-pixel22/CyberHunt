/* =========================================================
   CYBERHUNT
   Core Game Engine — Part 1
   Three.js r186
   ========================================================= */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";

/* =========================================================
   GAME STATE
   ========================================================= */

const GAME = {

    started: false,
    paused: false,
    gameOver: false,

    level: 1,
    xp: 0,
    coins: 500,

    selectedOperative: "RAVEN",
    selectedWeapon: "CRIMSON-9",

    currentMission: 0,

    health: 100,
    maxHealth: 100,

    evidenceCollected: 0,
    threatsNeutralized: 0,

    objectiveIndex: 0,

    missionComplete: false,

    keys: {
        w: false,
        a: false,
        s: false,
        d: false,
        shift: false,
        space: false
    },

    mouse: {
        x: 0,
        y: 0,
        down: false
    }
};


/* =========================================================
   THREE.JS CORE
   ========================================================= */

let scene;
let camera;
let renderer;

let clock;

let player;
let playerBody;
let playerHead;
let playerWeapon;

let enemies = [];
let evidenceObjects = [];
let interactiveObjects = [];
let bullets = [];
let particles = [];

let environmentGroup;
let playerGroup;
let enemyGroup;
let evidenceGroup;

let raycaster;
let mouseVector;

let currentInteractable = null;

let animationFrame;


/* =========================================================
   MATERIALS
   ========================================================= */

const MATERIALS = {

    black: new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 0.75,
        metalness: 0.25
    }),

    darkMetal: new THREE.MeshStandardMaterial({
        color: 0x111318,
        roughness: 0.38,
        metalness: 0.78
    }),

    metal: new THREE.MeshStandardMaterial({
        color: 0x252a30,
        roughness: 0.3,
        metalness: 0.9
    }),

    crimson: new THREE.MeshStandardMaterial({
        color: 0x8f0018,
        emissive: 0x330006,
        emissiveIntensity: 1.4,
        roughness: 0.35,
        metalness: 0.55
    }),

    crimsonBright: new THREE.MeshStandardMaterial({
        color: 0xff1738,
        emissive: 0x8f0018,
        emissiveIntensity: 2.8,
        roughness: 0.2,
        metalness: 0.5
    }),

    glass: new THREE.MeshPhysicalMaterial({
        color: 0x12161c,
        roughness: 0.12,
        metalness: 0.4,
        transmission: 0.2,
        transparent: true,
        opacity: 0.72
    }),

    white: new THREE.MeshStandardMaterial({
        color: 0xe9edf2,
        roughness: 0.32,
        metalness: 0.4
    }),

    enemy: new THREE.MeshStandardMaterial({
        color: 0x241016,
        emissive: 0x35000b,
        emissiveIntensity: 1.2,
        roughness: 0.55,
        metalness: 0.45
    }),

    floor: new THREE.MeshStandardMaterial({
        color: 0x08090b,
        roughness: 0.86,
        metalness: 0.2
    }),

    hologram: new THREE.MeshBasicMaterial({
        color: 0xff1738,
        transparent: true,
        opacity: 0.65
    })
};


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initCyberHunt() {

    console.log("CYBERHUNT INITIALIZING...");

    clock = new THREE.Clock();

    raycaster = new THREE.Raycaster();
    mouseVector = new THREE.Vector2();

    createScene();
    createCamera();
    createRenderer();

    createLighting();

    createWorldGroups();

    createEnvironment();

    createPlayer();

    setupControls();
    setupUI();

    window.addEventListener("resize", handleResize);

    updateHUD();

    console.log("CYBERHUNT READY");

    startRenderLoop();
}


/* =========================================================
   SCENE
   ========================================================= */

function createScene() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020203);

    scene.fog = new THREE.FogExp2(
        0x030305,
        0.035
    );
}


/* =========================================================
   CAMERA
   ========================================================= */

function createCamera() {

    camera = new THREE.PerspectiveCamera(
        58,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(
        0,
        11,
        15
    );

    camera.lookAt(
        0,
        1.5,
        0
    );
}


/* =========================================================
   RENDERER
   ========================================================= */

function createRenderer() {

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
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

    renderer.toneMappingExposure = 1.15;

    const canvas = document.getElementById("gameCanvas");

    if (canvas) {

        canvas.replaceWith(renderer.domElement);

        renderer.domElement.id = "gameCanvas";

    } else {

        document.body.appendChild(
            renderer.domElement
        );

        renderer.domElement.id = "gameCanvas";
    }
}


/* =========================================================
   LIGHTING
   ========================================================= */

function createLighting() {

    const ambient = new THREE.HemisphereLight(
        0x20242d,
        0x020203,
        1.15
    );

    scene.add(ambient);


    const mainLight = new THREE.DirectionalLight(
        0xffdce1,
        2.0
    );

    mainLight.position.set(
        5,
        15,
        8
    );

    mainLight.castShadow = true;

    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;

    mainLight.shadow.camera.left = -30;
    mainLight.shadow.camera.right = 30;
    mainLight.shadow.camera.top = 30;
    mainLight.shadow.camera.bottom = -30;

    scene.add(mainLight);


    const redLight = new THREE.PointLight(
        0xff0028,
        20,
        35,
        2
    );

    redLight.position.set(
        0,
        5,
        -8
    );

    scene.add(redLight);


    const redLight2 = new THREE.PointLight(
        0xff0028,
        12,
        25,
        2
    );

    redLight2.position.set(
        -15,
        4,
        5
    );

    scene.add(redLight2);
}


/* =========================================================
   WORLD GROUPS
   ========================================================= */

function createWorldGroups() {

    environmentGroup =
        new THREE.Group();

    playerGroup =
        new THREE.Group();

    enemyGroup =
        new THREE.Group();

    evidenceGroup =
        new THREE.Group();

    scene.add(environmentGroup);
    scene.add(playerGroup);
    scene.add(enemyGroup);
    scene.add(evidenceGroup);
}


/* =========================================================
   ENVIRONMENT
   ========================================================= */

function createEnvironment() {

    createFloor();

    createGrid();

    createWalls();

    createServerRows();

    createComputerStations();

    createSecurityLights();

    createDoors();

    createCentralTerminal();

    createDecorations();
}


/* =========================================================
   FLOOR
   ========================================================= */

function createFloor() {

    const floorGeometry =
        new THREE.PlaneGeometry(
            80,
            80
        );

    const floor =
        new THREE.Mesh(
            floorGeometry,
            MATERIALS.floor
        );

    floor.rotation.x =
        -Math.PI / 2;

    floor.receiveShadow = true;

    environmentGroup.add(floor);
}


/* =========================================================
   FLOOR GRID
   ========================================================= */

function createGrid() {

    const grid =
        new THREE.GridHelper(
            80,
            40,
            0x45000b,
            0x160005
        );

    grid.position.y = 0.015;

    environmentGroup.add(grid);
}


/* =========================================================
   WALLS
   ========================================================= */

function createWalls() {

    const wallMaterial =
        MATERIALS.darkMetal;


    const positions = [

        [0, 5, -28, 56, 10, 1],

        [0, 5, 28, 56, 10, 1],

        [-28, 5, 0, 1, 10, 56],

        [28, 5, 0, 1, 10, 56]
    ];


    positions.forEach(data => {

        const geometry =
            new THREE.BoxGeometry(
                data[3],
                data[4],
                data[5]
            );

        const wall =
            new THREE.Mesh(
                geometry,
                wallMaterial
            );

        wall.position.set(
            data[0],
            data[1],
            data[2]
        );

        wall.castShadow = true;
        wall.receiveShadow = true;

        environmentGroup.add(wall);
    });
}


/* =========================================================
   SERVER ROWS
   ========================================================= */

function createServerRows() {

    for (
        let row = -1;
        row <= 1;
        row++
    ) {

        for (
            let i = -4;
            i <= 4;
            i++
        ) {

            const x =
                i * 5.2;

            const z =
                row * 12;

            createServerRack(
                x,
                z
            );
        }
    }
}


/* =========================================================
   SERVER RACK
   ========================================================= */

function createServerRack(x, z) {

    const rack =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.4,
                5.8,
                1.8
            ),
            MATERIALS.darkMetal
        );

    body.position.y = 2.9;

    body.castShadow = true;

    rack.add(body);


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const panel =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.8,
                    0.42,
                    0.08
                ),
                MATERIALS.black
            );

        panel.position.set(
            0,
            0.65 + i * 0.62,
            -0.94
        );

        rack.add(panel);


        const indicator =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.12,
                    0.12,
                    0.04
                ),
                i % 3 === 0
                    ? MATERIALS.crimsonBright
                    : MATERIALS.hologram
            );

        indicator.position.set(
            -1.05,
            0.65 + i * 0.62,
            -1.0
        );

        rack.add(indicator);
    }


    rack.position.set(
        x,
        0,
        z
    );


    environmentGroup.add(rack);
}


/* =========================================================
   COMPUTER STATIONS
   ========================================================= */

function createComputerStations() {

    const positions = [

        [-20, -20],
        [20, -20],
        [-20, 20],
        [20, 20],
        [-10, -20],
        [10, 20]
    ];


    positions.forEach(
        ([x, z]) => {

            createComputer(
                x,
                z
            );

        }
    );
}


/* =========================================================
   COMPUTER
   ========================================================= */

function createComputer(x, z) {

    const computer =
        new THREE.Group();


    const desk =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                4,
                0.35,
                2
            ),
            MATERIALS.darkMetal
        );

    desk.position.y = 1.1;

    desk.castShadow = true;

    computer.add(desk);


    const monitor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.5,
                1.55,
                0.18
            ),
            MATERIALS.black
        );

    monitor.position.set(
        0,
        2.15,
        -0.55
    );

    computer.add(monitor);


    const screen =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                2.1,
                1.15
            ),
            MATERIALS.hologram
        );

    screen.position.set(
        0,
        2.15,
        -0.66
    );

    computer.add(screen);


    const keyboard =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                0.08,
                0.65
            ),
            MATERIALS.metal
        );

    keyboard.position.set(
        0,
        1.34,
        0.05
    );

    computer.add(keyboard);


    computer.position.set(
        x,
        0,
        z
    );


    computer.userData.interactive = true;
    computer.userData.type = "terminal";

    interactiveObjects.push(
        computer
    );

    environmentGroup.add(
        computer
    );
}


/* =========================================================
   SECURITY LIGHTS
   ========================================================= */

function createSecurityLights() {

    for (
        let i = -24;
        i <= 24;
        i += 8
    ) {

        createSecurityLight(
            i,
            -27
        );

        createSecurityLight(
            i,
            27
        );
    }
}


function createSecurityLight(x, z) {

    const fixture =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.5,
                0.25,
                0.5
            ),
            MATERIALS.black
        );

    fixture.position.set(
        x,
        8,
        z
    );

    environmentGroup.add(
        fixture
    );


    const light =
        new THREE.PointLight(
            0xff0028,
            5,
            10,
            2
        );

    light.position.set(
        x,
        7.5,
        z
    );

    environmentGroup.add(
        light
    );
}


/* =========================================================
   DOORS
   ========================================================= */

function createDoors() {

    createSecurityDoor(
        0,
        -27.3
    );

    createSecurityDoor(
        0,
        27.3
    );
}


function createSecurityDoor(x, z) {

    const door =
        new THREE.Group();


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                8,
                7,
                0.7
            ),
            MATERIALS.darkMetal
        );

    frame.position.y = 3.5;

    door.add(frame);


    const center =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                5.8,
                6.3,
                0.15
            ),
            MATERIALS.black
        );

    center.position.y = 3.2;

    door.add(center);


    const redLine =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                5.6,
                0.08,
                0.08
            ),
            MATERIALS.crimsonBright
        );

    redLine.position.set(
        0,
        6.2,
        -0.12
    );

    door.add(redLine);


    door.position.set(
        x,
        0,
        z
    );


    environmentGroup.add(
        door
    );
}


/* =========================================================
   CENTRAL TERMINAL
   ========================================================= */

function createCentralTerminal() {

    const terminal =
        new THREE.Group();


    const base =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                2.2,
                2.6,
                1,
                32
            ),
            MATERIALS.darkMetal
        );

    base.position.y = 0.5;

    terminal.add(base);


    const console =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.8,
                3.5,
                1.6
            ),
            MATERIALS.black
        );

    console.position.y = 2.5;

    terminal.add(console);


    const screen =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                2,
                1.6
            ),
            MATERIALS.hologram
        );

    screen.position.set(
        0,
        2.8,
        -0.84
    );

    terminal.add(screen);


    const redRing =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                2.35,
                0.07,
                8,
                64
            ),
            MATERIALS.crimsonBright
        );

    redRing.rotation.x =
        Math.PI / 2;

    redRing.position.y =
        1.05;

    terminal.add(redRing);


    terminal.position.set(
        0,
        0,
        0
    );


    terminal.userData.interactive = true;
    terminal.userData.type = "security-terminal";

    interactiveObjects.push(
        terminal
    );

    environmentGroup.add(
        terminal
    );
}


/* =========================================================
   DECORATIONS
   ========================================================= */

function createDecorations() {

    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const box =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.5,
                    0.5,
                    0.5
                ),
                i % 2
                    ? MATERIALS.crimson
                    : MATERIALS.darkMetal
            );

        box.position.set(
            THREE.MathUtils.randFloat(
                -24,
                24
            ),
            THREE.MathUtils.randFloat(
                0.25,
                5
            ),
            THREE.MathUtils.randFloat(
                -24,
                24
            )
        );

        box.rotation.set(
            Math.random(),
            Math.random(),
            Math.random()
        );

        environmentGroup.add(
            box
        );
    }
}


/* =========================================================
   PLAYER
   ========================================================= */

function createPlayer() {

    player =
        new THREE.Group();

    playerGroup.add(
        player
    );


    playerBody =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.65,
                1.5,
                8,
                16
            ),
            MATERIALS.darkMetal
        );

    playerBody.position.y =
        1.4;

    playerBody.castShadow = true;

    player.add(
        playerBody
    );


    playerHead =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.48,
                24,
                16
            ),
            MATERIALS.white
        );

    playerHead.position.y =
        2.75;

    playerHead.scale.set(
        0.9,
        1.05,
        0.9
    );

    playerHead.castShadow = true;

    player.add(
        playerHead
    );


    createPlayerArmor();

    createPlayerWeapon();


    player.position.set(
        0,
        0,
        18
    );
}


/* =========================================================
   PLAYER ARMOR
   ========================================================= */

function createPlayerArmor() {

    const shoulderLeft =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.32,
                12,
                8
            ),
            MATERIALS.crimson
        );

    shoulderLeft.position.set(
        -0.78,
        2,
        0
    );

    player.add(
        shoulderLeft
    );


    const shoulderRight =
        shoulderLeft.clone();

    shoulderRight.position.x =
        0.78;

    player.add(
        shoulderRight
    );


    const chest =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.25,
                1.3,
                0.55
            ),
            MATERIALS.darkMetal
        );

    chest.position.set(
        0,
        1.65,
        -0.05
    );

    chest.castShadow = true;

    player.add(
        chest
    );


    const chestLight =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.55,
                0.08
            ),
            MATERIALS.crimsonBright
        );

    chestLight.position.set(
        0,
        1.7,
        -0.34
    );

    player.add(
        chestLight
    );
}


/* =========================================================
   PLAYER WEAPON
   ========================================================= */

function createPlayerWeapon() {

    playerWeapon =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.22,
                0.22,
                1.4
            ),
            MATERIALS.metal
        );

    body.position.z =
        -0.7;

    playerWeapon.add(
        body
    );


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.07,
                0.07,
                0.7,
                12
            ),
            MATERIALS.black
        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -1.65;

    playerWeapon.add(
        barrel
    );


    const energy =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.08,
                0.6
            ),
            MATERIALS.crimsonBright
        );

    energy.position.set(
        0,
        0,
        -1.55
    );

    playerWeapon.add(
        energy
    );


    playerWeapon.position.set(
        0.78,
        1.7,
        -0.25
    );


    player.add(
        playerWeapon
    );
}


/* =========================================================
   CONTROLS
   ========================================================= */

function setupControls() {

    window.addEventListener(
        "keydown",
        event => {

            const key =
                event.key.toLowerCase();

            if (key === "w")
                GAME.keys.w = true;

            if (key === "a")
                GAME.keys.a = true;

            if (key === "s")
                GAME.keys.s = true;

            if (key === "d")
                GAME.keys.d = true;

            if (key === "shift")
                GAME.keys.shift = true;

            if (key === " ")
                GAME.keys.space = true;

            if (
                key === "e"
            ) {

                interact();
            }

            if (
                key === "escape"
            ) {

                togglePause();
            }
        }
    );


    window.addEventListener(
        "keyup",
        event => {

            const key =
                event.key.toLowerCase();

            if (key === "w")
                GAME.keys.w = false;

            if (key === "a")
                GAME.keys.a = false;

            if (key === "s")
                GAME.keys.s = false;

            if (key === "d")
                GAME.keys.d = false;

            if (key === "shift")
                GAME.keys.shift = false;

            if (key === " ")
                GAME.keys.space = false;
        }
    );


    window.addEventListener(
        "mousemove",
        event => {

            GAME.mouse.x =
                (
                    event.clientX /
                    window.innerWidth
                ) * 2 - 1;

            GAME.mouse.y =
                -(
                    event.clientY /
                    window.innerHeight
                ) * 2 + 1;

            mouseVector.set(
                GAME.mouse.x,
                GAME.mouse.y
            );
        }
    );


    window.addEventListener(
        "mousedown",
        () => {

            GAME.mouse.down =
                true;

            if (GAME.started)
                shoot();
        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            GAME.mouse.down =
                false;
        }
    );
}


/* =========================================================
   PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        !GAME.started ||
        GAME.paused ||
        GAME.gameOver
    ) {

        return;
    }


    let forward = 0;
    let sideways = 0;


    if (GAME.keys.w)
        forward += 1;

    if (GAME.keys.s)
        forward -= 1;

    if (GAME.keys.d)
        sideways += 1;

    if (GAME.keys.a)
        sideways -= 1;


    const direction =
        new THREE.Vector3(
            sideways,
            0,
            -forward
        );


    if (
        direction.lengthSq() > 0
    ) {

        direction.normalize();

        const speed =
            GAME.keys.shift
                ? 10
                : 5;


        player.position.addScaledVector(
            direction,
            speed * delta
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
            -25,
            25
        );


    player.position.z =
        THREE.MathUtils.clamp(
            player.position.z,
            -25,
            25
        );
}


/* =========================================================
   CAMERA FOLLOW
   ========================================================= */

function updateCamera() {

    if (!player)
        return;


    const targetPosition =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 10,
            player.position.z + 12
        );


    camera.position.lerp(
        targetPosition,
        0.08
    );


    const lookTarget =
        new THREE.Vector3(
            player.position.x,
            player.position.y + 1.2,
            player.position.z
        );


    camera.lookAt(
        lookTarget
    );
}


/* =========================================================
   SHOOTING
   ========================================================= */

function shoot() {

    if (
        !GAME.started ||
        GAME.paused ||
        GAME.gameOver
    )
        return;


    createBullet();
}


/* =========================================================
   BULLET
   ========================================================= */

function createBullet() {

    const geometry =
        new THREE.SphereGeometry(
            0.08,
            8,
            8
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xff1738
        });


    const bullet =
        new THREE.Mesh(
            geometry,
            material
        );


    bullet.position.copy(
        player.position
    );

    bullet.position.y +=
        1.8;


    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direction.applyQuaternion(
        player.quaternion
    );


    bullet.userData.velocity =
        direction.multiplyScalar(
            35
        );


    bullet.userData.life = 2;


    bullets.push(
        bullet
    );


    scene.add(
        bullet
    );


    createMuzzleFlash();
}


/* =========================================================
   MUZZLE FLASH
   ========================================================= */

function createMuzzleFlash() {

    const flash =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.2,
                8,
                8
            ),
            MATERIALS.crimsonBright
        );


    flash.position.copy(
        player.position
    );

    flash.position.y +=
        1.8;


    flash.position.z -=
        1;


    scene.add(
        flash
    );


    setTimeout(
        () => {

            scene.remove(
                flash
            );

        },
        60
    );
}


/* =========================================================
   BULLET UPDATE
   ========================================================= */

function updateBullets(delta) {

    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        bullet.position.addScaledVector(
            bullet.userData.velocity,
            delta
        );


        bullet.userData.life -=
            delta;


        checkBulletEnemyCollision(
            bullet
        );


        if (
            bullet.userData.life <= 0
        ) {

            scene.remove(
                bullet
            );

            bullets.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   BULLET / ENEMY COLLISION
   ========================================================= */

function checkBulletEnemyCollision(
    bullet
) {

    enemies.forEach(
        enemy => {

            if (
                enemy.userData.dead
            )
                return;


            const distance =
                bullet.position.distanceTo(
                    enemy.position
                );


            if (
                distance < 1.5
            ) {

                damageEnemy(
                    enemy,
                    25
                );

                scene.remove(
                    bullet
                );

                bullet.userData.life = 0;
            }
        }
    );
}


/* =========================================================
   ENEMY DAMAGE
   ========================================================= */

function damageEnemy(
    enemy,
    amount
) {

    enemy.userData.health -=
        amount;


    createHitEffect(
        enemy.position
    );


    if (
        enemy.userData.health <= 0
    ) {

        killEnemy(
            enemy
        );
    }
}


/* =========================================================
   ENEMY DEATH
   ========================================================= */

function killEnemy(
    enemy
) {

    if (
        enemy.userData.dead
    )
        return;


    enemy.userData.dead =
        true;


    GAME.threatsNeutralized++;


    GAME.xp += 40;
    GAME.coins += 15;


    createExplosion(
        enemy.position
    );


    setTimeout(
        () => {

            enemyGroup.remove(
                enemy
            );

        },
        200
    );


    updateHUD();
}


/* =========================================================
   HIT EFFECT
   ========================================================= */

function createHitEffect(
    position
) {

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        const particle =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.05,
                    6,
                    6
                ),
                MATERIALS.crimsonBright
            );


        particle.position.copy(
            position
        );


        particle.userData.velocity =
            new THREE.Vector3(
                THREE.MathUtils.randFloat(
                    -2,
                    2
                ),
                THREE.MathUtils.randFloat(
                    0,
                    2
                ),
                THREE.MathUtils.randFloat(
                    -2,
                    2
                )
            );


        particle.userData.life =
            0.5;


        particles.push(
            particle
        );


        scene.add(
            particle
        );
    }
}


/* =========================================================
   EXPLOSION
   ========================================================= */

function createExplosion(
    position
) {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const particle =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    THREE.MathUtils.randFloat(
                        0.04,
                        0.12
                    ),
                    6,
                    6
                ),
                i % 2
                    ? MATERIALS.crimsonBright
                    : MATERIALS.white
            );


        particle.position.copy(
            position
        );


        particle.userData.velocity =
            new THREE.Vector3(
                THREE.MathUtils.randFloat(
                    -4,
                    4
                ),
                THREE.MathUtils.randFloat(
                    0,
                    5
                ),
                THREE.MathUtils.randFloat(
                    -4,
                    4
                )
            );


        particle.userData.life =
            THREE.MathUtils.randFloat(
                0.5,
                1.2
            );


        particles.push(
            particle
        );


        scene.add(
            particle
        );
    }
}


/* =========================================================
   PARTICLE UPDATE
   ========================================================= */

function updateParticles(delta) {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.position.addScaledVector(
            particle.userData.velocity,
            delta
        );


        particle.userData.velocity.y -=
            8 * delta;


        particle.userData.life -=
            delta;


        particle.scale.multiplyScalar(
            0.97
        );


        if (
            particle.userData.life <= 0
        ) {

            scene.remove(
                particle
            );

            particles.splice(
                i,
                1
            );
        }
    }
}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    setText(
        [
            "playerLevel",
            "levelDisplay",
            "hudLevel"
        ],
        `LEVEL ${GAME.level}`
    );


    setText(
        [
            "playerXP",
            "xpDisplay",
            "hudXP"
        ],
        `${GAME.xp} XP`
    );


    setText(
        [
            "playerCoins",
            "coinsDisplay",
            "hudCoins"
        ],
        `${GAME.coins}`
    );


    setText(
        [
            "healthValue",
            "playerHealth",
            "hudHealth"
        ],
        `${Math.max(
            0,
            Math.round(GAME.health)
        )}%`
    );


    setText(
        [
            "evidenceCount",
            "hudEvidence"
        ],
        `${GAME.evidenceCollected}`
    );


    setText(
        [
            "threatCount",
            "hudThreats"
        ],
        `${GAME.threatsNeutralized}`
    );
}


/* =========================================================
   SAFE TEXT HELPER
   ========================================================= */

function setText(
    ids,
    value
) {

    ids.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element)
                element.textContent =
                    value;
        }
    );
}


/* =========================================================
   INTERACTION
   ========================================================= */

function interact() {

    if (
        !GAME.started ||
        GAME.paused
    )
        return;


    if (
        currentInteractable
    ) {

        const type =
            currentInteractable.userData.type;


        if (
            type === "terminal"
        ) {

            openTerminal();

        } else if (
            type === "security-terminal"
        ) {

            openTerminal();

        } else {

            collectEvidence(
                currentInteractable
            );
        }

        return;
    }


    showToast(
        "NO INTERACTIVE OBJECT NEARBY"
    );
}


/* =========================================================
   INTERACTION DETECTION
   ========================================================= */

function updateInteraction() {

    if (
        !player
    )
        return;


    currentInteractable =
        null;


    let closest =
        null;

    let closestDistance =
        Infinity;


    interactiveObjects.forEach(
        object => {

            if (!object.parent)
                return;


            const distance =
                player.position.distanceTo(
                    object.position
                );


            if (
                distance < 3.5 &&
                distance < closestDistance
            ) {

                closest =
                    object;

                closestDistance =
                    distance;
            }
        }
    );


    currentInteractable =
        closest;


    updateInteractionPrompt(
        closest
    );
}


/* =========================================================
   INTERACTION PROMPT
   ========================================================= */

function updateInteractionPrompt(
    object
) {

    const prompt =
        document.getElementById(
            "interactionPrompt"
        );


    if (!prompt)
        return;


    if (
        object
    ) {

        prompt.textContent =
            "[ E ]  INTERACT";

        prompt.classList.add(
            "active"
        );

    } else {

        prompt.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   EVIDENCE
   ========================================================= */

function collectEvidence(
    object
) {

    if (
        object.userData.collected
    )
        return;


    object.userData.collected =
        true;


    GAME.evidenceCollected++;

    GAME.xp += 50;

    GAME.coins += 20;


    showToast(
        "EVIDENCE ACQUIRED"
    );


    updateHUD();


    checkMissionProgress();
}


/* =========================================================
   TERMINAL
   ========================================================= */

function openTerminal() {

    const modal =
        document.getElementById(
            "terminalModal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

    }


    showToast(
        "SECURITY TERMINAL ACCESSED"
    );
}


/* =========================================================
   PAUSE
   ========================================================= */

function togglePause() {

    if (
        !GAME.started
    )
        return;


    GAME.paused =
        !GAME.paused;


    const modal =
        document.getElementById(
            "pauseModal"
        );


    if (
        modal
    ) {

        modal.classList.toggle(
            "active",
            GAME.paused
        );
    }
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        console.log(
            `[CYBERHUNT] ${message}`
        );

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "active"
    );


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "active"
                );

            },
            2200
        );
}


/* =========================================================
   UI SETUP
   ========================================================= */

function setupUI() {

    setupButton(
        "startMissionBtn",
        () => {

            startMission(
                GAME.currentMission
            );

        }
    );


    setupButton(
        "startMission",
        () => {

            startMission(
                GAME.currentMission
            );

        }
    );


    setupButton(
        "pauseBtn",
        () => {

            togglePause();

        }
    );


    setupButton(
        "resumeBtn",
        () => {

            GAME.paused = false;

            const modal =
                document.getElementById(
                    "pauseModal"
                );

            if (modal)
                modal.classList.remove(
                    "active"
                );
        }
    );


    setupButton(
        "terminalClose",
        () => {

            closeModal(
                "terminalModal"
            );

        }
    );


    setupButton(
        "evidenceClose",
        () => {

            closeModal(
                "evidenceModal"
            );

        }
    );


    setupButton(
        "mapClose",
        () => {

            closeModal(
                "mapModal"
            );

        }
    );
}


/* =========================================================
   BUTTON HELPER
   ========================================================= */

function setupButton(
    id,
    callback
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.addEventListener(
            "click",
            callback
        );
    }
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "active"
        );
    }
}


/* =========================================================
   START MISSION
   ========================================================= */

function startMission(
    missionIndex = 0
) {

    GAME.started =
        true;

    GAME.paused =
        false;

    GAME.gameOver =
        false;

    GAME.currentMission =
        missionIndex;

    GAME.health =
        GAME.maxHealth;

    GAME.evidenceCollected =
        0;

    GAME.threatsNeutralized =
        0;

    GAME.objectiveIndex =
        0;


    clearEnemies();

    spawnMission(
        missionIndex
    );


    showGameScreen();


    updateHUD();


    showToast(
        `MISSION ${String(
            missionIndex + 1
        ).padStart(
            2,
            "0"
        )} INITIALIZED`
    );
}


/* =========================================================
   SHOW GAME SCREEN
   ========================================================= */

function showGameScreen() {

    const screens = [
        "mainMenu",
        "missionSelect",
        "operativeSelect",
        "armory",
        "introScreen"
    ];


    screens.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.classList.remove(
                    "active"
                );

                element.classList.add(
                    "hidden"
                );
            }
        }
    );


    const game =
        document.getElementById(
            "gameScreen"
        );


    if (
        game
    ) {

        game.classList.remove(
            "hidden"
        );

        game.classList.add(
            "active"
        );
    }


    renderer.domElement.style.display =
        "block";
}


/* =========================================================
   MISSION DATA
   ========================================================= */

const MISSIONS = [

    {
        name:
            "PHISHING BREACH",

        location:
            "CYBER SECURITY OFFICE",

        threat:
            "CREDENTIAL HARVESTING",

        objectives: [
            "Find suspicious email",
            "Inspect compromised terminal",
            "Collect digital evidence",
            "Identify phishing attempt",
            "Secure the system"
        ],

        enemies: 2,

        evidence: 3,

        rewardXP: 500,

        rewardCoins: 250,

        badge:
            "PHISHING HUNTER"
    },


    {
        name:
            "MALWARE INFILTRATION",

        location:
            "INFECTED SERVER FACILITY",

        threat:
            "MALICIOUS PROCESS",

        objectives: [
            "Locate infected workstation",
            "Find suspicious file",
            "Analyze system activity",
            "Isolate malware",
            "Secure affected system"
        ],

        enemies: 3,

        evidence: 4,

        rewardXP: 650,

        rewardCoins: 325,

        badge:
            "MALWARE HUNTER"
    },


    {
        name:
            "RANSOMWARE LOCKDOWN",

        location:
            "LOCKED DATA CENTER",

        threat:
            "RANSOMWARE",

        objectives: [
            "Locate encrypted systems",
            "Identify ransomware indicator",
            "Analyze affected files",
            "Stop the spread",
            "Restore secure operations"
        ],

        enemies: 4,

        evidence: 5,

        rewardXP: 800,

        rewardCoins: 400,

        badge:
            "RANSOMWARE DEFENDER"
    },


    {
        name:
            "CREDENTIAL THEFT",

        location:
            "AUTHENTICATION CENTER",

        threat:
            "ACCOUNT COMPROMISE",

        objectives: [
            "Review login records",
            "Find suspicious login",
            "Trace compromised account",
            "Secure authentication system",
            "Block unauthorized access"
        ],

        enemies: 5,

        evidence: 5,

        rewardXP: 950,

        rewardCoins: 475,

        badge:
            "IDENTITY GUARDIAN"
    },


    {
        name:
            "ZERO-DAY RESPONSE",

        location:
            "BLACKSITE CYBER FACILITY",

        threat:
            "UNKNOWN ADVANCED THREAT",

        objectives: [
            "Locate suspicious device",
            "Inspect compromised terminal",
            "Trace network anomaly",
            "Analyze malicious file",
            "Contain the zero-day"
        ],

        enemies: 7,

        evidence: 7,

        rewardXP: 1500,

        rewardCoins: 750,

        badge:
            "ZERO-DAY ELITE"
    }

];


/* =========================================================
   SPAWN MISSION
   ========================================================= */

function spawnMission(
    missionIndex
) {

    const mission =
        MISSIONS[
            missionIndex
        ] ||
        MISSIONS[0];


    spawnEnemies(
        mission.enemies
    );


    spawnEvidence(
        mission.evidence
    );


    updateMissionUI(
        mission
    );
}


/* =========================================================
   SPAWN ENEMIES
   ========================================================= */

function spawnEnemies(
    count
) {

    const positions = [

        [-15, -8],
        [15, -8],
        [-12, 5],
        [12, 5],
        [-18, 15],
        [18, 15],
        [0, -15]
    ];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const position =
            positions[
                i %
                positions.length
            ];


        const enemy =
            createEnemy();


        enemy.position.set(
            position[0],
            0,
            position[1]
        );


        enemies.push(
            enemy
        );


        enemyGroup.add(
            enemy
        );
    }
}


/* =========================================================
   CREATE ENEMY
   ========================================================= */

function createEnemy() {

    const enemy =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.65,
                1.5,
                8,
                16
            ),
            MATERIALS.enemy
        );

    body.position.y =
        1.4;

    body.castShadow = true;

    enemy.add(
        body
    );


    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.45,
                20,
                14
            ),
            MATERIALS.black
        );

    head.position.y =
        2.7;

    head.castShadow = true;

    enemy.add(
        head
    );


    const visor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.12,
                0.08
            ),
            MATERIALS.crimsonBright
        );

    visor.position.set(
        0,
        2.75,
        -0.4
    );

    enemy.add(
        visor
    );


    const weapon =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.18,
                1.3
            ),
            MATERIALS.metal
        );

    weapon.position.set(
        0.75,
        1.7,
        -0.35
    );

    enemy.add(
        weapon
    );


    enemy.userData.health =
        100;

    enemy.userData.maxHealth =
        100;

    enemy.userData.dead =
        false;

    enemy.userData.speed =
        THREE.MathUtils.randFloat(
            1.2,
            2.2
        );

    return enemy;
}


/* =========================================================
   ENEMY AI
   ========================================================= */

function updateEnemies(
    delta
) {

    if (
        !GAME.started ||
        GAME.paused ||
        GAME.gameOver
    )
        return;


    enemies.forEach(
        enemy => {

            if (
                enemy.userData.dead
            )
                return;


            const distance =
                enemy.position.distanceTo(
                    player.position
                );


            if (
                distance < 16
            ) {

                const direction =
                    new THREE.Vector3()
                        .subVectors(
                            player.position,
                            enemy.position
                        );


                direction.y = 0;

                direction.normalize();


                enemy.position.addScaledVector(
                    direction,
                    enemy.userData.speed *
                    delta
                );


                enemy.lookAt(
                    player.position.x,
                    enemy.position.y + 1,
                    player.position.z
                );


                if (
                    distance < 2.1
                ) {

                    damagePlayer(
                        8 * delta
                    );
                }
            }
        }
    );
}


/* =========================================================
   PLAYER DAMAGE
   ========================================================= */

function damagePlayer(
    amount
) {

    if (
        GAME.gameOver
    )
        return;


    GAME.health -=
        amount;


    if (
        GAME.health <= 0
    ) {

        GAME.health =
            0;

        defeatMission();
    }


    updateHUD();
}


/* =========================================================
   CLEAR ENEMIES
   ========================================================= */

function clearEnemies() {

    enemies.forEach(
        enemy => {

            enemyGroup.remove(
                enemy
            );
        }
    );


    enemies.length = 0;
}


/* =========================================================
   EVIDENCE SPAWNING
   ========================================================= */

function spawnEvidence(
    count
) {

    const positions = [

        [-7, -7],
        [7, -7],
        [-8, 8],
        [8, 8],
        [0, -8],
        [-15, 15],
        [15, -15]
    ];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const evidence =
            createEvidence(
                i
            );


        const position =
            positions[
                i %
                positions.length
            ];


        evidence.position.set(
            position[0],
            0.45,
            position[1]
        );


        evidenceObjects.push(
            evidence
        );


        evidenceGroup.add(
            evidence
        );
    }
}


/* =========================================================
   CREATE EVIDENCE
   ========================================================= */

function createEvidence(
    index
) {

    const evidence =
        new THREE.Group();


    const types = [
        "USB DEVICE",
        "ACCESS CARD",
        "SUSPICIOUS FILE",
        "LOGIN RECORD",
        "NETWORK LOG",
        "UNKNOWN DEVICE",
        "MALICIOUS ATTACHMENT"
    ];


    const type =
        types[
            index %
            types.length
        ];


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.8,
                0.25,
                1.25
            ),
            MATERIALS.black
        );


    body.castShadow = true;

    evidence.add(
        body
    );


    const light =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.12,
                0.08,
                0.3
            ),
            MATERIALS.crimsonBright
        );


    light.position.y =
        0.16;

    evidence.add(
        light
    );


    evidence.userData.type =
        "evidence";


    evidence.userData.evidenceType =
        type;


    evidence.userData.collected =
        false;


    interactiveObjects.push(
        evidence
    );


    return evidence;
}


/* =========================================================
   MISSION UI
   ========================================================= */

function updateMissionUI(
    mission
) {

    setText(
        [
            "missionName",
            "hudMissionName"
        ],
        mission.name
    );


    setText(
        [
            "missionLocation"
        ],
        mission.location
    );


    setText(
        [
            "missionThreat"
        ],
        mission.threat
    );


    const objectiveList =
        document.getElementById(
            "objectiveList"
        );


    if (
        objectiveList
    ) {

        objectiveList.innerHTML =
            "";


        mission.objectives.forEach(
            (objective, index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "objective-item";


                item.dataset.index =
                    index;


                item.textContent =
                    `□ ${objective}`;


                objectiveList.appendChild(
                    item
                );
            }
        );
    }
}


/* =========================================================
   MISSION PROGRESS
   ========================================================= */

function checkMissionProgress() {

    const mission =
        MISSIONS[
            GAME.currentMission
        ];


    if (!mission)
        return;


    const required =
        mission.evidence;


    if (
        GAME.evidenceCollected >=
        required
    ) {

        completeMission();
    }
}


/* =========================================================
   COMPLETE MISSION
   ========================================================= */

function completeMission() {

    if (
        GAME.missionComplete
    )
        return;


    GAME.missionComplete =
        true;


    const mission =
        MISSIONS[
            GAME.currentMission
        ];


    GAME.xp +=
        mission.rewardXP;


    GAME.coins +=
        mission.rewardCoins;


    GAME.level =
        Math.min(
            5,
            GAME.currentMission + 2
        );


    updateHUD();


    const modal =
        document.getElementById(
            "missionCompleteModal"
        );


    if (
        modal
    ) {

        modal.classList.add(
            "active"
        );
    }


    setText(
        [
            "completeXP",
            "missionXP"
        ],
        `+${mission.rewardXP} XP`
    );


    setText(
        [
            "completeCoins",
            "missionCoins"
        ],
        `+${mission.rewardCoins}`
    );


    setText(
        [
            "badgeName"
        ],
        mission.badge
    );


    showToast(
        "MISSION COMPLETE"
    );
}


/* =========================================================
   DEFEAT
   ========================================================= */

function defeatMission() {

    GAME.gameOver =
        true;


    const modal =
        document.getElementById(
            "defeatModal"
        );


    if (
        modal
    ) {

        modal.classList.add(
            "active"
        );
    }


    showToast(
        "SYSTEM COMPROMISED"
    );
}


/* =========================================================
   RESIZE
   ========================================================= */

function handleResize() {

    if (!camera || !renderer)
        return;


    camera.aspect =
        window.innerWidth /
        window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


/* =========================================================
   MAIN GAME LOOP
   ========================================================= */

function gameLoop() {

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    updateCamera();

    updateBullets(
        delta
    );

    updateParticles(
        delta
    );

    updateEnemies(
        delta
    );

    updateInteraction();


    animateEnvironment(
        delta
    );


    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   ENVIRONMENT ANIMATION
   ========================================================= */

function animateEnvironment(
    delta
) {

    const time =
        performance.now() *
        0.001;


    environmentGroup.children
        .forEach(
            object => {

                if (
                    object.userData &&
                    object.userData.rotate
                ) {

                    object.rotation.y +=
                        delta *
                        object.userData.rotate;
                }
            }
        );


    if (
        player
    ) {

        playerBody.position.y =
            1.4 +
            Math.sin(
                time * 5
            ) *
            0.015;
    }
}


/* =========================================================
   START RENDER LOOP
   ========================================================= */

function startRenderLoop() {

    gameLoop();
}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initCyberHunt
    );

} else {

    initCyberHunt();
}


/* =========================================================
   GLOBAL DEBUG ACCESS
   ========================================================= */

window.CYBERHUNT =
    GAME;

window.CYBERHUNT_SCENE =
    () => scene;

window.CYBERHUNT_CAMERA =
    () => camera;

window.CYBERHUNT_RENDERER =
    () => renderer;
