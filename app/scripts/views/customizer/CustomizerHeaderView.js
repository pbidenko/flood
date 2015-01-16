define(['backbone'], function(Backbone) {

  return Backbone.View.extend({

    el: '#customizer-header',

    template: _.template( $('#header-template').html() ),

    events: { 

      'click #save-stl' : 'saveStl',
      'click #save-dyn' : 'saveDyn',

      'click #save-file-button': 'toggeleSave'
    },

    initialize: function( args, atts ) {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {

      this.$el.html( this.template( this.model.toJSON() ) );
      return this;

    },

    toggeleSave: function(){
      if(!this.saveShown){
        $('#save-file-select-container').show();
        this.saveShown = true;
      }
      else {
        $('#save-file-select-container').hide();
        this.saveShown = false;
      }

    },

    saveStl: function() {

      this.model.exportSTL();
      this.toggeleSave();

    },

    saveDyn: function() {

      this.model.app.saveUploader.saveFile();
      this.toggeleSave();

    }

  });
});