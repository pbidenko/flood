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

      if (!this.model.get('creatingName')){
            this.model.set('creatingName', this.model.get('name'));
            this.model.set('displayedName', this.model.get('name'));
        }
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );
      this.$el.tooltip({ title: this.model.get('description'), delay: {
          show: 300
      }});

      return this;
    },

    clickHandler: function(e) {
      this.searchView.trigger('add-element', this.model);
      e.preventDefault();
      return false;
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