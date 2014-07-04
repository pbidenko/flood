define(['collections/FloodSearchElements', 'SearchElement', 'FLOOD'], function(FloodSearchElements, SearchElement, FLOOD) {

    return FloodSearchElements.extend({

        fetch: function() {

            var that = this;

            return $.ajax({
                url: 'http://localhost:4321/api/nodemodels',
                type: 'GET',
                success: function(data){

                    that.models = data.map(function(item){
                        return new SearchElement({name: item.name, creatingName: item.creatingName,
                            category: item.category, description: item.description, inPort: item.parameters,
                            outPort: item.returnKeys, app: that});
                    });

                },
                error: function(data) {
                    FloodSearchElements.prototype.fetch.call(that);
                }
            });

        }

    });
});

