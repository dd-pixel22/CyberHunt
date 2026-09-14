import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {buildArena,LEVELS} from './arena.js';

const MODEL_PATHS={girlAgent:'assets/models/girl-agent.glb',boyAgent:'assets/models/boy-agent.glb',enemy:'assets/models/enemy.glb'};
const state={level:1,xp:0,health:100,operative:'girl',badges:[],kills:0,shots:0,hits:0};
let previewState={girl:null,boy:null,raf:null};
let scene,camera,renderer,composer,clock,player,arena,loader=new GLTFLoader(),modelCache=new Map(),keys={},enemies=[],interactables=[],running=false,paused=false,near=null,ammo=12,reserve=72,missionStart=0;
const raycaster=new THREE.Raycaster();

const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.overlay-screen').forEach(x=>x.classList.remove('open'));$(id)?.classList.add('open')}
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('toast');setTimeout(()=>e.classList.remove('toast'),1800)}
function setXP(){const total=state.xp%1000;const lvl=Math.floor(state.xp/1000)+1;$('menu-level').textContent=String(lvl).padStart(2,'0');$('menu-xp').textContent=`${total} / 1000 XP`;$('menu-xp-bar').style.width=`${total/10}%`}
function openMenu(screen){show(screen)}
function missionCards(){const g=$('mission-grid');g.innerHTML='';LEVELS.forEach((m,i)=>{const b=document.createElement('button');b.className='mission-card'+(i+1===state.level?' selected':'');b.innerHTML=`<small>OPERATION 0${m.id}</small><h3>${m.title}</h3><p>${m.location}</p><p>THREAT: ${m.threat}</p>`;b.onclick=()=>{state.level=i+1;missionCards();show('operative-screen')};g.appendChild(b)})}
function badges(){const g=$('badge-grid');const all=[['FIRST CONTACT','Complete Operation 01'],['LOCKBREAKER','Decrypt a secure terminal'],['GHOST','Finish a mission with high accuracy'],['THREAT HUNTER','Collect physical evidence'],['CYBER WARDEN','Complete all five operations']];g.innerHTML=all.map((x,i)=>`<div class="badge-card"><b>${state.badges.includes(x[0])?'◆':'◇'} ${x[0]}</b><span>${x[1]}</span></div>`).join('')}
function loadModel(path,scale=1){
 if(modelCache.has(path))return Promise.resolve(modelCache.get(path).clone());
 return loader.loadAsync(path).then(g=>{g.scene.scale.setScalar(scale);g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});modelCache.set(path,g.scene);return g.scene.clone()})
}
async function makePlayer(){
 const g=new THREE.Group();
 const path=state.operative==='boy'?MODEL_PATHS.boyAgent:MODEL_PATHS.girlAgent;
 try{
   const m=await loadModel(path,1.65);
   g.add(m);
 }catch(e){
   console.warn('Operative GLB failed to load:',path,e);
   const body=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.35,8,12),new THREE.MeshStandardMaterial({color:0x171820,metalness:.55,roughness:.32}));
   body.position.y=1.2;g.add(body);
   const visor=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,.18),new THREE.MeshBasicMaterial({color:0xff1744}));visor.position.set(0,2.4,.38);g.add(visor);
 }
 g.position.set(0,0,18);
 g.userData.operative=state.operative;
 scene.add(g);return g;
}

async function spawnEnemy(pos){
 const g=new THREE.Group();g.position.set(...pos);
 try{const m=await loadModel(MODEL_PATHS.enemy,1.4);g.add(m)}catch(e){const body=new THREE.Mesh(new THREE.CapsuleGeometry(.6,1.2,5,8),new THREE.MeshStandardMaterial({color:0x120a0d,metalness:.7}));body.position.y=1.1;g.add(body);const eye=new THREE.Mesh(new THREE.BoxGeometry(.5,.1,.15),new THREE.MeshBasicMaterial({color:0xff1744}));eye.position.set(0,2.1,.35);g.add(eye)}
 g.userData={hp:40,speed:1.5+Math.random(),cool:Math.random()*2};scene.add(g);enemies.push(g)
}
function disposePreview(which){
 const v=previewState[which];
 if(!v)return;
 if(v.raf)cancelAnimationFrame(v.raf);
 v.renderer?.dispose();
 const el=$(which==='girl'?'vexa-preview':'kai-preview');
 if(el)el.innerHTML='';
 previewState[which]=null;
}

async function initOperativePreview(which){
 const el=$(which==='girl'?'vexa-preview':'kai-preview');
 if(!el||previewState[which])return;
 const ps=new THREE.Scene();ps.background=new THREE.Color(0x050507);
 const pc=new THREE.PerspectiveCamera(32,1,.1,100);pc.position.set(0,1.8,6.2);
 const pr=new THREE.WebGLRenderer({antialias:true,alpha:false});pr.setPixelRatio(Math.min(devicePixelRatio,1.5));pr.setSize(250,250);pr.shadowMap.enabled=true;el.appendChild(pr.domElement);
 ps.add(new THREE.HemisphereLight(0xaab3c2,0x08080c,1.8));
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(3,6,5);key.castShadow=true;ps.add(key);
 const rim=new THREE.PointLight(0xff1744,5,8);rim.position.set(-3,2,1);ps.add(rim);
 const platform=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.65,.22,48),new THREE.MeshStandardMaterial({color:0x101116,metalness:.8,roughness:.25,emissive:0x26000b,emissiveIntensity:.4}));platform.position.y=-.12;platform.receiveShadow=true;ps.add(platform);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.48,.025,8,64),new THREE.MeshBasicMaterial({color:0xff1744}));ring.position.y=.02;ps.add(ring);
 const path=which==='boy'?MODEL_PATHS.boyAgent:MODEL_PATHS.girlAgent;
 try{
   const m=await loadModel(path,1.45);m.position.y=0;m.rotation.y=Math.PI;
   const box=new THREE.Box3().setFromObject(m),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   m.position.y-=box.min.y;
   const max=Math.max(size.x,size.y,size.z);if(max>0)m.scale.multiplyScalar(2.55/max);
   m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
   ps.add(m);
   previewState[which]={scene:ps,camera:pc,renderer:pr,model:m,ring};
   const animate=()=>{const v=previewState[which];if(!v)return;v.model.rotation.y+=0.008;v.ring.rotation.z+=0.01;v.renderer.render(v.scene,v.camera);v.raf=requestAnimationFrame(animate)};
   animate();
 }catch(e){
   console.warn('Preview GLB failed to load:',path,e);
   const fallback=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.4,8,12),new THREE.MeshStandardMaterial({color:0x181a20,metalness:.5,roughness:.35}));fallback.position.y=1.15;ps.add(fallback);
   previewState[which]={scene:ps,camera:pc,renderer:pr,model:fallback,ring};
   const animate=()=>{const v=previewState[which];if(!v)return;v.model.rotation.y+=0.008;v.ring.rotation.z+=0.01;v.renderer.render(v.scene,v.camera);v.raf=requestAnimationFrame(animate)};animate();
 }
}

function initOperativePreviews(){initOperativePreview('girl');initOperativePreview('boy')}

async function startGame(){
 disposePreview('girl');disposePreview('boy');
 document.querySelectorAll('.overlay-screen').forEach(x=>x.classList.remove('open'));$('start-screen').classList.remove('active');$('game-screen').classList.add('active');
 if(running){running=false;await new Promise(r=>setTimeout(r,20));}
 initThree();arena=buildArena(scene,state.level,(o)=>evidence(o),(o)=>terminal(o));interactables=[arena.evidence,arena.terminal];player=await makePlayer();
 const c=LEVELS[state.level-1];for(let i=0;i<c.enemies;i++){const a=i*Math.PI*2/c.enemies;await spawnEnemy([Math.cos(a)*(10+Math.random()*7),0,Math.sin(a)*(10+Math.random()*7)])}
 updateHUD();running=true;missionStart=performance.now();toast(`OPERATION 0${state.level} // ${c.title}`);requestAnimationFrame(loop)
}
function initThree(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0x020204);scene.fog=new THREE.FogExp2(0x050507,.018);
 camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,200);camera.position.set(0,9,14);
 renderer=new THREE.WebGLRenderer({canvas:$('game-canvas'),antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.75,.65,.15));
 scene.add(new THREE.HemisphereLight(0x9aa4b8,0x030305,1.15));const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(12,28,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-30;sun.shadow.camera.right=30;sun.shadow.camera.top=30;sun.shadow.camera.bottom=-30;scene.add(sun);const redFill=new THREE.PointLight(0xff1744,8,28);redFill.position.set(0,5,0);scene.add(redFill);const coolFill=new THREE.PointLight(0x334466,5,32);coolFill.position.set(-14,8,12);scene.add(coolFill);
 clock=new THREE.Clock();
}
function updateHUD(){
 const m=LEVELS[state.level-1];$('hud-mission-number').textContent=String(state.level).padStart(2,'0');$('hud-mission-title').textContent=m.title;$('map-level').textContent=`LVL 0${state.level}`;$('weapon-name').textContent=state.operative==='boy'?'KAI // PRECISION RIFLE':'VEXA // DUAL PISTOLS';$('health-text').textContent=Math.max(0,Math.round(state.health));$('health-bar').style.width=state.health+'%';$('ammo-current').textContent=ammo;$('ammo-reserve').textContent=reserve;
 $('objective-list').innerHTML=`<div id="obj-evidence">□ COLLECT PHYSICAL EVIDENCE</div><div id="obj-terminal">□ DECRYPT SECURITY TERMINAL</div><div id="obj-enemies">□ NEUTRALIZE HOSTILES (${enemies.length})</div><div id="obj-exit">□ EXTRACT FROM THE AREA</div>`;
}
function mark(id){const e=$(id);if(e){e.classList.add('done');e.textContent='✓ '+e.textContent.slice(2)}}
function evidence(o){$('evidence-title').textContent=o.userData.title;$('evidence-text').textContent='Forensic scan confirms this object is linked to the active cyber threat. Collect it for mission intelligence.';show('evidence-screen');$('collect-evidence').onclick=()=>{state.badges.push('THREAT HUNTER');mark('obj-evidence');o.visible=false;showGame();toast('PHYSICAL EVIDENCE SECURED')};$('leave-evidence').onclick=showGame}
function terminal(o){openDecrypt(o)}
function openDecrypt(o){show('decrypt-screen');$('terminal-log').textContent=`[SECURE NODE ${state.level}]\n> INTRUSION DETECTED\n> ENCRYPTION: AES-256\n> ENTER 4-DIGIT OVERRIDE CODE\n> THREAT: ${LEVELS[state.level-1].threat}`;let code='';const slots=$('code-slots'),keypad=$('code-keypad');slots.innerHTML='<div class="code-slot">_</div>'.repeat(4);keypad.innerHTML='';for(let n=1;n<=9;n++)addKey(n);addKey(0);function addKey(n){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{if(code.length<4){code+=n;render()}};keypad.appendChild(b)}function render(){[...slots.children].forEach((x,i)=>x.textContent=code[i]||'_')}$('decode-btn').onclick=()=>{if(code===String(1379+state.level-1)){mark('obj-terminal');state.badges.push('LOCKBREAKER');o.visible=false;showGame();toast('TERMINAL DECRYPTED')}else{$('decode-message').textContent='ACCESS DENIED — INCORRECT CODE';code='';render()}}}
function showGame(){document.querySelectorAll('.overlay-screen').forEach(x=>x.classList.remove('open'))}
function shoot(){
 if(!running||paused)return;if(ammo<=0){toast('RELOAD REQUIRED');ammo=12;reserve=Math.max(0,reserve-12);return}
 ammo--;state.shots++;raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const hits=raycaster.intersectObjects(enemies,true);if(hits.length){let o=hits[0].object;while(o.parent&&!enemies.includes(o))o=o.parent;if(enemies.includes(o)){o.userData.hp-=25;state.hits++;hitFx(o.position);if(o.userData.hp<=0){scene.remove(o);enemies=enemies.filter(e=>e!==o);mark('obj-enemies');toast('HOSTILE NEUTRALIZED')}}}
 updateHUD()
}
function hitFx(p){const s=new THREE.Mesh(new THREE.SphereGeometry(.15,8,8),new THREE.MeshBasicMaterial({color:0xff1744}));s.position.copy(p);scene.add(s);let t=0;const f=()=>{t+=.08;s.scale.setScalar(1+t*5);s.material.opacity=1-t;s.material.transparent=true;if(t<1)requestAnimationFrame(f);else scene.remove(s)};f()}
function updatePlayer(dt){
 let x=0,z=0;if(keys.KeyW)z-=1;if(keys.KeyS)z+=1;if(keys.KeyA)x-=1;if(keys.KeyD)x+=1;if(x||z){const v=new THREE.Vector3(x,0,z).normalize();const speed=keys.ShiftLeft?8:4.5;player.position.addScaledVector(v,dt*speed)}
 const target=new THREE.Vector3(player.position.x,7,player.position.z+10);camera.position.lerp(target,.08);camera.lookAt(player.position.x,1.3,player.position.z);
 player.position.x=THREE.MathUtils.clamp(player.position.x,-22,22);player.position.z=THREE.MathUtils.clamp(player.position.z,-22,22)
}
function updateEnemies(dt){
 enemies.forEach(e=>{const d=e.position.distanceTo(player.position);if(d<18){e.lookAt(player.position.x,e.position.y,player.position.z);if(d>2.4)e.position.addScaledVector(player.position.clone().sub(e.position).normalize(),dt*e.userData.speed);e.userData.cool-=dt;if(d<7&&e.userData.cool<0){state.health-=5;e.userData.cool=1.4;updateHUD();if(state.health<=0){running=false;toast('OPERATIVE DOWN');setTimeout(()=>location.reload(),1200)}}}})
}
function updateInteract(){
 near=null;let best=2.7;interactables.forEach(o=>{if(!o.visible)return;const d=o.position.distanceTo(player.position);if(d<best){best=d;near=o}});$('interact-hint').textContent=near?'E INTERACT · '+near.userData.title:'WASD MOVE · SHIFT SPRINT · E INTERACT · CLICK SHOOT'
}
function interact(){if(near&&near.userData.type==='evidence')evidence(near);else if(near&&near.userData.type==='terminal')terminal(near)}
function checkComplete(){const noEnemies=enemies.length===0,ev=!arena.evidence.visible,term=!arena.terminal.visible;if(noEnemies&&ev&&term){mark('obj-exit');if(player.position.length()<5)completeMission()}}
function completeMission(){running=false;const m=LEVELS[state.level-1];const accuracy=state.shots?Math.round(state.hits/state.shots*100):100;state.xp+=m.xp;if(state.level===5)state.badges.push('CYBER WARDEN');if(state.level===1)state.badges.push('FIRST CONTACT');if(accuracy>=80)state.badges.push('GHOST');setXP();$('complete-title').textContent=m.title;$('complete-subtitle').textContent='Threat contained. Intelligence recovered. Sector secured.';$('reward-xp').textContent=m.xp;$('reward-badge').textContent=state.badges[state.badges.length-1]||'OPERATIVE';$('reward-accuracy').textContent=accuracy;show('complete-screen')}
function drawMap(){
 const c=$('minimap-canvas'),x=c.getContext('2d');x.clearRect(0,0,180,180);x.fillStyle='#07070a';x.fillRect(0,0,180,180);x.strokeStyle='#55101f';x.strokeRect(5,5,170,170);x.strokeStyle='#ff1744';for(let i=0;i<8;i++){x.beginPath();x.moveTo(10+i*22,10);x.lineTo(10+i*22,170);x.stroke()}const px=90+player.position.x*3,pz=90+player.position.z*3;x.fillStyle='#fff';x.beginPath();x.arc(px,pz,4,0,7);x.fill();x.fillStyle='#ff1744';enemies.forEach(e=>{const ex=90+e.position.x*3,ez=90+e.position.z*3;x.fillRect(ex-2,ez-2,4,4)})}
function loop(){if(!running)return;requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.05);if(!paused){updatePlayer(dt);updateEnemies(dt);updateInteract();checkComplete();drawMap()}composer.render()}
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE')interact();if(e.code==='Escape'){paused=!paused;show(paused?'pause-screen':'game-screen')}});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('mousedown',e=>{if(e.button===0)shoot()});addEventListener('resize',()=>{if(renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight)}});
$('begin-mission').onclick=()=>show('mission-screen');$('deploy-operative').onclick=startGame;$('pause-btn').onclick=()=>{paused=true;show('pause-screen')};$('resume-btn').onclick=()=>{paused=false;showGame()};$('restart-btn').onclick=()=>location.reload();$('exit-btn').onclick=()=>location.reload();$('decrypt-close').onclick=showGame;$('mobile-interact').onclick=interact;$('mobile-shoot').onclick=shoot;
$('next-mission').onclick=()=>{if(state.level<5){state.level++;startGame()}else{showGame();location.reload()}};$('complete-menu').onclick=()=>location.reload();
document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>{if(b.dataset.screen==='missions')missionCards();if(b.dataset.screen==='badges')badges();show(b.dataset.screen+'-screen')});document.querySelectorAll('[data-close]').forEach(b=>b.onclick=showGame);
document.querySelectorAll('[data-operative]').forEach(b=>b.onclick=()=>{document.querySelectorAll('.operative-card').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.operative=b.dataset.operative});
let boot=0;const timer=setInterval(()=>{$('boot-status').textContent=['LOADING 3D ASSETS','CALIBRATING THREAT ENGINE','SYSTEM READY'][boot]||'SYSTEM READY';boot++;if(boot>3){clearInterval(timer);$('boot-screen').style.display='none';$('app').classList.remove('hidden')}},650);
missionCards();setXP();initOperativePreviews();
