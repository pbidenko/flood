define(['backbone', 'Workspaces', 'Node', 'Login', 'Workspace', 'SearchElements', 'staticHelpers', 'Storage', 'settings'],
    function(Backbone, Workspaces, Node, Login, Workspace, SearchElements, helpers, Storage, settings){

  return Backbone.Model.extend({

    idAttribute: '_id',

    url: function() {
      return '/mys';
    },

    defaults: {
      name: "DefaultSession",
      workspaces: new Workspaces(),
      backgroundWorkspaces: [],
      currentWorkspace: null,
      showingBrowser: false,
      showingSearch: false,
      showingFeedback: false,
      showingHelp: false,
      isFirstExperience: false,
      clipBoard: {},
      proxyNodesDependencies: [],
      availableCustomNodeDefinitions: []
    },

    initialize: function(args, options){
      this.on('change:currentWorkspace', this.updateCurrentWorkspace, this);
      this.updateCurrentWorkspace();

      this.login = new Login({}, { app: this });

      this.SearchElements = new SearchElements({app:this});
      this.SearchElements.reset();
      this.SearchElements.fetch();
      this.listenTo( this, 'saved-file-received:event', this.downloadFile);
      // when we upload a custom node definition we should make all its instances not proxy anymore
      this.listenTo( this, 'proxy-nodes-data-received:event', this.setProxyNodesDependenciesData);

      this.context = new Storage({ baseUrl: settings.storageUrl });

      this.get('workspaces').on('remove', this.workspaceRemoved, this);
    },

    setProxyNodesDependenciesData: function (data) {
        if (this.get('proxyNodesDependencies').indexOf(data) == -1) {
            this.get('proxyNodesDependencies').push(data);
        }

        if (this.get('availableCustomNodeDefinitions').indexOf(data.customNodeId) > -1) {
            this.updateDependenciesAndNodes(data);
        }
    },

    setAvailableCustomNodeDefinitions: function(guid) {
        if (this.get('availableCustomNodeDefinitions').indexOf(guid) == -1) {
            this.get('availableCustomNodeDefinitions').push(guid);
        }

        var data = this.get('proxyNodesDependencies').filter(function (element) {
            return element.customNodeId === guid;
        });

        if (data.length) {
            this.updateDependenciesAndNodes(data[0]);
        }
    },
    
    workspaceIdsAwaitingParse : [],
    
    updateDependenciesAndNodes: function(data) {
        // get workspace that contains proxy instances
        var workspaces = data.workspaceId ? this.get('workspaces').where({ guid: data.workspaceId }) :
            this.get('workspaces').where({ isCustomNode: false });
        // get workspace-custom node definition, we need its id to set dependency
        var customNode = this.get('workspaces').where({ guid: data.customNodeId });
        var customNodeId;

        if (workspaces.length > 0 && customNode.length > 0) {
            var workspace = workspaces[0];
            customNodeId = customNode[0].get('_id');

            for (var i = 0; i < data.nodesIds.length; i++) {
                var nodes = workspace.get('nodes').where({ _id: data.nodesIds[i] });
                if (nodes.length) {
                    var node = nodes[0];

                    if (node.get('extra')) {
                        node.get('extra').isProxy = false;
                    }

                    node.set('isProxy', false);

                    if (customNodeId && workspace.get('workspaceDependencyIds').indexOf(customNodeId) == -1) {
                        node.get('extra').functionId = customNodeId;
                        workspace.addWorkspaceDependency(customNodeId);
                    }
                }
            }
        }

        var index = this.get('availableCustomNodeDefinitions').indexOf(data.customNodeId);
        this.get('availableCustomNodeDefinitions').remove(index, index);

        index = this.get('proxyNodesDependencies').indexOf(data);
        this.get('proxyNodesDependencies').remove(index, index);
    },
    parse : function(resp) {

      var old = this.get('workspaces').slice();
      this.workspaceIdsAwaitingParse = _.pluck( resp.workspaces, '_id');

      this.get('workspaces').add(resp.workspaces, {app: this});
      this.get('workspaces').remove(old);

      this.workspaceIdsAwaitingParse = [];
      resp.workspaces = this.get('workspaces');
      return resp;
    },

    fetch : function(options){
      this.login.fetch();
      Backbone.Model.prototype.fetch.call(this, options);
    },

    toJSON : function() {

        if (this._isSerializing) {
            return this.id || this.cid;
        }

        this._isSerializing = true;

        var json = _.clone(this.attributes);

        _.each(json, function(value, name) {
            _.isFunction(value.toJSON) && (json[name] = value.toJSON());
        });

        this._isSerializing = false;

      // dont save the background workspaces, they will be dynamically
      // loaded on startup
      var backWs = this.get('backgroundWorkspaces');
      json.workspaces = json.workspaces.filter(function(x){
        return !_.contains( backWs, x._id );
      });
        return json;
    },

    makeId: function(){
        return helpers.guid();
    },

    enableAutosave: function(){

      this.get('workspaces').on('add remove', function(){ this.sync("update", this); }, this );
      this.on('change:currentWorkspace', function(){ this.sync("update", this); }, this);
      this.on('change:isFirstExperience', function(){ this.sync("update", this); }, this);
      this.on('change:backgroundWorkspaces', function(){ this.sync("update", this); }, this);

    },

    newNodePosition: [0,0],

    getCurrentWorkspace: function(){
      return this.get('workspaces').get( this.get('currentWorkspace') );
    },

    getLoadedWorkspace: function(id){
      return this.get('workspaces').get(id);
    },

    newWorkspace: function( callback ){

      this.context.createNewWorkspace().done(function(data){

        var ws = new Workspace(data, {app: this });
        this.get('workspaces').add( ws );
        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }.bind(this)).fail(function(){

        console.error("failed to get new workspace");

      });

    },

    newNodeWorkspace: function( callback, silent ) {

      this.context.createNewNodeWorkspace().done(function(data){

        data.isCustomNode = true;
        data.guid = this.makeId();

        // if we need to not send it to the dynamo
        if (silent) {
            data.notNotifyServer = true;
        }
        var ws = new Workspace(data, { app: this });

        this.get('workspaces').add( ws );
        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }.bind(this)).fail(function(){

        console.error("failed to get new workspace");

      });

    },

    loadWorkspaceDependency: function(id){

      if ( _.contains( this.workspaceIdsAwaitingParse, id ) ) return;

      this.setWorkspaceToBackground( id );
      this.loadWorkspace( id );

    },

    loadWorkspace: function( id, callback, silent, makeCurrent ) {

        this.context.loadWorkspace(id).done(function (data) {

            var ws = this.get('workspaces').get(id);
            if (ws) return;

            // if we need to not send it to the dynamo
            if (silent) {
                data.notNotifyServer = true;
            }
            ws = new Workspace(data, {app: this});
            this.get('workspaces').add(ws);

            if (makeCurrent)
                this.set('currentWorkspace', ws.get('_id'));

            if (callback)
                callback(ws);

        }.bind(this)).fail(function () {

            console.error("failed to get workspace with id: " + id);
        });
    },

    isBackgroundWorkspace: function(id){
      return this.get('backgroundWorkspaces').indexOf(id) != -1;
    },

    setWorkspaceToBackground: function(id){

      if ( !this.isBackgroundWorkspace(id) ){
        var copy = this.get('backgroundWorkspaces').slice(0);
        copy.push(id);
        this.set('backgroundWorkspaces', copy);
      }

    },

    removeWorkspaceFromBackground: function( id ){

      if ( _.contains( this.get('backgroundWorkspaces'), id) ){
        var copy = this.get('backgroundWorkspaces').slice(0);
        copy.remove(copy.indexOf(id));
        this.set('backgroundWorkspaces', copy);
      }

    },

    openWorkspace: function( id, callback ){

      this.removeWorkspaceFromBackground( id );

      var ws = this.get('workspaces').get(id);

      if ( ws ){
        this.set('currentWorkspace', id);
      }

      this.loadWorkspace( id, function(ws){

        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }.bind(this));

    },

    updateCurrentWorkspace: function(){

      if (this.get('workspaces').length === 0)
        return;

      this.get('workspaces').each(function(ele){
        ele.set('current', false);
      });

      if ( this.get('currentWorkspace') === null || !this.get('workspaces').get(this.get('currentWorkspace'))) {
        var ele = this.get('workspaces').at(0);
        this.set('currentWorkspace', ele.get('_id') );
      } 

      this.get('workspaces').get(this.get('currentWorkspace')).set('current', true);
    },

    downloadFile: function (param) {
          var byteArray = helpers.getByteArray(param.fileContent);

          var blob = new Blob([byteArray], { type : 'application/octet-stream' });
          var url = window.URL || window.webkitURL;
          var downloadUrl = url.createObjectURL(blob);
          var downloadElement = document.createElement('a');
          downloadElement.style = 'display: none;';
          downloadElement.href = downloadUrl;
          downloadElement.download = param.fileName;
          downloadElement.click();
    }
  });
});




