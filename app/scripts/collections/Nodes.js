define(['backbone', 'Node'], function(Backbone, Node) {

	return Backbone.Collection.extend({

		model: Node,

		initialDragPositions: [],

		toJSON: function(){

			return this.models.map(function(x){
				return x.serialize();
			});

		},

		selectAll: function() {
			this.where({selected: false}).forEach( function(e){ e.set({selected: true}) } );
		},
		
		deselectAll: function() {
			this.where({selected: true}).forEach( function(e){ 
				e.set('selected', false);
			});
		},

		moveSelected: function(offset, masterEle) {
			var count = 0;
			this.where({selected: true}).forEach( function(e, i){ 
				if (e === masterEle) return;
				var initialPos = this.initialDragPositions[count++];
				e.set('position', [initialPos[0] + offset[0], initialPos[1] + offset[1]]);
			}.bind(this));
		},

		startDragging: function(masterEle){
			this.initialDragPositions = [];
			this.where({selected: true}).forEach( function(e){ 
				if (e === masterEle) return;
				this.initialDragPositions.push(e.get('position'));
			}.bind(this));
		}

	});

});

