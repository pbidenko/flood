// the application is constituted by

// CustomizerAppView, CustomizerApp - controls visibility of widget
// CustomizerWorkspaceView - collection of node widgets, similar to a nodeview, includes mask for which widgets will be visible
// CustomizerNodeView - similar to a nodeview, but no inputs/outputs, simplified controls, potentially multiple options with labels
// CustomizerViewer - allows you to view your customized geometry, with saved camera position

define(['backbone', 'CustomizerHeaderView', 'CustomizerWorkspaceView', 'ThreeViewer'], 
  function(Backbone, CustomizerHeader, CustomizerWorkspaceView, ThreeViewer) {

  'use strict';

  return Backbone.View.extend({

    el: '#customizer-app',

    events: {  },

    initialize: function( args, atts ) {
      this.listenTo(this.model, 'change', this.render);
    },

    render: _.once(function() {

      this.threeViewer = new ThreeViewer({container: document.getElementById("customizer-viewer")});
      this.listenTo(this.model, 'geometry-data-received:event', this.updateNodeGeometry);
      this.listenTo(this.model.get('workspaces'), 'geometryUpdated', this.updateNodeGeometry);

      (new CustomizerHeader({model: this.model.getCurrentWorkspace() })).render();
      (new CustomizerWorkspaceView({model: this.model.getCurrentWorkspace() })).render();

      return this;

    }),

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
    }

  });
});