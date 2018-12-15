var raycaster;
var mouse = new THREE.Vector2();
var startpos, endpos;
var MOUSE_MOVED = false;
var MOUSE_DOWN = false;
var MEASURE = false;
var line, spherestart, sphereend;
var intersectedObject;
var objects;

function getPointOnObjects() {
    var pos = THREE.Vector3();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        intersectedObject = intersects[0];
        pos = intersectedObject.point;
    }
    return pos;
}

function drawLine() {
    if (line) {
        scene.remove(line);
        scene.remove(spherestart);
        scene.remove(sphereend);
    }
    var geometrySphere = new THREE.SphereGeometry(1, 16, 16);
    var materialSphere = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    spherestart = new THREE.Mesh(geometrySphere, materialSphere);
    sphereend = new THREE.Mesh(geometrySphere, materialSphere);
    spherestart.position.set(startpos.x,startpos.y,startpos.z);
    sphereend.position.set(endpos.x,endpos.y,endpos.z);
    scene.add(spherestart);
    scene.add(sphereend);
    //create a blue LineBasicMaterial
    var material = new MeshLineMaterial({
        color: new THREE.Color(0xff0000),
        linewidth: 10,
    });


    var geometry = new THREE.Geometry();
    geometry.vertices.push(startpos);
    geometry.vertices.push(endpos);
    meshline = new MeshLine();
    meshline.setGeometry(geometry);
    line = new THREE.Mesh(meshline.geometry, material);
    // line.renderOrder = 999;
    // line.onBeforeRender = function (renderer) { renderer.clearDepth(); };
    scene.add(line);
}
function onDocumentMouseDownMeasure(event) {
    //event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    startpos = getPointOnObjects();
    MOUSE_DOWN = true;

}
function onDocumentMouseMoveMeasure(event) {
    if (MOUSE_DOWN) {
        MOUSE_MOVED = true;
    }
}
function onDocumentMouseUpMeasure(event) {
    MOUSE_DOWN = false;

    if (MOUSE_MOVED) {
        //event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        endpos = getPointOnObjects();
        if (endpos && startpos) {
            drawLine();
            var dist = startpos.distanceTo(endpos);
            const lengthpolarbear_correction = 330/38;
            dist = dist/lengthpolarbear_correction;
            intersectedObject.object.material.opacity = 0.9;
        }

        MOUSE_MOVED = false;


        document.getElementById("length").innerHTML = "Length: " + Math.round(dist) + " cm";
    }
}

function activateMeasuring() {
    //RAYCASTER
    raycaster = new THREE.Raycaster();
    if (document.getElementById("measureline").checked == true) {
        controls.enabled = false;
        document.addEventListener('mousedown', onDocumentMouseDownMeasure, false);
        document.addEventListener('mouseup', onDocumentMouseUpMeasure, false);
        document.addEventListener('mousemove', onDocumentMouseMoveMeasure, false);
        MEASURE = true;
        document.getElementById("moveObject").checked = false;

        if (objects != null) {
            objects.forEach(element => {
                element.material.opacity = 0.9;
            });
        }
    }
    else {
        controls.enabled = true;
        document.removeEventListener('mousemove', onDocumentMouseMoveMeasure, false);
        document.removeEventListener('mousedown', onDocumentMouseDownMeasure, false);
        document.removeEventListener('mouseup', onDocumentMouseUpMeasure, false);
        MEASURE = false;
        document.getElementById("length").innerHTML = "";
        if (objects != null) {
            objects.forEach(element => {
                element.material.opacity = 1;
            }); 5
        }
        if (line) {
            scene.remove(line);
            scene.remove(spherestart);
            scene.remove(sphereend);
        }

    }
}
