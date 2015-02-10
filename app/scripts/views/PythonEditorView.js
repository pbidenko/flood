define(['backbone', 'PrismPython'], function(Backbone) {

  return Backbone.View.extend({

    el: '#pythonEditor',

    events: { 
        'click #save-python' : 'clickSave',
        'click #exit-python' : 'clickExit'
    },

    template: _.template( $('#python-template').html() ),

    initialize: function(args) {
        this.model = args.model;
    },

    render: function(model) {

      this.$el.html( this.template({
        script: this.model.get('extra').script
      }));

      this.script = this.$el.find('#python-script');

      Prism.highlightElement(this.script[0]);

      return this;
    },

    clickSave: function(e){
      var ex = this.model.get('extra');
      var exCopy = JSON.parse(JSON.stringify(ex));

      exCopy.script = this.script[0].innerText;

      var cmd = { property: 'extra', _id: this.model.get('_id'), newValue: exCopy, oldValue: ex };
      this.model.trigger('request-set-node-prop', cmd);

      this.$el.fadeOut();
    },

    clickExit: function(e){
      this.$el.fadeOut();
    }

  });
});