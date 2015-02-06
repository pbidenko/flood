define(['backbone', 'FLOOD'], 
    function(Backbone, FLOOD) {

  return Backbone.Model.extend({

    initialize: function(atts, arr) {

      this.workspace = arr.workspace;
      this.app = arr.app;

    },

    resolveAll: function(){
      this.initializeDependencies( this.workspace.get('workspaceDependencyIds') );
    },

    initializeDependencies: function(depIds){

      if (depIds.length === 0 || !depIds ) {
        console.log(this.workspace.get('name') + " has no dependencies");
        this.workspace.initializeRunner();
        this.workspace.listenTo( this.app, 'computation-completed:event', this.workspace.updateNodeValues);
        this.workspace.listenTo( this.app, 'geometry-data-received:event', this.workspace.updateNodeGeometry);
        this.workspace.runAllowed = true;
        this.workspace.trigger('requestRun');
        return;
      }

      this.awaitedWorkspaceDependencyIds = [];

      console.log(this.workspace.get('name') + " has dependencies: " + JSON.stringify( depIds) );

      this.listenTo(this.app.get('workspaces'), 'add', this.resolveDependency);

      depIds.forEach(this.awaitOrResolveDependency.bind(this));
    },

    cleanupDependencies: function(){
      this.workspace.set( 'workspaceDependencyIds', this.workspace.regenerateDependencies() );
    },

    awaitOrResolveDependency: function(id){

      var ws = this.app.getLoadedWorkspace(id);
      if (ws) {
        this.workspace.sendDefinitionToRunner( id );
        this.watchOneDependency( ws );
        this.syncCustomNodesWithWorkspace( ws );
        return this.resolveDependency(ws);
      }
 
      this.awaitedWorkspaceDependencyIds.push(id);
      this.app.loadWorkspaceDependency( id ); 

    },

    resolveDependency: function(workspace){

      if (workspace.id === this.workspace.id) return;

      if (this.workspace.runner)
        return;

      if (!workspace.runner)
        return;

      var index = this.awaitedWorkspaceDependencyIds.indexOf( workspace.id );

      if (index >= 0) {
        this.awaitedWorkspaceDependencyIds.remove(index);
        this.workspace.sendDefinitionToRunner( workspace.id );
        this.watchOneDependency( workspace );
        this.syncCustomNodesWithWorkspace( workspace );
      }

      if (this.awaitedWorkspaceDependencyIds.length === 0) {
        this.workspace.initializeRunner();
        this.workspace.listenTo( this.app, 'computation-completed:event', this.workspace.updateNodeValues);
        this.workspace.listenTo( this.app, 'geometry-data-received:event', this.workspace.updateNodeGeometry);
        this.workspace.runAllowed = true;
        this.workspace.trigger('requestRun');
        this.app.get('workspaces').add(this.workspace);
        this.cleanupDependencies();
      }

    },

    addWorkspaceDependency: function( id, watch ){

      var ws = this.app.getLoadedWorkspace(id);

      if (!ws)
          throw new Error("You tried to add an unloaded workspace as a dependency!");

      var depDeps = ws.get('workspaceDependencyIds')
        , currentDeps = this.workspace.get('workspaceDependencyIds')
        , unionDeps = _.union( [id], currentDeps, depDeps );

      this.workspace.set( 'workspaceDependencyIds', unionDeps );

      if (watch)
          this.watchDependency( id );
    },

    watchDependency: function( id ){

      var ws = this.app.getLoadedWorkspace(id);

      var allDepWorkspaces = ws.get('workspaceDependencyIds').concat( id );

      allDepWorkspaces.forEach(function(depWs){
        this.watchOneDependency( depWs );
      }.bind( this ) );

    },

    watchedDependencies: {},

    watchOneDependency: function( customNodeWorkspace ) {

        if (!customNodeWorkspace.id) {
            customNodeWorkspace = this.app.getLoadedWorkspace(customNodeWorkspace);
        }

        if (this.watchedDependencies[ customNodeWorkspace.id ]) return;
        this.watchedDependencies[ customNodeWorkspace.id ] = true;

        var sync = function () {
                this.syncCustomNodesWithWorkspace(customNodeWorkspace)
            }.bind(this)
            , syncAndRequestRun = function () {
                this.syncCustomNodesWithWorkspace(customNodeWorkspace);
                this.workspace.trigger('requestRun');
            }.bind(this)
            , syncAndUpdateRunner = function () {
                this.syncCustomNodesWithWorkspace(customNodeWorkspace);
                this.workspace.trigger('updateRunner');
            }.bind(this);

        this.listenTo(customNodeWorkspace, 'change:name', sync);
        this.listenTo(customNodeWorkspace, 'change:workspaceDependencyIds', sync);
        this.listenTo(customNodeWorkspace, 'requestRun', syncAndRequestRun);
        this.listenTo(customNodeWorkspace, 'updateRunner', syncAndUpdateRunner);
    },

    syncCustomNodesWithWorkspace: function(workspace){

      if (typeof workspace === "string") workspace = this.app.getLoadedWorkspace(workspace);

      this.syncDependencies( workspace );
      this.syncDirectlyAffectedCustomNodesWithWorkspace( workspace );
      this.syncIndirectlyAffectedCustomNodesWithWorkspace( workspace );

    },

    syncDependencies: function( depWorkspace ){

      // if a new dependency is now added, make sure we add it to this workspace's runner
      var currDeps = this.workspace.get('workspaceDependencyIds');
      var depDeps = depWorkspace.get('workspaceDependencyIds');
      
      var newDeps = _.difference( depDeps, currDeps );

      newDeps.forEach(function(id){
        this.workspace.sendDefinitionToRunner( this.app.getLoadedWorkspace( id ) );
        this.addWorkspaceDependency( id, true );
      }.bind(this));

    },

    syncDirectlyAffectedCustomNodesWithWorkspace: function(workspace){

      // get the nodes directly affected by this change
      var directlyAffectedCustomNodes = this.workspace.getCustomNodesWithId(workspace.id);

      // get the workspace inputs/outputs
      var inputNodes = workspace.getCustomNodeInputsOutputs();
      var outputNodes = workspace.getCustomNodeInputsOutputs(true);

      directlyAffectedCustomNodes.forEach(function(x){

        // cleanup hanging input connections
          var inputConns = x.get('inputConnections');
          var diff = inputNodes.length - inputConns.length;

          if (diff > 0){
            for (var i = 0; i < diff; i++){
              inputConns.push([]);
            }
          } else {
            for (var i = 0; i < -diff; i++){

              var inConn = x.getConnectionAtIndex(inputConns.length - 1);

              if (inConn != null){
                this.workspace.removeConnection(inConn);
              }

              inputConns.pop();
            }

          }

        // clean up hanging output connections

          var outputConns = x.get('outputConnections');
          var diff2 = outputNodes.length - outputConns.length;

          if (diff2 > 0){

            for (var i = 0; i < diff2; i++){
              outputConns.push( [] );
            }

          } else {

            for (var i = 0; i < -diff2; i++){

              var ocs = x.get('outputConnections')
                .last();

              if (ocs) {
                  ocs.slice(0).forEach(function (outConn) {
                      this.workspace.removeConnection(outConn);
                  }.bind(this))
              }

              outputConns.pop();
            }

          }

        // set the type

          x.get('type').functionName = workspace.get('name');
          x.get('type').setNumInputs(inputNodes.length);
          x.get('type').setNumOutputs(outputNodes.length);

        // save to extra 

          x.set('displayedName', workspace.get('name'));

          var extraCop = JSON.parse( JSON.stringify( x.get('extra') ) );

          extraCop.numInputs = inputNodes.length;
          extraCop.numOutputs = outputNodes.length;
          extraCop.functionName = workspace.get('name');

        // sync the input names  ------------------------

          extraCop.inputNames = inputNodes.map(function(inputNode, ind){
            var ex = inputNode.get('extra');

            if (ex === undefined || !ex.name || ex.name === "" ){
              return String.fromCharCode(97 + ind);
            } 

            return ex.name;
          });

          extraCop.inputNames.forEach(function(name, ind) {
            x.get('type').inputs[ind].name = name;
          });

        // sync the output names  ------------------------

          extraCop.outputNames = outputNodes.map(function(outputNode, ind){
            var ex = outputNode.get('extra');

            if (ex === undefined || !ex.name || ex.name === "" ){
              return String.fromCharCode(97 + ind);
            } 

            return ex.name;
          });

          extraCop.outputNames.forEach(function(name, ind) {
            x.get('type').outputs[ind].name = name;
          });

        // silently set for serialization
        x.set('extra', extraCop);

        // triggers a redraw
        x.trigger('requestRender');

        // update runner
        x.trigger('update-node');

      }.bind(this));

      if (directlyAffectedCustomNodes.length > 0) this.workspace.sync('update', this.workspace);

    },

    syncIndirectlyAffectedCustomNodesWithWorkspace: function(workspace){

      var indirectlyAffectedNodes = this.getIndirectlyAffectedCustomNodes( workspace.id );

      indirectlyAffectedNodes.forEach(function(x){
        x.trigger('update-node');
      });

      if (indirectlyAffectedNodes.length > 0) this.workspace.sync('update', this.workspace );

    },

    getIndirectlyAffectedCustomNodes: function(functionId){

      var cns = this.workspace.getCustomNodes();

      var thisApp = this.app;
      return cns.filter(function(cn){

        var id = cn.get('type').functionId
          , ws = thisApp.getLoadedWorkspace( id );

        if (!ws) return false;

        var wsd = ws.get('workspaceDependencyIds');
        return id != functionId && wsd.indexOf( functionId ) != -1;

      });

    }


  });

});



