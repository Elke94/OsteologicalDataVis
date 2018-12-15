
var mouse = new THREE.Vector2(), INTERSECTED;

var followMouse = false;
var movableObject;
var canvas1, context1, texture1;
var sprite1;

var dragControls;
var renderer;
init()
function init() {

    //RAYCASTER
    raycaster = new THREE.Raycaster();
    /////// draw text on canvas /////////
    // create a canvas element
    canvas1 = document.createElement('canvas');
    context1 = canvas1.getContext('2d');
    // context1.canvas.width  = 2000;
    // context1.font = "20px Arial";
    // context1.fillStyle = "rgba(0,0,0,1)";
    context1.fillText('Hello, world!', 0, 20);

    texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;
    texture1.minFilter = THREE.LinearFilter;
    ////////////////////////////////////////

    var spriteMaterial = new THREE.SpriteMaterial({ map: texture1 });

    sprite1 = new THREE.Sprite(spriteMaterial);
    sprite1.renderOrder = 999;
    sprite1.onBeforeRender = function (renderer) { renderer.clearDepth(); };
    sprite1.scale.set(50, 25, 1.0);
    sprite1.position.set(10, 10, 10);
    scene.add(sprite1);
}

function moveObject() {
    if (document.getElementById("moveObject").checked == true) {
        dragControls.enabled = true;
        dragControls.addEventListener('dragstart', onDragStart,false);
        dragControls.addEventListener( 'dragend', onDragEnd,false);
       
        if (document.getElementById("measureline").checked) {
            document.getElementById("measureline").checked = false;
            activateMeasuring();
        }
        if(document.getElementById("ClippingOnAxis").checked)
        {
            document.getElementById("ClippingOnAxis").checked = false;
            clippingOnAxis();
        }

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        raycaster.setFromCamera(mouse, camera);
        // var intersects = raycaster.intersectObjects(objects);
        var intersects = raycaster.intersectObjects(hoverableObjects);


        if (intersects.length > 0) {

            context1.clearRect(0, 0, 800, 480);
            if(intersects[0].object.name == "Turbinate bones to warm air.")
            {
                intersects[0].object.material.opacity = 0.5;
                INTERSECTED = intersects[0].object;
            }
            else if(INTERSECTED)
                INTERSECTED.material.opacity =0.0;

            var message = intersects[0].object.name;
            var metrics = context1.measureText(message);
            var width = metrics.width;

            context1.font = "20px Arial";
            context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
            context1.fillRect(2, 2, width + 2, 30);
            context1.fillStyle = "rgba(0,0,0,1)"; // text color
            context1.fillText(message, 2, 20)

            texture1.minFilter = THREE.LinearFilter;
            texture1.needsUpdate = true;
        }
        else {
            context1.clearRect(0, 0, 800, 300);
            texture1.needsUpdate = true;
            if(INTERSECTED)
                INTERSECTED.material.opacity =0.0;
        }


    }
    else {
        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('mousedown', onDocumentMouseDown, false);
        document.removeEventListener('mouseup', onDocumentMouseUp, false);
        // dragControls.deactivate();
        dragControls.enabled = false;
        dragControls.removeEventListener('dragstart', onDragStart,false);
        dragControls.removeEventListener('dragend', onDragEnd,false);
    }
}


  
function onDocumentMouseMove(event) {
    // event.preventDefault();

    // spriteTeeth sprite position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.9).unproject(camera);

    sprite1.position.set(vector.x, vector.y, vector.z);

}
function onDocumentMouseUp(event) {
    controls.enabled = true;
}

function onDocumentMouseDown(event) {
    // event.preventDefault();

}

