//first check if browser supports WebGL:
if ( WEBGL.isWebGLAvailable() === false ) { document.body.appendChild( WEBGL.getWebGLErrorMessage() ); }

//set the hash to home:
history.pushState ? history.pushState(null, null, '#home') : location.hash = '#home'

let mixer, link = '#home', INTERSECTED, INTERSECTEDsibling, mouseEvent = null, targetList = [];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, WIDTH/HEIGHT, 0.1, 100 );
const renderer = new THREE.WebGLRenderer({ antialias: true });
const loader = new THREE.GLTFLoader();

const gold = new THREE.TextureLoader().load("./img/gold_roughness.jpg", (map) => {});  //  './' for altervista
const wood = new THREE.TextureLoader().load("./img/wood_roughness.jpg");
const book = new THREE.TextureLoader().load("./img/bookCover_roughness.jpg");

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// const envMap = new THREE.CubeTextureLoader().load([
//   'img/posx.jpg', 'img/negx.jpg',
//   'img/posy.jpg', 'img/negy.jpg',
//   'img/posz.jpg', 'img/negz.jpg'
// ]);

const clock = new THREE.Clock(); //used by the animation mixer;
const webGLcontainer = document.getElementById( 'webGLcontainer' );

function init() {
    return new Promise((resolve,reject) => {

        renderer.gammaOutput = true;    //required for glTF
        renderer.gammaFactor = 2.2;     //required for glTF; introduces 6 warnings X3571 in the console
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( WIDTH, HEIGHT, false );
        renderer.shadowMap.enabled = true;
        webGLcontainer.appendChild( renderer.domElement ); //can be moved in the glTF loader to avoid the small black rect in Firefox

        camera.position.set( 7.5, 7.63, 0 );    //X close/away from the text; Y up/down; Z left/right
        //camera.rotation.set(0, 18*Math.PI/180, 0);    //72 degrees increments to have 5 scenes; //camera.rotation.y -= 1; //turn right
        camera.rotation.set(0, 90*Math.PI/180, 0);  //90 degrees anti-clockwise; Math.PI / 180 converts degrees into radians
        //camera.rotation.set(0, 162*Math.PI/180, 0);
        //camera.rotation.set(0, 234*Math.PI/180, 0);
        //camera.rotation.set(0, 306*Math.PI/180, 0);
        scene.add( camera ); //needed for the shutters

        book.wrapS = THREE.MirroredRepeatWrapping;  //horizontal
        book.wrapT = THREE.MirroredRepeatWrapping;  //THREE.RepeatWrapping, THREE.MirroredRepeatWrapping, THREE.ClampToEdgeWrapping
        book.repeat.set( 40, 1 ); //40,1

        // controls = new THREE.OrbitControls( camera, renderer.domElement );
        // controls.target.set( 0, 7, 0 );
        // controls.enablePan = true;

        //used in the #home scene:
        scene.spotLightHome0 = new THREE.SpotLight( 0xffffff, 30, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
        scene.spotLightHome0.position.set( 7.5, 7.63, 0); //same as camera position
        scene.spotLightHome0.target.position.set(1, 7.63, 0); //scene.add below needed

        scene.spotLightHome1 = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
        scene.spotLightHome1.target.position.set(0.20, 7.9, 1.49);

        scene.spotLightHome2 = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
        scene.spotLightHome2.target.position.set(0.19, 7.95, -2.11);

        scene.spotLightHome0.castShadow = scene.spotLightHome1.castShadow = scene.spotLightHome2.castShadow = true;
        scene.add( scene.spotLightHome0.target, scene.spotLightHome1.target, scene.spotLightHome2.target, scene.spotLightHome0 ); //required to be able to change the target position

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

        camera.pointLight = new THREE.PointLight( 0x000d1a, 5, 5, 0 ); //color, intensity, distance, decay
        camera.pointLight.position.set( -30, 0, -9 ); //30 so its not visible on the camera view
        camera.add(camera.pointLight);

        //used in the #lawyers scene:
        camera.pointLightLawyer0 = new THREE.PointLight( 0xff3333, 20, 2, 2 );
        camera.pointLightLawyer0.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xff3333 } ) ) );
        camera.pointLightLawyer1 = new THREE.PointLight( 0xffff1a, 10, 2, 2 );
        camera.pointLightLawyer1.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0xffff1a } ) ) );
        camera.pointLightLawyer2 = new THREE.PointLight( 0x1a8cff, 10, 2, 2 );
        camera.pointLightLawyer2.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshBasicMaterial( { color: 0x1a8cff } ) ) );
        camera.rectLightLawyer = new THREE.RectAreaLight( 0xffffff, 400, 0.44, 0.05 );

        //used in the menu:
        camera.spotLightShutters = new THREE.SpotLight( 0xffffff, .5, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
        camera.spotLightShutters.position.set(0, 0, -.1);
        camera.spotLightShutters.target.position.set(0, 0, -1.3);
        camera.rectLight = new THREE.RectAreaLight( 0xffffff, 1000,  10, .0005 );
        camera.rectLight.name = 'cameraRectLight';
        camera.rectLight.rotation.set( 0, 180*Math.PI/180, 0 );
        camera.rectLight.position.set( 0, 0, -1 );

        onWindowResize();

        loadGltf(loader, 'shutters')
        .then((gltfShutters) => {
            camera.gltfShutters = gltfShutters;

            const shuttersModel = camera.gltfShutters.scene;
            shuttersModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
            shuttersModel.name = 'shutters';
            camera.add( shuttersModel );
            shuttersModel.position.set(0, 0, -1.3);

            return loadGltf(loader, 'book');
        })
        .then((gltfBook) => {
            scene.gltfBook = gltfBook;

            const bookModel = scene.gltfBook.scene;
            bookModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
            bookModel.position.set(6.95, 7.62, -1.6); //bookModel.position.set(5.6, 6.98, -5.76);
            //rotate model around its own axis:
            bookModel.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), 18*Math.PI/180 ); //rotate 18 degrees around Y axis
            bookModel.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90*Math.PI/180 );
            scene.add(bookModel);

            return loadGltf(loader, 'tv');
        })
        .then((gltfTV) => {
            scene.gltfTV = gltfTV;

            const tvModel = scene.gltfTV.scene;
            tvModel.name = 'tv'; //name it so we can later access it in the render

            tvModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );

            //tvModel.getObjectByName('ep');  //the object containing E.Petrova TV parts; mm, dm, bt
            tvModel.getObjectByName('tvMMscreen').scale.z = tvModel.getObjectByName('tvDMscreen').scale.z =  tvModel.getObjectByName('tvBTscreen').scale.z = tvModel.getObjectByName('tvEPscreen').scale.z = 0.001;  //hides the image completely

      			scene.video = document.createElement( 'video' );
      			scene.video.loop = true;
      			scene.video.src = './img/tvStatic.mp4';
            scene.video.muted = 'muted';
            //make E.P. show TV static signal
            tvModel.getObjectByName('tvEPscreen').material.map = new THREE.VideoTexture( scene.video );
            // console.log('scene.gltfTV.animations',scene.gltfTV.animations);

            scene.add(tvModel);

            targetList = [tvModel.getObjectByName('tvMMframe'), tvModel.getObjectByName('tvDMframe'), tvModel.getObjectByName('tvBTframe'), tvModel.getObjectByName('tvEPframe')];
            // targetListMouseDown = [tvModel.getObjectByName('tvMMlamp'), tvModel.getObjectByName('tvDMlamp'), tvModel.getObjectByName('tvBTlamp'), tvModel.getObjectByName('tvEPlamp')];

            return loadGltf(loader, 'home');
        })
        .then((home) => {
            const homeModel = home.scene;

            scene.backdrop = homeModel.getObjectByName('Sphere');
            scene.backdrop.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 2*Math.PI/180 ); //makes the texture vertical
            //traverse the loaded object and find all mesh objects in it:
            homeModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
            scene.add(homeModel);

            //remove the loading screen:
            document.body.removeChild(document.querySelector('.loading'));

            playAnimation(camera.gltfShutters.scene, camera.gltfShutters.animations);

            mixer.addEventListener( 'finished', (e) => {
                if(camera.getObjectByName('shutters')) {
                    camera.remove( camera.gltfShutters.scene );
                    playAnimation(homeModel, home.animations);

                    mixer.addEventListener( 'finished', (e) => {
                        if(mixer) {
                            //make sure mixer is not updated in the render function:
                            mixer = null;
                            scene.spotLightHome1.intensity = scene.spotLightHome2.intensity = 30;
                            scene.add(scene.spotLightHome1, scene.spotLightHome2);
                            animateLights();
                            //show the logo for the menu access:
                            document.querySelector('.menu').style.visibility = 'visible';
                        }
                    });
                }
            });

            resolve();
        })
        .catch((e) => { reject(e); });

    });
}

function loadGltf(gltfLoader, model) {
    return new Promise((resolve,reject) => {
        gltfLoader.load( `./models/gltf/${model}.gltf`, (gltf) => {
                resolve(gltf);
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
            material.metalness = 1; //default=0.5; material.metalnessMap can be also provided;1
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
            material.reflectivity = 0.1;    //default=0.5; no effect when metalness=1;
            material.roughness = 1;
            material.roughnessMap = wood;
        } else if (/^backdrop/.test(m.name)){
            //mesh setup:
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x1a0600);
            material.metalness = 1;
            material.roughness = 0.1;

            material.bumpMap = book;
            material.bumpScale = 0.005;//0.005
        } else if (/^glass/.test(m.name)){
            //mesh setup:
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x333333);
            material.metalness = 1;
            material.reflectivity = 10;
            material.roughness = 1;
            material.opacity  = 0.2;
            material.transparent = true;
        } else if (/^book/.test(m.name)){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x260d0d);
            material.metalness = 1;
            material.reflectivity = 0;
            material.roughness = 1;  //more than 1 introduces artifacts
            material.roughnessMap = book;
        }  else if (/^paper/.test(m.name)){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x0d0d0d);
            material.metalness = 0.2;
            material.reflectivity = 0.1;
            material.roughness = .5;  //more than 1 introduces artifacts
        } else if (/^shutter/.test(m.name)){
            //mesh setup:
            mesh.castShadow = false; //default=false;
            mesh.receiveShadow = false; //default=false;
            //material setup:
            material.color.setHex(0x1a0600);
            material.metalness = 1;
            material.roughness = .4;
            material.roughnessMap = gold;
        } else if (/^tv/.test(m.name)){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0x333333);
            material.metalness = 0;
            material.roughness = 0;
            material.reflectivity = .5;
            material.shininess = 5;
            material.transparent = false;
            material.opacity = 1;
        } else if (/^black/.test(m.name)){
            //mesh setup:
            mesh.castShadow = true; //default=false;
            mesh.receiveShadow = false; //default=false;
            //material setup:
            material.color.setHex(0x000000);
            material.metalness = 0;
            material.roughness = 0;
            material.reflectivity = 50;
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
    tween( scene.spotLightHome0 );
    tween( scene.spotLightHome1 );
    tween( scene.spotLightHome2 );
    setTimeout( animateLights, 5000 );
}

function render() {
    TWEEN.update();
    requestAnimationFrame( render );

    const time = Date.now() * 0.0005;
    const delta = clock.getDelta();
    if(mixer) { //makes sure mixer is not updated when no animation is running
        mixer.update( delta );
    }

    if (camera.getObjectByName('cameraRectLight')) { camera.rectLight.rotation.z += delta/10; }
    if (link === '#location' && !camera.getObjectByName('cameraRectLight')) { scene.backdrop.rotateZ(-delta/100); }
    if (link === '#lawyers' && !camera.getObjectByName('shutters')) {
        camera.pointLightLawyer0.position.x = Math.sin( time * 0.7 ) * .8; //cos() & sin() go from -1 to +1;
        camera.pointLightLawyer0.position.y = Math.cos( time * 0.5 ) * .5;
        camera.pointLightLawyer0.position.z = - Math.abs(Math.cos( time * 0.3 ) * 3) - 1;  //0.3 slows down/up the speed thus 0.1 being the slowest

        camera.pointLightLawyer1.position.x = Math.cos( time * 0.3 ) * .8;
        camera.pointLightLawyer1.position.y = Math.sin( time * 0.5 ) * .5;
        camera.pointLightLawyer1.position.z = - Math.abs(Math.sin( time * 0.7 ) * 1.5) - 1;

        camera.pointLightLawyer2.position.x = Math.sin( time * 0.6 ) * .8;
        camera.pointLightLawyer2.position.y = Math.cos( time * 0.2 ) * .5;
        camera.pointLightLawyer2.position.z = - Math.abs(Math.sin( time * 0.4 ) * 1.5) - 1;

        if (mouseEvent) { //only execute on mousemove/down;

      	    raycaster.setFromCamera( mouse, camera );
            const intersects = raycaster.intersectObjects( targetList );

            if (mouseEvent ==='mousemove') {  //execute only for mousemove;
                console.log('mousemove');
                if ( intersects.length > 0 ) {
                      if (!mixer) {
                          playAnimation(scene.gltfTV.scene, scene.gltfTV.animations, null, intersects[ 0 ].object.parent.name); //parent name(the name of the Blender Empty) is the same as the animation clip name;
                      }
                      if (INTERSECTED != intersects[ 0 ].object ) {
                        if ( INTERSECTED ) { INTERSECTED.material.color.setHex( INTERSECTED.currentHex ); }
                        INTERSECTED = intersects[ 0 ].object;
                        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                        INTERSECTED.material.color.setHex( 0x1a1a1a );
                      }
                } else {
                      if ( INTERSECTED ) { INTERSECTED.material.color.setHex( INTERSECTED.currentHex ); }
                      INTERSECTED = null;
                      mixer = null; //so the animation can be played again;
                }
            }

            if (mouseEvent ==='mousedown') {  //execute only for mousedown;
                if ( intersects.length > 0 ) {
                      if (INTERSECTEDsibling != intersects[ 0 ].object.parent.getObjectByName(`tv${intersects[ 0 ].object.parent.name}lamp`) ) {
                          if ( INTERSECTEDsibling ) {
                              INTERSECTEDsibling.remove( camera.rectLightLawyer );
                              INTERSECTEDsibling.material.emissive.setHex( INTERSECTEDsibling.currentHex );
                              INTERSECTEDsibling.material.opacity = INTERSECTEDsibling.currentOpacity;
                          }

                          INTERSECTEDsibling = intersects[ 0 ].object.parent.getObjectByName(`tv${intersects[ 0 ].object.parent.name}lamp`);

                          INTERSECTEDsibling.currentHex = INTERSECTEDsibling.material.emissive.getHex();
                          INTERSECTEDsibling.currentOpacity = INTERSECTEDsibling.material.opacity;

                          INTERSECTEDsibling.add( camera.rectLightLawyer );
                          INTERSECTEDsibling.material.emissive.setHex( 0xffffff );
                          INTERSECTEDsibling.material.opacity = 1;
                      }
                } //else {  //executed only when clicking outside of the screens;
                //       if ( INTERSECTEDsibling ) { INTERSECTEDsibling.material.emissive.setHex( INTERSECTEDsibling.currentHex ); }
                //       INTERSECTEDsibling = null;
                // }
            }

            mouseEvent = null;
        }

    }
    //controls.update( delta );
    renderer.render( scene, camera );
}

function playAnimation(model, clips, loop, clipName){
    mixer = new THREE.AnimationMixer( model );
    clips.forEach((clip) => {

        if (clipName) { //play individual clip from the model
                        if (clip.name === clipName) {
                            const action = mixer.clipAction( clip ).play();
                            if(!loop){
                                action.clampWhenFinished = true;
                                action.loop = THREE.LoopOnce;
                            }
                        }
        } else {        //play all clips from the model
                        const action = mixer.clipAction( clip ).play();
                        if(!loop){
                            action.clampWhenFinished = true;
                            action.loop = THREE.LoopOnce;
                        }
        }


    });
}

function openMenu() {
    if (link === '#home') { scene.remove( scene.spotLightHome0, scene.spotLightHome1, scene.spotLightHome2 ); }
    if (link === '#location') {
        document.querySelector('.location').classList.remove("location--animate");
    }
    if (link === "#lawyers") {
        camera.remove(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
        window.removeEventListener( 'mousemove', onMouse, false );
        window.removeEventListener( 'mousedown', onMouse, false );
    }

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
        action.timeScale = -1;  //action.paused = false;
        action.loop = THREE.LoopOnce;
        action.play();
        action.clampWhenFinished = true;    //prevents animation from finishing on keyframe 0
    });
    //when animation finishes:
    mixer.addEventListener( 'finished', ( e ) => {
        if (mixer) {
            mixer = null;
            camera.add( camera.rectLight );
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

    camera.remove( camera.rectLight );

    const shuttersModel = camera.gltfShutters.scene;
    playAnimation(shuttersModel, camera.gltfShutters.animations);

    //when animation finishes:
    mixer.addEventListener( 'finished', ( e ) => {
        if (mixer) {
            mixer = null;
            camera.remove( camera.spotLightShutters, camera.spotLightShutters.target, shuttersModel );
            if (link === '#home') { scene.add( scene.spotLightHome0, scene.spotLightHome1, scene.spotLightHome2 ); }
            //play the animation only the first time location is loaded:
            if (link === '#location' && !document.getElementById('googleMap')) {    //when location is chosen and the script to load google maps is not yet created
                playAnimation(scene.gltfBook.scene, scene.gltfBook.animations);
                //when animation finishes:
                mixer.addEventListener( 'finished', ( e ) => {
                    if (mixer) {
                        mixer = null;
                        addGoogleMapScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB-KPJ5izQ04PMgkfQwGznBFY6TVl4YR1E", googleMapInit);
                        document.querySelector('.location').classList.add("location--animate");
                    }
                });
            } else if (link === '#location' && document.getElementById('googleMap') && !document.querySelector('.location__map').firstChild) {  //when location is chosen and the script to load google maps is created but the map wasnt created(no internet connection so far)
                document.getElementById('googleMap').remove();
                addGoogleMapScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB-KPJ5izQ04PMgkfQwGznBFY6TVl4YR1E", googleMapInit);
                document.querySelector('.location').classList.add("location--animate");
            } else if (link === '#location' && document.getElementById('googleMap') && document.querySelector('.location__map').firstChild) { //when location is chosen and the script to load google maps is created and the map was created
                document.querySelector('.location').classList.add("location--animate");
            }
            if (link === '#lawyers' && scene.gltfTV.scene.getObjectByName('tvMMscreen').scale.z === 0.001) {
                camera.add(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
                turnOnTV('tvMMscreen')
                .then(() => { return turnOnTV('tvDMscreen'); })
                .then(() => { return turnOnTV('tvBTscreen'); })
                .then(() => {
                  turnOnTV('tvEPscreen');
                  scene.video.play();
                  window.addEventListener( 'mousemove', onMouse, false );
                  window.addEventListener( 'mousedown', onMouse, false );
                })
            } else if (link === '#lawyers') {
                camera.add(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
                window.addEventListener( 'mousemove', onMouse, false );
                window.addEventListener( 'mousedown', onMouse, false );
            }
        }
    });
}

function turnOnTV (which) {
    return new Promise ((resolve,reject) => {
        (function turnOn () {
          scene.gltfTV.scene.getObjectByName(`${which}`).scale.z =  Math.round( (scene.gltfTV.scene.getObjectByName(`${which}`).scale.z + 0.0729) * 1000) / 1000;
          if( scene.gltfTV.scene.getObjectByName(`${which}`).scale.z < 1.458 ) {
              setTimeout( turnOn, 50 ); //overall 1sec per screen; 20fps
          } else { resolve(); }
        })();
    });
}

document.querySelector('.menu__logo').addEventListener('click', () => {
    (camera.getObjectByName('shutters') && !mixer) ? (closeMenu(link)) : !mixer ? (openMenu(link)) : null;
});
//choose which 'scene' to show from menu
document.querySelectorAll('.menu__link').forEach((anchorLink) => {
    anchorLink.addEventListener("click", (e) => {
        switch (e.target.hash) {
          case '#home':
            if (link !== '#home') {
                link = '#home';
                camera.rotation.set(0, 90*Math.PI/180, 0);
                scene.backdrop.position.set(-29.72, 6.17, 0);
                scene.backdrop.rotation.set( 0.03490658503988659,0,0 );
                scene.backdrop.material.roughness = 0.1;
                scene.backdrop.material.bumpScale = 0.005;
                // scene.backdrop.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 2*Math.PI/180 ); //makes the texture vertical
                book.repeat.set( 40, 1 );
                camera.pointLight.color.setHex(0x000d1a);
                camera.pointLight.position.set( -30, 0, -9 );
                camera.pointLight.intensity = 5;
            }
            closeMenu(link);
            break;
          case '#lawyers':
            if (link !== '#lawyers') {
                link = '#lawyers';
                camera.rotation.set(0, 162*Math.PI/180, 0);
                scene.backdrop.position.set(-4, 6.17, 35.4);
                scene.backdrop.rotation.set( 0.11252859437824148, 1.2566370614359175, 0 );
                scene.backdrop.material.roughness = 0.2;
                scene.backdrop.material.bumpScale = 0.005;
                book.repeat.set( 1, 40 );
                camera.pointLight.color.setHex(0x000d1a);
                camera.pointLight.position.set( 0, 0, 7 );
                camera.pointLight.intensity = 5;
            }
            closeMenu(link);
            break;
          case '#services':
            if (link !== '#services') {
              link = '#services';
            }
            console.log('services');
            break;
          case '#news':
            if (link !== '#news') {
              link = '#news';
            }
            console.log('news');
            break;
          case '#location':
            if (link !== '#location') {
                link = '#location';
                camera.rotation.set(0, 18*Math.PI/180, 0);
                scene.backdrop.position.set(-4, 6.17, -35.4);
                scene.backdrop.rotation.set(0.11252859437824148, -1.2566370614359175, 0); //scene.backdrop.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -72*Math.PI/180 );
                scene.backdrop.material.roughness = 0;
                scene.backdrop.material.bumpScale = 0.1;
                book.repeat.set( 40, 1 );
                camera.pointLight.color.setHex(0xffffff);
                camera.pointLight.position.set( 1.4, 0, 0.2 );
                camera.pointLight.intensity = 20;
            }
            closeMenu(link);
            break;
          default:
            console.log('default');
        }
    });
});
//close menu on ESC press:
window.addEventListener( 'keydown', (e) => {
    if( camera.getObjectByName('shutters') && !mixer && e.keyCode === 27 ) { closeMenu(link); }
}, false );

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;  //doesn't work with WIDTH/HEIGHT !
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight ); //doesn't work with WIDTH/HEIGHT !
    //controls.handleResize();
}

function addGoogleMapScript( src, callback) {
    var s = document.createElement( 'script' );
    s.setAttribute( 'src', src );
    s.setAttribute( 'id', 'googleMap' );
    s.onload = callback;
    document.body.appendChild( s );
}

function googleMapInit() {
    var locationSofia = {lat: 42.6948648, lng: 23.3197577};
    var map = new google.maps.Map(document.querySelector('.location__map'), {
        zoom: 16,
        center: locationSofia,
        gestureHandling: 'cooperative',  //greedy, cooperative;
        zoomControl: false,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.INSET,
            position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        styles: [ //https://developers.google.com/maps/documentation/javascript/style-reference
          { elementType: 'labels.text.stroke', stylers: [{color: '#1a0d00'}] },
          { elementType: 'labels.text.fill', stylers: [{color: '#cca876'}] },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{color: '#dfb978'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{color: '#263c3f'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#95b79d'}]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{visibility: 'off'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#333333'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{color: '#0000cc'}]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{color: '#9ca5b3'}]
          }
        ]
    });
    var marker = new google.maps.Marker({
        position: locationSofia,
        map: map,
        title: 'Markovski Lawyers LLP',
        draggable: false,
        animation: google.maps.Animation.BOUNCE,  //BOUNCE, DROP
        icon: './img/icoSmall.png'
    });
}

function onMouse( event ) {
    mouseEvent = event.type;
  	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

init()
.then(() => {
    render();
})
.catch((e) => { console.log(e); })
