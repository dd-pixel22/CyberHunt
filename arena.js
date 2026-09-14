```javascript
/*
=========================================================
 CYBERHUNT — 3D CYBER CITY ARENA
 arena.js
=========================================================
 Handles:
 - CyberCity
 - 5 futuristic buildings
 - Roads and neon paths
 - Level buildings
 - Cyberpunk environment
 - Decorative holograms
 - Lighting
 - Building interaction points
=========================================================
*/

import * as THREE from "three";

/* ======================================================
   ARENA CONFIGURATION
====================================================== */

const ARENA_CONFIG = {
    citySize: 180,
    roadWidth: 14,
    buildingSpacing: 34,

    colors: {
        black: 0x030305,
        dark: 0x08090d,
        red: 0xff1744,
        crimson: 0x9e1033,
        neonRed: 0xff3155,
        white: 0xf2f2f2,
        blue: 0x244cff,
        purple: 0x8c2cff
    }
};

/* ======================================================
   ARENA STATE
====================================================== */

const arenaState = {
    scene: null,
    cityGroup: null,
    buildings: [],
    roads: [],
    lights: [],
    initialized: false
};

/* ======================================================
   PUBLIC INITIALIZER
====================================================== */

export function createCyberCity(scene) {

    if (!scene) {
        console.error("CyberHunt Arena: Scene not provided.");
        return null;
    }

    arenaState.scene = scene;

    // Remove previous city if one exists
    if (arenaState.cityGroup) {
        scene.remove(arenaState.cityGroup);
    }

    arenaState.cityGroup = new THREE.Group();
    arenaState.cityGroup.name = "CyberCity";

    arenaState.buildings = [];
    arenaState.roads = [];
    arenaState.lights = [];

    scene.add(arenaState.cityGroup);

    createGround();
    createRoadNetwork();
    createBuildings();
    createStreetLights();
    createNeonSigns();
    createCityDetails();
    createHologramStructures();
    createSkyline();

    arenaState.initialized = true;

    return arenaState.cityGroup;
}

/* ======================================================
   GROUND
====================================================== */

function createGround() {

    const size = ARENA_CONFIG.citySize;

    const groundGeometry = new THREE.PlaneGeometry(size, size);

    const groundMaterial = new THREE.MeshStandardMaterial({
        color: ARENA_CONFIG.colors.black,
        roughness: 0.92,
        metalness: 0.35
    });

    const ground = new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.15;
    ground.receiveShadow = true;

    ground.name = "CityGround";

    arenaState.cityGroup.add(ground);

    createGrid();
}

/* ======================================================
   CYBER GRID
====================================================== */

function createGrid() {

    const gridSize = ARENA_CONFIG.citySize;
    const divisions = 36;

    const grid = new THREE.GridHelper(
        gridSize,
        divisions,
        ARENA_CONFIG.colors.crimson,
        0x15151c
    );

    grid.position.y = 0.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.25;

    arenaState.cityGroup.add(grid);
}

/* ======================================================
   ROAD NETWORK
====================================================== */

function createRoadNetwork() {

    const roadPositions = [
        {
            x: 0,
            z: 0,
            width: ARENA_CONFIG.citySize,
            depth: ARENA_CONFIG.roadWidth
        },
        {
            x: 0,
            z: 0,
            width: ARENA_CONFIG.roadWidth,
            depth: ARENA_CONFIG.citySize
        },

        {
            x: 0,
            z: -48,
            width: ARENA_CONFIG.citySize,
            depth: 9
        },

        {
            x: 0,
            z: 48,
            width: ARENA_CONFIG.citySize,
            depth: 9
        },

        {
            x: -48,
            z: 0,
            width: 9,
            depth: ARENA_CONFIG.citySize
        },

        {
            x: 48,
            z: 0,
            width: 9,
            depth: ARENA_CONFIG.citySize
        }
    ];

    roadPositions.forEach((road, index) => {

        const geometry = new THREE.PlaneGeometry(
            road.width,
            road.depth
        );

        const material = new THREE.MeshStandardMaterial({
            color: 0x07070b,
            roughness: 0.75,
            metalness: 0.5
        });

        const mesh = new THREE.Mesh(
            geometry,
            material
        );

        mesh.rotation.x = -Math.PI / 2;

        mesh.position.set(
            road.x,
            0.01,
            road.z
        );

        mesh.name = `CyberRoad_${index}`;

        arenaState.cityGroup.add(mesh);
        arenaState.roads.push(mesh);

        createRoadNeonLines(
            road.x,
            road.z,
            road.width,
            road.depth
        );
    });
}

/* ======================================================
   ROAD NEON
====================================================== */

function createRoadNeonLines(
    x,
    z,
    width,
    depth
) {

    const material = new THREE.MeshBasicMaterial({
        color: ARENA_CONFIG.colors.red
    });

    if (width > depth) {

        for (let offset = -depth / 2 + 1.5;
             offset <= depth / 2 - 1.5;
             offset += 3) {

            const geometry =
                new THREE.PlaneGeometry(width, 0.12);

            const line = new THREE.Mesh(
                geometry,
                material
            );

            line.rotation.x = -Math.PI / 2;

            line.position.set(
                x,
                0.06,
                z + offset
            );

            arenaState.cityGroup.add(line);
        }

    } else {

        for (let offset = -width / 2 + 1.5;
             offset <= width / 2 - 1.5;
             offset += 3) {

            const geometry =
                new THREE.PlaneGeometry(0.12, depth);

            const line = new THREE.Mesh(
                geometry,
                material
            );

            line.rotation.x = -Math.PI / 2;

            line.position.set(
                x + offset,
                0.06,
                z
            );

            arenaState.cityGroup.add(line);
        }
    }
}

/* ======================================================
   BUILDINGS
====================================================== */

function createBuildings() {

    const buildingData = [

        {
            id: 1,
            name: "DATA VAULT",
            x: -43,
            z: -43,
            width: 27,
            depth: 27,
            height: 32,
            color: 0xff1744
        },

        {
            id: 2,
            name: "CYBER BANK",
            x: 43,
            z: -43,
            width: 30,
            depth: 27,
            height: 40,
            color: 0xff244f
        },

        {
            id: 3,
            name: "NEXUS LAB",
            x: -43,
            z: 43,
            width: 27,
            depth: 27,
            height: 36,
            color: 0x8c2cff
        },

        {
            id: 4,
            name: "BLACKSITE",
            x: 43,
            z: 43,
            width: 30,
            depth: 27,
            height: 45,
            color: 0xff1744
        },

        {
            id: 5,
            name: "CYBER CORE",
            x: 0,
            z: 0,
            width: 23,
            depth: 23,
            height: 52,
            color: 0xff0033
        }
    ];

    buildingData.forEach(data => {

        const building =
            createBuilding(data);

        arenaState.cityGroup.add(building);

        arenaState.buildings.push({
            ...data,
            object: building
        });
    });
}

/* ======================================================
   BUILDING CREATOR
====================================================== */

function createBuilding(data) {

    const group = new THREE.Group();

    group.name =
        `Level_${data.id}_${data.name.replaceAll(" ", "_")}`;

    /* ----------------------------------------------
       Main structure
    ---------------------------------------------- */

    const bodyGeometry =
        new THREE.BoxGeometry(
            data.width,
            data.height,
            data.depth
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x08090e,
            roughness: 0.55,
            metalness: 0.78
        });

    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );

    body.position.y =
        data.height / 2;

    body.castShadow = true;
    body.receiveShadow = true;

    group.add(body);

    /* ----------------------------------------------
       Roof
    ---------------------------------------------- */

    const roofGeometry =
        new THREE.BoxGeometry(
            data.width + 2,
            1,
            data.depth + 2
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x11131a,
            metalness: 0.85,
            roughness: 0.35
        });

    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );

    roof.position.y =
        data.height + 0.5;

    group.add(roof);

    /* ----------------------------------------------
       Vertical neon edges
    ---------------------------------------------- */

    createBuildingEdge(
        group,
        data.width / 2,
        data.depth / 2,
        data.height,
        data.color
    );

    createBuildingEdge(
        group,
        -data.width / 2,
        data.depth / 2,
        data.height,
        data.color
    );

    createBuildingEdge(
        group,
        data.width / 2,
        -data.depth / 2,
        data.height,
        data.color
    );

    createBuildingEdge(
        group,
        -data.width / 2,
        -data.depth / 2,
        data.height,
        data.color
    );

    /* ----------------------------------------------
       Windows
    ---------------------------------------------- */

    createWindows(
        group,
        data.width,
        data.depth,
        data.height,
        data.color
    );

    /* ----------------------------------------------
       Entrance
    ---------------------------------------------- */

    createEntrance(
        group,
        data.width,
        data.height,
        data.color,
        data.id
    );

    /* ----------------------------------------------
       Building sign
    ---------------------------------------------- */

    createBuildingSign(
        group,
        data.name,
        data.height,
        data.color
    );

    group.position.set(
        data.x,
        0,
        data.z
    );

    group.userData = {
        level: data.id,
        buildingName: data.name
    };

    return group;
}

/* ======================================================
   BUILDING EDGE
====================================================== */

function createBuildingEdge(
    group,
    x,
    z,
    height,
    color
) {

    const geometry =
        new THREE.BoxGeometry(
            0.18,
            height,
            0.18
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: color
        });

    const edge =
        new THREE.Mesh(
            geometry,
            material
        );

    edge.position.set(
        x,
        height / 2,
        z
    );

    group.add(edge);
}

/* ======================================================
   WINDOWS
====================================================== */

function createWindows(
    group,
    width,
    depth,
    height,
    color
) {

    const windowMaterial =
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });

    const floors =
        Math.max(2, Math.floor(height / 6));

    const columns =
        Math.max(3, Math.floor(width / 4));

    for (
        let floor = 0;
        floor < floors;
        floor++
    ) {

        const y =
            4 + floor * 5.2;

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const x =
                -width / 2 +
                2.5 +
                column *
                ((width - 5) / Math.max(1, columns - 1));

            /* Front window */

            const frontGeometry =
                new THREE.BoxGeometry(
                    1.1,
                    1.7,
                    0.08
                );

            const front =
                new THREE.Mesh(
                    frontGeometry,
                    windowMaterial
                );

            front.position.set(
                x,
                y,
                depth / 2 + 0.05
            );

            group.add(front);

            /* Back window */

            const back =
                front.clone();

            back.position.z =
                -depth / 2 - 0.05;

            group.add(back);
        }
    }
}

/* ======================================================
   BUILDING ENTRANCE
====================================================== */

function createEntrance(
    group,
    width,
    height,
    color,
    level
) {

    const doorGeometry =
        new THREE.BoxGeometry(
            4,
            5.5,
            0.25
        );

    const doorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x020204,
            metalness: 0.9,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.12
        });

    const door =
        new THREE.Mesh(
            doorGeometry,
            doorMaterial
        );

    door.position.set(
        0,
        2.75,
        width * 0.0 + 13.6
    );

    group.add(door);

    /* Door frame */

    const frameGeometry =
        new THREE.BoxGeometry(
            4.8,
            6.2,
            0.18
        );

    const frameMaterial =
        new THREE.MeshBasicMaterial({
            color: color
        });

    const frame =
        new THREE.Mesh(
            frameGeometry,
            frameMaterial
        );

    frame.position.set(
        0,
        3.1,
        13.75
    );

    group.add(frame);

    door.userData = {
        level,
        type: "buildingEntrance"
    };
}

/* ======================================================
   BUILDING SIGN
====================================================== */

function createBuildingSign(
    group,
    text,
    height,
    color
) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 1024;
    canvas.height = 256;

    const ctx =
        canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.font =
        "bold 78px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.shadowBlur = 25;
    ctx.shadowColor =
        `#${color.toString(16).padStart(6, "0")}`;

    ctx.fillStyle = "#ffffff";

    ctx.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    const material =
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });

    const sprite =
        new THREE.Sprite(material);

    sprite.scale.set(
        12,
        3,
        1
    );

    sprite.position.set(
        0,
        height * 0.65,
        14
    );

    group.add(sprite);
}

/* ======================================================
   STREET LIGHTS
====================================================== */

function createStreetLights() {

    const positions = [
        [-18, -7],
        [18, -7],
        [-18, 7],
        [18, 7],

        [-68, -10],
        [-68, 10],
        [68, -10],
        [68, 10],

        [-10, -68],
        [10, -68],
        [-10, 68],
        [10, 68]
    ];

    positions.forEach(
        ([x, z]) => {

            const pole =
                createStreetLight();

            pole.position.set(
                x,
                0,
                z
            );

            arenaState.cityGroup.add(pole);
        }
    );
}

/* ======================================================
   STREET LIGHT
====================================================== */

function createStreetLight() {

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
            color: 0x22242c,
            metalness: 0.8,
            roughness: 0.3
        });

    const pole =
        new THREE.Mesh(
            poleGeometry,
            poleMaterial
        );

    pole.position.y = 3;

    group.add(pole);

    const lampGeometry =
        new THREE.SphereGeometry(
            0.25,
            12,
            12
        );

    const lampMaterial =
        new THREE.MeshBasicMaterial({
            color: ARENA_CONFIG.colors.red
        });

    const lamp =
        new THREE.Mesh(
            lampGeometry,
            lampMaterial
        );

    lamp.position.y = 6;

    group.add(lamp);

    const light =
        new THREE.PointLight(
            ARENA_CONFIG.colors.red,
            1.5,
            13
        );

    light.position.y = 6;

    group.add(light);

    arenaState.lights.push(light);

    return group;
}

/* ======================================================
   NEON SIGNS
====================================================== */

function createNeonSigns() {

    const signs = [
        {
            text: "CYBERHUNT",
            x: 0,
            y: 16,
            z: -18
        },
        {
            text: "SECURITY",
            x: -18,
            y: 11,
            z: 18
        },
        {
            text: "SYSTEM ONLINE",
            x: 18,
            y: 11,
            z: 18
        }
    ];

    signs.forEach(sign => {

        const canvas =
            document.createElement("canvas");

        canvas.width = 800;
        canvas.height = 180;

        const ctx =
            canvas.getContext("2d");

        ctx.font =
            "bold 64px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.shadowBlur = 35;
        ctx.shadowColor = "#ff1744";

        ctx.fillStyle = "#ffffff";

        ctx.fillText(
            sign.text,
            400,
            90
        );

        const texture =
            new THREE.CanvasTexture(canvas);

        const material =
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            });

        const sprite =
            new THREE.Sprite(material);

        sprite.scale.set(
            10,
            2.3,
            1
        );

        sprite.position.set(
            sign.x,
            sign.y,
            sign.z
        );

        arenaState.cityGroup.add(sprite);
    });
}

/* ======================================================
   CITY DETAILS
====================================================== */

function createCityDetails() {

    createCrates();
    createContainers();
    createDataPylons();
    createRoadBarriers();
}

/* ======================================================
   CRATES
====================================================== */

function createCrates() {

    const positions = [
        [-10, -20],
        [-13, -22],
        [10, -20],
        [13, -22],
        [-20, 10],
        [20, 10]
    ];

    positions.forEach(
        ([x, z]) => {

            const geometry =
                new THREE.BoxGeometry(
                    2.5,
                    2.5,
                    2.5
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color: 0x12141a,
                    metalness: 0.6,
                    roughness: 0.6
                });

            const crate =
                new THREE.Mesh(
                    geometry,
                    material
                );

            crate.position.set(
                x,
                1.25,
                z
            );

            crate.rotation.y =
                Math.random() * Math.PI;

            crate.castShadow = true;

            arenaState.cityGroup.add(crate);
        }
    );
}

/* ======================================================
   CONTAINERS
====================================================== */

function createContainers() {

    const positions = [
        [-25, -7],
        [-25, -11],
        [25, 7],
        [25, 11]
    ];

    positions.forEach(
        ([x, z], index) => {

            const geometry =
                new THREE.BoxGeometry(
                    9,
                    3.5,
                    3
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color:
                        index % 2 === 0
                            ? 0x11131b
                            : 0x181019,

                    metalness: 0.65,
                    roughness: 0.55
                });

            const container =
                new THREE.Mesh(
                    geometry,
                    material
                );

            container.position.set(
                x,
                1.75,
                z
            );

            container.castShadow = true;

            arenaState.cityGroup.add(container);

            createContainerLines(
                container
            );
        }
    );
}

/* ======================================================
   CONTAINER NEON LINES
====================================================== */

function createContainerLines(
    container
) {

    const geometry =
        new THREE.BoxGeometry(
            9.1,
            0.06,
            0.08
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: ARENA_CONFIG.colors.red
        });

    const line =
        new THREE.Mesh(
            geometry,
            material
        );

    line.position.y =
        1.0;

    container.add(line);
}

/* ======================================================
   DATA PYLONS
====================================================== */

function createDataPylons() {

    const positions = [
        [-8, -8],
        [8, -8],
        [-8, 8],
        [8, 8]
    ];

    positions.forEach(
        ([x, z]) => {

            const group =
                new THREE.Group();

            const baseGeometry =
                new THREE.CylinderGeometry(
                    0.8,
                    1,
                    0.4,
                    12
                );

            const baseMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0x151820,
                    metalness: 0.8,
                    roughness: 0.3
                });

            const base =
                new THREE.Mesh(
                    baseGeometry,
                    baseMaterial
                );

            base.position.y =
                0.2;

            group.add(base);

            const coreGeometry =
                new THREE.CylinderGeometry(
                    0.22,
                    0.22,
                    3,
                    12
                );

            const coreMaterial =
                new THREE.MeshBasicMaterial({
                    color:
                        ARENA_CONFIG.colors.red
                });

            const core =
                new THREE.Mesh(
                    coreGeometry,
                    coreMaterial
                );

            core.position.y =
                1.8;

            group.add(core);

            group.position.set(
                x,
                0,
                z
            );

            arenaState.cityGroup.add(group);
        }
    );
}

/* ======================================================
   ROAD BARRIERS
====================================================== */

function createRoadBarriers() {

    const positions = [
        [-16, 15],
        [16, -15],
        [-15, -16],
        [15, 16]
    ];

    positions.forEach(
        ([x, z]) => {

            const geometry =
                new THREE.BoxGeometry(
                    4,
                    0.8,
                    0.5
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color: 0x15161c,
                    metalness: 0.7
                });

            const barrier =
                new THREE.Mesh(
                    geometry,
                    material
                );

            barrier.position.set(
                x,
                0.4,
                z
            );

            arenaState.cityGroup.add(
                barrier
            );

            createBarrierLight(
                barrier
            );
        }
    );
}

/* ======================================================
   BARRIER LIGHT
====================================================== */

function createBarrierLight(
    barrier
) {

    const geometry =
        new THREE.BoxGeometry(
            0.15,
            0.15,
            0.15
        );

    const material =
        new THREE.MeshBasicMaterial({
            color:
                ARENA_CONFIG.colors.red
        });

    for (
        let x = -1.5;
        x <= 1.5;
        x += 1
    ) {

        const light =
            new THREE.Mesh(
                geometry,
                material
            );

        light.position.x = x;

        barrier.add(light);
    }
}

/* ======================================================
   HOLOGRAM STRUCTURES
====================================================== */

function createHologramStructures() {

    const positions = [
        [-65, -65],
        [65, -65],
        [-65, 65],
        [65, 65]
    ];

    positions.forEach(
        ([x, z]) => {

            const geometry =
                new THREE.CylinderGeometry(
                    3,
                    3,
                    0.2,
                    32
                );

            const material =
                new THREE.MeshBasicMaterial({
                    color: ARENA_CONFIG.colors.red,
                    transparent: true,
                    opacity: 0.45
                });

            const platform =
                new THREE.Mesh(
                    geometry,
                    material
                );

            platform.position.set(
                x,
                0.15,
                z
            );

            arenaState.cityGroup.add(
                platform
            );

            createHologramRing(
                x,
                z
            );
        }
    );
}

/* ======================================================
   HOLOGRAM RING
====================================================== */

function createHologramRing(
    x,
    z
) {

    const geometry =
        new THREE.TorusGeometry(
            3.2,
            0.08,
            8,
            32
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: ARENA_CONFIG.colors.red
        });

    const ring =
        new THREE.Mesh(
            geometry,
            material
        );

    ring.position.set(
        x,
        0.4,
        z
    );

    ring.rotation.x =
        Math.PI / 2;

    arenaState.cityGroup.add(
        ring
    );
}

/* ======================================================
   SKYLINE
====================================================== */

function createSkyline() {

    const positions = [
        [-82, -75],
        [-70, -78],
        [72, -80],
        [83, -70],
        [-80, 75],
        [-68, 82],
        [70, 78],
        [82, 70]
    ];

    positions.forEach(
        ([x, z], index) => {

            const width =
                8 + Math.random() * 8;

            const depth =
                8 + Math.random() * 8;

            const height =
                15 + Math.random() * 35;

            const geometry =
                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                );

            const material =
                new THREE.MeshStandardMaterial({
                    color: 0x080a10,
                    metalness: 0.65,
                    roughness: 0.6
                });

            const building =
                new THREE.Mesh(
                    geometry,
                    material
                );

            building.position.set(
                x,
                height / 2,
                z
            );

            arenaState.cityGroup.add(
                building
            );

            createSkylineLights(
                building,
                width,
                height,
                depth,
                index
            );
        }
    );
}

/* ======================================================
   SKYLINE LIGHTS
====================================================== */

function createSkylineLights(
    building,
    width,
    height,
    depth,
    index
) {

    const material =
        new THREE.MeshBasicMaterial({
            color:
                index % 2 === 0
                    ? ARENA_CONFIG.colors.red
                    : 0x9e1033
        });

    const floors =
        Math.max(
            2,
            Math.floor(height / 5)
        );

    for (
        let i = 0;
        i < floors;
        i++
    ) {

        const geometry =
            new THREE.BoxGeometry(
                width * 0.6,
                0.08,
                0.08
            );

        const line =
            new THREE.Mesh(
                geometry,
                material
            );

        line.position.set(
            0,
            -height / 2 + 3 + i * 5,
            depth / 2 + 0.05
        );

        building.add(line);
    }
}

/* ======================================================
   FIND BUILDING
====================================================== */

export function getBuildingByLevel(
    level
) {

    return arenaState.buildings.find(
        building =>
            building.id === level
    );
}

/* ======================================================
   SET BUILDING VISIBILITY
====================================================== */

export function setBuildingUnlocked(
    level,
    unlocked
) {

    const building =
        getBuildingByLevel(level);

    if (!building) return;

    building.object.userData.unlocked =
        unlocked;

    building.object.traverse(
        object => {

            if (!object.material) return;

            if (
                object.material.emissive
            ) {

                object.material.emissiveIntensity =
                    unlocked ? 0.3 : 0.05;
            }
        }
    );
}

/* ======================================================
   ARENA UPDATE
====================================================== */

export function updateCyberCity(
    delta,
    elapsed
) {

    if (!arenaState.initialized) {
        return;
    }

    /*
       Subtle pulsing neon effect
    */

    arenaState.lights.forEach(
        (light, index) => {

            light.intensity =
                1.2 +
                Math.sin(
                    elapsed * 2 + index
                ) * 0.35;
        }
    );
}

/* ======================================================
   CLEANUP
====================================================== */

export function destroyCyberCity() {

    if (
        arenaState.scene &&
        arenaState.cityGroup
    ) {

        arenaState.scene.remove(
            arenaState.cityGroup
        );
    }

    arenaState.cityGroup = null;
    arenaState.buildings = [];
    arenaState.roads = [];
    arenaState.lights = [];
    arenaState.initialized = false;
}

/* ======================================================
   EXPORT STATE
====================================================== */

export {
    arenaState,
    ARENA_CONFIG
};
```
