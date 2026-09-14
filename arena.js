// 3D Scene Global Variables
let scene, camera, renderer, raycaster, mouse;
let roomObjects = [];
let passcodeTarget = "4821";
let gatheredDigits = ["_", "_", "_", "_"];

// Character Models
let playerBoy, playerGirl, enemyModel;

function init3DArena() {
    const canvas = document.getElementById('game-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050002, 0.04);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 6); // Eye-level view

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Cyberpunk Neon Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff003c, 3, 25);
    redLight.position.set(0, 5, 0);
    redLight.castShadow = true;
    scene.add(redLight);

    // Build Room & Load Models
    buildProceduralRoom();
    loadCharacterModels();

    // Interactivity Controls
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onObjectClick);
    window.addEventListener('resize', onWindowResize);

    animate();
}

// 1. DYNAMICALLY BUILD 3D ESCAPE ROOM (No room .glb needed)
function buildProceduralRoom() {
    // Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0xff003c, 0x220008);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Dark Metallic Walls
    const wallMat = new THREE.MeshStandardMaterial({ 
        color: 0x0a0a10, 
        roughness: 0.6,
        metalness: 0.8 
    });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.5), wallMat);
    backWall.position.set(0, 5, -15);
    scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 30), wallMat);
    leftWall.position.set(-15, 5, 0);
    scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 30), wallMat);
    rightWall.position.set(15, 5, 0);
    scene.add(rightWall);

    // Interactive Workstation Desk (Contains USB Clue)
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xff003c, emissive: 0x33000f });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.5), deskMat);
    desk.position.set(-6, 0.6, -8);
    desk.userData = { 
        type: 'clue', 
        digit: '4', 
        index: 0, 
        text: 'Decrypted Workstation! Passcode Digit 1 is 4' 
    };
    scene.add(desk);
    roomObjects.push(desk);

    // Exit Door with Keypad Access
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 0.3), doorMat);
    exitDoor.position.set(0, 3.5, -14.8);
    exitDoor.userData = { type: 'exit' };
    scene.add(exitDoor);
    roomObjects.push(exitDoor);
}

// 2. LOAD YOUR EXACT GITHUB 3D MODELS
function loadCharacterModels() {
    const loader = new THREE.GLTFLoader();

    // Load Boy Agent
    loader.load('assets/boy-agent.glb', (gltf) => {
        playerBoy = gltf.scene;
        playerBoy.position.set(-2, 0, -3);
        playerBoy.scale.set(1, 1, 1);
        scene.add(playerBoy);
    }, undefined, (err) => console.log("Make sure assets/boy-agent.glb exists on GitHub"));

    // Load Girl Agent
    loader.load('assets/girl-agent.glb', (gltf) => {
        playerGirl = gltf.scene;
        playerGirl.position.set(2, 0, -3);
        playerGirl.scale.set(1, 1, 1);
        scene.add(playerGirl);
    }, undefined, (err) => console.log("Make sure assets/girl-agent.glb exists on GitHub"));

    // Load Enemy Model
    loader.load('assets/enemy.glb', (gltf) => {
        enemyModel = gltf.scene;
        enemyModel.position.set(0, 0, -9);
        enemyModel.scale.set(1, 1, 1);

        // Make Enemy interactive for threat elimination
        enemyModel.traverse((child) => {
            if (child.isMesh) {
                child.userData = { 
                    type: 'threat', 
                    digit: '8', 
                    index: 1, 
                    text: 'Enemy Threat Eliminated! Passcode Digit 2 unlocked: 8' 
                };
                roomObjects.push(child);
            }
        });

        scene.add(enemyModel);
    }, undefined, (err) => console.log("Make sure assets/enemy.glb exists on GitHub"));
}

// 3. RAYCASTING (CLICK TO INTERACT WITH MODELS & OBJECTS)
function onObjectClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(roomObjects, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.type && obj.parent.type !== "Scene") {
            obj = obj.parent;
        }

        if (obj.userData.type === 'clue' || obj.userData.type === 'threat') {
            triggerClue(obj.userData.text, obj.userData.digit, obj.userData.index);
        } else if (obj.userData.type === 'exit') {
            openKeypad();
        }
    }
}

// 4. ANIMATION LOOP
function animate() {
    requestAnimationFrame(animate);

    // Rotate enemy model slightly for visual aura effect
    if (enemyModel) {
        enemyModel.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
