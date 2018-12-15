if (!Detector.webgl) Detector.addGetWebGLMessage();
var container = document.getElementById('container');

var CONTAINER_WIDTH = $(container).width() / window.innerWidth,
    CONTAINER_HEIGHT = $(container).height() / window.innerHeight;

var ROTATING_OBJ = false;
var camera,
    controls,
    scene,
    renderer,
    dragControls;
var MARGIN = 0;
var SCREEN_WIDTH = window.innerWidth * CONTAINER_WIDTH;
var SCREEN_HEIGHT = (window.innerHeight - 2 * MARGIN) * CONTAINER_HEIGHT;
var START = false;
var sizegrid = 80, camerapositionstart;
var light, pointLight, ambientLight, light2;


var objects = [], infoAnimals = [], hoverableObjects = [];
var wX, wY;
var geometrySkull1, materialSkull1, meshSkull1, bboxSkull1;
var wireframe, planeMesh;
var plane = new THREE.Plane();
var normal = new THREE.Vector3();
var point = new THREE.Vector3();
var volumeDicom;
var nameAnimal = "Magpie", infoAnimal = "Average age: 15 years <br> Average weight 210-270g<br><br>";
// infoAnimals.push("<h4>Info:</h4>");
infoAnimals.push("<h5>" + nameAnimal + ":</h5>" + infoAnimal);

var MAGPIE = true, POLARBEAR = false, WOLF = false;
var GRID = false;
var raycaster;
var MOVEOBJECT = true; //TODO:

var INFO = false, HELP = false;
init();
updateInfoBox();
function init() {
    sliderClip = document.getElementById("sliderClippingX");
    // GRID
    gridHelper = new THREE.GridHelper(800, 100);
    // CAMERA
    camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 10, 1000000);
    camera.position.set(50, 80, 50);
    camera.lookAt(0, 0, 0);
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    // LIGHTS
    light = new THREE.DirectionalLight(0xFFE599);
    light.position.set(50, -50, 50);
    light.intensity = 0.3;
    scene.add(light);
    light2 = new THREE.DirectionalLight(0xFFE599);
    light2.position.set(50, 50, 50);
    light2.intensity = 0.3;
    scene.add(light2);
    pointLight = new THREE.PointLight(0xc9e2ff);
    pointLight.position.set(50, 100, 0);
    pointLight.intensity = 0.3;
    scene.add(pointLight);
    ambientLight = new THREE.AmbientLight(0x080808);
    scene.add(ambientLight);
    // AXIS
    var axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    // BACKGROUND
    var texture = THREE.ImageUtils.loadTexture('./models/LogoBM_english_1.jpg');
    var repeatX, repeatY;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    repeatX = 1;
    repeatY = SCREEN_HEIGHT * 2028 / (SCREEN_WIDTH * 435);
    texture.repeat.set(repeatX, repeatY);
    texture.offset.x = (repeatX - 1) / 2 * -1;
    texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    scene.background = texture
    // Load 3D object
    loadObject();


    // RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize($(container).width(), $(container).height());
    renderer.domElement.style.height = $(container).height();
    renderer.domElement.style.width = $(container).width();
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = MARGIN + "px";
    renderer.domElement.style.left = "0px";
    container.appendChild(renderer.domElement);
    //
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // DRAG CONTROLS
    dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', onDragStart, false);
    dragControls.addEventListener('dragend', onDragEnd, false);

    dragControls.enabled = false;
    // EVENTS
    window.addEventListener('resize', onWindowResize, false);
}


function loadObject() {
    var loaderSTL = new THREE.STLLoader();

    loaderSTL.load('./models/' + nameAnimal + '.stl', function (geometry) {
        this.geometrySkull1 = geometry;

        // compute boundbingbox to translate mesh 
        this.geometrySkull1.computeBoundingBox();
        this.bbox = this.geometrySkull1.boundingBox;
        var x = -(this.bbox.min.x + this.bbox.max.x) / 2;
        var y = -(this.bbox.min.y + this.bbox.max.y) / 2;
        var z = -(this.bbox.min.z + this.bbox.max.z) / 2;


        this.materialSkull1 = new THREE.MeshPhongMaterial({
            color: 0xFFE599,
            shininess: 0,

            side: THREE.DoubleSide,

            // ***** Clipping setup (material): *****
            // clippingPlanes: [plane,clippingPlaneYs],
            clipShadows: true,
            transparent: true,
        });

        meshSkull1 = new THREE.Mesh(geometrySkull1, materialSkull1);

        meshSkull1.scale.set(1, 1, 1);
        meshSkull1.castShadow = true;
        meshSkull1.receiveShadow = true;
        meshSkull1.name = nameAnimal;

        scene.add(meshSkull1);

        // reset position of objects in scene
        if (objects.length == 0) {
            meshSkull1.position.set(x, y, z);

            if (nameAnimal == "Polarbear") {
                var geometry = new THREE.BoxGeometry(50, 43, 52);
                var material = new THREE.MeshBasicMaterial({ color: 0x00b8ff,transparent: true, opacity: 0  });
                var cube = new THREE.Mesh(geometry, material);
                cube.position.set(0, 80, 80);
                cube.name = "Turbinate bones to warm air.";
                meshSkull1.add(cube);
                hoverableObjects.push(cube);
            }
            objects.push(meshSkull1);
            hoverableObjects.push(meshSkull1);

        }
        else {

            const boundingBox = new THREE.Box3();
            var i = objects.length;
            // var element = objects[i - 1];
            var elementbefore = objects[i - 1];
            var centerbefore = boundingBox.setFromObject(elementbefore).getCenter();
            var sizebefore = boundingBox.setFromObject(elementbefore).getSize();
            var center = boundingBox.setFromObject(meshSkull1).getCenter();
            var size = boundingBox.setFromObject(meshSkull1).getSize();


            // TODO: wenn rotation ausgestellt wird nicht position ändern?         
            meshSkull1.position.set(sizebefore.x / 2 + centerbefore.x + size.x / 2 + center.x, -center.y, 0)

            if (nameAnimal == "Polarbear") {
                var geometry = new THREE.BoxGeometry(50, 43, 52);
                var material = new THREE.MeshBasicMaterial({ color: 0x00b8ff, transparent: true, opacity: 0 });
                var cube = new THREE.Mesh(geometry, material);
                cube.position.set(0, 80, 80);
                cube.name = "Turbinate bones to warm air.";
                meshSkull1.add(cube);
                hoverableObjects.push(cube);
            }
            objects.push(meshSkull1);
            hoverableObjects.push(meshSkull1);
        }

        clipAxis = -1;
        clippingOnAxis();
        fitCameraToObject(camera)
        animate();
    });
}

//
function onWindowResize(event) {
    SCREEN_WIDTH = window.innerWidth * CONTAINER_WIDTH;
    SCREEN_HEIGHT = (window.innerHeight - 2 * MARGIN) * CONTAINER_HEIGHT;
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}


//
function animate() {
    var axis = new THREE.Vector3(0, 1, 0).normalize();
    var speed = 0.01;

    if (objects != null && ROTATING_OBJ) {
        objects.forEach(element => {
            element.rotateOnAxis(axis, speed);
        });
    }


    moveObject();
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.autoclear = true;
    renderer.clear();
    renderer.render(scene, camera);
}
function magpieClick() {
    nameAnimal = "Magpie";

    var loadobj = true;
    objects.forEach(element => {
        if (element.name == nameAnimal) {
            loadobj = false;
            scene.remove(element);
            var index = objects.indexOf(element);
            if (index > -1) {
                objects.splice(index, 1);
                infoAnimals.splice(index, 1);
                hoverableObjects.splice(index, 1);
            }
            document.getElementById("imgMagpie").style.border = '';

        }
    }); fitCameraToObject(camera);
    if (loadobj) {
        document.getElementById("imgMagpie").style.border = '4px solid #008800';
        infoAnimal = "<br>Average age: 15 years <br>Average weight: 210-270g<br>";
        infoAnimals.push("<h5>" + nameAnimal + ":</h5>" + infoAnimal);

        loadObject();
    } updateInfoBox();
}

function polarbearClick() {
    nameAnimal = "Polarbear";

    //objects.push(cube);
    var loadobj = true;
    objects.forEach(element => {
        if (element.name == nameAnimal) {
            loadobj = false;
            scene.remove(element);
            var index = objects.indexOf(element);
            if (index > -1) {
                objects.splice(index, 1);
                infoAnimals.splice(index, 1);
                hoverableObjects.splice(index, 1);
                hoverableObjects.splice(index, 1);
            }
            document.getElementById("imgPolarBear").style.border = '';

        }
    });
    fitCameraToObject(camera);
    if (loadobj) {
        document.getElementById("imgPolarBear").style.border = '4px solid #008800';
        infoAnimal = "Average age: 15-18 years <br>Average weight male: 450kg and female: 200kg<br><br>";

        infoAnimals.push("<h5>" + nameAnimal + ":</h5>" + infoAnimal);

        loadObject();
    }
    updateInfoBox();
}

function wolfClick() {
    nameAnimal = "Wolf";

    var loadobj = true;
    objects.forEach(element => {
        if (element.name == nameAnimal) {
            loadobj = false;
            scene.remove(element);
            var index = objects.indexOf(element);
            if (index > -1) {
                objects.splice(index, 1);
                hoverableObjects.splice(index, 1);
                infoAnimals.splice(index, 1);
            }
            document.getElementById("imgWolf").style.border = '';

        }

    }); fitCameraToObject(camera);
    if (loadobj) {
        document.getElementById("imgWolf").style.border = '4px solid #008800';
        infoAnimal = "Average age: 5-6 years <br>Average weight male: 30-80kg and female: 23-55kg<br><br>";
        infoAnimals.push("<h5>" + nameAnimal + ":</h5>" + infoAnimal);
        loadObject();
    }
    updateInfoBox();
}

const fitCameraToObject = function (camera) {

    const boundingBox = new THREE.Box3();
    var centerAll = new THREE.Vector3(0, 0, 0);
    var maxSize = new THREE.Vector3(0, 0, 0);
    var maxVolume = 0;
    var xpos = 0;
    objects.forEach(element => {
        boundingBox.setFromObject(element);
        centerAll.add(boundingBox.getCenter());
        var volume = boundingBox.getSize().x * boundingBox.getSize().y * boundingBox.getSize().z;
        if (volume > maxVolume) {
            maxVolume = volume;
            maxSize = boundingBox.getSize();
        }
        xpos = + boundingBox.getSize().x;
    });
    var count = new THREE.Vector3(objects.length, objects.length, objects.length);
    centerAll.divide(count);

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(maxSize.x, maxSize.y, maxSize.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = maxDim / 2 / Math.tan(fov / 2);

    camera.position.z = cameraZ;
    camera.position.x = xpos;
    camera.position.y = 50;

    if (!START) {
        camerapositionstart = camera.position.length();
        START = false;
    }

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    camera.updateProjectionMatrix();
    controls.target.set(centerAll.x, centerAll.y, centerAll.z);
    camera.lookAt(centerAll.x, centerAll.y, centerAll.z);
    // camera.lookAt(new THREE.Vector3(0, 0, 0))

}

function rotatingObject() {
    var checkbox = document.getElementById("checkBoxRotatingObj");
    if (checkbox.checked == true) {
        ROTATING_OBJ = true;
        if (document.getElementById("ClippingOnAxis").checked) {
            document.getElementById("ClippingOnAxis").checked = false;
            clippingOnAxis();
        }
    }
    else {
        ROTATING_OBJ = false;

        objects.forEach(element => {
            element.rotation.set(0, 0, 0);
        });
        render();
    }

}

function activateGridHelper() {
    if (!GRID) {
        GRID = true;
        document.getElementById("legend").style.display = "block";
        scene.add(gridHelper);
    }
    else {
        GRID = false;
        document.getElementById("legend").style.display = "none";

        scene.remove(gridHelper);
    }
}

function openMenu() {
    var content = document.getElementById("overlay");
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

function openHelpbox() {
    var content = document.getElementById("info");
    if (INFO == true) {
        content.style.display = "none";
        content.innerHTML = "";
        INFO = false;
    } else {
        INFO = true;
        HELP = false;
        content.style.display = "block";
                var material = new THREE.MeshBasicMaterial({ color: 0x00b8ff,transparent: true, opacity: 0  });
                content.innerHTML = "<h4>Help:</h4>To see other skull, just click on the images!<br><br><b>Rotation of camera:</b> Click (left) in the scene and move mouse<br><b>Zoom of camera: </b>Rolling of mouseweel<br><br>  <b>Movement of object:</b> selection of object (left mouse) and moving the mouse!<br><br> <b>Measuring with line: </b>Click left mouse on object and keep it pressed to the end point of the line<br><br><a style=\" color: red;\" href=\"./video.html\" target=\"_blank\">See a tutorial video</a>"
    }
}

function openInfobox() {
    var content = document.getElementById("info");
    if (HELP == true) {
        content.style.display = "none";
        // content.innerHTML = "";
        HELP = false;
    } else {
        content.style.display = "block";

        updateInfoBox();
        HELP = true;
        INFO = false;
    }
}
function moveObjectActivate() {
    if (document.getElementById("moveObject").checked == false) {
        MOVEOBJECT = false;
        // document.removeEventListener('mousemove', onDocumentMouseMove, false);
        // document.removeEventListener('mousedown', onDocumentMouseDown, false);
    }
    else
        MOVEOBJECT = true;
}
function onDragStart() {
    controls.enabled = false;
    // if (objects.length > 0) {
    //     objects.forEach(element => {
    //         element.material.color = new THREE.Color(0xf441d9);
    //     });
    // }
}

function onDragEnd() {
    controls.enabled = true;
    // if (objects.length > 0) {
    //     objects.forEach(element => {
    //         element.material.color = new THREE.Color(0xFFE599);
    //     });
    // }
}

function updateInfoBox() {
    document.getElementById("info").innerHTML = "";
    infoAnimals.forEach(element => {
        document.getElementById("info").innerHTML += element;
    });

}

function reload() {
    window.location.reload();
}