define(['backbone', 'jqueryuidraggable', 'bootstrap', 'Hammer'], function(Backbone, jqueryuidraggable, bootstrap, Hammer) {

  var itemsToShow = 10, minItemsNumber = 1, maxItemsNumber = 1;
  function changeItemsNumber (e) {
      itemsToShow = parseInt(this.$el.find('input.shown-items').val());
      this.$el.find('li.array-item').filter(function () {
          return  parseInt($(this).attr("data-index")) >= itemsToShow;
      }).addClass('hidden');

      this.$el.find('li.array-item').filter(function () {
          return  parseInt($(this).attr("data-index")) < itemsToShow;
      }).removeClass('hidden');

      var dotsItem = this.$el.find('li.dots-item');
      if (this.model.get('arrayItems').length > itemsToShow) {
          dotsItem.removeClass('hidden');
      }
      else {
          dotsItem.addClass('hidden');
      }

      this.$el.find('span.shown-items').html('of ' + maxItemsNumber +
          (itemsToShow > 1 ? ' are' : ' is') + ' shown');

      e && e.stopPropagation();
  }

  function keyDown (e) {
      console.log(e.keyCode);
      var zeroCode = 48, nineCode = 57,
          rightSidedZeroCode = 96, rightSidedNineCode = 105;
      // backspace, shift, ctrl, 4 arrows, delete
      var allowedKeyCodes = [8, 16, 17, 37, 38, 39, 40, 46];
      // only numbers and allowedKeyCodes are allowed
      if ((e.keyCode >= zeroCode && e.keyCode <= nineCode) ||
          (e.keyCode >= rightSidedZeroCode && e.keyCode <= rightSidedNineCode)
          || allowedKeyCodes.indexOf(e.keyCode) > -1)
          return true;

      return false;
  }

  function keyUp(e) {
      var $input = this.$el.find('input.shown-items');
      var value = parseInt($input.val());
      if (isNaN(value) || value < minItemsNumber) {
          $input.val(minItemsNumber);
      }
      else if (value > maxItemsNumber) {
          $input.val(maxItemsNumber);
      }
      else if (value.toString() !== $input.val()) {
          $input.val(value);
      }

      changeItemsNumber.call(this, e);
  }

  return Backbone.View.extend({

    tagName: 'div',
    className: 'node',

    template: _.template( $('#node-template').html() ),

    portHeight: 29, 

    events: {
      'mousedown .node-port-output': 'beginPortConnection',
      'mousedown .node-port-input': 'beginPortDisconnection',
      'mouseup .node-port-input': 'endPortConnection',

      'touchstart .node-port-output': 'beginTouchConnection',
      'touchstart .node-port-input': 'beginTouchDisconnection',

      'touchstart': 'touchstart',
      'click':  'selectThis',

      'change .use-default-checkbox': 'useDefaultClick',
      'blur .name-input': 'updateName',
      'click .toggle-vis': 'toggleGeomVis',
      'click .rep-type': 'replicationClick',
      'click .name-input': 'nameInputClick'
    },

    initialize: function(args) {

      this.workspace = args.workspace;
      this.workspaceView = args.workspaceView;

      this.listenTo(this.model, 'requestRender', this.render );
      this.listenTo(this.model, 'change:position', this.move );
      this.listenTo(this.model, 'change:lastValue', this.renderLastValue );
      this.listenTo(this.model, 'change:failureMessage', this.renderLastValue );
      this.listenTo(this.model, 'change:ignoreDefaults', this.colorPorts );
      this.listenTo(this.model, 'change:name', this.render );
      this.listenTo(this.model, 'connection', this.colorPorts);
      this.listenTo(this.model, 'disconnection', this.colorPorts);
      this.listenTo(this.model, 'change:selected', this.colorSelected);
      this.listenTo(this.model, 'change:visible', this.render);
      this.listenTo(this.model, 'change:isEvaluating', this.colorEvaluating);

      this.listenTo(this.model, 'evalFailed', this.onEvalFailed);
      this.listenTo(this.model, 'evalBegin', this.onEvalBegin);

      this.makeDraggable();
      this.$workspace_canvas = $('#workspace_canvas');
      this.position = this.model.get('position');

      this.$el.on('click', 'input.shown-items', changeItemsNumber.bind(this));
      this.$el.on('keydown', 'input.shown-items', keyDown);
      this.$el.on('keyup', 'input.shown-items', keyUp.bind(this));
    },

    updateName: function(e){
      var val = this.$el.find('.name-input').val();
      if (this.model.get('name') === val) return;
      
      var cmd = { property: 'name', _id: this.model.get('_id'), newValue : val };
      this.model.workspace.setNodeProperty(cmd);
    },

    onEvalFailed: function(exception){
      this.$el.addClass('node-failed');
      this.model.set('failureMessage', exception);
    },

    onEvalBegin: function(){
      this.$el.removeClass('node-failed');
    },

    useDefaultClick : function(e){

      var index = parseInt( $(e.currentTarget).attr('data-index') );

      var ign = JSON.parse( JSON.stringify( this.model.get('ignoreDefaults') ) );
      ign[index] = !$(e.target).is(':checked');

      var cmd = { property: 'ignoreDefaults', _id: this.model.get('_id'), 
            newValue : ign };

      this.model.workspace.setNodeProperty(cmd);
      this.model.workspace.run();

    },

    replicationClick : function(e){

      var cmd = { property: 'replication', _id: this.model.get('_id'), 
            newValue : $(e.target).attr('data-rep-type') };
      this.model.workspace.setNodeProperty(cmd);
      this.model.workspace.run();

    },

    nameInputClick: function(e){
      e.stopPropagation();
    },

    // should be part of nodeView subclass
    toggleGeomVis: function(e) {
      this.model.set('visible', !this.model.get('visible') );
      e.stopPropagation();
    },

    makeDraggable: function() {

      var that = this;
      this.initPos = [];
      this.$el.draggable( {
        drag : function(e, ui) {
          var zoom = 1 / that.workspace.get('zoom');

          ui.position.left = zoom * ui.position.left;
          ui.position.top = zoom * ui.position.top;

          that.workspace.get('nodes').moveSelected([ ui.position.left - that.initPos[0], ui.position.top - that.initPos[1]], that);

          that.model.set('position', [ ui.position.left, ui.position.top ]);

        },
        start : function(startEvent) {

          if ( !that.model.get('selected') ){
            that.model.workspace.get('nodes').deselectAll();
          }

          that.model.set('selected', true );
          that.workspace.get('nodes').startDragging(that);

          var zoom = 1 / that.model.workspace.get('zoom');
          var pos = that.model.get('position');

          that.initPos = [ pos[0], pos[1] ];

        },
        stop : function() {

          var start = [ that.initPos[0], that.initPos[1] ];
          var pos = that.model.get('position');
          var end = [ pos[0], pos[1] ];

          var cmd = { property: 'position', _id: that.model.get('_id'), 
            oldValue: start, newValue : end };
          that.model.workspace.setNodeProperty( cmd );

        }
      });
      this.$el.css('position', 'absolute');

    },

    beginPortDisconnection: function(e){
      var index = parseInt( $(e.currentTarget).attr('data-index') );

      if ( !this.model.isPortConnected(index, false) )
        return;

      var inputConnections = this.model.get('inputConnections')
        , connection = inputConnections[index][0]
        , oppos = connection.getOpposite( this.model );

      this.workspace.startProxyConnection( oppos.node.get('_id'), oppos.portIndex, this.getPortPosition(index, false));
      this.workspace.removeConnection( connection.toJSON() );

      e.stopPropagation();
    },

    beginPortConnection: function(e){
      var index = parseInt( $(e.currentTarget).attr('data-index') );
      this.workspace.startProxyConnection(this.model.get('_id'), index, this.getPortPosition(index, true));
      e.stopPropagation();
    },

    endPortConnection: function(e){

      if ( !this.workspace.draggingProxy )
        return;

      var index = parseInt( $(e.currentTarget).attr('data-index') );
      this.workspace.completeProxyConnection(this.model.get('_id'), index );
      e.stopPropagation();

    },

    // touch-specific handlers

    // simply kill the connection
    beginTouchDisconnection: function(e){
      
      var index = parseInt( $(e.currentTarget).attr('data-index') );

      if ( !this.model.isPortConnected(index, false) )
        return;

      var inputConnections = this.model.get('inputConnections')
        , connection = inputConnections[index][0]
        , oppos = connection.getOpposite( this.model );

      this.workspace.removeConnection( connection.toJSON() );

      e.stopPropagation();
      e.preventDefault();
    },

    // special handling of touch events
    beginTouchConnection: function(e){
      
      $('body').one('touchend', function(e){

        var changedTouches = e.originalEvent.changedTouches[0];
        var elem = $( document.elementFromPoint(changedTouches.pageX, changedTouches.pageY) );

        if (!elem.hasClass("node-port-input")){
          elem = elem.parent('.node-port-input')
        }

        if (!elem.attr('data-index')) return;

        this.workspace.draggingProxy = true;

        var e = $.Event( "mouseup" );
        elem.trigger(e);

        this.workspace.draggingProxy = false;

      }.bind( this ));

    },

    select: function() {
      this.model.set( 'selected', true );
    },

    touchstart: function(event){
      // is the user pressing on an input?
      var shouldIgnore = event.target != null 
          && ( event.target.tagName.toLowerCase() == "input" || event.target.tagName.toLowerCase() == "code" );

      if(shouldIgnore) {
        // need to focus the input - on iOS the input never gets focussed
        event.target.focus();

        // we prevent the node from being selected
        this.selectable = false;
        setTimeout(function(){ this.selectable = true; }.bind(this), 300);
      }
    },

    selectable: true,

    selectThis: function(event) {

      if (!this.selectable) return;

      if ( !this.model.get('selected') ){
        if (!event.shiftKey)
          this.workspace.get('nodes').deselectAll();
        this.model.set('selected', true );
      } else {
        this.workspace.get('nodes').deselectAll();
      }

    },

    render: function() {

      this
      .renderNode()
      .colorSelected()
      .colorEvaluating()
      .moveNode()
      .renderPorts();

      return this;

    },

    renderNode: function() {

      var json = this.model.toJSON();

      json.preview = this.formatPreview( json.lastValue );

      this.$el.html( this.template( json ) );

      var arrayItems = this.model.get('arrayItems');
      var $input;
      // if node's value is not empty array
      // configure its view and settings area
      if (arrayItems && arrayItems.length) {
          maxItemsNumber = arrayItems.length;
          this.$el.find('.shown-items').removeClass('hidden');
          $input = this.$el.find('input.shown-items');
          $input.attr('max', maxItemsNumber);

          if (maxItemsNumber < itemsToShow) {
              itemsToShow = maxItemsNumber;
          }

          $input.attr('value', itemsToShow);

          changeItemsNumber.call(this);
      }
      else {
          this.$el.find('.shown-items').addClass('hidden');
      }

      if (this.getCustomContents){
        this.$el.find('.node-data-container').html( this.getCustomContents() );
      }

      return this;

    },

    truncatePreview: function( value, maxElements ){

      if (typeof value === "string") return value;

      if (!value || value.length === undefined || value.length < 100) {
        return value;
      }

      if ( maxElements === undefined ) maxElements = 20;

      var shortVal = {};
      var count = 0;
      for (var k in value){
        if (count > maxElements) break;
        shortVal[k] = value[k];
        count++;
      }

      shortVal.length = value.length;

      return shortVal;

    },

    formatPreview: function( value ){

      var that = this;
      return JSON.stringify(this.truncatePreview(value), function (k, v) {
        return that.prettyPrint.call(that, k, v);
      });

    },

    prettyPrint: function(key, val){

      if (typeof val === "number"){
        return val.toPrecision(4);
      }

      if (typeof val === "string"){
        return val.replace(new RegExp("\t", 'g'), "").replace(new RegExp("\n", 'g'), "")
      }

      if (val && val.length != undefined && val.length > 100) {
        return this.truncatePreview( val );
      }

      return val;
    },

    renderLastValue: function() {

      return this.renderNode();

    },

    colorEvaluating: function() {

      if ( this.model.get('isEvaluating') ){
        this.$el.addClass('node-evaluating');
      } else {
        this.$el.removeClass('node-evaluating');
      }

      return this;

    },

    colorSelected: function() {

      if ( this.model.get('selected') ){
        this.$el.addClass('node-selected');
      } else {
        this.$el.removeClass('node-selected');
      }

      return this;

    },

    svgTransform: function() {
      return 'translate(' + this.position[0] + ' ' + this.position[1] +')';
    },

    // Get the position of a particular port.  Only valid after render()
    // has been called
    getPortPosition: function( index, isOutputPort ) {
      
      var x = this.position[0]
        , y = this.position[1];

      if (isOutputPort) {
        try {
          x += parseInt( this.outputPorts[index].getAttribute('cx')) + 5;
          y += parseInt( this.outputPorts[index].getAttribute('cy'));      
        } catch (e){

        }
  
      } else {
        try {
          x += parseInt( this.inputPorts[index].getAttribute('cx')) - 5;
          y += parseInt( this.inputPorts[index].getAttribute('cy'));   
        } catch (e){

        }
      }

      return [x, y];

    },

    colorPorts: function() {

      // update port colors
      var that = this;
      var isPartial = false;

      this.inputPorts.forEach(function(ele, ind){

        ele.setAttribute('stroke','black');

        if (that.model.isPortConnected(ind, false) ){
          ele.setAttribute('fill','black');
        } else if (that.model.isInputPortUsingDefault(ind)){
          ele.setAttribute('fill','white');
        } else {
          isPartial = true;
          ele.setAttribute('fill','grey');
          ele.setAttribute('stroke','white');
        }
          
      });

      this.outputPorts.forEach(function(ele, ind){

        ele.setAttribute('stroke','black');

        if (that.model.isPortConnected(ind, true)){
          ele.setAttribute('fill','black');
        } else if (isPartial) {
          ele.setAttribute('fill','grey');
          ele.setAttribute('stroke','white');
        } else {
          ele.setAttribute('fill','white');
        }
          
      });

      return this;

    },

    move: function() {
      return this.moveNode().movePorts();
    },

    moveNode: function() {
      
      var pos = this.model.get('position');

      if (pos[0] < 0) pos[0] = 0;
      if (pos[1] < 0) pos[1] = 0;



      this.position = pos;

      this.$el.css("left", this.position[0] );
      this.$el.css("top", this.position[1] );

      return this;
    },

    movePorts: function(){
      if (this.portGroup) { 
        this.portGroup.setAttribute( 'transform', this.svgTransform() );
      }

      return this;
    },

    renderPorts: function() {

      if ( this.portGroup ) {
        // we need to redraw the ports
        $(this.portGroup).empty();
      } else {
        // create an svg group to hold the port circles
        this.portGroup = document.createElementNS('http://www.w3.org/2000/svg','g');
        this.portGroup.setAttribute( 'transform', this.svgTransform() );
      }

      // create data structures to store the input ports
      this.inputPorts = [];
      this.outputPorts = [];

      // draw the circles
      var that = this;
      var inIndex = 0;
      var outIndex = 0;
      var ex = this.model.get('extra') || {};
      var portIndex = 0;

      // set the zoom from the workspace container
      var zoom = 1.0
        , ele = this.$el.parent().css('transform');

      if (ele != "none") zoom = ele.match(/-?[0-9\.]+/g)[0];
        

      this.$el.find('.node-port').each(function(index, ele) {

        var nodeCircle = document.createElementNS('http://www.w3.org/2000/svg','circle');
        
        // assign default appearance
        nodeCircle.setAttribute('r',3);
        nodeCircle.setAttribute('stroke','black');
        nodeCircle.setAttribute('fill','white');
        nodeCircle.setAttribute('stroke-width','1.5');

        // position input ports on left side, output ports on right side
        if ( $(ele).hasClass('node-port-input') ) {
          nodeCircle.setAttribute('cx', 0);
          nodeCircle.setAttribute('cy', that.portHeight / 2 + 1/zoom * $(ele).position().top ); 
          that.inputPorts.push(nodeCircle);
          inIndex++;
        } else {
          if(ex.lineIndices && ex.lineIndices.length > outIndex)
            portIndex = outIndex > 0 ? ex.lineIndices[outIndex] - ex.lineIndices[outIndex - 1] - 1 : ex.lineIndices[outIndex];
          nodeCircle.setAttribute('cx', that.$el.width() + 2.5 );
          // that.portHeight is equal to 29, but actual height of port is 25
          nodeCircle.setAttribute('cy', that.portHeight / 2 + 1/zoom * ($(ele).position().top + portIndex * 25) );
          that.outputPorts.push(nodeCircle);
          outIndex++;
        }
        
        // append 
        that.portGroup.appendChild(nodeCircle);

      });

      this.colorPorts();

      return this;

    },

    remove: function() {
      this.$el.remove();
      if (this.portGroup.parentNode)
        this.portGroup.parentNode.removeChild(this.portGroup);
    }

  });

});