define(['backbone'], function(Backbone) {

  return Backbone.Model.extend({

    defaults: {
      name: null,
      creationName: null,
      displayName: null,
      category: null,
      description: null,
      searchTags: [],
      inPort: [],
      outPort: [],
      defaultValue: [],
      isCustomNode: false,
      functionId: -1
    }, 
    
    initialize: function(attrs, options) {
      this.app = attrs.app;
      this.parent = options ? options.parent : null;
    }

  });

});


