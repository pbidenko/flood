define(['backbone', 'jqueryuidraggable', 'bootstrap', 'Hammer', 'GetArrayItemsMessage'],
    function(Backbone, jqueryuidraggable, bootstrap, Hammer, GetArrayItemsMessage) {

  var minItemsNumber = 1;
  function changeItemsNumber (e) {
      var newNum = parseInt(this.$el.find('input.shown-items').val());

      if (newNum === this.itemsToShow)
          return;

      this.itemsToShow = newNum;

      setItemNumbers.call(this, newNum);

      e && e.stopPropagation();
  }

  function setItemNumbers() {
      // if we have nodes enough to show
      if (this.itemsToShow <= this.model.get('arrayItems').length) {
          var itemsToShow = this.itemsToShow;
          this.$el.find('li.array-item').filter(function () {
              return  parseInt($(this).attr("data-index")) >= itemsToShow;
          }).addClass('hidden');

          this.$el.find('li.array-item').filter(function () {
              return  parseInt($(this).attr("data-index")) < itemsToShow;
          }).removeClass('hidden');

          var dotsItem = this.$el.find('li.dots-item');
          if (this.maxItemsNumber > this.itemsToShow) {
              dotsItem.removeClass('hidden');
          }
          else {
              dotsItem.addClass('hidden');
          }
      }
      else {
          var lastRequestedItem = Math.max(this.requestData.indexFrom + this.requestData.numberToRequest, this.model.get('arrayItems').length);

          if (lastRequestedItem < this.itemsToShow) {
              this.requestData.indexFrom = lastRequestedItem;
              this.requestData.numberToRequest = this.itemsToShow - lastRequestedItem;
              this.requestData.nodeId = this.model.get('_id');
              this.trigger('send-array-message', new GetArrayItemsMessage(this.requestData));
          }
      }
  }

  function keyDown (e) {
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
      else if (value > this.maxItemsNumber) {
          $input.val(this.maxItemsNumber);
      }
      else if (value.toString() !== $input.val()) {
          $input.val(value);
      }
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
      'click .name-input': 'nameInputClick',
      'click input.shown-items': 'nameInputClick'
    },

    initialize: function(args) {

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

      this.listenTo(this.model, 'array-reset', this.resetRequestData );
      
      this.$workspace_canvas = $('#workspace_canvas');
      this.position = this.model.get('position');

      this.itemsToShow = 10;
      this.requestData = { indexFrom: 0, numberToRequest: 0 };

      this.$el.on('blur', 'input.shown-items', changeItemsNumber.bind(this));
      this.$el.on('keydown', 'input.shown-items', keyDown);
      this.$el.on('keyup', 'input.shown-items', keyUp.bind(this));
    },

    updateName: function(e) {
        var val = this.$el.find('.name-input').val();
        if (this.model.get('name') === val)
            return;

        var cmd = { property: 'name',
            _id: this.model.get('_id'),
            newValue: val
        };

        this.model.trigger('request-set-node-prop', cmd);
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

      this.model.trigger('request-set-node-prop', cmd);
      this.model.trigger('requestRun');

    },

    replicationClick : function(e){

      var cmd = { property: 'replication', _id: this.model.get('_id'), 
            newValue : $(e.target).attr('data-rep-type') };
        this.model.trigger('request-set-node-prop', cmd);
        this.model.trigger('requestRun');

    },

    nameInputClick: function(e){
      e.stopPropagation();
    },

    // should be part of nodeView subclass
    toggleGeomVis: function(e) {
      this.model.set('visible', !this.model.get('visible') );
      e.stopPropagation();
    },

    beginPortDisconnection: function(e){
      var index = parseInt( $(e.currentTarget).attr('data-index') );

      if ( !this.model.isPortConnected(index, false) )
        return;

      var inputConnections = this.model.get('inputConnections')
        , connection = inputConnections[index][0]
        , oppos = connection.getOpposite( this.model );

        var startNodeId = oppos.node.get('_id'),
            nodePort = oppos.portIndex,
            startPosition = this.getPortPosition(index, false);

        this.model.trigger('start-proxy-conn', startNodeId, nodePort, startPosition);
        this.model.trigger('request-remove-conn', connection.toJSON());

      e.stopPropagation();
    },

    beginPortConnection: function(e) {
        var index = parseInt($(e.currentTarget).attr('data-index'));
        var startNodeId = this.model.get('_id'),
            nodePort = index,
            startPosition = this.getPortPosition(index, true);

        this.model.trigger('start-proxy-conn', startNodeId, nodePort, startPosition);
        e.stopPropagation();
    },

    endPortConnection: function(e) {
        this.trigger('end-port-conn', e, this.model.get('_id'));
    },

    // touch-specific handlers

    // simply kill the connection
    beginTouchDisconnection: function(e){
      
      var index = parseInt( $(e.currentTarget).attr('data-index') );

      if ( !this.model.isPortConnected(index, false) )
        return;

        var inputConnections = this.model.get('inputConnections')
            , connection = inputConnections[index][0];

        this.model.trigger('request-remove-conn', connection.toJSON());

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

        this.model.trigger('request-set-draggingproxy', true);

        var e = $.Event( "mouseup" );
        elem.trigger(e);

        this.model.trigger('request-set-draggingproxy', false);

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

        if (!this.model.get('selected')) {
            if (!event.shiftKey) {
                this.model.trigger('deselect-all-nodes');
            }

            this.model.set('selected', true);
        }
        else {
            this.model.trigger('deselect-all-nodes');
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

    resetRequestData: function() {
        this.requestData.indexFrom = 0;
        this.requestData.numberToRequest = 0;
    },

    renderNode: function() {

      var json = this.model.toJSON();

      json.preview = this.formatPreview( json.lastValue );

      this.$el.html( this.template( json ) );

      // generally arrayItemsNumber is not equal to arrayItems.length
      // arrayItemsNumber is number of all array items
      // arrayItems is part of array items
      var arrayItemsNumber = this.model.get('arrayItemsNumber');
      var $input;
      // if node's value is not empty array
      // configure its view and settings area
      if (this.model.get('isArray') && arrayItemsNumber) {
          this.maxItemsNumber = arrayItemsNumber;
          this.$el.find('.shown-items').removeClass('hidden');
          $input = this.$el.find('input.shown-items');
          $input.attr('max', this.maxItemsNumber);
          this.$el.find('span.shown-items').html('of ' + this.maxItemsNumber + ' to show');

          if (this.maxItemsNumber < this.itemsToShow) {
              this.itemsToShow = this.maxItemsNumber;
          }

          $input.attr('value', this.itemsToShow);

          setItemNumbers.call(this, this.itemsToShow);
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

      return JSON.stringify(this.truncatePreview(value), this.prettyPrint.bind(this));

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
      var isPartial = false;

      this.inputPorts.forEach(function(ele, ind){

        ele.setAttribute('stroke','black');

        if (this.model.isPortConnected(ind, false) ){
          ele.setAttribute('fill','black');
        } else if (this.model.isInputPortUsingDefault(ind)){
          ele.setAttribute('fill','white');
        } else {
          isPartial = true;
          ele.setAttribute('fill','grey');
          ele.setAttribute('stroke','white');
        }
          
      }.bind(this));

      this.outputPorts.forEach(function(ele, ind){

        ele.setAttribute('stroke','black');

        if (this.model.isPortConnected(ind, true)){
          ele.setAttribute('fill','black');
        } else if (isPartial) {
          ele.setAttribute('fill','grey');
          ele.setAttribute('stroke','white');
        } else {
          ele.setAttribute('fill','white');
        }
          
      }.bind(this));

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
          nodeCircle.setAttribute('cy', this.portHeight / 2 + 1/zoom * $(ele).position().top ); 
          this.inputPorts.push(nodeCircle);
          inIndex++;
        } else {
          if(ex.lineIndices && ex.lineIndices.length > outIndex)
            portIndex = outIndex > 0 ? ex.lineIndices[outIndex] - ex.lineIndices[outIndex - 1] - 1 : ex.lineIndices[outIndex];
          nodeCircle.setAttribute('cx', this.$el.width() + 2.5 );
          // that.portHeight is equal to 29, but actual height of port is 25
          nodeCircle.setAttribute('cy', this.portHeight / 2 + 1/zoom * ($(ele).position().top + portIndex * 25) );
          this.outputPorts.push(nodeCircle);
          outIndex++;
        }
        
        // append 
        this.portGroup.appendChild(nodeCircle);

      }.bind(this));

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