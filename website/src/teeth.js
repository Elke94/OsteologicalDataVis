var spriteTeeth;
var canvas1, context1, texture1;
var mouse = new THREE.Vector2(), INTERSECTED;
var teethBox;

init()

function init()
{
    //RAYCASTER
    raycaster = new THREE.Raycaster();
  /////// draw text on canvas /////////
    // create a canvas element
    canvas1 = document.createElement('canvas');
    context1 = canvas1.getContext('2d');
    // context1.font = "20px Arial";
    // context1.fillStyle = "rgba(0,0,0,1)";
    context1.fillText('Hello, world!', 0, 20);

    texture1 = new THREE.Texture(canvas1)
    texture1.needsUpdate = true;

    ////////////////////////////////////////

    var spriteMaterial = new THREE.SpriteMaterial({ map: texture1, useScreenCoordinates: true });

   
    spriteTeeth = new THREE.Sprite(spriteMaterial);  
    spriteTeeth.renderOrder = 999;
    spriteTeeth.onBeforeRender = function( renderer ) { renderer.clearDepth(); }; 
    spriteTeeth.scale.set(50, 25, 1.0);
    spriteTeeth.position.set(10, 10, 10);
    scene.add(spriteTeeth);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
   
}

function onDocumentMouseMove(event) {
    //event.preventDefault();

    // update sprite position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0.9).unproject(camera);

    spriteTeeth.position.set(vector.x, vector.y, vector.z);

}

function updateTeeth()
{
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(teethBox);

    if (intersects.length > 0) {
        context1.clearRect(0, 0, 640, 480);

        var message = INTERSECTED.name;
        var metrics = context1.measureText(message);
        var width = metrics.width;

        context1.font = "20px Arial";
        context1.fillStyle = "rgba(255,255,255,0.95)"; // white filler
        context1.fillRect(2,2, width+2 , 30);
        context1.fillStyle = "rgba(0,0,0,1)"; // text color
        context1.fillText(message, 2, 20)
        texture1.needsUpdate = true;
    }
    else
    {
        INTERSECTED = null;
        context1.clearRect(0, 0, 300, 300);
        texture1.needsUpdate = true;
    }
}
