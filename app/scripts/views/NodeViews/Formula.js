define(['backbone', 'underscore', 'jquery', 'BaseNodeView', 'FLOOD'], function(Backbone, _, $, BaseNodeView, FLOOD) {

  return BaseNodeView.extend({

    initialize: function(args) {
        BaseNodeView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:extra', this.onChangedExtra);
    },

    innerTemplate : _.template( $('#node-formula-template').html() ),

    getCustomContents: function() {

      var js = this.model.toJSON() ;
      if (!js.extra.script) js.extra.script = this.model.get('type').script;

      return this.innerTemplate( js );

    },

    onChangedExtra: function(){

      var ex = this.model.get('extra') || {};

      if (ex.numInputs != undefined ){
        this.setNumInputConnections( ex.numInputs )
        this.model.get('type').setNumInputs( ex.numInputs );
      }

    	this.render();
    	this.model.trigger('update-node');
        this.model.trigger('requestRun');
    },

    setNumInputConnections: function(num){

      if (num === undefined) return;

      var inputConns = this.model.get('inputConnections');

      var diff = num - inputConns.length;

      if (diff === 0) return;

      if (diff > 0){
        for (var i = 0; i < diff; i++){
          inputConns.push([]);
        }
      } else {
        for (var i = 0; i < -diff; i++){

          var conn = this.model.getConnectionAtIndex(inputConns.length - 1);

          if (conn != null){
              this.model.trigger('request-remove-conn-from-collection').remove(conn);
          }

          inputConns.pop();
        }

      }

    },

    renderNode: function() {

    	BaseNodeView.prototype.renderNode.apply(this, arguments);

      this.input = this.$el.find('.formula-text-input');

      this.input.focus(function(e){ 
      	this.selectable = false;
      	this.model.set('selected', false);
      	e.stopPropagation();
      }.bind(this));

      this.input.blur(function(){ 

      	var ex = JSON.parse( JSON.stringify( this.model.get('extra') ) );
      	if ( ex.script === this.input.val() ) return;

      	ex.script = this.input.val();

      	this.model.workspace.setNodeProperty({property: "extra", _id: this.model.get('_id'), newValue: ex });
      	this.selectable = true; 
      }.bind(this));

      this.$el.find('.add-input').click(function () { this.addInput(); }.bind(this));
      this.$el.find('.remove-input').click(function () { this.removeInput(); }.bind(this));

      return this;

    },

    setNumInputsProperty: function(numInputs) {
        if (numInputs === undefined) return;

        var ex = this.model.get('extra');
        var exCopy = JSON.parse(JSON.stringify(ex));

        exCopy.numInputs = numInputs;
        var cmd = { property: "extra",
            _id: this.model.get('_id'),
            newValue: exCopy,
            oldValue: ex
        };

        this.model.trigger('request-set-node-prop', cmd);
    },

    addInput: function(){

    	var type = this.model.get('type');
      var ex = this.model.get('extra');
  	  var numInputs = ex.numInputs;

  	  if (numInputs === undefined) numInputs = 0;
  	  if (type.inputs.length === 26) return;

      this.setNumInputsProperty(numInputs + 1);

    },

    removeInput: function(){

    	var type = this.model.get('type');
      var ex = this.model.get('extra');
  	  var numInputs = ex.numInputs;

  	  if (numInputs === undefined) numInputs = 1;
  	  if (type.inputs.length === 0) return;

      this.setNumInputsProperty(numInputs - 1);

    }

  });

});