define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({

    defaults: {
      name: null,
      creatingName: null,
      category: null,
      description: null,
      inPort: [],
      outPort: [],
      isCustomNode: false,
      functionId: -1
    }, 
    
    initialize: function(a, b) {
      this.app = a.app;
    }

  });

});


