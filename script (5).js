/* =====================================================================
   CYBERHUNT v2 — isometric tactical rebuild
   Flow: intro -> main menu -> operative select -> weapon select
         -> mission list -> mission briefing -> isometric gameplay
         -> mission complete -> back to mission list
   ===================================================================== */

/* ---------------------------------------------------------------------
   DATA
   --------------------------------------------------------------------- */
const OPERATIVES = [
  { id:'raven',   name:'RAVEN',   role:'STEALTH · BALANCED',   icon:'🥷' },
  { id:'specter', name:'SPECTER', role:'SNIPER · LONG RANGE',  icon:'🎯' },
  { id:'volt',    name:'VOLT',    role:'ASSAULT · AGGRESSIVE', icon:'💥' },
  { id:'nova',    name:'NOVA',    role:'ANALYST · SUPPORT',    icon:'🧠' },
];

const WEAPONS = [
  { id:'ar12',           name:'AR-12',           type:'ASSAULT RIFLE', icon:'🔫', ammo:'15/45', stats:{DMG:70,RATE:60,ACC:65,AMMO:70} },
  { id:'volt-smg',       name:'VOLT SMG',        type:'SMG',           icon:'🔫', ammo:'30/90', stats:{DMG:40,RATE:90,ACC:50,AMMO:80} },
  { id:'shadow-sniper',  name:'SHADOW SNIPER',   type:'SNIPER RIFLE',  icon:'🎯', ammo:'5/15',  stats:{DMG:95,RATE:20,ACC:95,AMMO:30} },
  { id:'twin-pistols',   name:'TWIN PISTOLS',    type:'PISTOL',        icon:'🔫', ammo:'12/48', stats:{DMG:50,RATE:70,ACC:60,AMMO:60} },
];

const MISSIONS = [
  { id:1,  name:'PHISHING BREACH',     available:true },
  { id:2,  name:'MALWARE INFILTRATION',available:false },
  { id:3,  name:'RANSOMWARE LOCKDOWN', available:false },
  { id:4,  name:'CREDENTIAL THEFT',    available:false },
  { id:5,  name:'MITM ATTACK',         available:false },
  { id:6,  name:'INSIDER THREAT',      available:false },
  { id:7,  name:'DDOS ATTACK',         available:false },
  { id:8,  name:'DATA EXFILTRATION',   available:false },
  { id:9,  name:'SOCIAL ENGINEERING',  available:false },
  { id:10, name:'ZERO-DAY RESPONSE',   available:false },
];

let selectedOperative = OPERATIVES[0];
let selectedWeapon = WEAPONS[0];

/* ---------------------------------------------------------------------
   SCREEN NAVIGATION
   --------------------------------------------------------------------- */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.back));
});

function showToast(msg){
  const t = document.getElementById('alert-toast');
  t.textContent = msg;
  t.classList.remove('show'); void t.offsetWidth;
  t.classList.remove('hidden'); t.classList.add('show');
}

/* ---------------------------------------------------------------------
   INTRO CINEMATIC
   --------------------------------------------------------------------- */
const introEl = document.getElementById('intro');
const introFlash = document.getElementById('intro-flash-text');
const introTitle = document.getElementById('intro-title');
const introLines = ['INTRUSION DETECTED', 'UNAUTHORIZED ACCESS', 'NETWORK COMPROMISED'];
let introSkipped = false;
let introTimers = [];

function runIntro(){
  const dot = document.getElementById('intro-dot');
  dot.style.left = (44 + Math.random()*12) + '%';
  dot.style.top = (40 + Math.random()*12) + '%';

  introLines.forEach((line, i) => {
    introTimers.push(setTimeout(() => {
      introFlash.textContent = line;
      introFlash.classList.remove('show'); void introFlash.offsetWidth;
      introFlash.classList.add('show');
    }, 3400 + i * 1300));
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
    showScreen('main-menu');
  }, 600);
}
window.addEventListener('keydown', () => { if(!introSkipped) finishIntro(); });
introEl.addEventListener('click', () => { if(!introSkipped) finishIntro(); });
runIntro();

/* ---------------------------------------------------------------------
   MAIN MENU
   --------------------------------------------------------------------- */
document.getElementById('btn-play').onclick = () => { renderOperatives(); showScreen('operative-select'); };
document.getElementById('btn-settings').onclick = () => showToast('SETTINGS — COMING SOON');
document.getElementById('btn-quit').onclick = () => showToast('THANKS FOR PLAYING CYBERHUNT');

/* ---------------------------------------------------------------------
   OPERATIVE SELECT
   --------------------------------------------------------------------- */
function renderOperatives(){
  const row = document.getElementById('operative-cards');
  row.innerHTML = '';
  OPERATIVES.forEach(op => {
    const card = document.createElement('div');
    card.className = 'op-card-sel' + (op.id === selectedOperative.id ? ' selected' : '');
    card.innerHTML = `<div class="op-portrait">${op.icon}</div><div class="op-name">${op.name}</div><div class="op-role">${op.role}</div>`;
    card.onclick = () => { selectedOperative = op; renderOperatives(); };
    row.appendChild(card);
  });
}
document.getElementById('btn-confirm-operative').onclick = () => { renderWeapons(); showScreen('weapon-select'); };

/* ---------------------------------------------------------------------
   WEAPON SELECT
   --------------------------------------------------------------------- */
function renderWeapons(){
  const row = document.getElementById('weapon-cards');
  row.innerHTML = '';
  WEAPONS.forEach(w => {
    const card = document.createElement('div');
    card.className = 'weap-card-sel' + (w.id === selectedWeapon.id ? ' selected' : '');
    const statsHtml = Object.entries(w.stats).map(([k,v]) =>
      `<div class="stat-mini"><span>${k}</span><div class="stat-mini-bar"><i style="width:${v}%"></i></div></div>`
    ).join('');
    card.innerHTML = `<div class="weap-icon">${w.icon}</div><div class="weap-name">${w.name}</div><div class="weap-type">${w.type}</div>${statsHtml}`;
    card.onclick = () => { selectedWeapon = w; renderWeapons(); };
    row.appendChild(card);
  });
}
document.getElementById('btn-confirm-weapon').onclick = () => { renderMissionList(); showScreen('mission-list'); };

/* ---------------------------------------------------------------------
   MISSION LIST
   --------------------------------------------------------------------- */
function renderMissionList(){
  document.getElementById('chip-operative').textContent = selectedOperative.name;
  const grid = document.getElementById('mission-grid');
  grid.innerHTML = '';
  MISSIONS.forEach(m => {
    const tile = document.createElement('div');
    tile.className = 'mission-tile ' + (m.available ? 'available' : 'locked');
    tile.innerHTML = `<div class="mission-num">${String(m.id).padStart(2,'0')}</div>
      ${m.available ? '' : '<div class="lock-icon">🔒</div>'}
      <div class="mission-name">${m.name}</div>`;
    tile.onclick = () => {
      if (!m.available){ showToast('MISSION LOCKED — COMPLETE PRIOR OPERATIONS'); return; }
      showScreen('mission-briefing');
    };
    grid.appendChild(tile);
  });
}
document.getElementById('btn-start-mission').onclick = () => {
  document.getElementById('main-menu').classList.add('hidden');
  document.getElementById('hud').classList.remove('hidden');
  document.getElementById('game-canvas').classList.remove('hidden');
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  startMission();
};

/* ---------------------------------------------------------------------
   GAME STATE
   --------------------------------------------------------------------- */
let scene, camera, renderer, clock;
let player, guard;
let interactables = [];
let currentTarget = null;
let gameRunning = false;
let threat = 8, health = 100;
let evidenceCollected = 0;
const evidenceTotal = 3;
let doorLocked = true, doorMesh = null;
let missionComplete = false;
let guardDir = 1;
let sprinting = false;

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
let objectiveIndex = 0;

function completeObjective(i){
  if (objectives[i]) objectives[i].done = true;
  if (i === objectiveIndex && objectives[i+1]) objectiveIndex = i+1;
  renderObjectives();
}
function renderObjectives(){
  document.getElementById('hud-objectives').innerHTML = objectives.map((o,i) =>
    `<li class="${o.done?'done':(i===objectiveIndex?'active':'')}">${o.text}</li>`).join('');
}
function renderBriefingObjectives(){
  document.getElementById('brief-objectives-list').innerHTML = objectives.map(o => `<li>${o.text}</li>`).join('');
}
renderBriefingObjectives();

/* ---------------------------------------------------------------------
   MISSION START / THREE.JS SETUP
   --------------------------------------------------------------------- */
function startMission(){
  document.getElementById('hud-mission-name').textContent = 'PHISHING BREACH';
  document.getElementById('ammo-current').textContent = selectedWeapon.ammo.split('/')[0];
  document.getElementById('ammo-reserve').textContent = selectedWeapon.ammo.split('/')[1];
  renderObjectives();
  if (!gameRunning){
    initThree();
    gameRunning = true;
    animate();
  }
  showToast('MISSION 01 // PHISHING BREACH — INITIATED');
}

function initThree(){
  const canvas = document.getElementById('game-canvas');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030304, 0.035);
  scene.background = new THREE.Color(0x020203);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 200);

  renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  clock = new THREE.Clock();

  buildEnvironment();
  window.addEventListener('resize', onResize);
  setupJoystick();
  setupButtons();
}
function onResize(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ---------- materials ---------- */
const matDark = new THREE.MeshStandardMaterial({ color:0x101114, roughness:0.7, metalness:0.4 });
const matSteel = new THREE.MeshStandardMaterial({ color:0x2a2c31, roughness:0.35, metalness:0.7 });
const matGlass = new THREE.MeshStandardMaterial({ color:0x0a0d12, roughness:0.1, metalness:0.9, transparent:true, opacity:0.55 });
const matRedGlow = new THREE.MeshStandardMaterial({ color:0x2a0006, emissive:0xff2c47, emissiveIntensity:1.6, roughness:0.4 });
const matFloor = new THREE.MeshStandardMaterial({ color:0x0c0d10, roughness:0.55, metalness:0.5 });
const matPlayer = new THREE.MeshStandardMaterial({ color:0x1c1d21, roughness:0.5, emissive:0x300008, emissiveIntensity:0.3 });
const matGuard = new THREE.MeshStandardMaterial({ color:0x24161a, roughness:0.6 });

function box(w,h,d,mat,x,y,z,parent){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z);
  (parent||scene).add(m);
  return m;
}
function redLight(x,y,z,intensity=2.2,dist=8){
  const l = new THREE.PointLight(0xff2c47, intensity, dist, 2);
  l.position.set(x,y,z); scene.add(l);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8), matRedGlow);
  bulb.position.set(x,y,z); scene.add(bulb);
}

/* ---------- environment ---------- */
function buildEnvironment(){
  scene.add(new THREE.AmbientLight(0x0c0d12, 0.6));
  scene.add(new THREE.HemisphereLight(0x1a1c22, 0x000000, 0.35));

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 60), matFloor);
  floor.rotation.x = -Math.PI/2; floor.position.set(0,0,-14);
  scene.add(floor);

  for (let z = 6; z > -10; z -= 3){
    box(0.4, 3.2, 2.2, matSteel, -9.6, 1.6, z);
    box(0.4, 3.2, 2.2, matSteel, 9.6, 1.6, z);
    redLight(-9.3, 2.6, z, 1.6, 6); redLight(9.3, 2.6, z, 1.6, 6);
  }
  box(0.3, 3.2, 40, matDark, -11, 1.6, -10);
  box(0.3, 3.2, 40, matDark, 11, 1.6, -10);

  box(0.3, 3.2, 12, matDark, -11, 1.6, -18);
  box(0.3, 3.2, 12, matDark, 11, 1.6, -18);

  const terminal1 = box(1.1, 1.1, 0.5, matGlass, -3, 0.9, -16);
  redLight(-3, 1.5, -15.6, 2, 4);
  const terminal2 = box(1.1, 1.1, 0.5, matGlass, 3, 0.9, -20);
  redLight(3, 1.5, -19.6, 2, 4);

  const evPositions = [ [-2, 0.5, -12], [6, 0.5, -17], [-6, 0.5, -22] ];
  const evMeshes = evPositions.map(p => box(0.3,0.3,0.3, matRedGlow, p[0], p[1], p[2]));

  doorMesh = box(4, 3, 0.35, matSteel, 0, 1.5, -26);
  redLight(0, 2.4, -25.6, 2.4, 5);
  const doorPanel = box(0.5,0.5,0.1, matRedGlow, 2.4, 1.2, -25.8);

  box(0.3, 3.2, 22, matDark, -11, 1.6, -33);
  box(0.3, 3.2, 22, matDark, 11, 1.6, -33);
  for (let z = -29; z > -38; z -= 3){
    box(1, 2.6, 0.8, matSteel, -6, 1.3, z);
    box(1, 2.6, 0.8, matSteel, 6, 1.3, z);
    redLight(-6, 2.4, z, 1.4, 5); redLight(6, 2.4, z, 1.4, 5);
  }
  const finalTerminal = box(1.4, 1.3, 0.6, matGlass, 0, 0.9, -37);
  redLight(0, 1.6, -36.6, 2.4, 5);
  box(22, 3.2, 0.3, matDark, 0, 1.6, -39.5);

  // ---- player avatar (visible top-down, third-person) ----
  player = new THREE.Group();
  const pBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 1.0, 4, 8), matPlayer);
  pBody.position.y = 0.95;
  const pVisor = new THREE.Mesh(new THREE.BoxGeometry(0.26,0.06,0.05), matRedGlow);
  pVisor.position.set(0, 1.4, 0.3);
  player.add(pBody, pVisor);
  player.position.set(0, 0, 8);
  scene.add(player);

  // ---- guard ----
  const guardGroup = new THREE.Group();
  const gBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.05, 4, 8), matGuard);
  gBody.position.y = 0.95;
  const gVisor = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.07,0.05), matRedGlow);
  gVisor.position.set(0, 1.45, 0.3);
  guardGroup.add(gBody, gVisor);
  guardGroup.position.set(-3, 0, -14);
  scene.add(guardGroup);
  guard = { group: guardGroup, minZ:-19, maxZ:-9, speed:1.5, neutralized:false };

  interactables.push({ mesh:terminal1, type:'terminal', title:'WORKSTATION', label:'ANALYZE WORKSTATION', range:2.4, kind:'email', done:false });
  interactables.push({ mesh:terminal2, type:'terminal', title:'NETWORK LOG', label:'SCAN NETWORK LOG', range:2.4, kind:'network', done:false });
  evMeshes.forEach((m,i) => interactables.push({ mesh:m, type:'evidence', label:'COLLECT EVIDENCE', name:'Suspicious USB Device', range:1.8, id:i, done:false }));
  interactables.push({ mesh:doorPanel, type:'door', label:'DECODE ACCESS', range:2.4, done:false });
  interactables.push({ mesh:finalTerminal, type:'terminal', title:'CORE SYSTEM', label:'SECURE SYSTEM', range:2.4, kind:'final', done:false });
  interactables.push({ mesh:guardGroup, type:'guard', label:'CONFRONT', range:3.2, done:false });
}

/* ---------------------------------------------------------------------
   VIRTUAL JOYSTICK
   --------------------------------------------------------------------- */
let joyVec = {x:0, y:0};
function setupJoystick(){
  const zone = document.getElementById('joystick-zone');
  const stick = document.getElementById('joystick-stick');
  let active = false, pointerId = null, radius = 34;

  function setStick(dx, dy){
    const len = Math.hypot(dx,dy);
    const clamped = Math.min(len, radius);
    const ang = Math.atan2(dy,dx);
    const cx = Math.cos(ang)*clamped, cy = Math.sin(ang)*clamped;
    stick.style.transform = `translate(${cx}px, ${cy}px)`;
    joyVec.x = cx/radius; joyVec.y = cy/radius;
  }
  function reset(){
    stick.style.transform = 'translate(0,0)';
    joyVec.x = 0; joyVec.y = 0; active = false; pointerId = null;
  }
  zone.addEventListener('pointerdown', e => {
    active = true; pointerId = e.pointerId;
    zone.setPointerCapture(pointerId);
    const rect = zone.getBoundingClientRect();
    setStick(e.clientX-(rect.left+rect.width/2), e.clientY-(rect.top+rect.height/2));
  });
  zone.addEventListener('pointermove', e => {
    if (!active || e.pointerId !== pointerId) return;
    const rect = zone.getBoundingClientRect();
    setStick(e.clientX-(rect.left+rect.width/2), e.clientY-(rect.top+rect.height/2));
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev => zone.addEventListener(ev, reset));
}

/* ---------------------------------------------------------------------
   ACTION BUTTONS (run / aim / fire / pause / map)
   --------------------------------------------------------------------- */
function setupButtons(){
  document.getElementById('run-btn').onclick = (e) => {
    sprinting = !sprinting;
    e.currentTarget.classList.toggle('active', sprinting);
  };
  document.getElementById('aim-btn').onclick = (e) => {
    e.currentTarget.classList.toggle('active');
  };
  document.getElementById('fire-btn').onclick = fireWeapon;
  document.getElementById('pause-btn').onclick = () => showToast('PAUSED — (prototype: no pause menu yet)');
  document.getElementById('map-btn').onclick = () => document.getElementById('map-modal').classList.remove('hidden');
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => document.getElementById(b.dataset.close).classList.add('hidden'));
  document.getElementById('interact-prompt').addEventListener('click', () => { if (currentTarget) handleInteract(currentTarget); });
  window.addEventListener('keydown', e => { if (e.code === 'KeyE' && currentTarget && !anyModalOpen()) handleInteract(currentTarget); });
}

function fireWeapon(){
  if (anyModalOpen() || !guard || guard.neutralized) { showToast('NO TARGET'); return; }
  const dist = guard.group.position.distanceTo(player.position);
  if (dist < 7){
    neutralizeGuard();
  } else {
    showToast('OUT OF RANGE');
  }
}
function neutralizeGuard(){
  guard.group.visible = false;
  guard.neutralized = true;
  threat = Math.max(0, threat - 30);
  showToast('HOSTILE NEUTRALIZED');
}

/* ---------------------------------------------------------------------
   INTERACTION
   --------------------------------------------------------------------- */
function anyModalOpen(){
  return ['evidence-modal','enemy-modal','terminal-modal','door-modal','map-modal','mission-complete']
    .some(id => !document.getElementById(id).classList.contains('hidden'));
}
function findNearestInteractable(){
  let best = null, bestDist = Infinity;
  interactables.forEach(it => {
    if (it.done) return;
    if (it.type === 'door' && !doorLocked) return;
    if (it.type === 'terminal' && it.kind === 'final' && doorLocked) return;
    if (it.type === 'guard' && it.guardDoneFlag) return;
    const d = it.mesh.position.distanceTo(player.position);
    if (d > it.range) return;
    if (d < bestDist){ bestDist = d; best = it; }
  });
  return best;
}
const interactLabel = document.getElementById('interact-label');
const interactPrompt = document.getElementById('interact-prompt');

function handleInteract(it){
  switch(it.type){
    case 'terminal': openTerminal(it); break;
    case 'evidence': openEvidence(it); break;
    case 'door': openDoor(it); break;
    case 'guard': openEnemy(it); break;
  }
}

/* ---------- EVIDENCE MODAL ---------- */
function openEvidence(it){
  document.getElementById('evidence-item-name').textContent = it.name;
  document.getElementById('evidence-modal').classList.remove('hidden');
  document.getElementById('evidence-take-btn').onclick = () => {
    it.done = true;
    scene.remove(it.mesh);
    evidenceCollected++;
    showToast('EVIDENCE SECURED (' + evidenceCollected + '/' + evidenceTotal + ')');
    if (evidenceCollected >= evidenceTotal) completeObjective(4);
    document.getElementById('evidence-modal').classList.add('hidden');
  };
}

/* ---------- ENEMY MODAL ---------- */
function openEnemy(it){
  document.getElementById('enemy-modal').classList.remove('hidden');
  document.getElementById('enemy-eliminate-btn').onclick = () => {
    neutralizeGuard();
    document.getElementById('enemy-modal').classList.add('hidden');
  };
  document.getElementById('enemy-leave-btn').onclick = () => {
    document.getElementById('enemy-modal').classList.add('hidden');
  };
}

/* ---------- TERMINAL MODAL ---------- */
let terminalProgress = 0;
function openTerminal(it){
  terminalProgress = 0;
  document.getElementById('terminal-modal').classList.remove('hidden');
  document.querySelectorAll('.term-action-btn').forEach(b => { b.classList.remove('done'); b.disabled = false; });
  document.getElementById('terminal-remove-btn').disabled = true;

  document.querySelectorAll('.term-action-btn[data-action]').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.action === 'remove'){
        it.done = true;
        document.getElementById('terminal-modal').classList.add('hidden');
        if (it.kind === 'email'){
          showToast('MALICIOUS EMAIL IDENTIFIED');
          completeObjective(1); completeObjective(2); completeObjective(3);
        } else if (it.kind === 'network'){
          showToast('MALWARE PROCESS REMOVED');
        } else if (it.kind === 'final'){
          showToast('SYSTEM SECURED');
          completeObjective(7);
          finishMission();
        }
        return;
      }
      btn.classList.add('done');
      btn.disabled = true;
      terminalProgress++;
      if (terminalProgress >= 3) document.getElementById('terminal-remove-btn').disabled = false;
    };
  });
}

/* ---------- DOOR / ACCESS CODE PUZZLE ---------- */
const doorAnswer = '4092';
function openDoor(){
  if (evidenceCollected < evidenceTotal){
    showToast('INSUFFICIENT EVIDENCE — RECOVER ALL LOGS FIRST');
    return;
  }
  const row = document.getElementById('door-input-row');
  row.innerHTML = '';
  for (let i=0;i<4;i++){
    const inp = document.createElement('input');
    inp.className = 'door-digit'; inp.maxLength = 1;
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/[^0-9]/g,'').slice(0,1);
      const next = row.children[i+1];
      if (inp.value && next) next.focus();
    });
    row.appendChild(inp);
  }
  document.getElementById('door-hints').innerHTML = `
    <li>1. Access logs show 3:47 AM — maintenance staff.</li>
    <li>2. Second digit is even and less than 4.</li>
    <li>3. Final digit equals (1st digit) minus (2nd digit).</li>`;
  document.getElementById('door-feedback').textContent = '';
  document.getElementById('door-feedback').className = '';
  document.getElementById('door-modal').classList.remove('hidden');
  row.children[0].focus();

  document.getElementById('door-decode-btn').onclick = () => {
    const entered = Array.from(row.children).map(i => i.value).join('');
    const fb = document.getElementById('door-feedback');
    if (entered.length < 4){ fb.textContent = 'INCOMPLETE SEQUENCE'; fb.className='bad'; return; }
    if (entered === doorAnswer){
      fb.textContent = 'ACCESS GRANTED'; fb.className='good';
      setTimeout(() => { document.getElementById('door-modal').classList.add('hidden'); unlockDoor(); }, 600);
    } else {
      fb.textContent = 'ACCESS DENIED — THREAT RISING'; fb.className='bad';
      threat = Math.min(100, threat+15);
    }
  };
}
function unlockDoor(){
  doorLocked = false;
  completeObjective(5);
  const startY = doorMesh.position.y, targetY = startY+3.4, t0 = performance.now();
  (function slide(){
    const t = Math.min(1, (performance.now()-t0)/900);
    doorMesh.position.y = startY + (targetY-startY)*t;
    if (t<1) requestAnimationFrame(slide); else completeObjective(6);
  })();
  showToast('SECURITY DOOR UNLOCKED');
}

/* ---------------------------------------------------------------------
   MOVEMENT + CAMERA (fixed-angle isometric follow)
   --------------------------------------------------------------------- */
const camOffset = new THREE.Vector3(11, 15, 11);
const worldForward = new THREE.Vector3(-1,0,-1).normalize();
const worldRight = new THREE.Vector3(worldForward.z, 0, -worldForward.x);
let facingAngle = Math.PI;

function updateMovement(dt){
  const speed = (sprinting ? 6.5 : 3.6) * dt;
  const move = new THREE.Vector3()
    .addScaledVector(worldRight, joyVec.x)
    .addScaledVector(worldForward, -joyVec.y);
  if (move.lengthSq() > 0.0001){
    move.normalize().multiplyScalar(speed);
    player.position.add(move);
    const targetAngle = Math.atan2(move.x, move.z);
    let diff = targetAngle - facingAngle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    facingAngle += diff * Math.min(1, dt*10);
    player.rotation.y = facingAngle;
  }
  player.position.x = Math.max(-10, Math.min(10, player.position.x));
  player.position.z = Math.max(-38.5, Math.min(9, player.position.z));
  if (doorLocked && player.position.z < -25 && player.position.z > -27) player.position.z = -25;

  const desiredCamPos = player.position.clone().add(camOffset);
  camera.position.lerp(desiredCamPos, 0.12);
  camera.lookAt(player.position.clone().add(new THREE.Vector3(0,1.2,0)));
}

function updateGuard(dt){
  if (guard.neutralized) return;
  const g = guard.group;
  g.position.z += guard.speed*dt*guardDir;
  if (g.position.z < guard.minZ) guardDir = 1;
  if (g.position.z > guard.maxZ) guardDir = -1;
  g.rotation.y = guardDir > 0 ? Math.PI : 0;

  const dist = g.position.distanceTo(player.position);
  if (dist < 5) threat = Math.min(100, threat + dt*14);
  else threat = Math.max(0, threat - dt*6);
  if (threat >= 100) health = Math.max(0, health - dt*25);
}

/* ---------------------------------------------------------------------
   HUD LIVE UPDATE (health, interact prompt, radar)
   --------------------------------------------------------------------- */
function updateHud(){
  document.getElementById('health-fill').style.width = health.toFixed(0)+'%';
  document.getElementById('health-num').textContent = Math.round(health)+'/100';

  const target = findNearestInteractable();
  currentTarget = target;
  if (target){
    interactLabel.textContent = target.label;
    interactPrompt.classList.remove('hidden');
  } else {
    interactPrompt.classList.add('hidden');
  }

  updateRadar();
}

function updateRadar(){
  const radar = document.getElementById('radar');
  let dot = radar.querySelector('.radar-dot');
  if (!guard || guard.neutralized){ if (dot) dot.remove(); return; }
  const rel = guard.group.position.clone().sub(player.position);
  const rx = rel.dot(worldRight), ry = rel.dot(worldForward);
  const maxRange = 22, radius = 40;
  const dist = Math.hypot(rx,ry);
  if (dist > maxRange){ if (dot) dot.remove(); return; }
  if (!dot){ dot = document.createElement('div'); dot.className='radar-dot'; radar.appendChild(dot); }
  const px = 50 + (rx/maxRange)*radius;
  const py = 50 - (ry/maxRange)*radius;
  dot.style.left = px+'%'; dot.style.top = py+'%';
}

/* ---------------------------------------------------------------------
   MISSION COMPLETE
   --------------------------------------------------------------------- */
function finishMission(){
  if (missionComplete) return;
  missionComplete = true;
  setTimeout(() => document.getElementById('mission-complete').classList.remove('hidden'), 500);
}
document.getElementById('btn-next-mission').onclick = () => {
  document.getElementById('mission-complete').classList.add('hidden');
  document.getElementById('hud').classList.add('hidden');
  document.getElementById('game-canvas').classList.add('hidden');
  renderMissionList();
  showScreen('mission-list');
};

/* ---------------------------------------------------------------------
   MAIN LOOP
   --------------------------------------------------------------------- */
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  if (!anyModalOpen()){
    updateMovement(dt);
    updateGuard(dt);
  }
  updateHud();
  renderer.render(scene, camera);
}
