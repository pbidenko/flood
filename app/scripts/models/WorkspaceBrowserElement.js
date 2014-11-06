define(['backbone'], function(Backbone) {

	return Backbone.Model.extend({

		idAttribute: "_id",

    defaults: {
      name: "Unnamed Workspace",
      guid: "00000000-0000-0000-0000-000000000000",
      isPublic: false,
      isCustomNode: false,
      lastSaved: Date.now()
    },

	  initialize: function(atts, vals) {

	  }

	});
});