define([  'backbone', 
          'App', 
          'WorkspaceView', 
          'Search',
          'SearchElement',
          'SearchView',
          'WorkspaceControlsView', 
          'WorkspaceTabView', 
          'Workspace',
          'WorkspaceBrowser',
          'WorkspaceBrowserView',
          'HelpView',
          'Help',
          'LoginView',
          'Login',
          'FeedbackView',
          'Feedback', 
          'fastclick' ],
          function(Backbone, App, WorkspaceView, Search, SearchElement, SearchView, WorkspaceControlsView, 
            WorkspaceTabView, Workspace, WorkspaceBrowser, WorkspaceBrowserView, HelpView, 
            Help, LoginView, Login, FeedbackView, Feedback, fastclick ) {

  return Backbone.View.extend({

    el: '#app',

    initialize: function() { 
      
      var f = new fastclick(document.body);

      this.listenTo(this.model, 'change', this.render, this);
      this.listenTo(this.model, 'ws-data-loaded', this.zoomresetClick);

      this.$workspace_tabs = this.$('#workspace-tabs');

      this.model.get('workspaces').on('add', this.addWorkspaceTab, this);
      this.model.get('workspaces').on('remove', this.removeWorkspaceTab, this);
      this.model.on('change:showingSettings', this.viewSettings, this);
      this.model.on('change:showingFeedback', this.viewFeedback, this);
      this.model.on('change:showingHelp', this.viewHelp, this);
      this.model.on('change:showingBrowser', this.viewBrowser, this);
      this.model.on('hide-search', this.hideSearch, this);
      this.model.on('show-progress', this.showProgress, this);
      this.model.on('hide-progress', this.hideProgress, this);

      this.model.login.on('change:isLoggedIn', this.initBrowserView, this);
      this.model.login.on('change:isLoggedIn', this.showHelpOnFirstExperience, this );
      this.model.login.on('change:isFirstExperience', this.showHelpOnFirstExperience, this );

      $(document).bind('keydown', $.proxy( this.keydownHandler, this) );

      // deactivate the context menu
      $(document).bind("contextmenu", function (e) { return false; });

        //Render application inside init method, because if App model doesn't use http service as storage,
        //we will never get to the render event, because model is already initialized and therefore it
        //won't generate 'change' event
      this.render();
    },

    events: {
      'click .workspaces_curtain' : 'endSearch',
      'click #help-button': 'toggleHelp',
      'click #settings-button': 'showSettings',
      'click #workspace_hide' : 'toggleViewer',
      'click #workspace-browser-button': 'toggleBrowser',
      'click #feedback-button': 'toggleFeedback',

      'click #zoomin-button': 'zoominClick',
      'click #zoomout-button': 'zoomoutClick',
      'click #zoomreset-button': 'zoomresetClick',

      'click #new-home-workspace' : 'newHomeClick',
      'click #add-node-workspace' : 'newNodeWorkspace',

      'mouseover #add-workspace-button': 'showAddWorkspaceSelect',
      'mouseout #add-workspace-button': 'hideAddWorkspaceSelect',
      'mouseover #add-workspace-select-element': 'showAddWorkspaceSelect',
      'mouseout #add-workspace-select-element': 'hideAddWorkspaceSelect',

      // touch
      'touchstart #add-workspace-button': 'toggleAddWorkspaceSelect'

    },

    toggleAddWorkspaceSelect: function(){

      $('#add-workspace-select-element').toggle();

    },

    newHomeClick: function () {
      this.newWorkspace();
    },

    showHelpOnFirstExperience: function(){

      var that = this;

      setTimeout(function(){
        if (that.model.login.get('isLoggedIn') && that.model.get('isFirstExperience')){
          that.model.set( 'showingHelp', true);
        } else {
          that.model.set( 'showingHelp', false);
        }
      }, 800);

    },

    showAddWorkspaceSelect: function(){
      $('#add-workspace-select-element').show();
    },

    hideAddWorkspaceSelect: function(){
      $('#add-workspace-select-element').hide();
    },

    newWorkspace: function(){
      this.model.newWorkspace();
      this.hideAddWorkspaceSelect();
    },

    newNodeWorkspace: function() {
        var customNodeName = prompt('Provide a name for the Custom Node', 'New custom node');
        if (!customNodeName || !customNodeName.trim().length)
            return;

        customNodeName = customNodeName.trim();

        this.model.newNodeWorkspace(null, customNodeName);
        this.hideAddWorkspaceSelect();
    },

    keydownHandler: function(e){

      var isBackspaceOrDelete = e.keyCode === 46 || e.keyCode === 8;

      if ( !(e.metaKey || e.ctrlKey) && !isBackspaceOrDelete ) return;

      // do not capture from input
      if (e.originalEvent.srcElement && e.originalEvent.srcElement.nodeName === "INPUT") return;
      if (e.target.nodeName === "INPUT") return;

      // do not capture from textarea
      if (e.originalEvent.srcElement && e.originalEvent.srcElement.nodeName === "CODE" ) return;
      if (e.target.nodeName === "CODE") return;

      // keycodes: http://css-tricks.com/snippets/javascript/javascript-keycodes/
      switch (e.keyCode) {
        case 78:
          this.newWorkspace();
          return e.preventDefault();
      }

      this.currentWorkspaceView.keydownHandler(e);
    },

    endSearch: function() {
      this.model.set('showingSearch', false);
    },

    toggleBrowser: function(e){

      if (this.model.get('showingBrowser') === true){
        $(e.currentTarget).removeClass('workspace-browser-button-active');
        this.model.set('showingBrowser', false);
      } else {
        $(e.currentTarget).addClass('workspace-browser-button-active');
        this.model.set('showingBrowser', true);
      }

    },

    hideSearch: function(){
      this.model.set('showingSearch', false);
      this.workspaceControlsView && this.workspaceControlsView.hideSearch();
    },

    initBrowserView: function () {
      if (!this.model.login.get('isLoggedIn'))
          return;

      if (!this.browserView){
        this.model.workspaceBrowser = new WorkspaceBrowser({ app: this.model });
        this.browserView = new WorkspaceBrowserView({model: this.model.workspaceBrowser }, { app: this.model });
        this.browserView.render();
      }
    },

    viewBrowser: function() {
        if (!this.model.login.get('isLoggedIn'))
            return;

        if (!this.browserView) {
            this.initBrowserView();
        }

        if (this.model.get('showingBrowser') === true) {
            this.browserView.$el.show();
        }
        else {
            this.browserView.$el.hide();
        }
    },

    viewHelp: function(){
      if (!this.helpView){
        this.helpView = new HelpView({model: new Help() }, { app: this.model });
      }
      
      if (this.model.get('showingHelp') === true){
        this.focusWorkspace();
        this.helpView.render();
        this.helpView.$el.fadeIn();  
      } else {
        this.helpView.$el.fadeOut();
      }
    },

    viewFeedback: function(){
      if (!this.feedbackView){
        this.feedbackView = new FeedbackView({model: new Feedback() }, { app: this.model });
        this.feedbackView.render();
      }

      if (this.model.get('showingFeedback') === true){
        this.feedbackView.$el.fadeIn();  
      } else {
        this.feedbackView.$el.fadeOut();
      }
    },

    toggleHelp: function(){
      this.model.set('showingHelp', !this.model.get('showingHelp'));
    },

    toggleFeedback: function(){
      this.model.set('showingFeedback', !this.model.get('showingFeedback'));
    },

    showHelp: function(){
      this.model.set('showingHelp', true);
    },

    hideHelp: function(){
      this.model.set('showingHelp', false);
    },

    showFeedback: function(){
      this.model.set('showingFeedback', true);
    },

    hideFeedback: function(){
      this.model.set('showingFeedback', false);
    },

    showLogin: function(){
      this.model.set('showingLogin', true);
    },

    showSettings: function(){
      this.model.showSettings();
    },

    showSearch: function() {

      if (this.model.get('showingSearch') === true) {
        
        // darken the workspace container
        this.$el.find('.workspaces_curtain').css('display', 'block');

        // if we haven't already, create the search view element and add to the ui
        if (this.searchView === undefined){
          this.searchView = new SearchView( { model: new Search() }, {app: this.model, appView : this} );
          this.searchView.render();
          this.$el.find('#workspaces').prepend(this.searchView.$el);

        } else {
          this.searchView.$el.css('display', 'block');
        }

        $('.workspace_container').addClass('blur');
        this.searchView.$el.find('.library-search-input').focus();

      } else {

        $('.workspace_container').removeClass('blur');
        
        this.$el.find('.workspaces_curtain').css('display', 'none');
        if (this.searchView != undefined) {
          this.searchView.$el.css('display', 'none');
        }

      }

    },

    zoomresetClick: function(){
      if ( this.lookingAtViewer ){
        zoomToFit();
      } else {
        this.currentWorkspaceView.zoomAll();
      }
    },

    zoominClick: function(){
      if ( this.lookingAtViewer ){
        controls.dollyOut();
      } else {
        this.getCurrentWorkspace().zoomIn();
      }
    },

    zoomoutClick: function(){
      if ( this.lookingAtViewer ){
        controls.dollyIn();
      } else {
        this.getCurrentWorkspace().zoomOut();
      }
    },

    showingHelp: false,
    showingBrowser: false,
    showingSettings: false,
    showingSearch: false,
    showingLogin: false,

    currentWorkspaceView: null,
    currentWorkspaceId: null,
    workspaceTabViews: {},
    workspaceViews: {},

    workspaceCounter: 1,

    addWorkspaceTab: function(workspace){

      if ( this.model.isBackgroundWorkspace(workspace.id) ) return;

      if ( this.workspaceTabViews[workspace.get('_id')] != undefined) return;

      var view = new WorkspaceTabView({ model: workspace });
      this.workspaceTabViews[workspace.get('_id')] = view;

      view.render();
      this.$workspace_tabs.append( view.$el );      
    },

    removeWorkspaceTab: function(workspace){

      // The Workspace can no longer be current
      workspace.set('current', false);

       // check if the removed workspace is the current one
      if (workspace.get('_id') == this.model.get('currentWorkspace') ){

        // are there any more workspaces?
        if ( this.model.get('workspaces').length != 0 ){
          this.model.set('currentWorkspace', this.model.get('workspaces').first().get('_id') );

        // if we're out of workspaces, just add a new one
        } else {
          var that = this;
          this.newWorkspace();
        }
      }
      
      this.workspaceTabViews[workspace.get('_id')].$el.remove();
      delete this.workspaceTabViews[workspace.get('_id')];

    },

    getCurrentWorkspaceCenter: function(){

      var w = this.currentWorkspaceView.$el.width()
        , h = this.currentWorkspaceView.$el.height()
        , ho = this.currentWorkspaceView.$el.scrollTop()
        , wo = this.currentWorkspaceView.$el.scrollLeft()
        , zoom = 1 / this.model.getCurrentWorkspace().get('zoom');

      return [zoom * (wo + w / 2), zoom * (ho + h / 2)];

    },

    getWorkspaceView: function(workspaceModel) {

      if (!workspaceModel) return;

      var workspaceId = workspaceModel.get('_id');

      if ( !this.workspaceViewIsInstantiated( workspaceId )){

        var workspaceView = new WorkspaceView( {
                model: workspaceModel,
                app: this
            });
          
        this.workspaceViews[workspaceId] = workspaceView;

      } else {
        var workspaceView = this.workspaceViews[ workspaceId ];
      }

      return workspaceView;
    },

    workspaceViewIsInstantiated: function(workspaceId){
      return (this.workspaceViews[workspaceId] != undefined);
    },

    hideWorkspace: function(workspaceView){
      if (workspaceView != undefined)
        workspaceView.$el.hide();
    },

    showWorkspace: function(workspaceView){

      // if the workspace tab does not exist
      this.model.removeWorkspaceFromBackground( workspaceView.model.id );
      this.addWorkspaceTab( workspaceView.model );

      if (!$.contains(document.documentElement, workspaceView.$el[0])){
        this.$el.children('#workspaces').append( this.currentWorkspaceView.$el );
      }
      
      workspaceView.$el.show();

    },

    render: function() {

      var model = this.model;
      var workspaces = this.model.get('workspaces')
      var currentWorkspaceId = this.model.get('currentWorkspace');

      if (!currentWorkspaceId){
        var currentWorkspace = workspaces.first();
      } else {
        var currentWorkspace = workspaces.get(currentWorkspaceId);
      }
      
      this.model.updateCurrentWorkspace();
    
      // render search
        if (!this.workspaceControlsView){

          this.workspaceControlsView = new WorkspaceControlsView( { model: new Search() }, {app: this.model, appView : this } );
          this.workspaceControlsView.render();

          this.$el.find('#workspaces').prepend( this.workspaceControlsView.$el );

        }

      // render tabs
        if (!this.workspaceTabViews){
          this.workspaceTabViews = {};

          workspaces.each( this.addWorkspaceTab, this );
        }

      // hide current workspace, show workspace

        if (this.model.changed.currentWorkspace && currentWorkspace){

          this.hideWorkspace(this.currentWorkspaceView);
          this.currentWorkspaceView = this.getWorkspaceView( currentWorkspace );

          this.showWorkspace( this.currentWorkspaceView );
          this.currentWorkspaceView.render();
          this.currentWorkspaceId = currentWorkspaceId;
          this.focusWorkspace();
        }

      this.showSearch();
      this.renderLogin();

      return this;

    },

    renderLogin: function(){

      if (!this.loginView){
        this.loginView = new LoginView({model: this.model.login }, { app: this.model });
        this.loginView.render();
      }

    },

    lookingAtViewer: false,

    focusWorkspace: function(){

      this.$el.find('#workspace_hide').removeClass('leftside');
      this.$el.find('#workspace_hide').addClass('rightside');

      this.$el.find('#workspace_hide i').removeClass('icon-arrow-right');
      this.$el.find('#workspace_hide i').addClass('icon-arrow-left');

      // change whether workspace_container is visible or not
      this.currentWorkspaceView.$el.show();
      this.workspaceControlsView.$el.show();

      $('#viewer').addClass('blur');
    },

    focusViewer: function(){

      this.$el.find('#workspace_hide').addClass('leftside');
      this.$el.find('#workspace_hide').removeClass('rightside');

      this.$el.find('#workspace_hide i').removeClass('icon-arrow-left');
      this.$el.find('#workspace_hide i').addClass('icon-arrow-right');

      this.currentWorkspaceView.$el.hide();
      this.workspaceControlsView.$el.hide();

      $('#viewer').removeClass('blur');

    },

    getCurrentWorkspace: function(){
      return this.model.get('workspaces').get(this.model.get('currentWorkspace'));
    },

    toggleViewer: function(event) {

      this.lookingAtViewer = !this.lookingAtViewer;

      if ( this.lookingAtViewer ){
        this.focusViewer();
      } else {
        this.focusWorkspace();
      }

    },

    showProgress: function(){
      this.$el.find('.busy-indicator').show();
    },

    hideProgress: function(){
      this.$el.find('.busy-indicator').hide();
    }

  });
});





