if (!Detector.webgl) Detector.addGetWebGLMessage();

var container,
    stats,
    camera,
    controls,
    scene,
    renderer,
    gui,
    container2,
    renderer2,
    camera2,
    axes2,
    scene2;
init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1e10);
    camera.position.z = 300;



    scene = new THREE.Scene();

    scene.add(camera);

    // light

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();

    camera.add(dirLight);
    camera.add(dirLight.target);

    var loader = new THREE.NRRDLoader();
    loader.load("models/2Head06H80s.nrrd", function (volume) {
        var geometry,
            material,
            sliceZ,
            sliceY,
            sliceX;

        //box helper to see the extend of the volume
        var geometry = new THREE.BoxBufferGeometry(volume.xLength, volume.yLength, volume.zLength);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        cube.visible = false;
        var box = new THREE.BoxHelper(cube);
        scene.add(box);
        box.applyMatrix(volume.matrix);
        scene.add(cube);

        //z plane
        sliceZ = volume.extractSlice('z', Math.floor(volume.RASDimensions[2] / 4));
        scene.add(sliceZ.mesh);

        //y plane
        sliceY = volume.extractSlice('y', Math.floor(volume.RASDimensions[1] / 2));
        scene.add(sliceY.mesh);

        //x plane
        sliceX = volume.extractSlice('x', Math.floor(volume.RASDimensions[0] / 2));
        scene.add(sliceX.mesh);

        gui.add(sliceX, "index", 0, volume.RASDimensions[0], 1).name("indexX").onChange(function () { sliceX.repaint.call(sliceX); });
        gui.add(sliceY, "index", 0, volume.RASDimensions[1], 1).name("indexY").onChange(function () { sliceY.repaint.call(sliceY); });
        gui.add(sliceZ, "index", 0, volume.RASDimensions[2], 1).name("indexZ").onChange(function () { sliceZ.repaint.call(sliceZ); });

        gui.add(volume, "lowerThreshold", volume.min, volume.max, 1).name("Lower Threshold").onChange(function () {
            volume.repaintAllSlices();
        });
        gui.add(volume, "upperThreshold", volume.min, volume.max, 1).name("Upper Threshold").onChange(function () {
            volume.repaintAllSlices();
        });
        gui.add(volume, "windowLow", volume.min, volume.max, 1).name("Window Low").onChange(function () {
            volume.repaintAllSlices();
        });
        gui.add(volume, "windowHigh", volume.min, volume.max, 1).name("Window High").onChange(function () {
            volume.repaintAllSlices();
        });

    });

    var vtkmaterial = new THREE.MeshLambertMaterial({ wireframe: false, morphTargets: false, side: THREE.DoubleSide, color: 0xff0000 });

    var vtkloader = new THREE.VTKLoader();
    // vtkloader.load( "models/vtk/liver.vtk", function ( geometry ) {

    // 	geometry.computeVertexNormals();

    // 	var mesh = new THREE.Mesh( geometry, vtkmaterial );
    // 	scene.add( mesh );
    // 	var visibilityControl = {
    // 		visible : true
    // 	};
    // 	gui.add(visibilityControl, "visible").name( "Model Visible").onChange( function () {
    // 		mesh.visible = visibilityControl.visible;
    // 		renderer.render( scene, camera );
    // 	});

    // } );
    // renderer

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    stats = new Stats();
    container.appendChild(stats.dom);

    var gui = new dat.GUI();

    setupInset();

    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();

}

function animate() {

    requestAnimationFrame(animate);

    controls.update();

    //copy position of the camera into inset
    camera2.position.copy(camera.position);
    camera2.position.sub(controls.target);
    camera2.position.setLength(300);
    camera2.lookAt(scene2.position);

    renderer.render(scene, camera);
    renderer2.render(scene2, camera2);

    stats.update();

}

function rotateAroundWorldAxis(object, axis, radians) {
    var rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    object.applyMatrix(rotWorldMatrix);

}

function setupInset() {
    var insetWidth = 150,
        insetHeight = 150;
    container2 = document.getElementById('inset');
    container2.width = insetWidth;
    container2.height = insetHeight;

    // renderer
    renderer2 = new THREE.WebGLRenderer({ alpha: true });
    renderer2.setClearColor(0x000000, 0);
    renderer2.setSize(insetWidth, insetHeight);
    container2.appendChild(renderer2.domElement);

    // scene
    scene2 = new THREE.Scene();

    // camera
    camera2 = new THREE.PerspectiveCamera(50, insetWidth / insetHeight, 1, 1000);
    camera2.up = camera.up; // important!

    // axes
    axes2 = new THREE.AxesHelper(100);
    scene2.add(axes2);
}
