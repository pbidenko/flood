define(['collections/FloodSearchElements', 'LibraryItemsListMessage'], function(FloodSearchElements, LibraryItemsListMessage) {

    return FloodSearchElements.extend({

        fetch: function() {
          this.app.socket.send(JSON.stringify(new LibraryItemsListMessage()));
        },

        fetchFromProto: function() {
          FloodSearchElements.prototype.fetch.call(this);
        }

    });
});

