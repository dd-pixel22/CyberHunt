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
   CYBERHUNT
   PART 2 — CINEMATIC 3D CHARACTER / ARENA / WEAPON SYSTEM
   ========================================================= */


/* =========================================================
   ENHANCED CHARACTER CONFIGURATION
   ========================================================= */

const OPERATIVES = {

    RAVEN: {
        role: "STEALTH",
        speed: 6.5,
        health: 110,
        weapon: "DUAL-PISTOLS",
        armor: 0.35,
        accent: 0xff1738
    },

    SPECTER: {
        role: "RECON / HACKING",
        speed: 5.8,
        health: 100,
        weapon: "SNIPER",
        armor: 0.30,
        accent: 0xc40022
    },

    VOLT: {
        role: "ASSAULT",
        speed: 5.2,
        health: 135,
        weapon: "ASSAULT-RIFLE",
        armor: 0.65,
        accent: 0xff2538
    },

    NOVA: {
        role: "ANALYST / SUPPORT",
        speed: 6.0,
        health: 115,
        weapon: "SMG",
        armor: 0.40,
        accent: 0xf0002d
    }
};


/* =========================================================
   WEAPON DATABASE
   ========================================================= */

const WEAPONS = {

    "DUAL-PISTOLS": {
        damage: 32,
        fireRate: 0.16,
        range: 35,
        magazine: 24,
        reload: 1.2,
        type: "PISTOL"
    },

    "SNIPER": {
        damage: 100,
        fireRate: 1.15,
        range: 80,
        magazine: 5,
        reload: 2.2,
        type: "SNIPER"
    },

    "ASSAULT-RIFLE": {
        damage: 38,
        fireRate: 0.12,
        range: 55,
        magazine: 30,
        reload: 1.7,
        type: "RIFLE"
    },

    "SMG": {
        damage: 26,
        fireRate: 0.09,
        range: 32,
        magazine: 40,
        reload: 1.4,
        type: "SMG"
    }
};


let currentWeapon =
    WEAPONS["DUAL-PISTOLS"];

let weaponCooldown = 0;

let characterParts = {};

let arenaLights = [];

let animatedObjects = [];

let securityDoors = [];

let holograms = [];

let terminalScreens = [];


/* =========================================================
   ENHANCED PLAYER
   ========================================================= */

function createPlayer() {

    player =
        new THREE.Group();

    player.name =
        "CYBERHUNT_OPERATIVE";

    playerGroup.add(
        player
    );


    createCharacterBody();

    createCharacterHead();

    createCharacterArmor();

    createCharacterLegs();

    createCharacterArms();

    createCharacterBackpack();

    createCharacterLights();

    createAdvancedWeapon();


    player.position.set(
        0,
        0,
        18
    );


    characterParts.root =
        player;
}


/* =========================================================
   CHARACTER BODY
   ========================================================= */

function createCharacterBody() {

    const bodyGroup =
        new THREE.Group();


    /* TORSO */

    const torso =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.15,
                1.45,
                0.58
            ),
            new THREE.MeshStandardMaterial({
                color: 0x111216,
                roughness: 0.5,
                metalness: 0.7
            })
        );


    torso.position.y =
        1.75;

    torso.scale.set(
        1,
        1,
        0.95
    );

    torso.castShadow =
        true;

    bodyGroup.add(
        torso
    );


    /* CHEST PLATE */

    const chest =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.82,
                0.7,
                0.12
            ),
            new THREE.MeshStandardMaterial({
                color: 0x202329,
                roughness: 0.3,
                metalness: 0.85
            })
        );


    chest.position.set(
        0,
        1.85,
        -0.34
    );


    chest.rotation.x =
        -0.04;


    bodyGroup.add(
        chest
    );


    /* CHEST CENTER */

    const core =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.12,
                0.42,
                0.05
            ),
            new THREE.MeshStandardMaterial({
                color: 0xff102f,
                emissive: 0x70000f,
                emissiveIntensity: 4
            })
        );


    core.position.set(
        0,
        1.82,
        -0.42
    );


    bodyGroup.add(
        core
    );


    player.add(
        bodyGroup
    );


    characterParts.body =
        bodyGroup;
}


/* =========================================================
   CHARACTER HEAD
   ========================================================= */

function createCharacterHead() {

    const headGroup =
        new THREE.Group();


    /* NECK */

    const neck =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.25,
                0.28,
                0.35,
                12
            ),
            MATERIALS.darkMetal
        );


    neck.position.y =
        2.55;


    headGroup.add(
        neck
    );


    /* HEAD */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.43,
                32,
                20
            ),
            new THREE.MeshStandardMaterial({
                color: 0x7c6460,
                roughness: 0.62,
                metalness: 0.05
            })
        );


    head.position.y =
        2.95;


    head.scale.set(
        0.86,
        1.08,
        0.88
    );


    head.castShadow =
        true;


    headGroup.add(
        head
    );


    /* HAIR / HOOD */

    const hood =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.51,
                24,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.58
            ),
            new THREE.MeshStandardMaterial({
                color: 0x08090b,
                roughness: 0.85,
                metalness: 0.15
            })
        );


    hood.position.y =
        3.05;


    hood.scale.set(
        1.04,
        1.0,
        1.03
    );


    headGroup.add(
        hood
    );


    /* VISOR */

    const visor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.12,
                0.08
            ),
            new THREE.MeshStandardMaterial({
                color: 0xff1635,
                emissive: 0x8d0017,
                emissiveIntensity: 5,
                metalness: 0.65,
                roughness: 0.15
            })
        );


    visor.position.set(
        0,
        3.02,
        -0.405
    );


    headGroup.add(
        visor
    );


    /* SIDE EAR MODULES */

    const earGeometry =
        new THREE.CylinderGeometry(
            0.1,
            0.1,
            0.22,
            10
        );


    const earMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x292d32,
            metalness: 0.85,
            roughness: 0.25
        });


    const earLeft =
        new THREE.Mesh(
            earGeometry,
            earMaterial
        );


    earLeft.rotation.z =
        Math.PI / 2;


    earLeft.position.set(
        -0.43,
        2.95,
        0
    );


    headGroup.add(
        earLeft
    );


    const earRight =
        earLeft.clone();


    earRight.position.x =
        0.43;


    headGroup.add(
        earRight
    );


    player.add(
        headGroup
    );


    characterParts.head =
        headGroup;
}


/* =========================================================
   ARMOR
   ========================================================= */

function createCharacterArmor() {

    const armor =
        new THREE.Group();


    /* LEFT SHOULDER */

    const shoulderGeometry =
        new THREE.SphereGeometry(
            0.35,
            16,
            12
        );


    const shoulderMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x17191d,
            metalness: 0.85,
            roughness: 0.3
        });


    const left =
        new THREE.Mesh(
            shoulderGeometry,
            shoulderMaterial
        );


    left.position.set(
        -0.72,
        2.25,
        0
    );


    left.scale.set(
        1.25,
        0.75,
        1
    );


    armor.add(
        left
    );


    const right =
        left.clone();


    right.position.x =
        0.72;


    armor.add(
        right
    );


    /* RED ARMOR STRIPS */

    const stripGeometry =
        new THREE.BoxGeometry(
            0.09,
            0.65,
            0.12
        );


    const stripMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff1436,
            emissive: 0x77000e,
            emissiveIntensity: 3
        });


    const leftStrip =
        new THREE.Mesh(
            stripGeometry,
            stripMaterial
        );


    leftStrip.position.set(
        -0.78,
        1.9,
        -0.31
    );


    armor.add(
        leftStrip
    );


    const rightStrip =
        leftStrip.clone();


    rightStrip.position.x =
        0.78;


    armor.add(
        rightStrip
    );


    player.add(
        armor
    );


    characterParts.armor =
        armor;
}


/* =========================================================
   LEGS
   ========================================================= */

function createCharacterLegs() {

    const legs =
        new THREE.Group();


    const legMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x0b0c0f,
            roughness: 0.7,
            metalness: 0.35
        });


    const armorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x24282d,
            roughness: 0.3,
            metalness: 0.8
        });


    [-0.32, 0.32].forEach(
        x => {

            const upper =
                new THREE.Mesh(
                    new THREE.CapsuleGeometry(
                        0.23,
                        0.7,
                        8,
                        12
                    ),
                    legMaterial
                );


            upper.position.set(
                x,
                0.95,
                0
            );


            upper.castShadow =
                true;


            legs.add(
                upper
            );


            const knee =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.23,
                        12,
                        8
                    ),
                    armorMaterial
                );


            knee.position.set(
                x,
                0.55,
                -0.02
            );


            legs.add(
                knee
            );


            const boot =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        0.38,
                        0.42,
                        0.65
                    ),
                    armorMaterial
                );


            boot.position.set(
                x,
                0.23,
                -0.1
            );


            boot.castShadow =
                true;


            legs.add(
                boot
            );
        }
    );


    player.add(
        legs
    );


    characterParts.legs =
        legs;
}


/* =========================================================
   ARMS
   ========================================================= */

function createCharacterArms() {

    const arms =
        new THREE.Group();


    const armMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x121418,
            roughness: 0.5,
            metalness: 0.7
        });


    [-1, 1].forEach(
        side => {

            const upper =
                new THREE.Mesh(
                    new THREE.CapsuleGeometry(
                        0.17,
                        0.75,
                        8,
                        12
                    ),
                    armMaterial
                );


            upper.position.set(
                side * 0.82,
                1.85,
                -0.02
            );


            upper.rotation.z =
                side * -0.22;


            upper.castShadow =
                true;


            arms.add(
                upper
            );


            const forearm =
                new THREE.Mesh(
                    new THREE.CapsuleGeometry(
                        0.15,
                        0.6,
                        8,
                        12
                    ),
                    armMaterial
                );


            forearm.position.set(
                side * 0.88,
                1.25,
                -0.18
            );


            forearm.rotation.z =
                side * -0.12;


            arms.add(
                forearm
            );


            /* GLOVE */

            const glove =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.18,
                        12,
                        8
                    ),
                    MATERIALS.black
                );


            glove.position.set(
                side * 0.9,
                0.92,
                -0.3
            );


            arms.add(
                glove
            );
        }
    );


    player.add(
        arms
    );


    characterParts.arms =
        arms;
}


/* =========================================================
   BACKPACK
   ========================================================= */

function createCharacterBackpack() {

    const backpack =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.75,
                1.2,
                0.35
            ),
            new THREE.MeshStandardMaterial({
                color: 0x0a0b0e,
                roughness: 0.65,
                metalness: 0.55
            })
        );


    backpack.position.set(
        0,
        1.7,
        0.43
    );


    backpack.castShadow =
        true;


    player.add(
        backpack
    );


    const antenna =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.025,
                0.025,
                0.85,
                8
            ),
            MATERIALS.crimsonBright
        );


    antenna.position.set(
        0.2,
        2.55,
        0.48
    );


    backpack.add(
        antenna
    );
}


/* =========================================================
   CHARACTER LIGHTS
   ========================================================= */

function createCharacterLights() {

    const light =
        new THREE.PointLight(
            0xff0028,
            1.8,
            5,
            2
        );


    light.position.set(
        0,
        1.8,
        0.5
    );


    player.add(
        light
    );


    characterParts.light =
        light;
}


/* =========================================================
   ADVANCED WEAPON
   ========================================================= */

function createAdvancedWeapon() {

    playerWeapon =
        new THREE.Group();


    playerWeapon.name =
        "TACTICAL_WEAPON";


    /* MAIN RECEIVER */

    const receiver =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.3,
                0.3,
                1.25
            ),
            new THREE.MeshStandardMaterial({
                color: 0x191c21,
                roughness: 0.24,
                metalness: 0.92
            })
        );


    receiver.position.z =
        -0.62;


    receiver.castShadow =
        true;


    playerWeapon.add(
        receiver
    );


    /* UPPER RAIL */

    const rail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.09,
                1.35
            ),
            MATERIALS.black
        );


    rail.position.set(
        0,
        0.19,
        -0.62
    );


    playerWeapon.add(
        rail
    );


    /* BARREL */

    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.065,
                0.075,
                0.85,
                12
            ),
            MATERIALS.darkMetal
        );


    barrel.rotation.x =
        Math.PI / 2;


    barrel.position.z =
        -1.55;


    playerWeapon.add(
        barrel
    );


    /* MUZZLE */

    const muzzle =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.095,
                0.095,
                0.2,
                12
            ),
            MATERIALS.black
        );


    muzzle.rotation.x =
        Math.PI / 2;


    muzzle.position.z =
        -1.98;


    playerWeapon.add(
        muzzle
    );


    /* ENERGY CORE */

    const energy =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.08,
                0.08,
                0.75
            ),
            new THREE.MeshStandardMaterial({
                color: 0xff1738,
                emissive: 0xff0028,
                emissiveIntensity: 6
            })
        );


    energy.position.set(
        0,
        0,
        -1.55
    );


    playerWeapon.add(
        energy
    );


    /* GRIP */

    const grip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.2,
                0.65,
                0.25
            ),
            MATERIALS.black
        );


    grip.position.set(
        0,
        -0.38,
        -0.35
    );


    grip.rotation.x =
        -0.18;


    playerWeapon.add(
        grip
    );


    /* SCOPE */

    const scope =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.09,
                0.09,
                0.35,
                12
            ),
            MATERIALS.darkMetal
        );


    scope.rotation.x =
        Math.PI / 2;


    scope.position.set(
        0,
        0.29,
        -0.55
    );


    playerWeapon.add(
        scope
    );


    playerWeapon.position.set(
        0.82,
        1.65,
        -0.35
    );


    playerWeapon.rotation.y =
        0.12;


    player.add(
        playerWeapon
    );


    characterParts.weapon =
        playerWeapon;
}


/* =========================================================
   ENHANCED ARENA
   ========================================================= */

function createEnvironment() {

    createFloor();

    createIndustrialFloorPanels();

    createGrid();

    createWalls();

    createServerRows();

    createComputerStations();

    createSecurityLights();

    createDoors();

    createCentralTerminal();

    createControlRoom();

    createServerCore();

    createCyberPillars();

    createHolographicDisplays();

    createCeilingStructures();

    createWalkways();

    createEvidenceZones();

    createDecorations();

    createAtmosphericLights();
}


/* =========================================================
   INDUSTRIAL FLOOR
   ========================================================= */

function createIndustrialFloorPanels() {

    for (
        let x = -25;
        x <= 25;
        x += 5
    ) {

        for (
            let z = -25;
            z <= 25;
            z += 5
        ) {

            const panel =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        4.7,
                        0.08,
                        4.7
                    ),
                    new THREE.MeshStandardMaterial({
                        color:
                            (Math.abs(x + z) % 10 === 0)
                                ? 0x0d0e11
                                : 0x090a0c,
                        roughness: 0.7,
                        metalness: 0.45
                    })
                );


            panel.position.set(
                x,
                0.05,
                z
            );


            panel.receiveShadow =
                true;


            environmentGroup.add(
                panel
            );
        }
    }
}


/* =========================================================
   CYBER PILLARS
   ========================================================= */

function createCyberPillars() {

    const locations = [
        [-23, -18],
        [23, -18],
        [-23, 18],
        [23, 18],
        [-17, 0],
        [17, 0]
    ];


    locations.forEach(
        ([x, z]) => {

            const pillar =
                new THREE.Group();


            const body =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.4,
                        8,
                        1.4
                    ),
                    MATERIALS.darkMetal
                );


            body.position.y =
                4;


            body.castShadow =
                true;


            pillar.add(
                body
            );


            for (
                let i = 0;
                i < 4;
                i++
            ) {

                const strip =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            0.08,
                            5,
                            0.08
                        ),
                        MATERIALS.crimsonBright
                    );


                strip.position.set(
                    i % 2
                        ? 0.66
                        : -0.66,
                    4,
                    i < 2
                        ? 0.66
                        : -0.66
                );


                pillar.add(
                    strip
                );
            }


            pillar.position.set(
                x,
                0,
                z
            );


            environmentGroup.add(
                pillar
            );
        }
    );
}


/* =========================================================
   CONTROL ROOM
   ========================================================= */

function createControlRoom() {

    const room =
        new THREE.Group();


    const platform =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                14,
                0.4,
                8
            ),
            MATERIALS.darkMetal
        );


    platform.position.y =
        0.3;


    room.add(
        platform
    );


    const deskPositions = [
        [-4, 0],
        [0, 0],
        [4, 0]
    ];


    deskPositions.forEach(
        ([x, z]) => {

            const desk =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        3,
                        1,
                        1.4
                    ),
                    MATERIALS.black
                );


            desk.position.set(
                x,
                1,
                z
            );


            room.add(
                desk
            );


            for (
                let i = -1;
                i <= 1;
                i++
            ) {

                const monitor =
                    new THREE.Mesh(
                        new THREE.BoxGeometry(
                            1,
                            0.8,
                            0.12
                        ),
                        MATERIALS.black
                    );


                monitor.position.set(
                    x + i * 0.8,
                    1.9,
                    z - 0.3
                );


                room.add(
                    monitor
                );


                const screen =
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(
                            0.82,
                            0.6
                        ),
                        new THREE.MeshBasicMaterial({
                            color:
                                i === 0
                                    ? 0xff092b
                                    : 0x4d0009,
                            transparent:
                                true,
                            opacity:
                                0.8
                        })
                    );


                screen.position.set(
                    x + i * 0.8,
                    1.9,
                    z - 0.37
                );


                room.add(
                    screen
                );


                terminalScreens.push(
                    screen
                );
            }
        }
    );


    room.position.set(
        0,
        0,
        -20
    );


    environmentGroup.add(
        room
    );
}


/* =========================================================
   SERVER CORE
   ========================================================= */

function createServerCore() {

    const core =
        new THREE.Group();


    const base =
        new THREE.CylinderGeometry(
            4,
            4.8,
            0.8,
            48
        );


    const baseMesh =
        new THREE.Mesh(
            base,
            MATERIALS.darkMetal
        );


    baseMesh.position.y =
        0.4;


    core.add(
        baseMesh
    );


    const reactor =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                1.8,
                2.2,
                7,
                32
            ),
            new THREE.MeshStandardMaterial({
                color: 0x15171c,
                metalness: 0.9,
                roughness: 0.2
            })
        );


    reactor.position.y =
        4;


    reactor.castShadow =
        true;


    core.add(
        reactor
    );


    const energy =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.85,
                0.85,
                6.5,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff0028,
                transparent: true,
                opacity: 0.65
            })
        );


    energy.position.y =
        4;


    core.add(
        energy
    );


    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                2.5,
                0.09,
                12,
                64
            ),
            MATERIALS.crimsonBright
        );


    ring.rotation.x =
        Math.PI / 2;


    ring.position.y =
        1;


    core.add(
        ring
    );


    core.position.set(
        0,
        0,
        -5
    );


    environmentGroup.add(
        core
    );


    animatedObjects.push({
        object: energy,
        type: "pulse"
    });


    animatedObjects.push({
        object: ring,
        type: "rotate"
    });
}


/* =========================================================
   HOLOGRAPHIC DISPLAYS
   ========================================================= */

function createHolographicDisplays() {

    const locations = [
        [-11, 4, -11],
        [11, 4, -11],
        [-11, 4, 11],
        [11, 4, 11]
    ];


    locations.forEach(
        ([x, y, z]) => {

            const display =
                new THREE.Group();


            const frame =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        3.2,
                        3.2,
                        0.12
                    ),
                    MATERIALS.darkMetal
                );


            display.add(
                frame
            );


            const hologram =
                new THREE.Mesh(
                    new THREE.PlaneGeometry(
                        2.7,
                        2.7
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xff102f,
                        transparent: true,
                        opacity: 0.2,
                        side:
                            THREE.DoubleSide
                    })
                );


            hologram.position.z =
                -0.08;


            display.add(
                hologram
            );


            const horizontal =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        2.5,
                        0.025,
                        0.025
                    ),
                    MATERIALS.crimsonBright
                );


            horizontal.position.z =
                -0.12;


            display.add(
                horizontal
            );


            display.position.set(
                x,
                y,
                z
            );


            environmentGroup.add(
                display
            );


            holograms.push(
                hologram
            );
        }
    );
}


/* =========================================================
   CEILING STRUCTURES
   ========================================================= */

function createCeilingStructures() {

    for (
        let x = -20;
        x <= 20;
        x += 10
    ) {

        const beam =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    0.35,
                    52
                ),
                MATERIALS.darkMetal
            );


        beam.position.set(
            x,
            9,
            0
        );


        environmentGroup.add(
            beam
        );
    }


    for (
        let z = -20;
        z <= 20;
        z += 10
    ) {

        const beam =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    52,
                    0.35,
                    0.35
                ),
                MATERIALS.darkMetal
            );


        beam.position.set(
            0,
            9,
            z
        );


        environmentGroup.add(
            beam
        );
    }
}


/* =========================================================
   WALKWAYS
   ========================================================= */

function createWalkways() {

    const walkwayMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x17191d,
            metalness: 0.75,
            roughness: 0.35
        });


    const walkway =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                50,
                0.12,
                2
            ),
            walkwayMaterial
        );


    walkway.position.y =
        0.16;


    environmentGroup.add(
        walkway
    );


    const walkway2 =
        walkway.clone();


    walkway2.rotation.y =
        Math.PI / 2;


    environmentGroup.add(
        walkway2
    );
}


/* =========================================================
   EVIDENCE ZONES
   ========================================================= */

function createEvidenceZones() {

    const locations = [
        [-8, -8],
        [8, -8],
        [-8, 8],
        [8, 8],
        [0, -13]
    ];


    locations.forEach(
        ([x, z]) => {

            const ring =
                new THREE.Mesh(
                    new THREE.RingGeometry(
                        0.8,
                        0.92,
                        32
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xff0028,
                        transparent: true,
                        opacity: 0.25,
                        side:
                            THREE.DoubleSide
                    })
                );


            ring.rotation.x =
                -Math.PI / 2;


            ring.position.set(
                x,
                0.13,
                z
            );


            environmentGroup.add(
                ring
            );


            animatedObjects.push({
                object: ring,
                type: "evidencePulse"
            });
        }
    );
}


/* =========================================================
   ATMOSPHERIC LIGHTING
   ========================================================= */

function createAtmosphericLights() {

    const locations = [
        [-20, 3, -20],
        [20, 3, -20],
        [-20, 3, 20],
        [20, 3, 20],
        [0, 4, 0]
    ];


    locations.forEach(
        ([x, y, z]) => {

            const light =
                new THREE.PointLight(
                    0xff0028,
                    8,
                    15,
                    2
                );


            light.position.set(
                x,
                y,
                z
            );


            scene.add(
                light
            );


            arenaLights.push(
                light
            );
        }
    );
}


/* =========================================================
   SECURITY DOOR — ENHANCED
   ========================================================= */

function createDoors() {

    createAdvancedSecurityDoor(
        0,
        -27.3,
        "NORTH GATE"
    );

    createAdvancedSecurityDoor(
        0,
        27.3,
        "SOUTH GATE"
    );

    createAdvancedSecurityDoor(
        -27.3,
        0,
        "WEST GATE",
        true
    );

    createAdvancedSecurityDoor(
        27.3,
        0,
        "EAST GATE",
        true
    );
}


function createAdvancedSecurityDoor(
    x,
    z,
    name,
    rotated = false
) {

    const door =
        new THREE.Group();


    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                rotated ? 0.8 : 8,
                7.5,
                rotated ? 8 : 0.8
            ),
            MATERIALS.darkMetal
        );


    frame.position.y =
        3.75;


    door.add(
        frame
    );


    const inner =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                rotated ? 0.25 : 6.2,
                6.3,
                rotated ? 6.2 : 0.25
            ),
            MATERIALS.black
        );


    inner.position.y =
        3.2;


    door.add(
        inner
    );


    for (
        let i = -2;
        i <= 2;
        i++
    ) {

        const line =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    rotated ? 0.08 : 5.5,
                    0.06,
                    rotated ? 5.5 : 0.08
                ),
                MATERIALS.crimsonBright
            );


        line.position.set(
            rotated ? 0 : i * 1.1,
            1.3 + i * 1.1,
            rotated ? i * 1.1 : -0.14
        );


        door.add(
            line
        );
    }


    door.position.set(
        x,
        0,
        z
    );


    door.userData.doorName =
        name;

    door.userData.locked =
        true;

    door.userData.open =
        false;


    securityDoors.push(
        door
    );


    environmentGroup.add(
        door
    );
}


/* =========================================================
   ENHANCED ENVIRONMENT ANIMATION
   ========================================================= */

function animateEnvironment(
    delta
) {

    const time =
        performance.now() *
        0.001;


    /* PLAYER BREATHING */

    if (
        player &&
        GAME.started &&
        !GAME.paused
    ) {

        const breathing =
            Math.sin(
                time * 2.2
            ) * 0.018;


        player.scale.y =
            1 + breathing;
    }


    /* SERVER / HOLOGRAM PULSES */

    holograms.forEach(
        hologram => {

            hologram.material.opacity =
                0.15 +
                Math.sin(
                    time * 2
                ) * 0.08;
        }
    );


    /* SERVER CORE */

    animatedObjects.forEach(
        item => {

            if (
                item.type === "rotate"
            ) {

                item.object.rotation.z +=
                    delta * 0.7;
            }


            if (
                item.type === "pulse"
            ) {

                const scale =
                    1 +
                    Math.sin(
                        time * 3
                    ) * 0.08;


                item.object.scale.set(
                    scale,
                    1,
                    scale
                );
            }


            if (
                item.type ===
                "evidencePulse"
            ) {

                const scale =
                    1 +
                    Math.sin(
                        time * 3
                    ) * 0.12;


                item.object.scale.set(
                    scale,
                    scale,
                    scale
                );
            }
        }
    );


    /* RED LIGHT FLICKER */

    arenaLights.forEach(
        (light, index) => {

            light.intensity =
                6 +
                Math.sin(
                    time * 4 +
                    index
                ) * 1.5;
        }
    );


    /* TERMINAL FLICKER */

    terminalScreens.forEach(
        (screen, index) => {

            screen.material.opacity =
                0.65 +
                Math.sin(
                    time * 7 +
                    index
                ) * 0.15;
        }
    );
}


/* =========================================================
   WEAPON FIRE SYSTEM
   ========================================================= */

function shoot() {

    if (
        !GAME.started ||
        GAME.paused ||
        GAME.gameOver
    )
        return;


    if (
        weaponCooldown > 0
    )
        return;


    weaponCooldown =
        currentWeapon.fireRate;


    fireWeaponProjectile();

    animateWeaponRecoil();

    createWeaponMuzzleFlash();

    createWeaponSmoke();

    updateHUD();
}


/* =========================================================
   WEAPON COOLDOWN
   ========================================================= */

function updateWeaponCooldown(
    delta
) {

    if (
        weaponCooldown > 0
    ) {

        weaponCooldown -=
            delta;
    }
}


/* =========================================================
   PROJECTILE
   ========================================================= */

function fireWeaponProjectile() {

    const projectile =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.055,
                8,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1738
            })
        );


    projectile.position.copy(
        player.position
    );


    projectile.position.y +=
        1.65;


    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direction.applyQuaternion(
        player.quaternion
    );


    projectile.userData.velocity =
        direction.multiplyScalar(
            55
        );


    projectile.userData.life =
        currentWeapon.range /
        55;


    projectile.userData.damage =
        currentWeapon.damage;


    bullets.push(
        projectile
    );


    scene.add(
        projectile
    );
}


/* =========================================================
   WEAPON RECOIL
   ========================================================= */

function animateWeaponRecoil() {

    if (
        !playerWeapon
    )
        return;


    playerWeapon.position.z =
        -0.48;


    setTimeout(
        () => {

            if (
                playerWeapon
            ) {

                playerWeapon.position.z =
                    -0.35;
            }

        },
        70
    );
}


/* =========================================================
   MUZZLE FLASH
   ========================================================= */

function createWeaponMuzzleFlash() {

    if (
        !playerWeapon
    )
        return;


    const flash =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.25,
                10,
                10
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffe6e6
            })
        );


    flash.position.set(
        0,
        0,
        -2.05
    );


    playerWeapon.add(
        flash
    );


    const light =
        new THREE.PointLight(
            0xff1838,
            12,
            5,
            2
        );


    light.position.set(
        0,
        0,
        -2
    );


    playerWeapon.add(
        light
    );


    setTimeout(
        () => {

            playerWeapon.remove(
                flash
            );

            playerWeapon.remove(
                light
            );

        },
        65
    );
}


/* =========================================================
   WEAPON SMOKE
   ========================================================= */

function createWeaponSmoke() {

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        const smoke =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.05 +
                    Math.random() * 0.05,
                    6,
                    6
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x8a8a8a,
                    transparent: true,
                    opacity: 0.35
                })
            );


        smoke.position.copy(
            player.position
        );


        smoke.position.y +=
            1.7;


        smoke.position.z -=
            1.8;


        smoke.userData.velocity =
            new THREE.Vector3(
                THREE.MathUtils.randFloat(
                    -0.4,
                    0.4
                ),
                THREE.MathUtils.randFloat(
                    0.4,
                    1.2
                ),
                THREE.MathUtils.randFloat(
                    -0.4,
                    0.1
                )
            );


        smoke.userData.life =
            0.5;


        particles.push(
            smoke
        );


        scene.add(
            smoke
        );
    }
}


/* =========================================================
   ENHANCED PLAYER MOVEMENT
   ========================================================= */

function updatePlayer(delta) {

    if (
        !GAME.started ||
        GAME.paused ||
        GAME.gameOver
    )
        return;


    let forward =
        0;

    let sideways =
        0;


    if (
        GAME.keys.w
    )
        forward += 1;


    if (
        GAME.keys.s
    )
        forward -= 1;


    if (
        GAME.keys.d
    )
        sideways += 1;


    if (
        GAME.keys.a
    )
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


        const operative =
            OPERATIVES[
                GAME.selectedOperative
            ] ||
            OPERATIVES.RAVEN;


        const speed =
            GAME.keys.shift
                ? operative.speed * 1.35
                : operative.speed;


        player.position.addScaledVector(
            direction,
            speed * delta
        );


        const targetRotation =
            Math.atan2(
                direction.x,
                direction.z
            );


        let rotationDifference =
            targetRotation -
            player.rotation.y;


        rotationDifference =
            Math.atan2(
                Math.sin(
                    rotationDifference
                ),
                Math.cos(
                    rotationDifference
                )
            );


        player.rotation.y +=
            rotationDifference *
            Math.min(
                1,
                delta * 12
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
   ENHANCED CAMERA
   ========================================================= */

function updateCamera() {

    if (
        !player
    )
        return;


    const cameraOffset =
        new THREE.Vector3(
            0,
            9.5,
            12
        );


    cameraOffset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        player.rotation.y * 0.18
    );


    const target =
        player.position.clone()
            .add(
                cameraOffset
            );


    camera.position.lerp(
        target,
        0.07
    );


    const lookAt =
        player.position.clone();


    lookAt.y +=
        1.2;


    camera.lookAt(
        lookAt
    );
}


/* =========================================================
   BULLET COLLISION — IMPROVED
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
                distance < 1.35
            ) {

                damageEnemy(
                    enemy,
                    bullet.userData.damage ||
                    currentWeapon.damage
                );


                createHitEffect(
                    bullet.position
                );


                bullet.userData.life =
                    0;
            }
        }
    );
}


/* =========================================================
   ENEMY VISUAL ENHANCEMENT
   ========================================================= */

function createEnemy() {

    const enemy =
        new THREE.Group();


    enemy.name =
        "HOSTILE_OPERATIVE";


    const armorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111217,
            roughness: 0.38,
            metalness: 0.75
        });


    const redMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x9d001d,
            emissive: 0x410008,
            emissiveIntensity: 2
        });


    /* BODY */

    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.58,
                1.45,
                8,
                16
            ),
            armorMaterial
        );


    body.position.y =
        1.35;


    body.castShadow =
        true;


    enemy.add(
        body
    );


    /* HEAD */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.42,
                24,
                16
            ),
            MATERIALS.black
        );


    head.position.y =
        2.65;


    enemy.add(
        head
    );


    /* VISOR */

    const visor =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.55,
                0.1,
                0.08
            ),
            redMaterial
        );


    visor.position.set(
        0,
        2.7,
        -0.39
    );


    enemy.add(
        visor
    );


    /* SHOULDERS */

    [-1, 1].forEach(
        side => {

            const shoulder =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.32,
                        12,
                        8
                    ),
                    armorMaterial
                );


            shoulder.position.set(
                side * 0.68,
                2.15,
                0
            );


            shoulder.scale.set(
                1.2,
                0.75,
                1
            );


            enemy.add(
                shoulder
            );
        }
    );


    /* WEAPON */

    const weapon =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.18,
                1.35
            ),
            MATERIALS.metal
        );


    weapon.position.set(
        0.72,
        1.5,
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
            1.0,
            2.0
        );

    enemy.userData.attackCooldown =
        Math.random();


    return enemy;
}


/* =========================================================
   ENEMY HEALTH BARS
   ========================================================= */

function createEnemyHealthBar(
    enemy
) {

    const background =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.2,
                0.12
            ),
            new THREE.MeshBasicMaterial({
                color: 0x100307
            })
        );


    background.position.y =
        3.35;


    enemy.add(
        background
    );


    const health =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.1,
                0.07
            ),
            new THREE.MeshBasicMaterial({
                color: 0xff1738
            })
        );


    health.position.set(
        0,
        3.35,
        0.01
    );


    enemy.add(
        health
    );


    enemy.userData.healthBar =
        health;
}


/* =========================================================
   ENEMY UPDATE
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


            if (
                !enemy.userData.healthBar
            ) {

                createEnemyHealthBar(
                    enemy
                );
            }


            const distance =
                enemy.position.distanceTo(
                    player.position
                );


            if (
                distance < 18
            ) {

                const direction =
                    new THREE.Vector3()
                        .subVectors(
                            player.position,
                            enemy.position
                        );


                direction.y =
                    0;


                direction.normalize();


                if (
                    distance > 3
                ) {

                    enemy.position.addScaledVector(
                        direction,
                        enemy.userData.speed *
                        delta
                    );
                }


                enemy.lookAt(
                    player.position.x,
                    enemy.position.y + 1,
                    player.position.z
                );


                enemy.userData.attackCooldown -=
                    delta;


                if (
                    distance < 10 &&
                    enemy.userData.attackCooldown <= 0
                ) {

                    damagePlayer(
                        5
                    );


                    enemy.userData.attackCooldown =
                        1.5 +
                        Math.random();
                }
            }


            if (
                enemy.userData.healthBar
            ) {

                const ratio =
                    Math.max(
                        0,
                        enemy.userData.health /
                        enemy.userData.maxHealth
                    );


                enemy.userData.healthBar.scale.x =
                    ratio;
            }
        }
    );
}


/* =========================================================
   MISSION START — ENHANCED
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

    GAME.missionComplete =
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

    clearEvidence();


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
        )} — OPERATION ACTIVE`
    );
}


/* =========================================================
   CLEAR EVIDENCE
   ========================================================= */

function clearEvidence() {

    evidenceObjects.forEach(
        evidence => {

            evidenceGroup.remove(
                evidence
            );
        }
    );


    evidenceObjects.length =
        0;


    interactiveObjects =
        interactiveObjects.filter(
            object =>
                object.userData.type !==
                "evidence"
        );
}


/* =========================================================
   ENHANCED MISSION SPAWN
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


    positionPlayerForMission(
        missionIndex
    );
}


/* =========================================================
   MISSION START POSITIONS
   ========================================================= */

function positionPlayerForMission(
    index
) {

    const starts = [

        [0, 18],

        [-18, 18],

        [18, 18],

        [-18, -18],

        [0, 15]
    ];


    const position =
        starts[
            index %
            starts.length
        ];


    player.position.set(
        position[0],
        0,
        position[1]
    );
}


/* =========================================================
   ENHANCED HUD UPDATE
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
            Math.round(
                GAME.health
            )
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


    setText(
        [
            "weaponName",
            "hudWeapon"
        ],
        GAME.selectedWeapon
    );
}


/* =========================================================
   ENHANCED GAME LOOP
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


    updateWeaponCooldown(
        delta
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


    if (
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
