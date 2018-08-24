var main = {
    scene: null, camera: null, renderer: null, container: null, orbitControls: null, transformControls: null,
    chair: null, seat: null, seat_cushion: null, legs: null, back: null, arms: null,
    seatX: null, seatY: null, seatZ: null, seat_cushionX: null, seat_cushionY: null, seat_cushionZ: null,
    seat_cushion_colour: null, legs_colour: null, greyColour: null, initialBackMat: null, initialCushMat: null,
    map: null,

    leg_group: new THREE.Object3D(),
    transform: document.getElementById('transform'),
    cushionCheck: document.getElementById('cushion'),
    backCheck: document.getElementById('back'),
    textureLoader: new THREE.TextureLoader(),
    materialsArray: [ 'images/materials/black.jpg','images/materials/mosaic.jpg', 'images/materials/yellow.jpg',
                                   'images/materials/fabrics/fabric1.jpg', 'images/materials/fabrics/fabric2.jpg',
                                   'images/materials/fabrics/fabric3.jpg', 'images/materials/fabrics/fabric4.jpg',
                                   'images/materials/fabrics/fabric5.jpg', 'images/materials/fabrics/fabric6.jpg',
                                   'images/materials/fabrics/fabric7.jpg', 'images/materials/fabrics/fabric8.jpg',
                                   'images/materials/fabrics/fabric9.jpg'],
     mapArr: [],

     init: function () {

        this.container = document.getElementById('container');

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(1.6, 2.17, -2.5);

        var dir_light = new THREE.DirectionalLight(0xffffff, 1.2);
        dir_light.position.set(0, 0, 10);
        this.scene.add(dir_light);

        var dir_light2 = new THREE.DirectionalLight(0xffffff, 1.2);
        dir_light2.position.set(0, -10, 0);
        this.scene.add(dir_light2);

        var dir_light3 = new THREE.PointLight(0xffffff, 1.2);
        dir_light3.position.set(10, 0, 0);
        this.scene.add(dir_light3);

        var dir_light4 = new THREE.DirectionalLight(0xffffff, 1.2);
        dir_light4.position.set(-10, 0, 0);
        this.scene.add(dir_light4);

        spotLight = new THREE.SpotLight(0xffffff, 15, 100, 0.6, 1.5, 0.6); //colour, intensity, distance, angle, penumbra, decay
        spotLight.position.set(0, 5, -2);
        spotLight.target.position.set(0, 0, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);

        var ambient = new THREE.AmbientLight(0xffffff);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;

        this.container.appendChild(this.renderer.domElement);

        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.07;
        this.orbitControls.rotateSpeed = 0.07;
        this.orbitControls.panSpeed = 0.07;
        this.orbitControls.maxDistance = 7; //Zoom furthest distance


        main.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
        main.transformControls.addEventListener('change', render);
        this.scene.add(main.transformControls);

        main.transformControls.addEventListener('mouseDown', function () {
            main.orbitControls.enabled = false;
        });
        main.transformControls.addEventListener('mouseUp', function () {
            main.orbitControls.enabled = true;
        });

        for (var i = 0; i < this.materialsArray.length; i++) {

            this.map = this.textureLoader.load(this.materialsArray[i]);
            this.map.wrapS = this.map.wrapT = THREE.RepeatWrapping;
            this.mapArr.push(this.map);
        }


        this.addMaterial("blackMat", this.mapArr[0]); this.addMaterial("mosaicMat", this.mapArr[1]);
        this.addMaterial("yellowMat", this.mapArr[2]); this.addMaterial("fabric1", this.mapArr[3]);
        this.addMaterial("fabric2", this.mapArr[4]); this.addMaterial("fabric3", this.mapArr[5]);
        this.addMaterial("fabric4", this.mapArr[6]); this.addMaterial("fabric5", this.mapArr[7]);
        this.addMaterial("fabric6", this.mapArr[8]); this.addMaterial("fabric7", this.mapArr[9]);
        this.addMaterial("fabric8", this.mapArr[10]); this.addMaterial("fabric9", this.mapArr[11]);


        // load chair
        this.loadChairGLTF();
        this.clickFunctions();
    },

    loadChairGLTF: function () {

        var loader = new THREE.GLTFLoader();
        loader.load('gltf/Chair/chair.gltf', function (gltf) {

            main.chair = gltf.scene;
            console.log(main.chair);

            main.chair.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    if (child.material) {

                        child.material.side = THREE.DoubleSide;
                    }
                }
            });

            //Chair model parts
            main.seat_cushion = main.chair.getObjectByName('Seat_cushion');
            main.seat = main.chair.getObjectByName('Seat');
            main.back = main.chair.getObjectByName('Back');
            main.legs = main.chair.getObjectByName('Legs');
            main.arms = main.chair.getObjectByName('Arms');

            main.initialBackMat = main.back.material;
            main.initialCushMat = main.seat_cushion.material;

            main.seat_cushion_colour = main.seat_cushion.material.color.getHex();
            main.greyColour = main.back.material.color.getHex();
            main.legs_colour = main.legs.material.color.getHex();

            //Get initial values for seat and seat cushion for resetting (as their position is not at 0, 0, 0)
            main.seatX = main.seat.position.x; main.seatY = main.seat.position.y; main.seatZ = main.seat.position.z;
            main.seat_cushionX = main.seat_cushion.position.x; main.seat_cushionY = main.seat_cushion.position.y;
            main.seat_cushionZ = main.seat_cushion.position.z;

            //Add front and back leg studs to group container, in order to move legs as a whole, when transforming
            var front_studs = main.chair.getObjectByName('Front_leg_studs');
            var back_studs = main.chair.getObjectByName('Back_leg_studs');
            main.leg_group.add(main.legs);
            main.leg_group.add(front_studs);
            main.leg_group.add(back_studs);
            main.chair.add(main.leg_group);
        
            main.chair.position.set(0, 0, 0);
            main.scene.add(main.chair);

        });

    },
    
    addMaterial: function(id, map) {

        var el = document.getElementById(id);
        var backMaterial = new THREE.MeshStandardMaterial({ map: map });
        var cushionMaterial = new THREE.MeshStandardMaterial({ map: map });

        el.addEventListener('click', function () {

            var backPart = document.getElementById('back');
            var cushionPart = document.getElementById('cushion');

            if (backPart.checked) {
                main.back.material = backMaterial;
                main.back.material.needsUpdate = true;
            }
            if (cushionPart.checked) {              
                main.seat_cushion.material = cushionMaterial;
                main.seat_cushion.needsUpdate = true;
            }
            else if (!backPart.checked && !cushionPart.checked) {
                alert("Please select either 'Back' or 'Cushion' to apply material")
            }
            
        });

    },

    clickFunctions: function () {

        document.getElementById('colourReset').addEventListener('click', function () {
            main.seat_cushion.material.color.set(main.seat_cushion_colour);
            main.legs.material.color.set(main.legs_colour); main.seat.material.color.set(main.greyColour);
            main.back.material.color.set(main.greyColour); main.arms.material.color.set(main.greyColour);
        });

        document.getElementById('transformReset').addEventListener('click', function () {
            //reset controls
            main.transform.checked = false;
            main.transformControls.detach(main.scene);

            //reset all chair object positions, scales, rotations and camera to initial values
            main.chair.position.set(0, 0, 0); main.chair.scale.set(1, 1, 1); main.chair.rotation.set(0, 0, 0);
            main.leg_group.position.set(0, 0, 0); main.leg_group.scale.set(1, 1, 1); main.leg_group.rotation.set(0, 0, 0);

            main.seat_cushion.position.set(main.seat_cushionX, main.seat_cushionY, main.seat_cushionZ);
            main.seat_cushion.scale.set(1, 1, 1); main.seat_cushion.rotation.set(0, 0, 0);
            main.seat.position.set(main.seatX, main.seatY, main.seatZ);
            main.seat.scale.set(1, 1, 1); main.seat.rotation.set(0, 0, 0);

            main.back.position.set(0, 0.0074, 0); main.back.scale.set(1, 1, 1); main.back.rotation.set(0, 0, 0);
            main.arms.position.set(0, 0.0074, 0); main.arms.scale.set(1, 1, 1); main.arms.rotation.set(0, 0, 0);

            main.camera.position.set(1.6, 2.17, -2.5);
        });

        document.getElementById('resetMaterial').addEventListener('click', function () {
            main.back.material = main.initialBackMat;
            main.seat_cushion.material = main.initialCushMat;
        });

        $("input:radio[name=transformMode]").click(function () {
            var mode = $("input:radio[name=transformMode]:checked").val();

            switch (mode) {

                case 'translate':
                    main.transformControls.setMode("translate");
                    break;

                case 'rotate':
                    main.transformControls.setMode("rotate");
                    break;

                case 'scale':
                    main.transformControls.setMode("scale");
                    break;
            }
        });


    },

    transformChange: function(mod_part) {

        $('#transform').on('change', function () {
            if (main.transform.checked) {
                main.transformControls.attach(mod_part);
            } else {
                main.transformControls.detach(main.scene);
            }
        });
    },

     showGizmo: function() {

        var select = document.getElementById("gizmo");
        var attachBox = document.getElementById("transformAttach");

        //reset controls each time model part is selected
        main.transform.checked = false;
        main.transformControls.detach(main.scene);
        attachBox.style.display = "block";

        switch (select.value) {

            case 'chair':
                main.transformChange(main.chair);
                break;

            case 'legs':
                main.transformChange(main.leg_group);
                break;

            case 'arms':
                main.transformChange(main.arms);
                break;

            case 'seat_cushion':
                main.transformChange(main.seat_cushion);
                break;

            case 'seat':
                main.transformChange(main.seat);
                break;

            case 'back':
                main.transformChange(main.back);
                break;
        }

     },
    
     colourChange: function(mod_part) {

            $(".col_select").spectrum({
                change: function (color) {
                    $("#basic_log").text("Hex Colour Selected: " + color.toHexString()); //Log information
                    var col_value = $(".col_select").spectrum('get').toHexString(); //Get the colour selected
                    mod_part.material.color.set(col_value);
                }
            });
         
     },

     showPicker: function () {

         var select = document.getElementById("model_parts");
         var colPick = document.getElementById("colourChange");

         colPick.style.display = "block";

         switch (select.value) {

             case 'legs':
                 main.colourChange(main.legs);
                 break;

             case 'arms':
                 main.colourChange(main.arms);
                 break;

             case 'seat_cushion':
                 main.colourChange(main.seat_cushion);
                 break;

             case 'seat':
                 main.colourChange(main.seat);
                 break;

             case 'back':
                 main.colourChange(main.back);
                 break;
         }
    }

};


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

    if (main.chair !== undefined) {

        if (exportConfirm) {

            var exporter = new THREE.GLTFExporter();

            exporter.parse(main.chair, function (result) {

                saveString(JSON.stringify(result, null, 2), 'chair.gltf');

            });
        }

    }
});
//END EXPORT GLTF

function onWindowResize() {

    main.camera.aspect = window.innerWidth / window.innerHeight;
    main.camera.updateProjectionMatrix();
    main.renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

    requestAnimationFrame(animate);
    render();
    main.orbitControls.update();
}

function render() {

   main.renderer.render(main.scene, main.camera);
    
}

function onLoad() {
    main.init();
    animate();
}


window.addEventListener("load", onLoad, false);
window.addEventListener('resize', onWindowResize, false);
