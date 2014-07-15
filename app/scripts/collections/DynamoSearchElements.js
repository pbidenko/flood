define(['collections/FloodSearchElements', 'ModelsListMessage'], function(FloodSearchElements, ModelsListMessage) {

    return FloodSearchElements.extend({

        fetch: function() {
          this.app.socket.send(JSON.stringify(new ModelsListMessage()));
        },

        fetchFromProto: function() {
          FloodSearchElements.prototype.fetch.call(this);
        }

    });
});

