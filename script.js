/**
 * CYBERHUNT FULL PRODUCTION STEALTH ENGINE
 * Handles Cinematic 10s Loader, UnrealBloom Composers, Core Movement Engine,
 * Interaction Detection Matrices, Enemy AI, and multi-level progression arrays.
 */

// Global System Instantiations
let scene, camera, renderer, composer, particleSystem, gridHelper;
let mouseX = 0, mouseY = 0;

// Game Logic Data
let currentLevel = 1;
const totalLevels = 7;
let playerHP = 100;
let isTerminalDecrypted = false;

// 3D Gameplay Elements
let playerMesh = null;
let enemies = [];
let terminalNodeMesh = null;
let targetTerminalPos = new THREE.Vector3(0, -3.5, -15);

// Input Tracking Configurations
let keysPressed = { w: false, a: false, s: false, d: false };
const playerSpeed = 0.35;

document.addEventListener("DOMContentLoaded", () => {
    runCinematicIntroEngine();
});

// ==========================================================================
// Phase 1: 10-Second Boot System Sequence
// ==========================================================================
function runCinematicIntroEngine() {
    const feed = document.getElementById('terminal-feed');
    const fill = document.getElementById('intro-fill');
    const percentDisplay = document.getElementById('load-percentage');
    const statusText = document.getElementById('load-status');
    const introDuration = 10000; // Complete 10s Runtime Benchmark
    
    const logs = [
        "PARSING SECURITY NODES...", "BYPASSING FIREWALL INTRUSIONS...",
        "MOUNTING CYBERHUNT SIMULATION DECK...", "HOOKING INJECTED THREE.JS GRAPHICS...",
        "STATUS: ISOMETRIC GRID CACHE STABLE", "COMPILING MODEL ASSET LOADERS...",
        "CONFIGURING UNREALBLOOM POST-PROCESSING...", "SPAWNING RED-SECTOR ENEMY ENTIRES..."
    ];
    
    let logIdx = 0;
    const feedTimer = setInterval(() => {
        if(logIdx < logs.length) {
            const row = document.createElement('div');
            row.innerText = `>> ${logs[logIdx]}`;
            feed.appendChild(row);
            feed.scrollTop = feed.scrollHeight;
            logIdx++;
        }
    }, 900);

    let startTimestamp = null;
    function updateLoader(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progressionRatio = Math.min(elapsed / introDuration, 1);
        const activePct = Math.floor(progressionRatio * 100);
        
        percentDisplay.innerText = `${activePct.toString().padStart(2, '0')}%`;
        fill.style.width = `${activePct}%`;

        if(activePct < 30) statusText.innerText = "ACCESSING COMPROMISED VAULTS...";
        else if(activePct < 65) statusText.innerText = "OVERRIDING ENEMY RADAR CHANNELS...";
        else if(activePct < 90) statusText.innerText = "SYNCING TACTICAL HEADS-UP DISPLAY...";
        else statusText.innerText = "SIMULATION ENGINE ENGAGED.";

        if (elapsed < introDuration) {
            requestAnimationFrame(updateLoader);
        } else {
            clearInterval(feedTimer);
            transitionToLiveSimulation();
        }
    }
    requestAnimationFrame(updateLoader);
}

function transitionToLiveSimulation() {
    document.getElementById('cinematic-intro').classList.add('fade-out');
    document.getElementById('main-hud').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('cinematic-intro').remove();
        initWebGLGameContainer();
        initGameplayListeners();
        animateMasterEngineLoop();
    }, 1000);
}

// ==========================================================================
// Phase 2: WebGL 3D Tactical Core Initialization
// ==========================================================================
function initWebGLGameContainer() {
    const canvasContainer = document.getElementById('threejs-canvas').parentElement;
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020305);
    scene.fog = new THREE.FogExp2(0x020305, 0.015);

    // Cinematic Isometric-vibe Camera configuration
    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 1000);
    camera.position.set(0, 22, 32);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs-canvas'), antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;

    // Floor Grid Setup (Valorant Neon Grid Styling)
    gridHelper = new THREE.GridHelper(120, 45, 0xff0055, 0x0f1522);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Tactical Scene Lighting Arrays
    const ambLight = new THREE.AmbientLight(0x0a111e, 1.0);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0x00f5d4, 1.2);
    dirLight.position.set(20, 40, 10);
    scene.add(dirLight);

    // Interactive Core Key Objective Mesh (Glowing Cyan Cyber Terminal Box)
    const termGeom = new THREE.BoxGeometry(3, 3, 3);
    const termMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4, wireframe: true });
    terminalNodeMesh = new THREE.Mesh(termGeom, termMat);
    terminalNodeMesh.position.copy(targetTerminalPos);
    scene.add(terminalNodeMesh);

    // PLAYER OBJECT GENERATOR CONFIGURATION (Your Three.js placeholder to override with model instances)
    const pGeom = new THREE.CylinderGeometry(1, 1, 4, 6);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 });
    playerMesh = new THREE.Mesh(pGeom, pMat);
    playerMesh.position.set(0, -3, 10); // Start in foreground space
    scene.add(playerMesh);

    // Particle FX Engine setup
    initParticleEngine();
    
    // Build initial level threats
    spawnLevelThreats();

    // UnrealBloom Glow Composer Compositing Configuration
    const renderPass = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 1.7, 0.45, 0.08);
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
}

function initParticleEngine() {
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for(let i=0; i<count*3; i+=3) {
        positions[i] = (Math.random() - 0.5) * 90;
        positions[i+1] = Math.random() * 50 - 5;
        positions[i+2] = (Math.random() - 0.5) * 90;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x00f5d4, size: 0.25, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    particleSystem = new THREE.Points(geometry, mat);
    scene.add(particleSystem);
}

function spawnLevelThreats() {
    // Clear out old nodes
    enemies.forEach(e => scene.remove(e.mesh));
    enemies = [];

    // Scale guard count based on current level progress limits
    const threatCount = 2 + currentLevel; 
    for(let i=0; i < threatCount; i++) {
        const eGeom = new THREE.BoxGeometry(2, 4, 2);
        const eMat = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0x330011 });
        const mesh = new THREE.Mesh(eGeom, eMat);
        
        // Distribute positions dynamically
        mesh.position.set(
            (Math.random() - 0.5) * 50,
            -3,
            -10 - (Math.random() * 30)
        );
        scene.add(mesh);

        enemies.push({
            mesh: mesh,
            dir: Math.random() > 0.5 ? 1 : -1,
            range: 10 + Math.random() * 15,
            startX: mesh.position.x
        });
    }
    document.getElementById('guard-status-count').innerText = `${enemies.length} ALIVE`;
}

// ==========================================================================
// Phase 3: Interactive Inputs & Game Logic Engine
// ==========================================================================
function initGameplayListeners() {
    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k in keysPressed) keysPressed[k] = true;
        
        // E Interactivity action hook
        if (k === 'e' && !document.getElementById('action-prompt').classList.contains('hidden')) {
            decryptMatrixObjective();
        }
    });

    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k in keysPressed) keysPressed[k] = false;
    });

    window.addEventListener('click', () => {
        fireActiveWeaponRaycast();
    });
    
    window.addEventListener('resize', handleWindowResize);
}

function processPlayerStealthControls() {
    if (!playerMesh) return;

    if (keysPressed.w) playerMesh.position.z -= playerSpeed;
    if (keysPressed.s) playerMesh.position.z += playerSpeed;
    if (keysPressed.a) playerMesh.position.x -= playerSpeed;
    if (keysPressed.d) playerMesh.position.x += playerSpeed;

    // Constrain boundaries within visual helper grids
    playerMesh.position.x = Math.max(Math.min(playerMesh.position.x, 50), -50);
    playerMesh.position.z = Math.max(Math.min(playerMesh.position.z, 50), -50);

    // Keep isometric rendering camera smoothly tracked to coordinate points
    camera.position.x += (playerMesh.position.x - camera.position.x) * 0.05;
    camera.position.z += ((playerMesh.position.z + 32) - camera.position.z) * 0.05;
    camera.lookAt(playerMesh.position.x, playerMesh.position.y + 2, playerMesh.position.z);

    // Matrix node proximity evaluations
    const distToObjective = playerMesh.position.distanceTo(terminalNodeMesh.position);
    if(distToObjective < 6 && !isTerminalDecrypted) {
        document.getElementById('action-prompt').classList.remove('hidden');
    } else {
        document.getElementById('action-prompt').classList.add('hidden');
    }
}

function processEnemyAIMatrix() {
    enemies.forEach(enemy => {
/ Linear path pacing loop mechanicsenemy.mesh.position.x += 0.08 * enemy.dir;if(Math.abs(enemy.mesh.position.x - enemy.startX) > enemy.range) {enemy.dir *= -1; // Reverse course direction}// Raycast field-of-view alert loop check (Is player spotted?)if(playerMesh) {const dist = enemy.mesh.position.distanceTo(playerMesh.position);if(dist < 8) { // Security Detection Radius limit parametersdeductPlayerHealthPoints(0.5); // Damage tick over tracking updates}}});}function fireActiveWeaponRaycast() {const ammoNode = document.getElementById('current-ammo');let count = parseInt(ammoNode.innerText);if(count <= 0) {console.warn("[WEAPON STACK]: MAG EMPTY. ENGINE REBOOT REQUIRED.");return;}// Decrement valuesammoNode.innerText = count - 1;triggerVFX(); // Expand lens bloom flares momentarily// Core Raycast Calculation Layer: Target nearest enemy guard in front alignment rangeif(enemies.length > 0 && playerMesh) {for(let i = enemies.length - 1; i >= 0; i--) {let enemyDistance = playerMesh.position.distanceTo(enemies[i].mesh.mesh.position);if(enemyDistance < 18) { // Effective shooting radius footprintscene.remove(enemies[i].mesh.mesh);enemies.splice(i, 1);break; // Target single entity per registration frame click}}document.getElementById('guard-status-count').innerText = ${enemies.length} ALIVE;checkLevelProgressionConditions();}}function decryptMatrixObjective() {const btn = document.getElementById('decrypt-btn');btn.innerText = "BYPASSING PROTOCOLS...";btn.style.pointerEvents = "none";composer.passes[1].strength = 4.5; // Flash glow intensity spikessetTimeout(() => {isTerminalDecrypted = true;btn.innerText = "DECRYPT COMPLETE";composer.passes[1].strength = 1.7; // Restore rendering variablesdocument.getElementById('obj-1').className = "completed";document.getElementById('obj-1').querySelector('.status').innerText = "SUCCESS";terminalNodeMesh.material.color.setHex(0xff0055); // Change core to red hacked statecheckLevelProgressionConditions();}, 1500);}function checkLevelProgressionConditions() {// Advancement rule parameters: Decryption complete AND all sector threats dropped to zeroif(isTerminalDecrypted && enemies.length === 0) {if(currentLevel < totalLevels) {currentLevel++;advanceToNextProgressiveSector();} else {alert("✨ OPERATION COMPLETE: STEALTH MASTER SECURED SYSTEM INTEGRITY EXTREME! ✨");resetCurrentSimulation();}}}function advanceToNextProgressiveSector() {isTerminalDecrypted = false;// Manage level visual selectors states dynamically in DOM matrixdocument.getElementById('level-display-tracker').innerText = LEVEL ${currentLevel}/${totalLevels};// Reset buttons configurationsconst btn = document.getElementById('decrypt-btn');btn.innerText = "BYPASS SECURE NODE";btn.style.pointerEvents = "auto";// Reset base structural layout task valuesconst obj1 = document.getElementById('obj-1');obj1.className = "pending";obj1.querySelector('.status').innerText = "PENDING";terminalNodeMesh.material.color.setHex(0x00f5d4);// Relocate interactive targets further down map limits to escalate complexity mapstargetTerminalPos.z -= 5;terminalNodeMesh.position.copy(targetTerminalPos);if(playerMesh) playerMesh.position.set(0, -3, 15); // Return tracking point back safely// Light up progression matrix cards indicatorsif(currentLevel <= 5) {const nextCard = document.getElementById(card-lvl-${currentLevel});if(nextCard) {nextCard.classList.remove('locked');nextCard.classList.add('active');}}spawnLevelThreats();console.log([CORE PROCESSOR]: Shifted operational architecture to Level Block: ${currentLevel});}function deductPlayerHealthPoints(amt) {playerHP = Math.max(playerHP - amt, 0);document.getElementById('hp-bar-element').style.width = ${playerHP}%;document.getElementById('hp-numeric-display').innerText = ${Math.ceil(playerHP)}/100;if(playerHP <= 0) {alert("❌ CRITICAL INTRUSION INTRUPT // STEALTH MASTER DEFEATED. REDEPLOYING. ❌");resetCurrentSimulation();}}function resetCurrentSimulation() {playerHP = 100;currentLevel = 1;isTerminalDecrypted = false;targetTerminalPos.set(0, -3.5, -15);if(playerMesh) playerMesh.position.set(0, -3, 10);if(terminalNodeMesh) {terminalNodeMesh.position.copy(targetTerminalPos);terminalNodeMesh.material.color.setHex(0x00f5d4);}// Reset task interfaces markersdocument.getElementById('level-display-tracker').innerText = LEVEL 1/${totalLevels};document.getElementById('current-ammo').innerText = "15";document.getElementById('hp-bar-element').style.width = "100%";document.getElementById('hp-numeric-display').innerText = "100/100";const obj1 = document.getElementById('obj-1');obj1.className = "pending";obj1.querySelector('.status').innerText = "PENDING";const btn = document.getElementById('decrypt-btn');btn.innerText = "BYPASS SECURE NODE";btn.style.pointerEvents = "auto";// Re-lock progression indicator bars interfacesfor(let i=2; i<=5; i++) {const c = document.getElementById(card-lvl-${i});if(c) { c.className = "level-card locked"; }}spawnLevelThreats();}// ==========================================================================// Phase 4: Ambient Core FX Engineering Mechanics Loops// ==========================================================================function animateMasterEngineLoop() {requestAnimationFrame(animateMasterEngineLoop);// Compute actions frames updatesprocessPlayerStealthControls();processEnemyAIMatrix();// Constant rotation updates on key interactive nodes anchorsif (terminalNodeMesh) {terminalNodeMesh.rotation.x += 0.01;terminalNodeMesh.rotation.y += 0.015;}// Handle downward movement arrays processing inside particle arrays matrixif (particleSystem) {const pts = particleSystem.geometry.attributes.position.array;for (let i = 1; i < pts.length; i += 3) {pts[i] -= 0.2; // Velocity scalar limits matching ambient aestheticsif (pts[i] < -5) pts[i] = 45; // Relocate heights bounds loop thresholds}particleSystem.geometry.attributes.position.needsUpdate = true;}if(gridHelper) gridHelper.rotation.y += 0.0005;// Route rendering output sequence fields out directly via bloom composer paths pipelineif (composer) {composer.render();}}function triggerVFX() {if(!composer) return;composer.passes[1].strength = 3.8;setTimeout(() => { if(composer) composer.passes[1].strength = 1.7; }, 120);}function handleWindowResize() {const c = document.getElementById('threejs-canvas');if (!c) return;const w = c.parentElement.clientWidth;const h = c.parentElement.clientHeight;camera.aspect = w / h;camera.updateProjectionMatrix();renderer.setSize(w, h);composer.setSize(w, h);}
---

### 🕹️ How Your Three.js Character Models Connect:
To hook your custom **`.gltf`** or **`.glb`** models directly into this engine:
1. Put your character files inside the same folder as your code (e.g., `character.glb`).
2. Search for the text `// PLAYER OBJECT GENERATOR CONFIGURATION` inside your **`script.js`**.
3. Replace that code block with this snippet to substitute the generic capsule with your custom model asset:

```javascript
const loader = new THREE.GLTFLoader();
loader.load('character.glb', (gltf) => {
    playerMesh = gltf.scene;
    playerMesh.position.set(0, -3, 10);
    playerMesh.scale.set(2, 2, 2); // Adjust dimensions scale matching grids
    scene.add(playerMesh);
});
                    
