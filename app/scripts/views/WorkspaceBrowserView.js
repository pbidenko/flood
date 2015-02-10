define(['backbone', 'WorkspaceBrowserElementView'], function(Backbone, WorkspaceBrowserElementView) {

  var itemsToClick = {
      project: 'project',
      customNode: 'custom node'
  };
  var lastClickedItem = itemsToClick.project;

  return Backbone.View.extend({

    el: '#workspace-browser',

    initialize: function(atts, arr) {
        this.app = arr.app;

        this.listenTo(this.model.get('workspaces'), 'reset', this.render);
        this.listenTo(this.model.get('workspaces'), 'add', this.addWorkspaceElement);
        this.listenTo(this.model.get('workspaces'), 'remove', this.removeWorkspaceElement);

        this.model.fetch();
        this.render();
    },

    template: _.template( $('#workspace-browser-template').html() ),

    events: { 
      'click .workspace-browser-refresh': "refreshClick",
      'click #workspace-browser-header-custom-nodes': "customNodeHeaderClick",
      'click #workspace-browser-header-projects': "projectHeaderClick"
    },

    render: function(arg) {

      this.$el.html( this.template( this.model.toJSON() ) );

      this.contents = this.$el.find('#workspace-browser-contents');

      this.customNodes = this.$el.find('#workspace-browser-custom-nodes');
      this.customNodes.empty();

      this.projects = this.$el.find('#workspace-browser-projects');
      this.projects.empty();

      if (lastClickedItem === itemsToClick.customNode)
          this.customNodeHeaderClick();
    },

    refreshClick: function(e){
      this.model.refresh();
      e.stopPropagation();
    },

    customNodeHeaderClick: function(e){

      this.projects.hide();
      this.customNodes.show();

      $('#workspace-browser-header-custom-nodes').css('bottom','').css('top','40px');
      lastClickedItem = itemsToClick.customNode;
    },

    projectHeaderClick: function(e){

      this.customNodes.hide();
      this.projects.show();

      $('#workspace-browser-header-custom-nodes').css('bottom','0').css('top','');
      lastClickedItem = itemsToClick.project;
    },

    addWorkspaceElement: function(x){

      if (!this.contents) this.render();

      var v = new WorkspaceBrowserElementView( { model: x }, { app : this.app } );
      v.render();

      if ( x.get('isCustomNode') ){
        this.customNodes.append( v.$el );
      } else {
        this.projects.append( v.$el );
      }
      
    }, 

    removeWorkspaceElement: function(ws){

      if (!this.contents) return;
      this.contents.find('.workspace-browser-element[data-id*=' + ws.get('_id') + ']').remove();

    }

  });

});

