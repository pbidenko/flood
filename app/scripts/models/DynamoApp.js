define(['backbone', 'models/App', 'SocketConnection', 'SearchElement', 'Storage'], function(Backbone, App, SocketConnection, SearchElement, Storage) {

    return App.extend({

        initialize: function() {
          this.socket = new SocketConnection({app : this});
          this.on('libraryItemsList-received:event', this.mapLibraryItems, this);
          App.prototype.initialize.call(this);
        },

        fetch : function(options) {
          this.login.fetch();

          setTimeout(function () {
            //if models were not received from server we should load default models.
            if(!this.SearchElements.models.length){
              this.SearchElements.fetchFromProto();
            }

            Storage.fetchWorkspaces().done(function(workspaces) {
               var result = App.prototype.parse.call(this, workspaces);
               this.set(result, options);
            }.bind(this)).fail(function(workspaces) {
              options.error(workspaces);
            });

          }.bind(this), 3000);
        },

        mapLibraryItems: function(param) {
          this.SearchElements.models = param.libraryItems.map(function(item){
            return new SearchElement({name: item.name, creationName: item.creationName,
              displayName: item.displayName, category: item.category,
              description: item.description, inPort: item.parameters,
              outPort: item.returnKeys, app: this});
          });
        }

    });
});
