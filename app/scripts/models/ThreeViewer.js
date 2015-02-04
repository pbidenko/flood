define(['backbone', 'Viewport', 'staticHelpers', 'GeometryExport'], function (Backbone, Viewport, staticHelpers, GeometryExport) {

    var colors = {
        selected: 0x00FFFF,
        notSelected: 0x999999,
        notSelectedLine: 0x000000
    };

    function colorSelected(threeGeom, selected) {

        var partMat,
            meshMat,
            lineMat;

        if (selected) {
            partMat = new THREE.PointCloudMaterial({ color: colors.selected, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });
            meshMat = new THREE.MeshPhongMaterial({ color: colors.selected, side: THREE.DoubleSide });
            lineMat = new THREE.LineBasicMaterial({ color: colors.selected });
        }
        else {
            partMat = new THREE.PointCloudMaterial({ color: colors.notSelected, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });
            meshMat = new THREE.MeshPhongMaterial({ color: colors.notSelected, side: THREE.DoubleSide });
            lineMat = new THREE.LineBasicMaterial({ color: colors.notSelectedLine });
        }

        setMaterials(threeGeom, partMat, meshMat, lineMat);
    };

    function setMaterials(threeGeom, partMat, meshMat, lineMat) {

        threeGeom.traverse(function (ele) {
            if (ele instanceof THREE.Mesh) {
                ele.material = meshMat;
            } else if (ele instanceof THREE.Line) {
                ele.material = lineMat;
            } else {
                ele.material = partMat;
            }
        });
    };

    function nodeSelected(e) {
        if (!this.idMap[e.id])
            return;

        colorSelected(this.idMap[e.id], e.selected);
    };

    function nodeVisible(e) {
        if (!this.idMap[e.id])
            return;

        if (e.visible)
            this.viewPort.scene.add(this.idMap[e.id]);
        else
            this.viewPort.scene.remove(this.idMap[e.id]);
    };

    function nodeRemove(e) {
        if (!this.idMap[e.id])
            return;

        this.viewPort.scene.remove(this.idMap[e.id]);
        delete this.idMap[e.id];
    };

    function changeWorkspace(e) {
        e.ids.forEach(function (node) {
            if (!this.idMap[node])
                return;

            if (e.visible)
                this.viewPort.scene.add(this.idMap[node]);
            else
                this.viewPort.scene.remove(this.idMap[node]);
        }.bind(this));
    };

    function clearNodeGeometry(e){
        if (!this.idMap[e.id])
            return;

        this.viewPort.scene.remove(this.idMap[e.id]);
        delete this.idMap[e.id];
    };

    function updateNodeGeometry(param) {
        var id = param.geometryData.nodeId,
            threeGeom = this.idMap[id],
            visible = false,
            selected = false,
            threeTemp = new THREE.Object3D(),
            graphicData,
            geometry,
            vertices,
            normals,
            i,
            j;

        this.app.getCurrentWorkspace().get('nodes').forEach(function (node) {
            if (node.get('_id') === id) {
                visible = node.get('visible');
                selected = node.get('selected');
            }
        }.bind(this));

        // Dynamo geometry
        if (param.geometryData.graphicPrimitivesData) {

            graphicData = param.geometryData.graphicPrimitivesData;
            graphicData.pointVertices = staticHelpers.getFloatArray(graphicData.pointVertices);
            graphicData.lineStripVertices = staticHelpers.getFloatArray(graphicData.lineStripVertices);
            graphicData.lineStripCounts = staticHelpers.getIntArray(graphicData.lineStripCounts);
            graphicData.triangleVertices = staticHelpers.getFloatArray(graphicData.triangleVertices);
            graphicData.triangleNormals = staticHelpers.getFloatArray(graphicData.triangleNormals);


            draw(threeTemp, graphicData, selected);

            if (threeGeom) {
                this.viewPort.scene.remove(threeGeom);
            }

            threeGeom = threeTemp;
            this.idMap[id] = threeGeom;

            if (visible)
                this.viewPort.scene.add(threeGeom);
        }
        // Flood geometry
        else if(param.geometryData.geometry){

            geometry = param.geometryData.geometry;

            graphicData = {};
            graphicData.pointVertices = [];
            graphicData.lineStripVertices = [];
            graphicData.lineStripCounts = [];
            graphicData.triangleVertices = [];
            graphicData.triangleNormals = [];

            if(geometry.faces){
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

            draw(threeTemp, graphicData, selected);

            if (threeGeom) {
                this.viewPort.scene.remove(threeGeom);
            }

            threeGeom = threeTemp;
            this.idMap[id] = threeGeom;

            if (visible)
                this.viewPort.scene.add(threeGeom);
        }

        this.pendingRequestsCount--;

        if(this.pendingRequestsCount === 0)
            this.app.trigger('hide-progress');
    };

    function draw(geom, list, selected) {

        var color,
            colorLine,
            meshMat,
            partMat,
            lineMat,
            mesh,
            geometry,
            count,
            size,
            positions,
            index = 0,
            pos = 0;

        if (selected) {
            color = colorLine = colors.selected;
        }
        else {
            color = colors.notSelected;
            colorLine = colors.notSelectedLine;
        }

        meshMat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
        partMat = new THREE.PointCloudMaterial({ color: color, size: 5, sizeAttenuation: false, side: THREE.DoubleSide });
        lineMat = new THREE.LineBasicMaterial({ color: colorLine });

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

            geom.add(new THREE.Line(geometry, lineMat, THREE.LinePieces));
        }

        if (list.pointVertices.length) {

            geometry.addAttribute('position', new THREE.BufferAttribute(list.pointVertices, 3));
            mesh = new THREE.PointCloud(geometry, partMat);

            geom.add(mesh);
        }

        if (list.triangleVertices.length) {

            geometry.addAttribute('position', new THREE.BufferAttribute(list.triangleVertices, 3));
            geometry.addAttribute('normal', new THREE.BufferAttribute(list.triangleNormals, 3));
            mesh = new THREE.Mesh(geometry, meshMat);

            geom.add(mesh);
        }
    };

    function onRequestGeometry(){
        if(this.pendingRequestsCount === 0)
            this.app.trigger('show-progress');
        this.pendingRequestsCount++;
    };

    function zoomToFit(){
        this.viewPort.zoomToFit();
    };

    function dollyOut(){
        this.viewPort.dollyOut();
    };

    function dollyIn(){
        this.viewPort.dollyIn();
    };

    function exportSTL(e){
        GeometryExport.toSTL(this.viewPort.scene, e.name);
    };

    return Backbone.Model.extend({

        initialize: function (args, options) {
            this.viewPort = new Viewport();
            this.viewPort.init();

            this.app = args.app;
            this.idMap = {};

            this.pendingRequestsCount = 0;

            this.listenTo(this.app, 'zoomToFit', zoomToFit.bind(this));
            this.listenTo(this.app, 'dollyOut', dollyOut.bind(this));
            this.listenTo(this.app, 'dollyIn', dollyIn.bind(this));
            this.listenTo(this.app, 'requestGeometry', onRequestGeometry.bind(this));
            this.listenTo(this.app, 'geometry-data-received:event', updateNodeGeometry.bind(this));
            this.listenTo(this.app.get('workspaces'), 'geometryUpdated', updateNodeGeometry.bind(this));
            this.listenTo(this.app.get('workspaces'), 'nodeSelected', nodeSelected.bind(this));
            this.listenTo(this.app.get('workspaces'), 'nodeVisible', nodeVisible.bind(this));
            this.listenTo(this.app.get('workspaces'), 'nodeRemove', nodeRemove.bind(this));
            this.listenTo(this.app.get('workspaces'), 'changeWorkspace', changeWorkspace.bind(this));
            this.listenTo(this.app.get('workspaces'), 'clearNodeGeometry', clearNodeGeometry.bind(this));
            this.listenTo(this.app.get('workspaces'), 'exportSTL', exportSTL.bind(this));

            
        }
    });

});