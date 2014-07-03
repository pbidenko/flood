define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({

    defaults: {
      name: null,
      category: null,
      inPort: [],
      outPort: []
    }, 
    
    initialize: function(a, b) {
      this.app = a.app;
    }

  });

});


