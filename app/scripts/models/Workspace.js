define(['backbone', 'Nodes', 'Connection', 'Connections', 'scheme', 'FLOOD', 'Runner', 'Node', 'Marquee', 'WorkspaceResolver', 'NodeFactory', 'GeometryMessage', 'GeometryExport'], 
    function(Backbone, Nodes, Connection, Connections, scheme, FLOOD, Runner, Node, Marquee, WorkspaceResolver, nodeFactory, GeometryMessage, GeometryExport) {

  return Backbone.Model.extend({

    idAttribute: "_id",

    url: function(){
      return '/ws/' + this.get('_id');
    },

    defaults: {
      name: "Unnamed Workspace",
      tabName: "",
      nodes: null,
      connections: null,
      zoom: 1,
      current: false,
      isPublic: false,
      isRunning: false,
      lastSaved: Date.now(),
      offset: [4000,4000],

      // undo/redo stack
      undoStack: [],
      redoStack: [],
      clipBoard: [],

      // for custom nodes
      workspaceDependencyIds: [],
      isCustomNode: false,
      isCustomizer: false,
      guid: null,
      notNotifyServer: false
    },

    // connection creation
    draggingProxy: false,
    proxyConnection: null,

    // marquee selection
    dragSelect: false,

    runAllowed: false,

    pendingRequestsCount: 0,

    initialize: function(atts, arr) {

      atts = atts || {};

      // if offset is not defined
      if (!atts.offset || isNaN( atts.offset[0] ) || isNaN( atts.offset[1] )){
        atts.offset = this.defaults.offset;
        this.set( 'offset', this.defaults.offset );
      }

      this.app = arr.app;

      this.createNodes(atts);
      this.createConnections(atts);

      this.subscribeOnNodesConnectionsChanges();
      if (atts.notNotifyServer) {
          this.set('notNotifyServer', true);
      }

      // the proxy connection is what is drawn when the user is 
      // in the process of creating a new connection - it is not 
      // persisted.
      this.proxyConnection = new Connection({
        _id: -1,
        startProxy: true,
        endProxy: true,
        startProxyPosition: [0, 0],
        endProxyPosition: [0, 0],
        hidden: true
      });

      this.marquee = new Marquee({
        _id: -1,
        hidden: true
      }, { workspace: this });

      this.runAllowed = false;

      this.sync = _.throttle(this.sync, 2000);

      // save on every change
      var throttledSync = _.throttle(function(){ this.sync('update', this); }, 1000);
      this.on('runCommand', throttledSync, this);
      this.on('change:name', throttledSync, this);
      this.on('change:zoom', throttledSync, this);
      this.on('change:offset', throttledSync, this);
      this.on('change:workspaceDependencyIds', throttledSync, this);
      this.on('requestRun', this.run, this);

      // this should not be throttled
      this.on('change:isCustomizer', function(){ this.sync('update', this); }, this);
      this.set('tabName', this.get('name'));      if ( this.get('isCustomNode') ) this.initializeCustomNode();

      this.resolver = new WorkspaceResolver(null, { app : this.app, workspace : this });
      this.resolver.resolveAll();

      this.app.trigger('workspaceLoaded', this);

    },

    getCustomizerUrl: function(){

      // if (!this.get('isCustomizer')){
      //   return "none";
      // }

      var domain = document.URL.match(/:\/\/(.[^/]+)/)[1];
      return domain + "/customize-" + this.id;
    },

    exportSTL: function(){

      GeometryExport.toSTL(scene, this.get('name') + ".stl" );

    },

    createNodes: function(data, browserViewWorkspaces){

      var i;
      var oldNodes = this.get('nodes');
      if (oldNodes && oldNodes.models && oldNodes.models.length) {
            oldNodes = oldNodes.models;
            for(i = 0; i < oldNodes.length; i++) {
                  oldNodes[i].clearGeometry();
            }
      }

      this.set('nodes', new Nodes());
      var guid, workspaces, id, node, index;
      var allWorkspaces = this.app.get('workspaces');
      for(i = 0; i < data.nodes.length; i++) {
          node = data.nodes[i];

          // besides creating nodes we should set all dependencies
          if (node.isCustomNode) {
              guid = node.extra.creationName;
              workspaces = allWorkspaces.where({ guid: guid });
              // if this custom node definition is not loaded
              if (workspaces.length === 0) {
                  index = -1;
                  // try find custom node definition in browser view
                  if (browserViewWorkspaces) {
                      index = browserViewWorkspaces.map(function (pair) {
                          return pair.guid;
                      }).indexOf(guid);
                  }
                  if (index > -1) {
                      id = browserViewWorkspaces[index].id;
                      node.extra.functionId = id;
                  }
                  // if there is no needed custom node definition
                  // make the node proxy
                  else {
                      node.extra.isProxy = true;
                  }
              }
              else {
                  id = workspaces[0].get('_id');
                  node.extra.functionId = id;
              }
          }
        nodeModel = nodeFactory.create({
            config: node,
            searchElements: this.app.SearchElements
        });

        this.subscribeOnNodeEvents(nodeModel);
        this.get('nodes').add(nodeModel);

        // if this custom node is not proxy and dependency haven't been added yet
        if (id && this.get('workspaceDependencyIds').indexOf(id) === -1) {
            if (workspaces.length)
                this.addWorkspaceDependency(id);
            else {
                // add id here as well because
                // loadWorkspace will be executed after this method
                // and in this way we won't call loadWorkspace
                // for the same id more than once
                this.get('workspaceDependencyIds').push(id);
                this.app.loadWorkspace(id, function(ws) {
                    // it will delete duplicates in the dependencies
                    // and add dependencies of ws
                    this.addWorkspaceDependency(ws.get('_id'));
                }.bind(this));
            }
        }
        // reset id
        id = null;
      }
    },

    subscribeOnNodeEvents: function(nodeModel) {
        this.listenTo(nodeModel, 'request-set-node-prop', this.setNodeProperty);
        //notify all listeners of the workspace
        this.listenTo(nodeModel, 'requestRun', function(){ this.trigger('requestRun'); });
        this.listenTo(nodeModel, 'updateRunner', function(){ this.trigger('updateRunner'); });
	
        this.listenTo(nodeModel, 'start-proxy-conn', this.startProxyConnection);
        this.listenTo(nodeModel, 'request-remove-conn', this.removeConnection);
        this.listenTo(nodeModel, 'request-remove-node', this.removeNodeById);
        this.listenTo(nodeModel, 'request-remove-conn-from-collection', this.removeConnectionFromCollection);
        this.listenTo(nodeModel, 'deselect-all-nodes', this.deselectAllNodes);
        this.listenTo(nodeModel, 'request-set-draggingproxy', this.setDraggingProxy);
    },

    setDraggingProxy: function(newValue) {
        this.draggingProxy = newValue;
    },

    createConnections: function(data){

      this.set('connections', new Connections(data.connections));

      // tell all nodes about connections
      _.each(this.get('connections').where({ startProxy: false, endProxy: false }), function (ele) {
        ele.startNode = this.get('nodes').get(ele.get('startNodeId'));
        ele.endNode = this.get('nodes').get(ele.get('endNodeId'));
        ele.startNode.connectPort(ele.get('startPortIndex'), true, ele);
        ele.endNode.connectPort(ele.get('endPortIndex'), false, ele);
      }, this);
    },

    subscribeOnNodesConnectionsChanges: function(){

      this.get('connections').on('add remove', function () {
        this.trigger('change:connections');
        this.trigger('requestRun');
      }.bind(this));

      this.get('nodes').on('add remove', function () {
        this.trigger('change:nodes');
        this.trigger('requestRun');
      }.bind(this));

        this.listenTo(this.get('nodes'), 'remove', function (node) {
            this.stopListening(node);
        });
    },

    customNode : null,

    initializeCustomNode: function(){

      this.customNode = new FLOOD.internalNodeTypes.CustomNode( this.get('name'), this.get('_id'), this.get('guid') );

      var ni = this.get('nodes').where({typeName: "Input"}).length;
      var no = this.get('nodes').where({typeName: "Output"}).length;

      this.customNode.setNumInputs(ni);
      this.customNode.setNumOutputs(no);

      this.customNode.searchTags = [this.get('name').toLowerCase()];

      this.app.SearchElements.addCustomNode( this.customNode );

      var that = this;

      this.on('change:name', function(){
        that.customNode.functionName = that.get('name');
        that.customNode.searchTags = [that.get('name').toLowerCase()];
        that.app.SearchElements.addCustomNode( that.customNode );
      }, this);

    },

    toJSON : function() {

        this.set('undoStack', _.last( this.get('undoStack'), 10) );
        this.set('redoStack', _.last( this.get('redoStack'), 10) );

        if (this._isSerializing) {
            return this.id || this.cid;
        }

        this._isSerializing = true;

        var json = _.clone(this.attributes);

        _.each(json, function(value, name) {
            _.isFunction(value.toJSON) && (json[name] = value.toJSON());
        });

        this._isSerializing = false;

        return json;
    },

    initializeRunner: function(){

      this.runner = new Runner({id : this.get('_id') }, { workspace: this, app: this.app });

      var that = this;
      this.runner.on('change:isRunning', function(v){
        that.set('isRunning', v.get('isRunning'));
      });

    },

    dispose: function () {
        this.get('connections').reset();
        this.get('nodes').reset();
        this.resolver.stopListening();
        this.stopListening();
    },

    getCustomNodeInputsOutputs: function(getOutputs){

      var typeName = getOutputs ? "Output" : "Input";

      return this.get('nodes').filter(function(x){
        return x.get('type').typeName === typeName;
      });

    },

    getCustomNodes: function(){

      return this.get('nodes').filter(function(x){
        return x.get('type') instanceof FLOOD.internalNodeTypes.CustomNode;
      });

    },

    getCustomNodesWithId: function(functionId){

      return this.getCustomNodes().filter(function(x){
        return x.get('type').functionId === functionId;
      });

    },

    zoomIn: function(){

      if ( this.get('zoom') + 0.2 > 1 ){
        return this.set('zoom', 1);
      }

      this.set('zoom', this.get('zoom') + 0.2);

    },

    zoomOut: function(){

      if ( this.get('zoom') - 0.2 < 0.2 ){
        return this.set('zoom', 0.2);
      }

      this.set('zoom', this.get('zoom') - 0.2);

    },

    parse : function(resp) {
      resp.nodes = new Nodes( resp.nodes );
      resp.connections = new Connections( resp.connections );
      return resp;
    },

    printModel: function(){
      console.log(this.toJSON());
    },

    addToUndoAndClearRedo: function(cmd){

      this.get('undoStack').push(cmd);
      this.get('redoStack').length = 0;

    },  

    removeSelected: function(){

      // get all selected nodes
      var nodeFound = false;
      var nodesToRemove = {};
      this.get('nodes')
          .each(function(x){ 
            if ( x.get('selected') ){
              nodeFound = true;
              nodesToRemove[ x.get('_id') ] = x.serialize();
            }
          });

      if (!nodeFound) return;

      // get all relevant connections
      var connsToRemove = {};
      this.get('connections')
        .each(function(x){
          if ( nodesToRemove[ x.get('startNodeId') ] || nodesToRemove[ x.get('endNodeId') ] ){
            if ( !connsToRemove[ x.get('_id')  ] ){
                // no need to notify Dynamo
                // it will delete this connectors itself
                x.silentRemove = true;
                connsToRemove[ x.get('_id') ] = x.toJSON();
            } 
          }
        });

      // construct composite command
      var multipleCmd = { kind: "multiple", commands: [] };

      // first remove all connections
      for (var connId in connsToRemove){
        var connToRemove = connsToRemove[connId];
        connToRemove.kind = "removeConnection";
        multipleCmd.commands.push( connToRemove );
      }

      // then remove all nodes
      for (var nodeId in nodesToRemove){
        var nodeToRemove = nodesToRemove[nodeId];
        nodeToRemove.kind = "removeNode";
        multipleCmd.commands.push( nodeToRemove );
      }

      this.runInternalCommand( multipleCmd );
      this.addToUndoAndClearRedo( multipleCmd );

    },

    makeId: function(){
      return this.app.makeId();
    },

    copy: function(){

      // get all selected nodes
      var nodeFound = false;
      var copyNodes = {};
      this.get('nodes')
          .each(function(x){ 
            if ( x.get('selected') ){
              nodeFound = true;
              copyNodes[ x.get('_id') ] = x.serialize();
            }
          });

      // TODO: clear the clipboard!
      if (!nodeFound) return;

      // get all relevant connections
      var copyConns = {};
      var connCount = 0;
      this.get('connections')
        .each(function(x){

          if (x.get('_id') === -1 || x.get('startProxy') || x.get('endProxy')) return;

          if ( ( copyNodes[ x.get('startNodeId') ] && copyNodes[ x.get('endNodeId') ] ) || copyNodes[ x.get('endNodeId') ]  ){

            if ( !copyConns[ x.get('_id')  ] ){
              connCount++;
              copyConns[ x.get('_id') ] = x.toJSON();
            } 
          }
        });

      this.app.set('clipboard', { nodes: copyNodes, connections: copyConns });

    },

    paste: function(){

      // build the command
      var cb = JSON.parse( JSON.stringify( this.app.get('clipboard') ) );

      var that = this;

      var nodes = {};

      var centerX = (1 / this.get('zoom')) * (this.get('offset')[0] + 80);
      var centerY = (1 / this.get('zoom')) * (this.get('offset')[1] + 80);

      var topLeft = _.reduce(cb.nodes, function(a, x){
        return [ Math.min(a[0], x.position[0] ), Math.min(a[1], x.position[1] )];
      }, [ 1e8, 1e8 ] );

      var nodeCount = 0;

      _.each(cb.nodes, function(x){

        // give new id for building the paste
        nodes[x._id] = x;

        var posX = x.position[0] - topLeft[0] + centerX;
        var posY = x.position[1] - topLeft[1] + centerY;

        nodes[x._id].position = [ posX, posY ];
        nodes[x._id]._id = that.makeId();
        nodeCount++;

      });

      if (nodeCount > 0) this.deselectAllNodes();

      var connections = {};

      _.each(cb.connections, function(x){

        if ( nodes[ x.endNodeId ] ){
          x.endNodeId = nodes[ x.endNodeId ]._id;
        }

        if ( nodes[x.startNodeId]){
          x.startNodeId = nodes[ x.startNodeId ]._id;
        }

        connections[x._id] = x;
        connections[x._id]._id = that.makeId();

      });

      // build the command
      var multipleCmd = { kind: "multiple", commands: [] };

      // build all of the nodes
      for (var id in nodes){
        var cpnode = cb.nodes[id];
        cpnode.kind = "addNode";
        multipleCmd.commands.push( cpnode );
      }

      // then builds the connections
      for (var id in connections){
        var cpConn = connections[id];
        cpConn.kind = "addConnection";
        multipleCmd.commands.push( cpConn );
      }

      this.runInternalCommand( multipleCmd );
      this.addToUndoAndClearRedo( multipleCmd );

      for (var id in nodes){
        var cpnode = cb.nodes[id];
        var functionId = cpnode.extra.functionId;
        if ( cpnode.typeName === "CustomNode" ){
          this.syncCustomNodesWithWorkspace( functionId );
        }
      }

    },

    addNodeByNameAndPosition: function(name, position){

      if (name === undefined || position === undefined ) return;

      var se = this.app.SearchElements.where({ creationName: name })[0];

      if (!se) {
        console.warn('Could not find node with name in Library: ' + name)
        return;
      }

      if (se.get('isCustomNode')){

        var sec = { typeName: "CustomNode"
                    , position: position
                    , _id: this.makeId()  };

        sec.extra = { functionId: se.get('functionId')
                      , functionName: se.get('functionName')
                      , creationName: se.get('creationName')
                      , displayName: se.get('displayName')
                      , numInputs: se.get('numInputs')
                      , numOutputs: se.get('numOutputs')
                    };

        return this.addNode( sec );

      }

      this.addNode({ typeName: name, position: position, _id: this.makeId() });

    },

    regenerateDependencies: function(){
      var that = this;
      var directDependencies = this.getCustomNodes().map(function(x){ return x.get('type').functionId; });
      var indirectDependencies = directDependencies.map(function(x){
          return that.app.get('workspaces').get(x); 
        }).map(function(x){
          if(x) return x.get('workspaceDependencyIds');
          return [];
      });
      var allDependencyLists = directDependencies.concat( indirectDependencies );
      return _.union.apply(null, allDependencyLists );
    },

    deselectAllNodes: function () {
        this.get('nodes').deselectAll();
    },

    addNode: function(data){

      this.deselectAllNodes();

      if ( data.typeName === "CustomNode" ){
        var id = data.extra.functionId;
        // do not allow recursion
        if (id === this.get('_id')) return;

        var ws = this.app.getLoadedWorkspace(id);
        if(this.isCyclicDependency(ws, this.get('_id')))
          return;

        this.addWorkspaceDependency( id, true );
        this.sendCompleteDefinitionRunner( id );
      }

      var datac = JSON.parse( JSON.stringify( data ) );
      datac.kind = "addNode";
      this.runInternalCommand(datac);
      this.addToUndoAndClearRedo( datac );

      if ( data.typeName === "CustomNode" ){
        this.syncCustomNodesWithWorkspace( id );
      }

      this.trigger('requestRun');

    },

    isCyclicDependency: function (workspace, id){

      if (workspace.get('workspaceDependencyIds').indexOf(id) !== -1)
        return true;

      var ids = workspace.get('workspaceDependencyIds');
      for(var i = 0; i < ids.length; i++)
      {
        var ws = this.app.getLoadedWorkspace(ids[i]);

        if(this.isCyclicDependency(ws, id))
          return true;
      };

      return false;
    },

    addWorkspaceDependency: function(id, watchDependency){

      this.resolver.addWorkspaceDependency(id, watchDependency);

    },

    syncCustomNodesWithWorkspace: function(workspace){

      this.resolver.syncCustomNodesWithWorkspace(workspace);

    },

    sendCompleteDefinitionRunner: function( id ){

      // custom node workspace
      if (!this.runner) {
        return;
      }

      var ws = this.app.getLoadedWorkspace( id );

      var allDeps = ws.regenerateDependencies().concat([id]);

      var that = this;
      allDeps.forEach(function(depId){
        that.sendDefinitionToRunner( depId );
      });

    },

    sendDefinitionToRunner: function( id ){

      // custom node workspace
      if (!this.runner) {
        return;
      }

      var ws = this.app.getLoadedWorkspace( id );

      this.runner.addDefinition( ws );

    },

    removeNode: function(data){

      var datac = JSON.parse( JSON.stringify( data ) );
      datac.kind = "removeNode";
      this.runInternalCommand(datac);
      this.addToUndoAndClearRedo( datac );

    },

    addConnection: function(data){

      var datac = JSON.parse( JSON.stringify( data ) );
      datac.kind = "addConnection";
      this.runInternalCommand(datac);
      this.addToUndoAndClearRedo( datac );

    },

    addConnectionAndRemoveExisting : function(startNodeId, startPort, endNodeId, endPort) {
      
      var multiCmd = { kind: "multiple", commands: [] };

      // remove any existing connection
      var endNode = this.get('nodes').get(endNodeId);
      if ( !endNode ) return this;
      var existingConnection = endNode.getConnectionAtIndex( endPort );

      if (existingConnection != null){
        // no need to notify Dynamo
        // it will delete this connector itself
        existingConnection.silentRemove = true;
        var rmConn = existingConnection.toJSON();
        rmConn.kind = "removeConnection";
        multiCmd.commands.push( rmConn );
      }

      var newConn = {
          kind: "addConnection",
          startNodeId: startNodeId,
          startPortIndex: startPort,
          endNodeId: endNodeId,
          endPortIndex: endPort,
          _id: this.app.makeId()
        };  

      multiCmd.commands.push( newConn );

      this.runInternalCommand( multiCmd );
      this.addToUndoAndClearRedo( multiCmd );

      return this;
    },

    removeConnection: function(data){

      var datac = JSON.parse( JSON.stringify( data ) );
      datac.kind = "removeConnection";
      this.runInternalCommand(datac);
      this.addToUndoAndClearRedo( datac );

    },

    removeConnectionFromCollection: function(connection){
        this.get('connections').remove(connection);
    },

    setNodeProperty: function(data){

      var datac = JSON.parse( JSON.stringify( data ) );
      datac.kind = "setNodeProperty";
      this.runInternalCommand(datac);
      this.addToUndoAndClearRedo( datac );

    },

    internalCommands: {

      multiple: function(data){

        // we prevent runs until all of the changes have been committed
        var previousRunAllowedState = this.runAllowed;
        this.runAllowed = false;

        // run all of the commands
        var that = this;
        data.commands.forEach(function(x){
          that.runInternalCommand.call(that, x);
        });

        // restore previous runAllowed state and, if necessary, do run
        this.runAllowed = previousRunAllowedState;
        if (this.runRejected) this.run();

      },

      addNode: function (data) {

        var node = nodeFactory.create({ config: data, searchElements: this.app.SearchElements });
        this.subscribeOnNodeEvents(node);
        this.get('nodes').add( node );

      },

      removeNode: function(data){

        var node = this.get('nodes').get(data._id);
        this.get('nodes').remove( node );

      }, 

      addConnection: function(data){

        var nodes = this.get('nodes');
        var options = {};
        options.startNode = nodes.get( data.startNodeId );
        options.endNode = nodes.get( data.endNodeId );
        if ( !options.startNode || !options.endNode )
            return;

        var conn = new Connection(data, options);
        this.get('connections').add( conn );
        nodes.get(conn.get('startNodeId')).connectPort( conn.get('startPortIndex'), true, conn);
        nodes.get(conn.get('endNodeId')).connectPort(conn.get('endPortIndex'), false, conn);

      }, 

      removeConnection: function(data){

        var conn = this.get('connections').get(data._id);
        if (conn) this.get('connections').remove( conn );

      }, 

      setNodeProperty: function(data){

        var node = this.get('nodes').get( data._id );
        var prop = data.property;
        if (!data.oldValue) data.oldValue = JSON.parse( JSON.stringify( node.get(prop) ) ); 

        node.set( prop, data.newValue );

      }

    },

    runInternalCommand: function(commandData){

      var cmd = this.internalCommands[ commandData.kind ];
      if (cmd){
        cmd.call(this, commandData);
        this.trigger('runCommand');
        return;
      } 

      console.warn('Could not find the command: ' + cmd.kind);

    },

    redo: function(){

      var rs = this.get('redoStack');

      if (rs.length === 0) {
        return console.warn("Nothing to redo!");
      }

      var data = rs.pop();
      this.get('undoStack').push(data);
      this.runInternalCommand(data);
      
    },

    undo: function(){

      var us = this.get('undoStack');
      if (us.length === 0) {
        return;
      }

      var command = us.pop();
      var undoCommand = this.invertCommand( command );
      this.get('redoStack').push( command );

      this.runInternalCommand(undoCommand);

    },

    invertCommand: function(cmd){

      var inverter = this.commandInversions[cmd.kind];
      if ( inverter ){
        return inverter.call(this, cmd);
      }

      return {};

    },

    commandInversions: {

      addNode: function( cmd ){

        var cmdcop = JSON.parse( JSON.stringify( cmd ) );
        cmdcop.kind = "removeNode";
        return cmdcop;

      },

      multiple: function( cmd ){

        var cmdcop = JSON.parse( JSON.stringify( cmd ) );

        var that = this;
        cmdcop.commands = cmdcop.commands.map(function(x){
          return that.invertCommand.call(that, x);
        });
        cmdcop.commands.reverse();
        
        return cmdcop;

      },

      removeNode: function( cmd ){

        var cmdcop = JSON.parse( JSON.stringify( cmd ) );
        cmdcop.kind = "addNode";
        return cmdcop;

      },

      addConnection: function(cmd){

        var cmdcop = JSON.parse( JSON.stringify( cmd ) );
        cmdcop.kind = "removeConnection";
        return cmdcop;

      },

      removeConnection: function(cmd){

        var cmdcop = JSON.parse( JSON.stringify( cmd ) );
        cmdcop.kind = "addConnection";
        return cmdcop;

      },

      setNodeProperty: function(cmd){

        var cmdcop = JSON.parse( JSON.stringify( cmd) ); 

        var temp = cmdcop.oldValue;
        cmdcop.oldValue = cmdcop.newValue;
        cmdcop.newValue = temp;
        return cmdcop; 

      }

    },

    run: function() {

      if ( !this.runAllowed || this.get('isCustomNode') ){
        this.runRejected = true;
        return;
      }

      this.runReject = false;

      if (this.get('nodes').length === 0){
        return;
      }
        
      var bottomNodes = this.get('nodes')
                            .filter(function(ele){
                              return ele.isOutputNode() && ele.get('type').outputs.length > 0;
                            }).map(function(ele){
                              return ele.get('_id');
                            });

      this.runner.run( bottomNodes );

    },

    startMarqueeSelect: function(startPosition) {

      this.set('marqueeStart', startPosition );
      this.set('marqueeEnd', startPosition );
      this.set('marqueeSelectEnabled', true);

      return this;
    },

    endMarqueeSelect: function() {

      this.set('marqueeSelectEnabled', false);
  
      return this;
    },

    startProxyConnection: function(startNodeId, nodePort, startPosition) {

      // Note: this is a quick fix for when the proxy connection
      this.set('proxyStartId', startNodeId);
      this.set('proxyStartPortIndex', nodePort);

      // set the initial properties for a dragging proxy
      this.proxyConnection.set('hidden', false);
      this.proxyConnection.set('startNodeId', startNodeId);

      this.proxyConnection.set('startPortIndex', nodePort );

      this.proxyConnection.set('startProxy', false );

      this.proxyConnection.set('endProxy', true );
      this.proxyConnection.set('endProxyPosition', startPosition);

      this.draggingProxy = true;

      this.trigger('startProxyDrag');
      return this;
    },

    completeProxyConnection: function(endNodeId, endPortIndex) {

      this.draggingProxy = false;
      this.trigger('endProxyDrag');

      var startNodeId = this.proxyConnection.get('startNodeId')
        , startPortIndex = this.proxyConnection.get('startPortIndex');

      this.addConnectionAndRemoveExisting(startNodeId, startPortIndex, endNodeId, endPortIndex);
      
      return this;
    },

    endProxyConnection: function() {

      this.proxyConnection.set('hidden', true);
      this.draggingProxy = false;
      return this;

    },

    updateNodeValues: function (param) {
        var i = 0,
            len = param.result.length,
            node,
            resultNode;

        for (; i < len; i++) {
            resultNode = param.result[i];
            node = this.get('nodes').get(param.result[i].nodeId);
            if (node) {
                node.updateValue(param.result[i]);
                if (resultNode.containsGeometryData) {
                    this.app.socket.send(JSON.stringify(new GeometryMessage(param.result[i].nodeId)));
                    if(this.pendingRequestsCount === 0){
                        this.app.trigger('show-progress');
                    }
                    this.pendingRequestsCount++;
                }
                else {
                    node.clearGeometry();
                }
            }
        }
    },

    updateCodeBlockNode: function (param) {
        var node = this.get('nodes').get(param.nodeId);
        if (node && node.updateData) {
            node.updateData(param);
        }
    },

    updateNodeGeometry: function(param) {
        var node = this.get('nodes').get(param.geometryData.nodeId);
        if (node && param.geometryData.graphicPrimitivesData) {
            node.updateNodeGeometry(param);
            this.pendingRequestsCount--;
            if(this.pendingRequestsCount === 0) {
                this.app.trigger('hide-progress');
            }
        }
    },

    removeNodeById: function ( id ) {
        if ( !id )
            return;
        // select only node that is needed to be deleted
        this.get( 'nodes' ).each(function (x) {
            if (x.get('_id') === id) {
                x.set('selected', true);
            }
            else {
                x.set('selected', false);
            }
        });
        this.removeSelected();
    },

    sync: function( method, model, options ) {
      return this.app.context.syncWorkspace(method, model, options);
    }

  });
});
