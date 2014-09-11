define(['backbone', 'Workspaces', 'Node', 'Login', 'Workspace', 'SearchElements', 'staticHelpers', 'Storage'],
    function(Backbone, Workspaces, Node, Login, Workspace, SearchElements, helpers, Storage){

  return Backbone.Model.extend({

    idAttribute: "_id",

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
      clipBoard: {}
    },

    initialize: function(args, options) {
        this.on('change:currentWorkspace', this.updateCurrentWorkspace, this);
        this.updateCurrentWorkspace();

        this.login = new Login({}, { app: this });

        this.SearchElements = new SearchElements({app: this});
        this.SearchElements.reset();
        this.SearchElements.fetch();

        this.context = new Storage({ baseUrl: '' });
    },

    parse : function(resp) {

      var old = this.get('workspaces').slice();
      this.get('workspaces').add(resp.workspaces, {app: this});
      this.get('workspaces').remove(old);

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

      var workspaces = this.get('workspaces').where({ _id: id });

      if (workspaces.length === 0) {
        return undefined;
      }

      return workspaces[0];

    },

    newWorkspace: function( callback ) {

      this.context.createNewWorkspace().done(function(data){

        var ws = new Workspace(data, {app: that });
        this.get('workspaces').add( ws );
        this.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );
        }.bind(this)).fail(function () {

            console.error("failed to get new workspace");

        });
    },

    newNodeWorkspace: function( callback ){

        this.context.createNewNodeWorkspace().done(function(data){

        data.isCustomNode = true;
        data.guid = this.makeId();

        var ws = new Workspace(data, { app: this });

        this.get('workspaces').add( ws );
        this.set('currentWorkspace', ws.get('_id') );
            if (callback) {
                callback(ws);
            }

        }.bind(this)).fail(function () {

            console.error("failed to get new workspace");

        });
    },

    loadWorkspace: function( id, callback ) {

        var ws = this.get('workspaces').get(id);
        if (ws)
            return;

        this.context.loadWorkspace(id).done(function(data){

          var ws = this.get('workspaces').get(id);
            if (ws) return;
            var ws = new Workspace(data, {app: this});
            this.get('workspaces').add(ws);
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

      if ( this.isBackgroundWorkspace(id) ){

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

        this.loadWorkspace(id, function (ws) {

            this.set('currentWorkspace', ws.get('_id'));
            if (callback) {
                callback(ws);
            }
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
    }
  });
});




