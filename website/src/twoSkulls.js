if (!Detector.webgl) Detector.addGetWebGLMessage();
var container = document.getElementById('container');

var CONTAINER_WIDTH = $(container).width() / window.innerWidth,
    CONTAINER_HEIGHT = $(container).height() / window.innerHeight;
var camera,
    controls,
    scene,
    renderer,
    raycaster;
var MARGIN = 0;
var SCREEN_WIDTH = window.innerWidth * CONTAINER_WIDTH;
var SCREEN_HEIGHT = (window.innerHeight - 2 * MARGIN) * CONTAINER_HEIGHT;

var light, pointLight, ambientLight, light2;

var geometrySkull1, materialSkull1, meshSkull1, bboxSkull1;
var geometrySkull2, materialSkull2, meshSkull2, bboxSkull2;

var mouse = new THREE.Vector2(), INTERSECTED;
var raycastobjects = [];

var followMouse = false;
var movableObject;

var center1, center2, size1,size2, offsetSkull1, offsetSkull2;
var gridHelper;
var GRID = false;
init();

function init() {
    // CAMERA
    camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 10, 1000000);
    camera.position.set(50, 80, 50);
    // SCENE

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    // LIGHTS
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(50, -50, 50);
    light.intensity = 0.5;

    scene.add(light);
    light2 = new THREE.DirectionalLight(0xffffff);
    light2.position.set(50, 50, 50);
    light2.intensity = 0.5;

    scene.add(light2);

    pointLight = new THREE.PointLight(0xFF3300);
    pointLight.position.set(0, 0, 100);
    pointLight.intensity = 0.5;

    scene.add(pointLight);

    ambientLight = new THREE.AmbientLight(0x080808);

    scene.add(ambientLight);

    // AXIS
    var axesHelper = new THREE.AxesHelper(100);
    // scene.add(axesHelper);

    //RAYCASTER
    raycaster = new THREE.Raycaster();

    // GRID
     gridHelper = new THREE.GridHelper(500, 40);

    // Load 3D object
    loadObjects();
    // RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($(container).width(), $(container).height());
    renderer.domElement.style.height = $(container).height();
    renderer.domElement.style.width = $(container).width();
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = MARGIN + "px";
    renderer.domElement.style.left = "0px";
    renderer.localClippingEnabled = false;
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);
    //
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // container.appendChild(stats.dom);
    // EVENTS
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
}

function loadObjects() {
    var loaderSTL = new THREE.STLLoader();


    loaderSTL.load('./models/magpie.stl', function (geometry) {
        this.geometrySkull1 = geometry;
        this.materialSkull1 = new THREE.MeshPhongMaterial({
            color: 0xFFE599,
            shininess: 0,
            side: THREE.DoubleSide,
            // ***** Clipping setup (material): *****
            // clippingPlanes: [plane,clippingPlaneYs],
            clipShadows: true,
        });
    });

    loaderSTL.load('./models/wolf.stl', function (geometry) {
        this.geometrySkull2 = geometry;
        this.materialSkull2 = new THREE.MeshPhongMaterial({
            color: 0xFFE599,
            shininess: 0,
            side: THREE.DoubleSide,
            // ***** Clipping setup (material): *****
            // clippingPlanes: [plane,clippingPlaneYs],
            clipShadows: true,
        });

        scene.remove(meshSkull1);
        scene.remove(meshSkull2);
        meshSkull1 = new THREE.Mesh(geometrySkull1, materialSkull1);
        meshSkull2 = new THREE.Mesh(geometrySkull2, materialSkull2);

        const boundingBox = new THREE.Box3();

        center1 = boundingBox.setFromObject(meshSkull1).getCenter();
        size1 = boundingBox.setFromObject(meshSkull1).getSize();
        center2 = boundingBox.setFromObject(meshSkull2).getCenter();
        size2 = boundingBox.setFromObject(meshSkull2).getSize();

        meshSkull1.scale.set(1, 1, 1);
        meshSkull1.castShadow = true;
        meshSkull1.receiveShadow = true;

        offsetSkull1 = center1;
        offsetSkull2 = center2;

        meshSkull1.position.set((-(size1.x) - size2.x) / 2, -(center1.y), -(center1.z));
        meshSkull1.name = "skull1";

        scene.add(meshSkull1);


        meshSkull2.scale.set(1, 1, 1);
        meshSkull2.castShadow = true;
        meshSkull2.receiveShadow = true;

        meshSkull2.position.set((size1.x + size2.x) / 2, -center2.y, -center2.z);
        meshSkull2.name = "skull2";
        // TODO: function for gridhelper


        scene.add(meshSkull2);
        raycastobjects.push(meshSkull1);
        raycastobjects.push(meshSkull2);

        fitCameraToObject(camera, meshSkull2)

        animate();
    });
}

function onWindowResize(event) {
    SCREEN_WIDTH = window.innerWidth * CONTAINER_WIDTH;
    SCREEN_HEIGHT = (window.innerHeight - 2 * MARGIN) * CONTAINER_HEIGHT;
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}

function animate() {
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(raycastobjects);

    if (followMouse) {
        controls.enabled = false;
        var vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        var dir = vector.sub(camera.position).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add(dir.multiplyScalar(distance));
        var newpos;
        if (INTERSECTED.name == "skull1")
            newpos = new THREE.Vector3(pos.x - offsetSkull1.x, pos.y - offsetSkull1.y, pos.z - offsetSkull1.z);
        else if (INTERSECTED.name == "skull2")
            newpos = new THREE.Vector3(pos.x - offsetSkull2.x, pos.y - offsetSkull2.y, pos.z - offsetSkull2.z);

        movableObject.position.copy(newpos);
    }
    else {
        if (intersects.length > 0) {
            if (INTERSECTED != intersects[0].object) {
                if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                INTERSECTED = intersects[0].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                INTERSECTED.material.emissive.setHex(0xff0000);
            }
        } else {
            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = null;
        }
    }


    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.clear();
    renderer.render(scene, camera);
}
const fitCameraToObject = function (camera, object) {
    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    // const center1 = boundingBox.getCenter();
    const center = new THREE.Vector3(0, 0, 0);

    const size = boundingBox.getSize();

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = maxDim / 2 / Math.tan(fov / 2);

    camera.position.z = cameraZ;
    camera.position.x = 50;
    camera.position.y = 50;

    const minZ = boundingBox.min.z;
    // const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.updateProjectionMatrix();

    camera.lookAt(center)

}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    if (!followMouse && INTERSECTED) {
        followMouse = true;
        movableObject = INTERSECTED;
        movableObject.material.emissive.setHex(0x004C4C);
        // INTERSECTED.material.emissive.setHex(0x004C4C);            
    }
    else {
        followMouse = false;
        controls.enabled = true;
        if(INTERSECTED)
            INTERSECTED.material.emissive.setHex(materialSkull2);
        INTERSECTED = null;
    }
}

function activateGridHelper() {
    if (!GRID) {
        if ((center2.y - size2.y) < (center1.y - size1.y)) {
            gridHelper.position.set(0, center2.y - size2.y, 0);
        }
        else {
            gridHelper.position.set(0, center1.y - size1.y, 0);
        }
        GRID = true;
        scene.add(gridHelper);
    }
    else
    {
        GRID=false;
        scene.remove(gridHelper);
    }
}