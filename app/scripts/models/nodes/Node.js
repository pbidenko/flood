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
          , isArray: false
          , arrayItems: null
          , lastValue: null
          , failureMessage: null
          , visible: true
          , replication: 'applyLongest'
          , extra: {}
          , ignoreDefaults: []
          , isEvaluating: false
          , isProxy: false
        },

        initialize: function (attrs, vals) {
            var inPort,
                outPort;
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
                if (!vals.searchElement) {
                    if (attrs.ignoreDefaults) {
                        inPort = staticHelpers.generatePortNames(attrs.ignoreDefaults.length);
                    }
                } else {
                    inPort = vals.searchElement.get('inPort');
                    outPort = vals.searchElement.get('outPort');
                    this.set('displayName', vals.searchElement.get('displayName'));
                    this.set('creationName', vals.searchElement.get('creationName'));
                }

                this.set('type', new FLOOD.nodeTypes.ServerNode(inPort, outPort));
            }

            this.initAttrs(attrs, vals);
        },

        initAttrs: function (attrs, vals) {
            if (attrs.extra) {
                this.get('type').extend(attrs.extra);
                if (attrs.extra.isProxy)
                    this.set('isProxy', true);
                else
                    this.set('isProxy', false);
            }
            else
                this.set('isProxy', false);

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

            this.listenTo(this, 'connection', this.onConnectPort);

            this.listenTo(this, 'disconnection', this.onDisconnectPort);
            
            this.listenTo(this, 'remove', this.onRemove);

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

      var isArray = false;
      if (values.data) {
          var itemsNumber = parseInt(values.arrayItemsNumber);
          if (!isNaN(itemsNumber)) {
              this.set('arrayItemsNumber', itemsNumber);
              isArray = true;
              if (itemsNumber) {
                  this.set('lastValue', 'List');
              }
              else {
                  this.set('lastValue', 'Empty list');
              }
          }
          else {
              this.set('lastValue', values.data);
          }
      }

      this.set('isArray', isArray);
      // reset previous items
      this.set('arrayItems', []);
      this.trigger('array-reset');
      this.trigger('requestRender');

      if (values.state === 'Error' || values.state === 'Warning') {
        this.trigger('evalFailed', values.stateMessage);
      }
      else {
        this.set('failureMessage', '');
        this.trigger('evalBegin');
      }

    },

    appendArrayItems: function (param) {
        // -1 means it's not an array
        if (param.indexFrom === -1) {
            this.set('isArray', false);
            // reset previous items
            this.set('arrayItems', []);
        }
        else {
            var currentItems = this.get('arrayItems') || [];
            // insert received array at specified index
            this.set('arrayItems', currentItems.slice(0, param.indexFrom).concat(JSON.parse(param.items)));
        }

        this.trigger('requestRender');
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

    onEvalComplete: function(isNew, value, geometry){

      if (!isNew) return;

      this.trigger('geometryUpdated', {geometryData: {nodeId: this.get('_id'), geometry: geometry}});

      this.set('lastValue', value);
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
      this.listenTo( connection, 'remove', (function(){
        return function(){
          this.disconnectPort( portIndex, connection, isOutput );
        }.bind(this);
      }.bind(this))());

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
        this.trigger('request-remove-conn-from-collection', connection);
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

    onDisconnectPort: function( portIndex, isOutput, connection ) {

        if (isOutput) {
            return;
        }

        this.get('type').inputs[portIndex].disconnect();
        this.trigger('requestRun');
    }

  });
});



