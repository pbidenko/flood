define(['backbone', 'SearchElement', 'FLOOD'], function(Backbone, SearchElement, FLOOD) {

	return Backbone.Collection.extend({

		model: SearchElement,

		initialize: function(atts) {
			this.app = atts.app;
		},

		addCustomNode: function(customNode){

			var match = this.where({ creatingName: customNode.get('creatingName') });
			if (match) this.remove( match );

			this.add(customNode);
		},

		fetch: function() {

			for (var key in FLOOD.nodeTypes){
				this.models.push( new SearchElement({name: key, app: this.app}) );	
			}

		}

	});
});