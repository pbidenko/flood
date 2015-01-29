define(['backbone', 'underscore', 'jquery', 'BaseNodeView'], function(Backbone, _, $, BaseNodeView) {

  return BaseNodeView.extend({

    template: _.template( $('#node-output-template').html() ),

    initialize: function(args) {
        BaseNodeView.prototype.initialize.apply(this, arguments);

        this.listenTo(this.model, 'change:extra', function () {

            var ex = this.model.get('extra');
            var name = ex != undefined ? ex.name : "";

            this.silentSyncUI(name);
            this.model.trigger('updateRunner');
        });
    },

    render: function(){

      BaseNodeView.prototype.render.apply(this, arguments);

      this.$el.addClass('output-node');

      var extra = this.model.get('extra');
      var name = extra.name != undefined ? extra.name : "";

      this.inputText = this.$el.find(".text-input");
      this.inputText.val( name );
      this.inputText.change(function (e) { this.nameChanged(e); e.stopPropagation(); }.bind(this));

      return this;

    },

    nameChanged: function(){
      this.inputSet();
      this.model.workspace.trigger('updateRunner');
    },

    silentSyncUI: function(name){
      this.silent = true;
      this.inputText.val( name );
      this.silent = false;
    },

    inputSet: function(e,ui) {
      if ( this.silent ) return;

      var newValue = { name: this.inputText.val() };
      this.model.workspace.setNodeProperty({property: 'extra', _id: this.model.get('_id'), newValue: newValue });      
    }

  });

});
