//first check if browser supports WebGL:
if ( WEBGL.isWebGLAvailable() === false ) { document.body.appendChild( WEBGL.getWebGLErrorMessage() ); }

//set the hash to home:
history.pushState ? history.pushState(null, null, '#home') : location.hash = '#home';

//check if mobile or desktop device is used:
function mobileAndTabletcheck() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
mobileAndTabletcheck()? (device = 'mobile') : (device = 'desktop');

let mixer,
    link = '#home',
    INTERSECTED,
    INTERSECTEDsibling,
    mouseEvent = null,
    targetListLawyers = [],
    loading = document.querySelector('.loading'),
    menu__logo = document.querySelector('.menu__logo'),
    menu__volume = document.querySelector('.volume > svg'),
    lawyers__about = document.querySelector('.lawyers__about--us'),
    services__mg = document.querySelector('.magnify'),
    services__mg_remove = document.querySelector('.magnify__glass-remove'),
    portrait = document.querySelector('.portrait'),
    timeCandle = 0,
    targetListServices = [];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
const WIDTH_MG = HEIGHT_MG = document.querySelector(".magnify__glass").clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, WIDTH/HEIGHT, 0.1, 3000 ); //camera.setLens(24); camera.setFov(40); camera.setZoom(1);
const magnifyCamera = new THREE.PerspectiveCamera( 12, WIDTH_MG/HEIGHT_MG, 0.1, 100 );
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const magnifyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const cssRenderer = new THREE.CSS3DRenderer();
const loader = new THREE.GLTFLoader();

const clock = new THREE.Clock(); //used by the animation mixer;
const webGLcontainer = document.querySelector( '.webGLcontainer' );
const magnifyWebGLcontainer = document.querySelector('.magnify__glass');
const newsContainer = document.querySelector('.news');

const gold = new THREE.TextureLoader().load(`./img_${device}/gold_roughness.jpg`, (map) => {});  //  './' for altervista
const wood = new THREE.TextureLoader().load(`./img_${device}/wood_roughness.jpg`);
const sofia = new THREE.TextureLoader().load(`./img_${device}/sofia.jpg`);
const book = new THREE.TextureLoader().load(`./img_${device}/bookCover_roughness.jpg`);
const booksN = new THREE.TextureLoader().load(`./img_${device}/booksN.jpg`);
book.wrapS = THREE.MirroredRepeatWrapping;  //horizontal
book.wrapT = THREE.MirroredRepeatWrapping;  //THREE.RepeatWrapping, THREE.MirroredRepeatWrapping, THREE.ClampToEdgeWrapping
book.repeat.set( 40, 1 ); //40,1

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const flameMaterials = [];

//NEWS scene:
const newsObjects = [];
const newsGridTransforms = [];
const newsSphereTransforms = [];
let endZoom, mouseX = 0, mouseY = 0;
const news_objects_container = new THREE.Object3D();

// const envMap = new THREE.CubeTextureLoader().load([
//   'img/posx.jpg', 'img/negx.jpg',
//   'img/posy.jpg', 'img/negy.jpg',
//   'img/posz.jpg', 'img/negz.jpg'
// ]);

//showing loading progress:
const percentage = document.querySelector('.loading__percent > span');
THREE.DefaultLoadingManager.onProgress = ( url, itemsLoaded, itemsTotal ) => {
    // console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
  	percentage.innerText = `${Math.floor(itemsLoaded*100/46)}%`; //make sure 46 is the number of items equal to the biggest itemsTotal number by using above console.log()
  	if (itemsLoaded === 46) {  //make sure 46 is the number of items equal to the biggest itemsTotal number by using above console.log()
        webGLcontainer.style.visibility = 'visible';
        //remove the loading screen:
        loading.classList.add('loading--animate');
  	}
};

function init() {
    return new Promise((resolve,reject) => {
        //renderer.physicallyCorrectLights = true; renderer.gammaInput = true; renderer.shadowMap.bias = 0.0001; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        renderer.gammaOutput = true;    //required for glTF
        renderer.gammaFactor = 2.2;     //required for glTF; introduces 6 warnings X3571 in the console
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( WIDTH, HEIGHT, false );
        renderer.shadowMap.enabled = true;
        webGLcontainer.appendChild( renderer.domElement ); //can be moved in the glTF loader to avoid the small black rect in Firefox

        camera.position.set( 7.5, 7.63, 0 );    //X close/away from the text; Y up/down; Z left/right; 72 degrees increments to have 5 scenes;
        camera.rotation.set(0, 90*Math.PI/180, 0);  //90 degrees anti-clockwise; Math.PI / 180 converts degrees into radians
        scene.add( camera, magnifyCamera ); //needed for the shutters

        magnifyRenderer.gammaOutput = true;    //required for glTF
        magnifyRenderer.gammaFactor = 2.2;     //required for glTF; introduces 6 warnings X3571 in the console
        magnifyRenderer.setPixelRatio( window.devicePixelRatio );
        magnifyRenderer.setSize( WIDTH, HEIGHT, false );  //same result as magnifyRenderer.setSize( WIDTH_MG, HEIGHT_MG, false );
        magnifyRenderer.shadowMap.enabled = true;
        magnifyWebGLcontainer.appendChild( magnifyRenderer.domElement );

        //NEWS scene
        newsLoad();
        newsCloudsLoad();

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
        camera.pointLightLawyer0.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshStandardMaterial( { emissive: 0xff3333, emissiveIntensity: 1, color: 0xff3333 } ) ) );
        camera.pointLightLawyer1 = new THREE.PointLight( 0xffff1a, 20, 2, 2 );
        camera.pointLightLawyer1.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshStandardMaterial( { emissive: 0xffff1a, emissiveIntensity: 1, color: 0xffff1a } ) ) );
        camera.pointLightLawyer2 = new THREE.PointLight( 0x1a8cff, 20, 2, 2 );
        camera.pointLightLawyer2.add( new THREE.Mesh( new THREE.SphereBufferGeometry( 0.005, 16, 8 ), new THREE.MeshStandardMaterial( { emissive: 0x1a8cff, emissiveIntensity: 1, color: 0x1a8cff } ) ) );
        camera.rectLightLawyer = new THREE.RectAreaLight( 0xffffff, 400, 0.44, 0.05 );

        //used in the #services scene:
        camera.pointLightServices = new THREE.PointLight( 0xff6600, 3, 5.5, 2 );
        camera.pointLightServices.position.set( 0, 3.3, 0 );  //1.14*4 -> 0.25 scale in Blender

        scene.rectLightServices = new THREE.RectAreaLight( 0x1ab2ff, 10,  7, 2 );
        scene.rectLightServices.position.set( 3, 10, 2 );
        scene.rectLightServices.lookAt(new THREE.Vector3(12,6.5,3.27)); //looking exactly in the middle of the scene

        //used in the #news scene:
        scene.newsLight = new THREE.DirectionalLight( 0xCC7A29, 1);
        scene.newsLight.position.set(-50,-900,0);
        scene.newsLight.target.position.set(15,-1100,10);
        scene.newsLight.castShadow = true;
        scene.newsLight.shadow.camera.near = 500;
        scene.newsLight.shadow.camera.far = 1500;
        scene.newsLight.shadow.camera.left = -50;
        scene.newsLight.shadow.camera.right = 50;
        scene.newsLight.shadow.camera.top = 100;
        scene.newsLight.shadow.camera.bottom = -100;
        scene.newsLight.shadow.mapSize.height = 1024;  //makes the shadow finer
        scene.newsLight.shadow.mapSize.width = 1024;   //makes the shadow finer
        scene.newsLight.shadow.bias = 0;

        //used in the menu:
        camera.spotLightShutters = new THREE.SpotLight( 0xffffff, .5, 70, Math.PI/8, 1, 0); //color, intensity, distance, angle, penumbra, decay; decay:2 required for renderer.physicallyCorwebGLcontainers = true;
        camera.spotLightShutters.position.set(0, 0, -.1);
        camera.spotLightShutters.target.position.set(0, 0, -1.3);
        camera.rectLight = new THREE.RectAreaLight( 0xffffff, 1000,  10, .0005 );
        camera.rectLight.name = 'cameraRectLight';
        camera.rectLight.rotation.set( 0, 180*Math.PI/180, 0 );
        camera.rectLight.position.set( 0, 0, -1 );

        musicLoad();
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

            return loadGltf(loader, 'services');
        })
        .then((gltfServices) => {
            scene.gltfServices = gltfServices;

            const servicesModel = scene.gltfServices.scene;
            servicesModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );

            servicesModel.getObjectByName('MGContainer').scale.set(0.95, 0.95, 0.95);
            scene.pages = servicesModel.getObjectByName('pages');
            scene.glassMG = servicesModel.getObjectByName('glass');
            scene.add(servicesModel);

            targetListServices = servicesModel.getObjectByName('MGContainer').children;

            return loadGltf(loader, 'plane');
        })
        .then((gltfPlane) => {
            scene.gltfPlane = gltfPlane;

            const planeModel = scene.gltfPlane.scene;
            planeModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
            scene.planeColor = planeModel.children[0].children[1].material.color;

            return loadGltf(loader, 'sofia');
        })
        .then((gltfSofia) => {
            scene.gltfSofia = gltfSofia;

            const sofiaModel = scene.gltfSofia.scene;
            sofiaModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );

            return loadGltf(loader, 'tv');
        })
        .then((gltfTV) => {
            scene.gltfTV = gltfTV;

            const tvModel = scene.gltfTV.scene;
            tvModel.name = 'tv'; //name it so we can later access it in the render

            tvModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );

            tvModel.getObjectByName('tvMMscreen').scale.z = tvModel.getObjectByName('tvDMscreen').scale.z =  tvModel.getObjectByName('tvBTscreen').scale.z = tvModel.getObjectByName('tvEPscreen').scale.z = 0.001;  //hides the image completely

      			scene.video = document.createElement( 'video' );
      			scene.video.loop = true;
      			scene.video.src = `./img_${device}/tvStatic.mp4`;
            scene.video.muted = 'muted';
            //make E.P. show TV static signal
            tvModel.getObjectByName('tvEPscreen').material.map = new THREE.VideoTexture( scene.video );

            targetListLawyers = [tvModel.getObjectByName('tvMMframe'), tvModel.getObjectByName('tvDMframe'), tvModel.getObjectByName('tvBTframe'), tvModel.getObjectByName('tvEPframe')];

            return loadGltf(loader, 'home');
        })
        .then((home) => {
            const homeModel = home.scene;

            scene.stone = homeModel.getObjectByName('stone');
            scene.backdrop = homeModel.getObjectByName('Sphere');
            scene.backdrop.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 2*Math.PI/180 ); //makes the texture vertical
            //traverse the loaded object and find all mesh objects in it:
            homeModel.traverse((child) => { if ( child.isMesh ) meshSetup(child); } );
            scene.add(homeModel);

            //remove the loading screen:
            // document.body.removeChild(document.querySelector('.loading'));

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
                            scene.music.play().fadeIn(10000);
                            document.querySelector('.volume').style.visibility = 'visible';
                            document.querySelector('.designer').style.visibility = 'visible';
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
        gltfLoader.load( `./models/gltf_${device}/${model}.gltf`, (gltf) => {
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
        if ( m.name.startsWith("gold") ){  // /^gold/.test(m.name)
            //mesh setup:
            mesh.castShadow = true; //default=false;
            mesh.receiveShadow = true; //default=false;
            //material setup:
            material.color.setHex(0xff6600);  //diffuse color - AFFECTS THE MAP
            material.metalness = 1; //default=0.5; material.metalnessMap can be also provided;1
            material.roughness = 0.3; //default=0.5; 0 means a smooth mirror reflection;0.3
            material.roughnessMap = gold;
        } else if ( m.name.startsWith("textWhite") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0xb3ffff);
            material.metalness = 1;
            material.roughness = .3;
        } else if ( m.name.startsWith("textGold") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0x993300);
            material.metalness = 1;
            material.roughness = .3;
        } else if ( m.name.startsWith("wood") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x4d1919);
            // material.metalness = 0.5;
            // material.reflectivity = .5;    //default=0.5; no effect when metalness=1;
            // material.roughness = 0.5;
            material.roughnessMap = wood;
        } else if ( m.name.startsWith("backdrop") ){
            //mesh setup:
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x1a0600);
            material.metalness = 1;
            material.roughness = 0.1;

            material.bumpMap = book;
            material.bumpScale = 0.005;
        } else if ( m.name.startsWith("glass") ){
            //mesh setup:
            mesh.castShadow = false;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x333333);
            material.metalness = 1;
            material.reflectivity = 10;
            material.roughness = 1;
            material.opacity  = .2;
            material.transparent = true;
        } else if ( m.name.startsWith("book") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x260d0d);
            material.metalness = 1;
            material.reflectivity = 0;
            material.roughness = 1;  //more than 1 introduces artifacts
            material.roughnessMap = book;
        }  else if ( m.name.startsWith("paper") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x0d0d0d);
            material.metalness = 0.2;
            material.reflectivity = 0.1;
            material.roughness = .5;  //more than 1 introduces artifacts
        } else if ( m.name.startsWith("shutter") ){
            //mesh setup:
            mesh.castShadow = false; //default=false;
            mesh.receiveShadow = false; //default=false;
            //material setup:
            material.color.setHex(0x1a0600);
            material.metalness = 1;
            material.roughness = .4;
            material.roughnessMap = gold;
        } else if ( m.name.startsWith("tv") ){
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
        } else if ( m.name.startsWith("black") ){
            //mesh setup:
            mesh.castShadow = true; //default=false;
            mesh.receiveShadow = false; //default=false;
            //material setup:
            material.color.setHex(0x000000);
            material.metalness = 0;
            material.roughness = 0;
            material.reflectivity = 50;
        } else if ( m.name.startsWith("candle") ){
            //mesh setup:
            mesh.castShadow = true; //default=false;
            mesh.receiveShadow = true; //default=false;
            //material setup:
            material.color.setHex(0x804000);
            material.metalness = 0;
            material.roughness = .5;
            material.reflectivity = 1;
            material.transparent = false;
            material.opacity = 1;
        } else if ( m.name.startsWith("stone") ){
            //mesh setup:
            mesh.castShadow = false; //default=false;
            mesh.receiveShadow = true; //default=false;
            //material setup:
            material.color.setHex(0x333333);
            material.metalness = .7;
            material.roughness = 0; //1
            material.reflectivity = 1;  //10
            material.transparent = true;
            material.opacity = .2;
        } else if ( m.name.startsWith("page") ){ //for pageCriminal, pageAdmin, pageCivil & pageCorporate
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.color.setHex(0x262626);
        } else if ( m.name.startsWith("textureBooks") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            //material setup:
            material.normalMap =  booksN;
            material.normalMapType = THREE.TangentSpaceNormalMap;
            material.normalScale = new THREE.Vector2( 5, 5 );
            material.normalMap.flipY = false; //needed to make the normal map apply UV the right way
        } else if ( m.name.startsWith("MGlass") ){
            //material setup:
            material.color.setHex(0xffffff);
            material.reflectivity = 100000;
            material.opacity  = 1;
            material.transparent = true;
        } else if ( m.name.startsWith("sofia") ){
          //mesh setup:
          mesh.castShadow = true; //default=false;
          mesh.receiveShadow = true; //default=false;
          //material setup:
          material.color.setHex(0xfff2e6);  //diffuse color - AFFECTS THE MAP
          material.metalness = 0; //default=0.5; material.metalnessMap can be also provided;1
          material.roughness = 1; //default=0.5; 0 means a smooth mirror reflection;0.3
          material.roughnessMap =  sofia;
        } else if ( m.name.startsWith("white") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0xb3ffff);
            material.metalness = 1;
            material.roughness = .3;
        } else if ( m.name.startsWith("color") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0x00334d);
            material.metalness = 1;
            material.roughness = .3;
        } else if ( m.name.startsWith("metal") ){
            //mesh setup:
            mesh.castShadow = true;
            mesh.receiveShadow = false;
            //material setup:
            material.color.setHex(0x262626);
            material.metalness = 1;
            material.roughness = .3;
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

    let time = Date.now() * 0.0005;
    const delta = clock.getDelta();

    if(mixer) { //makes sure mixer is not updated when no animation is running
        mixer.update( delta );
    }

    if (camera.getObjectByName('cameraRectLight')) { camera.rectLight.rotation.z += delta/10; }

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
            const intersects = raycaster.intersectObjects( targetListLawyers );

            if (mouseEvent ==='mousedown') {  //execute only for mousedown;
                if ( intersects.length > 0 ) {
                      if (INTERSECTEDsibling != intersects[ 0 ].object.parent.getObjectByName(`tv${intersects[ 0 ].object.parent.name}lamp`) ) {
                          if ( INTERSECTEDsibling ) {
                              INTERSECTEDsibling.remove( camera.rectLightLawyer );
                              INTERSECTEDsibling.material.emissive.setHex( INTERSECTEDsibling.currentHex );
                              INTERSECTEDsibling.material.opacity = INTERSECTEDsibling.currentOpacity;
                          }
                          lawyers__about.classList.remove("lawyers__about--animate"); //remove the text; this adding & removing of classes makes the animation jumpy!

                          INTERSECTEDsibling = intersects[ 0 ].object.parent.getObjectByName(`tv${intersects[ 0 ].object.parent.name}lamp`);
                          lawyers__about = document.querySelector(`.lawyers__about--${intersects[ 0 ].object.parent.name}`); //save reference to the text DOM element

                          INTERSECTEDsibling.currentHex = INTERSECTEDsibling.material.emissive.getHex();
                          INTERSECTEDsibling.currentOpacity = INTERSECTEDsibling.material.opacity;

                          INTERSECTEDsibling.add( camera.rectLightLawyer );
                          INTERSECTEDsibling.material.emissive.setHex( 0xffffff );
                          INTERSECTEDsibling.material.opacity = 1;
                          lawyers__about.classList.add("lawyers__about--animate");  //this adding & removing of classes makes the animation jumpy!
                      }
                }
                window.addEventListener( 'mousemove', onMouse, false );
            } else if (mouseEvent ==='mousemove') {  //execute only for mousemove;
                if ( intersects.length > 0 ) {
                      if (!mixer) {
                          playAnimation(scene.gltfTV.scene, scene.gltfTV.animations, null, intersects[ 0 ].object.parent.name); //parent name(the name of the Blender Empty) is the same as the animation clip name;
                      }
                      if (INTERSECTED != intersects[ 0 ].object ) {
                        if ( INTERSECTED ) { INTERSECTED.material.color.setHex( INTERSECTED.currentHex ); }
                        INTERSECTED = intersects[ 0 ].object;
                        INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
                        INTERSECTED.material.color.setHex( 0x1a1a1a );
                        document.body.style.cursor = 'pointer';
                      }
                } else {
                      if ( INTERSECTED ) { INTERSECTED.material.color.setHex( INTERSECTED.currentHex ); }
                      INTERSECTED = null;
                      mixer = null; //so the animation can be played again;
                      document.body.style.cursor = 'default';
                }
            }
            mouseEvent = null;
        }
    }

    if (link === '#services' && !camera.getObjectByName('shutters')) {
        timeCandle += delta;
        flameMaterials[0].uniforms.time.value = timeCandle;
        camera.pointLightServices.position.x = Math.sin(timeCandle * Math.PI) * 0.04;
        camera.pointLightServices.position.z = Math.cos(timeCandle * Math.PI * 0.5) * 0.04;
        camera.pointLightServices.intensity = ( Math.random() * 10 ) + 30;  //from 50 to 60

        if (mouseEvent) { //only execute on mousemove/down;
      	    raycaster.setFromCamera( mouse, camera );
            const intersects = raycaster.intersectObjects( targetListServices );

            if (mouseEvent ==='mousedown') {
                if ( intersects.length > 0 ) {
                      document.body.style.cursor = 'grabbing';
                      window.removeEventListener( 'mousemove', onMouse, false );
                      window.removeEventListener( 'mousedown', onMouse, false );
                      menu__logo.removeEventListener('click', closeOpenMenu);
                      playAnimation(scene.gltfServices.scene, scene.gltfServices.animations);
                      mixer.addEventListener( 'finished', ( e ) => {
                          if (mixer) {
                              mixer = null;
                              scene.pages.position.y = 7.14;
                              services__mg.classList.add("magnify--animate");
                              changeMGOpacity().then(() => { menu__logo.addEventListener('click', closeOpenMenu); });
                              services__mg_remove.addEventListener( 'mousedown', removeMG, false );
                              document.body.style.cursor = 'default';
                              scene.pages.rotation.y = 0;
                          }
                      });
                }
            } else if (mouseEvent ==='mousemove') {
                if ( intersects.length > 0 ) {
                      if (INTERSECTED != intersects[ 0 ].object.parent ) {
                        if ( INTERSECTED ) { INTERSECTED.scale.set(INTERSECTED.currentScale.x, INTERSECTED.currentScale.y, INTERSECTED.currentScale.z);  }
                        INTERSECTED = intersects[ 0 ].object.parent;
                        INTERSECTED.currentScale = { x:INTERSECTED.scale.x, y:INTERSECTED.scale.y, z:INTERSECTED.scale.z };

                        INTERSECTED.scale.set( INTERSECTED.scale.x + 0.05, INTERSECTED.scale.y + 0.05, INTERSECTED.scale.z + 0.05 );
                        document.body.style.cursor = 'grab';
                      }
                } else {
                      if ( INTERSECTED ) { INTERSECTED.scale.set(INTERSECTED.currentScale.x, INTERSECTED.currentScale.y, INTERSECTED.currentScale.z); }
                      INTERSECTED = null;
                      document.body.style.cursor = 'default';
                }
            }
            mouseEvent = null;
        }

        !services__mg.classList.contains("magnify--animate") ? (scene.pages.rotation.y -= 0.01) : magnifyRenderer.render( scene, magnifyCamera );
    }

    if (link === '#news' && !camera.getObjectByName('cameraRectLight')) {
        cssRenderer.render( scene, camera );

        position = ( ( Date.now() - time ) * 0.01 ) % 999;  //goes from 0 to 999; 100 makes it go from 100 to 1099 and removed empty gap of clouds between 0 & 100; decrease 0.03 to decrease speed of clouds;
        scene.newsClouds.position.x += ( mouseX - scene.newsClouds.position.x ) * 0.01;
        scene.newsClouds1.position.x += ( mouseX - scene.newsClouds1.position.x ) * 0.01;
        // scene.newsClouds1.position.y += ( - mouseY - scene.newsClouds.position.y ) * 0.01;
        scene.newsClouds.position.z =  - position - 999;
        scene.newsClouds1.position.z = - position - 999;
    }

    if (link === '#location' && !camera.getObjectByName('cameraRectLight')) { scene.backdrop.rotateZ(-delta/100); }

    // if(scene.music.isEnded()) { scene.music.play().fadeIn(16000, function(){ scene.music.fadeOut(16000); }); }

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

function playAnimationBackwards(model, clips, loop, clipName) {
    mixer = new THREE.AnimationMixer( model );
    clips.forEach((clip) => {
        const action = mixer.clipAction( clip );
        if(action.time === 0) {
            action.time = clip.duration;
        }
        action.timeScale = -1;  //action.paused = false;
        action.loop = THREE.LoopOnce;
        action.play();
        action.clampWhenFinished = true;    //prevents animation from finishing on keyframe 0
    });
}

function openMenu() {
    menu__logo.removeEventListener('click', closeOpenMenu);

    scene.music.fadeWith(scene.musicMenu, 1000);

    if (link === '#home') { scene.remove( scene.spotLightHome0, scene.spotLightHome1, scene.spotLightHome2 ); }
    if (link === "#lawyers") {
        camera.remove(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
        scene.video.pause();
        document.querySelector('.lawyers').classList.remove("lawyers--animate");
        window.removeEventListener( 'mousemove', onMouse, false );
        window.removeEventListener( 'mousedown', onMouse, false );
    }
    if (link === '#services') {
        scene.gltfServices.scene.getObjectByName('candleHolder').remove(camera.pointLightServices, scene.flame);
        scene.remove(scene.rectLightServices);
        window.removeEventListener( 'mousemove', onMouse, false );
        window.removeEventListener( 'mousedown', onMouse, false );
        document.querySelector('.services-control-panel').classList.remove("services-control-panel--animate");
        document.querySelector('.services-rotate-left').removeEventListener( 'mousedown', servicesRotateLeft, false );
        document.querySelector('.services-rotate-right').removeEventListener( 'mousedown', servicesRotateRight, false );
        document.querySelector('.services-move-up').removeEventListener( 'mousedown', servicesMoveUp, false );
        document.querySelector('.services-move-down').removeEventListener( 'mousedown', servicesMoveDown, false );
    }

    if (link === '#news') {
        transformNews( newsSphereTransforms, 1000 );

        document.querySelector('.control-panel').classList.remove("control-panel--animate");

        document.querySelector('.zoom-in').removeEventListener( 'mousedown', zoomIn, false );
        document.querySelector('.zoom-out').removeEventListener( 'mousedown', zoomOut, false );
        document.querySelector('.move-up').removeEventListener( 'mousedown', moveUp, false );
        document.querySelector('.move-left').removeEventListener( 'mousedown', moveLeft, false );
        document.querySelector('.move-right').removeEventListener( 'mousedown', moveRight, false );
        document.querySelector('.move-down').removeEventListener( 'mousedown', moveDown, false );

        document.querySelectorAll('.news__element').forEach((element) => {
            element.removeEventListener("wheel", preventNewsScrolling);
        });
        document.removeEventListener( 'mousemove', newsMouseMove, false );

        scene.remove( scene.newsLight, scene.newsLight.target, scene.newsClouds, scene.newsClouds1, scene.gltfPlane.scene, scene.gltfSofia.scene );
    }

    if (link === '#location') { document.querySelector('.location').classList.remove("location--animate"); }

    camera.add( camera.spotLightShutters, camera.spotLightShutters.target, camera.gltfShutters.scene );

    playAnimationBackwards(camera.gltfShutters.scene, camera.gltfShutters.animations);
    //when animation finishes:
    mixer.addEventListener( 'finished', ( e ) => {
        if (mixer) {
            mixer = null;
            camera.add( camera.rectLight );
            //open the menu:
            document.querySelectorAll('.menu__item').forEach((item) => {
               item.classList.add("menu__item--animate");
            });
            menu__logo.addEventListener('click', closeOpenMenu);
            if (link === '#news') { document.querySelector('.news').classList.remove("news--animate"); }
            if (link === '#location') { scene.remove(scene.gltfBook.scene); }
            if (link === '#lawyers') { scene.remove(scene.gltfTV.scene); }
        }
    });
}

function closeMenu() {
    //close the menu:
    document.querySelectorAll('.menu__item').forEach((item) => {
        item.classList.remove("menu__item--animate");
    });
    menu__logo.removeEventListener('click', closeOpenMenu);

    if (link === '#location') { scene.add(scene.gltfBook.scene); }
    if (link === '#lawyers') { scene.add(scene.gltfTV.scene); }

    camera.remove( camera.rectLight );

    scene.musicMenu.fadeWith(scene.music, 1000);

    const shuttersModel = camera.gltfShutters.scene;
    playAnimation(shuttersModel, camera.gltfShutters.animations);

    //when animation finishes:
    mixer.addEventListener( 'finished', ( e ) => {
        if (mixer) {
            mixer = null;
            camera.remove( camera.spotLightShutters, camera.spotLightShutters.target, shuttersModel );
            menu__logo.addEventListener('click', closeOpenMenu);

            if (link === '#home') { scene.add( scene.spotLightHome0, scene.spotLightHome1, scene.spotLightHome2 ); }

            if (link === '#lawyers' && scene.gltfTV.scene.getObjectByName('tvMMscreen').scale.z === 0.001) {
              //show instructions:
              document.querySelector('.instruction-lawyers').classList.add("instruction--animate");
              document.querySelector('.instruction-lawyers .instruction__remove').addEventListener( 'mousedown', () => {
                  document.querySelector('.instruction-lawyers').classList.remove("instruction--animate");

                  camera.add(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
                  turnOnTV('tvMMscreen')
                  .then(() => { return turnOnTV('tvDMscreen'); })
                  .then(() => { return turnOnTV('tvBTscreen'); })
                  .then(() => {
                      turnOnTV('tvEPscreen');
                      if(!camera.getObjectByName('shutters')) { //make sure next lines are executed only if Menu hasnt been clicked meanwhile
                          scene.video.play();
                          document.querySelector('.lawyers').classList.add("lawyers--animate");
                          window.addEventListener( 'mousemove', onMouse, false );
                          window.addEventListener( 'mousedown', onMouse, false );
                      }
                  });

              }, false );

            } else if (link === '#lawyers') {
                //show instructions:
                document.querySelector('.instruction-lawyers').classList.add("instruction--animate");
                document.querySelector('.instruction-lawyers .instruction__remove').addEventListener( 'mousedown', () => {
                    document.querySelector('.instruction-lawyers').classList.remove("instruction--animate");

                    camera.add(camera.pointLightLawyer0, camera.pointLightLawyer1, camera.pointLightLawyer2);
                    scene.video.play();
                    document.querySelector('.lawyers').classList.add("lawyers--animate");
                    window.addEventListener( 'mousemove', onMouse, false );
                    window.addEventListener( 'mousedown', onMouse, false );

                }, false );

            }

            if (link === '#services') {
                if (!scene.flame) {
                    createFlame();
                }
                scene.add(scene.rectLightServices); //rectLights dont work in mobile
                scene.gltfServices.scene.getObjectByName('candleHolder').add(camera.pointLightServices, scene.flame);
                //show instructions:
                document.querySelector('.instruction-services').classList.add("instruction--animate");
                document.querySelector('.instruction-services .instruction__remove').addEventListener( 'mousedown', () => {
                    document.querySelector('.instruction-services').classList.remove("instruction--animate");
                    document.querySelector('.services-control-panel').classList.add("services-control-panel--animate");
                    document.querySelector('.services-rotate-left').addEventListener( 'mousedown', servicesRotateLeft, false );
                    document.querySelector('.services-rotate-right').addEventListener( 'mousedown', servicesRotateRight, false );
                    document.querySelector('.services-move-up').addEventListener( 'mousedown', servicesMoveUp, false );
                    document.querySelector('.services-move-down').addEventListener( 'mousedown', servicesMoveDown, false );
                    window.addEventListener( 'mousemove', onMouse, false );
                    window.addEventListener( 'mousedown', onMouse, false );
                }, false );
            }

            if (link === '#news') {
                //zoom
                document.querySelector('.zoom-in').addEventListener( 'mousedown', zoomIn, false );
                document.querySelector('.zoom-out').addEventListener( 'mousedown', zoomOut, false );
                document.querySelector('.move-up').addEventListener( 'mousedown', moveUp, false );
                document.querySelector('.move-left').addEventListener( 'mousedown', moveLeft, false );
                document.querySelector('.move-right').addEventListener( 'mousedown', moveRight, false );
                document.querySelector('.move-down').addEventListener( 'mousedown', moveDown, false );
                //prevent default text scrolling; use only the scroll bars
                document.querySelectorAll('.news__element').forEach((element) => {
                    element.addEventListener("wheel", preventNewsScrolling);
                    //different color for each news element each time the #news is opened:
                    element.style.backgroundColor = `rgba(${Math.floor(Math.random() * 100)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.random() * 0.4 + 0.2})`;  //from 0.25 to 0.75 opacity; generate number b/n 0 & 255 for each value of the color
                });
                document.addEventListener( 'mousemove', newsMouseMove, false );
                //different color for the plane each time the #news is opened:
                scene.planeColor.setHex(getRandomColor());

                //show instructions:
                document.querySelector('.instruction-news').classList.add("instruction--animate");
                document.querySelector('.instruction-news .instruction__remove').addEventListener( 'mousedown', () => {
                    document.querySelector('.instruction-news').classList.remove("instruction--animate");
                    document.querySelector('.news').classList.add("news--animate");
                    document.querySelector('.control-panel').classList.add("control-panel--animate");
                    transformNews( newsGridTransforms, 2000 );
                    scene.add( scene.newsLight, scene.newsLight.target, scene.newsClouds, scene.newsClouds1, scene.gltfPlane.scene, scene.gltfSofia.scene );
                    playAnimation(scene.gltfPlane.scene, scene.gltfPlane.animations, 'loop');
                }, false );
            }

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

function changeMGOpacity () {
    return new Promise((resolve,reject) => {
        (function change () {
            scene.glassMG.material.opacity = Math.round( (scene.glassMG.material.opacity - 0.1) * 1000) / 1000;
            if( scene.glassMG.material.opacity > 0 ) {
                setTimeout( change, 22 );
            } else { resolve(); }
        })();
    });
}
function changeBackMGOpacity () {
    return new Promise((resolve,reject) => {
        (function changeBack () {
            scene.glassMG.material.opacity = Math.round( (scene.glassMG.material.opacity + 0.1) * 1000) / 1000;
            if ( scene.glassMG.material.opacity < 1 ) {
                setTimeout( changeBack, 22 );
            } else { resolve(); }
        })();
    });
}

menu__logo.addEventListener('click', closeOpenMenu);
function closeOpenMenu () {
    if (services__mg.classList.contains("magnify--animate")) {
        removeMG(null, 'open menu');
        return false;
    }
    if (link === '#news' && document.querySelector('.news').classList.contains("news--animate")) { mixer = null; }

    (camera.getObjectByName('shutters') && !mixer) ? (closeMenu(link)) : !mixer ? (openMenu(link)) : null;
}

//choose which 'scene' to show from menu
document.querySelectorAll('.menu__link').forEach((anchorLink) => {
    anchorLink.addEventListener("mouseup", (e) => { //so it doesnt duplicate the mousedown event listener in #lawyers!
        switch (e.target.hash) {
          case '#home':
              if (link !== '#home') {
                  link = '#home';
                  camera.position.set( 7.5, 7.63, 0 );
                  camera.rotation.set(0, 90*Math.PI/180, 0);
                  scene.stone.material.opacity = .2;
                  scene.backdrop.position.set(-29.72, 6.17, 0);
                  scene.backdrop.rotation.set( 0.03490658503988659,0,0 );
                  scene.backdrop.material.roughness = 0.1;
                  scene.backdrop.material.metalness = 1;
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
                  camera.position.set( 7.5, 7.63, 0 );
                  camera.rotation.set(0, 162*Math.PI/180, 0);
                  scene.stone.material.opacity = 1;
                  scene.backdrop.position.set(-4, 6.17, 35.4);
                  scene.backdrop.rotation.set( 0.11252859437824148, 1.2566370614359175, 0 );
                  scene.backdrop.material.roughness = 0.2;
                  scene.backdrop.material.metalness = 1;
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
                  camera.position.set( 7.5, 7.63, 0 );
                  camera.rotation.set(0, 234*Math.PI/180, 0);
                  scene.stone.material.opacity = .2;
                  scene.backdrop.position.set(37.61, 6.17 , 21.88);
                  scene.backdrop.rotation.set( 0.03490658503988659, 0.6283185307179586, -3.141592653589793 ); // scene.backdrop.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), 144*Math.PI/180 );
                  scene.backdrop.material.roughness = 0.1;
                  scene.backdrop.material.metalness = 0.9;
                  scene.backdrop.material.bumpScale = 0.005;
                  book.repeat.set( 100, 100 );
                  camera.pointLight.color.setHex(0x000d1a);
                  camera.pointLight.position.set( -20, 0, -7 );
                  camera.pointLight.intensity = 5;
                  camera.lookAt(new THREE.Vector3(12,7.33,3.27)); //7.33 to have the page in the middle of the magnifying glass

                  magnifyCamera.position.copy(camera.position);
                  magnifyCamera.rotation.copy(camera.rotation);
              }
              closeMenu(link);
              break;
          case '#news':
              if (link !== '#news') {
                  link = '#news';
                  camera.position.set(0, 0, 0);
                  camera.rotation.set(0, 0, 0);
                  scene.stone.material.opacity = .2;
                  camera.translateY(-1000); //should correspond to the scene.newsClouds.position.
                  camera.pointLight.color.setHex(0xffffff);
                  camera.pointLight.position.set( 0, 0, 0 );
                  camera.pointLight.intensity = 10;
              }
              closeMenu(link);
              break;
          case '#location':
              if (link !== '#location') {
                  link = '#location';
                  camera.position.set( 7.5, 7.63, 0 );
                  camera.rotation.set(0, 18*Math.PI/180, 0);
                  scene.stone.material.opacity = .2;
                  scene.backdrop.position.set(-4, 6.17, -35.4);
                  scene.backdrop.rotation.set(0.11252859437824148, -1.2566370614359175, 0); //scene.backdrop.rotateOnAxis( new THREE.Vector3( 0, 1, 0 ), -72*Math.PI/180 );
                  scene.backdrop.material.roughness = 0;
                  scene.backdrop.material.metalness = 1;
                  scene.backdrop.material.bumpScale = 0.1;
                  book.repeat.set( 40, 1 );
                  camera.pointLight.color.setHex(0xffffff);
                  camera.pointLight.position.set( 1.4, 0, 0.2 );
                  camera.pointLight.intensity = 20;
              }
              closeMenu(link);
              break;
        }
    });
});

window.addEventListener( 'keydown', (e) => {
    if ( camera.getObjectByName('shutters') && !mixer && e.keyCode === 27 ) { closeMenu(link); }
    if (link === '#services') {
        switch (e.keyCode) {
            case 37: //left arrow
                e.preventDefault();
                servicesRotateLeft();
                break;
            case 38: //up arrow
                e.preventDefault();
                servicesMoveUp();
                break;
            case 39: //right arrow
                e.preventDefault();
                servicesRotateRight();
                break;
            case 40: //down arrow
                e.preventDefault();
                servicesMoveDown();
                break;
        }
    }
    if (link === '#news') {
        switch (e.keyCode) {
            case 37: //left arrow
                e.preventDefault();
                moveLeft();
                break;
            case 38: //up arrow
                e.preventDefault();
                moveUp();
                break;
            case 39: //right arrow
                e.preventDefault();
                moveRight();
                break;
            case 40: //down arrow
                e.preventDefault();
                moveDown();
                break;
        }
    }
    if(e.shiftKey && e.which === 84){
        document.querySelector('.designer').classList.add("designer--animate");
    }
    if(e.keyCode === 27) { document.querySelector('.designer').classList.remove("designer--animate"); }
}, false );

function zoomIn() {
    if (news_objects_container.position.z < endZoom) {
        news_objects_container.translateZ( 150 );
    }
}
function zoomOut() {
    if (news_objects_container.position.z > 600) {
        news_objects_container.translateZ( -150 );
    }
}
function moveUp() {
    if(news_objects_container.position.y < 400){
        news_objects_container.translateY( 200 );
    }
}
function moveLeft() {
    if(news_objects_container.position.x > -400){
        news_objects_container.translateX( -200 );
    }
}
function moveRight() {
    if(news_objects_container.position.x < 400){
        news_objects_container.translateX( 200 );
    }
}
function moveDown() {
    if(news_objects_container.position.y > -400){
        news_objects_container.translateY( -200 );
    }
}
function preventNewsScrolling(e) {
    e.preventDefault();
}
function servicesRotateLeft() {
    scene.pages.position.y = 7.14;
    scene.pages.rotation.y -= 90*Math.PI/180;
}
function servicesRotateRight() {
    scene.pages.position.y = 7.14;
    scene.pages.rotation.y += 90*Math.PI/180;
}
function servicesMoveUp() {
    if(scene.pages.position.y > 7.04) {
        scene.pages.position.y -= .1;
    }
}
function servicesMoveDown() {
    if(scene.pages.position.y < 7.8) {
        scene.pages.position.y += .1;
    }
}

function transformNews( newsTransforms, duration ) {
    // TWEEN.removeAll();
    for ( let i = 0; i < newsObjects.length; i ++ ) {
      const object = newsObjects[ i ];
      const newsTransform = newsTransforms[ i ];
      new TWEEN.Tween( object.position )
        .to( { x: newsTransform.position.x, y: newsTransform.position.y, z: newsTransform.position.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();
      new TWEEN.Tween( object.rotation )
        .to( { x: newsTransform.rotation.x, y: newsTransform.rotation.y, z: newsTransform.rotation.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();
    }
    // new TWEEN.Tween( this )
    // 	.to( {}, duration * 2 )
    // 	.start();
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if(width/height > 3) return;  //so it doesnt show surrounding models when screen too wide and not high enough;
    if(width < height) {
        portrait.style.visibility = "visible";
        return;
    }

    portrait.style.visibility = "hidden";
    camera.aspect = width/height;  //doesn't work with WIDTH/HEIGHT !
    camera.updateProjectionMatrix();
    renderer.setSize( width, height ); //doesn't work with WIDTH/HEIGHT !
    cssRenderer.setSize( width, height );

}

function addGoogleMapScript( src, callback) {
    const s = document.createElement( 'script' );
    s.setAttribute( 'src', src );
    s.setAttribute( 'id', 'googleMap' );
    s.onload = callback;
    document.body.appendChild( s );
}

function googleMapInit() {
    const locationSofia = {lat: 42.6948648, lng: 23.3197577};
    const map = new google.maps.Map(document.querySelector('.location__map'), {
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
    const marker = new google.maps.Marker({
        position: locationSofia,
        map: map,
        title: 'Markovski Lawyers LLP',
        draggable: false,
        animation: google.maps.Animation.BOUNCE,  //BOUNCE, DROP
        icon: `./img_${device}/icoSmall.png`
    });
}

function onMouse( event ) {
    mouseEvent = event.type;
    if (mouseEvent === 'mousedown' && link === '#lawyers') {
        window.removeEventListener( 'mousemove', onMouse, false );
    }
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function removeMG (e, openMenu) {
    services__mg_remove.removeEventListener( 'mousedown', removeMG, false );
    scene.pages.position.set(12, 7.35, 3.27);
    changeBackMGOpacity().then(() => {
        services__mg.classList.remove("magnify--animate");
        playAnimationBackwards(scene.gltfServices.scene, scene.gltfServices.animations);
        mixer.addEventListener( 'finished', ( e ) => {
            if (mixer) {
                mixer = null;
                window.addEventListener( 'mousedown', onMouse, false );
                window.addEventListener( 'mousemove', onMouse, false );
                if(openMenu) { closeOpenMenu(); } //when menu is clicked but the magnifying glass is still used
            }
        });
    });
}

function createFlame() {
    const flameGeo = new THREE.SphereBufferGeometry(0.5, 8, 8);  //size of flame and smoothness
    flameGeo.translate(0, .5, 0);  //changes the tip of the flame
    const flameMat = getFlameMaterial();
    flameMaterials.push(flameMat);
    scene.flame = new THREE.Mesh(flameGeo, flameMat); //need to add the flame to the required mesh to which we want to attach the flame
    scene.flame.position.set(0, 3.1, 0);
    scene.flame.rotation.y = THREE.Math.degToRad(-45);
    scene.flame.scale.set(0.2, 0.2, 0.2);
    return this; //so we can chain the calls
}

function getFlameMaterial() {
    const side =  THREE.FrontSide;
    return new THREE.ShaderMaterial({
        uniforms: {
          time: {value: 0}
        },
        vertexShader: `
          uniform float time;
          varying vec2 vUv;
          varying float hValue;

          //https://thebookofshaders.com/11/
          // 2D Random
          float random (in vec2 st) {
              return fract(sin(dot(st.xy,
                                   vec2(12.9898,78.233)))
                           * 43758.5453123);
          }

          // 2D Noise based on Morgan McGuire @morgan3d
          // https://www.shadertoy.com/view/4dS3Wd
          float noise (in vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);

              // Four corners in 2D of a tile
              float a = random(i);
              float b = random(i + vec2(1.0, 0.0));
              float c = random(i + vec2(0.0, 1.0));
              float d = random(i + vec2(1.0, 1.0));

              // Smooth Interpolation

              // Cubic Hermine Curve.  Same as SmoothStep()
              vec2 u = f*f*(3.0-2.0*f);
              // u = smoothstep(0.,1.,f);

              // Mix 4 coorners percentages
              return mix(a, b, u.x) +
                      (c - a)* u.y * (1.0 - u.x) +
                      (d - b) * u.x * u.y;
          }

          void main() {
              vUv = uv;
              vec3 pos = position;

              pos *= vec3(0.8, 2, 0.725);
              hValue = position.y;
              //float sinT = sin(time * 2.) * 0.5 + 0.5;
              float posXZlen = length(position.xz);

              pos.y *= 1. + (cos((posXZlen + 0.25) * 3.1415926) * 0.25 + noise(vec2(0, time)) * 0.125 + noise(vec2(position.x + time, position.z + time)) * 0.5) * position.y; // flame height

              pos.x += noise(vec2(time * 2., (position.y - time) * 4.0)) * hValue * 0.0312; // flame trembling
              pos.z += noise(vec2((position.y - time) * 4.0, time * 2.)) * hValue * 0.0312; // flame trembling

              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
          }
        `,
        fragmentShader: `
          varying float hValue;
          varying vec2 vUv;

          // honestly stolen from https://www.shadertoy.com/view/4dsSzr
          vec3 heatmapGradient(float t) {
            return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
          }

          void main() {
            float v = abs(smoothstep(0.0, 0.4, hValue) - 1.);
            float alpha = (1. - v) * 0.99; // bottom transparency
            alpha -= 1. - smoothstep(1.0, 0.97, hValue); // tip transparency
            gl_FragColor = vec4(heatmapGradient(smoothstep(0.0, 0.3, hValue)) * vec3(0.95,0.95,0.4), alpha) ;
            gl_FragColor.rgb = mix(vec3(0,0,1), gl_FragColor.rgb, smoothstep(0.0, 0.3, hValue)); // blueish for bottom
            gl_FragColor.rgb += vec3(1, 0.9, 0.5) * (1.25 - vUv.y); // make the midst brighter
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.66, 0.32, 0.03), smoothstep(0.95, 1., hValue)); // tip
          }
        `,
        transparent: true,
        side: side
    });
}

function newsLoad() {
    fetch(`./js/news_${device}.json`, {
            method: "GET",
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer" // no-referrer, *client
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(news) {

            // news_objects_container.rotation.y = 306*Math.PI/180;  //so it faces the NEWS scene
            news_objects_container.translateZ(900);

            news.forEach((newsSingle, index) => {
                const element = document.createElement( 'div' );
                element.className = 'news__element';
                element.style.zIndex = 10 - index; //necessary for Chrome; otherwise produces artifacts;

                const heading = document.createElement( 'h2' );
                heading.className = 'news__element-heading';
                heading.textContent = newsSingle.heading;
                element.appendChild( heading );

                const image = document.createElement( 'img' );
                image.className = 'news__element-image';
                image.src = newsSingle.image;
                element.appendChild( image );

                const text = document.createElement( 'div' );
                text.className = 'news__element-text';
                text.innerHTML = newsSingle.text;
                element.appendChild( text );

                const news_object = new THREE.CSS3DObject( element );
                news_object.position.x = Math.random() * 4000 - 2000;
                news_object.position.y = Math.random() * 4000 - 2000;
                news_object.position.z = Math.random() * 4000 - 2000;

                news_objects_container.add(news_object);

                newsObjects.push( news_object );
            });
            camera.add( news_objects_container );

            endZoom = (Math.ceil(newsObjects.length/4) - 1)*1000 + 2000; //4 is number of news per 3D column

            // grid arrangement; https://threejs.org/examples/css3d_periodictable.html
            for ( let i = 0; i < newsObjects.length; i ++ ) {
                const grid_transform_object = new THREE.Object3D();
                grid_transform_object.position.x = ( ( i % 2 ) * 400 ) - 200; //-200 200; 2 determines how many columns;
                grid_transform_object.position.y = ( - ( Math.floor( i / 2 ) % 2 ) * 400 ) + 200; //-200, 200; 2 determines how many rows;
                grid_transform_object.position.z = - ( Math.floor( i / 4 ) ) * 1000 - 2000; //-2000, -3000, -4000; 4 items before going to next depth;

                newsGridTransforms.push( grid_transform_object );
            }
            // sphere arrangement to be used when opening the Menu:
            const vector = new THREE.Vector3();
            for ( let i = 0, l = newsObjects.length; i < l; i ++ ) {
                const phi = Math.acos( - 1 + ( 2 * i ) / l );
                const theta = Math.sqrt( l * Math.PI ) * phi;
                const sphere_transform_object = new THREE.Object3D();
                sphere_transform_object.position.setFromSphericalCoords( 800000, phi, theta );
                vector.copy( sphere_transform_object.position ).multiplyScalar( 2 );
                sphere_transform_object.lookAt( vector );
                newsSphereTransforms.push( sphere_transform_object );
            }

            cssRenderer.setSize( WIDTH, HEIGHT );
            newsContainer.appendChild( cssRenderer.domElement );
        });
}
function newsMouseMove( e ) {
    mouseX = ( e.clientX - windowHalfX ) * 0.25;
    // mouseY = ( e.clientY - windowHalfY ) * 0.15;
}
function newsCloudsLoad() {
    geometry = new THREE.Geometry();

    const texture = new THREE.TextureLoader().load(`./img_${device}/cloud.png`);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    const fog = new THREE.Fog( 0x4584b4, - 10, 2000 ); //corresponds to the color in the background

    material = new THREE.ShaderMaterial({
      uniforms: {
        "map": { type: "t", value: texture },
        "fogColor" : { type: "c", value: fog.color },
        "fogNear" : { type: "f", value: fog.near },
        "fogFar" : { type: "f", value: fog.far }
      },
      vertexShader: document.getElementById( 'vs' ).textContent,
      fragmentShader: document.getElementById( 'fs' ).textContent,
      depthWrite: false,
      depthTest: false,
      transparent: true
    });

    const plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );  //decrease for smaller clouds

    for ( let i = 0; i < 999; i++ ) { //increase numbers and change X & Z position for scene.newsClouds

        plane.position.x = Math.random() * 2000 - 1000;  //from -1000 to 1000
        plane.position.y = - Math.random() * Math.random() * 35 - 30;  //goes from -35 to -30; -30 is how much from middle of screen should be offset; exchange - with + to get clouds in upper screen;
        plane.position.z = i*2; //determines how long the clouds mesh will be; increase for longer
        plane.rotation.z = Math.random() * Math.PI;
        plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;  //goes from 0.5 to 2

        plane.updateMatrix();  //Make sure the matrix has been updated before merging
        geometry.merge( plane.geometry, plane.matrix );
    }

    scene.newsClouds = new THREE.Mesh( geometry, material );
    scene.newsClouds.position.y = -1000;  //should correspond to the camera.translateY(-1000);

    scene.newsClouds1 = new THREE.Mesh( geometry, material );
    scene.newsClouds1.position.y = -1000; //should correspond to the camera.translateY(-1000);
    scene.newsClouds1.position.z = - 999;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '0x';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function musicLoad(){ //http://buzz.jaysalvat.com/documentation/sound/
  	scene.music = new buzz.sound("./audio/music", {
    		formats: [ "ogg", "mp3" ],
    		preload: true,
    		autoplay: false,
    		loop: true,
    		volume: 100
    });
    scene.musicMenu = new buzz.sound("./audio/musicMenu", {
    		formats: [ "ogg", "mp3" ],
    		preload: true,
    		autoplay: false,
    		loop: true,
    		volume: 100
    });
}
menu__volume.addEventListener('click', muteUnmute);
function muteUnmute () {
    if (!scene.music.isMuted() || !scene.musicMenu.isMuted()){
        scene.music.mute();
        scene.musicMenu.mute();
        document.querySelector('.volume-icon').setAttribute('href', `./img_${device}/sprite.svg#volume-x`);
    } else {
        scene.musicMenu.unmute();
        scene.music.unmute();
        document.querySelector('.volume-icon').setAttribute('href', `./img_${device}/sprite.svg#volume`);
    }
}

//run the app only if CSS grid is supported:
if( getComputedStyle(document.querySelector('.cssGrid-not-supported')).getPropertyValue('display') == 'none') {
    init()
    .then(() => {
        render();
    })
    .catch((e) => { alert('Initializing the app failed'); console.log(e); });
}
