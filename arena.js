import * as THREE from 'three';

export const LEVELS = [
 {id:1,title:'ABANDONED CYBER DISTRICT',location:'NEON CITY // SECTOR 07',threat:'PHISHING + INFECTED USB',theme:'city',color:0xff1744,evidence:'Compromised USB drive',terminal:'Trace the phishing command server',enemies:5,xp:300},
 {id:2,title:'UNDERGROUND SERVER FACILITY',location:'SUBLEVEL // DATA VAULT',threat:'RANSOMWARE',theme:'server',color:0xff1744,evidence:'Ransomware payload drive',terminal:'Decrypt the locked server vault',enemies:7,xp:450},
 {id:3,title:'CORPORATE TOWER',location:'FLOOR 47 // EXECUTIVE WING',threat:'INSIDER ATTACK',theme:'office',color:0xff1744,evidence:'Stolen access badge',terminal:'Expose the insider access route',enemies:8,xp:600},
 {id:4,title:'BLACK-SITE DATA CENTER',location:'RESTRICTED // NODE ZERO',threat:'ESPIONAGE + MALWARE',theme:'blacksite',color:0xff1744,evidence:'Exfiltration device',terminal:'Purge the malware relay',enemies:10,xp:800},
 {id:5,title:'CYBER CORE',location:'CRITICAL // CORE CHAMBER',threat:'FULL-SCALE CYBER BREACH',theme:'core',color:0xff1744,evidence:'Rootkit hardware implant',terminal:'Shut down the hostile cyber core',enemies:13,xp:1200}
];

function mat(color,metal=.25,rough=.65,emissive=0,ei=0){
 return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:ei});
}
function box(scene,pos,size,material,rot=0){
 const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function cyl(scene,pos,r,h,material){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),material);m.position.set(...pos);m.castShadow=true;scene.add(m);return m;
}
function light(scene,pos,color,intensity=3,dist=12){
 const l=new THREE.PointLight(color,intensity,dist);l.position.set(...pos);scene.add(l);
 const s=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color}));s.position.set(...pos);scene.add(s);
}
export function buildArena(scene,level,onEvidence,onTerminal){
 const cfg=LEVELS[level-1], root=new THREE.Group();scene.add(root);
 const floor=mat(0x08090d,.5,.8), steel=mat(0x181a20,.8,.35), wall=mat(0x101116,.65,.5), red=mat(0x7d0b22,.4,.35,0xff1744,3);
 box(root,[0,-.35,0],[50,.5,50],floor);
 // boundary
 box(root,[0,4,-25],[50,8,.5],wall);box(root,[0,4,25],[50,8,.5],wall);box(root,[-25,4,0],[.5,8,50],wall);box(root,[25,4,0],[.5,8,50],wall);
 if(cfg.theme==='city') buildCity(root,steel,red,light,scene);
 if(cfg.theme==='server') buildServer(root,steel,red,light,scene);
 if(cfg.theme==='office') buildOffice(root,steel,red,light,scene);
 if(cfg.theme==='blacksite') buildBlacksite(root,steel,red,light,scene);
 if(cfg.theme==='core') buildCore(root,steel,red,light,scene);
 const evidence=makeEvidence(root,[cfg.id%2? -9:9,1,-8],red,cfg.evidence); evidence.userData.type='evidence';evidence.userData.title=cfg.evidence;evidence.userData.action=onEvidence;
 const terminal=makeTerminal(root,[8,1,8],red);terminal.userData.type='terminal';terminal.userData.title=cfg.terminal;terminal.userData.action=onTerminal;
 return {root,evidence,terminal,config:cfg};
}
function buildCity(g,s,r,L,scene){
 for(let x=-20;x<=20;x+=5) box(g,[x,3,-16],[3,6,4],s);
 for(let x=-18;x<=18;x+=6) box(g,[x,1,13],[4,2,5],s);
 for(let x=-18;x<=18;x+=6){box(g,[x,1.4,0],[.25,2.8,.25],r);L(scene,[x,2.8,0],0xff1744,2,10)}
 for(let i=0;i<16;i++){const x=(i%4)*9-13,z=Math.floor(i/4)*8-12;box(g,[x,.5,z],[2,.9,1],steel());}
}
function buildServer(g,s,r,L,scene){
 for(let x=-16;x<=16;x+=4){for(let z=-14;z<=14;z+=7){box(g,[x,2,z],[2.4,4.5,4.5],s);box(g,[x,3,z-2.27],[1.7,.08,.05],r);}}
 for(let z=-20;z<=20;z+=5){box(g,[0,.08,z],[40,.12,.25],r);}
 L(scene,[0,4,0],0xff1744,5,22);
}
function buildOffice(g,s,r,L,scene){
 for(let z=-16;z<=16;z+=8){for(let x=-18;x<=18;x+=9){box(g,[x,1.1,z],[6,.15,4],s);box(g,[x,1.8,z],[.12,1.2,3.5],r);box(g,[x,2.6,z],[1.5,.08,1],s);}}
 for(let x=-20;x<=20;x+=10)box(g,[x,2,-4],[.15,4,16],s);
 L(scene,[0,4,0],0xff1744,4,20);
}
function buildBlacksite(g,s,r,L,scene){
 for(let i=-2;i<=2;i++){box(g,[i*8,2,0],[2,4,35],s);box(g,[0,2,i*8],[35,4,2],s);}
 for(let i=-2;i<=2;i++)L(scene,[i*8,4,-12],0xff1744,3,10);
 for(let i=0;i<8;i++)cyl(g,[(i%4)*9-13,.8,Math.floor(i/4)*12-6],1,.9,r);
}
function buildCore(g,s,r,L,scene){
 for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.cos(a)*15,z=Math.sin(a)*15;box(g,[x,2,z],[2,4,6],s,a);}
 for(let i=0;i<3;i++)cyl(g,[0,i*2+1,0],4-i*.6,.5,r);
 L(scene,[0,6,0],0xff1744,10,28);
}
function steel(){return mat(0x20232a,.75,.4)}
function makeEvidence(g,pos,r,label){
 const q=new THREE.Group();q.position.set(...pos);box(q,[0,0,0],[.8,.25,1.5],mat(0x11151b,.8,.25),.3);lightPulse(q,r);q.userData.label=label;g.add(q);return q;
}
function makeTerminal(g,pos,r){
 const q=new THREE.Group();q.position.set(...pos);box(q,[0,1,0],[1.4,2,1],mat(0x14161c,.7,.3));box(q,[0,1.35,.53],[.9,.55,.05],r);lightPulse(q,r);g.add(q);return q;
}
function lightPulse(g,r){const s=new THREE.Mesh(new THREE.SphereGeometry(.16,8,8),new THREE.MeshBasicMaterial({color:0xff1744}));s.position.y=1.2;g.add(s);}
