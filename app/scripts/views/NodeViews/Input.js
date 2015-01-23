define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function(Backbone, _, $, BaseNodeView) {

  return BaseNodeView.extend({

    template: _.template( $('#node-input-template').html() ),

    initialize: function(args) {
      BaseNodeView.prototype.initialize.apply(this, arguments);

      this.model.on('change:extra', function() { 
        
        var ex = this.model.get('extra') ;
        var name = ex != undefined ? ex.name : "";
        
        this.silentSyncUI( name );
            this.model.trigger('update-node');

      }, this);

    },

    render: function(){

      BaseNodeView.prototype.render.apply(this, arguments);

      this.$el.addClass('input-node');

      var that = this;
      var extra = this.model.get('extra');
      var name = extra.name != undefined ? extra.name : "";

      this.inputText = this.$el.find(".text-input");
      this.inputText.val( name );
      this.inputText.change( function(e){ that.nameChanged.call(that, e); e.stopPropagation(); });

      return this;

    },

    nameChanged: function(){
      this.inputSet();
      this.model.trigger('updateRunner');
    },

    silentSyncUI: function(name){

      this.silent = true;
      this.inputText.val( name );
      this.silent = false;

    },

    inputSet: function(e,ui) {

        if (this.silent) return;

        var newValue = { name: this.inputText.val() };
        var cmd = { property: 'extra',
            _id: this.model.get('_id'),
            newValue: newValue
        };

        this.model.trigger('request-set-node-prop', cmd);
    }

  });

});
