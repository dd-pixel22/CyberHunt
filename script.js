let activeMission = 1;
let selectedOp = 'RAVEN';
let selectedWeap = 'NIGHTFALL';

let evidenceLooted = false;
let guardsEliminated = 0;
let doorUnlocked = false;
let terminalThreatCleared = false;

let keypadInput = "";
const CIPHER_CODE = "4430";

let scene, camera, renderer, gltfLoader;
let player, evidenceDesk, doorMesh, terminalDesk;
let guards = [];
let keys = {};
let introRunning = true, introTime = 0;

window.addEventListener('load', () => {
  initEngine();
  runIntroSequence();
});

function initEngine() {
  const container = document.getElementById('canvas-container');

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020204, 0.035);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 30, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  gltfLoader = new THREE.GLTFLoader();

  const ambientLight = new THREE.AmbientLight(0x0a0a15, 1.2);
  scene.add(ambientLight);

  const crimsonSpot = new THREE.PointLight(0xff0033, 4, 30);
  crimsonSpot.position.set(0, 8, 0);
  crimsonSpot.castShadow = true;
  scene.add(crimsonSpot);

  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
  window.addEventListener('resize', onResize);

  build3DWorld();
  animate();
}

function runIntroSequence() {
  const caption = document.getElementById('intro-caption');
  const titleBox = document.getElementById('intro-title-box');
  const screen = document.getElementById('intro-screen');

  setTimeout(() => { caption.innerText = "SHOT 1 // SCANNING SUB-ROUTINES..."; }, 1000);
  setTimeout(() => { caption.innerText = "SHOT 2 // INTRUSION DETECTED IN SECTOR A1..."; }, 2500);
  setTimeout(() => { 
    caption.classList.add('hidden');
    titleBox.classList.remove('hidden');
  }, 4000);

  setTimeout(() => {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.classList.add('hidden');
      document.getElementById('menu-overlay').classList.remove('hidden');
      introRunning = false;
    }, 1500);
  }, 6000);
}

function build3DWorld() {
  const grid = new THREE.GridHelper(50, 50, 0xff0033, 0x111122);
  grid.position.y = 0;
  scene.add(grid);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x101018, roughness: 0.4 });
  const wall1 = new THREE.Mesh(new THREE.BoxGeometry(16, 4, 0.5), wallMat);
  wall1.position.set(0, 2, -5);
  scene.add(wall1);

  const deskMat = new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0x330011, roughness: 0.2 });
  evidenceDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), deskMat);
  evidenceDesk.position.set(-6, 0.45, -3);
  scene.add(evidenceDesk);

  const termMat = new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x002211, roughness: 0.2 });
  terminalDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), termMat);
  terminalDesk.position.set(0, 0.45, -3);
  scene.add(terminalDesk);

  const doorMat = new THREE.MeshStandardMaterial({ color: 0x222233, metalness: 0.8 });
  doorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.5, 4, 0.3), doorMat);
  doorMesh.position.set(6, 2, -5);
  scene.add(doorMesh);

  // Fallback player mesh until models are loaded
  const playerGeo = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0033, metalness: 0.5 });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.set(-6, 0.8, 5);
  scene.add(player);

  spawnGuard(-2, 1);
  spawnGuard(3, 2);
}

function spawnGuard(x, z) {
  const guardMat = new THREE.MeshStandardMaterial({ color: 0x444466 });
  const guard = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8), guardMat);
  guard.position.set(x, 0.8, z);

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

function animate() {
  requestAnimationFrame(animate);

  if (introRunning) {
    introTime += 0.005;
    camera.position.x = Math.sin(introTime) * 15;
    camera.position.z = Math.cos(introTime) * 15;
    camera.position.y = 10;
    camera.lookAt(0, 1, 0);
  } else if (player) {
    let moveX = 0, moveZ = 0;
    if (keys['w'] || keys['arrowup']) moveZ -= 0.12;
    if (keys['s'] || keys['arrowdown']) moveZ += 0.12;
    if (keys['a'] || keys['arrowleft']) moveX -= 0.12;
    if (keys['d'] || keys['arrowright']) moveX += 0.12;

    player.position.x += moveX;
    player.position.z += moveZ;

    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 10;
    camera.position.y = 12;
    camera.lookAt(player.position.x, 0.8, player.position.z);

    checkProximity();
  }

  renderer.render(scene, camera);
}

function checkProximity() {
  const pEvid = document.getElementById('prompt-evidence');
  const pDoor = document.getElementById('prompt-door');
  const pTerm = document.getElementById('prompt-terminal');

  if (player.position.distanceTo(evidenceDesk.position) < 2 && !evidenceLooted) {
    pEvid.classList.remove('hidden');
    if (keys['q']) {
      evidenceLooted = true;
      pEvid.classList.add('hidden');
      updateObj(0, "✓ Found evidence workstation [4430]");
    }
  } else { pEvid.classList.add('hidden'); }

  if (player.position.distanceTo(doorMesh.position) < 2 && !doorUnlocked) {
    pDoor.classList.remove('hidden');
    if (keys['e']) openModal('modal-keypad');
  } else { pDoor.classList.add('hidden'); }

  if (player.position.distanceTo(terminalDesk.position) < 2 && !terminalThreatCleared) {
    pTerm.classList.remove('hidden');
    if (keys['e']) openModal('modal-terminal');
  } else { pTerm.classList.add('hidden'); }
}

function takedownGuard() {
  guards.forEach(g => {
    if (g.userData.alive && player.position.distanceTo(g.position) < 2.5) {
      g.userData.alive = false;
      scene.remove(g);
      guardsEliminated++;
      updateObj(1, `◇ Neutralize security guards [${guardsEliminated}/2]`);
      if (guardsEliminated >= 2) updateObj(1, "✓ Neutralize security guards [2/2]");
    }
  });
}

function updateObj(idx, txt) {
  const el = document.getElementById(`obj-${idx}`);
  if (el) {
    el.innerText = txt;
    if (txt.startsWith("✓")) el.style.color = "#00ff66";
  }
}

function runAnalysis(act) {
  const out = document.getElementById('console-output');
  if (act === 'REMOVE') {
    out.innerText = "> REMOVING MALWARE... THREAT NEUTRALIZED!";
    out.style.color = "#00ff66";
    terminalThreatCleared = true;
    checkWin();
  } else {
    out.innerText = `> EXECUTING ${act}... ANALYZING SYSTEM LOGS...`;
    out.style.color = "#00ff66";
  }
}

function pressKey(n) {
  if (keypadInput.length < 4) {
    keypadInput += n;
    document.getElementById('keypad-screen').innerText = keypadInput.padEnd(4, '_').split('').join(' ');
  }
}

function clearKey() {
  keypadInput = "";
  document.getElementById('keypad-screen').innerText = "_ _ _ _";
}

function submitKey() {
  const st = document.getElementById('keypad-status');
  if (keypadInput === CIPHER_CODE) {
    st.style.color = "#00ff66";
    st.innerText = "ACCESS GRANTED // UNLOCKED";
    doorUnlocked = true;
    doorMesh.position.y += 4;
    closeModal('modal-keypad');
    updateObj(2, "✓ Unlocked Door A1 & Cleared Threat");
    checkWin();
  } else {
    st.style.color = "#ff0033";
    st.innerText = "ACCESS DENIED";
    clearKey();
  }
}

function checkWin() {
  if (doorUnlocked && terminalThreatCleared) {
    setTimeout(() => openModal('modal-complete'), 1000);
  }
}

function openTab(id, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${id}`).classList.add('active');
  btn.classList.add('active');
}

function selectMission(num, el) {
  activeMission = num;
  document.querySelectorAll('#tab-missions .card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function selectOp(op, el) {
  selectedOp = op;
  document.querySelectorAll('#tab-operatives .card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function selectWeap(w, el) {
  selectedWeap = w;
  document.querySelectorAll('#tab-armory .card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function startGameplay() {
  document.getElementById('menu-overlay').classList.add('hidden');
  document.getElementById('hud-overlay').classList.remove('hidden');
}

function exitToMenu() {
  closeModal('modal-complete');
  document.getElementById('hud-overlay').classList.add('hidden');
  document.getElementById('menu-overlay').classList.remove('hidden');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
