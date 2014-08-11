define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({

    defaults: {
      name: null,
      creatingName: null,
      category: null,
      description: null,
      inPort: [],
      outPort: []
      isCustomNode: false,
      functionId: -1
    }, 
    
    initialize: function(attrs, options) {
      this.app = attrs.app;
      this.parent = options ? options.parent : null;
    }

  });

});


