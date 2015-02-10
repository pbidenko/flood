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
          'ShareView',
          'Share',
          'fastclick',
          'ThreeViewer',
          'PythonEditorView' ],
          function(Backbone, App, WorkspaceView, Search, SearchElement, SearchView, WorkspaceControlsView, 
            WorkspaceTabView, Workspace, WorkspaceBrowser, WorkspaceBrowserView, HelpView, 
            Help, LoginView, Login, FeedbackView, Feedback, ShareView, Share, fastclick, ThreeViewer, PythonEditorView ) {

  return Backbone.View.extend({

    el: '#app',

    initialize: function() {

        var f = new fastclick(document.body);

        this.listenTo(this.model, 'change', this.render, this);
        this.listenTo(this.model, 'ws-data-loaded', this.zoomresetClick);

        this.$workspace_tabs = this.$('#workspace-tabs');
        this.listenTo(this.model, 'showPythonEditor', this.viewPythonEditor);

        this.listenTo(this.model.get('workspaces'), 'add', this.addWorkspaceTab);
        this.listenTo(this.model.get('workspaces'), 'remove', this.removeWorkspaceTab);
        this.listenTo(this.model.get('workspaces'), 'hide', this.hideWorkspaceTab);
        this.listenTo(this.model, 'change:showingFeedback', this.viewFeedback);
        this.listenTo(this.model, 'change:showingShare', this.viewShare);
        this.listenTo(this.model, 'change:showingHelp', this.viewHelp);
        this.listenTo(this.model, 'change:showingBrowser', this.viewBrowser);
        this.listenTo(this.model, 'hide-search', this.hideSearch);

        this.listenTo(this.model.login, 'change:isLoggedIn', this.initBrowserView);
        this.listenTo(this.model.login, 'change:isLoggedIn', this.showHelpOnFirstExperience);
        this.listenTo(this.model.login, 'change:isFirstExperience', this.showHelpOnFirstExperience);

        this.pendingRequestsCount = 0;
        this.listenTo(this.model, 'requestGeometry', function(){
            if(this.pendingRequestsCount === 0)
                this.showProgress();
            this.pendingRequestsCount++;
        }.bind(this));
        this.listenTo(this.model, 'geometry-data-received:event', function(){
            this.pendingRequestsCount--;
            if(this.pendingRequestsCount === 0)
                this.hideProgress();
        }.bind(this));

        $(document).bind('keydown', $.proxy(this.keydownHandler, this));

        // deactivate the context menu
        $(document).bind("contextmenu", function (e) {
            return false;
        });

        //Render application inside init method, because if App model doesn't use http service as storage,
        //we will never get to the render event, because model is already initialized and therefore it
        //won't generate 'change' event
        this.render();

        this.threeViewer = new ThreeViewer({container: document.getElementById("viewer")});

        this.listenTo(this.model, 'geometry-data-received:event', this.updateNodeGeometry);
        this.listenTo(this.model.get('workspaces'), 'geometryUpdated', this.updateNodeGeometry);
        this.listenTo(this.model.get('workspaces'), 'workspaceRemove', this.removeNodes);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'nodeSelected', this.threeViewer.nodeSelected);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'nodeVisible', this.threeViewer.nodeVisible);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'nodeRemove', this.threeViewer.clearNodeGeometry);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'changeWorkspace', this.threeViewer.changeWorkspace);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'clearNodeGeometry', this.threeViewer.clearNodeGeometry);
        this.threeViewer.listenTo(this.model.get('workspaces'), 'exportSTL', this.threeViewer.exportSTL);
    },

    events: {
      'click .workspaces_curtain' : 'endSearch',
      'click #help-button': 'toggleHelp',
      'click #settings-button': 'showSettings',
      'click #workspace_hide' : 'toggleViewer',
      'click #workspace-browser-button': 'toggleBrowser',
      'click #feedback-button': 'toggleFeedback',
      'click #share-button': 'toggleShare',

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

      setTimeout(function(){
        if (this.model.login.get('isLoggedIn') && this.model.get('isFirstExperience')){
          this.model.set( 'showingHelp', true);
        } else {
          this.model.set( 'showingHelp', false);
        }
      }.bind(this), 800);

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

      if ( !(e.metaKey || e.ctrlKey) && !isBackspaceOrDelete )
          return;

      var excludedNames = ["INPUT", "CODE", "TEXTAREA"];
      var srcEl = e.originalEvent.srcElement;

      // do not capture from input and textarea
      if (srcEl && excludedNames.indexOf(srcEl.nodeName) > -1
          || excludedNames.indexOf(e.target.nodeName) > -1)
          return;

      // keycodes: http://css-tricks.com/snippets/javascript/javascript-keycodes/

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

    viewShare: function(){
      if (!this.shareView){
        this.shareView = new ShareView({model: new Share({ app : this.model }) }, { app: this.model });
      }

      if (this.model.get('showingShare') === true){
        this.shareView.render();
        this.shareView.$el.fadeIn();  
      } else {
        this.shareView.$el.fadeOut();
      }
    },

    viewPythonEditor: function(e){
      if (!this.pythonView){
        this.pythonView = new PythonEditorView();
      }

      this.pythonView.render(e);
      this.pythonView.$el.fadeIn();

    },

    toggleHelp: function(){
      this.model.set('showingHelp', !this.model.get('showingHelp'));
    },

    toggleFeedback: function(){
      this.model.set('showingFeedback', !this.model.get('showingFeedback'));
    },

    toggleShare: function(){
      this.model.set('showingShare', !this.model.get('showingShare'));
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
        this.threeViewer.zoomToFit();
      } else {
        this.currentWorkspaceView.zoomAll();
      }
    },

    zoominClick: function(){
      if ( this.lookingAtViewer ){
        this.threeViewer.dollyOut();
      } else {
        this.getCurrentWorkspace().zoomIn();
      }
    },

    zoomoutClick: function(){
      if ( this.lookingAtViewer ){
        this.threeViewer.dollyIn();
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

      if (workspace.get('isCustomNode')) {
          this.$workspace_tabs.append(view.$el);
      }
      else { // insert at the begin
          this.$workspace_tabs.prepend(view.$el);
      }
    },

    removeWorkspaceTab: function(workspace) {
        this.hideWorkspaceTab(workspace);

        var workspaceId = workspace.get('_id');
        this.workspaceViews[workspaceId].$el.remove();
        delete this.workspaceViews[workspaceId];
        this.model.removeWorkspaceFromBackground(workspaceId);
        workspace.dispose();
    },

    hideWorkspaceTab: function(workspace) {
        var workspaceId = workspace.get('_id');

        // The Workspace can no longer be current
        workspace.set('current', false);

        // check if the removed workspace is the current one
        if (workspaceId === this.model.get('currentWorkspace')) {
            // are there any more workspaces?
            var visibleWorkspaces = this.model.get('workspaces').filter(function (ws) {
                return !this.isBackgroundWorkspace(ws.get('_id'));
            }.bind(this.model));

            if (visibleWorkspaces.length) {
                this.model.set('currentWorkspace', visibleWorkspaces[0].get('_id'));
            }
        }

        this.workspaceTabViews[workspaceId].$el.remove();
        delete this.workspaceTabViews[workspaceId];
        this.model.setWorkspaceToBackground(workspaceId);
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
    },

    updateNodeGeometry: function(e){
      var id = e.geometryData.nodeId,
          visible = false,
          selected = false;
      this.model.getCurrentWorkspace().get('nodes').forEach(function (node) {
        if (node.get('_id') === id) {
          visible = node.get('visible');
          selected = node.get('selected');
        }
      });

      this.threeViewer.updateNodeGeometry(e, visible, selected);
    },

    removeNodes: function(e){
      e.get('nodes').forEach(function(n){
        this.threeViewer.clearNodeGeometry(n);
      }.bind(this));
    }

  });
});





