define(['backbone', 'WorkspaceBrowserElements'], function(Backbone, WorkspaceBrowserElements) {

	return Backbone.Model.extend({

        defaults: {
            workspaces: null
        },

        initialize: function (attr) {
            this.app = attr.app;
            this.set('workspaces', new WorkspaceBrowserElements({app: this.app}));
        },

        fetch: function (atts, vals) {
            this.get('workspaces').fetch();
        },

        refresh: function () {
            this.get('workspaces').reset();
            this.get('workspaces').fetch();
        }
    });
});