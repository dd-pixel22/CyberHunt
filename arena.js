import * as THREE from 'three';

export function createArena(scene, mission) {

    const root = new THREE.Group();
    scene.add(root);

    const dark = new THREE.MeshStandardMaterial({
        color: 0x090a0e,
        roughness: .72,
        metalness: .35
    });

    const concrete = new THREE.MeshStandardMaterial({
        color: 0x17181d,
        roughness: .82,
        metalness: .12
    });

    const metal = new THREE.MeshStandardMaterial({
        color: 0x282a30,
        roughness: .45,
        metalness: .8
    });

    const red = new THREE.MeshStandardMaterial({
        color: 0x500816,
        emissive: 0xff092f,
        emissiveIntensity: 3
    });

    function box(x,y,z,w,h,d,mat=dark) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w,h,d),
            mat
        );

        mesh.position.set(x,y,z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        root.add(mesh);

        return mesh;
    }

    function strip(x,y,z,w,d) {
        return box(x,y,z,w,.04,d,red);
    }

    // FLOOR

    box(0,-.25,0,100,.5,100,concrete);

    // GRID

    const grid = new THREE.GridHelper(
        100,
        50,
        0x46101d,
        0x15151a
    );

    grid.position.y=.01;
    root.add(grid);

    // OUTER WALLS

    box(0,5,-50,100,10,1.5,metal);
    box(0,5,50,100,10,1.5,metal);
    box(-50,5,0,1.5,10,100,metal);
    box(50,5,0,1.5,10,100,metal);

    // NEON PERIMETER

    strip(0,.08,-48,95,0.08);
    strip(0,.08,48,95,0.08);
    strip(-48,.08,0,.08,95);
    strip(48,.08,0,.08,95);

    // CENTRAL BUILDINGS

    for(let x=-32;x<=32;x+=16){

        for(let z=-30;z<=30;z+=20){

            if(Math.abs(x)<12 && Math.abs(z)<12) continue;

            const h=4+Math.random()*8;

            box(
                x,
                h/2,
                z,
                11,
                h,
                12,
                dark
            );

            // roof light

            strip(x,h+.04,z,8,0.05);

            // windows

            for(let i=-3;i<=3;i+=2){

                box(
                    x+i*1.1,
                    h*.55,
                    z-6.06,
                    1,
                    .8,
                    .05,
                    red
                );
            }
        }
    }

    // ROAD / OPEN AREA

    box(0,.01,0,14,.04,80,new THREE.MeshStandardMaterial({
        color:0x0b0c10,
        roughness:.9
    }));

    box(0,.02,0,80,.04,14,new THREE.MeshStandardMaterial({
        color:0x0b0c10,
        roughness:.9
    }));

    // COVER OBJECTS

    for(let i=0;i<18;i++){

        const x=(Math.random()-.5)*75;
        const z=(Math.random()-.5)*75;

        if(Math.abs(x)<10 || Math.abs(z)<10) continue;

        box(
            x,
            1,
            z,
            3+Math.random()*3,
            2,
            2+Math.random()*2,
            metal
        );
    }

    // SERVER ROOM STYLE OBJECTS

    if(mission.type === 'digital' || mission.type === 'hack') {

        for(let x=-18;x<=18;x+=6){

            for(let z=-8;z<=8;z+=8){

                box(
                    x,
                    2.3,
                    z,
                    2.2,
                    4.5,
                    3,
                    metal
                );

                for(let y=.8;y<4;y+=.8){

                    box(
                        x,
                        y,
                        z-1.55,
                        1.5,
                        .12,
                        .04,
                        red
                    );
                }
            }
        }
    }

    // CENTRAL CYBER CORE

    const core = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(5,5,1,48),
        metal
    );

    base.position.y=.5;
    core.add(base);

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.2,.12,12,64),
        new THREE.MeshBasicMaterial({
            color:0xff1744
        })
    );

    ring.rotation.x=Math.PI/2;
    ring.position.y=1.1;

    core.add(ring);

    const orb = new THREE.Mesh(
        new THREE.SphereGeometry(1.3,32,32),
        new THREE.MeshStandardMaterial({
            color:0x29000a,
            emissive:0xff0038,
            emissiveIntensity:5
        })
    );

    orb.position.y=2.5;
    core.add(orb);

    root.add(core);

    // STREET LIGHTS

    for(let x=-40;x<=40;x+=20){

        for(let z=-40;z<=40;z+=20){

            if(Math.abs(x)<12 && Math.abs(z)<12) continue;

            box(x,3,z,.25,6,.25,metal);

            const lamp = new THREE.PointLight(
                0xff123d,
                1.4,
                12
            );

            lamp.position.set(x,6,z);
            root.add(lamp);
        }
    }

    // PIPES

    for(let i=0;i<8;i++){

        const pipe= new THREE.Mesh(
            new THREE.CylinderGeometry(.18,.18,20,12),
            metal
        );

        pipe.rotation.z=Math.PI/2;

        pipe.position.set(
            -35+i*10,
            6,
            -44
        );

        root.add(pipe);
    }

    return root;
}
