define(['backbone', 'models/App', 'SocketConnection', 'SearchElement'], function(Backbone, App, SocketConnection, SearchElement) {

    return App.extend({

        initialize: function() {
          Backbone.on('modelsList-received:event', this.mapModels, this);

          this.socket = new SocketConnection();
          App.prototype.initialize.call(this);
        },

        fetch : function(options) {
          this.login.fetch();

          setTimeout(function () {
            //if models were not received from server we should load default models.
            if(!this.SearchElements.models.length){
              this.SearchElements.fetchFromProto();
            }

            Backbone.Model.prototype.fetch.call(this, options);

          }.bind(this), 3000);
        },

        mapModels: function(param) {
          this.SearchElements.models = param.models.map(function(item){
            return new SearchElement({name: item.name, creatingName: item.creatingName,
              category: item.category, description: item.description, inPort: item.parameters,
              outPort: item.returnKeys, app: this});
          });
        }

    });
});
