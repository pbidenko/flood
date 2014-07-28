define(['backbone'], function(Backbone) {

  var SearchElementView = Backbone.View.extend({

    tagName: 'li',
    className: 'search-element',

    template: _.template( $('#search-element-template').html() ),

    events: {
      'click': 'clickHandler'
    },

    initialize: function(attrs, options){      
      this.searchView = options.searchView;      
      this.parent = options.parent;
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );

      return this;
    },

    clickHandler: function(e) {
      this.searchView.trigger('add-element', this.model);
    },

    toggle: function(isVisible){
      iterateAncestors.call(this, this.parent, function(ancestor) {
          ancestor.toggle(null, isVisible);
      });      
    },

    hide: function(){
      iterateAncestors.call(this, this.parent, function(ancestor) {
          ancestor.$el.hide();
      });      

      this.$el.hide();
    },

    showWithAncestors: function(){        
      iterateAncestors.call(this, this.parent, function(ancestor) {
          ancestor.show();
      });

      this.$el.show();
    }
  }),

  iterateAncestors = function(parent, func){
      while(parent){
        func.call(this, parent);
        parent = parent.parent;
      }
  };

  return SearchElementView;
});