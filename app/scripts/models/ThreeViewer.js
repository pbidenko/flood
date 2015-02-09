define(['backbone', 'Viewport', 'staticHelpers', 'GeometryExport', 'Three'], function (Backbone, Viewport, staticHelpers, GeometryExport) {

    var partMat = new THREE.PointCloudMaterial({ color: 0x999999, size: 5, sizeAttenuation: false, side: THREE.DoubleSide }),
        meshMat = new THREE.MeshPhongMaterial({ color: 0x999999, side: THREE.DoubleSide }),
        lineMat = new THREE.LineBasicMaterial({ color: 0x000000 }),
        partMatSelected = new THREE.PointCloudMaterial({ color: 0x00FFFF, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });
        meshMatSelected = new THREE.MeshPhongMaterial({ color: 0x00FFFF, side: THREE.DoubleSide });
        lineMatSelected = new THREE.LineBasicMaterial({ color: 0x00FFFF });

    function getGraphicData(geometryData) {

        var graphicData = {
                pointVertices: [],
                lineStripVertices: [],
                lineStripCounts: [],
                triangleVertices: [],
                triangleNormals: []
            },
            geometry,
            vertices,
            normals,
            i,
            j;

        // Dynamo geometry
        if (geometryData.graphicPrimitivesData) {
            graphicData = geometryData.graphicPrimitivesData;
            graphicData.pointVertices = staticHelpers.getFloatArray(graphicData.pointVertices);
            graphicData.lineStripVertices = staticHelpers.getFloatArray(graphicData.lineStripVertices);
            graphicData.lineStripCounts = staticHelpers.getIntArray(graphicData.lineStripCounts);
            graphicData.triangleVertices = staticHelpers.getFloatArray(graphicData.triangleVertices);
            graphicData.triangleNormals = staticHelpers.getFloatArray(graphicData.triangleNormals);
        }
        // Flood geometry
        else if(geometryData.geometry) {
            geometry = geometryData.geometry;

            if(geometry.faces) {
                vertices = [];
                normals = [];

                for(i = 0; i < geometry.faces.length; i++){
                    for(j = 0; j < 3; j++){
                        vertices.push( geometry.vertices[geometry.faces[i][j]][0],
                                       geometry.vertices[geometry.faces[i][j]][1],
                                       geometry.vertices[geometry.faces[i][j]][2]);
                        normals.push( geometry.faces[i][3][0],
                                      geometry.faces[i][3][1],
                                      geometry.faces[i][3][2]);
                    }
                }

                graphicData.triangleVertices = new Float32Array(vertices);
                graphicData.triangleNormals = new Float32Array(normals);
            }
            else if(geometry.vertices){
                graphicData.pointVertices = new Float32Array(graphicData.pointVertices.concat.apply(graphicData.pointVertices, geometry.vertices)); 
            }
        }

        return graphicData;
    };

    function draw(geom, list, selected) {

        var color,
            colorLine,
            mesh,
            geometry,
            count,
            size,
            positions,
            index = 0,
            pos = 0;

        geometry = new THREE.BufferGeometry();

        if (list.lineStripVertices.length && list.lineStripCounts.length) {

            for (var k = 0; k < list.lineStripCounts.length; k++) {

                positions = [];
                count = list.lineStripCounts[k];
                if (!count) {
                    continue;
                }

                size = index + count;
                for (var i = index; i < size; i++) {
                    pos = i * 3;
                    positions.push(
                        list.lineStripVertices[pos],
                        list.lineStripVertices[pos + 1],
                        list.lineStripVertices[pos + 2]
                    );
                }

                index += count;
                geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            }

            geom.add(new THREE.Line(geometry, selected ? lineMatSelected : lineMat, THREE.LinePieces));
        }

        if (list.pointVertices.length) {

            geometry.addAttribute('position', new THREE.BufferAttribute(list.pointVertices, 3));
            mesh = new THREE.PointCloud(geometry, selected ? partMatSelected : partMat);

            geom.add(mesh);
        }

        if (list.triangleVertices.length) {

            geometry.addAttribute('position', new THREE.BufferAttribute(list.triangleVertices, 3));
            geometry.addAttribute('normal', new THREE.BufferAttribute(list.triangleNormals, 3));
            mesh = new THREE.Mesh(geometry, selected ? meshMatSelected : meshMat);

            geom.add(mesh);
        }
    };


    return Backbone.Model.extend({

        initialize: function (args, options) {
            this.viewPort = new Viewport();

            this.viewPort.init(args.container);

            this.idMap = {};
        }, 

        zoomToFit: function(){
            this.viewPort.zoomToFit();
        },

        dollyOut: function(){
            this.viewPort.dollyOut();
        },

        dollyIn: function(){
            this.viewPort.dollyIn();
        },

        exportSTL: function(e){
            GeometryExport.toSTL(this.viewPort.scene, e.name);
        },

        nodeSelected: function(e) {
            if (!this.idMap[e.id])
                return;

            this.idMap[e.id].traverse(function (ele) {
                if (ele instanceof THREE.Mesh) {
                    ele.material = e.selected ? meshMatSelected : meshMat;
                } else if (ele instanceof THREE.Line) {
                    ele.material = e.selected ? lineMatSelected : lineMat;
                } else {
                    ele.material = e.selected ? partMatSelected : partMat;
                }
            });
        },

        nodeVisible: function(e) {
            if (!this.idMap[e.id])
                return;

            this.idMap[node].traverse(function(el) { el.visible = e.visible; });
        },

        changeWorkspace: function(e) {
            e.ids.forEach(function (node) {
                if (!this.idMap[node])
                    return;

                this.idMap[node].traverse(function(el) { el.visible = e.visible; });
            }.bind(this));
        },

        clearNodeGeometry: function(e){
            if (!this.idMap[e.id])
                return;

            this.viewPort.scene.remove(this.idMap[e.id]);
            delete this.idMap[e.id];
        },

        updateNodeGeometry: function(param, visible, selected) {
            var id = param.geometryData.nodeId,
                threeGeom = this.idMap[id],
                threeTemp = new THREE.Object3D(),
                graphicData;

            graphicData = getGraphicData(param.geometryData);
            draw(threeTemp, graphicData, selected);

            if (threeGeom) {
                this.viewPort.scene.remove(threeGeom);
            }
            threeGeom = threeTemp;
            this.idMap[id] = threeGeom;

            if (visible)
                this.viewPort.scene.add(threeGeom);
        }
    });

});