import * as THREE from 'three';

export const LEVELS=[
{id:1,title:'ABANDONED CYBER DISTRICT',location:'NEON CITY // SECTOR 07',threat:'PHISHING + INFECTED USB',theme:'city',color:0xff1744,evidence:'Compromised USB drive',terminal:'Trace the phishing command server',enemies:5,xp:300},
{id:2,title:'UNDERGROUND SERVER FACILITY',location:'SUBLEVEL // DATA VAULT',threat:'RANSOMWARE',theme:'server',color:0xff1744,evidence:'Ransomware payload drive',terminal:'Decrypt the locked server vault',enemies:7,xp:450},
{id:3,title:'CORPORATE TOWER',location:'FLOOR 47 // EXECUTIVE WING',threat:'INSIDER ATTACK',theme:'office',color:0xff1744,evidence:'Stolen access badge',terminal:'Expose the insider access route',enemies:8,xp:600},
{id:4,title:'BLACK-SITE DATA CENTER',location:'RESTRICTED // NODE ZERO',threat:'ESPIONAGE + MALWARE',theme:'blacksite',color:0xff1744,evidence:'Exfiltration device',terminal:'Purge the malware relay',enemies:10,xp:800},
{id:5,title:'CYBER CORE',location:'CRITICAL // CORE CHAMBER',threat:'FULL-SCALE CYBER BREACH',theme:'core',color:0xff1744,evidence:'Rootkit hardware implant',terminal:'Shut down the hostile cyber core',enemies:13,xp:1200}
];
function mat(color,metal=.25,rough=.65,emissive=0,ei=0){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:ei});}
function box(g,pos,size,material,rot=0){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function cyl(g,pos,r,h,material,segments=20){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function line(g,a,b,material){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);const m=new THREE.Line(geo,material);g.add(m);return m;}
function light(scene,pos,color,intensity=3,dist=12){const l=new THREE.PointLight(color,intensity,dist);l.position.set(...pos);scene.add(l);const s=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color}));s.position.set(...pos);scene.add(s);}
function sign(g,pos,w,h,red){const frame=box(g,pos,[w,.12,h],mat(0x090a0e,.6,.25));const glow=box(g,[pos[0],pos[1],pos[2]+.07],[w*.78,.03,h*.58],red);return {frame,glow};}
function pipes(g,x,z,len,steel,red){box(g,[x,1.1,z],[.22,.22,len],steel);box(g,[x,1.55,z],[.14,.14,len],red);}
export function buildArena(scene,level,onEvidence,onTerminal){
 const cfg=LEVELS[level-1],root=new THREE.Group();scene.add(root);
 const floor=mat(0x07090d,.45,.82),steel=mat(0x151820,.82,.3),wall=mat(0x0c0e13,.72,.48),red=mat(0x5d0718,.45,.3,0xff1744,5),glass=mat(0x26303a,.35,.12,0x10141c,.4);
 box(root,[0,-.4,0],[50,.7,50],floor);
 // Roads / floor panels make the space read as a real environment instead of an empty box.
 for(let i=-20;i<=20;i+=5)box(root,[i,.01,0],[.035,.025,48],mat(i%10?0x17191f:0x2b0b12,.2,.8));
 for(let i=-20;i<=20;i+=5)box(root,[0,.015,i],[48,.025,.035],mat(i%10?0x15171d:0x2b0b12,.2,.8));
 box(root,[0,4,-25],[50,8,.6],wall);box(root,[0,4,25],[50,8,.6],wall);box(root,[-25,4,0],[.6,8,50],wall);box(root,[25,4,0],[.6,8,50],wall);
 if(cfg.theme==='city')buildCity(root,steel,red,glass,light);
 if(cfg.theme==='server')buildServer(root,steel,red,glass,light);
 if(cfg.theme==='office')buildOffice(root,steel,red,glass,light);
 if(cfg.theme==='blacksite')buildBlacksite(root,steel,red,glass,light);
 if(cfg.theme==='core')buildCore(root,steel,red,glass,light);
 const evidence=makeEvidence(root,[cfg.id%2?-9:9,1,-8],red,cfg.evidence);evidence.userData.type='evidence';evidence.userData.title=cfg.evidence;evidence.userData.action=onEvidence;
 const terminal=makeTerminal(root,[8,1,8],red);terminal.userData.type='terminal';terminal.userData.title=cfg.terminal;terminal.userData.action=onTerminal;
 return {root,evidence,terminal,config:cfg};
}
function buildCity(g,s,r,glass,L){
 for(let x=-20;x<=20;x+=8){const h=5+((x+20)%16)/5;box(g,[x,h/2,-17],[5,h,5],s);for(let y=1;y<h;y+=1.2)box(g,[x, y, -14.45],[3.4,.35,.06],glass);sign(g,[x,h*.68,-14.25],2.8,.6,r);}
 for(let x=-18;x<=18;x+=9){box(g,[x,1.4,14],[6,2.8,4],s);sign(g,[x,2.6,11.9],3,.5,r);}
 for(let x=-18;x<=18;x+=6){box(g,[x,1.4,0],[.22,2.8,.22],r);L(g.parent||g,[x,3,0],0xff1744,2,10);}
 for(let i=0;i<14;i++){const x=(i%7)*6-18,z=(i%2)*8-8;box(g,[x,.7,z],[2.2,1.2,1.2],s,.2);}
 pipes(g,-21,4,34,s,r);pipes(g,21,3,34,s,r);
}
function buildServer(g,s,r,glass,L){
 for(let x=-16;x<=16;x+=4){for(let z=-14;z<=14;z+=7){box(g,[x,2,z],[2.5,4.6,4.8],s);box(g,[x,2.5,z-2.43],[1.8,1.8,.05],glass);box(g,[x,3.1,z-2.47],[1.3,.06,.03],r);}}
 for(let z=-20;z<=20;z+=5)box(g,[0,.08,z],[40,.12,.24],r);
 for(let x=-18;x<=18;x+=6)box(g,[x,2.4,0],[.3,4.8,38],s);
 L(g.parent||g,[0,6,0],0xff1744,6,24);
}
function buildOffice(g,s,r,glass,L){
 box(g,[0,5,-19],[44,10,.3],glass);
 for(let z=-16;z<=16;z+=8){for(let x=-18;x<=18;x+=9){box(g,[x,1.1,z],[6,.15,4],s);box(g,[x,1.8,z],[.12,1.2,3.5],glass);box(g,[x,2.55,z],[1.5,.08,1],s);}}
 for(let x=-20;x<=20;x+=10)box(g,[x,2,-4],[.18,4,16],s);
 for(let x=-18;x<=18;x+=9)sign(g,[x,3.5,-12],2.8,.55,r);
 L(g.parent||g,[0,5,0],0xff1744,4,20);
}
function buildBlacksite(g,s,r,glass,L){
 for(let i=-2;i<=2;i++){box(g,[i*8,2,0],[2,4,35],s);box(g,[0,2,i*8],[35,4,2],s);}
 for(let i=-2;i<=2;i++)L(g.parent||g,[i*8,4,-12],0xff1744,3,10);
 for(let i=0;i<8;i++){cyl(g,[(i%4)*9-13,.8,Math.floor(i/4)*12-6],1,.9,r);box(g,[(i%4)*9-13,1.35,Math.floor(i/4)*12-6],[1.8,.12,1.8],s);}
 pipes(g,-18,5,30,s,r);pipes(g,18,5,30,s,r);
}
function buildCore(g,s,r,glass,L){
 for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.cos(a)*15,z=Math.sin(a)*15;box(g,[x,2,z],[2,4,6],s,a);}
 for(let i=0;i<3;i++)cyl(g,[0,i*2+1,0],4-i*.6,.5,r,48);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;box(g,[Math.cos(a)*8,3,Math.sin(a)*8],[.2,6,2],glass,a);}
 L(g.parent||g,[0,6,0],0xff1744,10,28);
}
function makeEvidence(g,pos,r,label){const q=new THREE.Group();q.position.set(...pos);box(q,[0,0,0],[.8,.25,1.5],mat(0x11151b,.8,.25),.3);lightPulse(q,r);q.userData.label=label;g.add(q);return q;}
function makeTerminal(g,pos,r){const q=new THREE.Group();q.position.set(...pos);box(q,[0,1,0],[1.4,2,1],mat(0x14161c,.7,.3));box(q,[0,1.35,.53],[.9,.55,.05],r);box(q,[0,.15,.53],[1.1,.08,.05],r);lightPulse(q,r);g.add(q);return q;}
function lightPulse(g,r){const s=new THREE.Mesh(new THREE.SphereGeometry(.16,8,8),new THREE.MeshBasicMaterial({color:0xff1744}));s.position.y=1.2;g.add(s);}
