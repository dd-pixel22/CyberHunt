```javascript
/* =========================================================
   CYBERHUNT
   3D CYBER CITY / ESCAPE ROOM ARENA
   ========================================================= */

import * as THREE from "three";

const CITY = {
    size: 180,

    colors: {
        ground: 0x030305,
        road: 0x07070b,
        building: 0x08090d,
        red: 0xff1744,
        darkRed: 0x7e0d29,
        window: 0x8e102d
    }
};

const arenaState = {
    scene: null,
    city: null,
    buildings: [],
    neonLights: [],
    initialized: false
};

/* =========================================================
   CREATE CITY
========================================================= */

export function createCyberCity(scene) {

    arenaState.scene = scene;

    if (arenaState.city) {
        scene.remove(arenaState.city);
    }

    arenaState.city =
        new THREE.Group();

    arenaState.city.name =
        "CYBER_CITY";

    arenaState.buildings = [];
    arenaState.neonLights = [];

    scene.add(
        arenaState.city
    );

    createGround();
    createRoads();
    createBuildings();
    createStreetLights();
    createCityDetails();

    arenaState.initialized = true;

    return arenaState.city;
}

/* =========================================================
   GROUND
========================================================= */

function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            CITY.size,
            CITY.size
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: CITY.colors.ground,
            roughness: 0.88,
            metalness: 0.3
        });

    const ground =
        new THREE.Mesh(
            geometry,
            material
        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.position.y =
        -0.05;

    ground.receiveShadow = true;

    arenaState.city.add(
        ground
    );

    const grid =
        new THREE.GridHelper(
            CITY.size,
            45,
            CITY.colors.darkRed,
            0x15151a
        );

    grid.position.y =
        0.01;

    grid.material.transparent = true;

    grid.material.opacity = 0.24;

    arenaState.city.add(
        grid
    );
}

/* =========================================================
   ROADS
========================================================= */

function createRoads() {

    createRoad(
        0,
        0,
        CITY.size,
        18
    );

    createRoad(
        0,
        0,
        18,
        CITY.size
    );

    createRoad(
        0,
        -45,
        CITY.size,
        9
    );

    createRoad(
        0,
        45,
        CITY.size,
        9
    );

    createRoad(
        -45,
        0,
        9,
        CITY.size
    );

    createRoad(
        45,
        0,
        9,
        CITY.size
    );
}

function createRoad(
    x,
    z,
    width,
    depth
) {

    const geometry =
        new THREE.PlaneGeometry(
            width,
            depth
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: CITY.colors.road,
            roughness: 0.72,
            metalness: 0.5
        });

    const road =
        new THREE.Mesh(
            geometry,
            material
        );

    road.rotation.x =
        -Math.PI / 2;

    road.position.set(
        x,
        0.015,
        z
    );

    arenaState.city.add(
        road
    );

    createRoadLines(
        x,
        z,
        width,
        depth
    );
}

/* =========================================================
   ROAD NEON
========================================================= */

function createRoadLines(
    x,
    z,
    width,
    depth
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: CITY.colors.red
        });

    if (width > depth) {

        const geometry =
            new THREE.PlaneGeometry(
                width,
                0.08
            );

        const line =
            new THREE.Mesh(
                geometry,
                material
            );

        line.rotation.x =
            -Math.PI / 2;

        line.position.set(
            x,
            0.055,
            z
        );

        arenaState.city.add(
            line
        );

    } else {

        const geometry =
            new THREE.PlaneGeometry(
                0.08,
                depth
            );

        const line =
            new THREE.Mesh(
                geometry,
                material
            );

        line.rotation.x =
            -Math.PI / 2;

        line.position.set(
            x,
            0.055,
            z
        );

        arenaState.city.add(
            line
        );
    }
}

/* =========================================================
   FIVE BUILDINGS
========================================================= */

function createBuildings() {

    const data = [

        {
            level: 1,
            name: "DATA VAULT",
            x: -48,
            z: -42,
            width: 28,
            depth: 28,
            height: 30
        },

        {
            level: 2,
            name: "CYBER BANK",
            x: 48,
            z: -42,
            width: 30,
            depth: 28,
            height: 38
        },

        {
            level: 3,
            name: "NEXUS LAB",
            x: -48,
            z: 42,
            width: 28,
            depth: 28,
            height: 34
        },

        {
            level: 4,
            name: "BLACKSITE",
            x: 48,
            z: 42,
            width: 30,
            depth: 28,
            height: 43
        },

        {
            level: 5,
            name: "CYBER CORE",
            x: 0,
            z: -67,
            width: 32,
            depth: 22,
            height: 50
        }

    ];

    data.forEach(
        buildingData => {

            const building =
                createBuilding(
                    buildingData
                );

            arenaState.city.add(
                building
            );

            arenaState.buildings.push(
                {
                    ...buildingData,
                    object: building
                }
            );
        }
    );
}

/* =========================================================
   BUILDING
========================================================= */

function createBuilding(data) {

    const group =
        new THREE.Group();

    group.position.set(
        data.x,
        0,
        data.z
    );

    group.name =
        `BUILDING_${data.level}`;

    /* Main body */

    const bodyGeometry =
        new THREE.BoxGeometry(
            data.width,
            data.height,
            data.depth
        );

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: CITY.colors.building,
            roughness: 0.62,
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

    /* Roof */

    const roof =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                data.width + 1,
                0.8,
                data.depth + 1
            ),
            new THREE.MeshStandardMaterial({
                color: 0x111218,
                roughness: 0.35,
                metalness: 0.85
            })
        );

    roof.position.y =
        data.height + 0.4;

    group.add(roof);

    /* Red vertical edges */

    const edgeMaterial =
        new THREE.MeshBasicMaterial({
            color: CITY.colors.red
        });

    const edgeGeometry =
        new THREE.BoxGeometry(
            0.15,
            data.height,
            0.15
        );

    const corners = [
        [-data.width / 2, -data.depth / 2],
        [data.width / 2, -data.depth / 2],
        [-data.width / 2, data.depth / 2],
        [data.width / 2, data.depth / 2]
    ];

    corners.forEach(
        ([x, z]) => {

            const edge =
                new THREE.Mesh(
                    edgeGeometry,
                    edgeMaterial
                );

            edge.position.set(
                x,
                data.height / 2,
                z
            );

            group.add(edge);
        }
    );

    createWindows(
        group,
        data
    );

    createBuildingEntrance(
        group,
        data
    );

    createBuildingSign(
        group,
        data
    );

    group.userData = {
        level: data.level,
        name: data.name
    };

    return group;
}

/* =========================================================
   WINDOWS
========================================================= */

function createWindows(
    group,
    data
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: CITY.colors.window,
            transparent: true,
            opacity: 0.52
        });

    for (
        let y = 5;
        y < data.height - 2;
        y += 5
    ) {

        for (
            let x = -data.width / 2 + 3;
            x < data.width / 2 - 2;
            x += 4
        ) {

            const window =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.35,
                        1.6,
                        0.05
                    ),
                    material
                );

            window.position.set(
                x,
                y,
                data.depth / 2 + 0.05
            );

            group.add(
                window
            );
        }
    }
}

/* =========================================================
   ENTRANCE
========================================================= */

function createBuildingEntrance(
    group,
    data
) {

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                5,
                6,
                0.3
            ),
            new THREE.MeshStandardMaterial({
                color: 0x020204,
                metalness: 0.9,
                roughness: 0.2
            })
        );

    door.position.set(
        0,
        3,
        data.depth / 2 + 0.2
    );

    group.add(
        door
    );

    const frame =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                5.5,
                6.5,
                0.15
            ),
            new THREE.MeshBasicMaterial({
                color: CITY.colors.red,
                wireframe: true
            })
        );

    frame.position.set(
        0,
        3,
        data.depth / 2 + 0.4
    );

    group.add(
        frame
    );
}

/* =========================================================
   BUILDING SIGN
========================================================= */

function createBuildingSign(
    group,
    data
) {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 900;
    canvas.height = 220;

    const context =
        canvas.getContext("2d");

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.font =
        "bold 68px Arial";

    context.textAlign =
        "center";

    context.textBaseline =
        "middle";

    context.fillStyle =
        "#ffffff";

    context.shadowColor =
        "#ff1744";

    context.shadowBlur =
        22;

    context.fillText(
        data.name,
        450,
        110
    );

    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    const sprite =
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: texture,
                transparent: true
            })
        );

    sprite.scale.set(
        11,
        2.7,
        1
    );

    sprite.position.set(
        0,
        data.height * 0.68,
        data.depth / 2 + 0.8
    );

    group.add(
        sprite
    );
}

/* =========================================================
   STREET LIGHTS
========================================================= */

function createStreetLights() {

    const positions = [

        [-20, -12],
        [20, -12],

        [-20, 12],
        [20, 12],

        [-67, 0],
        [67, 0],

        [-12, -67],
        [12, -67]

    ];

    positions.forEach(
        ([x, z]) => {

            const light =
                createStreetLight();

            light.position.set(
                x,
                0,
                z
            );

            arenaState.city.add(
                light
            );
        }
    );
}

function createStreetLight() {

    const group =
        new THREE.Group();

    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.1,
                0.16,
                6,
                8
            ),
            new THREE.MeshStandardMaterial({
                color: 0x1b1c22,
                metalness: 0.85,
                roughness: 0.3
            })
        );

    pole.position.y = 3;

    group.add(
        pole
    );

    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.23,
                12,
                12
            ),
            new THREE.MeshBasicMaterial({
                color: CITY.colors.red
            })
        );

    bulb.position.y = 6;

    group.add(
        bulb
    );

    const light =
        new THREE.PointLight(
            CITY.colors.red,
            1.7,
            15
        );

    light.position.y = 6;

    group.add(
        light
    );

    arenaState.neonLights.push(
        light
    );

    return group;
}

/* =========================================================
   CITY DETAILS
========================================================= */

function createCityDetails() {

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const crate =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.3,
                    2.3,
                    2.3
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x101117,
                    metalness: 0.7,
                    roughness: 0.55
                })
            );

        crate.position.set(
            THREE.MathUtils.randFloat(
                -25,
                25
            ),
            1.15,
            THREE.MathUtils.randFloat(
                -25,
                25
            )
        );

        crate.rotation.y =
            Math.random() *
            Math.PI;

        crate.castShadow = true;

        arenaState.city.add(
            crate
        );
    }

    createHologram(
        -70,
        -70
    );

    createHologram(
        70,
        -70
    );

    createHologram(
        -70,
        70
    );

    createHologram(
        70,
        70
    );
}

/* =========================================================
   HOLOGRAM
========================================================= */

function createHologram(
    x,
    z
) {

    const group =
        new THREE.Group();

    const platform =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                3,
                3,
                0.2,
                32
            ),
            new THREE.MeshBasicMaterial({
                color: CITY.colors.red,
                transparent: true,
                opacity: 0.4
            })
        );

    platform.position.y =
        0.15;

    group.add(
        platform
    );

    const ring =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                3.3,
                0.08,
                8,
                32
            ),
            new THREE.MeshBasicMaterial({
                color: CITY.colors.red
            })
        );

    ring.rotation.x =
        Math.PI / 2;

    ring.position.y =
        0.4;

    group.add(
        ring
    );

    group.position.set(
        x,
        0,
        z
    );

    arenaState.city.add(
        group
    );
}

/* =========================================================
   GET BUILDING
========================================================= */

export function getBuilding(
    level
) {

    return arenaState.buildings.find(
        building =>
            building.level === level
    );
}

/* =========================================================
   UPDATE CITY
========================================================= */

export function updateCyberCity(
    elapsed
) {

    if (
        !arenaState.initialized
    ) {
        return;
    }

    arenaState.neonLights.forEach(
        (light, index) => {

            light.intensity =
                1.5 +
                Math.sin(
                    elapsed * 2 +
                    index
                ) * 0.3;
        }
    );
}

/* =========================================================
   DESTROY
========================================================= */

export function destroyCyberCity() {

    if (
        arenaState.scene &&
        arenaState.city
    ) {

        arenaState.scene.remove(
            arenaState.city
        );
    }

    arenaState.city = null;
    arenaState.buildings = [];
    arenaState.neonLights = [];
    arenaState.initialized = false;
}
```
