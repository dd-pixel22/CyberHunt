// 3D Scene Global Variables
let scene, camera, renderer, raycaster, mouse;
let roomObjects = [];
let passcodeTarget = "4821";
let gatheredDigits = ["_", "_", "_", "_"];

function init3DArena() {
    const canvas = document.getElementById('game-canvas');
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050002, 0.05);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5); // Eye level position

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Dynamic Crimson/Neon Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff003c, 2, 20);
    redLight.position.set(0, 4, 0);
    scene.add(redLight);

    // Environment Construction (Escape Room Base)
    buildRoomFrame();
    populateInteractiveObjects();
    loadCharacterModels();

    // Event Listeners for Raycasting (Interactivity)
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onObjectClick);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function buildRoomFrame() {
    // Cyber Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0xff003c, 0x220008);
    scene.add(gridHelper);

    // Room Walls
    const wallGeo = new THREE.BoxGeometry(20, 10, 0.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8 });

    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 5, -10);
    scene.add(backWall);
}

function populateInteractiveObjects() {
    // 1. USB Drive Clue Object
    const usbGeo = new THREE.BoxGeometry(0.4, 0.2, 0.8);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.5 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-3, 1, -4);
    usb.userData = { type: 'clue', digit: '4', index: 0, text: 'Decrypted Malware log: First passcode digit is 4' };
    scene.add(usb);
    roomObjects.push(usb);

    // 2. Cyber Threat Terminal
    const termGeo = new THREE.BoxGeometry(1.5, 2, 0.5);
    const termMat = new THREE.MeshStandardMaterial({ color: 0xff003c, emissive: 0x5a0016 });
    const terminal = new THREE.Mesh(termGeo, termMat);
    terminal.position.set(3, 1.5, -6);
    terminal.userData = { type: 'threat', digit: '8', index: 1, text: 'Ransomware Purged! Recovered passcode digit: 8' };
    scene.add(terminal);
    roomObjects.push(terminal);

    // 3. Exit Door with Keypad
    const doorGeo = new THREE.BoxGeometry(3, 6, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const exitDoor = new THREE.Mesh(doorGeo, doorMat);
    exitDoor.position.set(0, 3, -9.8);
    exitDoor.userData = { type: 'exit' };
    scene.add(exitDoor);
    roomObjects.push(exitDoor);
}

function loadCharacterModels() {
    const loader = new THREE.GLTFLoader();

    /* 
       Replace placeholder paths with your actual 3D model files (.gltf or .glb)
       Example: loader.load('assets/agent_boy.glb', (gltf) => { scene.add(gltf.scene); });
    */
    
    // Placeholder Mesh Visualizers for Boy/Girl/Enemy until models load
    const agentBoy = createPlaceholderCapsule(0x00f0ff, -1, 1, -2); // Player Boy Agent
    const enemy = createPlaceholderCapsule(0xff003c, 2, 1, -5);     // Enemy Threat
}

function createPlaceholderCapsule(color, x, y, z) {
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16);
    const mat = new THREE.MeshStandardMaterial({ color: color, wireframe: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
}

function onObjectClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(roomObjects);

    if (intersects.length > 0) {
        const obj = intersects[0].object;

        if (obj.userData.type === 'clue' || obj.userData.type === 'threat') {
            triggerClue(obj.userData.text, obj.userData.digit, obj.userData.index);
        } else if (obj.userData.type === 'exit') {
            openKeypad();
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    // Subtle rotation animations for objects to heighten AAA effect
    roomObjects.forEach(obj => {
        if(obj.userData.type === 'clue') obj.rotation.y += 0.02;
    });
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
