define(['backbone'], function(Backbone) {

    var material = new THREE.MeshPhongMaterial({
            color: 0xA0A0A0
        }),
        idList = [];

    return Backbone.Model.extend({

        initialize: function (atts) {
            this.app = atts.app;
            this.listenTo( this.app, 'computation-completed:event', this.redrawGeometry);
        },

        redrawGeometry: function(param) {

            var nodeId,
                point1,
                point2,
                point3;

            this.clearScene();

            for (var i = 0; i < param.result.length; i++) {

                if (param.result[i].isGraphic) {
                    var primitivs = param.result[i].graphicPrimitives;

                    for (var j = 0; j < primitivs.length; j++) {
                        nodeId = param.result[i].nodeID;
                        idList.push(nodeId);

                        if (primitivs[j].primitiveType === 'Point') {
                            point1 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            this.addPoint(nodeId, point1);
                        } else if (primitivs[j].primitiveType === 'Line') {
                            point1 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            point2 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[3].split(';');
                            this.addLine(nodeId, point1, point2);
                        } else if (primitivs[j].primitiveType === 'Triangle') {
                            point1 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[1].split(';');
                            point2 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[3].split(';');
                            point3 = primitivs[j].primitiveData.split(/\(([^)]+)\)/)[5].split(';');
                            this.addTriangle(nodeId, point1, point2, point3);
                        }
                    }
                }
            }

            render();
        },

        clearScene: function() {

            var selectedObject;

            while (idList.length) {
                selectedObject = scene.getObjectByName(idList.shift());
                scene.remove(selectedObject);
            }
        },

        addPoint: function(nodeId, point) {

            var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), material);
            sphere.position.set(point[0], point[1], point[2]);
            sphere.name = nodeId;

            scene.add(sphere);
        },

        addLine: function(nodeId, point1, point2) {

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(point1[0], point1[1], point1[2]));
            geometry.vertices.push(new THREE.Vector3(point2[0], point2[1], point2[2]));

            var line = new THREE.Line(geometry, material);
            line.name = nodeId;

            scene.add(line);
        },

        addTriangle: function(nodeId, point1, point2, point3) {

            var geometry = new THREE.Geometry();

            geometry.vertices.push(new THREE.Vector3(point1[0], point1[1], point1[2]));
            geometry.vertices.push(new THREE.Vector3(point2[0], point2[1], point2[2]));
            geometry.vertices.push(new THREE.Vector3(point3[0], point3[1], point3[2]));

            geometry.faces.push(new THREE.Face3(0, 1, 2));
            geometry.computeFaceNormals();

            var triangle = new THREE.Mesh(geometry, material);

            triangle.doubleSided = true;
            triangle.material.side = THREE.DoubleSide;

            triangle.name = nodeId;

            scene.add(triangle);
        }


    });
});