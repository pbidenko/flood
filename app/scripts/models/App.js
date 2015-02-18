define(['backbone', 'Workspaces', 'Node', 'Login', 'Workspace', 'SearchElements', 'staticHelpers',
        'Storage', 'settings'],
    function(Backbone, Workspaces, Node, Login, Workspace, SearchElements, helpers,
             Storage, settings) {

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
      showingShare: false,
      showingHelp: false,
      isFirstExperience: false,
      clipBoard: {}
    },

    initialize: function(args, options){
      this.listenTo(this, 'change:currentWorkspace', this.updateCurrentWorkspace);
      this.updateCurrentWorkspace();

      this.login = new Login({}, { app: this });

      this.SearchElements = new SearchElements({app:this});
      this.SearchElements.reset();
      this.SearchElements.fetch();

      this.context = new Storage({ baseUrl: settings.storageUrl });

      this.listenTo(this, 'code-block-node-updated:event', this.updateCodeBlockNode);
      this.listenTo(this, 'array-items-received:event', this.processArrayItems);
      this.listenTo(this.get('workspaces'), 'sync-workspace:event', this.syncWorkspace);
      this.listenTo(this.get('workspaces'), 'loadWorkspaceDependency', this.loadWorkspaceDependency);
      this.listenTo(this.get('workspaces'), 'loadWorkspace', this.loadWorkspace);
      this.listenTo(this.get('workspaces'), 'openWorkspace', this.openWorkspace);
      this.listenTo(this.get('workspaces'), 'setClipboard', function(cb){this.clipBoard = cb});
      this.listenTo(this.get('workspaces'), 'pastFromClipboard', function(id){this.getLoadedWorkspace(id).pasteFromClipboard(this.clipBoard)});
      this.listenTo(this.get('workspaces'), 'setCurrentWorkspace', function(id){this.set('currentWorkspace', id )});
    },

    workspaceIdsAwaitingParse : [],

    parse : function(resp) {

      var old = this.get('workspaces').slice();
      this.workspaceIdsAwaitingParse = _.pluck( resp.workspaces, '_id');

      this.get('workspaces').add(resp.workspaces, {workspaces: this.get('workspaces'), searchElements: this.SearchElements, socket: this.socket});
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

    enableAutosave: function() {

        this.listenTo(this.get('workspaces'), 'add remove', function () {
            this.sync("update", this);
        });

        this.listenTo(this, 'change:currentWorkspace', function () {
            this.sync("update", this);
        });

        this.listenTo(this, 'change:isFirstExperience', function () {
            this.sync("update", this);
        });

        this.listenTo(this, 'change:backgroundWorkspaces', function () {
            this.sync("update", this);
        });
    },

    newNodePosition: [0,0],

    getCurrentWorkspace: function(){
      return this.get('workspaces').get( this.get('currentWorkspace') );
    },

    getLoadedWorkspace: function(id){
      return this.get('workspaces').get(id);
    },

    updateCodeBlockNode: function (data) {
        var workspaces = data.workspaceGuid ?
            this.get('workspaces').where({ guid: data.workspaceGuid }) :
            this.get('workspaces').where({ isCustomNode: false });
        if (workspaces.length) {
            workspaces[0].updateCodeBlockNode(data);
        }
    },

    processArrayItems: function(data) {
        var workspaces = this.get('workspaces').where({ isCustomNode: false });
        if (workspaces.length) {
            workspaces[0].appendArrayItems(data);
        }
    },

    newWorkspace: function( callback ){

      this.context.createNewWorkspace().done(function(data){

        data.name = 'Home';
        var ws = new Workspace(data, {workspaces: this.get('workspaces'), searchElements: this.SearchElements, socket: this.socket });
        this.get('workspaces').add( ws );
        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }.bind(this)).fail(function(){

        console.error("failed to get new workspace");

      });

    },

    newNodeWorkspace: function( callback, customNodeName, lazyInit  ) {
      this.context.createNewNodeWorkspace().done(function(data){

        data.isCustomNode = true;
        data.guid = this.makeId();
        data.name = customNodeName;

        var attr = { workspaces: this.get('workspaces'), searchElements: this.SearchElements, socket: this.socket };
        // if we need to not send it to the dynamo
        if (lazyInit ) {
            data.notNotifyServer = true;
            attr.lazyInit  = true;
        }
        var ws = new Workspace(data, attr);

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
            var allWorkspaces = this.get('workspaces');
            var ws = allWorkspaces.get(id);
            if (ws) return;

            // if we need to not send it to dynamo
            if (silent) {
                data.notNotifyServer = true;
            }

            // if we try to open another Home ws
            // currently opened one should be closed
            // because only one Home tab is allowed
            if (!data.isCustomNode) {
                this.trigger('replace-old-home');
                var homes = allWorkspaces.where({ isCustomNode: false });
                if (homes.length) {
                    allWorkspaces.remove(homes[0]);
                }
            }

            ws = new Workspace(data, {
                workspaces: this.get('workspaces'), searchElements: this.SearchElements, socket: this.socket
            });

            allWorkspaces.add(ws);
            
            if (makeCurrent) {
                this.set('currentWorkspace', ws.get('_id'));
            }

            if (callback) {
                callback(ws);
            }

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

    openWorkspace: function( id, callback, silent ){

      this.removeWorkspaceFromBackground( id );

      var ws = this.get('workspaces').get(id);

      if ( ws ){
        this.set('currentWorkspace', id);
      }

      this.loadWorkspace( id, function(ws){

        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }.bind(this), null, silent);

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

    syncWorkspace:function(ws){
      this.context.syncWorkspace(ws.method, ws.model, ws.options);
    }

  });
});




