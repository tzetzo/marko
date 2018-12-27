//first check if browser supports WebGL:
if ( WEBGL.isWebGLAvailable() === false ) { document.body.appendChild( WEBGL.getWebGLErrorMessage() ); }

//set the hash to home:
history.pushState ? history.pushState(null, null, '#home') : location.hash = '#home'

let mixer, link = '#home';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, WIDTH/HEIGHT, 0.1, 100 );
const renderer = new THREE.WebGLRenderer({ antialias: true });
const loader = new THREE.GLTFLoader();

const gold = new THREE.TextureLoader().load("./img/gold2_roughness.jpg", (map) => {});  //  './' for altervista
const wood = new THREE.TextureLoader().load("./img/wood_roughness.jpg");
const book = new THREE.TextureLoader().load("./img/bookCover_roughness.jpg");
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

        //camera.up = new THREE.Vector3(0,1,0);
        //camera.lookAt(new THREE.Vector3(0,7.63,0));   //look right: new THREE.Vector3(7.5,7.63,-7.8)

        book.wrapS = THREE.MirroredRepeatWrapping;  //horizontal
        book.wrapT = THREE.MirroredRepeatWrapping;  //THREE.RepeatWrapping, THREE.MirroredRepeatWrapping, THREE.ClampToEdgeWrapping
        book.repeat.set( 40, 1 ); //40,1

        // controls = new THREE.OrbitControls( camera, renderer.domElement );
        // controls.target.set( 0, 7, 0 );
        // controls.enablePan = true;

        //Lights:
        scene.pointLight = new THREE.PointLight( 0x000d1a, 5, 5, 0 ); //color, intensity, distance, decay
        scene.pointLight.position.set( -2, 8, 30 ); //30 so its not visible on the camera view

        scene.spotLightHome0 = new THREE.SpotLight( 0xffffff, 30, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
        scene.spotLightHome0.position.set( 7.5, 7.63, 0); //same as camera position
        scene.spotLightHome0.target.position.set(1, 7.63, 0); //scene.add below needed

        //scene.spotLightHome0.target.position.set(6.2, 7.63, 0);


        // scene.spotLightHome0.shadow.mapSize.width = 512;  // default
        // scene.spotLightHome0.shadow.mapSize.height = 512; // default
        // scene.spotLightHome0.shadow.camera.near = .5;       // default
        // scene.spotLightHome0.shadow.camera.far = 500;      // default
        // scene.spotLightHome0.shadow.camera.fov = 50;//Camera frustum vertical field of view, from bottom to top of view, in degrees. Default is 50
        // var helper = new THREE.CameraHelper( scene.spotLightHome0.shadow.camera );
        // scene.add( helper );

        scene.spotLightHome1 = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
        scene.spotLightHome1.target.position.set(0.20, 7.9, 1.49);

        scene.spotLightHome2 = new THREE.SpotLight( 0xffffff, 0, 70, Math.PI/8, 1, 0 );
        scene.spotLightHome2.target.position.set(0.19, 7.95, -2.11);

        scene.spotLightHome0.castShadow = scene.spotLightHome1.castShadow = scene.spotLightHome2.castShadow = true;
        scene.add( scene.pointLight, scene.spotLightHome0.target, scene.spotLightHome1.target, scene.spotLightHome2.target, scene.spotLightHome0 ); //required to be able to change the target position

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
        camera.rectLight = new THREE.RectAreaLight( 0xffffff, 1000,  10, .0005 );
        camera.rectLight.name = 'cameraRectLight';
        camera.rectLight.rotation.set( 0, 180*Math.PI/180, 0 );
        camera.rectLight.position.set( 0, 0, -1 );

        // targets the location book
        // var directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
        // directionalLight.castShadow = true;
        // directionalLight.position.set(5, 10, 10);
        // directionalLight.target.position.set(6.75, 7.5, -2.25);
        // directionalLight.shadow.bias = 1;
        //scene.add( directionalLight.target, directionalLight );

        onWindowResize();

        loadGltf(loader, 'shutters')
        .then((gltfShutters) => {
            camera.gltfShutters = gltfShutters;

            const shuttersModel = camera.gltfShutters.scene;
            shuttersModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
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
                if(camera.children.length) {
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
            material.roughness = 0;

            material.bumpMap = book;
            material.bumpScale = 0.005;//0.005
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

function render(){
    TWEEN.update();
    requestAnimationFrame( render );
    const delta = clock.getDelta();
    if(mixer) { //makes sure mixer is not updated when no animation is running
        mixer.update( delta );
    }

    if(camera.getObjectByName('cameraRectLight')) { camera.rectLight.rotation.z += delta/10; }
    if (link === '#location') { scene.backdrop.rotateZ(-delta/100); }


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
    if (link === '#home') { scene.remove( scene.spotLightHome0, scene.spotLightHome1, scene.spotLightHome2 ); }
    if (link === '#location') {
        document.querySelector('.location').classList.remove("location--animate");
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
        }
    });
}

document.querySelector('.menu__logo').addEventListener('click', () => {
    (camera.children.length && !mixer) ? (closeMenu(link)) : !mixer ? (openMenu(link)) : null;
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
                scene.backdrop.material.bumpScale = 0.005;
                // scene.backdrop.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 2*Math.PI/180 ); //makes the texture vertical
                // book.repeat.set( 40, 1 );
                scene.pointLight.color.setHex(0x000d1a);
                scene.pointLight.position.set( -2, 8, 30 );
                scene.pointLight.intensity = 5;
            }
            closeMenu(link);
            break;
          case '#lawyers':
            if (link !== '#lawyers') {
              link = '#lawyers';
            }
            console.log('lawyers');
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
                scene.backdrop.rotation.set(0.11252859437824148,-1.2566370614359175,0); //scene.backdrop.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -72*Math.PI/180 );
                scene.backdrop.material.bumpScale = 0.1;
                // book.repeat.set( 40, 1 );
                scene.pointLight.color.setHex(0xffffff);
                scene.pointLight.position.set( 7.2, 7.63, -1.4 );
                scene.pointLight.intensity = 20;
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
    if( camera.children.length && !mixer && e.keyCode === 27 ) { closeMenu(link); }
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
          {
            elementType: 'labels.text.stroke',
            stylers: [{color: '#1a0d00'}]
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{color: '#cca876'}]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{color: '#dfb978'}]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{visibility: 'off'}]
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

init()
.then(() => {
    render();
})
.catch((e) => { console.log(e); })
