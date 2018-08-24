﻿var container, camera, scene, orbitControls, transformControls, renderer;

var chair, seat, seat_cushion, back, legs, arms
var seatX, seatY, seatZ, seat_cushionX, seat_cushionY, seat_cushionZ;
var seat_cushion_colour, legs_colour, greyColour, initialBackMat, initialCushMat;
var leg_group = new THREE.Object3D();

var transform = document.getElementById('transform');
var cushionCheck = document.getElementById('cushion');
var backCheck = document.getElementById('back');

var map;

init();
animate();

function init() {

    container = document.getElementById('container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(1.6, 2.17, -2.5);

    //LIGHTS
    var dir_light = new THREE.DirectionalLight(0xffffff, 1.2);
    dir_light.position.set(0, 0, 10);
    scene.add(dir_light);

    var dir_light2 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir_light2.position.set(0, -10, 0);
    scene.add(dir_light2);

    var dir_light3 = new THREE.PointLight(0xffffff, 1.2);
    dir_light3.position.set(10, 0, 0);
    scene.add(dir_light3);

    var dir_light4 = new THREE.DirectionalLight(0xffffff, 1.2);
    dir_light4.position.set(-10, 0, 0);
    scene.add(dir_light4);

    var ambient = new THREE.AmbientLight(0xffffff);
    scene.add(ambient);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ReinhardToneMapping;

    container.appendChild(renderer.domElement);

    var planeGeometry = new THREE.PlaneGeometry(10, 10);
    var planeMaterial = new THREE.ShadowMaterial({ color: 0xCCCCCC, opacity: 0.5 });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    scene.add(plane);

    spotLight = new THREE.SpotLight(0xffffff, 15, 100, 0.6, 1.5, 0.6); //colour, intensity, distance, angle, penumbra, decay
    spotLight.position.set(0, 5, -2);
    spotLight.target.position.set(0, 0, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.07;
    orbitControls.rotateSpeed = 0.07;
    //orbitControls.minDistance = 1.5; //Zoom closest distance
    orbitControls.maxDistance = 7; //Zoom furthest distance

    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', render);
    scene.add(transformControls);

    var textureLoader = new THREE.TextureLoader();
    var materialsArray = ['images/materials/black.jpg', 'images/materials/mosaic.jpg', 'images/materials/yellow.jpg',
                           'images/materials/fabrics/fabric1.jpg', 'images/materials/fabrics/fabric2.jpg',
                           'images/materials/fabrics/fabric3.jpg', 'images/materials/fabrics/fabric4.jpg',
                           'images/materials/fabrics/fabric5.jpg', 'images/materials/fabrics/fabric6.jpg',
                           'images/materials/fabrics/fabric7.jpg', 'images/materials/fabrics/fabric8.jpg',
                           'images/materials/fabrics/fabric9.jpg'];

    var mapArr = [];

    for (var i = 0; i < materialsArray.length; i++) {

        map = textureLoader.load(materialsArray[i]);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(2, 2);

        mapArr.push(map);
    }

    addMaterial("blackMat", mapArr[0]); addMaterial("mosaicMat", mapArr[1]);
    addMaterial("yellowMat", mapArr[2]); addMaterial("fabric1", mapArr[3]);
    addMaterial("fabric2", mapArr[4]); addMaterial("fabric3", mapArr[5]);
    addMaterial("fabric4", mapArr[6]); addMaterial("fabric5", mapArr[7]);
    addMaterial("fabric6", mapArr[8]); addMaterial("fabric7", mapArr[9]);
    addMaterial("fabric8", mapArr[10]); addMaterial("fabric9", mapArr[11]);

    var loader = new THREE.GLTFLoader();
    loader.load('gltf/Chair/chair.gltf', function (gltf) {

        chair = gltf.scene;
        console.log(chair);

        chair.traverse(function (child) {
            if (child instanceof THREE.Mesh) {

                if (child.material) {

                    child.material.side = THREE.DoubleSide;
                }

                // child.castShadow = true;
            }
        });

        //Chair model parts
        seat_cushion = chair.getObjectByName('Seat_cushion');
        seat = chair.getObjectByName('Seat');
        back = chair.getObjectByName('Back');
        legs = chair.getObjectByName('Legs');
        arms = chair.getObjectByName('Arms');

        initialBackMat = back.material;
        initialCushMat = seat_cushion.material;

        seat_cushion_colour = seat_cushion.material.color.getHex();
        greyColour = back.material.color.getHex();
        legs_colour = legs.material.color.getHex();

        //Get initial values for seat and seat cushion for resetting (as their position is not at 0, 0, 0)
        seatX = seat.position.x; seatY = seat.position.y; seatZ = seat.position.z;
        seat_cushionX = seat_cushion.position.x; seat_cushionY = seat_cushion.position.y; seat_cushionZ = seat_cushion.position.z;

        //Add front and back leg studs to group container, in order to move legs as a whole, when transforming
        var front_studs = chair.getObjectByName('Front_leg_studs');
        var back_studs = chair.getObjectByName('Back_leg_studs');
        leg_group.add(legs);
        leg_group.add(front_studs);
        leg_group.add(back_studs);
        chair.add(leg_group);

        chair.position.set(0, 0, 0);
        scene.add(chair);

    });

    $('#colourReset').on('click', function () {
        seat_cushion.material.color.set(seat_cushion_colour);
        legs.material.color.set(legs_colour); seat.material.color.set(greyColour);
        back.material.color.set(greyColour); arms.material.color.set(greyColour);
    });

    $('#transformReset').on('click', function () {
        //reset controls
        transform.checked = false;
        transformControls.detach(scene);

        //reset all chair object positions, scales, rotations and camera to initial values
        chair.position.set(0, 0, 0); chair.scale.set(1, 1, 1); chair.rotation.set(0, 0, 0);
        leg_group.position.set(0, 0, 0); leg_group.scale.set(1, 1, 1); leg_group.rotation.set(0, 0, 0);

        seat_cushion.position.set(seat_cushionX, seat_cushionY, seat_cushionZ);
        seat_cushion.scale.set(1, 1, 1); seat_cushion.rotation.set(0, 0, 0);
        seat.position.set(seatX, seatY, seatZ); seat.scale.set(1, 1, 1); seat.rotation.set(0, 0, 0);

        back.position.set(0, 0.0074, 0); back.scale.set(1, 1, 1); back.rotation.set(0, 0, 0);
        arms.position.set(0, 0.0074, 0); arms.scale.set(1, 1, 1); arms.rotation.set(0, 0, 0);

        camera.position.set(1.6, 2.17, -2.5);
    });

    $('#resetMaterial').on('click', function () {
        back.material = initialBackMat;
        seat_cushion.material = initialCushMat;
    });

    transformControls.addEventListener('mouseDown', function () {
        orbitControls.enabled = false;
    });
    transformControls.addEventListener('mouseUp', function () {
        orbitControls.enabled = true;
    });

    $("input:radio[name=transformMode]").click(function () {

        var mode = $("input:radio[name=transformMode]:checked").val();
        switch (mode) {

            case 'translate':
                transformControls.setMode("translate");
                break;

            case 'rotate':
                transformControls.setMode("rotate");
                break;

            case 'scale':
                transformControls.setMode("scale");
                break;
        }
    });

    window.addEventListener('resize', onWindowResize, false);
}

function showGizmo() {

    var select = document.getElementById("gizmo");
    var attachBox = document.getElementById("transformAttach");

    transform.checked = false;
    attachBox.style.display = "block";

    switch (select.value) {

        case 'chair':
            transformChange(chair);
            break;

        case 'legs':
            transformChange(leg_group);
            break;

        case 'arms':
            transformChange(arms);
            break;

        case 'seat_cushion':
            transformChange(seat_cushion);
            break;

        case 'seat':
            transformChange(seat);
            break;

        case 'back':
            transformChange(back);
            break;
    }

}

function transformChange(mod_part) {

    $('#transform').on('change', function () {
        if (transform.checked) {
            transformControls.attach(mod_part);
        } else {
            transformControls.detach(scene);
        }
    });
}


function addMaterial(id, map) {

    var el = document.getElementById(id);
    var backMaterial = new THREE.MeshStandardMaterial({ map: map });
    var cushionMaterial = new THREE.MeshStandardMaterial({ map: map });

    el.addEventListener('click', function () {

        var modelPart = document.querySelector('input[name = "mat"]:checked');

        if (modelPart.value == 'back') {
            back.material = backMaterial;
            back.material.needsUpdate = true;
        }
        else {
            if (modelPart.value == 'cushion') {
                seat_cushion.material = cushionMaterial;
                seat_cushion.needsUpdate = true;
            }
        }

    });
}

$(document).ready(function () {

    $('#colour, #closeColour').click(function (e) {
        e.preventDefault();
        $('#colour_box').toggle('slow');
    });

    $('#transformBtn, #closeTransform').click(function (e) {
        e.preventDefault();
        $('#transform_box').toggle('slow');
    });

    $('#materialsBtn').click(function (e) {
        e.preventDefault();
        $('#materials_panel').toggle('slow');
    });

    $("#colour_box").draggable();
    $("#transform_box").draggable();

});

function showPicker() {

    var select = document.getElementById("model_parts");
    var colPick = document.getElementById("colourChange");

    colPick.style.display = "block";

    switch (select.value) {

        case 'legs':
            colourChange(legs);
            break;

        case 'arms':
            colourChange(arms);
            break;

        case 'seat_cushion':
            colourChange(seat_cushion);
            break;

        case 'seat':
            colourChange(seat);
            break;

        case 'back':
            colourChange(back);
            break;
    }

}

function colourChange(mod_part) {

    $(".col_select").spectrum({
        change: function (color) {
            $("#basic_log").text("Hex Colour Selected: " + color.toHexString()); //Log information
            var col_value = $(".col_select").spectrum('get').toHexString(); //Get the colour selected
            mod_part.material.color.set(col_value);
        }
    });
}

//EXPORT GLTF
var link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename || 'data.json';
    link.click();
}

function saveString(text, filename) {

    save(new Blob([text], { type: 'text/plain' }), filename);
}

document.getElementById('export').addEventListener('click', function () {

    var exportConfirm = confirm("Export model and current settings to .glTF format?");

    if (chair !== undefined) {

        if (exportConfirm) {

            var exporter = new THREE.GLTFExporter();

            exporter.parse(chair, function (result) {

                saveString(JSON.stringify(result, null, 2), 'chair.gltf');

            });
        }

    }
});
//END EXPORT GLTF

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);
    render();
    orbitControls.update();
    transformControls.update();
}

function render() {

    renderer.render(scene, camera);
}