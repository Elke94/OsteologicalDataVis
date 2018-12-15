if (!Detector.webgl) Detector.addGetWebGLMessage();

var container,
    stats,
    camera,
    controls,
    scene,
    renderer;
var MARGIN = 0;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

var mesh, texture, geometry, materials, material, current_material;
var light, pointLight, ambientLight;
var effect, resolution;
var composer, effectFXAA, hblur, vblur;
var effectController;


var clock = new THREE.Clock();
var time;
var objects = [];
var wX,wY;
init();

function init() {
    container = document.getElementById('container');

    effectController = {
        material: "shiny",
        speed: 1.0,
        numBlobs: 10,
        resolution: 28,
        isolation: -50,
        floor: true,
        wallx: false,
        wallz: false,
        hue: 0.0,
        saturation: 0.8,
        lightness: 0.1,
        lhue: 0.04,
        lsaturation: 1.0,
        llightness: 0.5,
        lx: 0.5,
        ly: 0.5,
        lz: 1.0,
        postprocessing: false,
        dummy: function () {
        }
    };
    // CAMERA
    camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
    camera.position.set(-50, 50, 150);
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    // LIGHTS
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0.5, 0.5, 1);
    scene.add(light);
    pointLight = new THREE.PointLight(0xff3300);
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);
    ambientLight = new THREE.AmbientLight(0x080808);
    scene.add(ambientLight);
    // AXIS
    // var axesHelper = new THREE.AxesHelper(100);
    // scene.add(axesHelper);
    // MATERIALS
    materials = generateMaterials();
    current_material = "shiny";
    // GUI
    setupGui();
    // LOADER
    var loader = new THREE.NRRDLoader();
    loader.load("models/2Head06H80s.nrrd", function (volume) {
        var geometry,
            material;
        this.volume1 = volume;
        //box helper to see the extend of the volume
        var geometry = new THREE.BoxBufferGeometry(volume.xLength, volume.yLength, volume.zLength);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);
        cube.visible = false;


        animate();


    });
    var loaderSTL = new THREE.STLLoader();

    // var material = new THREE.MeshPhongMaterial({ color: 0xF1C232, specular: 0x111111, shininess: 200 });
    loaderSTL.load('./models/magpie_smooth.stl', function (geometry) {

        geometry.computeBoundingBox();
        var bbox = geometry.boundingBox;
        var x = -(bbox.min.x + bbox.max.x) / 2;
        var y = -(bbox.min.y + bbox.max.y) / 2;
        var z = -(bbox.min.z + bbox.max.z) / 2;
        var sizeX = Math.sqrt(bbox.min.x * bbox.min.x) + Math.sqrt(bbox.max.x * bbox.max.x);
        var sizeY = Math.sqrt(bbox.min.y * bbox.min.y) + Math.sqrt(bbox.max.y * bbox.max.y);

        var geometryPlane = new THREE.PlaneGeometry(sizeX, sizeY, 0);
        var materialPlane = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
        var planeMesh = new THREE.Mesh(geometryPlane, materialPlane);

        planeMesh.position.set(0, 0, -2);
        var plane = new THREE.Plane();
        var normal = new THREE.Vector3();
        var point = new THREE.Vector3();

        normal.set(0, 0, 1).applyQuaternion(planeMesh.quaternion);

        point.copy(planeMesh.position);

        plane.setFromNormalAndCoplanarPoint(normal, point);

        var geo = new THREE.EdgesGeometry(geometryPlane); // or WireframeGeometry( geometry )

        var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });

        var wireframe = new THREE.LineSegments(geo, mat);
        wireframe.position.set(0, 0, -2);
       wX= wireframe.position.x;
       wY= wireframe.position.y;
        scene.add(wireframe);
        objects.push(wireframe);

        // Geometry
        var material = new THREE.MeshPhongMaterial({
            color: 0x80ee10,
            shininess: 100,
            side: THREE.DoubleSide,
            // ***** Clipping setup (material): *****
            clippingPlanes: [plane],
            clipShadows: true
        });

        var mesh = new THREE.Mesh(geometry, material);

        mesh.scale.set(1, 1, 1);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        mesh.position.set(x, y, z);

        var geometryLine = new THREE.Geometry();
        geometryLine.vertices.push(
            new THREE.Vector3(0, 0, bbox.min.z),
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, bbox.max.z)
        );

        var line = new THREE.Line(geometryLine, mat);
        scene.add(line);
        var dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        // dragControls.constrains(xy);
        dragControls.addEventListener('dragstart', function (event) { controls.enabled = false; });
        dragControls.addEventListener('dragend',
            function (event) {
                wireframe.position.set(wX,wY,wireframe.position.z);
                planeMesh.position.set(0,0, wireframe.position.z);
                point.copy(planeMesh.position);

                plane.setFromNormalAndCoplanarPoint(normal, point);

                controls.enabled = true;
            });
    });

    //MARCHING CUBES
    resolution = 1;
    effect = new THREE.MarchingCubes(resolution, materials[current_material].m, true, true);
    effect.position.set(0, 0, 0);
    effect.scale.set(700, 700, 700);
    effect.enableUvs = false;
    effect.enableColors = false;
    scene.add(effect);
    // RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = MARGIN + "px";
    renderer.domElement.style.left = "0px";
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);
    //
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    // STATS
    stats = new Stats();
    container.appendChild(stats.dom);
    // EVENTS
    window.addEventListener('resize', onWindowResize, false);
}
//
function setupGui() {
    var createHandler = function (id) {
        return function () {
            var mat_old = materials[current_material];
            mat_old.h = m_h.getValue();
            mat_old.s = m_s.getValue();
            mat_old.l = m_l.getValue();
            current_material = id;
            var mat = materials[id];
            effect.material = mat.m;
            m_h.setValue(mat.h);
            m_s.setValue(mat.s);
            m_l.setValue(mat.l);
            effect.enableUvs = (current_material === "textured") ? true : false;
            effect.enableColors = (current_material === "colors") ? true : false;
        };
    };
    effectController = {
        material: "shiny",
        speed: 1.0,
        numBlobs: 10,
        resolution: 28,
        isolation: -50,
        floor: true,
        wallx: false,
        wallz: false,
        hue: 0.0,
        saturation: 0.8,
        lightness: 0.1,
        lhue: 0.04,
        lsaturation: 1.0,
        llightness: 0.5,
        lx: 0.5,
        ly: 0.5,
        lz: 1.0,
        postprocessing: false,
        dummy: function () {
        }
    };
    var h, m_h, m_s, m_l;
    var gui = new dat.GUI();
    // material (type)
    h = gui.addFolder("Materials");
    for (var m in materials) {
        effectController[m] = createHandler(m);
        h.add(effectController, m).name(m);
    }
    // material (color)
    h = gui.addFolder("Material color");
    m_h = h.add(effectController, "hue", 0.0, 1.0, 0.025);
    m_s = h.add(effectController, "saturation", 0.0, 1.0, 0.025);
    m_l = h.add(effectController, "lightness", 0.0, 1.0, 0.025);
    // light (point)
    h = gui.addFolder("Point light color");
    h.add(effectController, "lhue", 0.0, 1.0, 0.025).name("hue");
    h.add(effectController, "lsaturation", 0.0, 1.0, 0.025).name("saturation");
    h.add(effectController, "llightness", 0.0, 1.0, 0.025).name("lightness");
    // light (directional)
    h = gui.addFolder("Directional light orientation");
    h.add(effectController, "lx", -1.0, 1.0, 0.025).name("x");
    h.add(effectController, "ly", -1.0, 1.0, 0.025).name("y");
    h.add(effectController, "lz", -1.0, 1.0, 0.025).name("z");
    // simulation
    h = gui.addFolder("Simulation");
    h.add(effectController, "speed", 0.1, 8.0, 0.05);
    h.add(effectController, "numBlobs", 1, 50, 1);
    h.add(effectController, "resolution", 0, 100, 1);
    h.add(effectController, "isolation", -1000, 500, 1);
    h.add(effectController, "floor");
    h.add(effectController, "wallx");
    h.add(effectController, "wallz");
    // rendering
    h = gui.addFolder("Rendering");
    h.add(effectController, "postprocessing");
}
//
function onWindowResize(event) {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    // hblur.uniforms[ 'h' ].value = 4 / SCREEN_WIDTH;
    // vblur.uniforms[ 'v' ].value = 4 / SCREEN_HEIGHT;
    // effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );
}
function generateMaterials() {
    // environment map
    var path = "textures/cube/SwedishRoyalCastle/";
    var format = '.jpg';
    var urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    var cubeTextureLoader = new THREE.CubeTextureLoader();
    var reflectionCube = cubeTextureLoader.load(urls);
    reflectionCube.format = THREE.RGBFormat;
    var refractionCube = cubeTextureLoader.load(urls);
    reflectionCube.format = THREE.RGBFormat;
    refractionCube.mapping = THREE.CubeRefractionMapping;
    // toons
    var toonMaterial1 = createShaderMaterial("toon1", light, ambientLight),
        toonMaterial2 = createShaderMaterial("toon2", light, ambientLight),
        hatchingMaterial = createShaderMaterial("hatching", light, ambientLight),
        hatchingMaterial2 = createShaderMaterial("hatching", light, ambientLight),
        dottedMaterial = createShaderMaterial("dotted", light, ambientLight),
        dottedMaterial2 = createShaderMaterial("dotted", light, ambientLight);
    hatchingMaterial2.uniforms.uBaseColor.value.setRGB(0, 0, 0);
    hatchingMaterial2.uniforms.uLineColor1.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor2.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor3.value.setHSL(0, 0.8, 0.5);
    hatchingMaterial2.uniforms.uLineColor4.value.setHSL(0.1, 0.8, 0.5);
    dottedMaterial2.uniforms.uBaseColor.value.setRGB(0, 0, 0);
    dottedMaterial2.uniforms.uLineColor1.value.setHSL(0.05, 1.0, 0.5);
    var texture = new THREE.TextureLoader().load("textures/UV_Grid_Sm.jpg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    var materials = {
        "chrome":
        {
            m: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: reflectionCube }),
            h: 0, s: 0, l: 1
        },
        "liquid":
        {
            m: new THREE.MeshLambertMaterial({ color: 0xffffff, envMap: refractionCube, refractionRatio: 0.85 }),
            h: 0, s: 0, l: 1
        },
        "shiny":
        {
            m: new THREE.MeshStandardMaterial({ color: 0x550000, envMap: reflectionCube, roughness: 0.1, metalness: 1.0 }),
            h: 0, s: 0.8, l: 0.2
        },
        "matte":
        {
            m: new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x111111, shininess: 1 }),
            h: 0, s: 0, l: 1
        },
        "flat":
        {
            m: new THREE.MeshLambertMaterial({ color: 0x000000, flatShading: true }),
            h: 0, s: 0, l: 1
        },
        "textured":
        {
            m: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x111111, shininess: 1, map: texture }),
            h: 0, s: 0, l: 1
        },
        "colors":
        {
            m: new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0xffffff, shininess: 2, vertexColors: THREE.VertexColors }),
            h: 0, s: 0, l: 1
        },
        "plastic":
        {
            m: new THREE.MeshPhongMaterial({ color: 0x000000, specular: 0x888888, shininess: 250 }),
            h: 0.6, s: 0.8, l: 0.1
        },
        "toon1":
        {
            m: toonMaterial1,
            h: 0.2, s: 1, l: 0.75
        },
        "toon2":
        {
            m: toonMaterial2,
            h: 0.4, s: 1, l: 0.75
        },
        "hatching":
        {
            m: hatchingMaterial,
            h: 0.2, s: 1, l: 0.9
        },
        "hatching2":
        {
            m: hatchingMaterial2,
            h: 0.0, s: 0.8, l: 0.5
        },
        "dotted":
        {
            m: dottedMaterial,
            h: 0.2, s: 1, l: 0.9
        },
        "dotted2":
        {
            m: dottedMaterial2,
            h: 0.1, s: 1, l: 0.5
        }
    };
    return materials;
}
function createShaderMaterial(id, light, ambientLight) {
    var shader = THREE.ShaderToon[id];
    var u = THREE.UniformsUtils.clone(shader.uniforms);
    var vs = shader.vertexShader;
    var fs = shader.fragmentShader;
    var material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: fs });
    material.uniforms.uDirLightPos.value = light.position;
    material.uniforms.uDirLightColor.value = light.color;
    material.uniforms.uAmbientLightColor.value = ambientLight.color;
    return material;
}

// this controls content of marching cubes voxel field
function updateCubes(object, time, numblobs, floor, wallx, wallz) {
    object.reset();
    // object.addVolume(this.volume1);

    // if ( floor ) object.addPlaneY( 2, 12 );
    // if ( wallz ) object.addPlaneZ( 2, 12 );
    // if ( wallx ) object.addPlaneX( 2, 12 );
}
//
function animate() {
    requestAnimationFrame(animate);
    render();
    stats.update();
}
function render() {
    var delta = clock.getDelta();
    time += delta * effectController.speed * 0.5;
    // marching cubes
    if (effectController.resolution !== resolution) {
        resolution = effectController.resolution;
        effect.init(Math.floor(resolution));
    }
    if (effectController.isolation !== effect.isolation) {
        effect.isolation = effectController.isolation;
    }
    //updateCubes(effect, time, effectController.numBlobs, effectController.floor, effectController.wallx, effectController.wallz);
    // materials
    if (effect.material instanceof THREE.ShaderMaterial) {
        if (current_material === "dotted2") {
            effect.material.uniforms.uLineColor1.value.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
        } else if (current_material === "hatching2") {
            var u = effect.material.uniforms;
            u.uLineColor1.value.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
            u.uLineColor2.value.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
            u.uLineColor3.value.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
            u.uLineColor4.value.setHSL((effectController.hue + 0.2 % 1.0), effectController.saturation, effectController.lightness);
        } else {
            effect.material.uniforms.uBaseColor.value.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
        }
    } else {
        effect.material.color.setHSL(effectController.hue, effectController.saturation, effectController.lightness);
    }
    // lights
    light.position.set(effectController.lx, effectController.ly, effectController.lz);
    light.position.normalize();
    pointLight.color.setHSL(effectController.lhue, effectController.lsaturation, effectController.llightness);
    // render
    // if ( effectController.postprocessing ) {
    //     composer.render( delta );
    // } else {
    renderer.clear();
    renderer.render(scene, camera);
    // }
}