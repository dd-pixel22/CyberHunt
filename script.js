// GLOBAL GAME STATE
let activeMission = 1;
let selectedOperative = "RAVEN";
let selectedWeapon = "NIGHTFALL";

let evidenceLooted = false;
let guardsEliminated = 0;
let doorUnlocked = false;
let terminalThreatCleared = false;

let keypadInput = "";
const TARGET_KEYPAD_CODE = "4430";

// THREE.JS SYSTEM VARIABLES
let scene, camera, renderer;
let player, evidenceDesk, doorMesh, terminalDesk;
let guards = [];
let keys = {};

// INTRO CAMERA ANIMATION STATE
let introRunning = true;
let introProgress = 0;

// INITIALIZATION
window.addEventListener('load', () => {
  init3DEngine();
  runCinematicIntro();
});

function init3DEngine() {
  const container = document.getElementById('canvas-container');

  // Scene & Fog
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020204, 0.035);

  // Perspective Tracking Camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 20);

  // WebGL Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Lighting Setup (Cyberpunk Red Tone)
  const ambientLight = new THREE.AmbientLight(0x0a0a15, 1.2);
  scene.add(ambientLight);

  const crimsonSpot = new THREE.PointLight(0xff0033, 4, 30);
  crimsonSpot.position.set(0, 8, 0);
  crimsonSpot.castShadow = true;
  scene.add(crimsonSpot);

  // Key Listeners
  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  window.addEventListener('resize', onWindowResize);

  // Build Environment Level 1
  buildLevelEnvironment();

  // Animation Frame Loop
  animate();
}

// CINEMATIC SHOT INTRO SEQUENCE
function runCinematicIntro() {
  const caption = document.getElementById('intro-caption');
  const overlay = document.getElementById('intro-overlay');
  const titleBox = document.getElementById('title-container');

  setTimeout(() => { caption.innerText = "SHOT 1 // SCANNING SUB-ROUTINES..."; }, 1000);
  setTimeout(() => { caption.innerText = "SHOT 2 // INTRUSION DETECTED IN SECTOR A1..."; }, 2500);
  setTimeout(() => { 
    caption.classList.add('hidden');
    titleBox.classList.remove('hidden');
  }, 4000);

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.classList.add('hidden');
      document.getElementById('menu-overlay').classList.remove('hidden');
      introRunning = false;
    }, 1500);
  }, 6000);
}

// BUILD 3D ENVIRONMENT (LEVEL 1: PHISHING BREACH)
function buildLevelEnvironment() {
  // Floor Grid
  const grid = new THREE.GridHelper(50, 50, 0xff0033, 0x111122);
  grid.position.y = 0;
  scene.add(grid);

  // Office Room Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.4 });
  const wall1 = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 0.5), wallMat);
  wall1.position.set(0, 2, -5);
  scene.add(wall1);

  // Interactive Evidence Desk (Glows Red)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0x330011, roughness: 0.2 });
  evidenceDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), deskMat);
  evidenceDesk.position.set(-6, 0.45, -3);
  scene.add(evidenceDesk);

  // Interactive Security Terminal
  const termMat = new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x002211, roughness: 0.2 });
  terminalDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), termMat);
  terminalDesk.position.set(0, 0.45, -3);
  scene.add(terminalDesk);

  // Keypad Locked Security Door A1
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.8 });
  doorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.3), doorMat);
  doorMesh.position.set(6, 2, -5);
  scene.add(doorMesh);

  // Player Operative Mesh
  const playerGeo = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0033, metalness: 0.5 });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.set(-6, 0.8, 5);
  scene.add(player);

  // Spawn Enemies with Red Vision Cones
  spawnGuard(-2, 1);
  spawnGuard(3, 2);
}

function spawnGuard(x, z) {
  const guardMat = new THREE.MeshStandardMaterial({ color: 0x444466 });
  const guard = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8), guardMat);
  guard.position.set(x, 0.8, z);

  // Vision Cone Mesh
  const coneGeo = new THREE.ConeGeometry(2.5, 4, 16);
  coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.25 });
  const visionCone = new THREE.Mesh(coneGeo, coneMat);
  visionCone.position.set(0, 0, 2);
  guard.add(visionCone);

  guard.userData = { alive: true };
  guards.push(guard);
  scene.add(guard);
}

// MAIN RENDER & GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  if (introRunning) {
    // Smooth Orbiting Intro Camera Motion
    introProgress += 0.005;
    camera.position.x = Math.sin(introProgress) * 15;
    camera.position.z = Math.cos(introProgress) * 15;
    camera.position.y = 10;
    camera.lookAt(0, 1, 0);
  } else if (player) {
    // Player Controls (WASD / Arrows)
    let moveX = 0, moveZ = 0;
    if (keys['w'] || keys['arrowup']) moveZ -= 0.12;
    if (keys['s'] || keys['arrowdown']) moveZ += 0.12;
    if (keys['a'] || keys['arrowleft']) moveX -= 0.12;
    if (keys['d'] || keys['arrowright']) moveX += 0.12;

    player.position.x += moveX;
    player.position.z += moveZ;

    // Camera Tracking Follow Player
    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.position.y = 12;
    camera.lookAt(player.position.x, 0.8, player.position.z);

    // Check Proximity Interactions
    checkProximities();
  }

  renderer.render(scene, camera);
}

// PROXIMITY CHECKER
function checkProximities() {
  const promptEvid = document.getElementById('prompt-evidence');
  const promptDoor = document.getElementById('prompt-door');
  const promptTerm = document.getElementById('prompt-terminal');

  // Proximity 1: Evidence Desk
  if (player.position.distanceTo(evidenceDesk.position) < 2 && !evidenceLooted) {
    promptEvid.classList.remove('hidden');
    if (keys['q']) {
      evidenceLooted = true;
      promptEvid.classList.add('hidden');
      updateObjective(0, "✓ Found evidence workstation [4430]");
    }
  } else {
    promptEvid.classList.add('hidden');
  }

  // Proximity 2: Security Door Keypad
  if (player.position.distanceTo(doorMesh.position) < 2 && !doorUnlocked) {
    promptDoor.classList.remove('hidden');
    if (keys['e']) {
      openModal('modal-keypad');
    }
  } else {
    promptDoor.classList.add('hidden');
  }

  // Proximity 3: Terminal
  if (player.position.distanceTo(terminalDesk.position) < 2 && !terminalThreatCleared) {
    promptTerm.classList.remove('hidden');
    if (keys['e']) {
      openModal('modal-terminal');
    }
  } else {
    promptTerm.classList.add('hidden');
  }
}

// STEALTH TAKEDOWN MECHANIC
function triggerTakedown() {
  guards.forEach(g => {
    if (g.userData.alive && player.position.distanceTo(g.position) < 2.5) {
      g.userData.alive = false;
      scene.remove(g);
      guardsEliminated++;
      updateObjective(1, `◇ Neutralize security guards [${guardsEliminated}/2]`);
      if (guardsEliminated >= 2) {
        updateObjective(1, "✓ Neutralize security guards [2/2]");
      }
    }
  });
}

// OBJECTIVE UPDATER
function updateObjective(index, text) {
  const obj = document.getElementById(`obj-${index}`);
  if (obj) {
    obj.innerText = text;
    if (text.startsWith("✓")) obj.style.color = "#00ff66";
  }
}

// TERMINAL DIGITAL ANALYSIS ACTIONS
function runTerminalAction(action) {
  const consoleOut = document.getElementById('console-output');
  if (action === 'REMOVE') {
    consoleOut.innerText = "> REMOVING MALWARE... THREAT NEUTRALIZED!";
    consoleOut.style.color = "#00ff66";
    terminalThreatCleared = true;
    checkMissionCompletion();
  } else {
    consoleOut.innerText = `> EXECUTING ${action}... ANALYZING SYSTEM LOGS...`;
    consoleOut.style.color = "#00ff66";
  }
}

// KEYPAD CIPHER LOGIC
function pressKeypad(n) {
  if (keypadInput.length < 4) {
    keypadInput += n;
    document.getElementById('keypad-display').innerText = keypadInput.padEnd(4, '_').split('').join(' ');
  }
}

function clearKeypad() {
  keypadInput = "";
  document.getElementById('keypad-display').innerText = "_ _ _ _";
}

function submitKeypad() {
  const msg = document.getElementById('keypad-msg');
  if (keypadInput === TARGET_KEYPAD_CODE) {
    msg.style.color = "#00ff66";
    msg.innerText = "ACCESS GRANTED // DOOR UNLOCKED";
    doorUnlocked = true;
    doorMesh.position.y += 4;
    closeModal('modal-keypad');
    updateObjective(2, "✓ Unlocked Door A1 & Cleared Threat");
    checkMissionCompletion();
  } else {
    msg.style.color = "#ff0033";
    msg.innerText = "ACCESS DENIED // INVALID CIPHER";
    clearKeypad();
  }
}

function checkMissionCompletion() {
  if (doorUnlocked && terminalThreatCleared) {
    setTimeout(() => {
      openModal('modal-complete');
    }, 1000);
  }
}

// UI TABS & NAVIGATION
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

function selectMission(num) { activeMission = num; }
function selectOperative(op, el) {
  selectedOperative = op;
  document.querySelectorAll('.op-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}
function selectWeapon(w, el) {
  selectedWeapon = w;
  document.querySelectorAll('.weap-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function launchMission() {
  document.getElementById('menu-overlay').classList.add('hidden');
  document.getElementById('game-hud').classList.remove('hidden');
}

function returnToMenu() {
  closeModal('modal-complete');
  document.getElementById('game-hud').classList.add('hidden');
  document.getElementById('menu-overlay').classList.remove('hidden');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
