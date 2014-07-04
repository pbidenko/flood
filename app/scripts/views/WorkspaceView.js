define(['backbone', 'Workspace', 'ConnectionView', 'MarqueeView', 'NodeViewTypes'], function(Backbone, Workspace, ConnectionView, MarqueeView, NodeViewTypes){

  return Backbone.View.extend({

    tagName: 'div',
    className: 'workspace_container row',

    initialize: function(atts) { 

      this.nodeViews = {};
      this.connectionViews = {};

      this.app = this.model.app;

      this.$workspace = $('<div/>', {class: 'workspace'});

      this.$workspace_back = $('<div/>', {class: 'workspace_back'});
      this.$workspace_canvas = $('<svg class="workspace_canvas" xmlns="http://www.w3.org/2000/svg" version="1.1" />');

      this.$el.append( this.$workspace );
      this.$workspace.append( this.$workspace_back );
      this.$workspace.append( this.$workspace_canvas );

      var that = this;

      this.listenTo(this.model, 'change:connections', function() {
        that.cleanup().renderConnections();
      });

      this.model.on('change:zoom', this.updateZoom, this );
      this.model.on('change:offset', this.updateOffset, this );

      this.model.on('change:isRunning', this.renderRunnerStatus, this);

      this.listenTo(this.model, 'change:nodes', function() {
        that.cleanup().renderNodes();
      });

      this.listenTo(this.model, 'change:current', this.onChangeCurrent );

      this.listenTo(this.model, 'startProxyDrag', this.startProxyDrag);
      this.listenTo(this.model, 'endProxyDrag', this.endProxyDrag);

      this.renderProxyConnection();
      this.renderMarquee();

      this.renderRunnerStatus();
      
    },

    events: {
      'mousedown .workspace_back':  'deselectAll',
      'mousedown .workspace_back':  'startMarqueeDrag',
      'dblclick .workspace_back':  'showNodeSearch'
    },

    render: function() {

      return this
              .cleanup()
              .renderNodes()
              .renderConnections()
              .renderNodes()
              .renderRunnerStatus()
              .updateZoom()
              .updateOffset();

    },

    startMarqueeDrag: function(event){

      this.deselectAll();

      var offset = this.$workspace.offset()
        , zoom = this.model.get('zoom')
        , posInWorkspace = [ (1 / zoom) * (event.pageX - offset.left), (1 / zoom) * ( event.pageY - offset.top) ];

      this.model.marquee.setStartCorner( posInWorkspace );
      
      this.$workspace.bind('mousemove', $.proxy( this.marqueeDrag, this) );
      this.$workspace.bind('mouseup', $.proxy( this.endMarqueeDrag, this) );
    },

    endMarqueeDrag: function(event){
      this.model.marquee.set('hidden', true);
      this.$workspace.unbind('mousemove', this.marqueeDrag);
      this.$workspace.unbind('mouseup', this.endMarqueeDrag);
    },

    marqueeDrag: function(event){

      this.model.marquee.set('hidden', false);

      var offset = this.$workspace.offset()
        , zoom = this.model.get('zoom')
        , posInWorkspace = [ (1 / zoom) * (event.pageX - offset.left), (1 / zoom) * ( event.pageY - offset.top) ];

      this.model.marquee.setEndCorner( posInWorkspace );
      this.doMarqueeSelect();

    },

    doMarqueeSelect: function(){

      var x1 = this.model.marquee.get('x')
        , y1 = this.model.marquee.get('y')
        , x2 = this.model.marquee.get('x') + this.model.marquee.get('width')
        , y2 = this.model.marquee.get('y') + this.model.marquee.get('height');

      for (var nodeId in this.nodeViews ){ 

        var node = this.nodeViews[nodeId];

        var w = node.$el.width();
        var h = node.$el.height();

        var px = node.model.get('position');
        var x = px[0], y = px[1];

        var corners = [ [x, y], [x + w, y], [x + w, y + h], [x, y + h] ];

        var cornerIn = false;

        corners.forEach(function(c){

          var cx = c[0], cy = c[1];
          if ( cx < x2 && cx > x1 && cy > y1 && cy < y2 ) {
            cornerIn = true;
          }

        });

        if (cornerIn && !node.model.get('selected') ){
          node.model.set('selected', true);
        } else if ( !cornerIn && node.model.get('selected') ){
          node.model.set('selected', false);
        }

      }

    },

    getCenter: function(){

      var w = this.$el.width()
        , h = this.$el.height()
        , ho = this.$el.scrollTop()
        , wo = this.$el.scrollLeft()
        , zoom = 1 / this.model.get('zoom');

      return [wo + w / 2, ho + h / 2];

    },

    updateZoom: function(){

      var center = this.getCenter();

      this.$workspace.css('transform', 'scale(' + this.model.get('zoom') + ')' );
      this.$workspace.css('transform-origin', "0 0" );

      return this;

    },

    updateOffset: function(){

      // this.$el.scrollLeft( this.model.get('offset')[0] );
      // this.$el.scrollTop( this.model.get('offset')[1] );

      return this;

    },

    $runnerStatus : undefined,
    runnerTemplate : _.template( $('#workspace-runner-status-template').html() ),
    renderRunnerStatus: function(){

      // placeholder for future work
      return this;

    },

    showNodeSearch: function(e){
      this.app.set('showingSearch', true);

      var z = this.model.get('zoom');
      var offX  = z * (e.offsetX || e.clientX - $(e.target).offset().left);
      var offY  = z * (e.offsetY || e.clientY - $(e.target).offset().top);

      this.app.newNodePosition = [offX, offY];
    },

    startProxyDrag: function(event){
      this.$workspace.bind('mousemove', $.proxy( this.proxyDrag, this) );
      this.$workspace.bind('mouseup', $.proxy( this.endProxyDrag, this) );
    },

    endProxyDrag: function(event){
      this.$workspace.unbind('mousemove', this.proxyDrag);
      this.$workspace.unbind('mouseup', this.endProxyDrag);
      this.model.endProxyConnection();
    },

    proxyDrag: function(event){
      var offset = this.$workspace.offset()
        , zoom = this.model.get('zoom')
        , posInWorkspace = [ (1 / zoom) * (event.pageX - offset.left), (1 / zoom) * ( event.pageY - offset.top) ];

      this.model.proxyConnection.set('endProxyPosition', posInWorkspace);
    },

    renderProxyConnection: function() {

      var view = new ConnectionView({ 
        model: this.model.proxyConnection, 
        workspaceView: this, 
        workspace: this.model, 
        isProxy: true
      });

      view.render();
      this.$workspace_canvas.prepend( view.el );

    },

    renderMarquee: function() {

      var view = new MarqueeView({ 
        model: this.model.marquee, 
        workspaceView: this, 
        workspace: this.model
      });

      view.render();
      this.$workspace_canvas.prepend( view.el );

    },

    cleanup: function() {
      this.clearDeadNodes();
      this.clearDeadConnections();
      return this;
    },

    renderNodes: function() {

      var this_ = this;

      this.model.get('nodes').each(function(nodeModel) {

        var nodeView = this_.nodeViews[nodeModel.get('_id')];

        if ( nodeView === undefined){

          var NodeView = NodeViewTypes.Base;
          if ( NodeViewTypes[nodeModel.get('typeName')] )
          {
            NodeView = NodeViewTypes[ nodeModel.get('typeName') ];
          }

          nodeView = new NodeView({ model: nodeModel, workspaceView: this_, workspace: this_.model });
          this_.nodeViews[ nodeView.model.get('_id') ] = nodeView;

        }

        this_.$workspace.prepend( nodeView.$el );
        nodeView.render();
        nodeView.makeDraggable();
        nodeView.delegateEvents();
        
        this_.$workspace_canvas.append( nodeView.portGroup );

      });

      return this;

    },

    keydownHandler: function(e){

      var isBackspaceOrDelete = e.keyCode === 46 || e.keyCode === 8;

      if ( !(e.metaKey || e.ctrlKey) && !isBackspaceOrDelete ) return;

      // do not capture from input
      if (e.originalEvent.srcElement &&
         (e.originalEvent.srcElement.nodeName === "INPUT" ||
          e.originalEvent.srcElement.nodeName === "TEXTAREA"))
        return;
      if (e.target.nodeName === "INPUT" || e.target.nodeName === "TEXTAREA")
        return;

      // keycodes: http://css-tricks.com/snippets/javascript/javascript-keycodes/

      switch (e.keyCode) {
        case 8:
          this.model.removeSelected();
          return e.preventDefault();
        case 46:
          this.model.removeSelected();
          return e.preventDefault();
        case 61:
        case 187:
          this.model.zoomIn();
          return e.preventDefault();
        case 189:
        case 173:
          this.model.zoomOut();
          return e.preventDefault();
        case 67:
          this.model.copy();
          return e.preventDefault();
        case 86:
          this.model.paste();
          return e.preventDefault();
        case 88:
          this.model.copy();
          this.model.removeSelected();
          return e.preventDefault();
        case 89:
          this.model.redo();
          return e.preventDefault();
        case 90:
          this.model.undo();
          return e.preventDefault();
      }

    },

    renderConnections: function() {

      var this_ = this;

      this.model.get('connections').forEach( function( cntn ) {

        var view = this_.connectionViews[cntn.get('_id')]

        if ( this_.connectionViews[cntn.get('_id')] === undefined){
          view = new ConnectionView({ model: cntn, workspaceView: this_, workspace: this_.model });
        }

        view.delegateEvents();

        if (!view.el.parentNode){
          view.render();
          this_.$workspace_canvas.prepend( view.el );

          this_.connectionViews[ view.model.get('_id') ] = view;
        }

      });

      return this;

    },

    clearDeadNodes: function() {

      for (var key in this.nodeViews){
        if (this.model.get('nodes').get(key) === undefined){
          this.nodeViews[key].remove();
          delete this.nodeViews[key];
        }
      }

    },

    clearDeadConnections: function() {
      for (var key in this.connectionViews){
        if (this.model.get('connections').get(key) === undefined){
          this.connectionViews[key].remove();
          delete this.connectionViews[key];
        }
      }
    },

    onRemove: function(){
      this.get('nodes').forEach(function(n){
        if (n.onRemove) n.onRemove();
      })
    },

    deselectAll: function() {
      this.model.get('nodes').deselectAll();
    }

  });
});
