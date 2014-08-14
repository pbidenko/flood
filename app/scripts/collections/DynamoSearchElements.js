define(['collections/FloodSearchElements', 'ModelsListMessage'], function(FloodSearchElements, ModelsListMessage) {

    return FloodSearchElements.extend({

        fetch: function() {

            var that = this;

            return $.ajax({
                url: 'http://localhost:4321/api/nodemodels',
                type: 'GET',
                success: function(data){

                    that.models = data.map(function(item){
                        return new SearchElement({name: item.name, creatingName: item.creatingName,
                            category: item.category, inPort: item.parameters,
                            outPort: item.returnKeys, app: that});
                    });

                },
                error: function(data) {
                    FloodSearchElements.prototype.fetch.call(that);
                }
            });

        },

        fetchFromProto: function() {
          FloodSearchElements.prototype.fetch.call(this);
        }

    });
});

