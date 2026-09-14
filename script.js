import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
/*
=========================================================
                    CYBERHUNT
=========================================================

5 LEVEL WEBGL CYBER SECURITY GAME

FEATURES
---------------------------------------------------------
• Three.js WebGL
• Player movement
• Shooting
• Enemy AI
• Physical evidence
• Digital threats
• Security terminals
• Decryption
• Locked doors
• XP
• Level progression
• Mission progression
• Badges
• Boss
• Tactical minimap
• Mobile controls

=========================================================
*/

// ============================================================
// CYBERHUNT — MODEL SETTINGS
// ============================================================

const MODEL_PATHS = {
    girlAgent: 'assets/models/girl-agent.glb',
    boyAgent: 'assets/models/boy-agent.glb',
    enemy: 'assets/models/enemy.glb'
};

const USE_CUSTOM_MODELS = true;

let selectedOperative = 'girl';


// ============================================================
// CYBERHUNT — THEME
// ============================================================

const CYBERHUNT_THEME = {
    black: 0x050507,
    dark: 0x0b0b0f,
    crimson: 0x8f1028,
    brightCrimson: 0xff1744,
    neonRed: 0xff3155,
    steel: 0x555862
};
/*
=========================================================
                     MISSIONS
=========================================================
*/

const MISSIONS = [

  {

    id: 1,

    title:
      'PHISHING BREACH',

    zone:
      'A1 // CORPORATE WING',

    desc:
      'Trace a phishing operation and secure the physical evidence before the guards erase it.',

    objectives: [

      {
        id: 'code',
        text: 'Find the access code',
        target: 1
      },

      {
        id: 'guards',
        text: 'Eliminate the guards',
        target: 3
      },

      {
        id: 'evidence',
        text: 'Collect the evidence',
        target: 1
      }

    ],

    xp: 250,

    code: '3142',

    badge:
      'PHISHING HUNTER',

    threat:
      'PHISHING'

  },


  {

    id: 2,

    title:
      'MALWARE INFILTRATION',

    zone:
      'B2 // NETWORK LAB',

    desc:
      'A compromised workstation is spreading malware. Isolate the node, eliminate hostile operatives and unlock the server room.',

    objectives: [

      {
        id: 'terminal',
        text: 'Analyze the security terminal',
        target: 1
      },

      {
        id: 'guards',
        text: 'Eliminate the guards',
        target: 4
      },

      {
        id: 'evidence',
        text: 'Collect the evidence',
        target: 1
      }

    ],

    xp: 350,

    code: '7285',

    badge:
      'MALWARE TRACKER',

    threat:
      'MALWARE'

  },


  {

    id: 3,

    title:
      'RANSOMWARE LOCKDOWN',

    zone:
      'C3 // SERVER VAULT',

    desc:
      'The facility is locked down. Find the infected terminal, disable the ransomware and extract the encrypted evidence.',

    objectives: [

      {
        id: 'terminal',
        text: 'Find the infected terminal',
        target: 1
      },

      {
        id: 'guards',
        text: 'Eliminate the guards',
        target: 5
      },

      {
        id: 'malware',
        text: 'Disable the malware',
        target: 1
      }

    ],

    xp: 450,

    code: '1907',

    badge:
      'LOCKDOWN BREAKER',

    threat:
      'RANSOMWARE'

  },


  {

    id: 4,

    title:
      'CREDENTIAL THEFT',

    zone:
      'D4 // IDENTITY CORE',

    desc:
      'An insider has stolen privileged credentials. Decode the identity core and stop the exfiltration.',

    objectives: [

      {
        id: 'evidence',
        text: 'Find credential evidence',
        target: 2
      },

      {
        id: 'guards',
        text: 'Eliminate hostile operatives',
        target: 6
      },

      {
        id: 'terminal',
        text: 'Decrypt the identity core',
        target: 1
      }

    ],

    xp: 600,

    code: '6429',

    badge:
      'CREDENTIAL HUNTER',

    threat:
      'ESPIONAGE'

  },


  {

    id: 5,

    title:
      'MITM ATTACK',

    zone:
      'NEXUS // CORE SERVER',

    desc:
      'Final operation. A hostile network actor is intercepting the core traffic. Secure the server and neutralize the commander.',

    objectives: [

      {
        id: 'terminal',
        text: 'Reach the core terminal',
        target: 1
      },

      {
        id: 'guards',
        text: 'Eliminate the defenders',
        target: 7
      },

      {
        id: 'boss',
        text: 'Neutralize the network commander',
        target: 1
      }

    ],

    xp: 1000,

    code: '8503',

    badge:
      'NETWORK SENTINEL',

    threat:
      'MITM'

  }

];



/*
=========================================================
                     BADGES
=========================================================
*/

const BADGES = [

  [
    'CYBER DETECTIVE',
    'Complete your first investigation'
  ],

  [
    'PHISHING HUNTER',
    'Stop the phishing breach'
  ],

  [
    'MALWARE TRACKER',
    'Trace and isolate malware'
  ],

  [
    'LOCKDOWN BREAKER',
    'Escape the ransomware lockdown'
  ],

  [
    'CREDENTIAL HUNTER',
    'Recover stolen credentials'
  ],

  [
    'NETWORK SENTINEL',
    'Secure the core network'
  ]

];



/*
=========================================================
                     GAME STATE
=========================================================
*/

const state = {

  level: 1,

  xp: 0,

  health: 100,

  maxHealth: 100,

  ammo: 12,

  reserve: 48,

  mission: null,

  paused: false,

  objectiveProgress: {},

  evidenceCollected: 0,

  guardsDefeated: 0,

  currentInteractable: null,

  decryptInput: '',

  unlockedMissions: 1,

  completed: new Set(),

  badges: new Set(),

  accuracyShots: 0,

  accuracyHits: 0

};



/*
=========================================================
                     THREE.JS VARIABLES
=========================================================
*/

let scene;

let camera;

let renderer;

let clock;

let raycaster;

let player;

let playerGroup;

let playerVelocity =
  new THREE.Vector3();

let keys = {};

let mouse = {

  x: 0,

  y: 0,

  down: false

};



let modelCache = {};



let world = {

  objects: [],

  enemies: [],

  interactables: [],

  doors: [],

  effects: []

};



let gameRunning = false;

let lastShot = 0;



/*
=========================================================
                     HELPER
=========================================================
*/

const $ = id =>
  document.getElementById(id);



/*
=========================================================
                     SCREEN SYSTEM
=========================================================
*/

function show(id) {

  document
    .querySelectorAll(
      '.overlay-screen,.menu-screen,.game-screen'
    )
    .forEach(
      el =>
        el.classList.add('hidden')
    );

  $(id)
    .classList
    .remove('hidden');

}



function hide(id) {

  $(id)
    .classList
    .add('hidden');

}



/*
=========================================================
                     TOAST
=========================================================
*/

function toast(text) {

  const t =
    $('toast');

  t.textContent =
    text;

  t.classList
    .add('show');

  clearTimeout(
    toast.timer
  );

  toast.timer =
    setTimeout(
      () =>
        t.classList.remove('show'),
      1800
    );

}



/*
=========================================================
                     BOOT
=========================================================
*/

window.addEventListener(
  'load',
  () => {

    setTimeout(
      () => {

        $('boot-screen')
          .classList
          .add('hidden');

        $('app')
          .classList
          .remove('hidden');

        initUI();

        updateProfileUI();

      },
      2300
    );

  }
);



/*
=========================================================
                     UI INIT
=========================================================
*/

function initUI() {


  /*
  START MISSION
  */

  $('begin-mission')
    .onclick =
    () => {

      show('mission-screen');

      renderMissionGrid();

    };



  /*
  MAIN MENU BUTTONS
  */

  document
    .querySelectorAll(
      '[data-screen]'
    )
    .forEach(
      btn => {

        btn.onclick =
          () => {

            const s =
              btn.dataset.screen;


            if (
              s === 'missions'
            ) {

              show(
                'mission-screen'
              );

              renderMissionGrid();

            }


            if (
              s === 'operative'
            ) {

              show(
                'operative-screen'
              );

            }


            if (
              s === 'arsenal'
            ) {

              show(
                'arsenal-screen'
              );

            }


            if (
              s === 'badges'
            ) {

              show(
                'badges-screen'
              );

              renderBadges();

            }

          };

      }
    );



  /*
  CLOSE BUTTONS
  */

  document
    .querySelectorAll(
      '[data-close]'
    )
    .forEach(
      b =>
        b.onclick =
          () =>
            show(
              'start-screen'
            )
    );



  /*
  PAUSE
  */

  $('pause-btn')
    .onclick =
    togglePause;


  $('resume-btn')
    .onclick =
    togglePause;



  /*
  RESTART
  */

  $('restart-btn')
    .onclick =
    () =>
      startMission(
        state.level
      );



  /*
  EXIT
  */

  $('exit-btn')
    .onclick =
    () => {

      gameRunning =
        false;

      show(
        'start-screen'
      );

    };



  /*
  DECRYPT CLOSE
  */

  $('decrypt-close')
    .onclick =
    () =>
      hide(
        'decrypt-screen'
      );



  /*
  DECODE
  */

  $('decode-btn')
    .onclick =
    checkCode;



  /*
  EVIDENCE
  */

  $('collect-evidence')
    .onclick =
    collectEvidence;


  $('leave-evidence')
    .onclick =
    () =>
      hide(
        'evidence-screen'
      );



  /*
  INTERACTION
  */

  $('interact-primary')
    .onclick =
    handleInteraction;


  $('mobile-interact')
    .onclick =
    handleInteraction;



  /*
  SHOOT
  */

  $('mobile-shoot')
    .onclick =
    () =>
      shoot();


  $('shoot-btn')
    .onclick =
    () =>
      shoot();



  /*
  SPRINT
  */

  $('sprint-btn')
    .onclick =
    () => {

      keys.Shift =
        true;

      setTimeout(
        () =>
          keys.Shift =
            false,
        250
      );

    };



  /*
  NEXT LEVEL
  */

  $('next-mission')
    .onclick =
    () => {

      if (
        state.level <
        5
      ) {

        startMission(
          state.level + 1
        );

      }

      else {

        show(
          'start-screen'
        );

      }

    };



  /*
  MISSION SELECT
  */

  $('complete-menu')
    .onclick =
    () => {

      show(
        'mission-screen'
      );

      renderMissionGrid();

    };



  /*
  KEYBOARD
  */

  window.addEventListener(
    'keydown',
    e => {

      keys[e.code] =
        true;


      if (
        e.code ===
        'KeyE'
      ) {

        handleInteraction();

      }


      if (
        e.code ===
        'Escape'
      ) {

        togglePause();

      }


      if (
        e.code ===
        'Space'
      ) {

        shoot();

      }


      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight'
        ].includes(
          e.code
        )
      ) {

        e.preventDefault();

      }

    }
  );



  window.addEventListener(
    'keyup',
    e =>
      keys[e.code] =
        false
  );



  /*
  MOUSE
  */

  window.addEventListener(
    'mousemove',
    e => {

      mouse.x =
        (e.clientX /
          innerWidth) *
        2 - 1;

      mouse.y =
        -(e.clientY /
          innerHeight) *
        2 + 1;

    }
  );



  window.addEventListener(
    'mousedown',
    () => {

      mouse.down =
        true;

      shoot();

    }
  );



  window.addEventListener(
    'mouseup',
    () => {

      mouse.down =
        false;

    }
  );



  window.addEventListener(
    'resize',
    onResize
  );



  initThree();

  renderMissionGrid();

  renderBadges();

}



/*
=========================================================
                     THREE INITIALIZATION
=========================================================
*/

function initThree() {
  const canvas = $('game-canvas');

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });

  // High-quality rendering
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  // Cinematic shadows
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = true;

  // Better colors and cinematic contrast
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Dark CyberHunt atmosphere
  renderer.setClearColor(0x030308, 1);

  scene = new THREE.Scene();

  // Deep black/red cyberpunk environment
  scene.background = new THREE.Color(0x030308);

  // Atmospheric depth
  scene.fog = new THREE.FogExp2(
    0x05060b,
    0.018
  );

  // Third-person cinematic camera
  camera = new THREE.PerspectiveCamera(
    52,
    window.innerWidth / window.innerHeight,
    0.1,
    300
  );

  camera.position.set(0, 15, 12);
  camera.lookAt(0, 0, 0);

  clock = new THREE.Clock();
  raycaster = new THREE.Raycaster();

  // Build the lighting system
  addLights();

  // Start the game renderer
  animate();
}

/*
=========================================================
                     LIGHTING
=========================================================
*/

function addLights() {


  /*
  AMBIENT
  */

  scene.add(
    new THREE.HemisphereLight(
      0x313544,
      0x08090c,
      1.4
    )
  );



  /*
  RED LIGHT
  */

  const red =
    new THREE.PointLight(
      0xff003f,
      25,
      22
    );

  red.position.set(
    0,
    5,
    0
  );

  scene.add(red);



  /*
  MAIN LIGHT
  */

  const key =
    new THREE.DirectionalLight(
      0xffffff,
      2
    );

  key.position.set(
    10,
    18,
    8
  );

  key.castShadow =
    true;

  scene.add(key);

}



/*
=========================================================
                  CLEAR WORLD
=========================================================
*/

function clearWorld() {


  world.objects
    .forEach(
      o =>
        scene.remove(o)
    );


  world.enemies
    .forEach(
      e =>
        scene.remove(
          e.group
        )
    );


  world.interactables
    .forEach(
      o =>
        scene.remove(
          o.mesh
        )
    );


  world.doors
    .forEach(
      o =>
        scene.remove(
          o.mesh
        )
    );


  world.effects
    .forEach(
      o =>
        scene.remove(o)
    );


  world = {

    objects: [],

    enemies: [],

    interactables: [],

    doors: [],

    effects: []

  };


  if (
    playerGroup
  ) {

    scene.remove(
      playerGroup
    );

  }

}



/*
=========================================================
                  START MISSION
=========================================================
*/

function startMission(level) {


  level =
    Math.max(
      1,
      Math.min(
        5,
        level
      )
    );


  if (
    level >
    state.unlockedMissions
  ) {

    toast(
      'MISSION LOCKED — COMPLETE THE PREVIOUS OPERATION'
    );

    return;

  }



  state.level =
    level;


  state.mission =
    MISSIONS[
      level - 1
    ];


  state.health =
    100;


  state.ammo =
    12;


  state.reserve =
    48;


  state.objectiveProgress =
    {};


  state.evidenceCollected =
    0;


  state.guardsDefeated =
    0;


  state.accuracyShots =
    0;


  state.accuracyHits =
    0;


  state.paused =
    false;


  gameRunning =
    true;



  hide(
    'mission-screen'
  );


  hide(
    'pause-screen'
  );


  hide(
    'complete-screen'
  );


  hide(
    'decrypt-screen'
  );


  hide(
    'evidence-screen'
  );


  show(
    'game-screen'
  );



  clearWorld();


  buildLevel(
    state.mission
  );


  updateHUD();


  toast(
    `MISSION ${String(level).padStart(2,'0')} // ${state.mission.title}`
  );

}



/*
=========================================================
                     BUILD LEVEL
=========================================================
*/

function buildLevel(
  mission
) {


  /*
  FLOOR
  */

  const floorMat =
    new THREE.MeshStandardMaterial({

      color: 0x11131a,

      roughness: .72,

      metalness: .25

    });


  const floor =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        62,
        .5,
        46
      ),

      floorMat

    );


  floor.position.y =
    -.25;


  floor.receiveShadow =
    true;


  scene.add(
    floor
  );


  world.objects.push(
    floor
  );



  /*
  FLOOR GRID
  */

  for (
    let x = -30;
    x <= 30;
    x += 6
  ) {

    const strip =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .045,
          .015,
          44
        ),

        new THREE.MeshBasicMaterial({

          color: 0x2c303a

        })

      );


    strip.position.set(
      x,
      .02,
      0
    );


    scene.add(
      strip
    );


    world.objects.push(
      strip
    );

  }



  for (
    let z = -22;
    z <= 22;
    z += 6
  ) {

    const strip =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          60,
          .015,
          .045
        ),

        new THREE.MeshBasicMaterial({

          color: 0x2c303a

        })

      );


    strip.position.set(
      0,
      .02,
      z
    );


    scene.add(
      strip
    );


    world.objects.push(
      strip
    );

  }



  /*
  WALLS
  */

  const wallMat =
    new THREE.MeshStandardMaterial({

      color: 0x171a23,

      roughness: .5,

      metalness: .5

    });



  const addWall =
    (
      x,
      z,
      w,
      d,
      h = 3
    ) => {

      const m =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            w,
            h,
            d
          ),

          wallMat

        );


      m.position.set(
        x,
        h / 2,
        z
      );


      m.castShadow =
        true;


      m.receiveShadow =
        true;


      scene.add(
        m
      );


      world.objects.push(
        m
      );



      /*
      RED NEON STRIP
      */

      const glow =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            Math.max(
              .08,
              w * .7
            ),
            .04,
            .05
          ),

          new THREE.MeshBasicMaterial({

            color: 0x8b0029

          })

        );


      glow.position.set(

        x,

        h * .7,

        z - d / 2 - .01

      );


      scene.add(
        glow
      );


      world.effects.push(
        glow
      );

    };



  addWall(
    0,
    -22,
    60,
    1
  );


  addWall(
    0,
    22,
    60,
    1
  );


  addWall(
    -30,
    0,
    1,
    46
  );


  addWall(
    30,
    0,
    1,
    46
  );


  addWall(
    -11,
    0,
    1,
    28
  );


  addWall(
    11,
    -7,
    1,
    30
  );


  addWall(
    0,
    8,
    22,
    1
  );



  /*
  CRATES
  */

  for (
    let i = 0;
    i < 14;
    i++
  ) {

    const x =
      -25 +
      Math.random() *
      50;


    const z =
      -17 +
      Math.random() *
      34;


    if (
      Math.abs(x) < 5 &&
      Math.abs(z) < 5
    ) {

      continue;

    }


    addCrate(
      x,
      z
    );

  }



  /*
  RED SECURITY LIGHTS
  */

  [

    [-24, -18],

    [24, -18],

    [-24, 18],

    [24, 18],

    [0, -19],

    [0, 18]

  ].forEach(
    ([x,z]) => {


      const lamp =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .25,
            .25,
            .25
          ),

          new THREE.MeshBasicMaterial({

            color: 0xff003c

          })

        );


      lamp.position.set(
        x,
        3,
        z
      );


      scene.add(
        lamp
      );


      world.effects.push(
        lamp
      );



      const l =
        new THREE.PointLight(
          0xff003c,
          5,
          8
        );


      l.position.set(
        x,
        2.5,
        z
      );


      scene.add(
        l
      );


      world.effects.push(
        l
      );

    }
  );



  /*
  PLAYER
  */

  playerGroup =
    createPlayer();


  playerGroup.position.set(
    0,
    0,
    16
  );


  scene.add(
    playerGroup
  );


  player =
    playerGroup;



  /*
  LEVEL 1
  */

  if (
    mission.id === 1
  ) {

    addEvidence(
      -19,
      10
    );


    addTerminal(
      17,
      -15
    );


    addDoor(
      11,
      7,
      'LOCKED'
    );


    addObjectiveMarker(
      11,
      9
    );


    spawnEnemies(
      3
    );

  }



  /*
  LEVEL 2
  */

  else if (
    mission.id === 2
  ) {

    addEvidence(
      -18,
      -13
    );


    addTerminal(
      17,
      -14
    );


    addDoor(
      11,
      7,
      'LOCKED'
    );


    addObjectiveMarker(
      17,
      -12
    );


    spawnEnemies(
      4
    );

  }



  /*
  LEVEL 3
  */

  else if (
    mission.id === 3
  ) {

    addTerminal(
      -17,
      -14
    );


    addEvidence(
      18,
      15
    );


    addDoor(
      11,
      7,
      'LOCKED'
    );


    addObjectiveMarker(
      -17,
      -12
    );


    spawnEnemies(
      5
    );

  }



  /*
  LEVEL 4
  */

  else if (
    mission.id === 4
  ) {

    addEvidence(
      -18,
      11
    );


    addEvidence(
      18,
      -13
    );


    addTerminal(
      17,
      13
    );


    addDoor(
      0,
      8,
      'LOCKED'
    );


    spawnEnemies(
      6
    );

  }



  /*
  LEVEL 5
  */

  else {

    addTerminal(
      0,
      -17
    );


    addDoor(
      0,
      8,
      'LOCKED'
    );


    spawnEnemies(
      7
    );


    spawnBoss();

  }

}



/*
=========================================================
                     CRATE
=========================================================
*/

function addCrate(
  x,
  z
) {

  const m =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2,
        1.8,
        2
      ),

      new THREE.MeshStandardMaterial({

        color: 0x20232d,

        roughness: .8,

        metalness: .15

      })

    );


  m.position.set(
    x,
    .9,
    z
  );


  m.rotation.y =
    Math.random() *
    Math.PI;


  m.castShadow =
    true;


  m.receiveShadow =
    true;


  scene.add(
    m
  );


  world.objects.push(
    m
  );


  /*
  CRATE RED STRIPE
  */

  const stripe =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        2.02,
        .06,
        .18
      ),

      new THREE.MeshBasicMaterial({

        color: 0x3b0b18

      })

    );


  stripe.position.copy(
    m.position
  );


  stripe.position.y =
    1.4;


  stripe.rotation.y =
    m.rotation.y;


  scene.add(
    stripe
  );


  world.effects.push(
    stripe
  );

}


/* 
=========================================================
                     PLAYER
=========================================================
*/

function createPlayer() {

  const g = new THREE.Group();

  // ------------------------------------------------
  // CUSTOM GIRL / BOY OPERATIVE
  // ------------------------------------------------

  if (USE_CUSTOM_MODELS) {

    const path =
      selectedOperative === 'boy'
        ? MODEL_PATHS.boyAgent
        : MODEL_PATHS.girlAgent;

    loadModel(
      'player-' + selectedOperative,
      path,
      g,
      1.0
    );

  }

  // ------------------------------------------------
  // PROCEDURAL FALLBACK
  // ------------------------------------------------

  else {

    const body =
      new THREE.Mesh(
        new THREE.CapsuleGeometry(
          .65,
          1.35,
          6,
          10
        ),
        new THREE.MeshStandardMaterial({
          color: 0x1a1c25,
          roughness: .55,
          metalness: .4
        })
      );

    body.position.y = 1.2;
    body.castShadow = true;

    g.add(body);


    // HEAD

    const head =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .43,
          18,
          14
        ),
        new THREE.MeshStandardMaterial({
          color: 0x282b35,
          roughness: .45
        })
      );

    head.position.y = 2.35;
    head.castShadow = true;

    g.add(head);


    // RED VISOR

    const visor =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          .58,
          .12,
          .18
        ),
        new THREE.MeshBasicMaterial({
          color: 0xe4003b
        })
      );

    visor.position.set(
      0,
      2.4,
      .37
    );

    g.add(visor);


    // WEAPON

    const gun =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          .18,
          .18,
          1.1
        ),
        new THREE.MeshStandardMaterial({
          color: 0x090a0e,
          metalness: .8
        })
      );

    gun.position.set(
      .62,
      1.35,
      .48
    );

    gun.rotation.x = -.12;

    g.add(gun);

  }

  return g;

}


/* 
=========================================================
                  GLTF MODEL LOADER
=========================================================
*/



/*
=========================================================
                  GLTF MODEL LOADER
=========================================================
*/

async function loadModel(
  id,
  path,
  parent,
  scale = 1
) {

  /*
  CACHE
  */

  if (
    modelCache[path]
  ) {

    const c =
      modelCache[path]
        .clone(true);


    c.scale.setScalar(
      scale
    );


    parent.add(
      c
    );


    return c;

  }



  const loader =
    new GLTFLoader();



  try {

    const gltf =
      await loader.loadAsync(
        path
      );


    modelCache[path] =
      gltf.scene;



    const c =
      gltf.scene
        .clone(true);


    c.scale.setScalar(
      scale
    );



    c.traverse(
      o => {

        if (
          o.isMesh
        ) {

          o.castShadow =
            true;

          o.receiveShadow =
            true;

        }

      }
    );



    parent.add(
      c
    );


    return c;

  }


  catch (e) {

    console.warn(
      'Model not found:',
      path,
      'Using procedural placeholder.'
    );


    return null;

  }

}



/*
=========================================================
                     EVIDENCE
=========================================================
*/

function addEvidence(
  x,
  z
) {

  const g =
    new THREE.Group();


  /*
  CUSTOM USB
  */

  if (
    USE_CUSTOM_MODELS
  ) {

    loadModel(
      'usb',
      MODEL_PATHS.usb,
      g,
      .8
    );

  }


  /*
  TEMPORARY USB
  */

  else {

    const usb =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .9,
          .18,
          .35
        ),

        new THREE.MeshStandardMaterial({

          color: 0xb9bec8,

          metalness: .85,

          roughness: .25

        })

      );


    usb.rotation.y =
      .4;


    g.add(
      usb
    );



    const tip =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .25,
          .12,
          .27
        ),

        new THREE.MeshStandardMaterial({

          color: 0x30343e,

          metalness: .8

        })

      );


    tip.position.x =
      .55;


    g.add(
      tip
    );

  }



  g.position.set(
    x,
    .45,
    z
  );


  scene.add(
    g
  );



  /*
  GLOW
  */

  const glow =
    new THREE.PointLight(
      0xff003c,
      3,
      4
    );


  glow.position.set(
    x,
    1,
    z
  );


  scene.add(
    glow
  );



  world.interactables.push({

    type:
      'evidence',

    mesh:
      g,

    x,
    z,

    used:
      false,

    glow

  });



  addObjectiveMarker(
    x,
    z
  );

}



/*
=========================================================
                     TERMINAL
=========================================================
*/

function addTerminal(
  x,
  z
) {

  const g =
    new THREE.Group();



  /*
  CUSTOM TERMINAL
  */

  if (
    USE_CUSTOM_MODELS
  ) {

    loadModel(
      'terminal',
      MODEL_PATHS.terminal,
      g,
      1
    );

  }



  /*
  TEMPORARY TERMINAL
  */

  else {

    const desk =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          2.8,
          1.1,
          1.3
        ),

        new THREE.MeshStandardMaterial({

          color: 0x171a21,

          metalness: .6

        })

      );


    desk.position.y =
      .55;


    g.add(
      desk
    );



    const monitor =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          1.5,
          1.1,
          .12
        ),

        new THREE.MeshStandardMaterial({

          color: 0x171a21,

          emissive: 0x30000d,

          emissiveIntensity: 1

        })

      );


    monitor.position.set(
      0,
      1.45,
      -.45
    );


    g.add(
      monitor
    );



    const screen =
      new THREE.Mesh(

        new THREE.PlaneGeometry(
          1.2,
          .75
        ),

        new THREE.MeshBasicMaterial({

          color: 0x18000a

        })

      );


    screen.position.set(
      0,
      1.45,
      -.52
    );


    g.add(
      screen
    );

  }



  g.position.set(
    x,
    0,
    z
  );


  scene.add(
    g
  );



  world.interactables.push({

    type:
      'terminal',

    mesh:
      g,

    x,
    z,

    used:
      false

  });



  addObjectiveMarker(
    x,
    z
  );

}



/*
=========================================================
                     DOOR
=========================================================
*/

function addDoor(
  x,
  z,
  status = 'LOCKED'
) {

  const g =
    new THREE.Group();



  /*
  CUSTOM DOOR
  */

  if (
    USE_CUSTOM_MODELS
  ) {

    loadModel(
      'door',
      MODEL_PATHS.door,
      g,
      1.4
    );

  }



  /*
  TEMPORARY DOOR
  */

  else {

    const door =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          4,
          .3,
          4.5
        ),

        new THREE.MeshStandardMaterial({

          color: 0x252a34,

          metalness: .8,

          roughness: .35

        })

      );


    door.rotation.x =
      Math.PI / 2;


    door.position.y =
      2.2;


    g.add(
      door
    );



    const panel =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .35,
          1.2,
          .08
        ),

        new THREE.MeshBasicMaterial({

          color: 0xe4003b

        })

      );


    panel.position.set(
      -2.3,
      1.4,
      0
    );


    g.add(
      panel
    );

  }



  g.position.set(
    x,
    0,
    z
  );


  scene.add(
    g
  );



  world.doors.push({

    mesh:
      g,

    x,

    z,

    locked:
      true

  });

}



/*
=========================================================
                  OBJECTIVE MARKER
=========================================================
*/

function addObjectiveMarker(
  x,
  z
) {

  const marker =
    new THREE.Mesh(

      new THREE.OctahedronGeometry(
        .35,
        .1
      ),

      new THREE.MeshBasicMaterial({

        color: 0xe4003b,

        wireframe: true

      })

    );


  marker.position.set(
    x,
    1.8,
    z
  );


  scene.add(
    marker
  );


  world.effects.push(
    marker
  );

}



/*
=========================================================
                     ENEMIES
=========================================================
*/

function spawnEnemies(
  count
) {

  const spots = [

    [-21, -14],

    [20, -15],

    [-20, 3],

    [21, 6],

    [-17, 17],

    [17, 17],

    [-2, -15],

    [3, 13]

  ];



  for (
    let i = 0;
    i < count;
    i++
  ) {

    const [
      x,
      z
    ] =
      spots[
        i %
        spots.length
      ];



    const g =
      new THREE.Group();



    /*
    CUSTOM ENEMY
    */

    if (
      USE_CUSTOM_MODELS
    ) {

      loadModel(
        'enemy',
        MODEL_PATHS.enemy,
        g,
        .9
      );

    }



    /*
    TEMPORARY ENEMY
    */

    else {

      const body =
        new THREE.Mesh(

          new THREE.CapsuleGeometry(
            .5,
            1,
            6,
            8
          ),

          new THREE.MeshStandardMaterial({

            color: 0x12151d,

            roughness: .55

          })

        );


      body.position.y =
        1;


      g.add(
        body
      );



      const head =
        new THREE.Mesh(

          new THREE.SphereGeometry(
            .34,
            14,
            10
          ),

          new THREE.MeshStandardMaterial({

            color: 0x252833

          })

        );


      head.position.y =
        2;


      g.add(
        head
      );



      const eye =
        new THREE.Mesh(

          new THREE.BoxGeometry(
            .35,
            .08,
            .08
          ),

          new THREE.MeshBasicMaterial({

            color: 0xff003c

          })

        );


      eye.position.set(
        0,
        2.03,
        .31
      );


      g.add(
        eye
      );

    }



    g.position.set(
      x,
      0,
      z
    );


    g.userData = {

      hp: 2,

      alive: true,

      speed:
        1.1 +
        Math.random() *
        .4

    };


    scene.add(
      g
    );



    world.enemies.push({

      group:
        g,

      hp:
        2,

      alive:
        true,

      speed:
        g.userData.speed

    });

  }

}



/*
=========================================================
                       BOSS
=========================================================
*/

function spawnBoss() {

  const g =
    new THREE.Group();



  /*
  CUSTOM BOSS
  */

  if (
    USE_CUSTOM_MODELS
  ) {

    loadModel(
      'boss',
      MODEL_PATHS.boss,
      g,
      1.25
    );

  }



  /*
  TEMPORARY BOSS
  */

  else {

    const body =
      new THREE.Mesh(

        new THREE.CapsuleGeometry(
          .75,
          1.8,
          8,
          10
        ),

        new THREE.MeshStandardMaterial({

          color: 0x171922,

          metalness: .7

        })

      );


    body.position.y =
      1.4;


    g.add(
      body
    );



    const head =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          .5,
          18,
          12
        ),

        new THREE.MeshStandardMaterial({

          color: 0x2d303a

        })

      );


    head.position.y =
      2.8;


    g.add(
      head
    );



    const visor =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .75,
          .13,
          .14
        ),

        new THREE.MeshBasicMaterial({

          color: 0xff003c

        })

      );


    visor.position.set(
      0,
      2.85,
      .43
    );


    g.add(
      visor
    );

  }



  g.position.set(
    0,
    0,
    -8
  );


  scene.add(
    g
  );


  world.enemies.push({

    group:
      g,

    hp:
      8,

    alive:
      true,

    speed:
      .7,

    boss:
      true

  });

}



/*
=========================================================
              FIND NEAREST INTERACTION
=========================================================
*/

function nearestInteractable() {

  if (!player)
    return null;


  let best =
    null;


  let dist =
    2.6;



  for (
    const o of
    world.interactables
  ) {

    if (
      o.used
    )
      continue;



    const d =
      player.position
        .distanceTo(

          new THREE.Vector3(
            o.x,
            0,
            o.z
          )

        );



    if (
      d < dist
    ) {

      dist =
        d;

      best =
        o;

    }

  }



  return best;

}



/*
=========================================================
                 HANDLE INTERACTION
=========================================================
*/

function handleInteraction() {

  if (
    state.paused ||
    !gameRunning
  )
    return;



  const o =
    nearestInteractable();



  if (!o) {

    toast(
      'NO INTERACTABLE TARGET IN RANGE'
    );

    return;

  }



  state.currentInteractable =
    o;



  if (
    o.type ===
    'evidence'
  ) {

    $('evidence-title')
      .textContent =
      state.mission.id === 4
        ? 'CREDENTIAL EVIDENCE'
        : 'SUSPICIOUS USB DEVICE';



    $('evidence-text')
      .textContent =

      `${state.mission.threat} evidence detected. Secure the physical artifact before the hostile process destroys it.`;



    show(
      'evidence-screen'
    );

  }



  else if (
    o.type ===
    'terminal'
  ) {

    openDecrypt();

  }

}



/*
=========================================================
                 COLLECT EVIDENCE
=========================================================
*/

function collectEvidence() {

  const o =
    state.currentInteractable;



  if (!o)
    return;



  o.used =
    true;


  o.mesh.visible =
    false;



  if (o.glow)
    o.glow.visible =
      false;



  state.evidenceCollected++;


  state.objectiveProgress.evidence =
    (
      state.objectiveProgress.evidence ||
      0
    ) + 1;



  hide(
    'evidence-screen'
  );


  toast(
    'PHYSICAL EVIDENCE SECURED +75 XP'
  );


  gainXP(
    75
  );


  updateHUD();


  checkMissionComplete();

}



/*
=========================================================
                     DECRYPTION
=========================================================
*/

function openDecrypt() {

  show(
    'decrypt-screen'
  );


  state.decryptInput =
    '';


  renderCodeSlots();


  $('decode-message')
    .textContent =
    '';


  const code =
    state.mission.code;



  $('decrypt-hints')
    .innerHTML =

    `
      <p>
        1. Access log:
        ${code[0]} AM —
        Maintenance staff.
      </p>

      <p>
        2. Badge ID:
        ${code[1]}F -
        ${code[2]}A -
        ${code[3]}C
      </p>

      <p>
        3. Use the pattern to recover the 4-digit key.
      </p>
    `;



  $('terminal-log')
    .innerHTML =

    `
      <div>
        [07:41:09]
        ACCESS ATTEMPT...
      </div>

      <div>
        [07:41:11]
        UNKNOWN PROCESS DETECTED
      </div>

      <div>
        [07:41:12]
        ENCRYPTED FILES MOUNTED
      </div>

      <div>
        [07:41:13]
        LOCKDOWN PROTOCOL ACTIVE
      </div>
    `;



  const keypad =
    $('code-keypad');


  keypad.innerHTML =
    '';



  [
    ...'1234567890'
  ].forEach(
    n => {

      const b =
        document.createElement(
          'button'
        );


      b.textContent =
        n;


      b.onclick =
        () => {

          if (
            state.decryptInput.length <
            4
          ) {

            state.decryptInput +=
              n;

            renderCodeSlots();

          }

        };


      keypad.appendChild(
        b
      );

    }
  );



  const clear =
    document.createElement(
      'button'
    );


  clear.textContent =
    'CLR';


  clear.onclick =
    () => {

      state.decryptInput =
        '';

      renderCodeSlots();

    };


  keypad.appendChild(
    clear
  );

}



/*
=========================================================
                  CODE SLOTS
=========================================================
*/

function renderCodeSlots() {

  $('code-slots')
    .innerHTML =

    [0,1,2,3]

      .map(
        i =>

          `
          <div class="code-slot">
            ${state.decryptInput[i] || '_'}
          </div>
          `

      )

      .join('');

}



/*
=========================================================
                   CHECK CODE
=========================================================
*/

function checkCode() {

  if (
    state.decryptInput ===
    state.mission.code
  ) {


    $('decode-message')
      .textContent =
      'ACCESS GRANTED — THREAT ISOLATED';


    $('decode-message')
      .style.color =
      '#e4003b';



    gainXP(
      125
    );



    state.objectiveProgress.terminal =
      (
        state.objectiveProgress.terminal ||
        0
      ) + 1;



    state.objectiveProgress.code =
      (
        state.objectiveProgress.code ||
        0
      ) + 1;



    state.objectiveProgress.malware =
      (
        state.objectiveProgress.malware ||
        0
      ) + 1;



    unlockDoors();



    setTimeout(
      () => {

        hide(
          'decrypt-screen'
        );


        toast(
          'SECURITY DOOR UNLOCKED'
        );


        updateHUD();


        checkMissionComplete();

      },
      650
    );

  }


  else {


    $('decode-message')
      .textContent =
      'ACCESS DENIED — INVALID KEY';


    $('decode-message')
      .style.color =
      '#ff476d';



    state.health =
      Math.max(
        0,
        state.health - 5
      );


    updateHUD();

  }

}



/*
=========================================================
                  UNLOCK DOORS
=========================================================
*/

function unlockDoors() {

  world.doors
    .forEach(
      d => {

        d.locked =
          false;


        d.mesh.traverse(
          o => {

            if (
              o.material?.color
            ) {

              o.material.color
                .set(
                  0x30343e
                );

            }

          }
        );

      }
    );

}



/*
=========================================================
                     SHOOT
=========================================================
*/

function shoot() {

  if (
    !gameRunning ||
    state.paused ||
    !player
  )
    return;



  const now =
    performance.now();



  if (
    now -
    lastShot <
    180
  )
    return;



  if (
    state.ammo <=
    0
  ) {

    toast(
      'MAGAZINE EMPTY'
    );

    return;

  }



  lastShot =
    now;


  state.ammo--;


  state.accuracyShots++;



  const target =
    pickTarget();



  if (
    target
  ) {

    state.accuracyHits++;


    target.hp--;


    createHitEffect(
      target.group.position
    );



    if (
      target.hp <=
      0
    ) {

      target.alive =
        false;


      target.group.visible =
        false;


      state.guardsDefeated++;



      state.objectiveProgress.guards =
        (
          state.objectiveProgress.guards ||
          0
        ) + 1;



      gainXP(
        target.boss
          ? 300
          : 50
      );



      if (
        target.boss
      ) {

        state.objectiveProgress.boss =
          1;

      }



      toast(

        target.boss

          ? 'NETWORK COMMANDER NEUTRALIZED'

          : 'HOSTILE OPERATIVE ELIMINATED'

      );



      checkMissionComplete();

    }

  }



  updateHUD();

}



/*
=========================================================
                  PICK TARGET
=========================================================
*/

function pickTarget() {

  let best =
    null;


  let bestDist =
    10;



  for (
    const e of
    world.enemies
  ) {

    if (
      !e.alive
    )
      continue;



    const d =
      player.position
        .distanceTo(
          e.group.position
        );



    if (
      d <
      bestDist
    ) {

      const dir =
        e.group.position
          .clone()
          .sub(
            player.position
          )
          .normalize();



      const forward =
        new THREE.Vector3(
          0,
          0,
          -1
        )
          .applyQuaternion(
            player.quaternion
          );



      if (
        forward.dot(
          dir
        ) >
        .35
      ) {

        best =
          e;

        bestDist =
          d;

      }

    }

  }



  return best;

}



/*
=========================================================
                     HIT VFX
=========================================================
*/

function createHitEffect(
  pos
) {

  const g =
    new THREE.Group();


  g.position.copy(
    pos
  );


  g.position.y =
    1.2;



  for (
    let i = 0;
    i < 10;
    i++
  ) {

    const p =
      new THREE.Mesh(

        new THREE.SphereGeometry(
          .045,
          5,
          5
        ),

        new THREE.MeshBasicMaterial({

          color: 0xff003c

        })

      );


    p.position.set(

      (Math.random() -
        .5) *
        .5,

      (Math.random() -
        .5) *
        .5,

      (Math.random() -
        .5) *
        .5

    );


    g.add(
      p
    );

  }



  scene.add(
    g
  );


  world.effects.push(
    g
  );


  setTimeout(
    () =>
      scene.remove(
        g
      ),
    180
  );

}



/*
=========================================================
                     XP
=========================================================
*/

function gainXP(
  amount
) {

  state.xp +=
    amount;



  while (
    state.xp >=
    1000
  ) {

    state.xp -=
      1000;


    state.level =
      Math.min(
        10,
        state.level + 1
      );


    toast(
      `LEVEL UP // LV ${state.level}`
    );

  }



  updateProfileUI();

}



/*
=========================================================
                PROFILE UI
=========================================================
*/

function updateProfileUI() {

  $('menu-level')
    .textContent =
    String(
      state.level
    ).padStart(
      2,
      '0'
    );



  $('menu-xp')
    .textContent =
    `${state.xp} / 1000`;



  $('menu-xp-bar')
    .style.width =
    `${state.xp / 10}%`;

}



/*
=========================================================
                     HUD
=========================================================
*/

function updateHUD() {

  const m =
    state.mission;


  if (!m)
    return;



  /*
  MISSION NAME
  */

  $('hud-mission-number')
    .textContent =

    `MISSION ${String(m.id).padStart(2,'0')}`;



  $('hud-mission-title')
    .textContent =
    m.title;



  /*
  MAP
  */

  $('map-level')
    .textContent =
    m.zone
      .split('//')[0]
      .trim();



  /*
  HEALTH
  */

  $('health-bar')
    .style.width =
    `${state.health}%`;


  $('health-text')
    .textContent =
    `${state.health}/100`;



  /*
  AMMO
  */

  $('ammo-current')
    .textContent =
    state.ammo;


  $('ammo-reserve')
    .textContent =
    state.reserve;



  /*
  XP
  */

  $('game-level')
    .textContent =
    String(
      state.level
    ).padStart(
      2,
      '0'
    );


  $('game-xp')
    .textContent =
    `${state.xp} XP`;


  $('game-xp-bar')
    .style.width =
    `${state.xp / 10}%`;



  /*
  OBJECTIVES
  */

  $('objective-list')
    .innerHTML =

    m.objectives

      .map(
        o => {

          let p =
            state.objectiveProgress[
              o.id
            ] || 0;


          let done =
            p >=
            o.target;



          return `

            <div class="objective ${done ? 'done' : ''}">

              <b>
                ${done ? '◆' : '◇'}
              </b>

              ${o.text}

              (${Math.min(
                p,
                o.target
              )}/${o.target})

            </div>

          `;

        }
      )

      .join('');



  /*
  INTERACTION
  */

  state.currentInteractable =
    nearestInteractable();


  const near =
    state.currentInteractable;



  $('interact-hint')
    .classList
    .toggle(
      'hidden',
      !near
    );



  if (
    near
  ) {

    $('interaction-type')
      .textContent =

      near.type ===
      'evidence'

        ? 'EVIDENCE FOUND'

        : 'SECURITY TERMINAL';



    $('interaction-title')
      .textContent =

      near.type ===
      'evidence'

        ? 'Suspicious USB Device'

        : 'Encrypted Security Terminal';

  }


  else {

    $('interaction-panel')
      .classList
      .add(
        'hidden'
      );

  }



  drawMinimap();

}



/*
=========================================================
              CHECK MISSION COMPLETE
=========================================================
*/

function checkMissionComplete() {

  const m =
    state.mission;



  const ok =
    m.objectives.every(

      o =>

        (
          state.objectiveProgress[
            o.id
          ] || 0
        ) >=
        o.target

    );



  if (
    ok
  ) {

    completeMission();

  }

}



/*
=========================================================
                COMPLETE MISSION
=========================================================
*/

function completeMission() {

  if (
    state.completed.has(
      state.mission.id
    )
  )
    return;



  state.completed.add(
    state.mission.id
  );



  state.badges.add(
    state.mission.badge
  );



  state.unlockedMissions =
    Math.max(

      state.unlockedMissions,

      Math.min(
        5,
        state.mission.id + 1
      )

    );



  gainXP(
    state.mission.xp
  );


  gameRunning =
    false;



  $('complete-title')
    .textContent =

    `MISSION ${String(state.mission.id).padStart(2,'0')} COMPLETE`;



  $('complete-subtitle')
    .textContent =

    'Threat neutralized. Evidence secured. Facility status restored.';



  $('reward-xp')
    .textContent =
    `+${state.mission.xp}`;



  $('reward-badge')
    .textContent =
    'UNLOCKED';



  $('reward-accuracy')
    .textContent =

    `${state.accuracyShots ? Math.round(state.accuracyHits / state.accuracyShots * 100) : 100}%`;



  show(
    'complete-screen'
  );


  renderMissionGrid();

  renderBadges();

  updateProfileUI();

}



/*
=========================================================
                 MISSION GRID
=========================================================
*/

function renderMissionGrid() {

  const grid =
    $('mission-grid');


  if (!grid)
    return;



  grid.innerHTML =

    MISSIONS

      .map(
        m => {

          const locked =
            m.id >
            state.unlockedMissions;


          const done =
            state.completed.has(
              m.id
            );



          return `

            <article
              class="mission-card
              ${locked ? 'locked' : ''}
              ${m.id === state.level ? 'active' : ''}"
              data-level="${m.id}"
            >

              <div class="mission-num">

                0${m.id}

                ${done ? '◆' : ''}

              </div>


              <div class="mission-icon"></div>


              <h3>
                ${m.title}
              </h3>


              <p>
                ${m.zone}
              </p>


              <small>
                ${locked
                  ? 'LOCKED'
                  : 'AVAILABLE'}
              </small>

            </article>

          `;

        }
      )

      .join('');



  grid
    .querySelectorAll(
      '.mission-card'
    )
    .forEach(
      c => {

        c.onclick =
          () =>

            startMission(
              Number(
                c.dataset.level
              )
            );

      }
    );

}



/*
=========================================================
                     BADGES
=========================================================
*/

function renderBadges() {

  const grid =
    $('badge-grid');


  if (!grid)
    return;



  grid.innerHTML =

    BADGES

      .map(
        ([name, desc]) => {


          const unlocked =

            state.badges.has(
              name
            )

            ||

            (
              name ===
              'CYBER DETECTIVE'
              &&
              state.completed.size >
              0
            );



          return `

            <article
              class="badge-card
              ${unlocked ? '' : 'locked'}"
            >

              <div class="badge-shape">

                <span>
                  ◆
                </span>

              </div>


              <h3>
                ${name}
              </h3>


              <p>
                ${desc}
              </p>

            </article>

          `;

        }
      )

      .join('');

}



/*
=========================================================
                     PAUSE
=========================================================
*/

function togglePause() {

  if (!gameRunning)
    return;



  state.paused =
    !state.paused;



  if (
    state.paused
  ) {

    show(
      'pause-screen'
    );

  }


  else {

    hide(
      'pause-screen'
    );

  }

}



/*
=========================================================
                  PLAYER MOVEMENT
=========================================================
*/

function updatePlayer(
  dt
) {

  if (
    !player ||
    state.paused ||
    !gameRunning
  )
    return;



  let x =

    (
      keys.KeyD ||
      keys.ArrowRight
        ? 1
        : 0
    )

    -

    (
      keys.KeyA ||
      keys.ArrowLeft
        ? 1
        : 0
    );



  let z =

    (
      keys.KeyS ||
      keys.ArrowDown
        ? 1
        : 0
    )

    -

    (
      keys.KeyW ||
      keys.ArrowUp
        ? 1
        : 0
    );



  const len =
    Math.hypot(
      x,
      z
    ) || 1;



  x /=
    len;


  z /=
    len;



  const speed =
    keys.Shift
      ? 7
      : 4;



  playerVelocity.x +=

    (
      x * speed -
      playerVelocity.x
    )

    *

    Math.min(
      1,
      dt * 12
    );



  playerVelocity.z +=

    (
      z * speed -
      playerVelocity.z
    )

    *

    Math.min(
      1,
      dt * 12
    );



  player.position.x +=
    playerVelocity.x *
    dt;


  player.position.z +=
    playerVelocity.z *
    dt;



  /*
  BOUNDARIES
  */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -27,
      27
    );


  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -19,
      19
    );



  /*
  ROTATE PLAYER
  */

  if (
    Math.hypot(
      x,
      z
    ) > .1
  ) {

    player.rotation.y =
      Math.atan2(
        x,
        z
      );

  }



  /*
  THIRD PERSON CAMERA
  */

  const camTarget =
    new THREE.Vector3(

      player.position.x,

      0,

      player.position.z

    );



  camera.position.lerp(

    new THREE.Vector3(

      player.position.x,

      15,

      player.position.z +
      12

    ),

    dt * 3

  );



  camera.lookAt(
    camTarget
  );

}



/*
=========================================================
                  ENEMY AI
=========================================================
*/

function updateEnemies(
  dt
) {

  if (
    !player ||
    state.paused ||
    !gameRunning
  )
    return;



  for (
    const e of
    world.enemies
  ) {

    if (
      !e.alive
    )
      continue;



    const d =
      e.group.position
        .distanceTo(
          player.position
        );



    /*
    ENEMY CHASE RANGE
    */

    if (
      d < 9
    ) {

      const dir =
        player.position
          .clone()
          .sub(
            e.group.position
          );


      dir.y =
        0;


      dir.normalize();



      e.group.position
        .addScaledVector(
          dir,
          e.speed * dt
        );



      e.group.lookAt(

        player.position.x,

        e.group.position.y,

        player.position.z

      );



      /*
      ENEMY DAMAGE
      */

      if (
        d < 1.5 &&
        Math.random() <
        dt * .8
      ) {

        state.health =
          Math.max(

            0,

            state.health - 3

          );


        updateHUD();



        if (
          state.health <=
          0
        ) {

          respawnPlayer();

        }

      }

    }

  }

}



/*
=========================================================
                 PLAYER RESPAWN
=========================================================
*/

function respawnPlayer() {

  state.health =
    100;


  player.position.set(
    0,
    0,
    16
  );


  toast(
    'OPERATIVE DOWN — REPOSITIONED'
  );


  updateHUD();

}



/*
=========================================================
                    MINIMAP
=========================================================
*/

function drawMinimap() {

  const c =
    $('minimap-canvas');


  if (!c)
    return;



  const ctx =
    c.getContext(
      '2d'
    );


  const w =
    c.width;


  const h =
    c.height;



  ctx.clearRect(
    0,
    0,
    w,
    h
  );



  /*
  BACKGROUND
  */

  ctx.fillStyle =
    '#06080d';


  ctx.fillRect(
    0,
    0,
    w,
    h
  );



  /*
  GRID
  */

  ctx.strokeStyle =
    '#4a1a2a';


  ctx.lineWidth =
    1;



  for (
    let x = 10;
    x < w;
    x += 25
  ) {

    ctx.beginPath();

    ctx.moveTo(
      x,
      0
    );

    ctx.lineTo(
      x,
      h
    );

    ctx.stroke();

  }



  for (
    let y = 10;
    y < h;
    y += 25
  ) {

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      w,
      y
    );

    ctx.stroke();

  }



  /*
  MAP
  */

  ctx.fillStyle =
    '#333742';


  ctx.fillRect(
    8,
    8,
    w - 16,
    h - 16
  );



  const sx =
    3.0;


  const sz =
    3.1;


  const ox =
    w / 2;


  const oz =
    h / 2;



  /*
  ENEMIES
  */

  for (
    const e of
    world.enemies
  ) {

    if (
      !e.alive
    )
      continue;



    const px =
      ox +
      e.group.position.x /
      sx;


    const pz =
      oz +
      e.group.position.z /
      sz;



    ctx.fillStyle =
      '#e4003b';


    ctx.beginPath();


    ctx.arc(
      px,
      pz,
      3,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }



  /*
  PLAYER
  */

  if (
    player
  ) {

    const px =
      ox +
      player.position.x /
      sx;


    const pz =
      oz +
      player.position.z /
      sz;



    ctx.fillStyle =
      '#ffffff';


    ctx.beginPath();


    ctx.moveTo(
      px,
      pz - 5
    );


    ctx.lineTo(
      px - 4,
      pz + 4
    );


    ctx.lineTo(
      px + 4,
      pz + 4
    );


    ctx.closePath();


    ctx.fill();

  }

}



/*
=========================================================
                     ANIMATION
=========================================================
*/

function animate() {

  requestAnimationFrame(
    animate
  );



  const dt =
    Math.min(

      clock?.getDelta() ||
      .016,

      .05

    );



  if (
    gameRunning
  ) {

    updatePlayer(
      dt
    );


    updateEnemies(
      dt
    );

  }



  /*
  WORLD VFX
  */

  world.effects
    .forEach(
      (o, i) => {


        if (
          o &&
          o.rotation
        ) {

          o.rotation.y +=

            dt *

            (
              .2 +
              (i % 3) *
              .05
            );

        }



        if (
          o &&
          o.material?.emissiveIntensity !==
          undefined
        ) {

          o.material.emissiveIntensity =

            .6 +

            Math.sin(
              performance.now() *
              .004 +
              i
            ) *
            .4;

        }

      }
    );



  /*
  AUTO SHOOT
  */

  if (
    mouse.down &&
    gameRunning
  ) {

    shoot();

  }



  renderer.render(
    scene,
    camera
  );

}



/*
=========================================================
                    RESIZE
=========================================================
*/

function onResize() {

  if (!renderer)
    return;



  renderer.setSize(
    innerWidth,
    innerHeight
  );



  camera.aspect =
    innerWidth /
    innerHeight;



  camera.updateProjectionMatrix();

}
