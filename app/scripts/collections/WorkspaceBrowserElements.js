define(['backbone', 'WorkspaceBrowserElement'], function(Backbone, WorkspaceBrowserElement) {

  return Backbone.Collection.extend({

    model: WorkspaceBrowserElement,

    initialize: function (attr) {
          this.app = attr.app;
    },

    fetch: function() {

        this.app.context.fetchWorkspaceBrowserElements().done(function (elements) {

            // remove default element
            this.models.remove(0,0);
            elements.map(function (element) {
                var browserElement = new WorkspaceBrowserElement({
                    _id: element._id,
                    guid: element.guid,
                    name: element.name,
                    isPublic: element.isPublic,
                    lastSaved: element.lastSaved,
                    isModified: element.isModified,
                    maintainers: element.maintainers,
                    isCustomNode: element.isCustomNode
                });

                this.models.push(browserElement);

                this.trigger('add', browserElement);
            }.bind(this));

        }.bind(this));
    }

  });
});