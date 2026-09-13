/* ============================================================
   CYBERHUNT
   Complete Game Script
   Three.js + Vanilla JS
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     CONFIG
     ============================================================ */

  const THREE_CDN =
    "https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js";

  const CONFIG = {
    maxPixelRatio: 1.8,
    moveSpeed: 7,
    sprintSpeed: 11,
    mouseSensitivity: 0.002,
    projectileSpeed: 38,
    enemyAttackDistance: 16,
    enemyAttackCooldown: 1.2,
    interactionDistance: 4.5,
    cinematicDuration: 12,
    autosave: true
  };

  /* ============================================================
     GAME DATA
     ============================================================ */

  const OPERATIVES = {
    RAVEN: {
      name: "RAVEN",
      role: "STEALTH OPERATIVE",
      description: "Silent infiltration and precision combat specialist.",
      color: 0x8b0018,
      speed: 8.2,
      health: 115,
      damage: 1.0
    },

    SPECTER: {
      name: "SPECTER",
      role: "RECON / HACKER",
      description: "Recon specialist equipped for long-range investigation.",
      color: 0x65000f,
      speed: 7.8,
      health: 105,
      damage: 1.15
    },

    VOLT: {
      name: "VOLT",
      role: "ASSAULT OPERATIVE",
      description: "Heavy combat operative with superior durability.",
      color: 0xb00020,
      speed: 6.7,
      health: 145,
      damage: 1.3
    },

    NOVA: {
      name: "NOVA",
      role: "CYBER ANALYST",
      description: "Technical specialist focused on digital threats.",
      color: 0x9d1026,
      speed: 7.5,
      health: 120,
      damage: 1.1
    }
  };

  const WEAPONS = {
    VANGUARD: {
      name: "VANGUARD AR",
      type: "ASSAULT RIFLE",
      damage: 25,
      fireRate: 0.13,
      range: 75,
      magazine: 30
    },

    PHANTOM: {
      name: "PHANTOM SMG",
      type: "SUBMACHINE GUN",
      damage: 17,
      fireRate: 0.075,
      range: 45,
      magazine: 36
    },

    WRAITH: {
      name: "WRAITH",
      type: "PRECISION RIFLE",
      damage: 75,
      fireRate: 0.65,
      range: 120,
      magazine: 8
    },

    REAPER: {
      name: "REAPER",
      type: "TACTICAL SHOTGUN",
      damage: 55,
      fireRate: 0.55,
      range: 25,
      magazine: 6
    },

    TWINFANG: {
      name: "TWIN FANG",
      type: "DUAL PISTOLS",
      damage: 21,
      fireRate: 0.18,
      range: 45,
      magazine: 24
    }
  };

  const MISSIONS = [
    {
      id: 1,
      title: "PHISHING BREACH",
      subtitle: "TRACE THE INITIAL INTRUSION",
      threat: "PHISHING",
      location: "SECTOR 01",
      objectives: [
        "Find suspicious email",
        "Inspect compromised terminal",
        "Collect digital evidence",
        "Identify phishing attempt",
        "Secure system"
      ],
      reward: {
        xp: 300,
        coins: 150
      }
    },

    {
      id: 2,
      title: "MALWARE INFILTRATION",
      subtitle: "LOCATE THE MALICIOUS PROCESS",
      threat: "MALWARE",
      location: "SECTOR 02",
      objectives: [
        "Locate infected workstation",
        "Scan suspicious process",
        "Collect malware evidence",
        "Trace network connection",
        "Isolate infected system"
      ],
      reward: {
        xp: 400,
        coins: 200
      }
    },

    {
      id: 3,
      title: "RANSOMWARE LOCKDOWN",
      subtitle: "STOP THE ENCRYPTION CASCADE",
      threat: "RANSOMWARE",
      location: "SECTOR 03",
      objectives: [
        "Reach security control room",
        "Analyze encrypted files",
        "Decode emergency access",
        "Disable ransomware node",
        "Restore system access"
      ],
      reward: {
        xp: 500,
        coins: 250
      }
    },

    {
      id: 4,
      title: "CREDENTIAL THEFT",
      subtitle: "IDENTIFY THE COMPROMISED ACCOUNT",
      threat: "CREDENTIAL THEFT",
      location: "SECTOR 04",
      objectives: [
        "Inspect authentication logs",
        "Find abnormal login",
        "Trace compromised account",
        "Decode security terminal",
        "Lock attacker out"
      ],
      reward: {
        xp: 600,
        coins: 300
      }
    },

    {
      id: 5,
      title: "ZERO-DAY RESPONSE",
      subtitle: "CONTAIN THE UNKNOWN THREAT",
      threat: "ZERO-DAY",
      location: "SECTOR 05",
      objectives: [
        "Detect unknown vulnerability",
        "Collect threat indicators",
        "Trace attack origin",
        "Defend core server",
        "Neutralize zero-day threat"
      ],
      reward: {
        xp: 1000,
        coins: 500
      }
    }
  ];

  /* ============================================================
     STATE
     ============================================================ */

  const defaultState = {
    level: 1,
    xp: 0,
    coins: 500,
    completedMissions: [],
    selectedMission: 1,
    selectedOperative: "RAVEN",
    selectedWeapon: "VANGUARD",
    evidence: [],
    badges: [],
    health: 100,
    ammo: 30,
    missionStarted: false,
    missionComplete: false,
    gameStarted: false,
    introFinished: false,
    currentObjective: 0,
    threatLevel: 0
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem("CYBERHUNT_SAVE");

      if (saved) {
        return {
          ...defaultState,
          ...JSON.parse(saved)
        };
      }
    } catch (error) {
      console.warn("Save data unavailable.");
    }

    return { ...defaultState };
  }

  function saveState() {
    if (!CONFIG.autosave) return;

    try {
      localStorage.setItem(
        "CYBERHUNT_SAVE",
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn("Unable to save game.");
    }
  }

  /* ============================================================
     DOM HELPERS
     ============================================================ */

  const $ = (id) => document.getElementById(id);

  function show(id) {
    const el = $(id);
    if (el) {
      el.classList.remove("hidden");
      el.style.display = "";
    }
  }

  function hide(id) {
    const el = $(id);
    if (el) {
      el.classList.add("hidden");
      el.style.display = "none";
    }
  }

  function text(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function html(id, value) {
    const el = $(id);
    if (el) el.innerHTML = value;
  }

  function addClass(id, cls) {
    const el = $(id);
    if (el) el.classList.add(cls);
  }

  function removeClass(id, cls) {
    const el = $(id);
    if (el) el.classList.remove(cls);
  }

  /* ============================================================
     DYNAMIC THREE.JS IMPORT
     ============================================================ */

  let THREE = null;

  async function loadThree() {
    if (window.THREE) {
      THREE = window.THREE;
      return THREE;
    }

    THREE = await import(THREE_CDN);
    return THREE;
  }

  /* ============================================================
     THREE.JS CORE
     ============================================================ */

  let scene;
  let camera;
  let renderer;
  let clock;

  let gameCanvas;

  let player;
  let playerWeapon;

  const enemies = [];
  const evidenceObjects = [];
  const terminals = [];
  const projectiles = [];
  const particles = [];
  const doors = [];
  const floatingLabels = [];

  let gameRunning = false;
  let cinematicRunning = false;

  let keys = {};
  let mouseX = 0;
  let mouseY = 0;

  let yaw = 0;
  let pitch = 0;

  let lastShot = 0;
  let lastEnemyAttack = 0;

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  async function init() {
    bindUI();

    updateGlobalHUD();

    await startCinematic();

    setupThree();

    buildEnvironment();

    buildPlayer();

    setupControls();

    animate();

    showMainMenu();
  }

  /* ============================================================
     CINEMATIC INTRO
     ============================================================ */

  async function startCinematic() {
    const intro = $("intro");

    if (!intro) {
      state.introFinished = true;
      return;
    }

    cinematicRunning = true;

    show("intro");

    const logo = intro.querySelector(".logo, .cyber-logo, #cyberLogo");
    const status =
      intro.querySelector(".status, .loading-status, #loadingStatus");

    if (logo) {
      logo.style.opacity = "0";
      logo.style.transform = "scale(1.08)";
    }

    if (status) {
      status.textContent = "INITIALIZING SECURE CHANNEL...";
    }

    await wait(700);

    if (status) {
      status.textContent = "ESTABLISHING ENCRYPTED CONNECTION...";
    }

    createIntroAtmosphere();

    await wait(900);

    if (status) {
      status.textContent = "SCANNING THREAT NETWORK...";
    }

    await wait(1000);

    if (status) {
      status.textContent = "THREAT DETECTED";
    }

    await wait(800);

    if (logo) {
      logo.style.transition =
        "opacity 1.4s ease, transform 1.4s ease";

      logo.style.opacity = "1";
      logo.style.transform = "scale(1)";
    }

    await wait(1500);

    if (status) {
      status.textContent = "CYBERHUNT ONLINE";
    }

    await wait(1000);

    cinematicRunning = false;
    state.introFinished = true;

    if (intro) {
      intro.style.transition = "opacity 1.2s ease";
      intro.style.opacity = "0";

      await wait(1200);

      intro.style.display = "none";
    }

    saveState();
  }

  function createIntroAtmosphere() {
    const intro = $("intro");
    if (!intro) return;

    intro.style.position = "fixed";
    intro.style.inset = "0";
    intro.style.overflow = "hidden";
    intro.style.background =
      "radial-gradient(circle at 50% 55%, rgba(90,0,15,.38), #020203 65%)";

    let facility = intro.querySelector(".intro-facility");

    if (!facility) {
      facility = document.createElement("div");
      facility.className = "intro-facility";

      facility.innerHTML = `
        <div class="intro-grid"></div>
        <div class="intro-scanline"></div>
        <div class="intro-red-light"></div>
        <div class="intro-server server-a"></div>
        <div class="intro-server server-b"></div>
        <div class="intro-server server-c"></div>
        <div class="intro-operative"></div>
        <div class="intro-vignette"></div>
      `;

      intro.appendChild(facility);

      const style = document.createElement("style");

      style.textContent = `
        .intro-facility{
          position:absolute;
          inset:0;
          pointer-events:none;
          perspective:1000px;
          background:
            linear-gradient(90deg,transparent 0%,rgba(130,0,20,.06) 50%,transparent 100%);
        }

        .intro-grid{
          position:absolute;
          inset:-30%;
          transform:perspective(600px) rotateX(67deg);
          background:
            linear-gradient(rgba(255,0,45,.08) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,0,45,.08) 1px,transparent 1px);
          background-size:55px 55px;
          animation:introGrid 8s linear infinite;
        }

        .intro-red-light{
          position:absolute;
          width:260px;
          height:260px;
          left:50%;
          top:48%;
          transform:translate(-50%,-50%);
          border-radius:50%;
          background:radial-gradient(circle,rgba(255,0,40,.35),rgba(255,0,40,.04) 45%,transparent 70%);
          filter:blur(12px);
          animation:introPulse 2.8s ease-in-out infinite;
        }

        .intro-server{
          position:absolute;
          width:110px;
          height:330px;
          bottom:5%;
          background:
            repeating-linear-gradient(
              to bottom,
              #151519 0px,
              #151519 19px,
              #060608 20px,
              #060608 28px
            );
          border:1px solid rgba(255,0,40,.25);
          box-shadow:
            0 0 30px rgba(255,0,40,.1),
            inset 0 0 20px rgba(255,0,40,.08);
          transform:perspective(700px) rotateY(18deg);
        }

        .server-a{left:6%}
        .server-b{right:7%;transform:perspective(700px) rotateY(-18deg)}
        .server-c{left:20%;bottom:-8%;opacity:.45}

        .intro-operative{
          position:absolute;
          width:90px;
          height:220px;
          left:50%;
          bottom:3%;
          transform:translateX(-50%);
          background:
            radial-gradient(circle at 50% 18%,#25252b 0 12%,transparent 13%),
            linear-gradient(90deg,transparent 15%,#09090b 16% 84%,transparent 85%);
          clip-path:polygon(
            42% 0,58% 0,
            70% 16%,74% 48%,
            90% 100%,10% 100%,
            26% 48%,30% 16%
          );
          filter:drop-shadow(0 0 16px rgba(255,0,40,.22));
          opacity:.72;
        }

        .intro-scanline{
          position:absolute;
          left:0;
          right:0;
          top:-10%;
          height:2px;
          background:rgba(255,0,40,.5);
          box-shadow:0 0 20px rgba(255,0,40,.6);
          animation:introScan 4s linear infinite;
        }

        .intro-vignette{
          position:absolute;
          inset:0;
          background:radial-gradient(circle,transparent 25%,rgba(0,0,0,.82) 100%);
        }

        @keyframes introGrid{
          from{transform:perspective(600px) rotateX(67deg) translateY(0)}
          to{transform:perspective(600px) rotateX(67deg) translateY(55px)}
        }

        @keyframes introPulse{
          0%,100%{opacity:.35;transform:translate(-50%,-50%) scale(.85)}
          50%{opacity:.8;transform:translate(-50%,-50%) scale(1.15)}
        }

        @keyframes introScan{
          from{top:-10%}
          to{top:110%}
        }
      `;

      document.head.appendChild(style);
    }
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /* ============================================================
     THREE SETUP
     ============================================================ */

  function setupThree() {
    gameCanvas = $("gameCanvas") || $("gameCanvas3D") || $("canvas");

    if (!gameCanvas) {
      gameCanvas = document.createElement("canvas");
      gameCanvas.id = "gameCanvas";

      document.body.appendChild(gameCanvas);
    }

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x020203);

    scene.fog = new THREE.FogExp2(
      0x050508,
      0.012
    );

    camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    camera.position.set(0, 2, 8);

    renderer = new THREE.WebGLRenderer({
      canvas: gameCanvas,
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

    clock = new THREE.Clock();

    window.addEventListener(
      "resize",
      onResize
    );
  }

  function onResize() {
    if (!camera || !renderer) return;

    camera.aspect =
      window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }

  /* ============================================================
     LIGHTING
     ============================================================ */

  function addLights() {
    const ambient =
      new THREE.AmbientLight(
        0x303038,
        1.4
      );

    scene.add(ambient);

    const red = new THREE.PointLight(
      0xff0038,
      12,
      70
    );

    red.position.set(
      -10,
      7,
      -12
    );

    red.castShadow = true;

    scene.add(red);

    const red2 =
      new THREE.PointLight(
        0x9c001f,
        9,
        55
      );

    red2.position.set(
      16,
      5,
      -4
    );

    scene.add(red2);

    const white =
      new THREE.PointLight(
        0xbfc4cf,
        5,
        45
      );

    white.position.set(
      0,
      10,
      0
    );

    scene.add(white);
  }

  /* ============================================================
     ENVIRONMENT
     ============================================================ */

  function buildEnvironment() {
    clearWorld();

    addLights();

    buildFloor();

    buildWalls();

    buildServerRooms();

    buildControlCenter();

    buildWalkways();

    buildDoors();

    buildDecorations();

    createTerminals();

    createEvidence();

    createEnemies();

    createMissionObjectiveMarkers();

    buildCeiling();

    buildHolograms();
  }

  function clearWorld() {
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }

    enemies.length = 0;
    evidenceObjects.length = 0;
    terminals.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    doors.length = 0;
  }

  function material(
    color,
    roughness = 0.55,
    metalness = 0.35
  ) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  function emissiveMaterial(
    color,
    intensity = 1
  ) {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.35,
      metalness: 0.5
    });
  }

  function box(
    w,
    h,
    d,
    mat,
    x,
    y,
    z
  ) {
    const mesh =
      new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        mat
      );

    mesh.position.set(x, y, z);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
  }

  function buildFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(
        180,
        180
      ),
      material(
        0x09090c,
        0.72,
        0.65
      )
    );

    floor.rotation.x =
      -Math.PI / 2;

    floor.receiveShadow = true;

    scene.add(floor);

    const grid =
      new THREE.GridHelper(
        180,
        90,
        0x33000a,
        0x180006
      );

    grid.position.y = 0.02;

    scene.add(grid);
  }

  function buildWalls() {
    const wallMat =
      material(
        0x101014,
        0.8,
        0.55
      );

    const redMat =
      emissiveMaterial(
        0x57000d,
        0.8
      );

    const positions = [
      [0, 6, -48, 96, 12, 2],
      [0, 6, 48, 96, 12, 2],
      [-48, 6, 0, 2, 12, 96],
      [48, 6, 0, 2, 12, 96]
    ];

    positions.forEach(
      p => box(
        p[3],
        p[4],
        p[5],
        wallMat,
        p[0],
        p[1],
        p[2]
      )
    );

    for (
      let x = -45;
      x <= 45;
      x += 10
    ) {
      box(
        0.15,
        0.12,
        94,
        redMat,
        x,
        0.08,
        0
      );
    }

    for (
      let z = -40;
      z <= 40;
      z += 10
    ) {
      box(
        94,
        0.12,
        0.15,
        redMat,
        0,
        0.08,
        z
      );
    }
  }

  function buildServerRooms() {
    const serverMat =
      material(
        0x15151b,
        0.38,
        0.78
      );

    const screenMat =
      emissiveMaterial(
        0xff002f,
        1.6
      );

    const groups = [
      [-31, -25],
      [31, -25],
      [-31, 22],
      [31, 22]
    ];

    groups.forEach(
      ([gx, gz]) => {
        for (
          let i = 0;
          i < 5;
          i++
        ) {
          const rack = box(
            3,
            7,
            2,
            serverMat,
            gx + i * 4,
            3.5,
            gz
          );

          for (
            let j = 0;
            j < 5;
            j++
          ) {
            box(
              2.1,
              0.12,
              0.08,
              screenMat,
              rack.position.x,
              1.5 + j * 1.05,
              rack.position.z - 1.06
            );
          }
        }
      }
    );
  }

  function buildControlCenter() {
    const baseMat =
      material(
        0x111116,
        0.32,
        0.8
      );

    const glow =
      emissiveMaterial(
        0x8c001a,
        1.4
      );

    box(
      20,
      0.5,
      12,
      baseMat,
      0,
      0.5,
      0
    );

    for (
      let x = -8;
      x <= 8;
      x += 4
    ) {
      box(
        2.7,
        2.5,
        1.2,
        baseMat,
        x,
        1.7,
        -2
      );

      box(
        2.2,
        1.1,
        0.08,
        glow,
        x,
        2.2,
        -2.65
      );
    }

    const central =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          2,
          2,
          5,
          24
        ),
        material(
          0x16161c,
          0.25,
          0.9
        )
      );

    central.position.set(
      0,
      3,
      3
    );

    central.castShadow = true;

    scene.add(central);

    for (
      let i = 0;
      i < 3;
      i++
    ) {
      const ring =
        new THREE.Mesh(
          new THREE.TorusGeometry(
            2.3 + i * 0.2,
            0.035,
            8,
            48
          ),
          glow
        );

      ring.rotation.x =
        Math.PI / 2;

      ring.position.set(
        0,
        2 + i * 0.8,
        3
      );

      scene.add(ring);
    }
  }

  function buildWalkways() {
    const metal =
      material(
        0x202027,
        0.45,
        0.9
      );

    for (
      let z = -40;
      z <= 40;
      z += 10
    ) {
      box(
        4,
        0.4,
        7,
        metal,
        -10,
        0.35,
        z
      );

      box(
        4,
        0.4,
        7,
        metal,
        10,
        0.35,
        z
      );
    }
  }

  function buildDoors() {
    const positions = [
      [-20, 0, 0],
      [20, 0, 0],
      [0, 0, -22],
      [0, 0, 22]
    ];

    positions.forEach(
      ([x, y, z], index) => {
        const doorMat =
          material(
            0x111116,
            0.28,
            0.8
          );

        const door = box(
          5,
          5.5,
          0.6,
          doorMat,
          x,
          2.75,
          z
        );

        door.userData = {
          id: index,
          locked: index > 0,
          open: false,
          originalY: 2.75
        };

        doors.push(door);

        const indicator =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              0.25,
              2,
              0.1
            ),
            emissiveMaterial(
              index === 0
                ? 0x00ff77
                : 0xff002f,
              2
            )
          );

        indicator.position.set(
          x + (x > 0 ? -3 : 3),
          2.8,
          z
        );

        scene.add(indicator);
      }
    );
  }

  function buildDecorations() {
    const pillarMat =
      material(
        0x121219,
        0.35,
        0.75
      );

    for (
      let x = -40;
      x <= 40;
      x += 20
    ) {
      for (
        let z = -40;
        z <= 40;
        z += 20
      ) {
        if (
          Math.abs(x) < 12 &&
          Math.abs(z) < 12
        ) continue;

        box(
          1.4,
          8,
          1.4,
          pillarMat,
          x,
          4,
          z
        );
      }
    }

    for (
      let i = 0;
      i < 20;
      i++
    ) {
      const x =
        -42 +
        Math.random() * 84;

      const z =
        -42 +
        Math.random() * 84;

      const panel =
        box(
          2,
          1.2,
          0.1,
          emissiveMaterial(
            0x3a0010,
            1.2
          ),
          x,
          4 +
            Math.random() * 3,
          z
        );

      panel.rotation.y =
        Math.random() * Math.PI;
    }
  }

  function buildCeiling() {
    for (
      let x = -40;
      x <= 40;
      x += 10
    ) {
      box(
        0.15,
        0.15,
        80,
        material(
          0x24242b,
          0.5,
          0.8
        ),
        x,
        11,
        0
      );
    }
  }

  function buildHolograms() {
    const holoMat =
      new THREE.MeshBasicMaterial({
        color: 0xff0038,
        transparent: true,
        opacity: 0.18,
        wireframe: true
      });

    for (
      let i = 0;
      i < 5;
      i++
    ) {
      const holo =
        new THREE.Mesh(
          new THREE.IcosahedronGeometry(
            2.2,
            1
          ),
          holoMat.clone()
        );

      holo.position.set(
        -35 + i * 17,
        4,
        36
      );

      holo.userData.hologram = true;

      scene.add(holo);
    }
  }

  /* ============================================================
     PLAYER
     ============================================================ */

  function buildPlayer() {
    if (player) {
      scene.remove(player);
    }

    player =
      createOperative(
        OPERATIVES[state.selectedOperative]
      );

    player.position.set(
      0,
      0,
      12
    );

    scene.add(player);

    camera.position.set(
      0,
      3.1,
      17
    );

    yaw = 0;
    pitch = -0.08;

    playerWeapon =
      createWeapon(
        WEAPONS[state.selectedWeapon]
      );

    camera.add(playerWeapon);

    scene.add(camera);

    state.health =
      OPERATIVES[
        state.selectedOperative
      ].health;

    state.ammo =
      WEAPONS[
        state.selectedWeapon
      ].magazine;

    updateGameHUD();
  }

  function createOperative(data) {
    const root =
      new THREE.Group();

    root.userData.isPlayer = true;

    const dark =
      material(
        0x09090d,
        0.38,
        0.78
      );

    const armor =
      material(
        data.color,
        0.35,
        0.72
      );

    const skin =
      material(
        0x8a6251,
        0.8,
        0
      );

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.48,
          20,
          20
        ),
        skin
      );

    head.position.y =
      3.35;

    head.scale.set(
      0.82,
      1,
      0.85
    );

    root.add(head);

    const helmet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.53,
          20,
          12,
          0,
          Math.PI * 2,
          0,
          Math.PI * 0.62
        ),
        dark
      );

    helmet.position.y =
      3.48;

    root.add(helmet);

    const torso =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.35,
          1.65,
          0.72
        ),
        armor
      );

    torso.position.y =
      2.25;

    torso.rotation.z =
      0.02;

    root.add(torso);

    const chest =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.8,
          0.7,
          0.78
        ),
        dark
      );

    chest.position.set(
      0,
      2.35,
      -0.38
    );

    root.add(chest);

    const hip =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.2,
          0.55,
          0.7
        ),
        dark
      );

    hip.position.y =
      1.35;

    root.add(hip);

    createLimb(
      root,
      -0.43,
      1.0,
      0.28,
      1.55,
      dark
    );

    createLimb(
      root,
      0.43,
      1.0,
      0.28,
      1.55,
      dark
    );

    createLimb(
      root,
      -0.82,
      2.2,
      0.24,
      1.45,
      dark
    );

    createLimb(
      root,
      0.82,
      2.2,
      0.24,
      1.45,
      dark
    );

    const visor =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.6,
          0.12,
          0.1
        ),
        emissiveMaterial(
          0xff0038,
          2
        )
      );

    visor.position.set(
      0,
      3.42,
      -0.45
    );

    root.add(visor);

    return root;
  }

  function createLimb(
    root,
    x,
    y,
    width,
    height,
    mat
  ) {
    const limb =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          width,
          height,
          width
        ),
        mat
      );

    limb.position.set(
      x,
      y,
      0
    );

    root.add(limb);

    return limb;
  }

  /* ============================================================
     WEAPON
     ============================================================ */

  function createWeapon(data) {
    const group =
      new THREE.Group();

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.18,
          0.2,
          1.25
        ),
        material(
          0x101014,
          0.25,
          0.9
        )
      );

    body.position.z =
      -0.7;

    group.add(body);

    const barrel =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.045,
          0.055,
          0.8,
          10
        ),
        material(
          0x050507,
          0.18,
          0.95
        )
      );

    barrel.rotation.x =
      Math.PI / 2;

    barrel.position.z =
      -1.55;

    group.add(barrel);

    const red =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.04,
          0.04,
          0.65
        ),
        emissiveMaterial(
          0xff0038,
          3
        )
      );

    red.position.set(
      0,
      0.11,
      -0.65
    );

    group.add(red);

    const grip =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.14,
          0.48,
          0.18
        ),
        material(
          0x09090c,
          0.35,
          0.75
        )
      );

    grip.position.set(
      0,
      -0.3,
      -0.2
    );

    grip.rotation.x =
      -0.25;

    group.add(grip);

    group.position.set(
      0.58,
      -0.5,
      -1.0
    );

    group.rotation.y =
      -0.03;

    group.userData.weapon =
      data;

    return group;
  }

  /* ============================================================
     TERMINALS
     ============================================================ */

  function createTerminals() {
    const positions = [
      [-8, 0, 4],
      [8, 0, 4],
      [-25, 0, 12],
      [25, 0, 12],
      [0, 0, -12]
    ];

    positions.forEach(
      ([x, y, z], index) => {
        const base =
          box(
            1.7,
            1.5,
            1,
            material(
              0x121218,
              0.35,
              0.8
            ),
            x,
            0.75,
            z
          );

        const screen =
          box(
            1.3,
            0.8,
            0.08,
            emissiveMaterial(
              0x85001b,
              1.8
            ),
            x,
            1.15,
            z - 0.54
          );

        const terminal = {
          mesh: base,
          screen,
          id: index,
          used: false,
          type:
            index % 2 === 0
              ? "THREAT TERMINAL"
              : "SECURITY TERMINAL"
        };

        base.userData.terminal =
          terminal;

        terminals.push(
          terminal
        );
      }
    );
  }

  /* ============================================================
     EVIDENCE
     ============================================================ */

  function createEvidence() {
    const items = [
      {
        type: "USB",
        name: "SUSPICIOUS USB",
        x: -15,
        z: 8,
        physical: true
      },
      {
        type: "DOCUMENT",
        name: "PRINTED SECURITY REPORT",
        x: 15,
        z: 8,
        physical: true
      },
      {
        type: "ACCESS",
        name: "UNKNOWN ACCESS CARD",
        x: -14,
        z: -8,
        physical: true
      },
      {
        type: "EMAIL",
        name: "SUSPICIOUS EMAIL",
        x: 13,
        z: -8,
        digital: true
      },
      {
        type: "FILE",
        name: "MALICIOUS FILE",
        x: -6,
        z: -15,
        digital: true
      },
      {
        type: "LOG",
        name: "LOGIN RECORD",
        x: 7,
        z: -15,
        digital: true
      }
    ];

    items.forEach(
      (item, index) => {
        const mesh =
          createEvidenceMesh(
            item.type
          );

        mesh.position.set(
          item.x,
          0.5,
          item.z
        );

        mesh.userData.evidence =
          {
            ...item,
            id: index,
            collected: false
          };

        scene.add(mesh);

        evidenceObjects.push(
          mesh
        );
      }
    );
  }

  function createEvidenceMesh(type) {
    let geometry;
    let mat;

    if (type === "USB") {
      geometry =
        new THREE.BoxGeometry(
          0.25,
          0.12,
          0.65
        );
      mat =
        emissiveMaterial(
          0xff0038,
          2
        );
    } else if (
      type === "DOCUMENT"
    ) {
      geometry =
        new THREE.BoxGeometry(
          0.7,
          0.03,
          0.5
        );
      mat =
        material(
          0xb8b8bd,
          0.9,
          0
        );
    } else if (
      type === "ACCESS"
    ) {
      geometry =
        new THREE.BoxGeometry(
          0.55,
          0.05,
          0.85
        );
      mat =
        material(
          0x25252d,
          0.35,
          0.8
        );
    } else {
      geometry =
        new THREE.OctahedronGeometry(
          0.38
        );

      mat =
        emissiveMaterial(
          0xff0038,
          2.5
        );
    }

    const mesh =
      new THREE.Mesh(
        geometry,
        mat
      );

    mesh.castShadow = true;

    return mesh;
  }

  /* ============================================================
     ENEMIES
     ============================================================ */

  function createEnemies() {
    const locations = [
      [-30, 0, 5],
      [30, 0, 5],
      [-24, 0, -18],
      [24, 0, -18],
      [-5, 0, -30],
      [12, 0, 30]
    ];

    locations.forEach(
      ([x, y, z], index) => {
        const enemy =
          createEnemy(index);

        enemy.position.set(
          x,
          y,
          z
        );

        scene.add(enemy);

        enemies.push(enemy);
      }
    );
  }

  function createEnemy(index) {
    const root =
      new THREE.Group();

    root.userData.enemy = true;

    const bodyMat =
      material(
        0x0b0b0e,
        0.32,
        0.75
      );

    const redMat =
      emissiveMaterial(
        0xff001f,
        2.5
      );

    const body =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          1.1,
          1.5,
          0.65
        ),
        bodyMat
      );

    body.position.y =
      2.0;

    root.add(body);

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.4,
          14,
          14
        ),
        bodyMat
      );

    head.position.y =
      3.1;

    root.add(head);

    const visor =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.48,
          0.08,
          0.08
        ),
        redMat
      );

    visor.position.set(
      0,
      3.1,
      -0.39
    );

    root.add(visor);

    const weapon =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          0.12,
          0.12,
          1
        ),
        bodyMat
      );

    weapon.position.set(
      0.7,
      2.15,
      -0.3
    );

    root.add(weapon);

    root.userData.health =
      100;

    root.userData.maxHealth =
      100;

    root.userData.index =
      index;

    root.userData.speed =
      1.5 +
      Math.random() * 0.8;

    return root;
  }

  /* ============================================================
     OBJECTIVE MARKERS
     ============================================================ */

  function createMissionObjectiveMarkers() {
    const markerPositions = [
      [-10, 0, 10],
      [10, 0, 10],
      [-10, 0, -10],
      [10, 0, -10],
      [0, 0, -25]
    ];

    markerPositions.forEach(
      ([x, y, z], index) => {
        const ring =
          new THREE.Mesh(
            new THREE.RingGeometry(
              0.8,
              0.95,
              32
            ),
            new THREE.MeshBasicMaterial({
              color: 0xff0038,
              transparent: true,
              opacity: 0.55,
              side: THREE.DoubleSide
            })
          );

        ring.rotation.x =
          -Math.PI / 2;

        ring.position.set(
          x,
          0.04,
          z
        );

        ring.userData.objective =
          index;

        scene.add(ring);
      }
    );
  }

  /* ============================================================
     GAME CONTROLS
     ============================================================ */

  function setupControls() {
    window.addEventListener(
      "keydown",
      e => {
        keys[e.code] = true;

        if (
          e.code === "KeyE"
        ) {
          interact();
        }

        if (
          e.code === "KeyR"
        ) {
          reloadWeapon();
        }

        if (
          e.code === "KeyM"
        ) {
          openMap();
        }

        if (
          e.code === "Escape"
        ) {
          togglePause();
        }
      }
    );

    window.addEventListener(
      "keyup",
      e => {
        keys[e.code] = false;
      }
    );

    window.addEventListener(
      "mousemove",
      e => {
        if (!gameRunning) return;

        if (
          document.pointerLockElement ===
          renderer.domElement
        ) {
          yaw -=
            e.movementX *
            CONFIG.mouseSensitivity;

          pitch -=
            e.movementY *
            CONFIG.mouseSensitivity;

          pitch = Math.max(
            -0.55,
            Math.min(
              0.55,
              pitch
            )
          );
        }
      }
    );

    window.addEventListener(
      "mousedown",
      e => {
        if (
          e.button === 0 &&
          gameRunning
        ) {
          shoot();
        }
      }
    );

    if (renderer) {
      renderer.domElement.addEventListener(
        "click",
        () => {
          if (
            gameRunning &&
            renderer.domElement.requestPointerLock
          ) {
            renderer.domElement.requestPointerLock();
          }
        }
      );
    }
  }

  /* ============================================================
     PLAYER MOVEMENT
     ============================================================ */

  function updatePlayer(delta) {
    if (
      !player ||
      !gameRunning
    ) return;

    const direction =
      new THREE.Vector3();

    if (keys.KeyW)
      direction.z -= 1;

    if (keys.KeyS)
      direction.z += 1;

    if (keys.KeyA)
      direction.x -= 1;

    if (keys.KeyD)
      direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();

      const speed =
        keys.ShiftLeft ||
        keys.ShiftRight
          ? CONFIG.sprintSpeed
          : CONFIG.moveSpeed;

      const rotated =
        direction.clone();

      rotated.applyAxisAngle(
        new THREE.Vector3(
          0,
          1,
          0
        ),
        yaw
      );

      player.position.add(
        rotated.multiplyScalar(
          speed * delta
        )
      );

      player.position.x =
        THREE.MathUtils.clamp(
          player.position.x,
          -43,
          43
        );

      player.position.z =
        THREE.MathUtils.clamp(
          player.position.z,
          -43,
          43
        );
    }

    player.rotation.y =
      yaw;

    const targetCamera =
      new THREE.Vector3(
        0,
        3.0,
        6.8
      );

    targetCamera.applyAxisAngle(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      yaw
    );

    camera.position.copy(
      player.position
    ).add(
      targetCamera
    );

    camera.rotation.order =
      "YXZ";

    camera.rotation.y =
      yaw;

    camera.rotation.x =
      pitch;

    updateInteractionPrompt();
  }

  /* ============================================================
     SHOOTING
     ============================================================ */

  function shoot() {
    const now =
      performance.now() /
      1000;

    const weapon =
      WEAPONS[
        state.selectedWeapon
      ];

    if (
      now - lastShot <
      weapon.fireRate
    ) return;

    if (
      state.ammo <= 0
    ) {
      showToast(
        "MAGAZINE EMPTY — PRESS R TO RELOAD"
      );

      return;
    }

    lastShot = now;

    state.ammo--;

    updateGameHUD();

    createProjectile();

    weaponRecoil();

    createMuzzleFlash();
  }

  function createProjectile() {
    const bullet =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          0.055,
          8,
          8
        ),
        emissiveMaterial(
          0xff0038,
          4
        )
      );

    const origin =
      new THREE.Vector3();

    camera.getWorldPosition(
      origin
    );

    const direction =
      new THREE.Vector3(
        0,
        0,
        -1
      );

    direction.applyQuaternion(
      camera.quaternion
    );

    bullet.position.copy(
      origin
    );

    bullet.userData.velocity =
      direction.multiplyScalar(
        CONFIG.projectileSpeed
      );

    bullet.userData.life =
      2.5;

    scene.add(bullet);

    projectiles.push(
      bullet
    );
  }

  function updateProjectiles(delta) {
    for (
      let i =
        projectiles.length - 1;
      i >= 0;
      i--
    ) {
      const p =
        projectiles[i];

      p.position.add(
        p.userData.velocity
          .clone()
          .multiplyScalar(delta)
      );

      p.userData.life -=
        delta;

      let hit = false;

      for (
        let j = 0;
        j < enemies.length;
        j++
      ) {
        const enemy =
          enemies[j];

        if (
          enemy.userData.health <=
          0
        ) continue;

        if (
          p.position.distanceTo(
            enemy.position
          ) < 1.3
        ) {
          damageEnemy(
            enemy,
            WEAPONS[
              state.selectedWeapon
            ].damage *
              OPERATIVES[
                state.selectedOperative
              ].damage
          );

          hit = true;

          break;
        }
      }

      if (
        hit ||
        p.userData.life <= 0
      ) {
        scene.remove(p);

        projectiles.splice(
          i,
          1
        );
      }
    }
  }

  function damageEnemy(
    enemy,
    amount
  ) {
    enemy.userData.health -=
      amount;

    enemy.scale.y =
      Math.max(
        0.4,
        enemy.userData.health /
          enemy.userData.maxHealth
      );

    createHitEffect(
      enemy.position
    );

    if (
      enemy.userData.health <=
      0
    ) {
      enemy.userData.health = 0;

      createExplosion(
        enemy.position
      );

      enemy.visible = false;

      state.xp += 50;

      updateGlobalHUD();
    }
  }

  function weaponRecoil() {
    if (!playerWeapon)
      return;

    playerWeapon.rotation.x =
      -0.12;

    setTimeout(() => {
      if (playerWeapon) {
        playerWeapon.rotation.x =
          0;
      }
    }, 60);
  }

  function createMuzzleFlash() {
    const flash =
      new THREE.PointLight(
        0xff0038,
        10,
        5
      );

    const pos =
      new THREE.Vector3();

    playerWeapon.getWorldPosition(
      pos
    );

    flash.position.copy(
      pos
    );

    scene.add(flash);

    setTimeout(
      () => scene.remove(flash),
      45
    );
  }

  function reloadWeapon() {
    state.ammo =
      WEAPONS[
        state.selectedWeapon
      ].magazine;

    updateGameHUD();

    showToast(
      "WEAPON RELOADED"
    );
  }

  /* ============================================================
     ENEMY AI
     ============================================================ */

  function updateEnemies(delta) {
    if (!player) return;

    const now =
      performance.now() /
      1000;

    for (
      const enemy of enemies
    ) {
      if (
        !enemy.visible ||
        enemy.userData.health <= 0
      ) continue;

      const distance =
        enemy.position.distanceTo(
          player.position
        );

      if (
        distance <
        CONFIG.enemyAttackDistance
      ) {
        const direction =
          player.position
            .clone()
            .sub(enemy.position);

        direction.y = 0;

        if (
          direction.lengthSq() >
          1
        ) {
          direction.normalize();

          enemy.position.add(
            direction.multiplyScalar(
              enemy.userData.speed *
                delta
            )
          );
        }

        enemy.lookAt(
          player.position.x,
          enemy.position.y,
          player.position.z
        );

        if (
          now - lastEnemyAttack >
          CONFIG.enemyAttackCooldown
        ) {
          lastEnemyAttack =
            now;

          damagePlayer(
            5 +
              Math.random() * 5
          );
        }
      }
    }
  }

  function damagePlayer(
    amount
  ) {
    state.health -=
      amount;

    if (
      state.health < 0
    ) {
      state.health = 0;
    }

    updateGameHUD();

    if (
      state.health <= 0
    ) {
      defeatMission();
    }
  }

  /* ============================================================
     INTERACTION
     ============================================================ */

  function getNearestObject() {
    if (!player)
      return null;

    let nearest = null;
    let distance =
      Infinity;

    [
      ...evidenceObjects,
      ...terminals.map(
        t => t.mesh
      ),
      ...doors
    ].forEach(
      object => {
        const d =
          player.position.distanceTo(
            object.position
          );

        if (
          d <
          distance
        ) {
          distance = d;
          nearest = object;
        }
      }
    );

    if (
      distance <=
      CONFIG.interactionDistance
    ) {
      return nearest;
    }

    return null;
  }

  function interact() {
    const object =
      getNearestObject();

    if (!object) {
      showToast(
        "NO INTERACTIVE OBJECT NEARBY"
      );

      return;
    }

    if (
      object.userData.evidence
    ) {
      collectEvidence(
        object
      );

      return;
    }

    if (
      object.userData.terminal
    ) {
      openTerminal(
        object.userData.terminal
      );

      return;
    }

    if (
      object.userData.locked
    ) {
      openPuzzle();

      return;
    }
  }

  function updateInteractionPrompt() {
    const object =
      getNearestObject();

    const prompt =
      $("interactionPrompt");

    if (!prompt)
      return;

    if (!object) {
      prompt.style.opacity =
        "0";

      return;
    }

    let label =
      "PRESS E TO INTERACT";

    if (
      object.userData.evidence
    ) {
      label =
        `E — INVESTIGATE ${object.userData.evidence.name}`;
    } else if (
      object.userData.terminal
    ) {
      label =
        "E — ACCESS SECURITY TERMINAL";
    } else if (
      object.userData.locked
    ) {
      label =
        "E — DECODE SECURITY DOOR";
    }

    prompt.textContent =
      label;

    prompt.style.opacity =
      "1";
  }

  /* ============================================================
     EVIDENCE SYSTEM
     ============================================================ */

  function collectEvidence(
    object
  ) {
    const data =
      object.userData.evidence;

    if (
      data.collected
    ) return;

    openEvidenceModal(
      object
    );
  }

  function openEvidenceModal(
    object
  ) {
    const data =
      object.userData.evidence;

    const modal =
      $("evidenceModal");

    if (!modal) {
      collectEvidenceDirectly(
        object
      );

      return;
    }

    show("evidenceModal");

    text(
      "evidenceTitle",
      data.name
    );

    text(
      "evidenceType",
      data.physical
        ? "PHYSICAL EVIDENCE"
        : "DIGITAL EVIDENCE"
    );

    text(
      "evidenceDescription",
      getEvidenceDescription(
        data.type
      )
    );

    modal.dataset.objectId =
      data.id;
  }

  function getEvidenceDescription(
    type
  ) {
    const descriptions = {
      USB:
        "A suspicious removable device discovered inside the facility.",
      DOCUMENT:
        "A printed security report containing unusual access information.",
      ACCESS:
        "An unidentified access card with restricted clearance.",
      EMAIL:
        "An email containing suspicious sender information and a malicious link.",
      FILE:
        "An unknown executable file detected on a compromised workstation.",
      LOG:
        "A login record showing unusual authentication activity."
    };

    return (
      descriptions[type] ||
      "Potentially important evidence."
    );
  }

  function collectEvidenceDirectly(
    object
  ) {
    const data =
      object.userData.evidence;

    if (
      data.collected
    ) return;

    data.collected = true;

    object.visible = false;

    state.evidence.push(
      data.name
    );

    state.xp += 75;

    updateGlobalHUD();

    updateObjectiveProgress();

    showToast(
      `EVIDENCE COLLECTED: ${data.name}`
    );

    saveState();
  }

  /* ============================================================
     TERMINAL SYSTEM
     ============================================================ */

  function openTerminal(
    terminal
  ) {
    show("terminalModal");

    text(
      "terminalTitle",
      terminal.type
    );

    text(
      "terminalStatus",
      terminal.used
        ? "SYSTEM ANALYSIS COMPLETE"
        : "UNAUTHORIZED ACTIVITY DETECTED"
    );

    window.currentTerminal =
      terminal;
  }

  function terminalAction(
    action
  ) {
    const terminal =
      window.currentTerminal;

    if (!terminal) return;

    terminal.used = true;

    let message = "";

    switch (action) {
      case "SCAN":
        message =
          "SCAN COMPLETE — SUSPICIOUS PROCESS IDENTIFIED";
        break;

      case "TRACE":
        message =
          "TRACE COMPLETE — CONNECTION ORIGIN LOCATED";
        break;

      case "ISOLATE":
        message =
          "SYSTEM ISOLATED — THREAT CONTAINED";
        state.xp += 100;
        break;

      case "REMOVE":
        message =
          "MALICIOUS COMPONENT REMOVED";
        state.xp += 125;
        break;

      default:
        message =
          "SECURITY ACTION EXECUTED";
    }

    text(
      "terminalStatus",
      message
    );

    updateGlobalHUD();

    updateObjectiveProgress();

    showToast(
      message
    );

    saveState();
  }

  /* ============================================================
     PUZZLE SYSTEM
     ============================================================ */

  function openPuzzle() {
    show("puzzleModal");

    const code =
      generateSecurityCode();

    window.currentPuzzleCode =
      code;

    text(
      "puzzleCode",
      code
    );
  }

  function generateSecurityCode() {
    const chars =
      "7392045816";

    let code = "";

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      code +=
        chars[
          Math.floor(
            Math.random() *
              chars.length
          )
        ];
    }

    return code;
  }

  function submitPuzzle() {
    const input =
      $("puzzleInput");

    if (!input)
      return;

    const answer =
      input.value.trim();

    if (
      answer ===
      window.currentPuzzleCode
    ) {
      unlockNearestDoor();

      hide("puzzleModal");

      state.xp += 150;

      updateGlobalHUD();

      updateObjectiveProgress();

      showToast(
        "ACCESS CODE ACCEPTED — SECURITY DOOR UNLOCKED"
      );

      saveState();
    } else {
      showToast(
        "INVALID CODE — ACCESS DENIED"
      );

      damagePlayer(3);
    }
  }

  function unlockNearestDoor() {
    if (!player)
      return;

    let nearest = null;
    let min =
      Infinity;

    doors.forEach(
      door => {
        if (
          !door.userData.locked
        ) return;

        const d =
          player.position.distanceTo(
            door.position
          );

        if (
          d < min
        ) {
          min = d;
          nearest = door;
        }
      }
    );

    if (!nearest)
      return;

    nearest.userData.locked =
      false;

    nearest.userData.open =
      true;

    nearest.userData.targetY =
      7.5;
  }

  /* ============================================================
     DOORS
     ============================================================ */

  function updateDoors(delta) {
    doors.forEach(
      door => {
        if (
          !door.userData.open
        ) return;

        door.position.y =
          THREE.MathUtils.lerp(
            door.position.y,
            7.5,
            delta * 4
          );
      }
    );
  }

  /* ============================================================
     EFFECTS
     ============================================================ */

  function createHitEffect(
    position
  ) {
    for (
      let i = 0;
      i < 6;
      i++
    ) {
      const p =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.035,
            6,
            6
          ),
          emissiveMaterial(
            0xff0038,
            3
          )
        );

      p.position.copy(
        position
      );

      p.userData.velocity =
        new THREE.Vector3(
          (Math.random() - 0.5) *
            5,
          Math.random() * 4,
          (Math.random() - 0.5) *
            5
        );

      p.userData.life =
        0.35;

      scene.add(p);

      particles.push(p);
    }
  }

  function createExplosion(
    position
  ) {
    for (
      let i = 0;
      i < 18;
      i++
    ) {
      const p =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            0.08,
            6,
            6
          ),
          emissiveMaterial(
            0xff002f,
            4
          )
        );

      p.position.copy(
        position
      );

      p.userData.velocity =
        new THREE.Vector3(
          (Math.random() - 0.5) *
            9,
          Math.random() * 8,
          (Math.random() - 0.5) *
            9
        );

      p.userData.life =
        0.8;

      scene.add(p);

      particles.push(p);
    }
  }

  function updateParticles(
    delta
  ) {
    for (
      let i =
        particles.length - 1;
      i >= 0;
      i--
    ) {
      const p =
        particles[i];

      p.position.add(
        p.userData.velocity
          .clone()
          .multiplyScalar(delta)
      );

      p.userData.velocity.y -=
        7 * delta;

      p.userData.life -=
        delta;

      p.scale.multiplyScalar(
        0.96
      );

      if (
        p.userData.life <= 0
      ) {
        scene.remove(p);

        particles.splice(
          i,
          1
        );
      }
    }
  }

  /* ============================================================
     ANIMATION
     ============================================================ */

  function animate() {
    requestAnimationFrame(
      animate
    );

    if (
      !renderer ||
      !scene ||
      !camera
    ) return;

    const delta =
      Math.min(
        clock.getDelta(),
        0.05
      );

    if (gameRunning) {
      updatePlayer(delta);

      updateEnemies(delta);

      updateProjectiles(delta);

      updateParticles(delta);

      updateDoors(delta);

      animateHolograms();

      updateMissionLogic();
    }

    renderer.render(
      scene,
      camera
    );
  }

  function animateHolograms() {
    scene.traverse(
      object => {
        if (
          object.userData.hologram
        ) {
          object.rotation.y +=
            0.006;

          object.rotation.x +=
            0.002;

          object.material.opacity =
            0.12 +
            Math.sin(
              performance.now() *
                0.002
            ) *
              0.04;
        }
      }
    );
  }

  /* ============================================================
     MISSION SYSTEM
     ============================================================ */

  function startMission(
    missionId
  ) {
    const mission =
      MISSIONS.find(
        m =>
          m.id ===
          missionId
      );

    if (!mission)
      return;

    state.selectedMission =
      missionId;

    state.currentObjective =
      0;

    state.evidence = [];

    state.health =
      OPERATIVES[
        state.selectedOperative
      ].health;

    state.ammo =
      WEAPONS[
        state.selectedWeapon
      ].magazine;

    state.missionStarted =
      true;

    state.missionComplete =
      false;

    gameRunning = true;

    buildEnvironment();

    buildPlayer();

    hideAllScreens();

    show("gameScreen");

    updateMissionHUD();

    showToast(
      `MISSION ${String(
        mission.id
      ).padStart(
        2,
        "0"
      )} — ${mission.title}`
    );

    saveState();
  }

  function updateMissionLogic() {
    if (
      !state.missionStarted
    ) return;

    const mission =
      MISSIONS.find(
        m =>
          m.id ===
          state.selectedMission
      );

    if (!mission)
      return;

    const progress =
      calculateMissionProgress(
        mission
      );

    if (
      progress >=
      mission.objectives.length
    ) {
      completeMission();
    }
  }

  function calculateMissionProgress(
    mission
  ) {
    let progress = 0;

    if (
      state.currentObjective >
      0
    ) {
      progress =
        state.currentObjective;
    }

    const evidenceCount =
      state.evidence.length;

    progress +=
      Math.min(
        evidenceCount,
        2
      );

    const terminalsUsed =
      terminals.filter(
        t => t.used
      ).length;

    progress +=
      Math.min(
        terminalsUsed,
        2
      );

    const deadEnemies =
      enemies.filter(
        e =>
          e.userData.health <=
          0
      ).length;

    if (
      deadEnemies >= 3
    ) {
      progress++;
    }

    return Math.min(
      progress,
      mission.objectives.length
    );
  }

  function updateObjectiveProgress() {
    const mission =
      MISSIONS.find(
        m =>
          m.id ===
          state.selectedMission
      );

    if (!mission)
      return;

    const calculated =
      calculateMissionProgress(
        mission
      );

    state.currentObjective =
      Math.min(
        calculated,
        mission.objectives.length
      );

    updateMissionHUD();
  }

  function completeMission() {
    if (
      state.missionComplete
    ) return;

    state.missionComplete =
      true;

    gameRunning = false;

    const mission =
      MISSIONS.find(
        m =>
          m.id ===
          state.selectedMission
      );

    if (!mission)
      return;

    if (
      !state.completedMissions.includes(
        mission.id
      )
    ) {
      state.completedMissions.push(
        mission.id
      );

      state.xp +=
        mission.reward.xp;

      state.coins +=
        mission.reward.coins;

      unlockBadge(
        mission.id
      );

      checkLevelUp();
    }

    updateGlobalHUD();

    openMissionComplete(
      mission
    );

    saveState();
  }

  function unlockBadge(
    missionId
  ) {
    const badge =
      `MISSION_${missionId}`;

    if (
      !state.badges.includes(
        badge
      )
    ) {
      state.badges.push(
        badge
      );
    }
  }

  function checkLevelUp() {
    const required =
      state.level *
      500;

    if (
      state.xp >=
      required
    ) {
      state.xp -=
        required;

      state.level++;

      showToast(
        `LEVEL UP — LEVEL ${state.level}`
      );
    }
  }

  function openMissionComplete(
    mission
  ) {
    show(
      "missionCompleteModal"
    );

    text(
      "completeMissionTitle",
      mission.title
    );

    text(
      "completeRewardXP",
      `+${mission.reward.xp} XP`
    );

    text(
      "completeRewardCoins",
      `+${mission.reward.coins} COINS`
    );

    text(
      "completeLevel",
      `LEVEL ${state.level}`
    );

    if (
      state.completedMissions.length >=
      MISSIONS.length
    ) {
      text(
        "completeStatus",
        "CYBERHUNT COMPLETE"
      );
    } else {
      text(
        "completeStatus",
        "MISSION COMPLETE"
      );
    }
  }

  /* ============================================================
     DEFEAT
     ============================================================ */

  function defeatMission() {
    gameRunning = false;

    show(
      "defeatModal"
    );

    text(
      "defeatMessage",
      "OPERATIVE DOWN — SECURITY BREACH UNCONTAINED"
    );
  }

  /* ============================================================
     PAUSE
     ============================================================ */

  function togglePause() {
    if (
      !state.missionStarted ||
      state.missionComplete
    ) return;

    if (gameRunning) {
      gameRunning = false;

      show("pauseModal");
    } else {
      hide("pauseModal");

      gameRunning = true;
    }
  }

  /* ============================================================
     MAP
     ============================================================ */

  function openMap() {
    show("mapModal");
  }

  /* ============================================================
     HUD
     ============================================================ */

  function updateGlobalHUD() {
    text(
      "levelValue",
      state.level
    );

    text(
      "xpValue",
      state.xp
    );

    text(
      "coinsValue",
      state.coins
    );

    text(
      "menuLevel",
      `LEVEL ${state.level}`
    );

    text(
      "menuXP",
      `${state.xp} XP`
    );

    text(
      "menuCoins",
      `${state.coins} COINS`
    );
  }

  function updateGameHUD() {
    text(
      "healthValue",
      Math.max(
        0,
        Math.round(
          state.health
        )
      )
    );

    text(
      "ammoValue",
      state.ammo
    );

    text(
      "weaponValue",
      WEAPONS[
        state.selectedWeapon
      ].name
    );

    const healthBar =
      $("healthBar");

    if (healthBar) {
      healthBar.style.width =
        `${Math.max(
          0,
          state.health
        ) /
          OPERATIVES[
            state.selectedOperative
          ].health *
          100}%`;
    }
  }

  function updateMissionHUD() {
    const mission =
      MISSIONS.find(
        m =>
          m.id ===
          state.selectedMission
      );

    if (!mission)
      return;

    text(
      "missionTitle",
      `MISSION ${String(
        mission.id
      ).padStart(
        2,
        "0"
      )} — ${mission.title}`
    );

    text(
      "missionThreat",
      mission.threat
    );

    text(
      "missionLocation",
      mission.location
    );

    const list =
      $("objectiveList");

    if (!list)
      return;

    list.innerHTML =
      mission.objectives
        .map(
          (
            objective,
            index
          ) => `
          <div class="objective ${
            index <
            state.currentObjective
              ? "completed"
              : ""
          }">
            <span>
              ${
                index <
                state.currentObjective
                  ? "✓"
                  : "□"
              }
            </span>
            ${objective}
          </div>
        `
        )
        .join("");

    text(
      "evidenceCount",
      state.evidence.length
    );

    text(
      "threatStatus",
      state.threatLevel > 70
        ? "CRITICAL"
        : state.threatLevel > 35
        ? "ELEVATED"
        : "STABLE"
    );

    updateGameHUD();
  }

  /* ============================================================
     MAIN MENU
     ============================================================ */

  function showMainMenu() {
    gameRunning = false;

    hideAllScreens();

    show("mainMenu");

    updateGlobalHUD();
  }

  function openMissionSelect() {
    hideAllScreens();

    show(
      "missionSelect"
    );

    renderMissionCards();
  }

  function renderMissionCards() {
    const container =
      $("missionCards");

    if (!container)
      return;

    container.innerHTML =
      MISSIONS.map(
        mission => {
          const completed =
            state.completedMissions.includes(
              mission.id
            );

          const unlocked =
            mission.id === 1 ||
            state.completedMissions.includes(
              mission.id - 1
            );

          return `
            <button
              class="mission-card ${
                completed
                  ? "completed"
                  : ""
              } ${
                !unlocked
                  ? "locked"
                  : ""
              }"
              data-mission="${
                mission.id
              }"
              ${
                !unlocked
                  ? "disabled"
                  : ""
              }
            >
              <div class="mission-number">
                0${mission.id}
              </div>

              <div class="mission-info">
                <h3>
                  ${mission.title}
                </h3>

                <p>
                  ${mission.subtitle}
                </p>

                <span>
                  ${
                    completed
                      ? "✓ COMPLETED"
                      : unlocked
                      ? "AVAILABLE"
                      : "LOCKED"
                  }
                </span>
              </div>

              <div class="mission-threat">
                ${mission.threat}
              </div>
            </button>
          `;
        }
      ).join("");

    container
      .querySelectorAll(
        "[data-mission]"
      )
      .forEach(
        card => {
          card.addEventListener(
            "click",
            () => {
              startMission(
                Number(
                  card.dataset
                    .mission
                )
              );
            }
          );
        }
      );
  }

  /* ============================================================
     OPERATIVE MENU
     ============================================================ */

  function openOperatives() {
    hideAllScreens();

    show(
      "operativeSelect"
    );

    renderOperatives();
  }

  function renderOperatives() {
    const container =
      $("operativeCards");

    if (!container)
      return;

    container.innerHTML =
      Object.values(
        OPERATIVES
      )
        .map(
          operative => `
          <button
            class="operative-card ${
              state.selectedOperative ===
              operative.name
                ? "selected"
                : ""
            }"
            data-operative="${
              operative.name
            }"
          >
            <div class="operative-preview">
              <div class="operative-silhouette"></div>
            </div>

            <h3>
              ${operative.name}
            </h3>

            <strong>
              ${operative.role}
            </strong>

            <p>
              ${operative.description}
            </p>

            <div class="operative-stats">
              <span>
                HP ${operative.health}
              </span>

              <span>
                SPD ${operative.speed}
              </span>
            </div>
          </button>
        `
        )
        .join("");

    container
      .querySelectorAll(
        "[data-operative]"
      )
      .forEach(
        card => {
          card.addEventListener(
            "click",
            () => {
              state.selectedOperative =
                card.dataset
                  .operative;

              renderOperatives();

              saveState();
            }
          );
        }
      );
  }

  /* ============================================================
     ARMORY
     ============================================================ */

  function openArmory() {
    hideAllScreens();

    show("armory");

    renderWeapons();
  }

  function renderWeapons() {
    const container =
      $("weaponCards");

    if (!container)
      return;

    container.innerHTML =
      Object.entries(
        WEAPONS
      )
        .map(
          ([
            id,
            weapon
          ]) => `
          <button
            class="weapon-card ${
              state.selectedWeapon ===
              id
                ? "selected"
                : ""
            }"
            data-weapon="${id}"
          >
            <div class="weapon-visual">
              <div class="weapon-placeholder">
                ${weapon.type}
              </div>
            </div>

            <h3>
              ${weapon.name}
            </h3>

            <span>
              ${weapon.type}
            </span>

            <div class="weapon-stats">
              <b>DAMAGE</b>
              <i>
                ${weapon.damage}
              </i>

              <b>RANGE</b>
              <i>
                ${weapon.range}
              </i>

              <b>MAG</b>
              <i>
                ${weapon.magazine}
              </i>
            </div>
          </button>
        `
        )
        .join("");

    container
      .querySelectorAll(
        "[data-weapon]"
      )
      .forEach(
        card => {
          card.addEventListener(
            "click",
            () => {
              state.selectedWeapon =
                card.dataset.weapon;

              renderWeapons();

              saveState();
            }
          );
        }
      );
  }

  /* ============================================================
     SCREEN MANAGEMENT
     ============================================================ */

  function hideAllScreens() {
    [
      "mainMenu",
      "missionSelect",
      "operativeSelect",
      "armory",
      "gameScreen",
      "pauseModal",
      "mapModal",
      "terminalModal",
      "evidenceModal",
      "puzzleModal",
      "missionCompleteModal",
      "defeatModal"
    ].forEach(
      id => hide(id)
    );
  }

  /* ============================================================
     UI BINDING
     ============================================================ */

  function bindUI() {
    bindButton(
      "startMissionBtn",
      () =>
        openMissionSelect()
    );

    bindButton(
      "startBtn",
      () =>
        openMissionSelect()
    );

    bindButton(
      "missionBtn",
      () =>
        openMissionSelect()
    );

    bindButton(
      "operativesBtn",
      () =>
        openOperatives()
    );

    bindButton(
      "operativeBtn",
      () =>
        openOperatives()
    );

    bindButton(
      "armoryBtn",
      () =>
        openArmory()
    );

    bindButton(
      "backToMenuBtn",
      () =>
        showMainMenu()
    );

    bindButton(
      "backMissionBtn",
      () =>
        showMainMenu()
    );

    bindButton(
      "backOperativeBtn",
      () =>
        showMainMenu()
    );

    bindButton(
      "backArmoryBtn",
      () =>
        showMainMenu()
    );

    bindButton(
      "resumeBtn",
      () =>
        togglePause()
    );

    bindButton(
      "pauseResumeBtn",
      () =>
        togglePause()
    );

    bindButton(
      "mapBtn",
      () =>
        openMap()
    );

    bindButton(
      "closeMapBtn",
      () =>
        hide("mapModal")
    );

    bindButton(
      "closeTerminalBtn",
      () =>
        hide("terminalModal")
    );

    bindButton(
      "closeEvidenceBtn",
      () =>
        hide("evidenceModal")
    );

    bindButton(
      "closePuzzleBtn",
      () =>
        hide("puzzleModal")
    );

    bindButton(
      "submitPuzzleBtn",
      () =>
        submitPuzzle()
    );

    bindButton(
      "retryBtn",
      () => {
        hide(
          "defeatModal"
        );

        startMission(
          state.selectedMission
        );
      }
    );

    bindButton(
      "completeContinueBtn",
      () => {
        hide(
          "missionCompleteModal"
        );

        if (
          state.completedMissions.length >=
          MISSIONS.length
        ) {
          showFinalComplete();
        } else {
          openMissionSelect();
        }
      }
    );

    bindButton(
      "nextMissionBtn",
      () => {
        hide(
          "missionCompleteModal"
        );

        const next =
          state.selectedMission +
          1;

        if (
          next <= MISSIONS.length
        ) {
          startMission(
            next
          );
        } else {
          showFinalComplete();
        }
      }
    );

    document
      .querySelectorAll(
        "[data-terminal-action]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              terminalAction(
                button.dataset
                  .terminalAction
              );
            }
          );
        }
      );

    document
      .querySelectorAll(
        "[data-evidence-action]"
      )
      .forEach(
        button => {
          button.addEventListener(
            "click",
            () => {
              evidenceAction(
                button.dataset
                  .evidenceAction
              );
            }
          );
        }
      );
  }

  function bindButton(
    id,
    callback
  ) {
    const element = $(id);

    if (!element)
      return;

    element.addEventListener(
      "click",
      event => {
        event.preventDefault();

        callback();
      }
    );
  }

  /* ============================================================
     EVIDENCE ACTIONS
     ============================================================ */

  function evidenceAction(
    action
  ) {
    const modal =
      $("evidenceModal");

    if (!modal)
      return;

    const id =
      Number(
        modal.dataset.objectId
      );

    const object =
      evidenceObjects.find(
        e =>
          e.userData.evidence
            ?.id === id
      );

    if (!object)
      return;

    switch (action) {
      case "ANALYZE":
        showToast(
          "EVIDENCE ANALYZED — INDICATORS CONFIRMED"
        );

        collectEvidenceDirectly(
          object
        );

        break;

      case "ISOLATE":
        showToast(
          "EVIDENCE ISOLATED"
        );

        collectEvidenceDirectly(
          object
        );

        break;

      case "IGNORE":
        showToast(
          "EVIDENCE MARKED FOR LATER"
        );

        break;

      case "LEAVE":
        showToast(
          "INVESTIGATION CONTINUES"
        );

        break;
    }

    hide(
      "evidenceModal"
    );
  }

  /* ============================================================
     FINAL STATE
     ============================================================ */

  function showFinalComplete() {
    hideAllScreens();

    show("missionCompleteModal");

    text(
      "completeMissionTitle",
      "CYBERHUNT"
    );

    text(
      "completeStatus",
      "CYBERHUNT COMPLETE"
    );

    text(
      "completeRewardXP",
      "ALL OPERATIONS CLEARED"
    );

    text(
      "completeRewardCoins",
      `${state.coins} COINS`
    );

    text(
      "completeLevel",
      `LEVEL ${state.level}`
    );
  }

  /* ============================================================
     TOAST
     ============================================================ */

  function showToast(
    message
  ) {
    let toast =
      $("cyberToast");

    if (!toast) {
      toast =
        document.createElement(
          "div"
        );

      toast.id =
        "cyberToast";

      toast.style.position =
        "fixed";

      toast.style.left =
        "50%";

      toast.style.bottom =
        "70px";

      toast.style.transform =
        "translateX(-50%)";

      toast.style.zIndex =
        "99999";

      toast.style.padding =
        "12px 22px";

      toast.style.background =
        "rgba(5,5,8,.94)";

      toast.style.border =
        "1px solid rgba(255,0,45,.65)";

      toast.style.color =
        "#fff";

      toast.style.fontFamily =
        "Orbitron, sans-serif";

      toast.style.fontSize =
        "12px";

      toast.style.letterSpacing =
        "1.5px";

      toast.style.boxShadow =
        "0 0 30px rgba(255,0,45,.18)";

      toast.style.pointerEvents =
        "none";

      document.body.appendChild(
        toast
      );
    }

    toast.textContent =
      message;

    toast.style.opacity =
      "1";

    clearTimeout(
      toast._timer
    );

    toast._timer =
      setTimeout(
        () => {
          toast.style.opacity =
            "0";
        },
        2600
      );
  }

  /* ============================================================
     BOOT
     ============================================================ */

  window.CyberHunt = {
    state,
    missions: MISSIONS,
    operatives: OPERATIVES,
    weapons: WEAPONS,

    startMission,
    openMissionSelect,
    openOperatives,
    openArmory,
    showMainMenu,
    saveState
  };

  loadThree()
    .then(
      () => init()
    )
    .catch(
      error => {
        console.error(
          "CYBERHUNT INITIALIZATION ERROR:",
          error
        );

        const intro =
          $("intro");

        if (intro) {
          intro.style.opacity =
            "1";

          const status =
            intro.querySelector(
              ".status, .loading-status, #loadingStatus"
            );

          if (status) {
            status.textContent =
              "INITIALIZATION ERROR — REFRESH TO RETRY";
          }
        }
      }
    );

})();
