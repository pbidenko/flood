define(['backbone', 'FLOOD', 'staticHelpers'], function (Backbone, FLOOD, staticHelpers) {

    return Backbone.Model.extend({

        idAttribute: '_id',

        defaults: {
            name: 'DefaultNodeName'
          , position: [10, 10]
          , typeName: 'Add'
          , creationName: 'Add'
          , displayName: 'Add'
          , type: null
          , inputConnections: []
          , outputConnections: []
          , selected: true
          , lastValue: null
          , failureMessage: null
          , visible: true
          , replication: 'applyLongest'
          , extra: {}
          , ignoreDefaults: []
          , isEvaluating: false
        },

        initialize: function (attrs, vals) {
            var inPort,
                outPort,
                elems;
            // Need to know the type in order to create the node
            if (attrs.typeName && FLOOD.nodeTypes[attrs.typeName]) {
                this.set('type', new FLOOD.nodeTypes[attrs.typeName]());
                this.set('creationName', attrs.typeName);
                this.set('displayName', attrs.typeName);
            } else if ( attrs.typeName != null && FLOOD.internalNodeTypes[attrs.typeName] != undefined ) {
                this.set('type', new FLOOD.internalNodeTypes[ attrs.typeName ]());
                this.set('creationName', attrs.extra.creationName);
                this.set('displayName', attrs.extra.displayName);
            } else {
                elems = vals.workspace.app.SearchElements.where({ creationName: attrs.typeName });
                if (elems.length === 0) {
                    if (attrs.ignoreDefaults) {
                        inPort = staticHelpers.generatePortNames(attrs.ignoreDefaults.length);
                    }
                } else {
                    inPort = elems[0].get('inPort');
                    outPort = elems[0].get('outPort');
                    this.set('displayName', elems[0].get('displayName'));
                    this.set('creationName', elems[0].get('creationName'));
                }

                this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            }

            this.initAttrs(attrs, vals);
        },

        initAttrs: function (attrs, vals) {
            if (attrs.extra) {
                this.get('type').extend(attrs.extra);
            }

            if (attrs.lastValue) {
                this.get('type').value = attrs.lastValue;
            }

            if (attrs.ignoreDefaults &&
                attrs.ignoreDefaults.length > 0 &&
                this.get('type').inputs.length === attrs.ignoreDefaults.length) {

                for (var i = 0; i < attrs.ignoreDefaults.length; i++) {
                    this.get('type').inputs[i].useDefault = !attrs.ignoreDefaults[i];
                }

            } else {
                attrs.ignoreDefaults = this.get('type').inputs.map(function (x) {
                    return !x.useDefault;
                });
            }

            this.set('ignoreDefaults', attrs.ignoreDefaults);

            this.on('connection', this.onConnectPort);

            this.on('disconnection', this.onDisconnectPort);
            this.workspace = vals.workspace;

            this.on('remove', this.onRemove);

            this.initializePorts();
        },

    // called when saving the node to server
    serialize : function() {

            var vals = {
                name: this.get('name')
              , position: this.get('position')
              , typeName: this.get('typeName')
              , creationName: this.get('creationName')
              , displayName: this.get('displayName')
              , selected: this.get('selected')
              , visible: this.get('visible')
              , ignoreDefaults: this.get('ignoreDefaults')
              , _id: this.get('_id')
              , replication: this.get('replication')
              , extra: this.get('extra')
            };

      return vals;

    },

    initializePorts: function() {

      var type = this.get('type');
   
      this.set('inputConnections', new Array( type.inputs.length ));
      this.set('outputConnections', new Array( type.outputs.length ));

        },

        updateValue: function (values) {
            if (values.data) {
                this.set('lastValue', values.data);
            }

            if (values.state === 'Error' || values.state === 'Warning') {
                this.trigger('evalFailed', values.stateMessage);
            }
            else {
                this.set('failureMessage', '');
                this.trigger('evalBegin');
            }
        },

    onRemove: function(){

      this.trigger('removed');

    },

    onEvalFailed: function(ex){

      this.trigger('evalFailed', ex);

    },

    onEvalBegin: function(isNew){

      if (!isNew) return;
      this.trigger('evalBegin');
      this.set('isEvaluating', true);

    },

    onEvalComplete: function(isNew, value, prettyValue){

      if (!isNew) return;

      this.set('lastValue', value);
      this.set('prettyLastValue', prettyValue);
      this.set('isEvaluating', false);
      this.trigger('evalComplete');

    },

    select: function() {
      this.set('selected', false);
    },

    deselect: function() {
      this.set('selected', true);
    },

    // get the input or output ports of a node
    getPorts: function(isOutput){
      return isOutput ? this.get('outputConnections') : this.get('inputConnections');
    },

    // determine if a given port is connected or not
    isPortConnected: function(index, isOutput){

      if ( !this.isValidPort(index, isOutput) ) {
        return true;
      }

      var ports = this.getPorts(isOutput);
      return ports[index] != null && ports[index].length > 0;

    },

    isPartialFunctionApplication: function(){

      var numInPorts = this.get('inputConnections').length;

      for (var i = 0; i < numInPorts; i++){
        if (!this.isPortConnected(i, false) && !this.isInputPortUsingDefault(i) ){
          return true;
        } 
      }

      return false;

    },

    isInputPortUsingDefault: function(index){

      if ( !this.isValidPort(index, false) ) {
        return false;
      }

      return !this.get('ignoreDefaults')[index];

    },

    // get the type of a given node port
    getPortType: function(index, isOutput){
      
      if (index < 0)
        return null;

      var type = this.get('type')
        , ports = isOutput ? type.outputs : type.inputs;

      if ( ports.length > index )
        return ports[index].type;

      return null;

    },

    isValidPort: function(index, isOutput){
      return this.getPortType(index, isOutput) != null;
    },

    // get the node and index of the opposite end of a port
    // returns object containing "node", "portIndex" fields
    // if out of range, returns null
    getOppositeNodeAndPort: function(index, isOutput){

      if ( !this.isValidPort(index, isOutput) ) {
        return null;
      }

      return this.getPorts(isOutput)[index];
    },

    isOutputNode: function(){
      return this.get('outputConnections').reduce(function(memo, ele){
        return memo && (ele.length === 0);
      }, true);
    },

    connectPort: function( portIndex, isOutput, connection ) {

      if ( !this.isValidPort(portIndex, isOutput) ) {
        return null; // the port doesn't exist
      }

      // initialize if necessary
      if ( !this.getPorts( isOutput )[portIndex] )
        this.getPorts( isOutput )[portIndex] = [];

      // add the connection to the array
      this.getPorts( isOutput )[portIndex].push(connection);

      // listen for deletion or update of the connection
      var that = this;
      this.listenTo( connection, 'remove', (function(){
        return function(){
          that.disconnectPort( portIndex, connection, isOutput );
        };
      })());

      this.trigger('connection', portIndex, isOutput, connection);
      this.trigger('change');

      return this;

    },

    getConnectionAtIndex: function( portIndex, isOutput, connectionIndex ){

      var ports = this.getAllConnectionsAtPort( portIndex, isOutput );

      if (ports == null) return null;
      if ( connectionIndex === undefined ) connectionIndex = 0;
      if ( connectionIndex >= ports.length || connectionIndex < 0) return null;

      return ports[connectionIndex];

    },

    getAllConnectionsAtPort: function( portIndex, isOutput ){

      if (!this.isValidPort(portIndex, isOutput)) return null;

      if (isOutput === undefined) isOutput = false;

      var ports = this.getPorts(isOutput)[portIndex];
      return ports;

    },

        disconnectPort: function (portIndex, connection, isOutput) {
            var port,
                index = -1;
            if (!this.isValidPort(portIndex, isOutput))
                return;

            port = this.getPorts(isOutput)[portIndex];

            if (!port)
                return;

            if (connection) {
                index = port.indexOf(connection);

            }
            else if (!isOutput && port.length > 0) {
                index = 0;
                connection = port[0];
                isOutput = false;
                this.workspace.get('connections').remove(connection);
            }

            if (index === -1)
                return;

            // remove the requested connection on the port
            port.remove(index);

            this.trigger('disconnection', portIndex, isOutput, connection);
            this.trigger('change');

        },

    onConnectPort: function( portIndex, isOutput, connection){
      
      if (isOutput)
        return;

      // connect the logic nodes
      var type = this.get('type')
        , opp = connection.getOpposite( this )
        , oppType = opp.node.get('type')
        , oppIndex = opp.portIndex;

      type.inputs[portIndex].connect( oppType, oppIndex );

    },

    onDisconnectPort: function( portIndex, isOutput, connection ){
      
      if (isOutput){
        return;
      }

      if (!isOutput){
        this.get('type').inputs[portIndex].disconnect();
      }

      if (this.workspace)
        this.workspace.run();

    },

    updateNodeGeometry: function(param) {
        var graphicData = param.geometryData.graphicPrimitivesData;

        graphicData.pointVertices = staticHelpers.getFloatArray(graphicData.pointVertices);
        graphicData.lineStripVertices = staticHelpers.getFloatArray(graphicData.lineStripVertices);
        graphicData.lineStripCounts = staticHelpers.getIntArray(graphicData.lineStripCounts);
        graphicData.triangleVertices = staticHelpers.getFloatArray(graphicData.triangleVertices);
        graphicData.triangleNormals = staticHelpers.getFloatArray(graphicData.triangleNormals);

        var geometries = []; // prettyLastValue
        graphicData.numberOfCoordinates = 3;

        this.addPoints(graphicData, geometries);
        this.addTriangles(graphicData, geometries);
        this.addCurves(graphicData, geometries);

        this.set('prettyLastValue', geometries);

    },

    addPoints: function (graphicData, geometries) {
        // if we have single points
        if (graphicData.pointVertices && graphicData.pointVertices.length) {
            var points = {vertices: []}, onePoint;
            for(var i = 0; i< graphicData.pointVertices.length / graphicData.numberOfCoordinates; i++){
                // add [x, y, z]
                onePoint = [
                  graphicData.pointVertices[i * graphicData.numberOfCoordinates], 
                  graphicData.pointVertices[i * graphicData.numberOfCoordinates + 1],
                  graphicData.pointVertices[i * graphicData.numberOfCoordinates + 2]
                ];
                points.vertices.push(onePoint);
            }

            geometries.push(points);
        }
    },

    addCurves: function (graphicData, geometries) {
        // if we have line strips
        if (graphicData.lineStripVertices && graphicData.lineStripVertices.length
            && graphicData.lineStripCounts && graphicData.lineStripCounts.length) {
            var curve, count, oneVertex, pos = 0;

            for (var k = 0; k < graphicData.lineStripCounts.length; k++) {
                curve = { linestrip: []};
                count = graphicData.lineStripCounts[k];

                if(!count){
                    continue;
                }

                for(var i = pos; i < pos + count; i++){
                    oneVertex = [
                      graphicData.lineStripVertices[i * graphicData.numberOfCoordinates],
                      graphicData.lineStripVertices[i * graphicData.numberOfCoordinates + 1],
                      graphicData.lineStripVertices[i * graphicData.numberOfCoordinates + 2]
                    ];
                    curve.linestrip.push(oneVertex);
                }

                pos += count;
                geometries.push(curve);
            }
        }
    },

    addTriangles: function (graphicData, geometries) {
        // if we have triangles
        if (graphicData.triangleVertices && graphicData.triangleVertices.length
            && graphicData.triangleNormals && graphicData.triangleNormals.length) {
            var triangles = {vertices: [], faces:[]};
            var index = 0, oneVertex, vertexCount = 3;

            for(var i = 0; i <= graphicData.triangleVertices.length / vertexCount * 3; i++) {
                for (var j = 0; j < vertexCount; j++) {
                    // Add vertex - [x, y, z]
                    oneVertex = [graphicData.triangleVertices[i * 9 + j * 3], graphicData.triangleVertices[i * 9 + j * 3 + 1], graphicData.triangleVertices[i * 9 + j * 3 + 2]];
                    triangles.vertices.push(oneVertex);
                }
                // add [indexA, indexB, indexC, normal_vector: [x1, y1, z1, x2, y2, z2, x3, y3, z3]]
                triangles.faces.push([index++, index++, index++, [
                    // x1, y1, z1
                    graphicData.triangleNormals[i * 9],
                    graphicData.triangleNormals[i * 9 + 1],
                    graphicData.triangleNormals[i * 9 + 2],
                    // x2, y2, z2
                    graphicData.triangleNormals[i * 9 + 3],
                    graphicData.triangleNormals[i * 9 + 4],
                    graphicData.triangleNormals[i * 9 + 5],
                    // x3, y3, z3
                    graphicData.triangleNormals[i * 9 + 6],
                    graphicData.triangleNormals[i * 9 + 7],
                    graphicData.triangleNormals[i * 9 + 8]]
                ]);
            }

            geometries.push(triangles);
        }
    }

  });
});



