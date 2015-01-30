define(['backbone', 'Three', 'OrbitControls'], function (Backbone, THREE) {

    var container, $container;
    var camera, controls, renderer;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    function makeGrid() {

        var l = 60;
        var axisHelper = new THREE.AxisHelper(l);
        this.scene.add(axisHelper);

        var geometry = new THREE.Geometry();
        var geometryThick = new THREE.Geometry();

        var n = l;
        var inc = 2 * l / n;
        var rate = 10;

        for (var i = 0; i < n + 1; i++) {

            var v1 = new THREE.Vector3(-l, -l + i * inc, 0);
            var v2 = new THREE.Vector3(l, -l + i * inc, 0);

            geometry.vertices.push(v1);
            geometry.vertices.push(v2);

            if (i % rate == 0) {
                geometryThick.vertices.push(v1);
                geometryThick.vertices.push(v2);
            }
        }

        for (var i = 0; i < n + 1; i++) {
            var v1 = new THREE.Vector3(-l + i * inc, l, 0);
            var v2 = new THREE.Vector3(-l + i * inc, -l, 0);

            geometry.vertices.push(v1);
            geometry.vertices.push(v2);

            if (i % rate == 0) {
                geometryThick.vertices.push(v1);
                geometryThick.vertices.push(v2);
            }
        }

        var material = new THREE.LineBasicMaterial({
            color: 0xeeeeee,
            linewidth: 0.1
        });

        var materialThick = new THREE.LineBasicMaterial({
            color: 0xeeeeee,
            linewidth: 2
        });

        var line = new THREE.Line(geometry, material, THREE.LinePieces);
        var lineThick = new THREE.Line(geometryThick, materialThick, THREE.LinePieces);

        this.scene.add(line);
        this.scene.add(lineThick);
    };

    function onWindowResize() {

        windowHalfX = $container.width() / 2;
        windowHalfY = $container.height() / 2;

        camera.aspect = windowHalfX / windowHalfY;
        camera.updateProjectionMatrix();

        renderer.setSize(2 * windowHalfX, 2 * windowHalfY);

        this.render();
    };

    function animate() {

        requestAnimationFrame(animate.bind(this));
        render.call(this);
    };


    function render() {

        controls.update();
        renderer.render(this.scene, camera);
    };

    function getBounds(boundingSphere) {
        return {
            maxX: boundingSphere.center.x + boundingSphere.radius,
            minX: boundingSphere.center.x - boundingSphere.radius,
            maxY: boundingSphere.center.y + boundingSphere.radius,
            minY: boundingSphere.center.y - boundingSphere.radius,
            maxZ: boundingSphere.center.z + boundingSphere.radius,
            minZ: boundingSphere.center.z - boundingSphere.radius
        };
    };   

    return function(){

        this.scene = null;

        this.init = function(){

            container = document.getElementById("viewer");
            $container = $(container);

            camera = new THREE.PerspectiveCamera(30, $container.width() / $container.height(), 1, 10000);

            camera.position.set(140, 140, 140);
            camera.up.set(0, 0, 1);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            this.scene = new THREE.Scene();

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setClearColor(0xffffff, 1);
            renderer.setSize($container.width(), $container.height());
            renderer.sortObjects = false;

            container.appendChild(renderer.domElement);
            renderer.domElement.setAttribute("id", "renderer_canvas");

            // add subtle ambient lighting
            var ambientLight = new THREE.AmbientLight(0x555555);
            this.scene.add(ambientLight);

            // add directional light source
            var directionalLight = new THREE.DirectionalLight(0xbbbbbb);
            directionalLight.position.set(50, 30, 50);
            this.scene.add(directionalLight);

            var directionalLight = new THREE.DirectionalLight(0xaaaaaa);
            directionalLight.position.set(-0.2, -0.8, 1).normalize();
            this.scene.add(directionalLight);

            makeGrid.call(this);

            controls = new THREE.OrbitControls(camera, container);

            window.addEventListener('resize', onWindowResize, false);

            animate.call(this);
        };

        this.zoomToFit = function() {

            var objects3d = [];

            for (var i = 0; i < this.scene.children.length; i++) {
                if (Object.getPrototypeOf(this.scene.children[i]) === THREE.Object3D.prototype) {
                    if (this.scene.children[i].children[0]) {
                        this.scene.children[i].children[0].geometry.computeBoundingSphere();
                        objects3d.push(this.scene.children[i].children[0].geometry.boundingSphere);
                    }
                }
            }

            if (objects3d.length > 0) {

                var bounds = getBounds(objects3d[0]);

                for (var i = 1; i < objects3d.length; i++) {
                    var innerBounds = getBounds(objects3d[i]);

                    if (innerBounds.maxX > bounds.maxX)
                        bounds.maxX = innerBounds.maxX;
                    if (innerBounds.minX < bounds.minX)
                        bounds.minX = innerBounds.minX;

                    if (innerBounds.maxY > bounds.maxY)
                        bounds.maxY = innerBounds.maxY;
                    if (innerBounds.minY < bounds.minY)
                        bounds.minY = innerBounds.minY;

                    if (innerBounds.maxZ > bounds.maxZ)
                        bounds.maxZ = innerBounds.maxZ;
                    if (innerBounds.minZ < bounds.minZ)
                        bounds.minZ = innerBounds.minZ;
                }

                var radiusX = Math.abs(bounds.maxX - bounds.minX) / 2;
                var radiusY = Math.abs(bounds.maxY - bounds.minY) / 2;
                var radiusZ = Math.abs(bounds.maxZ - bounds.minZ) / 2;

                var centerX = (bounds.maxX + bounds.minX) / 2;
                var centerY = (bounds.maxY + bounds.minY) / 2;
                var centerZ = (bounds.maxZ + bounds.minZ) / 2;

                var radius = Math.max.apply(Math, [radiusX, radiusY, radiusZ]);
                if (radius < 1)
                    radius = 1;
                var distanceFactor = Math.abs(camera.aspect * radius / Math.sin(camera.fov / 2));

                controls.reset();

                var target = new THREE.Vector3(centerX, centerY, centerZ);
                var vec = new THREE.Vector3();
                vec.addVectors(new THREE.Vector3(distanceFactor, distanceFactor, distanceFactor), target);
                controls.target = target;
                controls.object.position = vec;
                camera.updateProjectionMatrix();
            }
            else {
                controls.reset();
                camera.updateProjectionMatrix();
            }
        };

        this.dollyIn = function(){
            controls.dollyIn();
        };

        this.dollyOut = function(){
            controls.dollyOut();
        };

    };
});