define(['backbone', 'WorkspaceBrowserElement', 'Storage'], function(Backbone, WorkspaceBrowserElement, Storage) {

  return Backbone.Collection.extend({

    model: WorkspaceBrowserElement,

    fetch: function() {

      Storage.fetchWorkspaceBrowserElements().done(function(elements){

        elements.map(function(element){
          var browserElement = new WorkspaceBrowserElement({
            _id : element._id,
            name: element.name,
            isPublic: element.isPublic,
            lastSaved: element.lastSaved,
            isModified : element.isModified,
            maintainers : element.maintainers,
            isCustomNode : element.isCustomNode
          })

          this.models.push(browserElement);

          this.trigger('add', browserElement);
        }.bind(this));

      }.bind(this));
    }

  });

});