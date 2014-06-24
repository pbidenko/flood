define(['backbone', 'SearchElement', 'FLOOD'], function(Backbone, SearchElement, FLOOD) {

	return Backbone.Collection.extend({

		model: SearchElement,

		initialize: function(atts) {
			this.app = atts.app;
		},

		fetch: function() {

            var that = this;

            return $.ajax({
                url: 'http://localhost:4321/api/nodemodels',
                type: 'GET',
                success: function(data){

                    that.models = data.map(function(item){
                        return new SearchElement({name: item.name, category: item.category, inPort: item.parameters,
                            outPort: item.returnKeys, app: that});
                    });

                },
                error: function(data) {

                    // the models array has a single empty element at start (not sure why)
                    that.models.length = 0;

                    for (var key in FLOOD.nodeTypes){
                        that.models.push( new SearchElement({name: key, app: that.app}) );
                    }
                }
            });

		}

	});
});

