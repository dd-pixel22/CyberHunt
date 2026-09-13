/* =====================================================================
   CYBERHUNT — prototype build
   Structure:
     1. INTRO CINEMATIC
     2. MAIN MENU + INFO PANELS (Operatives / Armory / Mission Select / Profile)
     3. GAME (Three.js) — Mission 01: PHISHING BREACH
        - player controller (pointer lock)
        - environment (corridor + ops room + server room)
        - interactables (terminals, evidence, locked door)
        - guard AI (patrol + detection + threat meter)
        - objective chain
        - puzzle modal (access code)
        - doc modal (phishing email)
        - reward / mission complete screen
   To add missions 2-5: duplicate the MISSIONS.phishing_breach object below
   with new geometry/objective chains and swap it in on mission select.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. INTRO CINEMATIC
   --------------------------------------------------------------------- */
const introEl = document.getElementById('intro');
const introDot = document.getElementById('intro-dot');
const introFlash = document.getElementById('intro-flash-text');
const introTitle = document.getElementById('intro-title');
const menuEl = document.getElementById('menu');

const introLines = ['INTRUSION DETECTED', 'UNAUTHORIZED ACCESS', 'NETWORK COMPROMISED'];
let introSkipped = false;
let introTimers = [];

function positionDotRandom(){
  introDot.style.left = (44 + Math.random()*12) + '%';
  introDot.style.top = (40 + Math.random()*12) + '%';
}

function runIntro(){
  positionDotRandom();
  let t = 0;

  introLines.forEach((line, i) => {
    const delay = 3400 + i * 1300;
    introTimers.push(setTimeout(() => {
      introFlash.textContent = line;
      introFlash.classList.remove('show');
      void introFlash.offsetWidth; // restart animation
      introFlash.classList.add('show');
    }, delay));
  });

  introTimers.push(setTimeout(() => {
    introFlash.classList.remove('show');
    introTitle.classList.add('reveal');
  }, 3400 + introLines.length * 1300 + 400));

  introTimers.push(setTimeout(finishIntro, 3400 + introLines.length * 1300 + 2600));
}

function finishIntro(){
  if (introSkipped) return;
  introSkipped = true;
  introTimers.forEach(clearTimeout);
  introEl.style.transition = 'opacity 0.6s ease';
  introEl.style.opacity = '0';
  setTimeout(() => {
    introEl.classList.add('hidden');
    menuEl.classList.remove('hidden');
  }, 600);
}

window.addEventListener('keydown', () => { if(!introSkipped) finishIntro(); }, {once:false});
introEl.addEventListener('click', () => { if(!introSkipped) finishIntro(); });

runIntro();

/* ---------------------------------------------------------------------
   2. MAIN MENU + INFO PANELS
   --------------------------------------------------------------------- */
const infoPanel = document.getElementById('info-panel');
const infoContent = document.getElementById('info-content');

const INFO = {
  operatives: `
    <h2>OPERATIVES</h2>
    <div class="op-card">
      <h3>RAVEN — STEALTH OPERATIVE</h3>
      <p>Athletic, precise, silent. Black tactical outfit with crimson accents, tactical hood, dual suppressed sidearms. Excels at avoiding detection and surgical eliminations.</p>
      <span class="tag">SILENT · PRECISE · FAST</span>
    </div>
    <div class="op-card">
      <h3>VOLT — ASSAULT OPERATIVE</h3>
      <p>Heavy tactical armor, muscular build, crimson-orange energy accents. Carries a futuristic assault rifle. Built for direct confrontation and breaching hostile positions.</p>
      <span class="tag">AGGRESSIVE · POWERFUL · DIRECT</span>
    </div>`,
  armory: `
    <h2>ARMORY</h2>
    <div class="weap-card"><h3>NIGHTFALL — ASSAULT RIFLE</h3><p>Medium/long range, high damage, balanced fire rate. Red illuminated receiver indicators, advanced sight.</p></div>
    <div class="weap-card"><h3>REDLINE — SMG</h3><p>Compact, extremely fast fire rate, short/medium range. Glowing crimson energy indicators along the frame.</p></div>
    <div class="weap-card"><h3>SPECTRE — SNIPER RIFLE</h3><p>Extremely long range, high precision, powerful damage. Large futuristic scope with advanced targeting overlay.</p></div>`,
  select: `
    <h2>MISSION SELECT</h2>
    <div class="mission-card"><h3>01 · PHISHING BREACH</h3><p>Corporate security office. Stealth + investigation.</p><span class="tag">AVAILABLE</span></div>
    <div class="mission-card"><h3>02 · MALWARE INFILTRATION</h3><p>Research facility. Physical + digital threats.</p><span class="tag">LOCKED</span></div>
    <div class="mission-card"><h3>03 · RANSOMWARE LOCKDOWN</h3><p>High-security data center. Combat + decryption.</p><span class="tag">LOCKED</span></div>
    <div class="mission-card"><h3>04 · CREDENTIAL THEFT</h3><p>Intelligence facility. Stealth + investigation.</p><span class="tag">LOCKED</span></div>
    <div class="mission-card"><h3>05 · ZERO-DAY RESPONSE</h3><p>Command center. Full CYBERHUNT experience.</p><span class="tag">LOCKED</span></div>`,
  profile: `
    <h2>PROFILE</h2>
    <div class="op-card"><h3>AGENT // CLASSIFIED</h3><p>Level 4 · 1280 XP · 640 Coins<br/>Badges earned: 0 / 6</p></div>`,
  settings: `
    <h2>SETTINGS</h2>
    <div class="op-card"><p>Mouse sensitivity, audio and display options would live here in a full build.</p></div>`
};

function openInfo(key){
  infoContent.innerHTML = INFO[key];
  infoPanel.classList.remove('hidden');
}
document.getElementById('btn-operatives').onclick = () => openInfo('operatives');
document.getElementById('btn-armory').onclick = () => openInfo('armory');
document.getElementById('btn-select').onclick = () => openInfo('select');
document.getElementById('btn-profile').onclick = () => openInfo('profile');
document.getElementById('btn-settings').onclick = () => openInfo('settings');
document.getElementById('btn-info-close').onclick = () => infoPanel.classList.add('hidden');

document.getElementById('btn-start').onclick = () => {
  menuEl.classList.add('hidden');
  startMission();
};

document.getElementById('btn-return-menu').onclick = () => {
  document.getElementById('reward-screen').classList.add('hidden');
  document.getElementById('game-canvas').classList.add('hidden');
  document.getElementById('hud').classList.add('hidden');
  menuEl.classList.remove('hidden');
};

/* ---------------------------------------------------------------------
   3. GAME
   --------------------------------------------------------------------- */
const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const pointerHint = document.getElementById('pointer-lock-hint');

let scene, camera, renderer, clock;
let velocity = new THREE.Vector3();
let yaw = 0, pitch = 0;
let keys = {};
let pointerLocked = false;
let gameRunning = false;

let interactables = []; // {mesh, type, id, range, label}
let currentTarget = null;

let guard = null;
let guardDir = 1;
let threat = 8;
let health = 100;

let objectiveIndex = 0;
const objectives = [
  { text:'Enter the facility', done:true },
  { text:'Avoid security', done:false },
  { text:'Find suspicious workstation', done:false },
  { text:'Inspect the phishing email', done:false },
  { text:'Collect digital evidence', done:false },
  { text:'Decode access credentials', done:false },
  { text:'Enter the server room', done:false },
  { text:'Secure compromised system', done:false },
];

let evidenceCollected = 0;
const evidenceTotal = 3;
let doorLocked = true;
let doorMesh = null;
let missionComplete = false;

function setObjectiveActive(i){
  objectiveIndex = i;
  renderObjectives();
}
function completeObjective(i){
  if (objectives[i]) objectives[i].done = true;
  if (i === objectiveIndex && objectives[i+1]) objectiveIndex = i+1;
  renderObjectives();
}
function renderObjectives(){
  const ul = document.getElementById('objectives-list');
  ul.innerHTML = '';
  objectives.forEach((o, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="box">${o.done ? '☒' : '☐'}</span>${o.text}`;
    if (o.done) li.classList.add('done');
    else if (i === objectiveIndex) li.classList.add('active');
    ul.appendChild(li);
  });
}

function showToast(msg){
  const t = document.getElementById('alert-toast');
  t.textContent = msg;
  t.classList.remove('show'); void t.offsetWidth;
  t.classList.remove('hidden');
  t.classList.add('show');
}

function startMission(){
  hud.classList.remove('hidden');
  canvas.classList.remove('hidden');
  pointerHint.classList.remove('hidden');
  renderObjectives();
  initThree();
  requestPointerLockOnClick();
  if (!gameRunning){
    gameRunning = true;
    animate();
  }
  showToast('MISSION 01 // PHISHING BREACH — INITIATED');
}

/* ---------- THREE.JS SETUP ---------- */
function initThree(){
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030304, 0.055);
  scene.background = new THREE.Color(0x020203);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.7, 8);

  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  clock = new THREE.Clock();

  buildEnvironment();
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('keydown', onInteractKey);
}

function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function requestPointerLockOnClick(){
  canvas.addEventListener('click', () => {
    if (!pointerLocked && gameRunning && !anyModalOpen()) canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
    pointerHint.classList.toggle('hidden', pointerLocked);
    if (pointerLocked) document.addEventListener('mousemove', onMouseMove);
    else document.removeEventListener('mousemove', onMouseMove);
  });
}

function onMouseMove(e){
  yaw -= e.movementX * 0.0022;
  pitch -= e.movementY * 0.0022;
  pitch = Math.max(-1.2, Math.min(1.2, pitch));
}

/* ---------- MATERIALS HELPERS ---------- */
const matDark = new THREE.MeshStandardMaterial({ color:0x101114, roughness:0.7, metalness:0.4 });
const matSteel = new THREE.MeshStandardMaterial({ color:0x2a2c31, roughness:0.35, metalness:0.7 });
const matGlass = new THREE.MeshStandardMaterial({ color:0x0a0d12, roughness:0.1, metalness:0.9, transparent:true, opacity:0.55 });
const matRedGlow = new THREE.MeshStandardMaterial({ color:0x2a0006, emissive:0xff2c47, emissiveIntensity:1.6, roughness:0.4 });
const matFloor = new THREE.MeshStandardMaterial({ color:0x0c0d10, roughness:0.55, metalness:0.5 });

function box(w,h,d,mat,x,y,z){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  return m;
}

function redLight(x,y,z,intensity=2.2,dist=8){
  const l = new THREE.PointLight(0xff2c47, intensity, dist, 2);
  l.position.set(x,y,z);
  scene.add(l);
  const geo = new THREE.SphereGeometry(0.08,8,8);
  const bulb = new THREE.Mesh(geo, matRedGlow);
  bulb.position.set(x,y,z);
  scene.add(bulb);
  return l;
}

/* ---------- ENVIRONMENT: corridor -> ops room -> server room ---------- */
function buildEnvironment(){
  // ambient base — very dark
  scene.add(new THREE.AmbientLight(0x0c0d12, 0.55));
  const hemi = new THREE.HemisphereLight(0x1a1c22, 0x000000, 0.3);
  scene.add(hemi);

  // ---- floor & ceiling (long strip, z from 12 to -40) ----
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 60), matFloor);
  floor.rotation.x = -Math.PI/2;
  floor.position.set(0,0,-14);
  floor.receiveShadow = true;
  scene.add(floor);

  const ceiling = floor.clone();
  ceiling.material = matDark;
  ceiling.position.y = 3.2;
  ceiling.rotation.x = Math.PI/2;
  scene.add(ceiling);

  // ---- corridor walls with server racks (z: 6 to -8) ----
  for (let z = 6; z > -10; z -= 3){
    box(0.4, 3.2, 2.2, matSteel, -5.6, 1.6, z);
    box(0.4, 3.2, 2.2, matSteel, 5.6, 1.6, z);
    redLight(-5.3, 2.6, z, 1.6, 6);
    redLight(5.3, 2.6, z, 1.6, 6);
  }
  // corridor side boundary walls
  box(0.3, 3.2, 40, matDark, -7, 1.6, -10);
  box(0.3, 3.2, 40, matDark, 7, 1.6, -10);

  // security camera props along corridor
  [ [-5.5,2.9,3], [5.5,2.9,-2] ].forEach(p => {
    box(0.25,0.25,0.4, matSteel, p[0],p[1],p[2]);
    redLight(p[0], p[1]+0.05, p[2]+0.2, 1, 3);
  });

  // ---- ops room (z ~ -14 to -24) ----
  box(0.3, 3.2, 12, matDark, -7, 1.6, -18); // left wall
  box(0.3, 3.2, 12, matDark, 7, 1.6, -18); // right wall

  // desks / monitor terminals in ops room
  const terminal1 = box(1.1, 1.1, 0.5, matGlass, -3, 0.9, -16);
  redLight(-3, 1.5, -15.6, 2, 4);
  const terminal2 = box(1.1, 1.1, 0.5, matGlass, 3, 0.9, -20);
  redLight(3, 1.5, -19.6, 2, 4);

  // evidence pickups (glowing red cubes)
  const evPositions = [ [-2, 0.5, -12], [4.5, 0.5, -17], [-4.5, 0.5, -22] ];
  const evMeshes = evPositions.map(p => {
    const m = box(0.3,0.3,0.3, matRedGlow, p[0], p[1], p[2]);
    return m;
  });

  // ---- locked door to server room (z ~ -26) ----
  doorMesh = box(3.4, 3, 0.35, matSteel, 0, 1.5, -26);
  redLight(0, 2.4, -25.6, 2.4, 5);
  const doorPanel = box(0.5,0.5,0.1, matRedGlow, 1.9, 1.2, -25.8);

  // ---- server room (z -28 to -38) ----
  box(0.3, 3.2, 22, matDark, -7, 1.6, -33);
  box(0.3, 3.2, 22, matDark, 7, 1.6, -33);
  for (let z = -29; z > -38; z -= 3){
    box(1, 2.6, 0.8, matSteel, -4, 1.3, z);
    box(1, 2.6, 0.8, matSteel, 4, 1.3, z);
    redLight(-4, 2.4, z, 1.4, 5);
    redLight(4, 2.4, z, 1.4, 5);
  }
  const finalTerminal = box(1.4, 1.3, 0.6, matGlass, 0, 0.9, -37);
  redLight(0, 1.6, -36.6, 2.4, 5);

  // back wall to end the level
  box(14, 3.2, 0.3, matDark, 0, 1.6, -39.5);

  // ---- guard (simple capsule figure) ----
  const guardGroup = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.1, 4, 8), new THREE.MeshStandardMaterial({color:0x1a1b1e, roughness:0.6}));
  body.position.y = 1;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.05), matRedGlow);
  visor.position.set(0, 1.55, 0.32);
  guardGroup.add(body, visor);
  guardGroup.position.set(-2, 0, -14);
  scene.add(guardGroup);
  guard = { group: guardGroup, minZ:-19, maxZ:-9, speed: 1.4 };

  // register interactables
  interactables.push({ mesh: terminal1, type:'terminal_email', label:'ANALYZE WORKSTATION', range:2.2, done:false });
  interactables.push({ mesh: terminal2, type:'terminal_network', label:'SCAN NETWORK LOG', range:2.2, done:false });
  evMeshes.forEach((m,i) => interactables.push({ mesh:m, type:'evidence', label:'COLLECT EVIDENCE', range:1.6, id:i, done:false }));
  interactables.push({ mesh: doorPanel, type:'door_panel', label:'DECODE ACCESS', range:2.2, done:false });
  interactables.push({ mesh: finalTerminal, type:'final_terminal', label:'SECURE SYSTEM', range:2.2, done:false });
}

/* ---------- INTERACTION ---------- */
function anyModalOpen(){
  return !document.getElementById('puzzle-modal').classList.contains('hidden') ||
         !document.getElementById('doc-modal').classList.contains('hidden') ||
         !document.getElementById('reward-screen').classList.contains('hidden');
}

function findNearestInteractable(){
  let best = null, bestDist = Infinity;
  const camPos = camera.position;
  const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  interactables.forEach(it => {
    if (it.done) return;
    if (it.type !== 'evidence' && it.type !== 'door_panel' && it.locked) return;
    const d = it.mesh.position.distanceTo(camPos);
    if (d > it.range) return;
    const toObj = it.mesh.position.clone().sub(camPos).normalize();
    if (toObj.dot(forward) < 0.4) return;
    if (it.type === 'door_panel' && !doorLocked) return;
    if (it.type === 'final_terminal' && doorLocked) return;
    if (d < bestDist){ bestDist = d; best = it; }
  });
  return best;
}

const interactPrompt = document.getElementById('interact-prompt');
const interactLabel = document.getElementById('interact-label');

function onInteractKey(e){
  if (e.code !== 'KeyE') return;
  if (anyModalOpen()) return;
  if (!currentTarget) return;
  handleInteract(currentTarget);
}

function handleInteract(it){
  switch(it.type){
    case 'terminal_email':
      openEmailPuzzle(it);
      break;
    case 'terminal_network':
      it.done = true;
      showToast('NETWORK LOG SCANNED — SUSPICIOUS PROCESS FLAGGED');
      completeObjective(1);
      break;
    case 'evidence':
      it.done = true;
      scene.remove(it.mesh);
      evidenceCollected++;
      document.getElementById('evidence-count').textContent = evidenceCollected;
      showToast('EVIDENCE SECURED (' + evidenceCollected + '/' + evidenceTotal + ')');
      if (evidenceCollected >= evidenceTotal) completeObjective(4);
      break;
    case 'door_panel':
      openAccessPuzzle(it);
      break;
    case 'final_terminal':
      it.done = true;
      completeObjective(7);
      finishMission();
      break;
  }
}

/* ---------- EMAIL / PHISHING DOC MODAL ---------- */
const docModal = document.getElementById('doc-modal');
const docBody = document.getElementById('doc-body');
document.getElementById('doc-close').onclick = () => {
  docModal.classList.add('hidden');
  document.exitPointerLock();
};

function openEmailPuzzle(it){
  document.exitPointerLock();
  docModal.classList.remove('hidden');
  document.getElementById('doc-title').textContent = 'WORKSTATION — INBOX RECOVERED';
  docBody.innerHTML =
`FROM: it-support@corp-secure-login.net
SUBJECT: Urgent — Verify your account within 24 hours

Your access will be suspended. Click the link below immediately
to confirm your credentials and avoid service interruption.

hxxp://corp--secure-login[.]net/verify

--- flagged indicators ---
> sender domain does not match corporate domain
> urgent / threatening language
> mismatched link destination
> unsolicited credential request

MALICIOUS EMAIL IDENTIFIED.`;
  completeObjective(2);
  completeObjective(3);
  it.done = true;
}

/* ---------- ACCESS CODE PUZZLE ---------- */
const puzzleModal = document.getElementById('puzzle-modal');
const puzzleClue = document.getElementById('puzzle-clue');
const puzzleFeedback = document.getElementById('puzzle-feedback');
const digitInputs = Array.from(document.querySelectorAll('.puzzle-digit'));
let currentPuzzleAnswer = '4092';
let activePuzzleTarget = null;

digitInputs.forEach((inp, idx) => {
  inp.addEventListener('input', () => {
    inp.value = inp.value.replace(/[^0-9]/g,'').slice(0,1);
    if (inp.value && digitInputs[idx+1]) digitInputs[idx+1].focus();
  });
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !inp.value && digitInputs[idx-1]) digitInputs[idx-1].focus();
  });
});

function openAccessPuzzle(it){
  if (evidenceCollected < evidenceTotal){
    showToast('INSUFFICIENT EVIDENCE — RECOVER ALL LOGS FIRST');
    return;
  }
  document.exitPointerLock();
  activePuzzleTarget = it;
  puzzleFeedback.textContent = '';
  puzzleFeedback.className = '';
  digitInputs.forEach(i => i.value = '');
  puzzleClue.textContent =
`LOG FRAGMENT: 4 _ 9 _
CLUE 1: second digit is even, and less than 4.
CLUE 2: final digit equals (first digit) minus (second digit).`;
  puzzleModal.classList.remove('hidden');
  digitInputs[0].focus();
}

document.getElementById('puzzle-cancel').onclick = () => {
  puzzleModal.classList.add('hidden');
};

document.getElementById('puzzle-submit').onclick = () => {
  const entered = digitInputs.map(i => i.value).join('');
  if (entered.length < 4){
    puzzleFeedback.textContent = 'INCOMPLETE SEQUENCE';
    puzzleFeedback.className = 'bad';
    return;
  }
  if (entered === currentPuzzleAnswer){
    puzzleFeedback.textContent = 'ACCESS GRANTED';
    puzzleFeedback.className = 'good';
    setTimeout(() => {
      puzzleModal.classList.add('hidden');
      unlockDoor();
    }, 700);
  } else {
    puzzleFeedback.textContent = 'ACCESS DENIED — THREAT LEVEL RISING';
    puzzleFeedback.className = 'bad';
    threat = Math.min(100, threat + 15);
  }
};

function unlockDoor(){
  doorLocked = false;
  activePuzzleTarget.done = true;
  completeObjective(5);
  // animate door sliding up
  const startY = doorMesh.position.y;
  const targetY = startY + 3.4;
  const t0 = performance.now();
  function slide(){
    const t = Math.min(1, (performance.now()-t0)/900);
    doorMesh.position.y = startY + (targetY-startY)*t;
    if (t < 1) requestAnimationFrame(slide);
    else completeObjective(6);
  }
  slide();
  showToast('SECURITY DOOR UNLOCKED');
}

/* ---------- GUARD / COMBAT ---------- */
function onMouseDown(e){
  if (!pointerLocked || anyModalOpen()) return;
  if (e.button !== 0) return;
  // raycast to guard
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0,0), camera);
  const hits = raycaster.intersectObject(guard.group, true);
  if (hits.length && hits[0].distance < 10){
    guard.group.visible = false;
    guard.neutralized = true;
    threat = Math.max(0, threat - 30);
    showToast('HOSTILE NEUTRALIZED');
  }
}

function updateGuard(dt){
  if (guard.neutralized) return;
  const g = guard.group;
  g.position.z += guard.speed * dt * guardDir;
  if (g.position.z < guard.minZ) guardDir = 1;
  if (g.position.z > guard.maxZ) guardDir = -1;
  g.rotation.y = guardDir > 0 ? Math.PI : 0;

  const dist = g.position.distanceTo(camera.position);
  if (dist < 5){
    threat = Math.min(100, threat + dt * 14);
  } else {
    threat = Math.max(0, threat - dt * 6);
  }
  if (threat >= 100){
    health = Math.max(0, health - dt * 25);
  }
}

/* ---------- MOVEMENT ---------- */
const moveSpeed = 4.2;
function updateMovement(dt){
  camera.rotation.set(pitch, yaw, 0, 'YXZ');

  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const right = new THREE.Vector3(forward.z, 0, -forward.x);

  const move = new THREE.Vector3();
  if (keys['KeyW']) move.add(forward);
  if (keys['KeyS']) move.sub(forward);
  if (keys['KeyD']) move.add(right);
  if (keys['KeyA']) move.sub(right);
  if (move.lengthSq() > 0) move.normalize().multiplyScalar(moveSpeed*dt);

  camera.position.add(move);

  // bounds
  camera.position.x = Math.max(-6.3, Math.min(6.3, camera.position.x));
  camera.position.z = Math.max(-38.5, Math.min(9, camera.position.z));
  // locked door blocks passage
  if (doorLocked && camera.position.z < -25 && camera.position.z > -27){
    camera.position.z = -25;
  }
  camera.position.y = 1.7;
}

/* ---------- HUD LIVE UPDATE ---------- */
function updateHud(){
  document.getElementById('threat-bar-inner').style.width = threat.toFixed(0) + '%';
  document.getElementById('health-fill').style.width = health.toFixed(0) + '%';

  const target = findNearestInteractable();
  currentTarget = target;
  if (target){
    interactLabel.textContent = target.label;
    interactPrompt.classList.remove('hidden');
  } else {
    interactPrompt.classList.add('hidden');
  }
}

/* ---------- MISSION COMPLETE ---------- */
function finishMission(){
  if (missionComplete) return;
  missionComplete = true;
  document.exitPointerLock();
  setTimeout(() => {
    document.getElementById('reward-screen').classList.remove('hidden');
  }, 500);
}

/* ---------- MAIN LOOP ---------- */
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  if (!anyModalOpen() && pointerLocked){
    updateMovement(dt);
  }
  updateGuard(dt);
  updateHud();
  renderer.render(scene, camera);
}
