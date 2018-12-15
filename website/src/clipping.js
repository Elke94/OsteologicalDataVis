var n = -1;
var sliderClip;
var planePos = 0;
var clipAxis = -1; //X-Axis
// setup clipping plane 

function clippingOnAxis() {

    if (document.getElementById("ClippingOnAxis").checked == true) {
       
        document.getElementById("moveObject").checked  = false;
        moveObjectActivate();
        var onAxis = -1;
        var planes = [];
        document.getElementById("clippingPlaneAxis").style.display = "block";
        var axis = document.getElementsByName("Axis");
        for (i = 0; i < axis.length; i++) {
            if (axis[i].checked) {
                var onAxis = i;
                break;
            }
        }
        switch (onAxis) {
            case 0:
                if (clipAxis != 0) {
                    var max = Number.MIN_VALUE;
                    var min = Number.MAX_VALUE;
                    objects.forEach(element => {
                        const boundingBox = new THREE.Box3();
                        var size = boundingBox.setFromObject(element);
                        if(size.max.x > max) max = size.max.x;
                        if(size.min.x < min) min = size.min.x;
                    });
                    // set min and max values of slider, caution because the bbox is not at the position of the skull
                    sliderClip.max = max + (0.01 * Math.sqrt(max * max)) - (min + max) / 2;
                    sliderClip.min = min - (0.01 * Math.sqrt(min * min)) - (min + max) / 2;

                    // sliderClip.value = (sliderClip.max + sliderClip.min) / 2;
                    sliderClip.value = 1;
                    planePos = sliderClip.value;
                }
                clipAxis = 0;
                planes = setPlaneXAxis();
                break;
            case 1:
                if (clipAxis != 1) {
                    var max = Number.MIN_VALUE;
                    var min = Number.MAX_VALUE;
                    objects.forEach(element => {
                        const boundingBox = new THREE.Box3();
                        var size = boundingBox.setFromObject(element);
                        if(size.max.y > max) max = size.max.y;
                        if(size.min.y < min) min = size.min.y;
                    });
                    // set min and max values of slider, caution because the bbox is not at the position of the skull
                    sliderClip.max = max + (0.01 * Math.sqrt(max * max)) - (min + max) / 2;
                    sliderClip.min = min - (0.01 * Math.sqrt(min * min)) - (min + max) / 2;

                    sliderClip.value = (sliderClip.max + sliderClip.min) / 2;
                    planePos = sliderClip.value;
                }
                clipAxis = 1;
                planes = setPlaneYAxis();
                break;
            case 2:
                if (clipAxis != 2) {
                    var max = Number.MIN_VALUE;
                    var min = Number.MAX_VALUE;
                    objects.forEach(element => {
                        const boundingBox = new THREE.Box3();
                        var size = boundingBox.setFromObject(element);
                        if(size.max.z > max) max = size.max.z;
                        if(size.min.z < min) min = size.min.z ;
                    });
                    // set min and max values of slider, caution because the bbox is not at the position of the skull
                    sliderClip.max = max + (0.01 * Math.sqrt(max * max)) - (min + max) / 2;
                    sliderClip.min = min - (0.01 * Math.sqrt(min * min)) - (min + max) / 2;

                    sliderClip.value = (sliderClip.max + sliderClip.min) / 2;
                    planePos = sliderClip.value;
                }
                clipAxis = 2;
                planes = setPlaneZAxis();
                break;
            default:
                text = "I have never heard of that fruit...";
        }

        var clipPlanes = [];
        planes.forEach(element => {
            // compute size of clipping plane
            var planeClippingOnAxis = new THREE.Plane();
            normal.set(0, 0, n).applyQuaternion(element.quaternion);
            point.copy(element.position);
            planeClippingOnAxis.setFromNormalAndCoplanarPoint(normal, point);
            clipPlanes.push(planeClippingOnAxis);
           
        });
      
        for(var i = 0; i < objects.length; i++)
        {  
            // clear the draw buffers
            renderer.clear();
            objects[i].material.clippingPlanes = [] ; 
            objects[i].material.clippingPlanes.push( clipPlanes[i] );      
            renderer.render(scene, camera);    
        }
      
        renderer.localClippingEnabled = true;
    }
    else {
        renderer.localClippingEnabled = false;
        renderer.clippingPlanes = [];
        document.getElementById("clippingPlaneAxis").style.display = "none";
    }
}

function setPlaneYAxis() {

    var planes = [];
    objects.forEach(element => {
      
        const boundingBox = new THREE.Box3();
        var box = boundingBox.setFromObject(element); 
        var sizeX = Math.sqrt(box.min.x * box.min.x) + Math.sqrt(box.max.x * box.max.x);
        var sizeY = Math.sqrt(box.min.y * box.min.y) + Math.sqrt(box.max.y * box.max.y);

        // setup clipping plane
        var geometryPlane = new THREE.PlaneGeometry(sizeX, sizeY, 0);
        var materialPlane = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide,opacity: 0 });
      
        var position = box.getCenter();
        planeMesh = new THREE.Mesh(geometryPlane, materialPlane);
        planeMesh.position.set(0, parseFloat(position.y+planePos), 0);
        planeMesh.rotation.x = Math.PI / 2; //mesh.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
        planes.push(planeMesh);      
       
    });

    return planes;
}
function setPlaneXAxis() {

    var planes = [];
    objects.forEach(element => {
      
        const boundingBox = new THREE.Box3();
        var box = boundingBox.setFromObject(element);
        var sizeX = Math.sqrt(box.min.x * box.min.x) + Math.sqrt(box.max.x * box.max.x);
        var sizeY = Math.sqrt(box.min.y * box.min.y) + Math.sqrt(box.max.y * box.max.y);

        // setup clipping plane
        var geometryPlane = new THREE.PlaneGeometry(sizeX, sizeY, 0);
        var materialPlane = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide ,  transparent: true, opacity:0.0 });
      
        var position = box.getCenter();
        planeMesh = new THREE.Mesh(geometryPlane, materialPlane);
        planeMesh.position.set(parseFloat(position.x+planePos), 0, 0);
        planeMesh.rotation.y = Math.PI / 2; //mesh.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
       
        planes.push(planeMesh);
    });
 
    return planes;
}
function setPlaneZAxis() {


    var planes = [];
    objects.forEach(element => {
        const boundingBox = new THREE.Box3();
        var box = boundingBox.setFromObject(element);
        var sizeX = Math.sqrt(box.min.x * box.min.x) + Math.sqrt(box.max.x * box.max.x);
        var sizeY = Math.sqrt(box.min.y * box.min.y) + Math.sqrt(box.max.y * box.max.y);

        // setup clipping plane
        var position = box.getCenter();
        var geometryPlane = new THREE.PlaneGeometry(sizeX, sizeY, 0);
        var materialPlane = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide,opacity: 0 });
        planeMesh = new THREE.Mesh(geometryPlane, materialPlane);
        planeMesh.position.set(0, 0, parseFloat(position.z+planePos));
        planeMesh.rotation.z = Math.PI / 2; //mesh.rotation.set(new THREE.Vector3( 0, 0, Math.PI / 2));
     
        planes.push(planeMesh);
    });
  
    return planes;
}

$('#invertClip').click(function () {
    n = (-1) * n;
    clippingOnAxis();
});

sliderClip.oninput = function () {
    planePos = parseFloat(this.value);
    clippingOnAxis();
}
