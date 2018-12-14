    //first check if browser supports WebGL:
    if ( WEBGL.isWebGLAvailable() === false ) {	document.body.appendChild( WEBGL.getWebGLErrorMessage() ); }

    let mixer;

    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 40, WIDTH/HEIGHT, 0.1, 100 );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    const gold = new THREE.TextureLoader().load("../../img/gold2_roughness.jpg", (map) => {});
    const wood = new THREE.TextureLoader().load("../../img/wood_roughness.jpg");
    const book = new THREE.TextureLoader().load("../../img/booksS.png");
    // const envMap = new THREE.CubeTextureLoader().load([
    //   'img/posx.jpg', 'img/negx.jpg',
    //   'img/posy.jpg', 'img/negy.jpg',
    //   'img/posz.jpg', 'img/negz.jpg'
    // ]);

    const clock = new THREE.Clock(); //used by the animation mixer;
    const webGLcontainer = document.getElementById( 'webGLcontainer' );

    function init() {
        return new Promise((resolve,reject) => {
            renderer.gammaOutput = true;	//required for glTF
            renderer.gammaFactor = 2.2;		//required for glTF; introduces 6 warnings X3571 in the console
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( WIDTH, HEIGHT, false );
            renderer.shadowMap.enabled = true;
            webGLcontainer.appendChild( renderer.domElement ); //can be moved in the glTF loader to avoid the small black rect in Firefox

            camera.position.set( 7.5, 7.63, 0 );    //X close/away from the text; Y up/down; Z left/right
            //camera.rotation.set(0, 18*Math.PI/180, 0);	//72 degrees increments to have 5 scenes; //camera.rotation.y -= 1;	//turn right
            camera.rotation.set(0, 90*Math.PI/180, 0);	//90 degrees anti-clockwise; Math.PI / 180 converts degrees into radians
            //camera.rotation.set(0, 162*Math.PI/180, 0);
            //camera.rotation.set(0, 234*Math.PI/180, 0);
            //camera.rotation.set(0, 306*Math.PI/180, 0);
            scene.add( camera ); //needed for the shutters

            //camera.up = new THREE.Vector3(0,1,0);
            //camera.lookAt(new THREE.Vector3(0,7.63,0));	//look right: new THREE.Vector3(7.5,7.63,-7.8)


            // controls = new THREE.OrbitControls( camera, renderer.domElement );
            // controls.target.set( 0, 7, 0 );
            // controls.enablePan = true;

            //Lights:
            const pointLight = new THREE.PointLight( 0x000d1a, 5, 1, 0 ); //color, intensity, distance, decay
            pointLight.position.set( -2, 8, 30 );	//30 so its not visible on the camera view

            scene.spotLightr = new THREE.SpotLight( 0xffffff, 30, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
            scene.spotLightr.position.set( 7.5, 7.63, 0); //same as camera position
            scene.spotLightr.target.position.set(1, 7.63, 0); //scene.add below needed

            //scene.spotLightr.target.position.set(6.2, 7.63, 0);


            // scene.spotLightr.shadow.mapSize.width = 512;  // default
            // scene.spotLightr.shadow.mapSize.height = 512; // default
            // scene.spotLightr.shadow.camera.near = .5;       // default
            // scene.spotLightr.shadow.camera.far = 500;      // default
            // scene.spotLightr.shadow.camera.fov = 50;//Camera frustum vertical field of view, from bottom to top of view, in degrees. Default is 50
            // var helper = new THREE.CameraHelper( scene.spotLightr.shadow.camera );
            // scene.add( helper );

            scene.spotLightA = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
            scene.spotLightA.target.position.set(0.20, 7.9, 1.49);

            scene.spotLightK2 = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
            scene.spotLightK2.target.position.set(0.19, 7.95, -2.11);

            scene.spotLightr.castShadow = scene.spotLightA.castShadow = scene.spotLightK2.castShadow = true;
            scene.add( pointLight, scene.spotLightr.target, scene.spotLightA.target, scene.spotLightK2.target, scene.spotLightr ); //required to be able to change the target position

            //create the mirror for the glass table:
            const geometry = new THREE.CircleBufferGeometry( 7.8, 64 );
            const glassTableMirror = new THREE.Reflector( geometry, {
                clipBias: 0.001, //cuts the mirror area; more will decrease it;
                textureWidth: WIDTH * window.devicePixelRatio,
                textureHeight: HEIGHT * window.devicePixelRatio,
                color: 0x333333,
                recursion: 100
            });
            glassTableMirror.position.set( 7.5, 6.45, 0 ); //y=6.5 is the top of the table
            glassTableMirror.rotateX( - Math.PI/2 );
            scene.add( glassTableMirror );

            //used for the menu:
            camera.spotLightShutters = new THREE.SpotLight( 0xffffff, .5, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
            camera.spotLightShutters.position.set(0, 0, -.1);
            camera.spotLightShutters.target.position.set(0, 0, -1.3);
            // camera.rectLight = new THREE.RectAreaLight( 0xffffff, 1000,  10, .0005 );
            // camera.rectLight.rotation.set( 0, 180*Math.PI/180, 0 );
            // camera.rectLight.position.set( 0, 0, -1 );

            onWindowResize();

            // Optional: Provide a DRACOLoader instance to decode compressed mesh data
            //THREE.DRACOLoader.setDecoderPath( '../../js/libs/draco/gltf/' );
            const loader = new THREE.GLTFLoader();
            loadShutters(loader)
            .then((shutters) => {
                camera.gltfShutters = shutters;
                return loadHome(loader);
            })
            .then((gltfHome) => {
                //remove the loading screen:
                document.body.removeChild(document.body.childNodes[3]);

                const homeModel = gltfHome.scene;
                //traverse the loaded object and find all mesh objects in it:
                homeModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
                scene.add(homeModel);

                const shuttersModel = camera.gltfShutters.scene;
                shuttersModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
                camera.add( shuttersModel );
                shuttersModel.position.set(0, 0, -1.3);
                playAnimation(shuttersModel, camera.gltfShutters.animations);

                mixer.addEventListener( 'finished', (e) => {
                    if(camera.children.length){
                        camera.remove( shuttersModel );
                        playAnimation(homeModel, gltfHome.animations);

                        mixer.addEventListener( 'finished', (e) => {
                            if(mixer) {
                                //make sure mixer is not updated in the render function:
                                mixer = null;
                                scene.spotLightA.intensity = scene.spotLightK2.intensity = 30;
                                scene.add(scene.spotLightA, scene.spotLightK2);
                                animateLights();
                                //show the logo for the menu access:
                                document.querySelector('.menu').style.visibility = 'visible';
                            }
                        });
                    }
                });

                resolve();
            })
            .catch((e) => { console.log('e'); });

        });
    }

    function loadHome(loader) {
        return new Promise((resolve,reject) => {
            loader.load( '../../models/gltf/home.gltf', (gltfHome) => {
                    resolve(gltfHome);
                }, undefined, (e) => {
                    reject(e);
                }
            );
        });
    }

    function loadShutters(loader) {
        return new Promise((resolve,reject) => {
            loader.load( '../../models/gltf/shutters.gltf', (gltfShutters) => {
                    resolve(gltfShutters);
                }, undefined, (e) => {
                    reject(e);
                }
            );
        });
    }

    function meshSetup (mesh) {
            const m = mesh.material;
            const material = new THREE.MeshPhysicalMaterial({ map: m.map }); //{map:m.map} necessary if you provide reflection etc for the image applied as material
            if (/^gold/.test(m.name)){
                //mesh setup:
                mesh.castShadow = true; //default=false;
                mesh.receiveShadow = true; //default=false;
                //material setup:
                material.color.setHex(0xff6600);  //diffuse color - AFFECTS THE MAP
                material.metalness = 1;	//default=0.5; material.metalnessMap can be also provided;1
                material.roughness = 0.3; //default=0.5; 0 means a smooth mirror reflection;0.3
                material.roughnessMap = gold;
            } else if (/^textWhite/.test(m.name)){
                //mesh setup:
                mesh.castShadow = true;
                mesh.receiveShadow = false;
                //material setup:
                material.color.setHex(0xb3ffff);
                material.metalness = 1;
                material.roughness = .3;
            } else if (/^textGold/.test(m.name)){
                //mesh setup:
                mesh.castShadow = true;
                mesh.receiveShadow = false;
                //material setup:
                material.color.setHex(0x993300);
                material.metalness = 1;
                material.roughness = .3;
            } else if (/^wood/.test(m.name)){
                //mesh setup:
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                //material setup:
                material.color.setHex(0x0d0d0d);
                material.metalness = 0.2;
                material.reflectivity = 0.1;	//default=0.5; no effect when metalness=1;
                material.roughness = 1;
                material.roughnessMap = wood;
            } else if (/^backdrop/.test(m.name)){
                //mesh setup:
                mesh.castShadow = false;
                mesh.receiveShadow = true;
                //material setup:
                material.color.setHex(0x1a0600);
                material.metalness = 1;
                material.roughness = 0;
            } else if (/^glass/.test(m.name)){
                //mesh setup:
                mesh.castShadow = false;
                mesh.receiveShadow = true;
                //material setup:
                material.color.setHex(0x333333);
                material.metalness = 0;
                material.reflectivity = 0;
                material.roughness = 0;
                material.opacity  = 0.2;
                material.transparent = true;
                //material.envMap = envMap;
            } else if (/^book/.test(m.name)){
                //mesh setup:
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                //material setup:
                material.color.setHex(0x333333);
                material.metalness = 0;
                material.reflectivity = 0;
                material.roughness = 1;  //more than 1 introduces artifacts
                material.roughnessMap = book;
            } else if (/^shutter/.test(m.name)){
                //mesh setup:
                mesh.castShadow = false; //default=false;
                mesh.receiveShadow = false; //default=false;
                //material setup:
                material.color.setHex(0x1a0600);
                material.metalness = 1;
                material.roughness = .4;
                material.roughnessMap = gold;
            }
            mesh.material = material;
    }

    function tween( light ){
        new TWEEN.Tween( light ).to( {
          angle: ( Math.random() * 0.6 ) + 0.1,  //decrease to get smaller light circle; //( Math.random() * 0.7 ) + 0.1
          penumbra: Math.random()    //values b/n 0 & 1
        }, Math.random() * 3000 + 2000 )
          .easing( TWEEN.Easing.Quadratic.Out ).start();

        new TWEEN.Tween( light.position ).to( {
          x: ( Math.random() * 11 ) + 2, //( Math.random() * 30 ) - 15,
          y: ( Math.random() * 3 ) + 7,
          z: ( Math.random() * 10 ) - 5
        }, Math.random() * 3000 + 2000 )
          .easing( TWEEN.Easing.Quadratic.Out ).start();
    }

    function animateLights(){
        tween( scene.spotLightr );
        tween( scene.spotLightA );
        tween( scene.spotLightK2 );
        setTimeout( animateLights, 5000 );
    }

    function render(){
        TWEEN.update();
        requestAnimationFrame( render );
        const delta = clock.getDelta();
        if(mixer) {	//makes sure mixer is not updated when no animation is running
            mixer.update( delta );
        }

        //camera only has menu and webGLcontainer as children:
        // if(camera.children[1]) { camera.rectLight.rotation.z += delta/10;}

        //controls.update( delta );
        renderer.render( scene, camera );
    }

    function playAnimation(model, clips){
        mixer = new THREE.AnimationMixer( model );
        clips.forEach((clip) => {
            const action = mixer.clipAction( clip ).play();
            action.clampWhenFinished = true;
            action.loop = THREE.LoopOnce;
        });
    }

    function openMenu(){
        scene.remove( scene.spotLightr, scene.spotLightA, scene.spotLightK2 );

        const shuttersModel = camera.gltfShutters.scene;
        const shuttersClips = camera.gltfShutters.animations;
        mixer = new THREE.AnimationMixer( shuttersModel );
        camera.add( camera.spotLightShutters, camera.spotLightShutters.target, shuttersModel );
        //play animation:
        shuttersClips.forEach((clip) => {
        		const action = mixer.clipAction( clip );
        		if(action.time === 0) {
                action.time = clip.duration;
            }
        		action.timeScale = -1;	//action.paused = false;
        		action.loop = THREE.LoopOnce;
        		action.play();
            action.clampWhenFinished = true;	//prevents animation from finishing on keyframe 0
        });
        //when animation finishes:
        mixer.addEventListener( 'finished', ( e ) => {
            if (mixer) {
                mixer = null;
                // camera.add( camera.rectLight);
                //open the menu:
                document.querySelectorAll('.menu__item').forEach((item) => {
                	 item.classList.add("menu__item--animate");
                });
            }
        });
    }

    function closeMenu(){
        //close the menu:
        document.querySelectorAll('.menu__item').forEach((item) => {
            item.classList.remove("menu__item--animate");
        });

        // camera.remove( camera.rectLight );

        const shuttersModel = camera.gltfShutters.scene;
        playAnimation(shuttersModel, camera.gltfShutters.animations);

        //when animation finishes:
        mixer.addEventListener( 'finished', ( e ) => {
            if (mixer) {
                mixer = null;
                camera.remove( camera.spotLightShutters, camera.spotLightShutters.target, shuttersModel );
                scene.add( scene.spotLightr, scene.spotLightA, scene.spotLightK2 );
            }
        });
    }

    document.querySelector('.menu__logo').addEventListener('click', () => {
        (camera.children.length && !mixer) ? (closeMenu()) : !mixer ? (openMenu()) : null;
    });
    //close menu on ESC press:
    window.addEventListener( 'keydown', (e) => {
        if( camera.children.length && !mixer && e.keyCode === 27 ) { closeMenu(); }
    }, false );

    window.addEventListener( 'resize', onWindowResize, false );
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;  //doesn't work with WIDTH/HEIGHT !
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight ); //doesn't work with WIDTH/HEIGHT !
        //controls.handleResize();
    }

    init()
    .then(() => { render(); })
    .catch((e) => { console.log(e); })
