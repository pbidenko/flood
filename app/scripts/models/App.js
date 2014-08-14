define(['backbone', 'Workspaces', 'Node', 'Login', 'Workspace', 'SearchElements', 'staticHelpers', 'SearchElement', 'ModelsListMessage'],
    function(Backbone, Workspaces, Node, Login, Workspace, SearchElements, helpers, SearchElement, ModelsListMessage){

  return Backbone.Model.extend({

    idAttribute: "_id",

    url: function() {
      return '/mys';
    },

    defaults: {
      name: "DefaultSession",
      workspaces: new Workspaces(),
      currentWorkspace: null,
      showingBrowser: false,
      showingSearch: false,
      showingHelp: false,
      clipBoard: {}
    },

    initialize: function(args, options){
      this.on('change:currentWorkspace', this.updateCurrentWorkspace, this);
      this.updateCurrentWorkspace();

      this.login = new Login({}, { app: this });

      this.SearchElements = new SearchElements({app:this});
	  // the models array has a single empty element at start (not sure why)
	  this.SearchElements.models.length = 0;
    },

    parse : function(resp) {

      var old = this.get('workspaces').slice();
      this.get('workspaces').add(resp.workspaces, {app: this});
      this.get('workspaces').remove(old);

      resp.workspaces = this.get('workspaces');
      return resp;

    },

    fetch : function(options){
      var that = this;
      this.login.fetch();
      this.SearchElements.fetch().always(function(){
          Backbone.Model.prototype.fetch.call(that, options);
      });
    },

    // override of toJSON to support recursive serialization 
    // of child attributes
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

    newWorkspace: function( callback ){

      var that = this;

      $.get("/nws", function(data){

        var ws = new Workspace(data, {app: that });
        that.get('workspaces').add( ws );
        that.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }).fail(function(){

        console.error("failed to get new workspace");

      });

    },

    newNodeWorkspace: function( callback ){

      var that = this;

      $.get("/nws", function(data){

        data.isCustomNode = true;
        data.guid = that.makeId();

        var ws = new Workspace(data, { app: that });

        that.get('workspaces').add( ws );
        that.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      }).fail(function(){

        console.error("failed to get new workspace");

      });

    },

    loadWorkspace: function( id, callback ){

      var ws = this.get('workspaces').get(id);
      if(ws) return;

      var that = this;

      $.get("/ws/" + id, function(data){

        var ws = that.get('workspaces').get(id);
        if(ws) return;

        var ws = new Workspace(data, {app: that});
        that.get('workspaces').add( ws );
        if (callback) callback( ws );

      }).fail(function(){

        console.error("failed to get workspace with id: " + id);

      });

    },

    openWorkspace: function( id, callback ){

      var ws = this.get('workspaces').get(id);

      if ( ws ){
        this.set('currentWorkspace', id);
      }

      var that = this;

      this.loadWorkspace( id, function(ws){

        that.set('currentWorkspace', ws.get('_id') );
        if (callback) callback( ws );

      });

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




