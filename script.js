import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

import {
    GLTFLoader
} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

import {
    EffectComposer
} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';

import {
    RenderPass
} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';

import {
    UnrealBloomPass
} from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';

import {
    createArena
} from './arena.js';


/* =====================================================
                    CYBERHUNT
===================================================== */

const MODEL_PATHS = {

    girlAgent:
        'assets/models/girl-agent.glb',

    boyAgent:
        'assets/models/boy-agent.glb',

    enemy:
        'assets/models/enemy.glb'

};


/* =====================================================
                    MISSIONS
===================================================== */

const MISSIONS = [

    {
        id:1,
        title:'BLACKOUT',
        description:'Locate the physical evidence inside the compromised facility.',
        type:'physical',
        objective:'LOCATE THE USB EVIDENCE',
        xp:250
    },

    {
        id:2,
        title:'GHOST SIGNAL',
        description:'Trace and eliminate the malicious digital intrusion.',
        type:'digital',
        objective:'ELIMINATE DIGITAL THREATS',
        xp:350
    },

    {
        id:3,
        title:'LOCKDOWN',
        description:'Decrypt the security system and breach the locked sector.',
        type:'hack',
        objective:'DECRYPT THE SECURITY TERMINAL',
        xp:450
    },

    {
        id:4,
        title:'BLACKSITE',
        description:'Infiltrate the hostile blacksite and neutralize enemy operatives.',
        type:'combat',
        objective:'NEUTRALIZE ALL HOSTILES',
        xp:600
    },

    {
        id:5,
        title:'CYBER CORE',
        description:'Enter the Cyber Core and eliminate the final threat.',
        type:'boss',
        objective:'DESTROY THE CYBER CORE',
        xp:1000
    }

];


/* =====================================================
                    STATE
===================================================== */

const state = {

    level:1,

    xp:0,

    health:100,

    mission:1,

    operative:'girl',

    kills:0,

    ammo:18,

    badges:[],

    playing:false,

    paused:false

};


/* =====================================================
                    THREE
===================================================== */

let scene;
let camera;
let renderer;
let composer;

let player;
let playerModel;

let enemies=[];

let evidence=[];
let terminals=[];

let keys={};

let clock=new THREE.Clock();

let loader=new GLTFLoader();

let previewScenes=[];


/* =====================================================
                    DOM
===================================================== */

const $ = id => document.getElementById(id);


/* =====================================================
                    BOOT
===================================================== */

window.addEventListener('load',()=>{

    setTimeout(()=>{

        $('loading').classList.add('hidden');

    },700);

    initMenu();

});


/* =====================================================
                    MENU
===================================================== */

function initMenu(){

    $('startBtn').onclick=()=>{

        $('boot').classList.remove('active');

        $('missionScreen').classList.add('active');

        renderMissions();

    };

    $('backMission').onclick=()=>{

        $('operativeScreen').classList.remove('active');

        $('missionScreen').classList.add('active');

    };

    document.querySelectorAll('.operative-card')
        .forEach(card=>{

            card.onclick=()=>{

                document
                    .querySelectorAll('.operative-card')
                    .forEach(x=>x.classList.remove('selected'));

                card.classList.add('selected');

                state.operative =
                    card.dataset.operative;

                updateWeapon();

            };

        });

    $('deployBtn').onclick=()=>{

        $('operativeScreen').classList.remove('active');

        $('game').classList.add('active');

        startGame();

    };

    $('resumeBtn').onclick=()=>{

        state.paused=false;

        $('pauseScreen').classList.remove('active');

    };

    $('quitBtn').onclick=()=>{

        location.reload();

    };

    $('nextMissionBtn').onclick=()=>{

        state.mission++;

        if(state.mission>5){

            alert('CYBERHUNT COMPLETE');

            location.reload();

            return;
        }

        $('completeScreen').classList.remove('active');

        $('missionScreen').classList.add('active');

        renderMissions();

    };

    $('evidenceContinue').onclick=()=>{

        $('evidenceScreen').classList.remove('active');

        state.playing=true;

    };

    $('decodeCancel').onclick=()=>{

        $('decodeScreen').classList.remove('active');

        state.playing=true;

    };

}


/* =====================================================
                    MISSIONS UI
===================================================== */

function renderMissions(){

    const list=$('missionList');

    list.innerHTML='';

    MISSIONS.forEach(m=>{

        const unlocked =
            m.id <= state.level;

        const card=document.createElement('button');

        card.className=
            'mission-card '+
            (!unlocked?'locked':'');

        card.innerHTML=`

            <span class="num">
                MISSION ${String(m.id).padStart(2,'0')}
            </span>

            <h2>${m.title}</h2>

            <p>${m.description}</p>

            <div class="difficulty">
                ${unlocked?'AVAILABLE':'LOCKED'}
            </div>

        `;

        if(unlocked){

            card.onclick=()=>{

                state.mission=m.id;

                $('missionScreen')
                    .classList.remove('active');

                $('operativeScreen')
                    .classList.add('active');

                initPreviews();

            };

        }

        list.appendChild(card);

    });

    $('menuLevel').textContent=
        String(state.level).padStart(2,'0');

    $('menuXP').textContent=
        String(state.xp).padStart(3,'0');

}


/* =====================================================
                    PREVIEWS
===================================================== */

function initPreviews(){

    createPreview(
        $('vexa-preview'),
        MODEL_PATHS.girlAgent
    );

    createPreview(
        $('kai-preview'),
        MODEL_PATHS.boyAgent
    );

}


function createPreview(container,path){

    container.innerHTML='';

    const s=new THREE.Scene();

    s.background=new THREE.Color(0x060609);

    const c=new THREE.PerspectiveCamera(
        35,
        container.clientWidth /
        container.clientHeight,
        .1,
        100
    );

    c.position.set(0,1.7,5);

    const r=new THREE.WebGLRenderer({
        antialias:true,
        alpha:true
    });

    r.setPixelRatio(
        Math.min(devicePixelRatio,2)
    );

    r.setSize(
        container.clientWidth,
        container.clientHeight
    );

    r.shadowMap.enabled=true;

    container.appendChild(r.domElement);

    const hemi=new THREE.HemisphereLight(
        0xffffff,
        0x220008,
        2
    );

    s.add(hemi);

    const redLight=new THREE.PointLight(
        0xff1744,
        30,
        12
    );

    redLight.position.set(
        -3,
        2,
        2
    );

    s.add(redLight);

    const floor=new THREE.Mesh(
        new THREE.CylinderGeometry(
            1.9,
            1.9,
            .08,
            48
        ),
        new THREE.MeshStandardMaterial({
            color:0x111116,
            metalness:.7,
            roughness:.3
        })
    );

    floor.position.y=-.05;

    s.add(floor);

    loader.load(

        path,

        gltf=>{

            const model=gltf.scene;

            normalizeModel(model,3);

            s.add(model);

            previewScenes.push({
                scene:s,
                camera:c,
                renderer:r,
                model:model
            });

        },

        undefined,

        err=>{

            console.error(
                'MODEL LOAD ERROR:',
                path,
                err
            );

        }

    );

}


function previewLoop(){

    requestAnimationFrame(previewLoop);

    previewScenes.forEach(p=>{

        if(p.model){

            p.model.rotation.y += .006;

        }

        p.renderer.render(
            p.scene,
            p.camera
        );

    });

}

previewLoop();


/* =====================================================
                    GAME START
===================================================== */

function startGame(){

    state.playing=true;
    state.paused=false;

    state.health=100;
    state.kills=0;
    state.ammo=18;

    initThree();

    loadPlayer();

    spawnMission();

    updateHUD();

}


/* =====================================================
                    THREE INIT
===================================================== */

function initThree(){

    scene=new THREE.Scene();

    scene.background=
        new THREE.Color(0x020204);

    scene.fog=
        new THREE.FogExp2(
            0x030305,
            .018
        );

    camera=new THREE.PerspectiveCamera(
        60,
        innerWidth/innerHeight,
        .1,
        250
    );

    camera.position.set(
        0,
        5,
        9
    );

    renderer=new THREE.WebGLRenderer({
        canvas:$('gameCanvas'),
        antialias:true,
        powerPreference:'high-performance'
    });

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    renderer.setPixelRatio(
        Math.min(devicePixelRatio,1.8)
    );

    renderer.shadowMap.enabled=true;

    renderer.shadowMap.type=
        THREE.PCFSoftShadowMap;

    composer=new EffectComposer(renderer);

    const renderPass=
        new RenderPass(
            scene,
            camera
        );

    composer.addPass(renderPass);

    const bloom=
        new UnrealBloomPass(
            new THREE.Vector2(
                innerWidth,
                innerHeight
            ),
            .7,
            .6,
            .8
        );

    composer.addPass(bloom);

    // LIGHTING

    const ambient=
        new THREE.HemisphereLight(
            0x606070,
            0x080006,
            1.5
        );

    scene.add(ambient);

    const main=
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    main.position.set(
        -20,
        35,
        20
    );

    main.castShadow=true;

    main.shadow.mapSize.width=2048;
    main.shadow.mapSize.height=2048;

    scene.add(main);

    const redLight=
        new THREE.PointLight(
            0xff0038,
            40,
            45
        );

    redLight.position.set(
        0,
        7,
        0
    );

    scene.add(redLight);

    createArena(
        scene,
        MISSIONS[state.mission-1]
    );

    window.addEventListener(
        'resize',
        resize
    );

}


/* =====================================================
                    PLAYER
===================================================== */

async function loadPlayer(){

    if(player){

        scene.remove(player);

    }

    player=new THREE.Group();

    player.position.set(
        0,
        0,
        25
    );

    scene.add(player);

    const path =
        state.operative==='boy'
        ? MODEL_PATHS.boyAgent
        : MODEL_PATHS.girlAgent;

    loader.load(

        path,

        gltf=>{

            playerModel=gltf.scene;

            normalizeModel(
                playerModel,
                3.4
            );

            player.add(
                playerModel
            );

        },

        undefined,

        error=>{

            console.error(
                'PLAYER MODEL ERROR',
                error
            );

            createFallbackPlayer();

        }

    );

}


function normalizeModel(model,targetHeight){

    const box=
        new THREE.Box3()
        .setFromObject(model);

    const size=
        box.getSize(
            new THREE.Vector3()
        );

    const scale=
        targetHeight / size.y;

    model.scale.setScalar(scale);

    const box2=
        new THREE.Box3()
        .setFromObject(model);

    model.position.y -=
        box2.min.y;

    model.traverse(obj=>{

        if(obj.isMesh){

            obj.castShadow=true;
            obj.receiveShadow=true;

        }

    });

}


function createFallbackPlayer(){

    const body=
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                .55,
                1.3,
                6,
                12
            ),
            new THREE.MeshStandardMaterial({
                color:0x161820,
                metalness:.5,
                roughness:.5
            })
        );

    body.position.y=1;

    player.add(body);

}


/* =====================================================
                    ENEMIES
===================================================== */

function spawnEnemy(x,z){

    const enemy=
        new THREE.Group();

    enemy.position.set(
        x,
        0,
        z
    );

    enemy.userData={
        health:100,
        speed:.035,
        alive:true
    };

    scene.add(enemy);

    loader.load(

        MODEL_PATHS.enemy,

        gltf=>{

            const model=gltf.scene;

            normalizeModel(
                model,
                3.1
            );

            enemy.add(model);

        },

        undefined,

        ()=>{

            const body=
                new THREE.Mesh(
                    new THREE.CapsuleGeometry(
                        .5,
                        1.3,
                        5,
                        10
                    ),
                    new THREE.MeshStandardMaterial({
                        color:0x050507,
                        emissive:0x30000b,
                        emissiveIntensity:1
                    })
                );

            body.position.y=1;

            enemy.add(body);

        }

    );

    enemies.push(enemy);

}


function spawnMission(){

    enemies.forEach(e=>{
        scene.remove(e);
    });

    enemies=[];

    terminals=[];
    evidence=[];

    const m=
        MISSIONS[state.mission-1];

    // ENEMIES

    const amount =
        state.mission===1 ? 3 :
        state.mission===2 ? 5 :
        state.mission===3 ? 6 :
        state.mission===4 ? 9 :
        12;

    for(let i=0;i<amount;i++){

        spawnEnemy(
            (Math.random()-.5)*70,
            (Math.random()-.5)*70
        );

    }

    // PHYSICAL EVIDENCE

    if(m.type==='physical'){

        createEvidence(
            8,
            0,
            -8
        );

    }

    // TERMINAL

    if(
        m.type==='hack' ||
        m.type==='digital'
    ){

        createTerminal(
            -8,
            0,
            -12
        );

    }

}


/* =====================================================
                    EVIDENCE
===================================================== */

function createEvidence(x,y,z){

    const obj=new THREE.Group();

    obj.position.set(
        x,y,z
    );

    const device=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .8,.18,1.5
            ),
            new THREE.MeshStandardMaterial({
                color:0x101116,
                metalness:.8,
                roughness:.25
            })
        );

    device.position.y=.3;

    obj.add(device);

    const glow=
        new THREE.PointLight(
            0xff1744,
            3,
            5
        );

    glow.position.y=.6;

    obj.add(glow);

    obj.userData.type='evidence';

    scene.add(obj);

    evidence.push(obj);

}


/* =====================================================
                    TERMINAL
===================================================== */

function createTerminal(x,y,z){

    const terminal=new THREE.Group();

    terminal.position.set(
        x,y,z
    );

    const body=
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.4,
                2.5,
                .7
            ),
            new THREE.MeshStandardMaterial({
                color:0x14151a,
                metalness:.7,
                roughness:.3
            })
        );

    body.position.y=1.25;

    terminal.add(body);

    const screen=
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                .8,
                1.1
            ),
            new THREE.MeshBasicMaterial({
                color:0xff1744
            })
        );

    screen.position.set(
        0,
        1.4,
        -.37
    );

    screen.rotation.y=Math.PI;

    terminal.add(screen);

    terminal.userData.type='terminal';

    scene.add(terminal);

    terminals.push(terminal);

}


/* =====================================================
                    INPUT
===================================================== */

window.addEventListener(
    'keydown',
    e=>{

        keys[e.code]=true;

        if(e.code==='Escape'){

            togglePause();

        }

        if(e.code==='KeyE'){

            interact();

        }

    }
);

window.addEventListener(
    'keyup',
    e=>{

        keys[e.code]=false;

    }
);

window.addEventListener(
    'mousedown',
    e=>{

        if(e.button===0){

            shoot();

        }

    }
);


/* =====================================================
                    MOVEMENT
===================================================== */

function updatePlayer(dt){

    if(!player) return;

    let x=0;
    let z=0;

    if(keys['KeyW']||keys['ArrowUp'])
        z-=1;

    if(keys['KeyS']||keys['ArrowDown'])
        z+=1;

    if(keys['KeyA']||keys['ArrowLeft'])
        x-=1;

    if(keys['KeyD']||keys['ArrowRight'])
        x+=1;

    if(x||z){

        const length=
            Math.hypot(x,z);

        x/=length;
        z/=length;

        const speed=
            keys['ShiftLeft']
            ? .20
            : .105;

        player.position.x +=
            x*speed;

        player.position.z +=
            z*speed;

        player.rotation.y=
            Math.atan2(x,z);

    }

    player.position.x=
        THREE.MathUtils.clamp(
            player.position.x,
            -46,
            46
        );

    player.position.z=
        THREE.MathUtils.clamp(
            player.position.z,
            -46,
            46
        );

}


/* =====================================================
                    CAMERA
===================================================== */

function updateCamera(){

    if(!player) return;

    const desired=
        new THREE.Vector3(
            player.position.x,
            player.position.y+5.2,
            player.position.z+8
        );

    camera.position.lerp(
        desired,
        .08
    );

    camera.lookAt(
        player.position.x,
        1.5,
        player.position.z-2
    );

}


/* =====================================================
                    SHOOTING
===================================================== */

function shoot(){

    if(
        !state.playing ||
        state.paused ||
        state.ammo<=0
    ) return;

    state.ammo--;

    const origin=
        camera.position.clone();

    const direction=
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );

    const ray=
        new THREE.Raycaster(
            origin,
            direction,
            0,
            100
        );

    const objects=[];

    enemies.forEach(e=>{

        e.traverse(o=>{

            if(o.isMesh)
                objects.push(o);

        });

    });

    const hits=
        ray.intersectObjects(
            objects,
            true
        );

    if(hits.length){

        let obj=
            hits[0].object;

        while(
            obj.parent &&
            !obj.userData.health
        ){

            obj=obj.parent;

        }

        if(obj.userData.health){

            obj.userData.health-=50;

            hitEffect(
                hits[0].point
            );

            if(
                obj.userData.health<=0
            ){

                killEnemy(obj);

            }

        }

    }

    if(state.ammo<=0){

        setTimeout(()=>{
            state.ammo=18;
        },800);

    }

    updateHUD();

}


/* =====================================================
                    HIT EFFECT
===================================================== */

function hitEffect(point){

    const geometry=
        new THREE.SphereGeometry(
            .12,
            8,
            8
        );

    const material=
        new THREE.MeshBasicMaterial({
            color:0xff1744
        });

    const mesh=
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.copy(point);

    scene.add(mesh);

    let life=0;

    function animate(){

        life+=.05;

        mesh.scale.multiplyScalar(
            1.12
        );

        material.opacity=
            1-life;

        material.transparent=true;

        if(life<1){

            requestAnimationFrame(
                animate
            );

        }else{

            scene.remove(mesh);

        }

    }

    animate();

    $('hitMarker').style.opacity='1';

    setTimeout(()=>{
        $('hitMarker').style.opacity='0';
    },100);

}


/* =====================================================
                    KILL
===================================================== */

function killEnemy(enemy){

    enemy.userData.alive=false;

    scene.remove(enemy);

    state.kills++;

    addXP(50);

    enemies=
        enemies.filter(
            e=>e!==enemy
        );

    updateHUD();

    checkObjective();

}


/* =====================================================
                    INTERACTION
===================================================== */

function interact(){

    if(!player || !state.playing)
        return;

    let closest=null;
    let distance=Infinity;

    [
        ...evidence,
        ...terminals
    ].forEach(obj=>{

        const d=
            obj.position.distanceTo(
                player.position
            );

        if(d<distance){

            distance=d;
            closest=obj;

        }

    });

    if(
        closest &&
        distance<4
    ){

        if(
            closest.userData.type===
            'evidence'
        ){

            collectEvidence(
                closest
            );

        }

        if(
            closest.userData.type===
            'terminal'
        ){

            openDecode();

        }

    }

}


/* =====================================================
                    EVIDENCE
===================================================== */

function collectEvidence(obj){

    state.playing=false;

    scene.remove(obj);

    evidence=
        evidence.filter(
            e=>e!==obj
        );

    $('evidenceTitle')
        .textContent=
        'USB DEVICE SECURED';

    $('evidenceDescription')
        .textContent=
        'Physical evidence recovered. Digital forensic trace detected.';

    $('evidenceScreen')
        .classList.add('active');

    addXP(100);

    checkObjective();

}


/* =====================================================
                    DECODE
===================================================== */

let enteredCode='';

function openDecode(){

    state.playing=false;

    enteredCode='';

    $('codeDisplay')
        .textContent='----';

    $('decodeScreen')
        .classList.add('active');

}

document
    .querySelectorAll(
        '.decode-buttons button'
    )
    .forEach(button=>{

        button.onclick=()=>{

            enteredCode +=
                button.dataset.code;

            if(
                enteredCode.length>4
            ){

                enteredCode=
                    enteredCode.slice(-4);

            }

            $('codeDisplay')
                .textContent=
                enteredCode
                    .padEnd(4,'-');

            if(
                enteredCode==='3142'
            ){

                setTimeout(()=>{

                    $('decodeScreen')
                        .classList.remove(
                            'active'
                        );

                    state.playing=true;

                    addXP(150);

                    checkObjective();

                },400);

            }

        };

    });


/* =====================================================
                    OBJECTIVE
===================================================== */

function checkObjective(){

    const m=
        MISSIONS[state.mission-1];

    let complete=false;

    if(m.type==='physical')
        complete=evidence.length===0;

    if(m.type==='digital')
        complete=enemies.length===0;

    if(m.type==='hack')
        complete=true;

    if(m.type==='combat')
        complete=enemies.length===0;

    if(m.type==='boss')
        complete=enemies.length===0;

    if(complete){

        completeMission();

    }

}


/* =====================================================
                    COMPLETE
===================================================== */

function completeMission(){

    if(!state.playing)
        return;

    state.playing=false;

    const m=
        MISSIONS[state.mission-1];

    addXP(m.xp);

    $('completeTitle')
        .textContent=
        m.title+' SECURED';

    $('completeDescription')
        .textContent=
        m.description;

    $('rewardXP')
        .textContent=
        '+'+m.xp;

    $('rewardKills')
        .textContent=
        state.kills;

    $('rewardRating')
        .textContent=
        state.health>75
        ?'S'
        :'A';

    if(
        state.mission>=state.level
    ){

        state.level=
            Math.min(
                5,
                state.level+1
            );

    }

    $('completeScreen')
        .classList.add('active');

}


/* =====================================================
                    XP
===================================================== */

function addXP(amount){

    state.xp+=amount;

    while(
        state.xp>=1000 &&
        state.level<5
    ){

        state.xp-=1000;

        state.level++;

    }

}


/* =====================================================
                    HUD
===================================================== */

function updateWeapon(){

    $('weaponName')
        .textContent=
        state.operative==='boy'
        ?'KAI // PRECISION RIFLE'
        :'VEXA // DUAL PISTOLS';

    $('hudOperative')
        .textContent=
        state.operative==='boy'
        ?'KAI // FIELD AGENT'
        :'VEXA // FIELD AGENT';

}

function updateHUD(){

    const m=
        MISSIONS[state.mission-1];

    $('healthBar')
        .style.width=
        state.health+'%';

    $('healthText')
        .textContent=
        state.health+' HP';

    $('ammo')
        .textContent=
        state.ammo;

    $('hudXP')
        .textContent=
        String(state.xp)
            .padStart(3,'0');

    $('hudLevel')
        .textContent=
        String(state.level)
            .padStart(2,'0');

    $('missionNumber')
        .textContent=
        'MISSION '+
        String(state.mission)
            .padStart(2,'0');

    $('objectiveText')
        .textContent=
        m.objective;

    updateWeapon();

}


/* =====================================================
                    ENEMY AI
===================================================== */

function updateEnemies(){

    if(!player) return;

    enemies.forEach(enemy=>{

        if(
            !enemy.userData.alive
        ) return;

        const distance=
            enemy.position.distanceTo(
                player.position
            );

        if(
            distance<22
        ){

            const direction=
                player.position
                    .clone()
                    .sub(enemy.position)
                    .normalize();

            enemy.position.addScaledVector(
                direction,
                enemy.userData.speed
            );

            enemy.lookAt(
                player.position.x,
                enemy.position.y,
                player.position.z
            );

            if(
                distance<3
            ){

                damagePlayer();

            }

        }

    });

}


/* =====================================================
                    DAMAGE
===================================================== */

let lastDamage=0;

function damagePlayer(){

    const now=
        performance.now();

    if(now-lastDamage<900)
        return;

    lastDamage=now;

    state.health=
        Math.max(
            0,
            state.health-10
        );

    $('damageFlash')
        .style.opacity='.8';

    setTimeout(()=>{
        $('damageFlash')
            .style.opacity='0';
    },120);

    if(state.health<=0){

        alert(
            'OPERATIVE DOWN — RESTARTING MISSION'
        );

        location.reload();

    }

    updateHUD();

}


/* =====================================================
                    PAUSE
===================================================== */

function togglePause(){

    if(!$('game').classList.contains('active'))
        return;

    state.paused=
        !state.paused;

    $('pauseScreen')
        .classList.toggle(
            'active',
            state.paused
        );

}


/* =====================================================
                    MINIMAP
===================================================== */

function updateMinimap(){

    const canvas=
        $('minimapCanvas');

    const ctx=
        canvas.getContext('2d');

    const w=
        canvas.width=
        canvas.clientWidth*devicePixelRatio;

    const h=
        canvas.height=
        canvas.clientHeight*devicePixelRatio;

    ctx.clearRect(
        0,
        0,
        w,
        h
    );

    const scale=
        w/100;

    ctx.strokeStyle=
        'rgba(255,23,68,.25)';

    ctx.lineWidth=1;

    for(let i=0;i<=100;i+=10){

        ctx.beginPath();

        ctx.moveTo(
            i*scale,
            0
        );

        ctx.lineTo(
            i*scale,
            h
        );

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(
            0,
            i*scale
        );

        ctx.lineTo(
            w,
            i*scale
        );

        ctx.stroke();

    }

    if(player){

        const px=
            (player.position.x+50)*
            scale;

        const pz=
            (player.position.z+50)*
            scale;

        ctx.fillStyle='white';

        ctx.beginPath();

        ctx.arc(
            px,
            pz,
            4,
            0,
            Math.PI*2
        );

        ctx.fill();

    }

    enemies.forEach(enemy=>{

        const x=
            (enemy.position.x+50)*
            scale;

        const z=
            (enemy.position.z+50)*
            scale;

        ctx.fillStyle='#ff1744';

        ctx.beginPath();

        ctx.arc(
            x,
            z,
            3,
            0,
            Math.PI*2
        );

        ctx.fill();

    });

}


/* =====================================================
                    GAME LOOP
===================================================== */

function animate(){

    requestAnimationFrame(
        animate
    );

    const dt=
        clock.getDelta();

    if(
        state.playing &&
        !state.paused
    ){

        updatePlayer(dt);

        updateEnemies();

        updateCamera();

        updateMinimap();

        composer.render();

    }else{

        composer.render();

    }

}

animate();


/* =====================================================
                    RESIZE
===================================================== */

function resize(){

    if(!camera || !renderer)
        return;

    camera.aspect=
        innerWidth/innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    composer.setSize(
        innerWidth,
        innerHeight
    );

}


/* =====================================================
                    MOBILE
===================================================== */

$('shootMobile').onclick=()=>{
    shoot();
};

$('interactMobile').onclick=()=>{
    interact();
};


/* Simple mobile movement */

let touchStart=null;

$('joystick').addEventListener(
    'touchstart',
    e=>{

        const t=e.touches[0];

        touchStart={
            x:t.clientX,
            y:t.clientY
        };

    }
);

$('joystick').addEventListener(
    'touchmove',
    e=>{

        if(!touchStart)
            return;

        const t=e.touches[0];

        const dx=
            t.clientX-touchStart.x;

        const dy=
            t.clientY-touchStart.y;

        keys['KeyW']=dy<-15;
        keys['KeyS']=dy>15;
        keys['KeyA']=dx<-15;
        keys['KeyD']=dx>15;

    }
);

$('joystick').addEventListener(
    'touchend',
    ()=>{

        keys={};

    }
);
